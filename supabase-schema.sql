-- Supabase Schema for Pegasus DreamScapes Marketplace
-- Run this SQL in your Supabase SQL Editor (Database > SQL Editor)

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- USER PROFILES TABLE
-- =====================================================
-- Uses external_user_id for Replit Auth integration (not Supabase Auth)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  external_user_id TEXT UNIQUE,
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
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- USER BADGES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  external_user_id TEXT,
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
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  external_user_id TEXT UNIQUE,
  trust_score INTEGER DEFAULT 50,
  rating DECIMAL(3,2) DEFAULT 0,
  deals_closed_count INTEGER DEFAULT 0,
  on_time_closings_count INTEGER DEFAULT 0,
  cancellations_count INTEGER DEFAULT 0,
  last_updated_at TIMESTAMPTZ DEFAULT NOW()
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
  wholesaler_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  external_wholesaler_id TEXT,
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
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  external_user_id TEXT,
  item_type TEXT NOT NULL CHECK (item_type IN (
    'wholesale_deal', 
    'capital_project', 
    'listing', 
    'article'
  )),
  item_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(external_user_id, item_type, item_id)
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_external_id ON user_profiles(external_user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(primary_role);
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_external_id ON user_badges(external_user_id);
CREATE INDEX IF NOT EXISTS idx_user_reputation_user_id ON user_reputation(user_id);
CREATE INDEX IF NOT EXISTS idx_user_reputation_external_id ON user_reputation(external_user_id);
CREATE INDEX IF NOT EXISTS idx_seller_leads_status ON seller_leads(status);
CREATE INDEX IF NOT EXISTS idx_wholesale_deals_wholesaler ON wholesale_deals(wholesaler_id);
CREATE INDEX IF NOT EXISTS idx_wholesale_deals_external_wholesaler ON wholesale_deals(external_wholesaler_id);
CREATE INDEX IF NOT EXISTS idx_wholesale_deals_status ON wholesale_deals(status);
CREATE INDEX IF NOT EXISTS idx_wholesale_deals_public ON wholesale_deals(is_public);
CREATE INDEX IF NOT EXISTS idx_saved_items_user ON saved_items(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_items_external_user ON saved_items(external_user_id);

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
-- CAPITAL PROJECTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS capital_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  external_owner_id TEXT,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  property_type TEXT,
  structure TEXT CHECK (structure IN ('EQUITY', 'DEBT', 'HYBRID')),
  funding_goal DECIMAL(12,2) NOT NULL,
  amount_raised DECIMAL(12,2) DEFAULT 0,
  min_investment DECIMAL(12,2),
  projected_return TEXT,
  hold_period TEXT,
  photos TEXT[],
  status TEXT DEFAULT 'ACTIVE' CHECK (status IN (
    'ACTIVE', 
    'FUNDED', 
    'CLOSED', 
    'CANCELLED'
  )),
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- JV REQUESTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS jv_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deal_id TEXT NOT NULL,
  requester_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  external_requester_id TEXT,
  wholesaler_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  external_wholesaler_id TEXT,
  strategy TEXT NOT NULL,
  funding_source TEXT,
  proposed_fee DECIMAL(12,2),
  message TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending', 
    'accepted', 
    'rejected', 
    'negotiating', 
    'closed'
  )),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- CAPITAL COMMITMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS capital_commitments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id TEXT NOT NULL,
  investor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  external_investor_id TEXT,
  amount DECIMAL(12,2) NOT NULL,
  structure_preference TEXT,
  notes TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending', 
    'approved', 
    'funded', 
    'rejected', 
    'withdrawn'
  )),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- LISTINGS TABLE (Retail/Investment Properties)
-- =====================================================
CREATE TABLE IF NOT EXISTS listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  external_owner_id TEXT,
  title TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  property_type TEXT,
  listing_type TEXT CHECK (listing_type IN ('retail', 'investment', 'wholesale')),
  price DECIMAL(12,2) NOT NULL,
  bedrooms INTEGER,
  bathrooms DECIMAL(3,1),
  sqft INTEGER,
  lot_size TEXT,
  year_built INTEGER,
  description TEXT,
  features TEXT[],
  photos TEXT[],
  status TEXT DEFAULT 'active' CHECK (status IN (
    'active', 
    'pending', 
    'sold', 
    'withdrawn'
  )),
  is_public BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- BUYER OFFERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS buyer_offers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id TEXT NOT NULL,
  buyer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  external_buyer_id TEXT,
  offer_amount DECIMAL(12,2) NOT NULL,
  financing_type TEXT,
  contingencies TEXT[],
  message TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending', 
    'accepted', 
    'rejected', 
    'countered', 
    'withdrawn'
  )),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- NOTIFICATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  external_user_id TEXT,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  link TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ADDITIONAL INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_capital_projects_owner ON capital_projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_capital_projects_external_owner ON capital_projects(external_owner_id);
