-- Read-only Supabase launch inventory.
-- Run against project knfmdyufodbnqsgkzhqw before applying hardening SQL.
-- This file changes no data, grants, policies, functions, or settings.
-- Review results inside the secured dashboard; function definitions can contain
-- sensitive implementation details and must not be pasted into public issues.

SELECT
  current_database(),
  current_user,
  version(),
  current_setting('pgrst.db_schemas', true) AS configured_data_api_schemas;

-- Supabase Dashboard -> API Settings is authoritative for the exposed schema
-- list. The catalog queries below inventory every non-system schema so a custom
-- exposed schema cannot be silently missed when pgrst.db_schemas is unavailable.
SELECT
  n.nspname AS schema_name,
  pg_get_userbyid(n.nspowner) AS owner,
  has_schema_privilege('anon', n.oid, 'USAGE') AS anon_usage,
  has_schema_privilege('authenticated', n.oid, 'USAGE') AS authenticated_usage,
  has_schema_privilege('service_role', n.oid, 'USAGE') AS service_role_usage
FROM pg_namespace n
WHERE n.nspname <> 'information_schema'
  AND n.nspname NOT LIKE 'pg_%'
ORDER BY n.nspname;

SELECT
  n.nspname AS schema_name,
  c.relname AS table_name,
  c.relrowsecurity AS rls_enabled,
  c.relforcerowsecurity AS force_rls,
  has_table_privilege('anon', c.oid, 'SELECT') AS anon_select,
  has_table_privilege('anon', c.oid, 'INSERT') AS anon_insert,
  has_table_privilege('anon', c.oid, 'UPDATE') AS anon_update,
  has_table_privilege('anon', c.oid, 'DELETE') AS anon_delete,
  has_table_privilege('authenticated', c.oid, 'SELECT') AS authenticated_select,
  has_table_privilege('authenticated', c.oid, 'INSERT') AS authenticated_insert,
  has_table_privilege('authenticated', c.oid, 'UPDATE') AS authenticated_update,
  has_table_privilege('authenticated', c.oid, 'DELETE') AS authenticated_delete,
  has_table_privilege('service_role', c.oid, 'SELECT') AS service_select,
  has_table_privilege('service_role', c.oid, 'INSERT') AS service_insert,
  has_table_privilege('service_role', c.oid, 'UPDATE') AS service_update,
  has_table_privilege('service_role', c.oid, 'DELETE') AS service_delete
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname <> 'information_schema'
  AND n.nspname NOT LIKE 'pg_%'
  AND c.relkind IN ('r', 'p')
ORDER BY n.nspname, c.relname;

-- Effective per-column privileges include access inherited from PUBLIC or from
-- another role. This catches column-only grants that table privilege checks miss.
SELECT
  n.nspname AS schema_name,
  c.relname AS table_name,
  a.attname AS column_name,
  has_column_privilege('anon', c.oid, a.attnum, 'SELECT') AS anon_select,
  has_column_privilege('anon', c.oid, a.attnum, 'INSERT') AS anon_insert,
  has_column_privilege('anon', c.oid, a.attnum, 'UPDATE') AS anon_update,
  has_column_privilege('authenticated', c.oid, a.attnum, 'SELECT') AS authenticated_select,
  has_column_privilege('authenticated', c.oid, a.attnum, 'INSERT') AS authenticated_insert,
  has_column_privilege('authenticated', c.oid, a.attnum, 'UPDATE') AS authenticated_update
FROM pg_attribute a
JOIN pg_class c ON c.oid = a.attrelid
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname <> 'information_schema'
  AND n.nspname NOT LIKE 'pg_%'
  AND c.relkind IN ('r', 'p', 'v', 'm')
  AND a.attnum > 0
  AND NOT a.attisdropped
  AND (
    has_column_privilege('anon', c.oid, a.attnum, 'SELECT')
    OR has_column_privilege('anon', c.oid, a.attnum, 'INSERT')
    OR has_column_privilege('anon', c.oid, a.attnum, 'UPDATE')
    OR has_column_privilege('authenticated', c.oid, a.attnum, 'SELECT')
    OR has_column_privilege('authenticated', c.oid, a.attnum, 'INSERT')
    OR has_column_privilege('authenticated', c.oid, a.attnum, 'UPDATE')
  )
ORDER BY n.nspname, c.relname, a.attnum;

SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname <> 'information_schema'
  AND schemaname NOT LIKE 'pg_%'
ORDER BY schemaname, tablename, policyname;

