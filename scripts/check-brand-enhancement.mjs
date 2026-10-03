/** Focused rendered acceptance for the October 3 public-experience pass. No live writes. */
import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { chromium } from 'playwright-core';
process.env.APP_ENV = 'preview'; process.env.SITE_INDEXABLE = 'false'; process.env.DATABASE_URL = '';
const { default: app } = await import('../server.mjs');
const server = app.listen(0, '127.0.0.1');
await new Promise(resolve => server.once('listening', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
const out = process.env.BRAND_SCREENSHOT_DIR || '/tmp/pegasus-brand-qa';
await mkdir(out, { recursive: true });
const axe = await readFile(new URL('../node_modules/axe-core/axe.min.js', import.meta.url), 'utf8');
const sourceSha = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
const sourceDirty = Boolean(execFileSync('git', ['status', '--porcelain'], { encoding: 'utf8' }).trim());
const buildSha256 = createHash('sha256').update(await readFile(new URL('../dist/public/index.html', import.meta.url))).digest('hex');
const results = []; let browser;
async function capture(page, key, state) {
  await page.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].filter(img => { const r = img.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight; }).map(img => img.decode().catch(() => {}))); await Promise.all(document.getAnimations().filter(animation => animation.effect?.getComputedTiming().iterations !== Infinity).map(animation => animation.finished.catch(() => {}))); await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))); });
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${key}/${state}: overflow`);
  await page.addScriptTag({ content: axe });
  const violations = await page.evaluate(async () => (await axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] } })).violations.map(v => ({ id: v.id, targets: v.nodes.map(n => n.target) })));
  const screenshot = `${key}-${state}.png`; await page.screenshot({ path: path.join(out, screenshot) });
  assert.deepEqual(violations, [], `${key}/${state}: accessibility`);
  results.push({ key, state, screenshot, axeViolations: 0, overflow: false });
}
try {
 for (const width of process.env.BRAND_WIDTH ? [Number(process.env.BRAND_WIDTH)] : [320,390,768,1440]) for (const theme of ['light','dark']) {
  const key = `${width}-${theme}`;
  browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || chromium.executablePath(), headless: true });
  const context = await browser.newContext({ viewport: { width, height: width < 768 ? 844 : 960 }, reducedMotion: 'reduce' });
  const writes = [], errors = [];
  await context.route('**/*', route => { if (route.request().method() !== 'GET') { writes.push(route.request().url()); return route.abort(); } return new URL(route.request().url()).origin === origin ? route.continue() : route.abort(); });
  await context.addInitScript(theme => { localStorage.setItem('pegasus-ui-theme', theme); localStorage.setItem('pegasus-cookie-consent', JSON.stringify({ essential: true, analytics: false, marketing: false, decidedAt: '2026-01-01T00:00:00.000Z' })); }, theme);
  const page = await context.newPage(); page.on('pageerror', error => errors.push(error.message));
  // HTTP aliases retain attribution and old section links; destination focus is meaningful.
  for (const [alias, canonical, hash, name] of [['/projects','/our-work','#published-work','From dated interiors to a coherent home.'], ['/case-study','/projects/nelson-dr','#case-record','The available financial record.']]) {
    await page.goto(`${origin}${alias}?ref=legacy${hash}`);
    await page.waitForURL(url => url.pathname === canonical && url.searchParams.get('ref') === 'legacy' && url.hash === hash);
    const target = page.locator(hash); await target.waitFor();
    await page.waitForFunction(hash => document.activeElement?.id === hash.slice(1), hash);
    assert.equal(await target.getAttribute('aria-hidden'), null);
    if (canonical === '/our-work') assert.notEqual(await page.locator('#project-lessons').evaluate(element => getComputedStyle(element).maxWidth), 'none', 'legacy anchor preserves heading measure');
    assert((await target.textContent()).includes(name));
    await page.waitForFunction(() => document.querySelector('.journey-wayfinder'));
    assert(await target.evaluate(element => element.getBoundingClientRect().top >= document.querySelector('.journey-wayfinder').getBoundingClientRect().bottom), 'legacy heading clears sticky guide');
    await capture(page, key, `legacy-${alias.slice(1)}`);
  }
  // A real in-app history change uses the SPA alias rather than the HTTP path.
  await page.goto(`${origin}/about`); await page.locator('.ep-opening h1').waitFor();
  await page.evaluate(() => history.pushState({}, '', '/projects?ref=spa#published-work'));
  await page.waitForURL(url => url.pathname === '/our-work' && url.searchParams.get('ref') === 'spa' && url.hash === '#published-work');
  await page.waitForFunction(() => document.activeElement?.id === 'published-work');
  await page.goBack(); await page.waitForURL(url => url.pathname === '/about');
  await page.goForward(); await page.waitForURL(url => url.pathname === '/our-work' && url.hash === '#published-work');
  await page.goBack(); await page.waitForURL(url => url.pathname === '/about');
  // Existing film is discoverable and remains user-controlled.
  const filmLink = page.getByRole('link', { name: 'Watch the architectural concept film', exact: true });
  await filmLink.scrollIntoViewIfNeeded(); await capture(page, key, 'about-film-invitation');
  await filmLink.click(); await page.waitForURL('**/pegasus-standard#architectural-film');
  const video = page.locator('#architectural-film video'); await video.waitFor();
  assert.equal(await video.getAttribute('controls'), ''); assert.equal(await video.getAttribute('autoplay'), null);
  await capture(page, key, 'concept-film');
  // Establish a synthetic saved draft through the actual workspace controls.
  await page.goto(`${origin}/strategy-lab`); await page.getByRole('button', { name: 'Load illustrative example', exact: true }).click();
  await page.getByRole('button', { name: 'Assumptions', exact: true }).click();
  await page.getByRole('textbox', { name: 'Scope / improvement budget', exact: true }).fill('125000');
  await page.getByRole('button', { name: 'Save locally', exact: true }).click();
  const saved = await page.evaluate(() => localStorage.getItem('pegasus.strategy-lab.v4'));
  assert(saved, 'saved synthetic draft');
  await page.goto(origin + '/'); await page.locator('#home-tool-title').scrollIntoViewIfNeeded(); await page.locator('[data-testid="opportunity-plan"]').waitFor();
  const chooser = page.getByRole('button', { name: /Choose a planning question/ });
  if (await chooser.isVisible()) await chooser.click(); else await page.getByRole('button', { name: 'More planning questions', exact: true }).click();
  await page.getByRole('button', { name: 'What would funding require?', exact: true }).click();
  await page.getByRole('link', { name: 'Model the assumptions', exact: true }).click();
  await page.waitForURL('**/strategy-lab?question=funding');
  assert.equal(await page.getByRole('button', { name: 'Assumptions', exact: true }).getAttribute('aria-current'), 'page');
  assert.equal(await page.getByRole('textbox', { name: 'Scope / improvement budget', exact: true }).inputValue(), '125000');
  assert.equal(await page.evaluate(() => localStorage.getItem('pegasus.strategy-lab.v4')), saved);
  await page.locator('.id-planning-question').scrollIntoViewIfNeeded(); await capture(page, key, 'funding-context');
  await page.getByRole('button', { name: 'Overview', exact: true }).click();
  const cash = page.getByRole('region', { name: 'Key economics', exact: true });
  await cash.scrollIntoViewIfNeeded(); assert((await cash.textContent()).includes('$293,000'));
  assert.equal(await page.locator('.id-listing-comparison').getAttribute('open'), null);
  await capture(page, key, 'cash-first-overview');
  await page.locator('.id-listing-comparison summary').click();
  assert((await page.locator('.id-listing-comparison').textContent()).includes('not profit, an offer, or a return'));
  await capture(page, key, 'listing-explanation');
  await page.reload(); assert.equal(await page.getByRole('button', { name: 'Overview', exact: true }).getAttribute('aria-current'), 'page');
  // The primary service openings and original proof remain clear at each width/theme.
  for (const route of ['/deal-partners','/buyers','/development','/our-work']) {
    await page.goto(origin + route); await page.locator('.ep-opening h1').waitFor(); await capture(page, key, route.slice(1));
  }
  // When an inline guide is wholly visible, persistent invitations yield to it.
  const invitation = page.locator('[data-peggy-invitation]').first();
  await invitation.evaluate(element => element.scrollIntoView({ block: 'center' }));
  await page.waitForFunction(() => document.querySelector('.peggy-fab')?.hasAttribute('hidden'));
  assert.equal(await page.locator('.journey-wayfinder-ask:visible').count(), 0);
  await invitation.click(); await page.locator('.peggy-tour,.peggy-panel.is-open').first().waitFor();
  if (await page.locator('.peggy-tour').isVisible()) await page.getByRole('button', { name: 'End page tour', exact: true }).click();
  else await page.locator('.peggy-panel').getByRole('button', { name: 'Close', exact: true }).click();
  assert.deepEqual(writes, [], `${key}: no write attempts`); assert.deepEqual(errors, [], `${key}: no runtime errors`);
  await browser.close(); browser = undefined;
 }
 await writeFile(path.join(out, 'results.json'), JSON.stringify({ sourceSha, sourceDirty, buildSha256, checks: results.length, results, noLiveWrites: true }, null, 2));
 console.log(JSON.stringify({ checks: results.length, output: out }));
} finally { if (browser) await browser.close(); server.closeAllConnections?.(); await new Promise(resolve => server.close(resolve)); }
