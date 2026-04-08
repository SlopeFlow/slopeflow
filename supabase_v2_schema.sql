-- ============================================================
-- SlopeFlow v2 Schema — XP / Chores / Escrow / Payouts
-- Run in Supabase SQL Editor
-- ============================================================

-- ── MASTER CHORE LIST (app-managed, read-only for users) ────
CREATE TABLE IF NOT EXISTS chore_templates (
  id          SERIAL PRIMARY KEY,
  category    TEXT NOT NULL,          -- 'daily' | 'weekly' | 'school' | 'extra'
  name        TEXT NOT NULL,
  suggested_xp INTEGER NOT NULL,
  is_custom   BOOLEAN DEFAULT FALSE
);

-- Seed master list
INSERT INTO chore_templates (category, name, suggested_xp) VALUES
  -- Daily
  ('daily', 'Make bed', 5),
  ('daily', 'Clean room', 10),
  ('daily', 'Do dishes / load dishwasher', 10),
  ('daily', 'Take out trash', 8),
  ('daily', 'Feed pets', 5),
  ('daily', 'Pack school bag / prep for next day', 5),
  -- Weekly
  ('weekly', 'Vacuum / sweep floors', 15),
  ('weekly', 'Clean bathroom', 20),
  ('weekly', 'Mow lawn / yard work', 30),
  ('weekly', 'Take out recycling', 10),
  ('weekly', 'Do laundry (wash + fold)', 20),
  ('weekly', 'Wipe down kitchen counters', 10),
  -- School / Responsibility
  ('school', 'Complete homework before screen time', 15),
  ('school', 'No missing assignments (weekly check)', 25),
  ('school', 'On time all week (no tardies)', 20),
  ('school', 'Read for 20 minutes', 10),
  -- Extra Credit
  ('extra', 'Deep clean bedroom', 30),
  ('extra', 'Wash the car', 25),
  ('extra', 'Grocery run / errands', 20),
  ('extra', 'Cook a meal for the family', 35),
  ('extra', 'Shovel snow / rake leaves', 30),
  ('extra', 'Help with a sibling', 15);

-- ── FAMILY LINKS (parent ↔ kid) ─────────────────────────────
CREATE TABLE IF NOT EXISTS family_links (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_id   UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  kid_id      UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(parent_id, kid_id)
);

-- ── ASSIGNED CHORES (parent assigns to kid from master list) ─
CREATE TABLE IF NOT EXISTS assigned_chores (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_id       UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  kid_id          UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  template_id     INTEGER REFERENCES chore_templates(id),
  custom_name     TEXT,                        -- if custom chore
  xp_value        INTEGER NOT NULL,            -- parent-adjusted XP
  frequency       TEXT DEFAULT 'weekly',       -- 'daily' | 'weekly' | 'once'
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── CHORE COMPLETIONS (kid marks done, parent approves) ──────
CREATE TABLE IF NOT EXISTS chore_completions (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chore_id        UUID REFERENCES assigned_chores(id) ON DELETE CASCADE,
  kid_id          UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_id       UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status          TEXT DEFAULT 'pending',      -- 'pending' | 'approved' | 'rejected'
  xp_awarded      INTEGER,                     -- set on approval
  completed_at    TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at     TIMESTAMPTZ
);

-- ── ESCROW ACCOUNTS (parent funds, kid earns release) ────────
CREATE TABLE IF NOT EXISTS escrow_accounts (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_id       UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  kid_id          UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  balance_cents   INTEGER DEFAULT 0,           -- total funded (cents)
  earned_cents    INTEGER DEFAULT 0,           -- amount kid has earned
  xp_threshold    INTEGER DEFAULT 100,         -- XP needed to unlock payout
  payout_method   TEXT DEFAULT 'venmo',
  venmo_handle    TEXT,                        -- kid's Venmo @handle
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(parent_id, kid_id)
);

-- ── PAYOUTS (approved Venmo releases) ────────────────────────
CREATE TABLE IF NOT EXISTS payouts (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  escrow_id       UUID REFERENCES escrow_accounts(id) ON DELETE CASCADE,
  parent_id       UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  kid_id          UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  amount_cents    INTEGER NOT NULL,
  xp_at_payout    INTEGER NOT NULL,
  status          TEXT DEFAULT 'pending',      -- 'pending' | 'sent' | 'failed'
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  sent_at         TIMESTAMPTZ
);

-- ── RLS POLICIES ─────────────────────────────────────────────
ALTER TABLE chore_templates   ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_links      ENABLE ROW LEVEL SECURITY;
ALTER TABLE assigned_chores   ENABLE ROW LEVEL SECURITY;
ALTER TABLE chore_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE escrow_accounts   ENABLE ROW LEVEL SECURITY;
ALTER TABLE payouts           ENABLE ROW LEVEL SECURITY;

-- chore_templates: anyone can read
CREATE POLICY "Anyone can read chore templates"
  ON chore_templates FOR SELECT USING (true);

-- family_links: only members of the link
CREATE POLICY "Family members see their link"
  ON family_links FOR ALL
  USING (auth.uid() = parent_id OR auth.uid() = kid_id);

-- assigned_chores: parent or kid in the link
CREATE POLICY "Parent or kid sees assigned chores"
  ON assigned_chores FOR ALL
  USING (auth.uid() = parent_id OR auth.uid() = kid_id);

-- chore_completions: parent or kid
CREATE POLICY "Parent or kid sees completions"
  ON chore_completions FOR ALL
  USING (auth.uid() = parent_id OR auth.uid() = kid_id);

-- escrow: parent or kid
CREATE POLICY "Parent or kid sees escrow"
  ON escrow_accounts FOR ALL
  USING (auth.uid() = parent_id OR auth.uid() = kid_id);

-- payouts: parent or kid
CREATE POLICY "Parent or kid sees payouts"
  ON payouts FOR ALL
  USING (auth.uid() = parent_id OR auth.uid() = kid_id);
