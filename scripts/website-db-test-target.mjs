/**
 * The harness never loads .env or falls back to application DATABASE_URL.
 * All query options are rejected because pg URLs can override the host/database.
 * @param {string | undefined} value
 * @returns {string}
 */
export function assertWebsiteTestTarget(value) {
  let url;
  try { url = new URL(value ?? ''); } catch { throw new Error('An explicit isolated WEBSITE_TEST_DATABASE_URL is required'); }
  if (!['postgres:', 'postgresql:'].includes(url.protocol)
    || !['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname)
    || url.pathname !== '/website_integration_test'
    || url.username !== 'website_test_admin'
    || !url.password || !url.port || url.search || url.hash) {
    throw new Error('Refusing non-isolated website test target: use the disposable loopback website_integration_test database and website_test_admin role without URL options');
  }
  return /** @type {string} */ (value);
}
