-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles (extends auth.users)
CREATE TABLE public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name     TEXT,
  avatar_url    TEXT,
  eco_points    INTEGER DEFAULT 0,
  total_waste_kg NUMERIC(10,2) DEFAULT 0,
  level         INTEGER DEFAULT 1,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.waste_categories (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name           TEXT NOT NULL UNIQUE,
  points_per_kg  INTEGER NOT NULL,
  estimated_avg_weight_kg NUMERIC(5,2),
  icon_name      TEXT,
  created_at     TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.smart_netbins (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name             TEXT NOT NULL,
  latitude         NUMERIC(10,7) NOT NULL,
  longitude        NUMERIC(10,7) NOT NULL,
  capacity_percent INTEGER DEFAULT 0 CHECK (capacity_percent >= 0 AND capacity_percent <= 100),
  status           TEXT DEFAULT 'available' CHECK (status IN ('available', 'almost_full', 'full', 'maintenance')),
  address          TEXT,
  last_updated     TIMESTAMPTZ DEFAULT now(),
  created_at       TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.rewards (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  description   TEXT,
  points_cost   INTEGER NOT NULL,
  type          TEXT NOT NULL CHECK (type IN ('money', 'voucher', 'groceries', 'seed', 'fertilizer', 'other')),
  stock         INTEGER DEFAULT -1,
  image_url     TEXT,
  is_active     BOOLEAN DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.transactions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES public.profiles(id),
  bin_id        UUID REFERENCES public.smart_netbins(id),
  category_id   UUID REFERENCES public.waste_categories(id),
  photo_url     TEXT,
  weight_kg     NUMERIC(8,3),
  points_delta  INTEGER NOT NULL,
  type          TEXT NOT NULL CHECK (type IN ('deposit', 'redemption')),
  reward_id     UUID REFERENCES public.rewards(id),
  status        TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
  verification_method TEXT DEFAULT 'photo_only' CHECK (verification_method IN ('photo_only', 'sensor_crosscheck')),
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.achievements (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,
  description  TEXT,
  icon_name    TEXT,
  criteria     JSONB NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.user_achievements (
  user_id        UUID NOT NULL REFERENCES public.profiles(id),
  achievement_id UUID NOT NULL REFERENCES public.achievements(id),
  unlocked_at    TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, achievement_id)
);

CREATE TABLE public.notifications (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES public.profiles(id),
  title      TEXT NOT NULL,
  body       TEXT,
  type       TEXT CHECK (type IN ('bin_full', 'waste_processed', 'reward_received', 'achievement_unlocked', 'system')),
  read       BOOLEAN DEFAULT false,
  data       JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.user_streaks (
  user_id          UUID PRIMARY KEY REFERENCES public.profiles(id),
  current_streak   INTEGER DEFAULT 0,
  longest_streak   INTEGER DEFAULT 0,
  last_deposit_date DATE,
  updated_at       TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX idx_transactions_type ON public.transactions(type);
CREATE INDEX idx_transactions_created_at ON public.transactions(created_at DESC);
CREATE INDEX idx_smart_netbins_status ON public.smart_netbins(status);
CREATE INDEX idx_notifications_user_read ON public.notifications(user_id, read);
CREATE INDEX idx_user_achievements_user ON public.user_achievements(user_id);

-- RLS Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.smart_netbins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Netbins are viewable by everyone" ON public.smart_netbins FOR SELECT USING (true);

CREATE POLICY "Users can view own transactions" ON public.transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own deposit transactions" ON public.transactions FOR INSERT WITH CHECK (auth.uid() = user_id AND type = 'deposit');

CREATE POLICY "Rewards are viewable by everyone" ON public.rewards FOR SELECT USING (true);

CREATE POLICY "Achievements are viewable by everyone" ON public.achievements FOR SELECT USING (true);
CREATE POLICY "User achievements viewable by owner" ON public.user_achievements FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own streak" ON public.user_streaks FOR SELECT USING (auth.uid() = user_id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  INSERT INTO public.user_streaks (user_id) VALUES (new.id);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
