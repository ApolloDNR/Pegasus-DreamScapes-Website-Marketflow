/** Public visual semantics acceptance: real interactions only, no external writes. */
import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { chromium } from 'playwright-core';
import { closeWithinDeadline, runWithinDeadline } from './rendered-qa-liveness.mjs';
import { createRenderedQaBuildDigest } from './rendered-qa-build-digest.mjs';
process.env.APP_ENV = 'preview';
process.env.SITE_INDEXABLE = 'false';
process.env.DATABASE_URL = '';
const {
  default: app
} = await import('../server.mjs');
const server = app.listen(0, '127.0.0.1');
await new Promise(r => server.once('listening', r));
const origin = `http://127.0.0.1:${server.address().port}`;
const out = process.env.CLARITY_SCREENSHOT_DIR || '/tmp/pegasus-clarity-qa';
await mkdir(out, {
  recursive: true
});
const axe = await readFile(new URL('../node_modules/axe-core/axe.min.js', import.meta.url), 'utf8');
const results = [],
  failures = [],
  screenshots = [];
const build = await createRenderedQaBuildDigest();
let browser;
let failure;
async function check(label, run) {
  try {
    await runWithinDeadline(label, run);
    results.push({
      label,
      passed: true
    });
  } catch (error) {
    failures.push({
      label,
      error: error.message
    });
    console.error(label, error.message);
  }
}
async function scrollTo(page, selector) {
  await page.locator(selector).waitFor();
  const target = await page.locator(selector).evaluate(e => Math.max(0, Math.min(document.documentElement.scrollHeight - innerHeight, e.getBoundingClientRect().top + scrollY - 160)));
  await page.mouse.move(1, 500);
  await page.mouse.wheel(0, target - (await page.evaluate(() => scrollY)));
  await page.waitForFunction(y => Math.abs(scrollY - y) < 2, target);
}
async function arrive(page, route) {
  await page.goto(origin + route);
  await page.waitForFunction(() => document.activeElement?.tagName === 'H1');
}
async function underlined(page, selector) {
  assert(await page.locator(selector).first().evaluate(e => getComputedStyle(e).textDecorationLine.includes('underline')), `${selector} must identify itself before hover`);
}
async function capture(page, key) {
  await runWithinDeadline(key + '/settle', () => page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all([...document.images].filter(i => {
      const r = i.getBoundingClientRect();
      return r.bottom > 0 && r.top < innerHeight && r.width > 0 && r.height > 0;
    }).map(i => i.decode()));
  }));
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'no horizontal overflow');
  await page.addScriptTag({
    content: axe
  });
  const violations = await runWithinDeadline(key + '/axe', () => page.evaluate(async () => (await axe.run(document, {
    runOnly: {
      type: 'tag',
      values: ['wcag2a', 'wcag2aa', 'wcag21aa']
    }
  })).violations.map(v => ({
    id: v.id,
    targets: v.nodes.map(n => n.target)
  }))));
  await page.screenshot({
    path: path.join(out, key + '.png')
  });
  assert.deepEqual(violations, [], 'axe violations');
  screenshots.push({
    key,
    screenshot: key + '.png',
    axeViolations: 0,
    overflow: false
  });
}
try {
  browser = await chromium.launch({
    executablePath: process.env.CHROME_PATH || chromium.executablePath(),
    headless: true
  });
  for (const width of process.env.CLARITY_WIDTH ? [Number(process.env.CLARITY_WIDTH)] : [320, 390, 768, 1440]) for (const theme of ['light', 'dark']) {
    const key = `${width}-${theme}`;
    console.log('[clarity]', key);
    await runWithinDeadline(key + '/complete-matrix-case', async () => {
      const context = await browser.newContext({
        viewport: {
          width,
          height: width < 768 ? 844 : 960
        },
        reducedMotion: 'reduce'
      });
      const writes = [],
        errors = [];
      await context.route('**/*', r => {
        if (r.request().method() !== 'GET') {
          writes.push(r.request().url());
          return r.abort();
        }
        return new URL(r.request().url()).origin === origin ? r.continue() : r.abort();
      });
      await context.addInitScript(t => {
        localStorage.setItem('pegasus-ui-theme', t);
        localStorage.setItem('pegasus-cookie-consent', JSON.stringify({
          essential: true,
          analytics: false,
          marketing: false,
          decidedAt: '2026-01-01T00:00:00.000Z'
        }));
      }, theme);
      const page = await context.newPage();
      page.on('pageerror', e => errors.push(e.message));
      await arrive(page, '/');
      await scrollTo(page, '.home-pathways');
      await check(key + '/route-resting-state', async () => {
        const styles = await page.locator('.home-pathways .experience-path').evaluateAll(es => es.map(e => ({
          bg: getComputedStyle(e).backgroundColor,
          border: getComputedStyle(e).borderLeftColor
        })));
        assert.deepEqual(styles[0], styles[1], 'a route must not appear selected before interaction');
      });
      await capture(page, key + '-home-paths');
      await page.locator('.home-pathways .experience-path').nth(1).focus();
      await check(key + '/route-keyboard-focus', async () => assert(await page.locator('.home-pathways .experience-path').nth(1).evaluate(e => getComputedStyle(e).outlineStyle !== 'none')));
      await capture(page, key + '-route-focus');
      await scrollTo(page, '.experience-plan-host');
      await page.locator('.op-plan').waitFor();
      if (width <= 900) await page.getByRole('button', {
        name: /Choose a planning question/
      }).click();
      await page.getByRole('button', {
        name: 'Do the numbers make sense?',
        exact: true
      }).filter({
        visible: true
      }).click();
      await scrollTo(page, '.op-plan');
      await check(key + '/planning-route-cue', () => underlined(page, '.op-next'));
      if (width > 900) await check(key + '/planning-context-readouts', async () => {
        const nodes = page.locator('.op-map-node');
        assert.equal(await nodes.locator('button,a,input').count(), 0);
        assert(await nodes.evaluateAll(es => es.every(e => ['borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth'].every(k => getComputedStyle(e)[k] === '0px'))), 'context readouts must not have a control-like box');
      });
      await capture(page, key + '-planning');
      await scrollTo(page, '.home-project-note-controls');
      await check(key + '/photo-note-selectors', async () => {
        assert.equal(await page.locator('.home-project-note-controls button[aria-pressed="true"] .lucide-check').count(), 1);
        assert.equal(await page.locator('.home-project-note-controls button[aria-pressed="false"] .lucide-chevron-down').count(), 2);
      });
      await page.getByRole('button', {
        name: 'Living spaces · Connection',
        exact: true
      }).click();
      assert.equal(await page.getByRole('button', {
        name: 'Living spaces · Connection',
        exact: true
      }).getAttribute('aria-pressed'), 'true');
      await capture(page, key + '-photo-notes');
      await arrive(page, '/tools');
      await page.getByRole('button', {
        name: '02 Check a number'
      }).click();
      await scrollTo(page, '.tools-finder');
      await check(key + '/local-tool-selectors', async () => {
        assert(await page.locator('.tools-task-list button strong').first().evaluate(e => getComputedStyle(e).fontFamily.includes('Inter')), 'local controls use UI type rather than page-heading type');
        assert.equal(await page.locator('.tools-task-list button[aria-pressed="true"] .lucide-check').count(), 1);
        assert.equal(await page.locator('.tools-task-list button[aria-pressed="false"] .lucide-chevron-down').count(), 2);
        assert.equal(new URL(page.url()).pathname, '/tools');
      });
      await capture(page, key + '-tools');
      for (const route of ['/how-we-operate', '/marketflow']) {
        await arrive(page, route);
        await scrollTo(page, '.ep-stage-rail');
        await check(key + route + '/selector-cues', async () => {
          assert.equal(await page.locator('.ep-stage-rail button[aria-pressed="true"] .lucide-check').count(), 1);
          assert((await page.locator('.ep-stage-rail button[aria-pressed="false"] .lucide-chevron-down').count()) > 0);
        });
        await page.locator('.ep-stage-rail button').nth(1).click();
        assert.equal(await page.locator('.ep-stage-rail button').nth(1).getAttribute('aria-pressed'), 'true');
        await capture(page, key + route.replaceAll('/', '-'));
        if (route === '/how-we-operate') {
          await check(key + '/help-action-cue', async () => {
            await underlined(page, '.journey-explain');
            assert.equal(await page.locator('.journey-explain .lucide-message-circle').first().count(), 1);
          });
        }
      }
      await arrive(page, '/strategy-lab');
      await check(key + '/lab-route-cues', () => underlined(page, '.id-tool-navigation a'));
      await check(key + '/lab-action-cues', () => underlined(page, '.id-text-button'));
      await page.getByRole('button', {
        name: 'Load illustrative example',
        exact: true
      }).click();
      await capture(page, key + '-lab');
      assert.deepEqual(writes, [], 'no write attempts');
      assert.deepEqual(errors, [], 'no runtime errors');
      await closeWithinDeadline(key + '/context', () => context.close());
    }, 180_000);
  }
  await writeFile(path.join(out, 'results.json'), JSON.stringify({
    sourceSha: execFileSync('git', ['rev-parse', 'HEAD'], {
      encoding: 'utf8'
    }).trim(),
    workingTreeDirty: Boolean(execFileSync('git', ['status', '--porcelain'], {
      encoding: 'utf8'
    }).trim()),
    buildSha256: build.digest,
    checks: results.length + failures.length,
    screenshots,
    results,
    failures,
    noLiveWrites: true
  }, null, 2));
  assert.deepEqual(failures, [], 'visual hierarchy acceptance');
  console.log(JSON.stringify({
    checks: results.length,
    output: out
  }));
} catch (error) {
  failure = error;
  console.error('[clarity:failed]', error);
  try {
    await runWithinDeadline('clarity failure evidence', () => writeFile(path.join(out, 'failure.json'), JSON.stringify({
      error: String(error),
      results,
      failures,
      screenshots
    }, null, 2)), 5_000);
  } catch (diagnosticError) {
    console.error('[clarity:diagnostic-failed]', diagnosticError);
  }
} finally {
  try {
    if (browser) await closeWithinDeadline('clarity browser', () => browser.close());
  } catch (error) {
    failure ||= error;
  }
  server.closeAllConnections?.();
  try {
    await closeWithinDeadline('clarity server', () => new Promise(r => server.close(r)));
  } catch (error) {
    failure ||= error;
  }
}
// A timed-out renderer may retain its RPC transport after bounded cleanup.
if (failure) {
  console.error(failure);
  process.exit(1);
}
