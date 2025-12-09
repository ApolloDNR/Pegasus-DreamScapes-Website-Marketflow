-- Supabase Seed Data for Pegasus DreamScapes Marketplace
-- Run this AFTER running supabase-migration-v2.sql

-- =====================================================
-- WHOLESALE DEALS
-- =====================================================
INSERT INTO wholesale_deals (
  external_wholesaler_id,
  address, city, state, zip_code, property_type,
  arv, asking_price, repair_estimate, assignment_fee,
  occupancy, close_timeline, notes, status, is_public, photos
) VALUES 
(
  '50383971',
  '2847 Grand Avenue', 'Oakland', 'CA', '94610', 'single-family',
  725000, 485000, 115000, 18000,
  'Vacant', '30 days', 'Motivated seller estate sale. Original hardwood floors under carpet, good bones. Large backyard with ADU potential.',
  'Approved', true,
  ARRAY['https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=-800']
),
(
  '50383971',
  '1523 Fruitvale Ave', 'Oakland', 'CA', '94601', 'duplex',
  565000, 365000, 95000, 12000,
  'Tenant Occupied', '45 days', 'Up/down duplex with separate meters. Strong rental history in area. Rent control exempt.',
  'Approved', true,
  ARRAY['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800']
),
(
  '50383971',
  '4892 Telegraph Ave', 'Oakland', 'CA', '94609', 'single-family',
  525000, 298000, 110000, 10000,
  'Vacant', '21 days', 'Pre-foreclosure acquisition. Property needs substantial work but excellent location near Temescal dining district.',
  'Approved', true,
  ARRAY['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800']
),
(
  '50383971',
  '789 Castro Street', 'Richmond', 'CA', '94801', 'single-family',
  485000, 245000, 125000, 8000,
  'Vacant', '30 days', 'Inherited property, heirs live out of state. House vacant for 2 years, needs full renovation.',
  'Approved', true,
  ARRAY['https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800']
),
(
  '50383971',
  '3156 Broadway', 'Oakland', 'CA', '94611', 'single-family',
  1050000, 625000, 225000, 25000,
  'Owner Occupied', '60 days', 'Historic craftsman in prime Piedmont-adjacent location. Original details intact including stained glass.',
  'Approved', true,
  ARRAY['https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800']
);

-- =====================================================
-- CAPITAL PROJECTS (matching actual schema columns)
-- =====================================================
INSERT INTO capital_projects (
  external_owner_id,
  title, description, location, property_type, structure,
  funding_goal, min_investment, projected_return, hold_period,
  status, photos
) VALUES 
(
  '50383971',
  'Oakland Downtown Revitalization Project',
  'Multi-unit acquisition and renovation project in downtown Oakland. Targeting 15 units across 3 buildings with mixed residential and commercial use.',
  'Oakland, CA 94612', 'multi-family', 'EQUITY',
  2500000, 50000, '18.5% IRR', '24 months',
  'ACTIVE',
  ARRAY['https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800']
),
(
  '50383971',
  'Sacramento Rental Portfolio',
  'Acquisition of 8 single-family rentals in emerging Sacramento neighborhoods. Focus on B-class properties with stable cash flow.',
  'Sacramento, CA 95820', 'single-family', 'DEBT',
  1200000, 25000, '14% Annual Return', '36 months',
  'ACTIVE',
  ARRAY['https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800']
),
(
  '50383971',
  'Bay Area Fix & Flip Fund',
  'Pooled capital for multiple fix-and-flip opportunities in the East Bay market. Targeting 6-8 projects per year.',
  'Oakland, CA 94601', 'single-family', 'HYBRID',
  800000, 15000, '22% Target Return', '12 months',
  'ACTIVE',
  ARRAY['https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800']
);

-- =====================================================
-- RETAIL LISTINGS (matching actual schema columns)
-- =====================================================
INSERT INTO listings (
  title, description, address, city, state, zip_code,
  price, property_type, bedrooms, bathrooms, sqft, year_built,
  status, listing_type, photos
) VALUES 
(
  'Beautifully Renovated 4BR in Land Park',
  'Move-in ready home with modern finishes throughout. New kitchen, updated bathrooms, and spacious backyard. Perfect for families.',
  '123 Oak Street', 'Sacramento', 'CA', '95820',
  475000, 'Single Family', 4, 2.5, 2200, 1975,
  'active', 'retail',
  ARRAY['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800']
),
(
  'Charming 3BR with Open Floor Plan',
  'Updated home with new roof, electrical, and fresh landscaping. Two-car garage and low maintenance yard.',
  '456 Maple Avenue', 'Elk Grove', 'CA', '95624',
  425000, 'Single Family', 3, 2, 1800, 1985,
  'active', 'retail',
  ARRAY['https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=800']
),
(
  'Premium 5BR Pool Home in Roseville',
  'Spacious home in desirable neighborhood. Complete renovation including gourmet kitchen, luxury bathrooms, and solar panels.',
  '789 Pine Court', 'Roseville', 'CA', '95678',
  625000, 'Single Family', 5, 3, 2800, 1995,
  'active', 'investment',
  ARRAY['https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800']
);

DO $$ 
BEGIN
  RAISE NOTICE 'Seed data inserted: wholesale_deals, capital_projects, listings';
END $$;
