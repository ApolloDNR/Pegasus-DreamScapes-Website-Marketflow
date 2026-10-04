/** Scoped visitor-story acceptance. Browser plugin not available; local Playwright harness.
 * Flow: home chapter -> matching Nelson photograph -> contextual return, then
 * owner/partner/buyer decisions -> the real mounted intake/representation forms.
 * No submissions, external requests, product-state shims, or hidden primary controls.
 */
import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { chromium } from 'playwright-core';
import { closeWithinDeadline, runWithinDeadline } from './rendered-qa-liveness.mjs';
import { createRenderedQaBuildDigest } from './rendered-qa-build-digest.mjs';

process.env.APP_ENV = 'preview';
process.env.SITE_INDEXABLE = 'false';
process.env.DATABASE_URL = '';
const { default: app } = await import('../server.mjs');
const server = app.listen(0, '127.0.0.1');
await new Promise(resolve => server.once('listening', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
const out = process.env.VISITOR_STORY_SCREENSHOT_DIR || '/tmp/pegasus-visitor-story-qa';
await mkdir(out, { recursive: true });
const axe = await readFile(new URL('../node_modules/axe-core/axe.min.js', import.meta.url), 'utf8');
const git = args => execFileSync('git', args, { encoding: 'utf8' }).trim();
const sha = value => createHash('sha256').update(value).digest('hex');
const dirty = git(['status', '--porcelain=v1']);
const untracked = git(['ls-files', '--others', '--exclude-standard']).split('\n').filter(Boolean);
const source = {
  sha: git(['rev-parse', 'HEAD']), tree: git(['rev-parse', 'HEAD^{tree}']),
  diffSha256: sha(execFileSync('git', ['diff', 'HEAD', '--binary'])),
  dirtyFiles: dirty.split('\n').filter(Boolean),
  untracked: await Promise.all(untracked.map(async file => ({ path: file, sha256: sha(await readFile(file)) }))),
};
const build = await createRenderedQaBuildDigest();
await writeFile(path.join(out, 'build-digest.json'), JSON.stringify(build, null, 2));
const results = [], failures = [], screenshots = [], contexts = [], comparisons = [];
let browser, failure, activePage, failureEvidence;
const chapters = {
  kitchen: { name: 'Kitchen · Layout', files: ['kitchen-before.webp', 'kitchen-after.webp'], label: 'Explore the kitchen' },
  living: { name: 'Living spaces · Connection', files: ['living-before.webp', 'living-after.webp'], label: 'Explore the living spaces' },
  bath: { name: 'Primary bath · Scope', files: ['bath-before.webp', 'bath-after.webp'], label: 'Explore the primary bath' },
};
const routeOf = page => new URL(page.url()).pathname + new URL(page.url()).search + new URL(page.url()).hash;
async function check(label, run) {
  try {
    await runWithinDeadline(label, run, 30_000);
    results.push({ label, passed: true });
  } catch (error) {
    failures.push({ label, error: error.message });
    throw error;
  }
}
async function scrollTo(page, selector) {
  await page.locator(selector).first().waitFor();
  // Wait for the browser's actual smooth-anchor scroll and entrance motion before
  // measuring a native wheel delta. Never override the page's motion or scroll.
  await runWithinDeadline('native scroll settlement', () => page.evaluate(async () => {
    await Promise.all(document.getAnimations().filter(animation => animation.playState === 'running' && Number.isFinite(animation.effect?.getComputedTiming().endTime)).map(animation => animation.finished.catch(() => {})));
    await new Promise(resolve => {
      let last = scrollY, stableFrames = 0;
      const frame = () => {
        stableFrames = Math.abs(scrollY - last) < .5 ? stableFrames + 1 : 0;
        last = scrollY;
        if (stableFrames >= 6) resolve(); else requestAnimationFrame(frame);
      };
      requestAnimationFrame(frame);
    });
  }));
  const target = await page.locator(selector).first().evaluate(e => Math.max(0, Math.min(document.documentElement.scrollHeight - innerHeight, e.getBoundingClientRect().top + scrollY - 160)));
  await page.mouse.move(1, 500);
  await page.mouse.wheel(0, target - await page.evaluate(() => scrollY));
  await page.waitForFunction(y => Math.abs(scrollY - y) < 2, target);
}
async function arrive(page, route) {
  await page.goto(origin + route);
  const hash = new URL(origin + route).hash.slice(1);
  await page.waitForFunction(id => id ? document.activeElement?.id === id : document.activeElement?.tagName === 'H1', hash);
  assert.match(await page.title(), /Pegasus|Nelson|Apollo|conversation|Buy|Property|deal/i);
  assert(await page.locator('main').innerText(), 'meaningful rendered content');
  assert.equal(await page.locator('vite-error-overlay, nextjs-portal').count(), 0, 'no framework overlay');
}
async function capture(page, key, axeCheck = true) {
  await runWithinDeadline(key + '/viewport-images', () => page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all([...document.images].filter(img => {
      const r = img.getBoundingClientRect();
      return r.bottom > 0 && r.top < innerHeight && r.left < innerWidth && r.right > 0 && r.width > 0 && r.height > 0;
    }).map(img => img.decode()));
  }));
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${key}: no horizontal overflow`);
  let transitionSettlement = null;
  if (await page.evaluate(() => matchMedia('(prefers-reduced-motion: no-preference)').matches)) {
    await page.addScriptTag({ content: axe });
    transitionSettlement = await runWithinDeadline(key + '/real-motion-settlement', () => page.evaluate(async () => {
      const samples = () => [...document.querySelectorAll('.home-path-copy > span, .experience-founder-role, .home-project-note-controls button')].map(e => {
        const style = getComputedStyle(e);
        const ancestors = [];
        let element = e;
        while (element && ancestors.length < 15) {
          const css = getComputedStyle(element);
          ancestors.push({ tag: element.tagName, className: element.className, color: css.color, background: css.backgroundColor, opacity: css.opacity });
          element = element.parentElement;
        }
        return { text: e.textContent, color: style.color, background: style.backgroundColor, opacity: style.opacity, ancestors };
      });
      const preScan = (await axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] } })).violations.map(v => ({ id: v.id, targets: v.nodes.map(n => n.target) }));
      const before = samples();
      const running = document.getAnimations().filter(animation => animation.playState === 'running' && Number.isFinite(animation.effect?.getComputedTiming().endTime));
      const animations = running.map(animation => ({ type: animation.constructor.name, target: animation.effect?.target?.className, timing: animation.effect?.getComputedTiming() }));
      await Promise.all(running.map(animation => animation.finished.catch(() => {})));
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      return { before, animations, after: samples(), preSettlementViolations: preScan };
    }));
  }
  let violations = [];
  if (axeCheck) {
    await page.addScriptTag({ content: axe });
    violations = await runWithinDeadline(key + '/axe', () => page.evaluate(async () => (await axe.run(document, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] },
    })).violations.map(v => ({ id: v.id, impact: v.impact, targets: v.nodes.map(n => n.target) }))));
  }
  await page.screenshot({ path: path.join(out, key + '.png') });
  screenshots.push({ key, path: key + '.png', axeChecked: axeCheck, violations, overflow: false, transitionSettlement });
  assert.deepEqual(violations, [], `${key}: axe violations`);
}
async function assertChapter(page, id) {
  const chapter = chapters[id];
  assert.equal(await page.getByRole('button', { name: chapter.name, exact: true }).getAttribute('aria-pressed'), 'true');
  assert.deepEqual(await page.locator('.home-project-photographs img').evaluateAll(images => images.map(img => img.getAttribute('src').split('/').at(-1))), chapter.files);
  assert.equal(await page.getByRole('link', { name: chapter.label, exact: true }).getAttribute('href'), `/projects/nelson-dr?from=home&story=${id}#nelson-${id}`);
  assert.match(await page.locator('.home-project-story-notes').innerText(), /What changed/i);
  assert.match(await page.locator('.home-project-story-notes').innerText(), /What to consider/i);
  if (id === 'bath') {
    assert.equal(await page.locator('.home-project-before figcaption').innerText(), 'During construction · Primary bath');
    assert.match(await page.locator('.home-project-before img').getAttribute('alt'), /during construction/);
    assert.doesNotMatch(await page.locator('.home-project-before').innerText(), /before/i);
  }
  await page.locator('.home-project-photographs img').evaluateAll(async images => {
    await Promise.all(images.filter(img => { const r = img.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight; }).map(img => img.decode()));
  });
  assert(await page.locator('.home-project-photo-frame img').evaluateAll(images => images.every(img => {
    const style = getComputedStyle(img);
    return style.objectFit === 'contain' && style.filter === 'none';
  })), 'original home photographs remain contained and untinted');
}
async function assertAnchor(page, id) {
  await page.waitForFunction(target => document.activeElement?.id === target, id);
  const geometry = await page.locator('#' + id).evaluate(target => {
    const r = target.getBoundingClientRect();
    const nav = document.querySelector('.site-nav, nav')?.getBoundingClientRect();
    return { tag: target.tagName, tab: target.tabIndex, y: r.top, bottom: r.bottom, navBottom: nav?.bottom ?? 0, width: r.width, height: innerHeight };
  });
  assert.equal(geometry.tag, 'FIGURE');
  assert.equal(geometry.tab, -1);
  assert(geometry.y >= geometry.navBottom + 8 && geometry.y < geometry.height * .4, `target clears sticky nav and is visible: ${JSON.stringify(geometry)}`);
}
async function choose(page, group, id, label, index, width) {
  await scrollTo(page, id === 'owner-situation' ? '#owner-path' : '#partner-answer');
  if (width <= 900) await page.getByRole('combobox', { name: group }).selectOption(String(index));
  else await page.getByRole('group', { name: group }).getByRole('button', { name: label, exact: true }).click();
}
async function assertClosing(page, expected) {
  const links = page.locator('.ep-closing .experience-actions a');
  assert.equal(await links.count(), 2);
  assert.deepEqual(await links.evaluateAll(items => items.map(item => ({ text: item.textContent.trim(), href: item.getAttribute('href') }))), expected);
  assert(await links.first().isVisible(), 'primary decision remains visible');
  assert(await links.nth(1).isVisible(), 'exploration path remains visible');
}
async function matrixCase(width, theme, motion = 'reduce') {
  const key = `${width}-${theme}${motion === 'reduce' ? '' : '-normal-motion'}`;
  console.log('[visitor-story]', key);
  const context = await browser.newContext({ viewport: { width, height: width < 768 ? 844 : 960 }, reducedMotion: motion });
  const record = { key, writes: [], external: [], consoleErrors: [], consoleWarnings: [], pageErrors: [], previewBackendResponses: [] };
  contexts.push(record);
  await context.route('**/*', route => {
    const request = route.request();
    if (request.method() !== 'GET') { record.writes.push({ method: request.method(), url: request.url() }); return route.abort(); }
    if (new URL(request.url()).origin !== origin) { record.external.push(request.url()); return route.abort(); }
    return route.continue();
  });
  await context.addInitScript(t => {
    localStorage.setItem('pegasus-ui-theme', t);
    localStorage.setItem('pegasus-cookie-consent', JSON.stringify({ essential: true, analytics: false, marketing: false, decidedAt: '2026-01-01T00:00:00.000Z' }));
  }, theme);
  const page = await context.newPage();
  activePage = page;
  page.setDefaultTimeout(12_000);
  const observe = target => {
    target.on('pageerror', error => record.pageErrors.push(error.message));
    target.on('response', response => {
      if (response.status() === 503 && ['/api/config/supabase', '/api/auth/user', '/api/site-content'].includes(new URL(response.url()).pathname)) record.previewBackendResponses.push({ url: response.url(), status: response.status() });
    });
    target.on('console', msg => {
      if (msg.type() === 'error') record.consoleErrors.push({ text: msg.text(), url: msg.location().url });
      if (msg.type() === 'warning') record.consoleWarnings.push(msg.text());
    });
  };
  observe(page);
  try {
    await check(key + '/home-identity-default-kitchen', async () => {
      await arrive(page, '/');
      assert.equal(await page.locator('.pg-root').getAttribute('data-theme'), theme === 'dark' ? 'dark' : null);
      await capture(page, key + '-home-arrival');
      await scrollTo(page, '.home-project-note-controls');
      await assertChapter(page, 'kitchen');
      await capture(page, key + '-kitchen');
    });
    const initialHistory = await page.evaluate(() => history.length);
    await check(key + '/native-keyboard-living-selection', async () => {
      await page.getByRole('button', { name: chapters.kitchen.name, exact: true }).click();
      await page.keyboard.press('Tab');
      assert(await page.getByRole('button', { name: chapters.living.name, exact: true }).evaluate(e => e === document.activeElement && e.matches(':focus-visible') && getComputedStyle(e).outlineStyle !== 'none'));
      await page.keyboard.press('Enter');
      await assertChapter(page, 'living');
      await capture(page, key + '-living-keyboard');
    });
    await check(key + '/bath-construction-and-return-kitchen', async () => {
      await page.getByRole('button', { name: chapters.bath.name, exact: true }).click();
      await assertChapter(page, 'bath');
      await capture(page, key + '-bath');
      await scrollTo(page, '.home-project-story-notes');
      await capture(page, key + '-bath-notes');
      await scrollTo(page, '.home-project-note-controls');
      await page.getByRole('button', { name: chapters.kitchen.name, exact: true }).click();
      await assertChapter(page, 'kitchen');
      await page.getByRole('button', { name: chapters.living.name, exact: true }).click();
      await page.getByRole('button', { name: chapters.living.name, exact: true }).click();
      assert.equal(await page.evaluate(() => history.length), initialHistory, 'local repeated chapter selections replace history');
    });
    await check(key + '/exact-deep-link-refresh-focus-and-target', async () => {
      await scrollTo(page, '.home-project-onward');
      await page.getByRole('link', { name: chapters.living.label, exact: true }).click();
      await assertAnchor(page, 'nelson-living');
      for (const id of ['nelson-kitchen', 'nelson-bath', 'nelson-living']) {
        assert(await page.locator('#' + id).evaluate(e => e.tagName === 'FIGURE' && e.tabIndex === -1 && e.hasAttribute('data-navigation-section')), 'stable focusable figure ' + id);
      }
      assert.equal(routeOf(page), '/projects/nelson-dr?from=home&story=living#nelson-living');
      await capture(page, key + '-deep-living');
      const before = await page.locator('#nelson-living img').evaluateAll(items => items.map(img => ({ src: img.getAttribute('src'), fit: getComputedStyle(img).objectFit, position: getComputedStyle(img).objectPosition })));
      await page.reload();
      await assertAnchor(page, 'nelson-living');
      assert.deepEqual(await page.locator('#nelson-living img').evaluateAll(items => items.map(img => ({ src: img.getAttribute('src'), fit: getComputedStyle(img).objectFit, position: getComputedStyle(img).objectPosition }))), before, 'refresh preserves photo/crop');
    });
    await check(key + '/native-back-forward-story-continuity', async () => {
      await page.goBack();
      await page.locator('.home-project-note-controls').waitFor();
      await assertChapter(page, 'living');
      assert.equal(new URL(page.url()).searchParams.get('story'), 'living');
      await page.goForward();
      await page.locator('#nelson-living').waitFor();
      assert.equal(routeOf(page), '/projects/nelson-dr?from=home&story=living#nelson-living');
    });
    await check(key + '/gallery-enlarge-next-escape-restore', async () => {
      await scrollTo(page, '#nelson-living');
      const trigger = page.getByRole('button', { name: 'Enlarge the living space, before', exact: true });
      await trigger.click();
      await page.getByRole('dialog').waitFor();
      assert.match(await page.getByRole('dialog').innerText(), /The living space · Before/);
      await page.getByRole('button', { name: 'Next photograph', exact: true }).click();
      assert.match(await page.getByRole('dialog').innerText(), /The living space · After/);
      await capture(page, key + '-gallery');
      await page.keyboard.press('Escape');
      assert.equal(await page.getByRole('dialog').count(), 0);
      assert(await trigger.evaluate(e => e === document.activeElement), 'Escape restores original trigger');
    });
    await check(key + '/case-study-closing-direct-and-explore', async () => {
      await scrollTo(page, '.ep-closing');
      await assertClosing(page, [{ text: 'Discuss a property', href: '/bring-an-opportunity?intent=property' }, { text: 'Explore your property options', href: '/property-owners' }]);
      await capture(page, key + '-case-closing');
    });
    await check(key + '/explicit-return-chapter-focus-and-scroll', async () => {
      await scrollTo(page, '.ep-opening');
      await page.getByRole('link', { name: 'Back to the home story', exact: true }).click();
      await page.waitForFunction(() => document.activeElement?.id === 'home-proof-title');
      assert.equal(routeOf(page), '/?story=living#home-proof-title');
      await assertChapter(page, 'living');
      assert(await page.locator('#home-proof-title').evaluate(e => { const r = e.getBoundingClientRect(); return r.top >= 60 && r.top < innerHeight / 2; }), 'explicit return targets visible story heading');
      await capture(page, key + '-return-story');
    });
    await check(key + '/invalid-story-safe-default', async () => {
      await arrive(page, '/?story=unknown');
      await assertChapter(page, 'kitchen');
      assert.equal(await page.getByRole('link', { name: 'Explore the kitchen', exact: true }).getAttribute('href'), '/projects/nelson-dr?from=home&story=kitchen#nelson-kitchen');
    });
    await check(key + '/earlier-path-anchor-refreshes-at-selected-story', async () => {
      await arrive(page, '/');
      await page.getByRole('link', { name: 'Explore Pegasus', exact: true }).click();
      await page.waitForFunction(() => window.location.hash === '#home-paths-title');
      await scrollTo(page, '.home-project-note-controls');
      const historyBefore = await page.evaluate(() => history.length);
      const scrollBefore = await page.evaluate(() => scrollY);
      await page.getByRole('button', { name: chapters.living.name, exact: true }).click();
      await assertChapter(page, 'living');
      assert.equal(routeOf(page), '/?story=living#home-proof-title');
      assert.equal(await page.evaluate(() => history.length), historyBefore);
      assert(Math.abs(await page.evaluate(() => scrollY) - scrollBefore) < 3, 'local chapter selection does not force a scroll');
      await page.reload();
      await page.waitForFunction(() => document.activeElement?.id === 'home-proof-title');
      await assertChapter(page, 'living');
      assert(await page.locator('#home-proof-title').evaluate(e => { const r = e.getBoundingClientRect(); return r.top >= 60 && r.top < innerHeight / 2; }), 'refresh returns to the chosen story, not the earlier paths anchor');
      await capture(page, key + '-anchored-story-refresh');
    });
    if (motion === 'no-preference') return;
    await check(key + '/owner-selection-intake-prefill-back', async () => {
      await arrive(page, '/property-owners');
      await choose(page, 'Common owner situations', 'owner-situation', 'Inherited property', 2, width);
      await scrollTo(page, '#owner-path');
      assert.equal(await page.locator('#owner-path h3').innerText(), 'Inherited property');
      await capture(page, key + '-owner-choice');
      await page.getByRole('link', { name: 'Start with this situation', exact: true }).click();
      await page.getByLabel('Property address', { exact: true }).waitFor();
      assert.equal(new URL(page.url()).searchParams.get('owner_situation'), 'Inherited property');
      await page.getByRole('button', { name: 'Continue', exact: true }).click();
      if (width <= 600) assert.equal(await page.getByLabel('Choose the closest match').inputValue(), 'Inherited / probate');
      else assert.equal(await page.getByRole('button', { name: 'Inherited / probate', exact: true }).getAttribute('aria-pressed'), 'true');
      await capture(page, key + '-owner-intake');
      await page.goBack();
      await page.locator('#owner-path h3').waitFor();
      assert.equal(await page.locator('#owner-path h3').innerText(), 'Inherited property');
      await page.getByRole('link', { name: 'Start with this situation', exact: true }).click();
      await page.getByLabel('Property address', { exact: true }).waitFor();
      await page.getByRole('link', { name: 'Back to Property Owners', exact: true }).click();
      await page.locator('#owner-path h3').waitFor();
      assert.equal(await page.locator('#owner-path h3').innerText(), 'Inherited property');
      await scrollTo(page, '.ep-closing');
      await assertClosing(page, [{ text: 'Tell us about the property', href: '/bring-an-opportunity?intent=property&ref=property-owners&owner_situation=Inherited%20property' }, { text: 'Test assumptions in Strategy Lab', href: '/strategy-lab?owner_situation=Inherited%20property' }]);
      await capture(page, key + '-owner-closing');
    });
    await check(key + '/partner-selection-intake-context-back', async () => {
      await arrive(page, '/deal-partners');
      await choose(page, 'What the deal is missing', 'partner-need', 'Underwriting', 2, width);
      await scrollTo(page, '#partner-answer');
      assert.equal(await page.locator('#partner-answer h3').innerText(), 'Underwriting');
      await capture(page, key + '-partner-choice');
      await page.getByRole('link', { name: 'Bring this opportunity', exact: true }).click();
      await page.getByLabel('Property address', { exact: true }).waitFor();
      assert.equal(new URL(page.url()).searchParams.get('partner_need'), 'Underwriting');
      assert(await page.getByText('From Deal Partners: Underwriting', { exact: true }).isVisible());
      await capture(page, key + '-partner-intake');
      await page.goBack();
      await page.locator('#partner-answer h3').waitFor();
      assert.equal(await page.locator('#partner-answer h3').innerText(), 'Underwriting');
      await page.getByRole('link', { name: 'Bring this opportunity', exact: true }).click();
      await page.getByLabel('Property address', { exact: true }).waitFor();
      await page.getByRole('link', { name: 'Back to Deal Partners', exact: true }).click();
      await page.locator('#partner-answer h3').waitFor();
      assert.equal(await page.locator('#partner-answer h3').innerText(), 'Underwriting');
      await scrollTo(page, '.ep-closing');
      await assertClosing(page, [{ text: 'Bring a deal', href: '/bring-an-opportunity?intent=deal-jv&ref=deal-partners&partner_need=Underwriting' }, { text: 'Explore the possible roles', href: '/how-we-operate#operating-roles' }]);
      await capture(page, key + '-partner-closing');
    });
    await check(key + '/buyer-real-mounted-form-prefill-no-submit', async () => {
      await arrive(page, '/buyers');
      const cta = page.locator('a[href="/work-with-apollo?intent=buy#apollo-paths"]');
      await cta.click();
      await page.waitForFunction(() => document.activeElement?.id === 'apollo-paths');
      assert.equal(routeOf(page), '/work-with-apollo?intent=buy#apollo-paths');
      assert.equal(await page.getByTestId('apollo-selector-buy').getAttribute('aria-pressed'), 'true');
      await page.getByTestId('apollo-selector-buy').click();
      const role = page.getByLabel('I am a…');
      assert.equal(await role.inputValue(), 'Buy a home (Buyer representation)');
      assert(await role.evaluate(e => document.activeElement === e));
      assert.equal(await page.locator('.ep-representation form').count(), 1, 'actual pages.tsx representation form is mounted');
      assert(await page.getByRole('button', { name: 'Request representation', exact: true }).isVisible());
      await capture(page, key + '-buyer-form');
      await role.selectOption('List my property (Seller representation)');
      assert.equal(new URL(page.url()).searchParams.get('intent'), 'sell');
      await page.reload();
      await page.locator('#apollo-paths').waitFor();
      assert.equal(await role.inputValue(), 'List my property (Seller representation)');
    });
    if (width === 390 && theme === 'light') await check(key + '/privacy-keyboard-new-tab-draft-and-reset', async () => {
      const draftPage = await context.newPage();
      activePage = draftPage;
      observe(draftPage);
      await arrive(draftPage, '/bring-an-opportunity?intent=property&ref=property-owners&owner_situation=Inherited%20property');
      await draftPage.getByLabel('Property address', { exact: true }).fill('291 Synthetic QA Way');
      await draftPage.getByRole('button', { name: 'Continue', exact: true }).click();
      assert.equal(await draftPage.getByLabel('Choose the closest match').inputValue(), 'Inherited / probate');
      await draftPage.getByRole('button', { name: 'Continue', exact: true }).click();
      await draftPage.getByRole('button', { name: 'Not sure', exact: true }).click();
      await draftPage.getByRole('button', { name: 'Continue', exact: true }).click();
      await draftPage.getByLabel('Full name (required)').fill('Avery Synthetic QA');
      await draftPage.getByLabel('Email (required)').fill('qa.story@example.invalid');
      const privacy = draftPage.locator('#sp-privacy-notice a[href="/privacy"]');
      assert.equal(await privacy.getAttribute('target'), '_blank');
      assert.match(await privacy.getAttribute('rel'), /noopener/);
      assert.match(await privacy.innerText(), /opens in (?:a )?new tab/i);
      await scrollTo(draftPage, '#sp-privacy-notice');
      await draftPage.getByLabel('Full name (required)').click();
      let reachedPrivacy = false;
      for (let index = 0; index < 12; index++) {
        await draftPage.keyboard.press('Tab');
        if (await privacy.evaluate(e => document.activeElement === e)) { reachedPrivacy = true; break; }
      }
      assert(reachedPrivacy, 'Privacy link is reachable through native keyboard order');
      const popupPromise = draftPage.waitForEvent('popup');
      await draftPage.keyboard.press('Enter');
      const policy = await popupPromise;
      activePage = policy;
      observe(policy);
      await policy.waitForLoadState('domcontentloaded');
      assert.equal(new URL(policy.url()).pathname, '/privacy');
      assert.equal(await policy.evaluate(() => window.opener), null, 'Privacy tab has no opener');
      await policy.locator('h1').waitFor();
      assert.match(await policy.locator('h1').innerText(), /privacy/i);
      await capture(policy, key + '-privacy-tab');
      assert.equal(await draftPage.getByLabel('Full name (required)').inputValue(), 'Avery Synthetic QA');
      assert.equal(await draftPage.getByLabel('Email (required)').inputValue(), 'qa.story@example.invalid');
      assert.match(await draftPage.locator('.intake-review').innerText(), /291 Synthetic QA Way/);
      await policy.close();
      activePage = draftPage;
      await capture(draftPage, key + '-privacy-original-draft');
      await draftPage.getByRole('link', { name: 'Back to Property Owners', exact: true }).click();
      await draftPage.locator('#owner-path h3').waitFor();
      assert.equal(await draftPage.locator('#owner-path h3').innerText(), 'Inherited property');
      await draftPage.goBack();
      await draftPage.getByLabel('Property address', { exact: true }).waitFor();
      assert.equal(await draftPage.getByLabel('Property address', { exact: true }).inputValue(), '', 'leaving intentionally clears the local draft');
      await draftPage.getByLabel('Property address', { exact: true }).fill('391 Synthetic Refresh Way');
      await draftPage.reload();
      await draftPage.getByLabel('Property address', { exact: true }).waitFor();
      assert.equal(await draftPage.getByLabel('Property address', { exact: true }).inputValue(), '', 'refresh intentionally clears the local draft');
      await closeWithinDeadline(key + '/privacy-case', () => draftPage.close());
      activePage = page;
    });
  } catch (error) {
    const diagnosticPage = activePage && !activePage.isClosed() ? activePage : page;
    failureEvidence = { key, screenshot: key + '-failure.png', state: key + '-failure-state.json' };
    try {
      await runWithinDeadline(key + '/failure-evidence', async () => {
        await diagnosticPage.screenshot({ path: path.join(out, failureEvidence.screenshot) });
        await writeFile(path.join(out, failureEvidence.state), JSON.stringify(await diagnosticPage.evaluate(() => ({ url: location.href, activeElement: document.activeElement?.outerHTML, text: document.body.innerText.slice(0, 20000), scrollY })), null, 2));
      }, 5_000);
    } catch (diagnosticError) { console.error('[visitor-story:diagnostic]', diagnosticError); }
    throw error;
  } finally {
    await check(key + '/no-writes-or-runtime-console-errors', async () => {
      assert.deepEqual(record.writes, [], 'no non-GET requests attempted');
      assert.deepEqual(record.pageErrors, [], 'no JavaScript errors');
      const expectedPreviewFailure = entry => /server responded with a status of 503/.test(entry.text)
        && record.previewBackendResponses.some(response => response.url === entry.url && response.status === 503);
      record.expectedPreviewConsoleErrors = record.consoleErrors.filter(expectedPreviewFailure);
      record.unexpectedConsoleErrors = record.consoleErrors.filter(entry => !expectedPreviewFailure(entry));
      assert.deepEqual(record.unexpectedConsoleErrors, [], 'no unexpected console errors; disabled preview backend 503s are separately recorded');
    });
    await closeWithinDeadline(key + '/context', () => context.close());
  }
}
async function matchedComparison() {
  const context = await browser.newContext({ viewport: { width: 1167, height: 749 }, reducedMotion: 'reduce' });
  const errors = [], writes = [], unexpectedConsole = [];
  await context.route('**/*', route => {
    const request = route.request();
    if (request.method() !== 'GET') { writes.push(request.url()); return route.abort(); }
    return new URL(request.url()).origin === origin ? route.continue() : route.abort();
  });
  await context.addInitScript(() => {
    localStorage.setItem('pegasus-ui-theme', 'light');
    localStorage.setItem('pegasus-cookie-consent', JSON.stringify({ essential: true, analytics: false, marketing: false, decidedAt: '2026-01-01T00:00:00.000Z' }));
  });
  const page = await context.newPage();
  activePage = page;
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', msg => {
    if (msg.type() !== 'error') return;
    const url = msg.location().url;
    if (!(/server responded with a status of 503/.test(msg.text()) && url && ['/api/config/supabase', '/api/auth/user', '/api/site-content'].includes(new URL(url).pathname))) unexpectedConsole.push({ text: msg.text(), url });
  });
  try {
    for (const chapter of ['kitchen', 'living']) {
      await arrive(page, `/?story=${chapter}#home-proof-title`);
      await assertChapter(page, chapter);
      const key = `comparison-home-${chapter}-after`;
      await capture(page, key);
      comparisons.push({ key, viewport: { width: 1167, height: 749 }, theme: 'light', target: '#home-proof-title', url: routeOf(page), countedAsIndependentScenario: false });
    }
    assert.deepEqual(errors, []);
    assert.deepEqual(writes, []);
    assert.deepEqual(unexpectedConsole, []);
  } finally {
    await closeWithinDeadline('matched comparison context', () => context.close());
  }
}

