-- Supabase Migration: Add external_user_id for Replit Auth compatibility
-- Run this in your Supabase SQL Editor after the main schema

-- Add external_user_id column to user_profiles for Replit Auth users
ALTER TABLE user_profiles 
  ADD COLUMN IF NOT EXISTS external_user_id TEXT UNIQUE;

-- Make the auth.users foreign key nullable to support Replit Auth users
ALTER TABLE user_profiles 
  ALTER COLUMN user_id DROP NOT NULL;

-- Add external_user_id to user_badges
ALTER TABLE user_badges 
  ADD COLUMN IF NOT EXISTS external_user_id TEXT;

-- Make user_badges user_id nullable
ALTER TABLE user_badges 
  ALTER COLUMN user_id DROP NOT NULL;

-- Add external_user_id to user_reputation
ALTER TABLE user_reputation 
  ADD COLUMN IF NOT EXISTS external_user_id TEXT UNIQUE;

-- Make user_reputation user_id nullable  
ALTER TABLE user_reputation 
  ALTER COLUMN user_id DROP NOT NULL;

-- Add external_user_id to saved_items
ALTER TABLE saved_items 
  ADD COLUMN IF NOT EXISTS external_user_id TEXT;

-- Make saved_items user_id nullable
ALTER TABLE saved_items 
  ALTER COLUMN user_id DROP NOT NULL;

-- Add external_user_id to jv_requests
ALTER TABLE jv_requests 
  ADD COLUMN IF NOT EXISTS external_user_id TEXT;

-- Make jv_requests user_id nullable
ALTER TABLE jv_requests 
  ALTER COLUMN user_id DROP NOT NULL;

-- Add external_user_id to capital_commitments
ALTER TABLE capital_commitments 
  ADD COLUMN IF NOT EXISTS external_user_id TEXT;

-- Make capital_commitments user_id nullable
ALTER TABLE capital_commitments 
  ALTER COLUMN user_id DROP NOT NULL;

-- Add external_user_id to buyer_offers
ALTER TABLE buyer_offers 
  ADD COLUMN IF NOT EXISTS external_user_id TEXT;

-- Make buyer_offers user_id nullable
ALTER TABLE buyer_offers 
  ALTER COLUMN user_id DROP NOT NULL;

-- Add external_user_id to notifications
ALTER TABLE notifications 
  ADD COLUMN IF NOT EXISTS external_user_id TEXT;

-- Make notifications user_id nullable
ALTER TABLE notifications 
  ALTER COLUMN user_id DROP NOT NULL;

-- Add external_user_id to wholesale_deals (wholesaler_id becomes optional)
ALTER TABLE wholesale_deals 
  ADD COLUMN IF NOT EXISTS external_wholesaler_id TEXT;

-- Make wholesale_deals wholesaler_id nullable
ALTER TABLE wholesale_deals 
  ALTER COLUMN wholesaler_id DROP NOT NULL;

-- Add external_user_id to capital_projects (owner_id)
ALTER TABLE capital_projects 
  ADD COLUMN IF NOT EXISTS external_owner_id TEXT;

-- Create indexes for the new external_user_id columns
CREATE INDEX IF NOT EXISTS idx_user_profiles_external_id ON user_profiles(external_user_id);
CREATE INDEX IF NOT EXISTS idx_user_reputation_external_id ON user_reputation(external_user_id);
CREATE INDEX IF NOT EXISTS idx_saved_items_external_id ON saved_items(external_user_id);
CREATE INDEX IF NOT EXISTS idx_jv_requests_external_id ON jv_requests(external_user_id);
CREATE INDEX IF NOT EXISTS idx_capital_commitments_external_id ON capital_commitments(external_user_id);
CREATE INDEX IF NOT EXISTS idx_buyer_offers_external_id ON buyer_offers(external_user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_external_id ON notifications(external_user_id);
CREATE INDEX IF NOT EXISTS idx_wholesale_deals_external_wholesaler ON wholesale_deals(external_wholesaler_id);
CREATE INDEX IF NOT EXISTS idx_capital_projects_external_owner ON capital_projects(external_owner_id);

-- Update RLS policies to also check external_user_id
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
CREATE POLICY "Users can update own profile" 
  ON user_profiles FOR UPDATE 
  USING (auth.uid() = user_id OR external_user_id IS NOT NULL);

DO $$ 
BEGIN
  RAISE NOTICE 'Migration complete: Added external_user_id columns for Replit Auth compatibility';
END $$;
