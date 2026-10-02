/** Synthetic local journey. Never sends an inquiry or an AI message. */
import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright-core';
process.env.APP_ENV = 'preview';
process.env.SITE_INDEXABLE = 'false';
// Explicit browsing-preview fixture: no live database or AI service is exercised.
process.env.DATABASE_URL = '';
const { default: app } = await import('../server.mjs');
const server = app.listen(0, '127.0.0.1');
await new Promise(resolve => server.once('listening', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
const out = process.env.ELEVATION_SCREENSHOT_DIR || '/tmp/pegasus-elevation-qa';
await mkdir(out, { recursive: true });
let browser;
const axe = await readFile(new URL('../node_modules/axe-core/axe.min.js', import.meta.url), 'utf8');
const results = [];
async function ready(page) {
  await page.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].filter(img => img.loading !== 'lazy' || img.getBoundingClientRect().top < innerHeight).map(img => img.decode().catch(() => {}))); await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))); });
}
async function check(page, name, key) {
  await ready(page);
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${key}/${name}: horizontal overflow`);
  await page.addScriptTag({ content: axe });
  const violations = await page.evaluate(async () => (await axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] } })).violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => n.target) })));
  const filename = `${key}-${name}.png`;
  await page.screenshot({ path: path.join(out, filename) });
  assert.deepEqual(violations, [], `${key}/${name}: accessibility`);
  results.push({ key, state: name, screenshot: filename, overflow: false, axeViolations: 0 });
}
try {
  for (const width of [320, 390, 768, 1440]) for (const theme of ['light', 'dark']) {
    const key = `${width}-${theme}`;
    browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || chromium.executablePath(), headless: true, ignoreDefaultArgs: ['--enable-unsafe-swiftshader'], args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu', '--disable-software-rasterizer', '--single-process', '--no-zygote'] });
    const context = await browser.newContext({ viewport: { width, height: width < 768 ? 844 : 1000 }, reducedMotion: 'reduce' });
    const posts = [], errors = [];
    await context.route('**/*', route => {
      const request = route.request();
      if (request.method() === 'POST') { posts.push(request.url()); return route.abort(); }
      return new URL(request.url()).origin === origin ? route.continue() : route.abort();
    });
    await context.addInitScript(theme => {
      localStorage.setItem('pegasus-cookie-consent', JSON.stringify({ essential: true, analytics: false, marketing: false, decidedAt: '2026-01-01T00:00:00.000Z' }));
      localStorage.setItem('pegasus-ui-theme', theme);
    }, theme);
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(`${origin}/property-owners?owner_situation=Inherited%20property`);
    await page.getByRole('link', { name: 'Explore the numbers first' }).click();
    const review = page.getByRole('region', { name: 'Review owner context' });
    await review.waitFor();
    assert.match(await review.innerText(), /Inherited property/);
    await check(page, 'owner-context', key);
    await page.getByRole('button', { name: 'Use this situation', exact: true }).click();
    for (const [label, value] of [['Acquisition or current basis', '600000'], ['Scope / improvement budget', '105000'], ['Projected exit value', '840000'], ['Projected monthly market rent', '4500'], ['Property address or city', 'Synthetic QA property']]) await page.getByRole('textbox', { name: label, exact: true }).fill(value);
    await page.getByRole('button', { name: 'Scenarios', exact: true }).click();
    const preview = page.getByRole('region', { name: 'What changes if…' });
    await preview.getByRole('textbox').fill('125000');
    assert.match(await preview.innerText(), /\$293,000/);
    assert(!(await page.getByRole('table', { name: 'Scenario results', exact: true }).innerText()).includes('$293,000'));
    await page.evaluate(() => scrollTo(0, document.querySelector('.id-whatif').getBoundingClientRect().top + scrollY - 110));
    await check(page, 'what-if', key);
    await preview.getByRole('button', { name: 'Apply preview', exact: true }).click();
    assert.match(await page.getByRole('table', { name: 'Scenario results', exact: true }).innerText(), /\$293,000/);
    await page.getByRole('button', { name: 'Use Conservative for brief', exact: true }).click();
    await page.getByRole('button', { name: 'Memo', exact: true }).click();
    assert.match(await page.getByRole('region', { name: 'Decision brief', exact: true }).innerText(), /Inherited property/);
    assert.match(await page.getByRole('region', { name: 'Decision brief', exact: true }).innerText(), /\$293,000/);
    await check(page, 'brief', key);
    await page.getByRole('button', { name: 'Prepare my inquiry', exact: true }).click();
    const draft = page.getByRole('textbox', { name: 'Talk to Peggy', exact: true });
    await page.waitForFunction(() => document.querySelector('textarea[aria-label="Talk to Peggy"]')?.value.includes('Conservative'));
    assert.match(await draft.inputValue(), /Conservative/);
    assert.match(await draft.inputValue(), /Inherited property/);
    assert.equal(posts.length, 0, 'Opening Peggy must not send');
    await check(page, 'peggy-review', key);
    await page.getByRole('dialog', { name: 'Peggy, the Pegasus intake concierge' }).getByRole('button', { name: 'Close', exact: true }).click();
    await page.getByRole('button', { name: 'Continue with this property', exact: true }).click();
    assert.equal(await page.getByLabel('Property address').inputValue(), 'Synthetic QA property');
    await page.getByRole('button', { name: 'Continue', exact: true }).click();
    await page.getByRole('button', { name: 'Continue', exact: true }).click();
    await page.getByRole('button', { name: /^Not sure/ }).click();
    await page.getByRole('button', { name: 'Continue', exact: true }).click();
    assert.match(await page.locator('.intake-lab-review').innerText(), /Conservative/);
    assert.match(await page.locator('.intake-lab-review').innerText(), /\$125,000/);
    await check(page, 'inquiry-review', key);
    await page.goBack();
    await page.getByRole('button', { name: 'Memo', exact: true }).click();
    assert.match(await page.getByRole('region', { name: 'Decision brief', exact: true }).innerText(), /\$293,000/);
    await page.goForward();
    assert.equal(await page.getByLabel('Property address').inputValue(), 'Synthetic QA property');
    await page.goto(`${origin}/projects/nelson-dr`);
    await page.getByRole('button', { name: 'See what changed in the kitchen' }).click();
    await page.getByRole('button', { name: '3 Statement hood', exact: true }).click();
    await page.locator('.ow-pair').first().scrollIntoViewIfNeeded();
    await check(page, 'photo-inspection', key);
    assert.deepEqual(errors, [], `${key}: JavaScript errors`);
    assert.deepEqual(posts, [], `${key}: unexpected submission`);
    await context.close();
    await browser.close();
    console.log(`${key}: owner → Lab → preview → brief → Peggy review → inquiry → Back/Forward → photo inspection passed`);
  }
  await writeFile(path.join(out, 'results.json'), JSON.stringify({ source: 'local working tree', contexts: 8, checks: results.length, results }, null, 2));
} finally { await browser?.close(); await new Promise(resolve => server.close(resolve)); }
