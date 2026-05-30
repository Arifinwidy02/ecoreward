INSERT INTO public.waste_categories (name, points_per_kg, estimated_avg_weight_kg, icon_name) VALUES
  ('organic',   10, 0.5,  'leaf'),
  ('plastic',   15, 0.05, 'bottle'),
  ('metal',     20, 0.1,  'can'),
  ('glass',     12, 0.3,  'wine-glass'),
  ('paper',      8, 0.1,  'newspaper'),
  ('inorganic', 12, 0.2,  'trash'),
  ('hazardous', 25, 0.15, 'radiation');

INSERT INTO public.achievements (name, description, icon_name, criteria) VALUES
  ('Pemula',       '5x deposit pertama',            'seedling',     '{"type":"deposit_count","threshold":5}'),
  ('Rajin',        '7 hari streak berturut-turut',   'fire',         '{"type":"streak_days","threshold":7}'),
  ('Eco Warrior',  'Total 100 kg sampah',            'shield',       '{"type":"total_kg","threshold":100}'),
  ('Pemilah',      'Deposit semua 7 kategori',       'layer-group',  '{"type":"category_count","threshold":7}'),
  ('Sang Raja',    'Mencapai level 20',              'crown',        '{"type":"level","threshold":20}'),
  ('Sultan Sampah','Total 1000 kg sampah',           'gem',          '{"type":"total_kg","threshold":1000}'),
  ('Penjaga Bumi', '30 hari streak',                 'earth',        '{"type":"streak_days","threshold":30}');

INSERT INTO public.smart_netbins (id, hardware_id, name, latitude, longitude, capacity_percent, status, address) VALUES
  ('11111111-1111-1111-1111-111111111111', 'EcoReward01', 'Netbin A - Balai Desa',       -6.91234, 107.61234, 30, 'available',   'Jl. Sarimukti No. 1, Desa Sarimukti'),
  ('22222222-2222-2222-2222-222222222222', 'EcoReward02', 'Netbin B - Pasar Sarimukti',  -6.91345, 107.61345, 85, 'almost_full', 'Pasar Tradisional Sarimukti'),
  ('33333333-3333-3333-3333-333333333333', 'EcoReward03', 'Netbin C - Pos RT 03',        -6.91456, 107.61111, 45, 'available',   'Pos RT 03, Kampung Cipanas'),
  ('44444444-4444-4444-4444-444444444444', 'EcoReward04', 'Netbin D - Dekat TPA',        -6.91000, 107.61500, 100,'full',        'Gerbang TPA Sarimukti'),
  ('55555555-5555-5555-5555-555555555555', 'EcoReward05', 'Netbin E - Sekolah Dasar',    -6.91500, 107.61400, 10, 'available',   'SDN Sarimukti 1')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.rewards (name, description, points_cost, type, stock, image_url) VALUES
  ('Saldo OVO Rp 10.000',  'Tukar poin dengan saldo OVO',           500,  'money',      -1, NULL),
  ('Saldo GoPay Rp 25.000','Tukar poin dengan saldo GoPay',        1200,  'money',      -1, NULL),
  ('Voucher Belanja 50K',  'Voucher belanja di toko mitra',        2000,  'voucher',    50, NULL),
  ('Paket Sembako Hemat',  'Beras 2kg + Gula 1kg + Minyak 1L',    3000,  'groceries',  20, NULL),
  ('Benih Sayuran',        'Paket benih sayuran organik',           300,  'seed',      100, NULL),
  ('Pupuk Organik 5kg',    'Pupuk organik hasil olahan sampah',     500,  'fertilizer', 100, NULL);
