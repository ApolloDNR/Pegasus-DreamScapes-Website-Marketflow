import { supabaseAdmin } from '../server/lib/supabase';

// Sample data for Pegasus Dreamscapes Marketplace

const sampleUsers = [
  {
    external_user_id: 'demo-admin-001',
    primary_role: 'admin',
    display_name: 'Marcus Chen',
    company_name: 'Pegasus Dreamscapes Corp',
    location: 'Phoenix, AZ',
    bio: 'Platform administrator overseeing all marketplace operations.',
    is_pegasus_badged: true,
    pegasus_role_type: 'admin'
  },
  {
    external_user_id: 'demo-wholesaler-001',
    primary_role: 'pegasus_wholesaler',
    display_name: 'Sarah Mitchell',
    company_name: 'Desert Property Solutions',
    location: 'Scottsdale, AZ',
    bio: 'Licensed real estate professional specializing in distressed properties and off-market deals. 8+ years experience in the Phoenix metro area.',
    is_pegasus_badged: true,
    pegasus_role_type: 'pegasus_wholesaler'
  },
  {
    external_user_id: 'demo-wholesaler-002',
    primary_role: 'wholesaler',
    display_name: 'James Rodriguez',
    company_name: 'Quick Flip Wholesale',
    location: 'Mesa, AZ',
    bio: 'Full-time wholesaler focused on single-family homes in Maricopa County.',
    is_pegasus_badged: false
  },
  {
    external_user_id: 'demo-dreamscaper-001',
    primary_role: 'pegasus_dreamscaper',
    display_name: 'Amanda Foster',
    company_name: 'Foster Capital Partners',
    location: 'Tempe, AZ',
    bio: 'Experienced capital raiser with $5M+ in funded projects. Specializing in fix-and-flip and small multifamily developments.',
    is_pegasus_badged: true,
    pegasus_role_type: 'pegasus_dreamscaper'
  },
  {
    external_user_id: 'demo-dreamscaper-002',
    primary_role: 'dreamscaper',
    display_name: 'Michael Torres',
    company_name: 'Elevation Development',
    location: 'Gilbert, AZ',
    bio: 'Real estate developer raising capital for value-add residential projects.',
    is_pegasus_badged: false
  },
  {
    external_user_id: 'demo-investor-001',
    primary_role: 'investor',
    display_name: 'David Chen',
    company_name: 'Chen Family Office',
    location: 'Paradise Valley, AZ',
    bio: 'Private investor seeking passive real estate investments. Focused on equity deals with 15%+ projected returns.',
    is_pegasus_badged: false
  },
  {
    external_user_id: 'demo-investor-002',
    primary_role: 'investor',
    display_name: 'Jennifer Williams',
    company_name: null,
    location: 'Chandler, AZ',
    bio: 'Accredited investor looking for debt and equity opportunities in the Phoenix market.',
    is_pegasus_badged: false
  },
  {
    external_user_id: 'demo-buyer-001',
    primary_role: 'buyer_investment',
    display_name: 'Robert Kim',
    company_name: 'Southwest Property Investors',
    location: 'Glendale, AZ',
    bio: 'Cash buyer actively purchasing 3-5 investment properties per month.',
    is_pegasus_badged: false
  },
  {
    external_user_id: 'demo-buyer-002',
    primary_role: 'buyer_retail',
    display_name: 'Lisa Martinez',
    company_name: null,
    location: 'Phoenix, AZ',
    bio: 'First-time home buyer looking for move-in ready properties.',
    is_pegasus_badged: false
  }
];

const sampleReputation = [
  { external_user_id: 'demo-admin-001', trust_score: 100, rating: 5.0, deals_closed_count: 0 },
  { external_user_id: 'demo-wholesaler-001', trust_score: 95, rating: 4.9, deals_closed_count: 47, on_time_closings_count: 45 },
  { external_user_id: 'demo-wholesaler-002', trust_score: 78, rating: 4.3, deals_closed_count: 12, on_time_closings_count: 10 },
  { external_user_id: 'demo-dreamscaper-001', trust_score: 92, rating: 4.8, deals_closed_count: 23, on_time_closings_count: 22 },
  { external_user_id: 'demo-dreamscaper-002', trust_score: 70, rating: 4.1, deals_closed_count: 5, on_time_closings_count: 4 },
  { external_user_id: 'demo-investor-001', trust_score: 88, rating: 4.7, deals_closed_count: 15, on_time_closings_count: 15 },
  { external_user_id: 'demo-investor-002', trust_score: 65, rating: 4.0, deals_closed_count: 3, on_time_closings_count: 3 },
  { external_user_id: 'demo-buyer-001', trust_score: 85, rating: 4.6, deals_closed_count: 28, on_time_closings_count: 26 },
  { external_user_id: 'demo-buyer-002', trust_score: 50, rating: 0, deals_closed_count: 0 }
];

