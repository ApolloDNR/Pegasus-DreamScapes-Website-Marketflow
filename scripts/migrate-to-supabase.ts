import { db } from '../server/db';
import { supabaseAdmin } from '../server/lib/supabase';
import { 
  wholesaleDeals, 
  capitalProjects, 
  retailListings,
  notifications,
  sellerLeads
} from '../shared/schema';

async function migrateWholesaleDeals() {
  console.log('Migrating wholesale deals...');
  const deals = await db.select().from(wholesaleDeals);
  
  for (const deal of deals) {
    const { error } = await supabaseAdmin
      .from('wholesale_deals')
      .insert({
        external_wholesaler_id: deal.submittedBy ? String(deal.submittedBy) : null,
        address: deal.propertyAddress,
        city: deal.city,
        state: deal.state,
        zip_code: deal.zipCode,
        property_type: deal.propertyType,
        arv: deal.arv,
        asking_price: deal.contractPrice,
        repair_estimate: deal.estimatedRepairs || 0,
        assignment_fee: deal.assignmentFee,
        photos: deal.images || [],
        occupancy: deal.occupancyStatus,
        close_timeline: deal.closingDate ? deal.closingDate.toISOString() : null,
        notes: deal.description,
        status: deal.status,
        is_public: deal.status === 'Approved' || deal.status === 'Listed',
        raising_capital: false,
        created_at: deal.createdAt,
        updated_at: deal.updatedAt
      });
    
    if (error) {
      console.error(`Error migrating deal ${deal.id}:`, error);
    } else {
      console.log(`Migrated deal: ${deal.propertyAddress}`);
    }
  }
  console.log(`Migrated ${deals.length} wholesale deals`);
}

async function migrateCapitalProjects() {
  console.log('Migrating capital projects...');
  const projects = await db.select().from(capitalProjects);
  
  for (const project of projects) {
    const { error } = await supabaseAdmin
      .from('capital_projects')
      .insert({
        external_owner_id: String(project.createdBy),
        title: project.title,
        description: project.description,
        location: project.location,
        property_type: project.propertyType,
        structure: project.structure,
        funding_goal: project.fundingGoal,
        amount_raised: project.amountRaised || 0,
        min_investment: project.minInvestment,
        projected_return: project.projectedReturn,
        hold_period: project.holdPeriod,
        photos: project.images || [],
        status: project.status,
        is_public: project.status === 'ACTIVE' || project.status === 'FUNDED',
        created_at: project.createdAt,
        updated_at: project.updatedAt
      });
    
    if (error) {
      console.error(`Error migrating project ${project.id}:`, error);
    } else {
      console.log(`Migrated project: ${project.title}`);
    }
  }
  console.log(`Migrated ${projects.length} capital projects`);
}

async function migrateRetailListings() {
  console.log('Migrating retail listings...');
  const listings = await db.select().from(retailListings);
  
  for (const listing of listings) {
    const { error } = await supabaseAdmin
      .from('listings')
      .insert({
        external_owner_id: null,
        title: listing.propertyAddress,
        address: listing.propertyAddress,
        city: listing.city,
        state: listing.state,
        zip_code: listing.zipCode,
        property_type: listing.propertyType,
        listing_type: 'retail',
        price: listing.listPrice,
        bedrooms: listing.bedrooms,
        bathrooms: listing.bathrooms ? parseFloat(listing.bathrooms) : null,
        sqft: listing.sqft,
        lot_size: listing.lotSize,
        year_built: listing.yearBuilt,
        description: listing.description,
        features: listing.features || [],
        photos: listing.images || [],
        status: listing.status === 'coming_soon' ? 'pending' : listing.status,
        is_public: listing.status === 'active',
        created_at: listing.createdAt,
        updated_at: listing.updatedAt
      });
    
    if (error) {
      console.error(`Error migrating listing ${listing.id}:`, error);
    } else {
      console.log(`Migrated listing: ${listing.propertyAddress}`);
    }
  }
  console.log(`Migrated ${listings.length} retail listings`);
}

async function migrateNotifications() {
  console.log('Migrating notifications...');
  const notifs = await db.select().from(notifications);
  
  for (const notif of notifs) {
    const { error } = await supabaseAdmin
      .from('notifications')
      .insert({
        external_user_id: String(notif.userId),
        type: notif.type,
        title: notif.title,
        message: notif.message,
        link: notif.link,
        is_read: notif.isRead,
        created_at: notif.createdAt
      });
    
    if (error) {
      console.error(`Error migrating notification ${notif.id}:`, error);
    }
  }
  console.log(`Migrated ${notifs.length} notifications`);
}

async function migrateSellerLeads() {
  console.log('Migrating seller leads...');
  const leads = await db.select().from(sellerLeads);
  
  for (const lead of leads) {
    const { error } = await supabaseAdmin
      .from('seller_leads')
      .insert({
        name: lead.name,
        phone: lead.phone,
        email: lead.email,
        address: lead.propertyAddress,
        property_type: lead.propertyType,
        reason: lead.condition,
        best_time: lead.timeline,
        notes: lead.notes,
        source: 'Website - Seller',
        status: lead.status,
        created_at: lead.createdAt
      });
    
    if (error) {
      console.error(`Error migrating seller lead ${lead.id}:`, error);
    }
  }
  console.log(`Migrated ${leads.length} seller leads`);
}

async function runMigration() {
  console.log('='.repeat(50));
  console.log('Starting PostgreSQL to Supabase Migration');
  console.log('='.repeat(50));
  
  try {
    await migrateSellerLeads();
    await migrateWholesaleDeals();
    await migrateCapitalProjects();
    await migrateRetailListings();
    await migrateNotifications();
    
    console.log('='.repeat(50));
    console.log('Migration Complete!');
    console.log('='.repeat(50));
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
