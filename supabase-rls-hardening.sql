-- Pegasus Supabase RLS hardening
--
-- Apply this to an existing Pegasus Supabase project before staging or
-- production traffic. It replaces legacy policies whose names implied
-- service-role access but whose missing TO clauses made them PUBLIC.

BEGIN;

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_reputation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seller_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wholesale_deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.capital_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jv_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.capital_commitments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buyer_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Service role can insert profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Badges are viewable by everyone" ON public.user_badges;
DROP POLICY IF EXISTS "Service role can manage badges" ON public.user_badges;
DROP POLICY IF EXISTS "Reputation is viewable by everyone" ON public.user_reputation;
DROP POLICY IF EXISTS "Service role can manage reputation" ON public.user_reputation;
DROP POLICY IF EXISTS "Anyone can submit seller lead" ON public.seller_leads;
DROP POLICY IF EXISTS "Service role can manage seller leads" ON public.seller_leads;
DROP POLICY IF EXISTS "Public deals are viewable" ON public.wholesale_deals;
DROP POLICY IF EXISTS "Wholesalers can insert own deals" ON public.wholesale_deals;
DROP POLICY IF EXISTS "Wholesalers can update own deals" ON public.wholesale_deals;
DROP POLICY IF EXISTS "Service role can manage all deals" ON public.wholesale_deals;
DROP POLICY IF EXISTS "Users can view own saved items" ON public.saved_items;
DROP POLICY IF EXISTS "Users can insert own saved items" ON public.saved_items;
DROP POLICY IF EXISTS "Users can delete own saved items" ON public.saved_items;
DROP POLICY IF EXISTS "Public projects are viewable" ON public.capital_projects;
DROP POLICY IF EXISTS "Owners can insert projects" ON public.capital_projects;
DROP POLICY IF EXISTS "Owners can update projects" ON public.capital_projects;
DROP POLICY IF EXISTS "Users can view own JV requests" ON public.jv_requests;
DROP POLICY IF EXISTS "Users can insert JV requests" ON public.jv_requests;
DROP POLICY IF EXISTS "Participants can update JV requests" ON public.jv_requests;
DROP POLICY IF EXISTS "Service role can manage JV requests" ON public.jv_requests;
DROP POLICY IF EXISTS "Users can view own commitments" ON public.capital_commitments;
DROP POLICY IF EXISTS "Investors can insert commitments" ON public.capital_commitments;
DROP POLICY IF EXISTS "Investors can update own commitments" ON public.capital_commitments;
DROP POLICY IF EXISTS "Service role can manage capital commitments" ON public.capital_commitments;
DROP POLICY IF EXISTS "Public listings are viewable" ON public.listings;
DROP POLICY IF EXISTS "Service role can manage listings" ON public.listings;
DROP POLICY IF EXISTS "Users can view related offers" ON public.buyer_offers;
DROP POLICY IF EXISTS "Buyers can insert offers" ON public.buyer_offers;
DROP POLICY IF EXISTS "Buyers can update own offers" ON public.buyer_offers;
DROP POLICY IF EXISTS "Service role can manage buyer offers" ON public.buyer_offers;
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Service role can insert notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;

CREATE POLICY "Profiles are viewable by everyone"
  ON public.user_profiles FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.user_profiles FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Service role can insert profiles"
  ON public.user_profiles FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Badges are viewable by everyone"
  ON public.user_badges FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Service role can manage badges"
  ON public.user_badges FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Reputation is viewable by everyone"
  ON public.user_reputation FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Service role can manage reputation"
  ON public.user_reputation FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can submit seller lead"
  ON public.seller_leads FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can manage seller leads"
  ON public.seller_leads FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public deals are viewable"
  ON public.wholesale_deals FOR SELECT
  TO anon, authenticated
  USING (
    (is_public = true AND status IN ('Approved', 'Listed'))
    OR (SELECT auth.uid()) = wholesaler_id
  );

CREATE POLICY "Wholesalers can insert own deals"
  ON public.wholesale_deals FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT auth.uid()) = wholesaler_id
    AND is_public = false
    AND status = 'Under Review'
  );