const sampleBadges = [
  { external_user_id: 'demo-wholesaler-001', badge_type: 'verified', label: 'Verified Wholesaler', description: 'Identity and business verified' },
  { external_user_id: 'demo-wholesaler-001', badge_type: 'top_performer', label: 'Top 10% Wholesaler', description: 'Ranked in top 10% of wholesalers by volume' },
  { external_user_id: 'demo-dreamscaper-001', badge_type: 'verified', label: 'Verified Dreamscaper', description: 'Identity and track record verified' },
  { external_user_id: 'demo-dreamscaper-001', badge_type: 'capital_raised', label: '$5M+ Raised', description: 'Successfully raised over $5 million in capital' },
  { external_user_id: 'demo-investor-001', badge_type: 'accredited', label: 'Accredited Investor', description: 'Verified accredited investor status' },
  { external_user_id: 'demo-buyer-001', badge_type: 'power_buyer', label: 'Power Buyer', description: '20+ properties purchased' }
];

const sampleWholesaleDeals = [
  {
    external_wholesaler_id: 'demo-wholesaler-001',
    address: '4521 W McDowell Rd',
    city: 'Phoenix',
    state: 'AZ',
    zip_code: '85035',
    property_type: 'Single Family',
    arv: 385000,
    asking_price: 225000,
    repair_estimate: 75000,
    assignment_fee: 15000,
    photos: ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800'],
    occupancy: 'Vacant',
    close_timeline: '21 days',
    notes: 'Motivated seller, recently inherited property. 3BR/2BA, 1,450 sqft. Needs full cosmetic rehab - new flooring, paint, kitchen cabinets, bathroom updates. Great flip opportunity in established neighborhood.',
    status: 'Listed',
    is_public: true,
    raising_capital: false
  },
  {
    external_wholesaler_id: 'demo-wholesaler-001',
    address: '7832 N 19th Ave',
    city: 'Phoenix',
    state: 'AZ',
    zip_code: '85021',
    property_type: 'Single Family',
    arv: 425000,
    asking_price: 265000,
    repair_estimate: 60000,
    assignment_fee: 18000,
    photos: ['https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800'],
    occupancy: 'Owner Occupied',
    close_timeline: '30 days',
    notes: 'Estate sale, family needs quick close. 4BR/2BA, 1,800 sqft. Pool home! Needs cosmetic updates, pool resurfacing, and HVAC replacement. Seller flexible on terms.',
    status: 'Listed',
    is_public: true,
    raising_capital: true
  },
  {
    external_wholesaler_id: 'demo-wholesaler-002',
    address: '2156 E University Dr',
    city: 'Mesa',
    state: 'AZ',
    zip_code: '85213',
    property_type: 'Single Family',
    arv: 345000,
    asking_price: 195000,
    repair_estimate: 85000,
    assignment_fee: 12000,
    photos: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800'],
    occupancy: 'Vacant',
    close_timeline: '14 days',
    notes: 'Fire damaged property - insurance settled. 3BR/2BA, 1,350 sqft. Needs major renovation including roof, electrical, and full interior. Priced for quick sale.',
    status: 'Listed',
    is_public: true,
    raising_capital: false
  },
  {
    external_wholesaler_id: 'demo-wholesaler-001',
    address: '9012 S 48th St',
    city: 'Phoenix',
    state: 'AZ',
    zip_code: '85044',
    property_type: 'Single Family',
    arv: 520000,
    asking_price: 350000,
    repair_estimate: 45000,
    assignment_fee: 22000,
    photos: ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800'],
    occupancy: 'Tenant Occupied',
    close_timeline: '45 days',
    notes: 'Ahwatukee location! Tenant in place paying $2,200/month. 4BR/3BA, 2,400 sqft. Needs minor cosmetic updates. Perfect for buy-and-hold investor or wholetail.',
    status: 'Under Review',
    is_public: false,
    raising_capital: false
  },
  {
    external_wholesaler_id: 'demo-wholesaler-002',
    address: '3345 W Baseline Rd',
    city: 'Laveen',
    state: 'AZ',
    zip_code: '85339',
    property_type: 'Single Family',
    arv: 295000,
    asking_price: 175000,
    repair_estimate: 55000,
    assignment_fee: 10000,
    photos: ['https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=800'],
    occupancy: 'Vacant',
    close_timeline: '21 days',
    notes: 'Bank REO property. 3BR/2BA, 1,200 sqft. Needs full rehab - kitchen, bathrooms, flooring, paint. Good starter flip for new investors.',
    status: 'Listed',
    is_public: true,
    raising_capital: false
  }
];

