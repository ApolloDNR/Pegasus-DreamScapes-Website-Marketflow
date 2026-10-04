import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { execFileSync } from 'node:child_process';
import { readFile, writeFile, mkdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const project = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const build = path.join(project, 'dist/public');
const out = path.resolve(process.env.VISITOR_QA_OUTPUT || '/tmp/pegasus-visitor-refinement');
await mkdir(out, { recursive: true });
const testedSha = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: project, encoding: 'utf8' }).trim();
const axeSource = await readFile(path.join(project, 'node_modules/axe-core/axe.min.js'), 'utf8');
const mime = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.json':'application/json', '.png':'image/png', '.webp':'image/webp', '.svg':'image/svg+xml', '.jpg':'image/jpeg', '.woff2':'font/woff2', '.woff':'font/woff' };
const server = createServer(async (request, response) => {
  const pathname = new URL(request.url || '/', 'http://127.0.0.1').pathname;
  if (pathname.startsWith('/api/')) {
    response.setHeader('content-type', 'application/json');
    if (pathname === '/api/site-content' || pathname === '/api/projects') { response.end('[]'); return; }
    if (pathname === '/api/config/supabase') { response.end('{}'); return; }
    response.statusCode = 503;
    response.setHeader('x-pegasus-preview-stub', 'backend-unavailable');
    response.end(JSON.stringify({ message:'Isolated QA backend unavailable' })); return;
  }
  let file = path.resolve(build, `.${decodeURIComponent(pathname)}`);
  if (!file.startsWith(`${build}${path.sep}`) && file !== build) { response.statusCode = 404; response.end(); return; }
  try { if ((await stat(file)).isDirectory()) file = path.join(file, 'index.html'); } catch { file = path.join(build, 'index.html'); }
  try { response.setHeader('content-type', mime[path.extname(file)] || 'application/octet-stream'); response.end(await readFile(file)); }
  catch { response.statusCode = 404; response.end(); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const base = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || chromium.executablePath(), headless:true });
const results = [], screenshots = [], pageErrors = [], requests = [];
async function capture(page, name) {
  await page.waitForLoadState('networkidle'); await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path:path.join(out, `${name}.png`) });
  screenshots.push(`${name}.png`);
}
async function a11y(page, label) {
  await page.addScriptTag({content:axeSource});
  const violations = await page.evaluate(async () => (await axe.run(document, { runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']} })).violations.map(v => ({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>n.target)})));
  assert.deepEqual(violations, [], `${label} accessibility violations: ${JSON.stringify(violations)}`);
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${label} horizontal overflow`);
}
async function open(page, route) { await page.goto(base + route, { waitUntil:'networkidle' }); }
async function optional(page, name) { const summary = page.locator('summary').filter({hasText:name}); await summary.click(); }
const viewports = [['desktop',{width:1440,height:940}],['tablet',{width:768,height:1024}],['phone',{width:390,height:844}],['small-phone',{width:320,height:740}],['landscape',{width:844,height:390}]];
try {
  for (const [viewportName, viewport] of viewports) for (const theme of ['light','dark']) {
    const tag = `${viewportName}-${theme}`;
    const context = await browser.newContext({viewport,reducedMotion:'reduce'});
    await context.addInitScript(theme => localStorage.setItem('pegasus-ui-theme', theme), theme);
    await context.route('**/*', route => new URL(route.request().url()).origin === base ? route.continue() : route.abort());
    const page = await context.newPage(); page.setDefaultTimeout(12000);
    page.on('pageerror', error => pageErrors.push({tag,error:String(error)}));
    await open(page, '/property-owners');
    await page.getByRole('button', {name:'Show me around',exact:true}).click();
    const tour = page.getByRole('complementary', {name:'Peggy page guide'});
    await tour.waitFor({state:'visible'});
    await capture(page, `${tag}-tour-cookie`);
    assert(await tour.getByRole('button',{name:'End page tour'}).isVisible());
    await page.keyboard.press('Escape');
    await tour.waitFor({state:'hidden'});
    assert.equal(await page.getByRole('dialog',{name:'Peggy, the Pegasus intake concierge'}).count(),0,'Page tour exit unexpectedly opened Peggy');
    await page.getByRole('button',{name:'Reject',exact:true}).click();
    await page.getByRole('button',{name:'Show me around',exact:true}).click();
    await tour.getByRole('button',{name:'Next section',exact:true}).click();
    await capture(page, `${tag}-tour-compact`);
    if (await tour.getAttribute('data-compact') === 'true') {
      const box = await tour.boundingBox();
      assert(box.height < Math.min(viewport.height * .55, 400), `${tag} default tour covers too much (${box.height}px)`);
    }
    await a11y(page, `${tag} compact tour`);
    const disclosure = tour.getByRole('button',{name:'Section details and stops',exact:true});
    if (await disclosure.isVisible()) {
      await disclosure.click();
      await tour.getByRole('navigation',{name:'Page tour sections'}).waitFor({state:'visible'});
      await capture(page,`${tag}-tour-expanded`);
      await disclosure.click();
    }
    await page.keyboard.press('Escape');
    await tour.waitFor({state:'hidden'});
    assert.equal(await page.getByRole('dialog',{name:'Peggy, the Pegasus intake concierge'}).count(),0);
    assert.match(await page.evaluate(() => document.activeElement?.textContent || ''),/What are you working through/);
    await page.getByRole('button',{name:'Explore this with Peggy',exact:true}).first().click();
    const dialog = page.getByRole('dialog',{name:'Peggy, the Pegasus intake concierge'});
    await dialog.getByRole('textbox',{name:'Talk to Peggy'}).fill('Keep this synthetic question draft.');
    await dialog.getByRole('checkbox',{name:/Page context/}).uncheck();
    await dialog.getByRole('button',{name:/Show me around/}).click();
    await tour.waitFor({state:'visible'});
    await page.keyboard.press('Escape');
    await dialog.waitFor({state:'visible'});
    assert.equal(await dialog.getByRole('textbox',{name:'Talk to Peggy'}).inputValue(),'Keep this synthetic question draft.');
    assert.equal(await dialog.getByRole('checkbox',{name:/Page context/}).isChecked(),false);
    await dialog.getByRole('button',{name:'Close',exact:true}).click();
    await open(page, '/bring-an-opportunity?intent=property');
    const amounts = page.locator('details').filter({hasText:'Value and mortgage details (optional)'});
    assert.equal(await amounts.getAttribute('open'),null);
    await capture(page, `${tag}-owner-optional`);
    await a11y(page, `${tag} owner optionality`);
    await optional(page,'Value and mortgage details (optional)');
    await page.getByLabel('Estimated value (if known)').fill('650000');
    await optional(page,'Value and mortgage details (optional)');
    await page.getByRole('button',{name:'Continue',exact:true}).click();
    await page.getByRole('button',{name:'Back',exact:true}).click();
    await optional(page,'Value and mortgage details (optional)');
    assert.equal(await page.getByLabel('Estimated value (if known)').inputValue(),'650000');
    await open(page, '/buyers#buyer-criteria');
    const formOpenedAt = Date.now();
    const form = page.getByRole('form',{name:'Buying criteria'});
    await form.getByRole('heading',{name:'Share your buying criteria'}).waitFor();
    await page.waitForFunction(() => {
      const heading = document.querySelector('#buyer-criteria h2');
      if (!heading) return false;
      const bars = [...document.querySelectorAll('.site-nav,.journey-wayfinder')].map(element=>element.getBoundingClientRect()).filter(rect=>rect.height>0 && rect.top>=0 && rect.top<160);
      return heading.getBoundingClientRect().top >= Math.max(0,...bars.map(rect=>rect.bottom));
    });
    await capture(page,`${tag}-buyer-entry`);
    await a11y(page,`${tag} buyer entry`);
    await form.getByRole('button',{name:'Share buying criteria',exact:true}).click();
    await page.getByRole('alert').waitFor();
    // Error-summary insertion must not move the already focused control below
    // the viewport. Focus and scroll happen only after that DOM has settled.
    await page.waitForFunction(() => {
      const active = document.activeElement;
      if (!active?.matches('input[aria-invalid="true"]')) return false;
      const bounds = active.getBoundingClientRect();
      const bars = [...document.querySelectorAll('.site-nav,.journey-wayfinder')].map(element => element.getBoundingClientRect()).filter(rect=>rect.height>0 && rect.top>=0 && rect.top<160);
      const top = Math.max(0,...bars.map(rect=>rect.bottom));
      return bounds.top >= top && bounds.bottom <= innerHeight;
    });
    assert(await form.locator('[aria-invalid="true"]').count() >= 4,`${tag} missing field-specific errors`);
    await capture(page,`${tag}-buyer-validation`);
    await a11y(page,`${tag} buyer validation`);
    if (viewportName === 'phone' || viewportName === 'desktop') {
      const posts=[];
      await page.route('**/api/leads',async route=>{
        assert.equal(route.request().method(),'POST');
        posts.push({body:route.request().postDataJSON(),key:route.request().headers()['idempotency-key']});
        if(posts.length===1) await route.fulfill({status:503,contentType:'application/json',body:JSON.stringify({message:'PRIVATE_DIAGNOSTIC_DO_NOT_RENDER'})});
        else await route.fulfill({status:201,contentType:'application/json',body:JSON.stringify({id:701,stage:'new'})});
      });
      await form.getByRole('textbox',{name:/^First name/}).fill('Synthetic visitor');
      await form.getByRole('textbox',{name:/^Email/}).fill('visitor@example.invalid');
      await form.getByRole('combobox',{name:/^State or territory/}).selectOption('CA');
      await form.getByRole('button',{name:'Add target area',exact:true}).click();
      await form.getByRole('checkbox',{name:'Land',exact:true}).check();
      await form.getByRole('combobox',{name:/^Your purchasing role/}).selectOption('principal');
      await form.getByRole('checkbox',{name:/^Contact me about these criteria/}).check();
      // Honor the intake's existing three-second anti-abuse review interval.
      await new Promise(resolve=>setTimeout(resolve,Math.max(0,3100-(Date.now()-formOpenedAt))));
      await form.getByRole('button',{name:'Share buying criteria',exact:true}).click();
      await page.waitForFunction(() => [...document.querySelectorAll('[role="alert"]')].some(e=>/confirm|record|try again/i.test(e.textContent || '')));
      assert.equal(posts.length,1);
      assert(!(await form.innerText()).includes('PRIVATE_DIAGNOSTIC_DO_NOT_RENDER'));
      await capture(page,`${tag}-buyer-service-error`);
      assert.equal(await form.getByRole('textbox',{name:/^First name/}).inputValue(),'Synthetic visitor');
      await form.getByRole('button',{name:/Share buying criteria|Retry/}).click();
      await page.getByText('Reference: 701',{exact:true}).waitFor();
      assert.equal(posts.length,2);assert(posts[0].key);assert.equal(posts[0].key,posts[1].key);
      const {ts_elapsed_ms: firstElapsed, ...firstBody} = posts[0].body;
      const {ts_elapsed_ms: secondElapsed, ...secondBody} = posts[1].body;
      assert.deepEqual(firstBody,secondBody);
      assert.equal(posts[1].body.leadData.buyerAlertConsent.emailOptIn,false);
      await capture(page,`${tag}-buyer-receipt`);requests.push({tag,attempts:posts.length,stableRetryKey:true});
    }
    results.push({tag,passed:true});
    await context.close();
  }
  assert.deepEqual(pageErrors,[]);
  await writeFile(path.join(out,'results.json'),JSON.stringify({testedSha,environment:'isolated local production build; synthetic APIs only',results,requests,screenshots,pageErrors},null,2));
  console.log(`PASS ${results.length} viewport/theme journeys, ${screenshots.length} screenshots. Source ${testedSha}`);
} catch(error) {
  await writeFile(path.join(out,'failure.json'),JSON.stringify({testedSha,results,screenshots,pageErrors,error:String(error),stack:error.stack},null,2));
  throw error;
} finally { await browser.close(); await new Promise(resolve=>server.close(resolve)); }
