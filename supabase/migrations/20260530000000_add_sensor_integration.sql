-- Add hardware_id to smart_netbins for ESP32 MQTT matching
ALTER TABLE public.smart_netbins
  ADD COLUMN hardware_id TEXT UNIQUE;

-- Deposit intents: user declares intent before physical deposit
CREATE TABLE public.deposit_intents (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES public.profiles(id),
  bin_id              UUID NOT NULL REFERENCES public.smart_netbins(id),
  category_id         UUID NOT NULL REFERENCES public.waste_categories(id),
  photo_url           TEXT,
  estimated_weight_kg NUMERIC(8,3),
  max_expected_weight_kg NUMERIC(8,3),
  status              TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'matched', 'expired', 'cancelled')),
  matched_transaction_id UUID REFERENCES public.transactions(id),
  created_at          TIMESTAMPTZ DEFAULT now(),
  matched_at          TIMESTAMPTZ,
  expired_at          TIMESTAMPTZ
);

-- Sensor data log from ESP32 via MQTT
CREATE TABLE public.bin_sensor_logs (
  id                BIGSERIAL PRIMARY KEY,
  bin_id            UUID NOT NULL REFERENCES public.smart_netbins(id),
  weight_kg         NUMERIC(8,3) NOT NULL,
  capacity_percent  NUMERIC(5,2) NOT NULL,
  distance_cm       NUMERIC(5,2),
  status            TEXT,
  raw_payload       JSONB,
  received_at       TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_deposit_intents_status ON public.deposit_intents(status, bin_id);
CREATE INDEX idx_deposit_intents_user ON public.deposit_intents(user_id);
CREATE INDEX idx_sensor_logs_bin_time ON public.bin_sensor_logs(bin_id, received_at DESC);

-- RLS for new tables
ALTER TABLE public.deposit_intents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bin_sensor_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own intents"
  ON public.deposit_intents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own intents"
  ON public.deposit_intents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Only service_role can read sensor logs (MQTT subscriber uses service key)
CREATE POLICY "Service role can manage sensor logs"
  ON public.bin_sensor_logs FOR ALL
  USING (true)
  WITH CHECK (true);

-- Function: match deposit intent with sensor data
CREATE OR REPLACE FUNCTION public.match_deposit_intent(
  p_bin_hardware_id TEXT,
  p_weight_kg NUMERIC(8,3),
  p_delta_threshold NUMERIC DEFAULT 0.1
) RETURNS JSONB AS $$
DECLARE
  v_bin_id UUID;
  v_intent RECORD;
  v_category RECORD;
  v_points_delta INTEGER;
  v_tx_id UUID;
  v_balance_before INTEGER;
  v_balance_after INTEGER;
BEGIN
  -- Resolve hardware_id to bin UUID
  SELECT id INTO v_bin_id
  FROM public.smart_netbins
  WHERE hardware_id = p_bin_hardware_id;

  IF v_bin_id IS NULL THEN
    RETURN jsonb_build_object('matched', false, 'reason', 'bin not found: ' || p_bin_hardware_id);
  END IF;

  -- Find oldest pending intent for this bin within 60s window
  SELECT id, user_id, category_id, estimated_weight_kg, max_expected_weight_kg
  INTO v_intent
  FROM public.deposit_intents
  WHERE bin_id = v_bin_id
    AND status = 'pending'
    AND created_at >= NOW() - INTERVAL '60 seconds'
  ORDER BY created_at ASC
  LIMIT 1;

  IF v_intent.id IS NULL THEN
    RETURN jsonb_build_object('matched', false, 'reason', 'no pending intent for bin');
  END IF;

  -- Weight sanity check: delta must be >= threshold and <= max_expected
  IF p_weight_kg < p_delta_threshold THEN
    RETURN jsonb_build_object('matched', false, 'reason', 'weight delta too small: ' || p_weight_kg);
  END IF;

  IF v_intent.max_expected_weight_kg IS NOT NULL AND p_weight_kg > v_intent.max_expected_weight_kg THEN
    RETURN jsonb_build_object('matched', false, 'reason', 'weight exceeds expected: ' || p_weight_kg || ' > ' || v_intent.max_expected_weight_kg);
  END IF;

  -- Get category for points calculation
  SELECT points_per_kg INTO v_category
  FROM public.waste_categories
  WHERE id = v_intent.category_id;

  v_points_delta := ROUND(p_weight_kg * COALESCE(v_category.points_per_kg, 10));

  -- Insert verified transaction
  INSERT INTO public.transactions (
    user_id, bin_id, category_id, photo_url,
    weight_kg, points_delta, type, status, verification_method
  ) VALUES (
    v_intent.user_id, v_bin_id, v_intent.category_id, v_intent.photo_url,
    p_weight_kg, v_points_delta, 'deposit', 'verified', 'sensor_crosscheck'
  ) RETURNING id INTO v_tx_id;

  -- Update profile points
  SELECT eco_points INTO v_balance_before
  FROM public.profiles
  WHERE id = v_intent.user_id;

  UPDATE public.profiles
  SET eco_points = eco_points + v_points_delta,
      total_waste_kg = total_waste_kg + p_weight_kg,
      level = GREATEST(1, FLOOR(SQRT((eco_points + v_points_delta)::numeric / 100)) + 1)::integer,
      updated_at = now()
  WHERE id = v_intent.user_id
  RETURNING eco_points INTO v_balance_after;

  -- Update deposit intent to matched
  UPDATE public.deposit_intents
  SET status = 'matched',
      matched_at = now(),
      matched_transaction_id = v_tx_id
  WHERE id = v_intent.id;

  -- Create notification for user
  INSERT INTO public.notifications (user_id, title, body, type, data)
  VALUES (
    v_intent.user_id,
    'Deposit Terverifikasi!',
    '+' || v_points_delta || ' Eco-Points. Berat: ' || p_weight_kg || ' kg',
    'waste_processed',
    jsonb_build_object(
      'transaction_id', v_tx_id,
      'points_delta', v_points_delta,
      'weight_kg', p_weight_kg
    )
  );

  RETURN jsonb_build_object(
    'matched', true,
    'intent_id', v_intent.id,
    'transaction_id', v_tx_id,
    'points_delta', v_points_delta,
    'balance_before', v_balance_before,
    'balance_after', v_balance_after
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: expire stale intents (call via cron)
CREATE OR REPLACE FUNCTION public.expire_stale_intents()
RETURNS INTEGER AS $$
DECLARE
  expired_count INTEGER;
BEGIN
  WITH expired AS (
    UPDATE public.deposit_intents
    SET status = 'expired', expired_at = now()
    WHERE status = 'pending'
      AND created_at < NOW() - INTERVAL '120 seconds'
    RETURNING id
  )
  SELECT COUNT(*) INTO expired_count FROM expired;
  RETURN expired_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