const sampleCapitalProjects = [
  {
    external_owner_id: 'demo-dreamscaper-001',
    title: 'Scottsdale Fix & Flip - Luxury Single Family',
    description: 'Seeking capital partners for a high-end flip in North Scottsdale. Property is a 4BR/3.5BA home in a gated community with strong appreciation potential. Complete cosmetic renovation planned with designer finishes.',
    location: 'Scottsdale, AZ',
    property_type: 'Single Family',
    structure: 'EQUITY',
    funding_goal: 150000,
    amount_raised: 75000,
    min_investment: 25000,
    projected_return: '22-28%',
    hold_period: '6-8 months',
    photos: ['https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800'],
    status: 'ACTIVE',
    is_public: true
  },
  {
    external_owner_id: 'demo-dreamscaper-001',
    title: 'Mesa Duplex Conversion',
    description: 'Converting a large single-family home into a legal duplex. Great cash flow opportunity in student housing market near ASU. Seeking debt investors for the renovation phase.',
    location: 'Mesa, AZ',
    property_type: 'Multi-Family',
    structure: 'DEBT',
    funding_goal: 85000,
    amount_raised: 85000,
    min_investment: 10000,
    projected_return: '12% annual interest',
    hold_period: '12 months',
    photos: ['https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800'],
    status: 'FUNDED',
    is_public: true
  },
  {
    external_owner_id: 'demo-dreamscaper-002',
    title: 'Gilbert Rental Portfolio Acquisition',
    description: 'Acquiring a 4-property rental portfolio in Gilbert. All properties leased with strong NOI. Seeking equity partners for the down payment and closing costs.',
    location: 'Gilbert, AZ',
    property_type: 'Multi-Family',
    structure: 'EQUITY',
    funding_goal: 280000,
    amount_raised: 140000,
    min_investment: 50000,
    projected_return: '15-18% CoC + Appreciation',
    hold_period: '5 years',
    photos: ['https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800'],
    status: 'ACTIVE',
    is_public: true
  },
  {
    external_owner_id: 'demo-dreamscaper-001',
    title: 'Tempe Townhome Development',
    description: 'Ground-up construction of 6 townhomes near ASU campus. Pre-sold units with strong buyer demand. Hybrid funding structure with debt and equity components.',
    location: 'Tempe, AZ',
    property_type: 'Townhome',
    structure: 'HYBRID',
    funding_goal: 450000,
    amount_raised: 125000,
    min_investment: 25000,
    projected_return: '25-35%',
    hold_period: '18-24 months',
    photos: ['https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800'],
    status: 'ACTIVE',
    is_public: true
  }
];

