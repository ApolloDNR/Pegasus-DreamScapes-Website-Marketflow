# Supabase Setup Guide for Pegasus Dreamscapes

This guide explains how to complete the Supabase migration for the Pegasus Dreamscapes platform.

## Prerequisites

1. A Supabase project (already configured via Replit integration)
2. Access to the Supabase Dashboard SQL Editor

## Step 1: Create Database Tables

1. Open your Supabase project dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Create a new query
4. Copy the entire contents of `supabase-schema.sql` from this repository
5. Paste it into the SQL Editor
6. Click **Run** to execute the schema

This will create all necessary tables:
- `user_profiles` - User profile data and role assignments
- `user_badges` - Achievement badges for users
- `user_reputation` - Trust scores and ratings
- `seller_leads` - Lead submissions
- `wholesale_deals` - Wholesale deal listings
- `saved_items` - User saved/favorited items
- `capital_projects` - Capital raising projects
- `capital_commitments` - Investment commitments to projects
- `jv_requests` - Joint venture partnership requests
- `retail_listings` - Retail property listings
- `buyer_offers` - Buyer offers on listings
- `articles` - Educational content
- `notifications` - User notifications
- `admin_audit_log` - Admin action tracking

## Step 2: Configure Row Level Security (RLS)

The schema includes RLS policies for secure data access. After running the schema:

1. Go to **Authentication > Policies** in Supabase
2. Verify that each table has appropriate policies enabled
3. Test by accessing data with different user roles

## Step 3: Verify Environment Variables

Ensure these environment variables are set in Replit:

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

These should already be configured if you used the Replit Supabase integration.

## Step 4: Test the Connection

1. Start the application with `npm run dev`
2. Check the server logs for any Supabase connection errors
3. Navigate to the marketplace pages to verify data fetching

## Migration Status

### Completed
- Role system migration (8-tier MARKETPLACE_ROLES)
- Action mutations (deal submission, JV requests, capital commitments, buyer offers)
- Data fetching queries (marketplace list and detail pages)

### Pending Supabase Tables
Until the tables are created by running `supabase-schema.sql`:
- Marketplace pages will show no data
- Action mutations will fail
- User profiles won't save to Supabase

### Data Migration
After creating tables, run the migration script:
```bash
npx tsx scripts/migrate-to-supabase.ts
```

This will migrate:
- Seller leads
- Wholesale deals  
- Capital projects
- Retail listings
- Notifications

The script transforms numeric IDs to external_user_id references for Replit Auth compatibility.

## Troubleshooting

### "Could not find table X in schema cache"
This error means the table doesn't exist in Supabase yet. Run `supabase-schema.sql`.

### RLS Policy Errors
If you get "new row violates row-level security policy" errors:
1. Check that the user is authenticated
2. Verify the RLS policy allows the action for the user's role
3. Use service role key for admin operations

### UUID Type Mismatches
The frontend has been updated to handle IDs as strings for UUID compatibility. If you see type errors related to IDs, ensure:
1. All ID columns in Supabase are UUID type
2. Frontend components use `String(id)` when passing legacy numeric IDs
