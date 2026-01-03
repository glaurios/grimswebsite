-- GRIMS CODM Website Database Setup
-- Run this script in Supabase SQL Editor

-- ============================================
-- 1. PLAYERS TABLE (Leaderboard)
-- ============================================
CREATE TABLE IF NOT EXISTS players (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  player_name TEXT NOT NULL UNIQUE,
  total_points INTEGER DEFAULT 0 NOT NULL,
  rank INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_players_points ON players(total_points DESC);
CREATE INDEX IF NOT EXISTS idx_players_rank ON players(rank);

-- ============================================
-- 2. TOURNAMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS tournaments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  mode TEXT NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'live', 'completed')),
  results_entered BOOLEAN DEFAULT FALSE,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_tournaments_status ON tournaments(status);
CREATE INDEX IF NOT EXISTS idx_tournaments_start ON tournaments(start_time DESC);

-- ============================================
-- 3. TOURNAMENT RESULTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS tournament_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
  player_name TEXT NOT NULL,
  points INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_results_tournament ON tournament_results(tournament_id);
CREATE INDEX IF NOT EXISTS idx_results_player ON tournament_results(player_name);

-- ============================================
-- 4. CONTACTS TABLE (Contact Form)
-- ============================================
CREATE TABLE IF NOT EXISTS contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_contacts_created ON contacts(created_at DESC);

-- ============================================
-- 5. INSERT INITIAL DATA
-- ============================================

-- Insert initial players
INSERT INTO players (player_name, total_points, rank, created_at, updated_at) VALUES
  ('AP*Gilgal', 1000, 1, NOW(), NOW()),
  ('O_G appau', 850, 2, NOW(), NOW()),
  ('Dollar Amk', 750, 3, NOW(), NOW()),
  ('AP_Rolin', 650, 4, NOW(), NOW()),
  ('AP_Arphaxad', 550, 5, NOW(), NOW())
ON CONFLICT (player_name) DO NOTHING;

-- Insert initial tournament
INSERT INTO tournaments (name, mode, start_time, status, results_entered, image_url) VALUES
  ('CAPTURE THE BRIEFCASE – CALL OF DUTY: MOBILE', 'Capture the Briefcase', '2025-01-02 20:30:00+00', 'upcoming', FALSE, 'https://www.callofduty.com/content/dam/atvi/callofduty/cod-touchui/blog/hero/mobile/CODM-S1-2025-TOUT.jpg')
ON CONFLICT DO NOTHING;

-- ============================================
-- 6. ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 7. CREATE POLICIES FOR PUBLIC READ ACCESS
-- ============================================

-- Players: Public can read
CREATE POLICY "Public can view players"
  ON players FOR SELECT
  TO anon, authenticated
  USING (true);

-- Tournaments: Public can read
CREATE POLICY "Public can view tournaments"
  ON tournaments FOR SELECT
  TO anon, authenticated
  USING (true);

-- Tournament Results: Public can read
CREATE POLICY "Public can view results"
  ON tournament_results FOR SELECT
  TO anon, authenticated
  USING (true);

-- Contacts: Anyone can insert
CREATE POLICY "Anyone can submit contact form"
  ON contacts FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- ============================================
-- 8. ADMIN POLICIES (Authenticated Users Only)
-- ============================================

-- Players: Authenticated users can update
CREATE POLICY "Authenticated users can update players"
  ON players FOR UPDATE
  TO authenticated
  USING (true);

-- Players: Authenticated users can insert
CREATE POLICY "Authenticated users can insert players"
  ON players FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Tournaments: Authenticated users can insert/update
CREATE POLICY "Authenticated users can manage tournaments"
  ON tournaments FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Tournament Results: Authenticated users can insert
CREATE POLICY "Authenticated users can insert results"
  ON tournament_results FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ============================================
-- SETUP COMPLETE!
-- ============================================

-- Verify tables created
SELECT 'Tables created successfully!' AS status;
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('players', 'tournaments', 'tournament_results', 'contacts');

-- ============================================
-- IMPORTANT: STORAGE BUCKET SETUP
-- ============================================
-- After running this script, you need to create a storage bucket manually:
-- 1. Go to Storage in Supabase sidebar
-- 2. Click "Create bucket"
-- 3. Name: "tournament-images"
-- 4. Public bucket: YES (toggle ON)
-- 5. Click "Create bucket"
-- 6. Click on the bucket → "Policies" tab
-- 7. Click "New Policy" → "For full customization"
-- 8. Policy name: "Public Access"
-- 9. Allowed operations: SELECT, INSERT, UPDATE, DELETE (check all)
-- 10. Target roles: public, authenticated
-- 11. Click "Review" then "Save policy"
--
-- This allows the admin to upload images and everyone to view them.
