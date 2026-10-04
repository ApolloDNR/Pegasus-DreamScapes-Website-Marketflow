import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const source = readFileSync(resolve(import.meta.dirname, '../../scripts/check-visitor-story.mjs'), 'utf8');
describe('visitor-story rendered QA safety and evidence contract', () => {
  it('uses loopback preview and blocks all non-GET and external requests', () => {
    expect(source).toContain("process.env.APP_ENV = 'preview'");
    expect(source).toContain("process.env.SITE_INDEXABLE = 'false'");
    expect(source).toContain("process.env.DATABASE_URL = ''");
    expect(source).toContain("app.listen(0, '127.0.0.1')");
    expect(source).toContain("request.method() !== 'GET'");
    expect(source).toContain("new URL(request.url()).origin !== origin");
    expect(source).toContain("return route.abort()");
    expect(source).not.toMatch(/\.getByRole\('button', \{ name: 'Request representation'[^\n]*\.click/);
  });
  it('records finite matrix, motion smoke, source and build lineage honestly', () => {
    expect(source).toContain('[320, 390, 768, 1440]');
    expect(source).toContain("['light', 'dark']");
    expect(source).toContain("matrixCase(390, 'light', 'no-preference')");
    expect(source).toContain("git(['rev-parse', 'HEAD^{tree}'])");
    expect(source).toContain('diffSha256:');
    expect(source).toContain('dirtyFiles:');
    expect(source).toContain('finalBuildSha256: afterBuild.digest');
    expect(source).toContain('namedChecks: results.length + failures.length');
  });
  it('uses native input and liveness bounds without fabricated scroll or focus', () => {
    expect(source).toContain('page.mouse.wheel(');
    expect(source).toContain("page.keyboard.press('Tab')");
    expect(source).toContain('runWithinDeadline');
    expect(source).toContain('closeWithinDeadline');
    expect(source).not.toContain('window.scrollTo');
    expect(source).not.toContain('.focus(');
    expect(source).not.toContain('addStyleTag');
  });
  it('decodes only intersecting images and checks axe, console, overflow, screenshots', () => {
    expect(source).toContain('r.bottom > 0 && r.top < innerHeight');
    expect(source).toContain('img.decode()');
    expect(source).toContain('axe.run(document');
    expect(source).toContain('scrollWidth <= innerWidth + 1');
    expect(source).toContain("target.on('console'");
    expect(source).toContain('await page.screenshot(');
  });
  it('tests privacy new-tab continuity without submitting or promising persistence', () => {
    expect(source).toContain("draftPage.waitForEvent('popup')");
    expect(source).toContain("policy.evaluate(() => window.opener), null");
    expect(source).toContain('leaving intentionally clears the local draft');
    expect(source).toContain('refresh intentionally clears the local draft');
    expect(source).toContain('qa.story@example.invalid');
  });
});