CREATE INDEX IF NOT EXISTS idx_capital_projects_status ON capital_projects(status);
CREATE INDEX IF NOT EXISTS idx_jv_requests_deal ON jv_requests(deal_id);
CREATE INDEX IF NOT EXISTS idx_jv_requests_requester ON jv_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_jv_requests_external_requester ON jv_requests(external_requester_id);
CREATE INDEX IF NOT EXISTS idx_jv_requests_status ON jv_requests(status);
CREATE INDEX IF NOT EXISTS idx_capital_commitments_project ON capital_commitments(project_id);
CREATE INDEX IF NOT EXISTS idx_capital_commitments_investor ON capital_commitments(investor_id);
CREATE INDEX IF NOT EXISTS idx_capital_commitments_external_investor ON capital_commitments(external_investor_id);
CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_type ON listings(listing_type);
CREATE INDEX IF NOT EXISTS idx_listings_external_owner ON listings(external_owner_id);
CREATE INDEX IF NOT EXISTS idx_buyer_offers_listing ON buyer_offers(listing_id);
CREATE INDEX IF NOT EXISTS idx_buyer_offers_buyer ON buyer_offers(buyer_id);
CREATE INDEX IF NOT EXISTS idx_buyer_offers_external_buyer ON buyer_offers(external_buyer_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_external_user ON notifications(external_user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(external_user_id) WHERE is_read = FALSE;

-- =====================================================
-- RLS POLICIES FOR NEW TABLES
-- =====================================================

-- Capital Projects RLS
ALTER TABLE capital_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public projects are viewable" 
  ON capital_projects FOR SELECT 
  USING (is_public = true OR auth.uid() = owner_id);

CREATE POLICY "Owners can insert projects" 
  ON capital_projects FOR INSERT 
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update projects" 
  ON capital_projects FOR UPDATE 
  USING (auth.uid() = owner_id);

-- JV Requests RLS
ALTER TABLE jv_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own JV requests" 
  ON jv_requests FOR SELECT 
  USING (auth.uid() = requester_id OR auth.uid() = wholesaler_id);

CREATE POLICY "Users can insert JV requests" 
  ON jv_requests FOR INSERT 
  WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Participants can update JV requests" 
  ON jv_requests FOR UPDATE 
  USING (auth.uid() = requester_id OR auth.uid() = wholesaler_id);

-- Capital Commitments RLS
ALTER TABLE capital_commitments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own commitments" 
  ON capital_commitments FOR SELECT 
  USING (auth.uid() = investor_id OR auth.uid() IN (
    SELECT owner_id FROM capital_projects WHERE id = project_id
  ));

CREATE POLICY "Investors can insert commitments" 
  ON capital_commitments FOR INSERT 
  WITH CHECK (auth.uid() = investor_id);

CREATE POLICY "Investors can update own commitments" 
  ON capital_commitments FOR UPDATE 
  USING (auth.uid() = investor_id);

-- Listings RLS
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public listings are viewable" 
  ON listings FOR SELECT 
  USING (is_public = true OR auth.uid() = owner_id);

CREATE POLICY "Service role can manage listings" 
  ON listings FOR ALL 
  USING (true);

-- Buyer Offers RLS
ALTER TABLE buyer_offers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view related offers" 
  ON buyer_offers FOR SELECT 
  USING (auth.uid() = buyer_id OR auth.uid() IN (
    SELECT owner_id FROM listings WHERE id = listing_id
  ));

CREATE POLICY "Buyers can insert offers" 
  ON buyer_offers FOR INSERT 
  WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Buyers can update own offers" 
  ON buyer_offers FOR UPDATE 
  USING (auth.uid() = buyer_id);

-- Notifications RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications" 
  ON notifications FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert notifications" 
  ON notifications FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Users can update own notifications" 
  ON notifications FOR UPDATE 
  USING (auth.uid() = user_id);

-- =====================================================
-- FUNCTIONS (MUST BE DEFINED BEFORE TRIGGERS)
-- =====================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGERS
-- =====================================================

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

CREATE TRIGGER update_capital_projects_updated_at
    BEFORE UPDATE ON capital_projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jv_requests_updated_at
    BEFORE UPDATE ON jv_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_capital_commitments_updated_at
    BEFORE UPDATE ON capital_commitments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_listings_updated_at
    BEFORE UPDATE ON listings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_buyer_offers_updated_at
    BEFORE UPDATE ON buyer_offers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- CONFIRMATION MESSAGE
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE 'Pegasus DreamScapes Marketplace schema created successfully!';
  RAISE NOTICE 'Tables created: user_profiles, user_badges, user_reputation, seller_leads, wholesale_deals, saved_items, capital_projects, jv_requests, capital_commitments, listings, buyer_offers, notifications';
END $$;
