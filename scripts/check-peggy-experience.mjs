/** Isolated frontend fixtures. No request is sent to Peggy or a live intake. */
import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright-core';
process.env.APP_ENV = 'preview';
process.env.SITE_INDEXABLE = 'false';
process.env.DATABASE_URL = '';
const { default: app } = await import('../server.mjs');
const server = app.listen(0, '127.0.0.1');
await new Promise(resolve => server.once('listening', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
const out = process.env.PEGGY_SCREENSHOT_DIR || '/tmp/pegasus-peggy-qa';
await mkdir(out, { recursive: true });
const axe = await readFile(new URL('../node_modules/axe-core/axe.min.js', import.meta.url), 'utf8');
const results = [];
let browser;
async function check(page, key, state) {
  await page.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].filter(image => image.getBoundingClientRect().top < innerHeight).map(image => image.decode().catch(() => {}))); await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))); });
  const geometry = await page.evaluate(() => {
    const panel = document.querySelector('.peggy-panel').getBoundingClientRect();
    const compose = document.querySelector('.peggy-input').getBoundingClientRect();
    const close = document.querySelector('.peggy-close').getBoundingClientRect();
    const privacy = document.querySelector('.peggy-disclosure').getBoundingClientRect();
    return { overflow: document.documentElement.scrollWidth > innerWidth + 1, inside: panel.top >= 0 && panel.bottom <= innerHeight + 1, composer: compose.top >= panel.top && compose.bottom <= panel.bottom, close: close.top >= 0 && close.bottom <= innerHeight, privacy: privacy.top >= panel.top && privacy.bottom <= panel.bottom };
  });
  assert.deepEqual(geometry, { overflow: false, inside: true, composer: true, close: true, privacy: true }, `${key}/${state}: geometry`);
  await page.addScriptTag({ content: axe });
  const violations = await page.evaluate(async () => (await axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] } })).violations.map(item => ({ id: item.id, targets: item.nodes.map(node => node.target) })));
  const screenshot = `${key}-${state}.png`;
  await page.screenshot({ path: path.join(out, screenshot) });
  assert.deepEqual(violations, [], `${key}/${state}: accessibility`);
  results.push({ key, state, screenshot, axeViolations: 0, ...geometry });
}
async function openPeggy(page) {
  const launcher = page.getByRole('button', { name: 'Talk to Peggy, the Pegasus intake concierge', exact: true });
  if (await launcher.isVisible()) await launcher.click();
  else {
    await page.getByRole('button', { name: 'Open menu', exact: true }).click();
    await page.getByRole('button', { name: 'Talk to Peggy', exact: true }).click();
  }
  await page.getByRole('dialog', { name: 'Peggy, the Pegasus intake concierge', exact: true }).waitFor();
}
try {

  for (const width of [320, 390, 768, 1440]) for (const theme of ['light', 'dark']) {
    const key = `${width}-${theme}`;
    browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || chromium.executablePath(), headless: true, ignoreDefaultArgs: ['--enable-unsafe-swiftshader'], args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu', '--disable-software-rasterizer', '--single-process', '--no-zygote'] });
    const context = await browser.newContext({ viewport: { width, height: width < 768 ? 844 : 1000 }, reducedMotion: 'reduce' });
    let mode = 'success';
    let posts = 0;
    let conversationId = 0;
    let releasePending;
    const errors = [];
    await context.route('**/*', async route => {
      const request = route.request();
      const url = new URL(request.url());
      if (url.origin !== origin) return route.abort();
      if (request.method() !== 'POST') return route.continue();
      posts += 1;
      if (url.pathname === '/api/peggy/conversations') return route.fulfill({ json: { id: ++conversationId, accessToken: `synthetic-${conversationId}` } });
      if (url.pathname === '/api/peggy/chat') {
        if (mode === 'pending') await new Promise(resolve => { releasePending = resolve; });
        if (mode === 'error') return route.fulfill({ status: 503, json: { message: 'Synthetic unavailable service' } });
        return route.fulfill({ json: { response: 'Synthetic QA response. You can organize the property facts before choosing a public path. What is the main question you want to clarify?' } });
      }
      throw new Error(`Unexpected write ${url.pathname}`);
    });
    await context.addInitScript(theme => {
      if (!location.search.includes('cookies=pending')) localStorage.setItem('pegasus-cookie-consent', JSON.stringify({ essential: true, analytics: false, marketing: false, decidedAt: '2026-01-01T00:00:00.000Z' }));
      localStorage.setItem('pegasus-ui-theme', theme);
    }, theme);
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(`${origin}/peggy`);
    await openPeggy(page);
    const dialog = page.getByRole('dialog', { name: 'Peggy, the Pegasus intake concierge', exact: true });
    const input = dialog.getByRole('textbox', { name: 'Talk to Peggy', exact: true });
    await check(page, key, 'welcome');
    await dialog.getByRole('button', { name: 'I want to sell a property', exact: true }).click();
    await dialog.getByRole('button', { name: 'I inherited a house and I am not sure what to do with it', exact: true }).click();
    assert.equal(posts, 0, 'Selecting a suggested question must not send');
    assert.equal(await input.inputValue(), 'I inherited a house and I am not sure what to do with it');
    await check(page, key, 'review-question');
    mode = 'pending';
    await dialog.getByRole('button', { name: 'Send', exact: true }).click();
    await page.waitForFunction(() => document.querySelector('.peggy-pending'));
    await check(page, key, 'pending');
    const postsBeforeStop = posts;
    await dialog.getByRole('button', { name: 'Stop waiting', exact: true }).click();
    mode = 'error';
    releasePending?.();
    await dialog.getByText(/Your message may already have been processed/).waitFor();
    assert.equal(posts, postsBeforeStop, 'Stopping must not submit the restored draft');
    assert.equal(await input.inputValue(), 'I inherited a house and I am not sure what to do with it');
    await dialog.getByRole('button', { name: 'Send', exact: true }).click();
    await dialog.getByText(/I can’t reach the chat service/).waitFor();
    await check(page, key, 'recovery');
    mode = 'success';
    await input.fill('Synthetic QA question: help me prepare the next question.');
    await dialog.getByRole('button', { name: 'Send', exact: true }).click();
    await dialog.getByText(/^Synthetic QA response/).waitFor();
    await dialog.getByRole('button', { name: 'Save this conversation', exact: true }).click();
    assert.match(await dialog.innerText(), /Saved on this device/);
    await check(page, key, 'conversation-fixture');
    await dialog.getByRole('button', { name: 'New chat', exact: true }).click();
    await dialog.getByRole('button', { name: 'Start fresh', exact: true }).click();
    await dialog.getByText('First, who am I helping?', { exact: true }).waitFor();
    assert.equal(await input.inputValue(), '');
    await dialog.getByText('First, who am I helping?', { exact: true }).waitFor();
    if (width < 768 && theme === 'light') {
      await page.setViewportSize({ width, height: 420 });
      await check(page, key, 'short-viewport');
      await page.setViewportSize({ width, height: 844 });
      await page.evaluate(() => localStorage.removeItem('pegasus-cookie-consent'));
      await page.goto(`${origin}/peggy?cookies=pending`);
      await page.locator('.pg-cookie-visible').waitFor();
      await openPeggy(page);
      await check(page, key, 'cookie-visible');
      await page.setViewportSize({ width, height: 420 });
      await check(page, key, 'cookie-short-viewport');
    }
    assert.deepEqual(errors, [], `${key}: JavaScript errors`);
    await context.close();
    await browser.close();
    console.log(`${key}: welcome, edited prompt, waiting, recovery, saved conversation and reset passed`);
  }
  await writeFile(path.join(out, 'results.json'), JSON.stringify({ source: process.env.TESTED_SOURCE_SHA || 'local working tree', serviceMode: 'intercepted synthetic fixtures, no live AI or intake', checks: results.length, results }, null, 2));
} finally { await browser?.close(); await new Promise(resolve => server.close(resolve)); }