const sampleListings = [
  {
    external_owner_id: 'demo-wholesaler-001',
    title: 'Renovated Craftsman in Historic District',
    address: '1234 N 7th Ave',
    city: 'Phoenix',
    state: 'AZ',
    zip_code: '85007',
    property_type: 'Single Family',
    listing_type: 'retail',
    price: 425000,
    bedrooms: 3,
    bathrooms: 2.0,
    sqft: 1650,
    lot_size: '0.15 acres',
    year_built: 1928,
    description: 'Beautifully renovated Craftsman bungalow in the historic Coronado neighborhood. Original character preserved with modern updates throughout. New kitchen with quartz countertops, refinished hardwood floors, updated electrical and plumbing.',
    features: ['Original Hardwood Floors', 'Updated Kitchen', 'Central A/C', 'Covered Patio', 'Detached Garage', 'Mature Trees'],
    photos: ['https://images.unsplash.com/photo-1600573472556-e636c2acda88?w=800'],
    status: 'active',
    is_public: true
  },
  {
    external_owner_id: 'demo-wholesaler-001',
    title: 'Modern Desert Contemporary',
    address: '8765 E Pinnacle Peak Rd',
    city: 'Scottsdale',
    state: 'AZ',
    zip_code: '85255',
    property_type: 'Single Family',
    listing_type: 'retail',
    price: 875000,
    bedrooms: 4,
    bathrooms: 3.5,
    sqft: 3200,
    lot_size: '0.5 acres',
    year_built: 2019,
    description: 'Stunning desert contemporary home with panoramic mountain views. Open floor plan, floor-to-ceiling windows, gourmet kitchen with Wolf appliances. Private backyard oasis with pool, spa, and built-in BBQ.',
    features: ['Mountain Views', 'Pool & Spa', 'Gourmet Kitchen', 'Smart Home', '3-Car Garage', 'Home Theater'],
    photos: ['https://images.unsplash.com/photo-1600047509358-9dc75507daeb?w=800'],
    status: 'active',
    is_public: true
  },
  {
    external_owner_id: null,
    title: 'Investment Duplex - Fully Leased',
    address: '2345 W Camelback Rd',
    city: 'Phoenix',
    state: 'AZ',
    zip_code: '85015',
    property_type: 'Multi-Family',
    listing_type: 'investment',
    price: 385000,
    bedrooms: 4,
    bathrooms: 2.0,
    sqft: 1800,
    lot_size: '0.12 acres',
    year_built: 1965,
    description: 'Solid income-producing duplex with long-term tenants. Each unit is 2BR/1BA. Recent updates include new roof (2022), water heater, and exterior paint. Strong rental area near light rail.',
    features: ['Fully Leased', 'New Roof', 'Separate Utilities', 'Covered Parking', 'Near Light Rail', 'Laundry Hookups'],
    photos: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800'],
    status: 'active',
    is_public: true
  }
];

const sampleSellerLeads = [
  {
    name: 'Patricia Johnson',
    phone: '602-555-1234',
    email: 'patricia.j@email.com',
    address: '5678 W Indian School Rd, Phoenix, AZ 85031',
    property_type: 'Single Family',
    reason: 'Behind on payments, need to sell quickly',
    best_time: 'Evenings after 5pm',
    notes: 'Inherited property from mother. Open to creative financing options.',
    source: 'Website - Seller',
    status: 'New'
  },
  {
    name: 'Thomas Williams',
    phone: '480-555-5678',
    email: 'tom.w@email.com',
    address: '3456 S Rural Rd, Tempe, AZ 85282',
    property_type: 'Single Family',
    reason: 'Relocating for work',
    best_time: 'Mornings',
    notes: 'Moving to Texas in 60 days. Property needs some work but priced to sell.',
    source: 'Website - Seller',
    status: 'Contacted'
  },
  {
    name: 'Maria Garcia',
    phone: '623-555-9012',
    email: 'maria.g@email.com',
    address: '7890 N 67th Ave, Glendale, AZ 85303',
    property_type: 'Multi-Family',
    reason: 'Tired landlord, want to cash out',
    best_time: 'Weekends',
    notes: 'Owns triplex, tenants in place. Looking for all-cash offer.',
    source: 'Referral',
    status: 'Qualified'
  }
];

const sampleNotifications = [
  {
    external_user_id: 'demo-wholesaler-001',
    type: 'deal_approved',
    title: 'Deal Approved',
    message: 'Your wholesale deal at 4521 W McDowell Rd has been approved and is now listed on the marketplace.',
    link: '/marketplace/wholesale',
    is_read: true
  },
  {
    external_user_id: 'demo-wholesaler-001',
    type: 'jv_request',
    title: 'New JV Request',
    message: 'David Chen has requested to JV on your deal at 7832 N 19th Ave.',
    link: '/marketplace/wholesaler',
    is_read: false
  },
  {
    external_user_id: 'demo-investor-001',
    type: 'investment_update',
    title: 'Investment Update',
    message: 'The Scottsdale Fix & Flip project has reached 50% funding. 3 days left to invest.',
    link: '/marketplace/capital',
    is_read: false
  },
  {
    external_user_id: 'demo-dreamscaper-001',
    type: 'commitment_received',
    title: 'New Capital Commitment',
    message: 'Jennifer Williams has committed $25,000 to your Mesa Duplex Conversion project.',
    link: '/marketplace/dreamscaper',
    is_read: true
  },
  {
    external_user_id: 'demo-buyer-001',
    type: 'new_listing',
    title: 'New Property Match',
    message: 'A new investment property matching your criteria has been listed in Phoenix.',
    link: '/marketplace/buyer',
    is_read: false
  }
];

