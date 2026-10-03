/** Rendered shared-journey acceptance. Blocks writes and all remote services. */
import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright-core';
import { checkPublicRouteContinuity } from './public-route-continuity-check.mjs';
import { openAvailablePeggy } from './peggy-ui-test-helpers.mjs';
import { closeWithinDeadline, runWithinDeadline } from './rendered-qa-liveness.mjs';
process.env.APP_ENV='preview'; process.env.SITE_INDEXABLE='false'; process.env.DATABASE_URL='';
const {default:app}=await import('../server.mjs');
const server=app.listen(0,'127.0.0.1'); await new Promise(resolve=>server.once('listening',resolve));
const origin=`http://127.0.0.1:${server.address().port}`;
const out=process.env.JOURNEY_SCREENSHOT_DIR || '/tmp/pegasus-journey-qa'; await mkdir(out,{recursive:true});
const axe=await readFile(new URL('../node_modules/axe-core/axe.min.js',import.meta.url),'utf8');
const evidence=[]; let browser; let currentPage; let lastPhase='initialization'; let failure;
async function phase(label, operation, timeoutMs) {
  lastPhase=label;
  console.log(`[journey:start] ${label}`);
  const result=await runWithinDeadline(label,operation,timeoutMs);
  console.log(`[journey:pass] ${label}`);
  return result;
}
async function capture(page,key,state) {
  await phase(`${key}/${state}/fonts`,()=>page.evaluate(async()=>{await document.fonts.ready;}));
  await phase(`${key}/${state}/images`,()=>page.evaluate(async()=>{await Promise.all([...document.images].filter(img=>img.getBoundingClientRect().top<innerHeight).map(img=>img.decode().catch(()=>{})));}));
  assert(await phase(`${key}/${state}/geometry`,()=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)),`${key}/${state}: overflow`);
  await phase(`${key}/${state}/load-axe`,()=>page.addScriptTag({content:axe}));
  const violations=await phase(`${key}/${state}/axe`,()=>page.evaluate(async()=> (await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}})).violations.map(item=>({id:item.id,nodes:item.nodes.map(node=>node.target)}))));
  await phase(`${key}/${state}/screenshot`,()=>page.screenshot({path:path.join(out,`${key}-${state}.png`)}));
  assert.deepEqual(violations,[],`${key}/${state}: accessibility`);
  evidence.push({key,state,screenshot:`${key}-${state}.png`,axeViolations:0,overflow:false});
}
try {
 for(const width of process.env.JOURNEY_WIDTH ? [Number(process.env.JOURNEY_WIDTH)] : [320,390,768,1536]) for(const theme of ['light','dark']) {
  const key=`${width}-${theme}`;
  await phase(`${key}/complete-journey`,async()=>{
  browser=await chromium.launch({executablePath:process.env.CHROME_PATH || chromium.executablePath(),headless:true,ignoreDefaultArgs:['--enable-unsafe-swiftshader'],args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu','--disable-software-rasterizer','--single-process','--no-zygote']});
  const context=await browser.newContext({viewport:{width,height:width<768?844:1024},reducedMotion:'reduce'});
  const writes=[],errors=[];
  await context.route('**/*',route=>{if(route.request().method()!=='GET'){writes.push(route.request().url());return route.abort();} return new URL(route.request().url()).origin===origin?route.continue():route.abort();});
  await context.addInitScript(theme=>{localStorage.setItem('pegasus-ui-theme',theme);localStorage.setItem('pegasus-cookie-consent',JSON.stringify({essential:true,analytics:false,marketing:false,decidedAt:'2026-01-01T00:00:00.000Z'}));},theme);
  const page=await context.newPage();currentPage=page;page.on('pageerror',error=>errors.push(error.message));
  await checkPublicRouteContinuity(page, origin, (label,operation)=>phase(`${key}/route-continuity/${label}`,operation));
  await page.goto(origin+'/'); await page.locator('.home-pathways').waitFor();
  await page.locator('#home-paths-title').evaluate(el=>el.scrollIntoView({block:'start'}));
  const pathways=page.locator('.home-pathways');
  await pathways.getByRole('link').last().evaluate(el=>el.focus({preventScroll:true}));
  assert.equal(await pathways.getAttribute('data-preview'),'2');
  assert.equal(await pathways.getByRole('link').last().getAttribute('href'),'/deal-partners');
  const rows=await pathways.locator('.experience-path').evaluateAll(links=>links.map(link=>({top:link.getBoundingClientRect().top,bottom:link.getBoundingClientRect().bottom,title:link.querySelector('strong').getBoundingClientRect().left,arrow:link.querySelector(':scope > svg').getBoundingClientRect().right})));
  for(let i=1;i<rows.length;i++) assert(rows[i].top >= rows[i-1].bottom-1,`${width}: directory rows do not overlap`);
  for(const key of ['title','arrow']) assert(Math.max(...rows.map(row=>row[key]))-Math.min(...rows.map(row=>row[key])) < 2,`${width}: directory ${key} alignment`);
  await capture(page,key,'illustrated-pathways');
  await openAvailablePeggy(page, { pageGuide: true });
  if(width >= 1440) {
    await page.waitForFunction(()=>document.querySelector('[data-peggy-page]').getBoundingClientRect().right <= document.querySelector('.peggy-panel').getBoundingClientRect().left+1);
    assert(await page.locator('.experience-path').last().isVisible(),`${key}: routes remain visible beside Peggy`);
    await page.locator('#home-proof-title').evaluate(el=>el.scrollIntoView({block:'start'}));
    await page.waitForFunction(()=>document.querySelector('.peggy-location > summary')?.textContent.includes('Nelson Drive'));
    await page.locator('#home-paths-title').evaluate(el=>el.scrollIntoView({block:'start'}));
    await page.waitForFunction(()=>document.querySelector('.peggy-location > summary')?.textContent.includes('What brings you here'));
    await page.locator('.peggy-close').click();
    assert(await page.locator('[data-peggy-page]').evaluate(el=>Math.abs(el.getBoundingClientRect().width-innerWidth)<2),`${key}: closing restores page width`);
    await openAvailablePeggy(page, { pageGuide: true });
  }
  await capture(page,key,'companion-field-note');
  await page.locator('.peggy-panel').getByRole('button',{name:/Show me around/}).click();
  const sectionDetails=page.getByRole('button',{name:'Section details and stops',exact:true});
  if(await sectionDetails.isVisible()) {
    assert.equal(await sectionDetails.getAttribute('aria-expanded'),'false',`${key}: compact tour details start collapsed`);
    await sectionDetails.click();
    assert.equal(await sectionDetails.getAttribute('aria-expanded'),'true',`${key}: compact tour details expand`);
  }
  const trail=page.getByRole('navigation',{name:'Page tour sections'});
  await trail.waitFor();
  assert.equal(await trail.getByRole('button').count(),await page.locator('[data-peggy-page] h1,[data-peggy-page] h2').count());
  await trail.getByRole('button').nth(1).click();
  assert.equal(await trail.getByRole('button').nth(1).getAttribute('aria-current'),'step');
  if(width >= 1440) assert(await page.evaluate(()=>document.querySelector('[data-peggy-page]').getBoundingClientRect().right <= document.querySelector('.peggy-tour').getBoundingClientRect().left+1),`${key}: tour leaves page visible`);
  await capture(page,key,'tour-trail');
  if(width >= 1440) {
    // Exercise the guide's supported longer outlines without changing public copy.
    await page.locator('[data-peggy-page]').evaluate(el=>{const fixture=document.createElement('div');fixture.dataset.tourFixture='';for(let i=0;i<12;i++){const h=document.createElement('h2');h.textContent=`Synthetic tour stop ${i+1}`;fixture.append(h);}el.append(fixture);});
    await page.waitForFunction(()=>document.querySelectorAll('.peggy-tour-trail button').length===18);
    await trail.getByRole('button').last().click();
    assert(await trail.getByRole('button').last().evaluate(el=>{const r=el.getBoundingClientRect(),n=el.closest('nav').getBoundingClientRect();return r.top>=n.top-1 && r.bottom<=n.bottom+1;}),`${key}: active stop stays visible in a longer outline`);
    assert(await page.locator('.peggy-tour-controls').evaluate(el=>el.getBoundingClientRect().bottom<=innerHeight),`${key}: longer outline leaves tour controls reachable`);
    await capture(page,key,'long-outline-fixture');
    await trail.getByRole('button').nth(1).click();
    await page.locator('[data-tour-fixture]').evaluate(el=>el.remove());
    await page.waitForFunction(()=>document.querySelectorAll('.peggy-tour-trail button').length===6);
  }
  if(await sectionDetails.isVisible() && await sectionDetails.getAttribute('aria-expanded') === 'false') await sectionDetails.click();
  await trail.getByRole('button').nth(1).press('ArrowRight');
  assert.equal(await trail.getByRole('button').nth(2).getAttribute('aria-current'),'step');
  assert(await trail.getByRole('button').nth(2).evaluate(el=>el===document.activeElement));
  await page.goto(origin+'/property-owners'); await page.locator('.ep-opening').waitFor();
  await capture(page,key,'opening');
  assert.equal(await page.locator('.journey-wayfinder').count(),0);
  await page.locator('.ep-opening').getByRole('button',{name:'Show me around',exact:true}).click();
  const tour=page.getByRole('complementary',{name:'Peggy page guide'}); await tour.waitFor();
  await tour.getByRole('button',{name:'Next section',exact:true}).click();
  await capture(page,key,'guided-owner');
  await tour.getByRole('button',{name:'Ask about this'}).click();
  const panel=page.locator('.peggy-panel');const input=panel.getByRole('textbox',{name:'Talk to Peggy'});
  await input.fill('Please keep my own question.');
  await panel.getByRole('button',{name:'Close',exact:true}).click();
  await page.locator('#owner-path .journey-explain').click();
  assert.equal(await input.inputValue(),'Please keep my own question.');
  await capture(page,key,'preserved-draft');
  await panel.getByRole('button',{name:'Keep my draft'}).click();
  await panel.getByRole('button',{name:'Close',exact:true}).click();
  await page.locator('[data-testid="situation-stepper"] h2').evaluate(el=>el.scrollIntoView({block:'start'}));
  const toggle=page.locator('.journey-section-toggle');await toggle.waitFor();await toggle.click();
  await capture(page,key,'page-outline');
  await page.keyboard.press('Escape');assert.equal(await toggle.getAttribute('aria-expanded'),'false');
  await toggle.click();await page.locator('.journey-outline button').last().click();
  assert(await page.evaluate(()=>document.activeElement?.tagName==='H2'));
  await page.locator('.ep-closing .journey-before summary').click();
  await capture(page,key,'closing');
  assert.equal(await page.locator('.journey-continuation').count(),0,`${key}: owners keeps one closing`);
  // The owner and Our Work pages end with their own closing; the process page retains curated onward links.
  await page.goto(origin+'/how-we-operate');await page.locator('.ep-opening').waitFor();
  const next=page.getByRole('navigation',{name:'Related reading'});await next.scrollIntoViewIfNeeded();await capture(page,key,'continuation');
  await next.getByRole('link',{name:/See the work/}).click();await page.getByRole('heading',{name:'Nelson Drive, documented.'}).waitFor();
  assert.equal(await page.locator('.journey-continuation').count(),0,`${key}: Our Work keeps one closing`);
  await page.goto(origin+'/tools');await page.locator('.tools-finder').waitFor();await capture(page,key,'tools');
  await page.getByRole('button',{name:'Explore eight calculators'}).click();
  assert.equal(await page.locator('.tools-calculators a').count(),8);await capture(page,key,'calculators');
  await page.getByRole('button',{name:/Continue my work/}).click();
  assert.equal(await page.getByRole('link',{name:'View saved work'}).getAttribute('href'),'/saved');
  await page.getByRole('button',{name:/Check a number/}).click();await page.getByRole('link',{name:/After-repair value/}).click();
  await page.waitForURL('**/strategy-lab?tool=calculators&tab=arv');
  for (const tab of ['arv','roi','brrrr','cashflow','wholesale','piti','ownvsrent','hardmoney']) {
    await page.getByTestId(`tab-${tab}`).click();
    const collisions = await page.locator('.id-calculators input.pl-10:visible').evaluateAll(inputs => inputs.flatMap(input => {
      const icon = input.parentElement.querySelector('svg');
      if (!icon) return [];
      const style = getComputedStyle(input);
      const textLeft = input.getBoundingClientRect().left + parseFloat(style.borderLeftWidth) + parseFloat(style.paddingLeft);
      return textLeft < icon.getBoundingClientRect().right + 4 ? [{id:input.id,textLeft,iconRight:icon.getBoundingClientRect().right}] : [];
    }));
    assert.deepEqual(collisions, [], `${key}/${tab}: field text clears currency/percent icons`);
  }

  assert.equal(await page.locator('.journey-continuation,.journey-wayfinder').count(),0);
  await page.goto(origin+'/bring-an-opportunity');await page.getByRole('heading').first().waitFor();
  assert.equal(await page.locator('.journey-continuation,.journey-wayfinder').count(),0);
  if(width < 768 && theme === 'light') {
    await page.goto(origin+'/property-owners');await page.locator('.ep-opening').waitFor();
    await page.locator('[data-testid="situation-stepper"] h2').evaluate(el=>el.scrollIntoView({block:'start'}));
    await page.locator('.journey-section-toggle').waitFor();await page.locator('.journey-section-toggle').click();
    await page.evaluate(()=>{const sizes=[...document.querySelectorAll('body *')].filter(el=>el instanceof HTMLElement).map(el=>[el,parseFloat(getComputedStyle(el).fontSize)]);for(const [el,size] of sizes) el.style.fontSize=`${size*2}px`;});
    await page.addStyleTag({content:'.journey-wayfinder button{font-size:26px!important}.journey-section-name{font-size:24px!important}.journey-section-count,.journey-outline button>span{font-size:20px!important}.journey-wayfinder-ask{font-size:22px!important}'});
    await page.locator('[data-testid="situation-stepper"] h2').evaluate(el=>el.scrollIntoView({block:'start'}));
    await page.locator('.journey-section-toggle').waitFor();
    await page.waitForFunction(()=>document.querySelector('.journey-wayfinder')?.getBoundingClientRect().top >= document.querySelector('.site-nav').getBoundingClientRect().bottom - 1);
    if(!await page.locator('.journey-outline').count()) await page.locator('.journey-section-toggle').click();
    assert(await page.evaluate(()=>(()=>{const brand=document.querySelector('.site-brand').getBoundingClientRect(),menu=document.querySelector('.site-menu-button').getBoundingClientRect();return brand.right <= menu.left || brand.bottom <= menu.top;})()),`${key}: enlarged navigation collision`);
    await capture(page,key,'enlarged-text');
  }
  assert.deepEqual(writes,[],`${key}: unexpected service writes`);assert.deepEqual(errors,[],`${key}: page errors`);
  await phase(`${key}/browser-close`,()=>closeWithinDeadline(`${key} browser`,()=>browser.close()));
  browser=undefined;
  console.log(`${key}: Rendered states and complete guide / choice / continuation journeys passed`);
  },90_000);
 }
 await writeFile(path.join(out,'results.json'),JSON.stringify({source:process.env.TESTED_SOURCE_SHA || 'working tree',serviceMode:'Local, no writes or live services',checks:evidence.length,results:evidence},null,2));
} catch(error) {
  failure=error;
  console.error(`[journey:failed] Last phase: ${lastPhase}`,error);
  try { await runWithinDeadline('journey failure screenshot',()=>currentPage?.screenshot({path:path.join(out,'failure.png')}),5_000); }
  catch(diagnosticError) { console.error('[journey:diagnostic-failed]',diagnosticError); }
  try { await runWithinDeadline('journey failure evidence',()=>writeFile(path.join(out,'failure.json'),JSON.stringify({lastPhase,error:String(error),stack:error?.stack,checks:evidence.length,results:evidence},null,2)),5_000); }
  catch(diagnosticError) { console.error('[journey:diagnostic-failed]',diagnosticError); }
} finally {
  for(const [label,close] of [
    ['journey browser',()=>browser?.close()],
    ['journey server',()=>{server.closeAllConnections();return new Promise((resolve,reject)=>server.close(error=>error?reject(error):resolve()));}],
  ]) {
    try { await closeWithinDeadline(label,close); }
    catch(cleanupError) { console.error('[journey:cleanup-failed]',cleanupError); failure??=cleanupError; }
  }
}
// A timed-out browser RPC can retain its transport. Fail finitely after the
// original error, diagnostic attempts and bounded cleanup have been recorded.
if(failure) { console.error(failure); process.exit(1); }
