-- Persist the server-known consent copy and capture time for canonical public
-- opportunity submissions. Existing records remain nullable by design.
ALTER TABLE IF EXISTS opportunities
  ADD COLUMN IF NOT EXISTS consent_copy_version varchar(80),
  ADD COLUMN IF NOT EXISTS consent_captured_at timestamp;