const sampleCapitalCommitments = [
  {
    project_id: '', // Will be filled with actual project UUID
    external_investor_id: 'demo-investor-001',
    amount: 50000,
    structure_preference: 'EQUITY',
    notes: 'Looking forward to this opportunity. Please share renovation timeline.',
    status: 'approved'
  },
  {
    project_id: '', // Will be filled with actual project UUID
    external_investor_id: 'demo-investor-002',
    amount: 25000,
    structure_preference: 'EQUITY',
    notes: 'First investment with this team.',
    status: 'funded'
  }
];

const sampleJVRequests = [
  {
    deal_id: '', // Will be filled with actual deal UUID
    external_requester_id: 'demo-investor-001',
    external_wholesaler_id: 'demo-wholesaler-001',
    strategy: 'flip',
    funding_source: 'Cash',
    proposed_fee: 15000,
    message: 'I have extensive flip experience in this area. Would like to discuss a JV partnership on this property.',
    status: 'pending'
  },
  {
    deal_id: '', // Will be filled with actual deal UUID
    external_requester_id: 'demo-dreamscaper-002',
    external_wholesaler_id: 'demo-wholesaler-001',
    strategy: 'rental',
    funding_source: 'Hard Money',
    proposed_fee: 18000,
    message: 'This would be perfect for our rental portfolio. Interested in discussing terms.',
    status: 'negotiating'
  }
];

async function clearExistingData() {
  console.log('Clearing existing sample data...');
  
  const tables = [
    'notifications',
    'capital_commitments', 
    'jv_requests',
    'buyer_offers',
    'saved_items',
    'listings',
    'capital_projects',
    'wholesale_deals',
    'seller_leads',
    'user_badges',
    'user_reputation',
    'user_profiles'
  ];
  
  for (const table of tables) {
    const { error } = await supabaseAdmin
      .from(table)
      .delete()
      .like('external_user_id', 'demo-%')
      .or('external_user_id.is.null');
    
    if (error && !error.message.includes('column')) {
      // Also try with other external ID columns
      await supabaseAdmin.from(table).delete().like('external_wholesaler_id', 'demo-%');
      await supabaseAdmin.from(table).delete().like('external_owner_id', 'demo-%');
      await supabaseAdmin.from(table).delete().like('external_investor_id', 'demo-%');
      await supabaseAdmin.from(table).delete().like('external_requester_id', 'demo-%');
      await supabaseAdmin.from(table).delete().like('external_buyer_id', 'demo-%');
    }
  }
  
  console.log('Cleared existing sample data');
}

async function seedUsers() {
  console.log('Seeding user profiles...');
  
  for (const user of sampleUsers) {
    const { error } = await supabaseAdmin
      .from('user_profiles')
      .upsert(user, { onConflict: 'external_user_id' });
    
    if (error) {
      console.error(`Error seeding user ${user.display_name}:`, error.message);
    } else {
      console.log(`Seeded user: ${user.display_name} (${user.primary_role})`);
    }
  }
}

async function seedReputation() {
  console.log('Seeding user reputation...');
  
  for (const rep of sampleReputation) {
    const { error } = await supabaseAdmin
      .from('user_reputation')
      .upsert(rep, { onConflict: 'external_user_id' });
    
    if (error) {
      console.error(`Error seeding reputation for ${rep.external_user_id}:`, error.message);
    }
  }
  console.log('Seeded user reputation');
}

async function seedBadges() {
  console.log('Seeding user badges...');
  
  for (const badge of sampleBadges) {
    const { error } = await supabaseAdmin
      .from('user_badges')
      .insert(badge);
    
    if (error) {
      console.error(`Error seeding badge:`, error.message);
    }
  }
  console.log('Seeded user badges');
}

async function seedWholesaleDeals() {
  console.log('Seeding wholesale deals...');
  
  const insertedDeals: string[] = [];
  
  for (const deal of sampleWholesaleDeals) {
    const { data, error } = await supabaseAdmin
      .from('wholesale_deals')
      .insert(deal)
      .select('id')
      .single();
    
    if (error) {
      console.error(`Error seeding deal at ${deal.address}:`, error.message);
    } else {
      console.log(`Seeded deal: ${deal.address}`);
      if (data) insertedDeals.push(data.id);
    }
  }
  
  return insertedDeals;
}