try {
  browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || chromium.executablePath(), headless: true });
  const widths = process.env.VISITOR_STORY_MODE === 'normal-only' ? [] : process.env.VISITOR_STORY_WIDTH ? [Number(process.env.VISITOR_STORY_WIDTH)] : [320, 390, 768, 1440];
  for (const width of widths) for (const theme of ['light', 'dark']) {
    await runWithinDeadline(`${width}-${theme}/complete-matrix-case`, () => matrixCase(width, theme), 240_000);
    await writeFile(path.join(out, 'checkpoint.json'), JSON.stringify({ source, buildSha256: build.digest, results, failures, screenshots, contexts }, null, 2));
  }
  await runWithinDeadline('normal-motion-smoke', () => matrixCase(390, 'light', 'no-preference'), 180_000);
  if (process.env.VISITOR_STORY_COMPARISON === '1') await runWithinDeadline('matched comparison screenshots', matchedComparison, 60_000);
} catch (error) {
  failure = error;
  console.error('[visitor-story:failed]', error);
  if (!failureEvidence && activePage && !activePage.isClosed()) {
    try {
      await runWithinDeadline('failure screenshot', () => activePage.screenshot({ path: path.join(out, 'failure.png') }), 5_000);
      await writeFile(path.join(out, 'failure-state.json'), JSON.stringify(await activePage.evaluate(() => ({ url: location.href, activeElement: document.activeElement?.outerHTML, text: document.body.innerText.slice(0, 20000), scrollY })), null, 2));
    } catch (diagnosticError) { console.error('[visitor-story:diagnostic]', diagnosticError); }
  }
} finally {
  if (browser) {
    try { await closeWithinDeadline('visitor-story browser', () => browser.close()); } catch (error) { failure ||= error; }
  }
  server.closeAllConnections?.();
  try { await closeWithinDeadline('visitor-story server', () => new Promise(resolve => server.close(resolve))); } catch (error) { failure ||= error; }
  const afterBuild = await createRenderedQaBuildDigest();
  if (afterBuild.digest !== build.digest) failure ||= new Error('Build changed during rendered QA');
  const report = { schemaVersion: 1, flow: 'Home chapter to exact Nelson figure and contextual return; owner/partner/buyer choices to real mounted forms', browser: 'Chromium via Playwright; Browser plugin not available for local automated harness', origin, source, failureEvidence: failureEvidence ?? null, buildSha256: build.digest, finalBuildSha256: afterBuild.digest, matrixCases: contexts.length, namedChecks: results.length + failures.length, passedChecks: results.length, failedChecks: failures.length, comparisons, screenshots, results, failures, contexts, noLiveWrites: contexts.every(c => c.writes.length === 0), error: failure ? String(failure) : null };
  await writeFile(path.join(out, process.env.VISITOR_STORY_MODE === 'normal-only' ? 'normal-motion-results.json' : 'results.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ passedChecks: results.length, failures: failures.length, matrixCases: contexts.length, screenshots: screenshots.length, output: out, error: report.error }));
}
if (failure) { process.exitCode = 1; process.exit(1); }
