-- Supabase Schema for Pegasus DreamScapes Marketplace
-- Run this SQL in your Supabase SQL Editor (Database > SQL Editor)

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- USER PROFILES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  primary_role TEXT NOT NULL CHECK (primary_role IN (
    'admin', 
    'pegasus_wholesaler', 
    'wholesaler', 
    'pegasus_dreamscaper', 
    'dreamscaper', 
    'investor', 
    'buyer_retail', 
    'buyer_investment'
  )),
  display_name TEXT NOT NULL,
  company_name TEXT,
  location TEXT,
  avatar_url TEXT,
  bio TEXT,
  is_pegasus_badged BOOLEAN DEFAULT FALSE,
  pegasus_role_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- =====================================================
-- USER BADGES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_type TEXT NOT NULL,
  label TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- USER REPUTATION TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS user_reputation (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  trust_score INTEGER DEFAULT 50,
  rating DECIMAL(3,2) DEFAULT 0,
  deals_closed_count INTEGER DEFAULT 0,
  on_time_closings_count INTEGER DEFAULT 0,
  cancellations_count INTEGER DEFAULT 0,
  last_updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- =====================================================
-- SELLER LEADS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS seller_leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  address TEXT NOT NULL,
  property_type TEXT NOT NULL,
  reason TEXT NOT NULL,
  best_time TEXT,
  notes TEXT,
  source TEXT DEFAULT 'Website - Seller',
  status TEXT DEFAULT 'New',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- WHOLESALE DEALS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS wholesale_deals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wholesaler_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  address TEXT NOT NULL,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  property_type TEXT,
  arv DECIMAL(12,2) NOT NULL,
  asking_price DECIMAL(12,2) NOT NULL,
  repair_estimate DECIMAL(12,2) NOT NULL,
  assignment_fee DECIMAL(12,2) NOT NULL,
  photos TEXT[],
  occupancy TEXT,
  close_timeline TEXT,
  notes TEXT,
  status TEXT DEFAULT 'Under Review' CHECK (status IN (
    'Under Review', 
    'Approved', 
    'Listed', 
    'Under Contract', 
    'Sold', 
    'Withdrawn'
  )),
  is_public BOOLEAN DEFAULT FALSE,
  raising_capital BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- SAVED ITEMS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS saved_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL CHECK (item_type IN (
    'wholesale_deal', 
    'capital_project', 
    'listing', 
    'article'
  )),
  item_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, item_type, item_id)
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(primary_role);
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_reputation_user_id ON user_reputation(user_id);
CREATE INDEX IF NOT EXISTS idx_seller_leads_status ON seller_leads(status);
CREATE INDEX IF NOT EXISTS idx_wholesale_deals_wholesaler ON wholesale_deals(wholesaler_id);
CREATE INDEX IF NOT EXISTS idx_wholesale_deals_status ON wholesale_deals(status);
CREATE INDEX IF NOT EXISTS idx_wholesale_deals_public ON wholesale_deals(is_public);
CREATE INDEX IF NOT EXISTS idx_saved_items_user ON saved_items(user_id);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_reputation ENABLE ROW LEVEL SECURITY;
ALTER TABLE seller_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE wholesale_deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_items ENABLE ROW LEVEL SECURITY;

-- User Profiles: Users can read all profiles, update only their own
CREATE POLICY "Profiles are viewable by everyone" 
  ON user_profiles FOR SELECT 
  USING (true);

CREATE POLICY "Users can update own profile" 
  ON user_profiles FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert profiles" 
  ON user_profiles FOR INSERT 
  WITH CHECK (true);

-- User Badges: Viewable by everyone
CREATE POLICY "Badges are viewable by everyone" 
  ON user_badges FOR SELECT 
  USING (true);

CREATE POLICY "Service role can manage badges" 
  ON user_badges FOR ALL 
  USING (true);

-- User Reputation: Viewable by everyone
CREATE POLICY "Reputation is viewable by everyone" 
  ON user_reputation FOR SELECT 
  USING (true);

CREATE POLICY "Service role can manage reputation" 
  ON user_reputation FOR ALL 
  USING (true);

-- Seller Leads: Only admins can view, anyone can submit
CREATE POLICY "Anyone can submit seller lead" 
  ON seller_leads FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Service role can manage seller leads" 
  ON seller_leads FOR ALL 
  USING (true);

-- Wholesale Deals: Public deals viewable by all, own deals editable
CREATE POLICY "Public deals are viewable" 
  ON wholesale_deals FOR SELECT 
  USING (is_public = true OR auth.uid() = wholesaler_id);

CREATE POLICY "Wholesalers can insert own deals" 
  ON wholesale_deals FOR INSERT 
  WITH CHECK (auth.uid() = wholesaler_id);

CREATE POLICY "Wholesalers can update own deals" 
  ON wholesale_deals FOR UPDATE 
  USING (auth.uid() = wholesaler_id);

CREATE POLICY "Service role can manage all deals" 
  ON wholesale_deals FOR ALL 
  USING (true);

-- Saved Items: Users can only see and manage their own
CREATE POLICY "Users can view own saved items" 
  ON saved_items FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own saved items" 
  ON saved_items FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved items" 
  ON saved_items FOR DELETE 
  USING (auth.uid() = user_id);

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wholesale_deals_updated_at
    BEFORE UPDATE ON wholesale_deals
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_reputation_updated_at
    BEFORE UPDATE ON user_reputation
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- CONFIRMATION MESSAGE
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE 'Pegasus DreamScapes Marketplace schema created successfully!';
  RAISE NOTICE 'Tables created: user_profiles, user_badges, user_reputation, seller_leads, wholesale_deals, saved_items';
END $$;
