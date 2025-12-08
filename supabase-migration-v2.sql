-- Supabase Migration V2: Add external IDs for Replit Auth compatibility
-- This corrected version uses the actual column names from each table
-- Run this in your Supabase SQL Editor

-- =====================================================
-- JV REQUESTS - uses requester_id and wholesaler_id
-- =====================================================
ALTER TABLE jv_requests 
  ADD COLUMN IF NOT EXISTS external_requester_id TEXT;

ALTER TABLE jv_requests 
  ADD COLUMN IF NOT EXISTS external_wholesaler_id TEXT;

ALTER TABLE jv_requests 
  ALTER COLUMN requester_id DROP NOT NULL;

ALTER TABLE jv_requests 
  ALTER COLUMN wholesaler_id DROP NOT NULL;

-- =====================================================
-- CAPITAL PROJECTS - uses owner_id
-- =====================================================
ALTER TABLE capital_projects 
  ADD COLUMN IF NOT EXISTS external_owner_id TEXT;

ALTER TABLE capital_projects 
  ALTER COLUMN owner_id DROP NOT NULL;

-- =====================================================
-- CAPITAL COMMITMENTS - uses investor_id
-- =====================================================
ALTER TABLE capital_commitments 
  ADD COLUMN IF NOT EXISTS external_investor_id TEXT;

ALTER TABLE capital_commitments 
  ALTER COLUMN investor_id DROP NOT NULL;

-- =====================================================
-- BUYER OFFERS - uses buyer_id
-- =====================================================
ALTER TABLE buyer_offers 
  ADD COLUMN IF NOT EXISTS external_buyer_id TEXT;

ALTER TABLE buyer_offers 
  ALTER COLUMN buyer_id DROP NOT NULL;

-- =====================================================
-- NOTIFICATIONS - uses user_id
-- =====================================================
ALTER TABLE notifications 
  ADD COLUMN IF NOT EXISTS external_user_id TEXT;

ALTER TABLE notifications 
  ALTER COLUMN user_id DROP NOT NULL;

-- =====================================================
-- Create indexes for the new external ID columns
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_jv_requests_external_requester ON jv_requests(external_requester_id);
CREATE INDEX IF NOT EXISTS idx_jv_requests_external_wholesaler ON jv_requests(external_wholesaler_id);
CREATE INDEX IF NOT EXISTS idx_capital_projects_external_owner ON capital_projects(external_owner_id);
CREATE INDEX IF NOT EXISTS idx_capital_commitments_external_investor ON capital_commitments(external_investor_id);
CREATE INDEX IF NOT EXISTS idx_buyer_offers_external_buyer ON buyer_offers(external_buyer_id);
CREATE INDEX IF NOT EXISTS idx_notifications_external_user ON notifications(external_user_id);

-- =====================================================
-- Also ensure the earlier tables have their indexes
-- (in case the first migration didn't complete fully)
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_user_profiles_external_id ON user_profiles(external_user_id);
CREATE INDEX IF NOT EXISTS idx_user_reputation_external_id ON user_reputation(external_user_id);
CREATE INDEX IF NOT EXISTS idx_saved_items_external_id ON saved_items(external_user_id);

DO $$ 
BEGIN
  RAISE NOTICE 'Migration V2 complete: Added external ID columns for Replit Auth compatibility';
  RAISE NOTICE 'Tables updated: jv_requests, capital_projects, capital_commitments, buyer_offers, notifications';
END $$;