CREATE POLICY "Wholesalers can update own deals"
  ON public.wholesale_deals FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = wholesaler_id)
  WITH CHECK (
    (SELECT auth.uid()) = wholesaler_id
    AND is_public = false
    AND status = 'Under Review'
  );

CREATE POLICY "Service role can manage all deals"
  ON public.wholesale_deals FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can view own saved items"
  ON public.saved_items FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can insert own saved items"
  ON public.saved_items FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can delete own saved items"
  ON public.saved_items FOR DELETE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Public projects are viewable"
  ON public.capital_projects FOR SELECT
  TO anon, authenticated
  USING (
    (is_public = true AND status = 'ACTIVE')
    OR (SELECT auth.uid()) = owner_id
  );

CREATE POLICY "Owners can insert projects"
  ON public.capital_projects FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT auth.uid()) = owner_id
    AND is_public = false
  );

CREATE POLICY "Owners can update projects"
  ON public.capital_projects FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = owner_id)
  WITH CHECK (
    (SELECT auth.uid()) = owner_id
    AND is_public = false
  );

CREATE POLICY "Users can view own JV requests"
  ON public.jv_requests FOR SELECT
  TO authenticated
  USING (
    (SELECT auth.uid()) = requester_id
    OR (SELECT auth.uid()) = wholesaler_id
  );

CREATE POLICY "Service role can manage JV requests"
  ON public.jv_requests FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can view own commitments"
  ON public.capital_commitments FOR SELECT
  TO authenticated
  USING (
    (SELECT auth.uid()) = investor_id
    OR (SELECT auth.uid()) IN (
      SELECT owner_id
      FROM public.capital_projects
      WHERE id::text = project_id
    )
  );

CREATE POLICY "Service role can manage capital commitments"
  ON public.capital_commitments FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public listings are viewable"
  ON public.listings FOR SELECT
  TO anon, authenticated
  USING (
    (is_public = true AND status = 'active')
    OR (SELECT auth.uid()) = owner_id
  );

CREATE POLICY "Service role can manage listings"
  ON public.listings FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can view related offers"
  ON public.buyer_offers FOR SELECT
  TO authenticated
  USING (
    (SELECT auth.uid()) = buyer_id
    OR (SELECT auth.uid()) IN (
      SELECT owner_id
      FROM public.listings
      WHERE id::text = listing_id
    )
  );

CREATE POLICY "Service role can manage buyer offers"
  ON public.buyer_offers FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Service role can insert notifications"
  ON public.notifications FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

REVOKE INSERT, UPDATE, DELETE ON public.user_profiles FROM anon;
REVOKE INSERT, DELETE ON public.user_profiles FROM authenticated;
REVOKE UPDATE ON public.user_profiles FROM authenticated;
GRANT UPDATE (
  display_name,
  company_name,
  location,
  avatar_url,
  bio,
  updated_at
) ON public.user_profiles TO authenticated;

REVOKE ALL ON public.user_badges, public.user_reputation, public.seller_leads
  FROM anon, authenticated;
GRANT SELECT ON public.user_badges, public.user_reputation
  TO anon, authenticated;

-- Public marketplace records are served through application DTOs. Revoking
-- direct table reads prevents PostgREST clients from bypassing those DTOs and
-- receiving owner IDs, internal notes, or governance fields.
REVOKE SELECT
  ON public.user_profiles,
     public.wholesale_deals,
     public.capital_projects,
     public.listings
  FROM anon, authenticated;

REVOKE INSERT, UPDATE, DELETE
  ON public.wholesale_deals, public.capital_projects, public.listings
  FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE
  ON public.jv_requests, public.capital_commitments, public.buyer_offers
  FROM anon, authenticated;
REVOKE UPDATE ON public.notifications FROM authenticated;
GRANT UPDATE (is_read) ON public.notifications TO authenticated;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND policyname LIKE 'Service role%'
      AND 'public'::name = ANY (roles)
  ) THEN
    RAISE EXCEPTION 'Unsafe PUBLIC service-role policy remains';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'user_profiles'
      AND policyname = 'Users can update own profile'
      AND COALESCE(qual, '') ILIKE '%external_user_id%is not null%'
  ) THEN
    RAISE EXCEPTION 'Unsafe external-user profile ownership policy remains';
  END IF;
END
$$;

COMMIT;