SELECT
  count(*) FILTER (
    WHERE policyname ILIKE '%service%role%'
      AND NOT (roles @> ARRAY['service_role']::name[])
  ) AS mis_scoped_service_policies,
  count(*) FILTER (
    WHERE coalesce(qual, '') ~*
      'external_[a-z_]*id[[:space:]]+is[[:space:]]+not[[:space:]]+null'
       OR coalesce(with_check, '') ~*
      'external_[a-z_]*id[[:space:]]+is[[:space:]]+not[[:space:]]+null'
  ) AS unsafe_external_id_ownership
FROM pg_policies
WHERE schemaname <> 'information_schema'
  AND schemaname NOT LIKE 'pg_%';

-- BYPASSRLS does not grant object privileges. Confirm the service role can use
-- every sequence needed by inserts as well as all required table operations.
SELECT
  n.nspname AS schema_name,
  c.relname AS sequence_name,
  has_sequence_privilege('service_role', c.oid, 'USAGE') AS service_usage,
  has_sequence_privilege('service_role', c.oid, 'SELECT') AS service_select,
  has_sequence_privilege('service_role', c.oid, 'UPDATE') AS service_update
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname <> 'information_schema'
  AND n.nspname NOT LIKE 'pg_%'
  AND c.relkind = 'S'
ORDER BY n.nspname, c.relname;

-- Effective function checks include PUBLIC and inherited role grants. PUBLIC
-- execute is derived from the ACL, including PostgreSQL's built-in default.
SELECT
  n.nspname AS schema_name,
  p.proname AS function_name,
  pg_get_function_identity_arguments(p.oid) AS arguments,
  pg_get_userbyid(p.proowner) AS owner,
  p.proconfig AS function_settings,
  EXISTS (
    SELECT 1
    FROM aclexplode(coalesce(p.proacl, acldefault('f', p.proowner))) acl
    WHERE acl.grantee = 0
      AND acl.privilege_type = 'EXECUTE'
  ) AS public_execute,
  has_function_privilege('anon', p.oid, 'EXECUTE') AS anon_execute,
  has_function_privilege('authenticated', p.oid, 'EXECUTE') AS authenticated_execute,
  pg_get_functiondef(p.oid) AS definition_for_private_review
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname <> 'information_schema'
  AND n.nspname NOT LIKE 'pg_%'
  AND p.prosecdef
ORDER BY n.nspname, p.proname, arguments;

SELECT
  n.nspname AS schema_name,
  c.relname AS view_name,
  c.relkind,
  coalesce(c.reloptions @> ARRAY['security_invoker=true'], false) AS security_invoker,
  has_table_privilege('anon', c.oid, 'SELECT') AS anon_select,
  has_table_privilege('authenticated', c.oid, 'SELECT') AS authenticated_select
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname <> 'information_schema'
  AND n.nspname NOT LIKE 'pg_%'
  AND c.relkind IN ('v', 'm')
ORDER BY n.nspname, c.relname;

-- Global effective defaults. An absent pg_default_acl row still means functions
-- default to PUBLIC EXECUTE, which acldefault('f', owner) exposes here.
WITH creator_roles AS (
  SELECT DISTINCT owner_oid
  FROM (
    SELECT c.relowner AS owner_oid
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname <> 'information_schema' AND n.nspname NOT LIKE 'pg_%'
    UNION
    SELECT p.proowner
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname <> 'information_schema' AND n.nspname NOT LIKE 'pg_%'
  ) owners
), object_types(object_type, label) AS (
  VALUES
    ('r'::"char", 'tables'),
    ('S'::"char", 'sequences'),
    ('f'::"char", 'functions'),
    ('T'::"char", 'types'),
    ('n'::"char", 'schemas')
)
SELECT
  r.rolname AS creator_role,
  t.label AS object_type,
  coalesce(d.defaclacl, acldefault(t.object_type, r.oid))::text AS effective_global_default_acl
FROM creator_roles cr
JOIN pg_roles r ON r.oid = cr.owner_oid
CROSS JOIN object_types t
LEFT JOIN pg_default_acl d
  ON d.defaclrole = r.oid
 AND d.defaclnamespace = 0
 AND d.defaclobjtype = t.object_type
ORDER BY r.rolname, t.label;

-- Schema-specific default ACL entries add to the global defaults above; they do
-- not revoke a global PUBLIC grant. Remediation for future functions therefore
-- needs ALTER DEFAULT PRIVILEGES FOR ROLE <creator> REVOKE EXECUTE ON FUNCTIONS
-- FROM PUBLIC without an IN SCHEMA clause, plus explicit revokes on existing
-- functions after their callers and internal authorization checks are reviewed.
SELECT
  pg_get_userbyid(d.defaclrole) AS creator_role,
  n.nspname AS schema_name,
  d.defaclobjtype,
  d.defaclacl::text AS schema_specific_default_acl_addition
FROM pg_default_acl d
JOIN pg_namespace n ON n.oid = d.defaclnamespace
ORDER BY creator_role, schema_name, d.defaclobjtype;