async function seedCapitalProjects() {
  console.log('Seeding capital projects...');
  
  const insertedProjects: string[] = [];
  
  for (const project of sampleCapitalProjects) {
    const { data, error } = await supabaseAdmin
      .from('capital_projects')
      .insert(project)
      .select('id')
      .single();
    
    if (error) {
      console.error(`Error seeding project ${project.title}:`, error.message);
    } else {
      console.log(`Seeded project: ${project.title}`);
      if (data) insertedProjects.push(data.id);
    }
  }
  
  return insertedProjects;
}

async function seedListings() {
  console.log('Seeding listings...');
  
  for (const listing of sampleListings) {
    const { error } = await supabaseAdmin
      .from('listings')
      .insert(listing);
    
    if (error) {
      console.error(`Error seeding listing ${listing.title}:`, error.message);
    } else {
      console.log(`Seeded listing: ${listing.title}`);
    }
  }
}

async function seedSellerLeads() {
  console.log('Seeding seller leads...');
  
  for (const lead of sampleSellerLeads) {
    const { error } = await supabaseAdmin
      .from('seller_leads')
      .insert(lead);
    
    if (error) {
      console.error(`Error seeding lead ${lead.name}:`, error.message);
    } else {
      console.log(`Seeded lead: ${lead.name}`);
    }
  }
}

async function seedNotifications() {
  console.log('Seeding notifications...');
  
  for (const notif of sampleNotifications) {
    const { error } = await supabaseAdmin
      .from('notifications')
      .insert(notif);
    
    if (error) {
      console.error(`Error seeding notification:`, error.message);
    }
  }
  console.log('Seeded notifications');
}

async function seedJVRequests(dealIds: string[]) {
  console.log('Seeding JV requests...');
  
  if (dealIds.length < 2) {
    console.log('Not enough deals to seed JV requests');
    return;
  }
  
  sampleJVRequests[0].deal_id = dealIds[0];
  sampleJVRequests[1].deal_id = dealIds[1];
  
  for (const request of sampleJVRequests) {
    const { error } = await supabaseAdmin
      .from('jv_requests')
      .insert(request);
    
    if (error) {
      console.error(`Error seeding JV request:`, error.message);
    }
  }
  console.log('Seeded JV requests');
}

async function seedCapitalCommitments(projectIds: string[]) {
  console.log('Seeding capital commitments...');
  
  if (projectIds.length < 2) {
    console.log('Not enough projects to seed commitments');
    return;
  }
  
  sampleCapitalCommitments[0].project_id = projectIds[0];
  sampleCapitalCommitments[1].project_id = projectIds[1];
  
  for (const commitment of sampleCapitalCommitments) {
    const { error } = await supabaseAdmin
      .from('capital_commitments')
      .insert(commitment);
    
    if (error) {
      console.error(`Error seeding commitment:`, error.message);
    }
  }
  console.log('Seeded capital commitments');
}

async function runSeed() {
  console.log('='.repeat(60));
  console.log('Pegasus Dreamscapes - Supabase Sample Data Seeder');
  console.log('='.repeat(60));
  
  try {
    // Clear existing demo data first
    await clearExistingData();
    
    // Seed in order of dependencies
    await seedUsers();
    await seedReputation();
    await seedBadges();
    await seedSellerLeads();
    
    const dealIds = await seedWholesaleDeals();
    const projectIds = await seedCapitalProjects();
    
    await seedListings();
    await seedNotifications();
    await seedJVRequests(dealIds);
    await seedCapitalCommitments(projectIds);
    
    console.log('='.repeat(60));
    console.log('Sample data seeding complete!');
    console.log('='.repeat(60));
    console.log('\nSummary:');
    console.log(`- ${sampleUsers.length} user profiles`);
    console.log(`- ${sampleWholesaleDeals.length} wholesale deals`);
    console.log(`- ${sampleCapitalProjects.length} capital projects`);
    console.log(`- ${sampleListings.length} retail/investment listings`);
    console.log(`- ${sampleSellerLeads.length} seller leads`);
    console.log(`- ${sampleNotifications.length} notifications`);
    console.log(`- ${sampleJVRequests.length} JV requests`);
    console.log(`- ${sampleCapitalCommitments.length} capital commitments`);
    console.log('\nDemo user IDs for testing:');
    console.log('- Admin: demo-admin-001');
    console.log('- Pegasus Wholesaler: demo-wholesaler-001');
    console.log('- Wholesaler: demo-wholesaler-002');
    console.log('- Pegasus Dreamscaper: demo-dreamscaper-001');
    console.log('- Investor: demo-investor-001');
    console.log('- Buyer: demo-buyer-001');
    
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

runSeed();
