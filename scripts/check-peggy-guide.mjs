/** Browser-only page-guide acceptance. All AI responses are intercepted fixtures. */
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
const out = process.env.PEGGY_GUIDE_SCREENSHOT_DIR || '/tmp/pegasus-guide-qa';
await mkdir(out, { recursive: true });
const axe = await readFile(new URL('../node_modules/axe-core/axe.min.js', import.meta.url), 'utf8');
const evidence = [];
const labIntroduction = 'Start with the property facts you know. Compare assumptions, explore scenarios and review the decision brief before choosing what to share.';
const privateLabContext = /Private Canary|Distressed or time-sensitive|Preserve control or optionality|Save locally|Edit property|Clear property|Illustrative example|Synthetic example|\$/;
let browser;
let currentPage;
async function settle(page) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all([...document.images].filter(image => { const box = image.getBoundingClientRect(); return box.bottom > 0 && box.top < innerHeight; }).map(image => image.decode().catch(() => {})));
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  });
}
async function check(page, key, state, tour = false) {
  await settle(page);
  const geometry = await page.evaluate(tour => {
    const root = document.querySelector(tour ? '.peggy-tour' : '.peggy-panel');
    const box = root.getBoundingClientRect();
    return { overflow: document.documentElement.scrollWidth > innerWidth + 1, withinViewport: box.top >= 0 && box.bottom <= innerHeight + 1, controlsFit: [...root.querySelectorAll(tour ? '.peggy-tour-controls,.peggy-tour-ask' : '.peggy-compose-area,.peggy-close')].every(element => { const r = element.getBoundingClientRect(); return r.top >= box.top && r.bottom <= box.bottom && r.right <= box.right; }) };
  }, tour);
  assert.deepEqual(geometry, { overflow: false, withinViewport: true, controlsFit: true }, `${key}/${state}`);
  await page.addScriptTag({ content: axe });
  const violations = await page.evaluate(async () => (await axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] } })).violations.map(item => ({ id: item.id, targets: item.nodes.map(node => node.target) })));
  await page.screenshot({ path: path.join(out, `${key}-${state}.png`) });
  assert.deepEqual(violations, [], `${key}/${state}: accessibility`);
  evidence.push({ key, state, screenshot: `${key}-${state}.png`, ...geometry, axeViolations: 0 });
}
async function openPeggy(page) {
  if (await page.locator('.peggy-fab').isVisible()) await page.locator('.peggy-fab').click();
  else { await page.getByRole('button', { name: 'Open menu', exact: true }).click(); await page.getByRole('button', { name: 'Talk to Peggy', exact: true }).click(); }
  await page.locator('.peggy-panel.is-open').waitFor();
}
try {
  for (const width of process.env.PEGGY_GUIDE_WIDTH ? [Number(process.env.PEGGY_GUIDE_WIDTH)] : [320, 390, 768, 1440]) for (const theme of ['light', 'dark']) {
    const key = `${width}-${theme}`;
    browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || chromium.executablePath(), headless: true, ignoreDefaultArgs: ['--enable-unsafe-swiftshader'], args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu', '--disable-software-rasterizer', '--single-process', '--no-zygote'] });
    const context = await browser.newContext({ viewport: { width, height: width < 768 ? 844 : 1000 }, reducedMotion: 'reduce' });
    const requests = [];
    const errors = [];
    await context.route('**/*', async route => {
      const request = route.request();
      const url = new URL(request.url());
      if (url.origin !== origin) return route.abort();
      if (request.method() !== 'POST') return route.continue();
      requests.push({ path: url.pathname, body: request.postDataJSON() });
      if (url.pathname === '/api/peggy/conversations') return route.fulfill({ json: { id: 900, accessToken: 'synthetic-page-guide' } });
      if (url.pathname === '/api/peggy/chat') return route.fulfill({ json: { response: `Synthetic guide response ${requests.length}. This fixture checks the interface and context, not a live AI answer.` } });
      throw new Error(`Unexpected write: ${url.pathname}`);
    });
    await context.addInitScript(theme => {
      localStorage.setItem('pegasus-cookie-consent', JSON.stringify({ essential: true, analytics: false, marketing: false, decidedAt: '2026-01-01T00:00:00.000Z' }));
      localStorage.setItem('pegasus-ui-theme', theme);
    }, theme);
    const page = await context.newPage();
    currentPage = page;
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(origin);
    await openPeggy(page);
    const panel = page.locator('.peggy-panel');
    const input = panel.getByRole('textbox', { name: 'Talk to Peggy', exact: true });
    await panel.getByRole('button', { name: 'Explain this section', exact: true }).waitFor();
    assert.match(await page.locator('.peggy-location > summary').innerText(), /Home.*Introduction/);
    await check(page, key, 'welcome');
    await page.locator('.peggy-location > summary').click();
    await page.getByRole('navigation', { name: 'Peggy page outline' }).waitFor();
    assert.equal(await page.getByRole('navigation', { name: 'Peggy page outline' }).getByRole('button').count(), 6);
    await check(page, key, 'context-review');
    await page.locator('.peggy-location > summary').click();
    await panel.getByRole('button', { name: /Show me around/ }).click();
    const tour = page.getByRole('complementary', { name: 'Peggy page guide' });
    assert.equal(await tour.getByRole('button', { name: 'Previous section' }).isEnabled(), false);
    await tour.getByRole('button', { name: 'Next section', exact: true }).click();
    assert.equal(await tour.getByRole('heading').innerText(), 'What brings you here?');
    assert.equal(await page.locator('.peggy-tour-target').innerText(), 'What brings you here?');
    assert.equal(requests.length, 0);
    await check(page, key, 'tour', true);
    const detailsToggle = tour.getByRole('button', {name:'Section details and stops'});
    if (await detailsToggle.isVisible()) await detailsToggle.click();
    await tour.getByRole('button', { name: 'Ask about this' }).click();
    await page.waitForFunction(() => document.querySelector('.peggy-input textarea').value.includes('What brings you here?'));
    assert.equal(requests.length, 0);
    await page.waitForFunction(() => document.querySelector('.peggy-location > summary')?.textContent.includes('What brings you here?'));
    await check(page, key, 'prepared-section');
    await page.locator('#home-invitation-title').scrollIntoViewIfNeeded();
    await panel.getByRole('button', { name: 'Send', exact: true }).click();
    await panel.getByText(/^Synthetic guide response/).waitFor();
    assert.equal(requests.at(-1).body.context.currentView.section, 'What brings you here?');
    assert.equal(requests.at(-1).body.context.currentView.path, '/');
    assert.equal(requests[0].body.context.currentView, undefined, 'Conversation creation should not upload page data');
    await check(page, key, 'conversation-fixture');
    await panel.getByRole('button', { name: 'Close', exact: true }).click();
    await page.waitForFunction(() => document.activeElement?.matches('.peggy-fab,button[aria-label="Open menu"]'));
    await page.locator('[data-hv="arrival"]').scrollIntoViewIfNeeded();
    const selected = await page.locator('.experience-intro').evaluate(element => {
      const range = document.createRange(); range.selectNodeContents(element);
      const selection = getSelection(); selection.removeAllRanges(); selection.addRange(range);
      element.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
      return selection.toString();
    });
    await page.getByRole('button', { name: 'Ask Peggy about this', exact: true }).click();
    await page.waitForFunction(() => document.querySelector('.peggy-input textarea').value.includes('selected passage'));
    await check(page, key, 'selected-passage');
    await panel.getByRole('button', { name: 'Send', exact: true }).click();
    await page.waitForFunction(() => !document.querySelector('.peggy-pending'));
    assert.equal(requests.at(-1).body.context.currentView.selection, selected.trim().replace(/\s+/g, ' '));
    await panel.getByRole('checkbox', { name: 'Page context included' }).uncheck();
    await input.fill('Synthetic question without page context.');
    await panel.getByRole('button', { name: 'Send', exact: true }).click();
    await page.waitForFunction(() => !document.querySelector('.peggy-pending'));
    assert.equal(requests.at(-1).body.context.currentView, undefined);
    await page.goto(`${origin}/strategy-lab`);
    await page.getByRole('button', { name: 'Load illustrative example', exact: true }).click();
    await page.getByRole('heading', { name: 'Leading path', exact: true }).waitFor();
    await openPeggy(page);
    await panel.getByRole('button', { name: 'Explain this section', exact: true }).waitFor();
    assert.match(await page.locator('.peggy-location strong').innerText(), /Strategy Lab/);
    await page.waitForFunction(intro => document.querySelector('[data-testid="peggy-local-summary"]')?.textContent === intro, labIntroduction);
    await page.locator('.peggy-location > summary').click();
    assert.doesNotMatch(await panel.locator('.peggy-location-content > p').nth(1).innerText(), privateLabContext);
    await page.locator('.peggy-location > summary').click();
    await check(page, key, 'strategy-lab');
    // Restore a distinctly marked synthetic visitor record, then exercise the
    // same passive guide and explicit Send boundary used by a real saved draft.
    await page.evaluate(() => {
      const fixture = JSON.parse(sessionStorage.getItem('pegasus.strategy-lab.working.v4'));
      Object.assign(fixture.workspace.base, { address: '921 Private Canary Road', city: 'Private Canary Cove', situation: 'Distressed or time-sensitive', objective: 'Preserve control or optionality', illustrative: false });
      localStorage.setItem('pegasus.strategy-lab.v4', JSON.stringify(fixture));
      sessionStorage.removeItem('pegasus.strategy-lab.working.v4');
    });
    await page.reload();
    await page.waitForFunction(() => document.querySelector('.id-property strong')?.textContent === '921 Private Canary Road');
    await openPeggy(page);
    await page.waitForFunction(intro => document.querySelector('[data-testid="peggy-local-summary"]')?.textContent === intro, labIntroduction);
    await page.locator('.id-property strong').evaluate(element => {
      const range = document.createRange(); range.selectNodeContents(element);
      const selection = getSelection(); selection.removeAllRanges(); selection.addRange(range);
      element.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
    });
    assert.equal(await panel.getByRole('button', { name: 'Explain my selection', exact: true }).count(), 0);
    const beforeLabSend = requests.length;
    await panel.getByRole('button', { name: 'Explain this section', exact: true }).click();
    assert.equal(requests.length, beforeLabSend, 'Preparing Lab context must not send the private workspace');
    await panel.getByRole('button', { name: 'Send', exact: true }).click();
    await panel.getByText(/^Synthetic guide response/).waitFor();
    assert.equal(requests.at(-1).body.context.currentView.path, '/strategy-lab');
    assert.doesNotMatch(JSON.stringify(requests.at(-1).body.context.currentView), privateLabContext);
    await check(page, key, 'strategy-lab-private-context');
    await panel.getByRole('button', { name: 'Close', exact: true }).click();
    await page.goto(`${origin}/about?private=DO_NOT_SEND_QUERY`);
    await openPeggy(page);
    await panel.getByRole('button', { name: 'Explain this section', exact: true }).click();
    await panel.getByRole('button', { name: 'Send', exact: true }).click();
    await page.waitForFunction(() => !document.querySelector('.peggy-pending'));
    assert.equal(requests.at(-1).body.context.currentView.path, '/about');
    assert.equal(JSON.stringify(requests.at(-1)).includes('DO_NOT_SEND_QUERY'), false);
    await check(page, key, 'about-route');
    await page.goto(`${origin}/saved`);
    await openPeggy(page);
    assert.equal(await panel.getByRole('button', { name: 'Explain this section', exact: true }).count(), 0);
    assert.equal(await panel.getByRole('checkbox', { name: /Page context/ }).count(), 0);
    assert.deepEqual(errors, [], `${key}: page errors`);
    await context.close(); await browser.close();
    console.log(`${key}: page reading, tour, selection, explicit sending, context off, Lab and private-route exclusion passed`);
  }
  await writeFile(path.join(out, 'results.json'), JSON.stringify({ source: process.env.TESTED_SOURCE_SHA || 'local working tree', serviceMode: 'intercepted synthetic fixtures, no live AI or intake', checks: evidence.length, results: evidence }, null, 2));
} catch (error) {
  if (currentPage && !currentPage.isClosed()) {
    await currentPage.screenshot({ path: path.join(out, 'failure.png') });
    console.error(await currentPage.locator('.peggy-panel').innerText());
    console.error('Focus at failure:', await currentPage.evaluate(() => document.activeElement?.outerHTML.slice(0, 300)));
  }
  throw error;
} finally { await browser?.close(); await new Promise(resolve => server.close(resolve)); }
