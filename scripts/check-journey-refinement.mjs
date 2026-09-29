/** Rendered shared-journey acceptance. Blocks writes and all remote services. */
import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright-core';
process.env.APP_ENV='preview'; process.env.SITE_INDEXABLE='false'; process.env.DATABASE_URL='';
const {default:app}=await import('../server.mjs');
const server=app.listen(0,'127.0.0.1'); await new Promise(resolve=>server.once('listening',resolve));
const origin=`http://127.0.0.1:${server.address().port}`;
const out=process.env.JOURNEY_SCREENSHOT_DIR || '/tmp/pegasus-journey-qa'; await mkdir(out,{recursive:true});
const axe=await readFile(new URL('../node_modules/axe-core/axe.min.js',import.meta.url),'utf8');
const evidence=[]; let browser; let currentPage;
async function capture(page,key,state) {
  await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].filter(img=>img.getBoundingClientRect().top<innerHeight).map(img=>img.decode().catch(()=>{})));});
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${key}/${state}: overflow`);
  await page.addScriptTag({content:axe});
  const violations=await page.evaluate(async()=> (await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}})).violations.map(item=>({id:item.id,nodes:item.nodes.map(node=>node.target)})));
  await page.screenshot({path:path.join(out,`${key}-${state}.png`)});
  assert.deepEqual(violations,[],`${key}/${state}: accessibility`);
  evidence.push({key,state,screenshot:`${key}-${state}.png`,axeViolations:0,overflow:false});
}
try {
 for(const width of process.env.JOURNEY_WIDTH ? [Number(process.env.JOURNEY_WIDTH)] : [320,390,768,1536]) for(const theme of ['light','dark']) {
  const key=`${width}-${theme}`;
  browser=await chromium.launch({executablePath:process.env.CHROME_PATH || chromium.executablePath(),headless:true,ignoreDefaultArgs:['--enable-unsafe-swiftshader'],args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu','--disable-software-rasterizer','--single-process','--no-zygote']});
  const context=await browser.newContext({viewport:{width,height:width<768?844:1024},reducedMotion:'reduce'});
  const writes=[],errors=[];
  await context.route('**/*',route=>{if(route.request().method()!=='GET'){writes.push(route.request().url());return route.abort();} return new URL(route.request().url()).origin===origin?route.continue():route.abort();});
  await context.addInitScript(theme=>{localStorage.setItem('pegasus-ui-theme',theme);localStorage.setItem('pegasus-cookie-consent',JSON.stringify({essential:true,analytics:false,marketing:false,decidedAt:'2026-01-01T00:00:00.000Z'}));},theme);
  const page=await context.newPage();currentPage=page;page.on('pageerror',error=>errors.push(error.message));
  await page.goto(origin+'/'); await page.locator('.home-pathways').waitFor();
  await page.locator('#home-paths-title').evaluate(el=>el.scrollIntoView({block:'start'}));
  const pathways=page.locator('.home-pathways');
  await pathways.getByRole('link').last().evaluate(el=>el.focus({preventScroll:true}));
  assert.equal(await pathways.getAttribute('data-preview'),'2');
  assert.equal(await pathways.getByRole('link').last().getAttribute('href'),'/deal-partners');
  if(width >= 768) {
    const rows=await pathways.locator('.experience-path').evaluateAll(links=>links.map(link=>({top:link.getBoundingClientRect().top,note:link.querySelector('.home-path-copy > span').getBoundingClientRect().top,arrow:link.querySelector(':scope > svg').getBoundingClientRect().bottom})));
    for(const key of ['top','note','arrow']) assert(Math.max(...rows.map(row=>row[key]))-Math.min(...rows.map(row=>row[key])) < 2,`${width}: directory ${key} alignment`);
  }
  await capture(page,key,'illustrated-pathways');
  if(await page.locator('.peggy-fab').isVisible()) await page.locator('.peggy-fab').click();
  else { await page.getByRole('button',{name:'Open menu',exact:true}).click(); await page.getByRole('button',{name:'Talk to Peggy',exact:true}).click(); }
  await page.locator('.peggy-panel.is-open').waitFor();
  await capture(page,key,'companion-field-note');
  await page.locator('.peggy-panel').getByRole('button',{name:/Show me around/}).click();
  const trail=page.getByRole('navigation',{name:'Page tour sections'});
  assert.equal(await trail.getByRole('button').count(),await page.locator('[data-peggy-page] h1,[data-peggy-page] h2').count());
  await trail.getByRole('button').nth(1).click();
  assert.equal(await trail.getByRole('button').nth(1).getAttribute('aria-current'),'step');
  await capture(page,key,'tour-trail');
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
  const next=page.locator('.journey-continuation');await next.scrollIntoViewIfNeeded();await capture(page,key,'continuation');
  await next.getByRole('link',{name:/See the work/}).click();await page.getByRole('heading',{name:'The work, in detail.'}).waitFor();
  await page.goto(origin+'/tools');await page.locator('.tools-finder').waitFor();await capture(page,key,'tools');
  await page.getByRole('button',{name:'Explore eight calculators'}).click();
  assert.equal(await page.locator('.tools-calculators a').count(),8);await capture(page,key,'calculators');
  await page.getByRole('button',{name:/Continue my work/}).click();
  assert.equal(await page.getByRole('link',{name:'View saved work'}).getAttribute('href'),'/saved');
  await page.getByRole('button',{name:/Check a number/}).click();await page.getByRole('link',{name:/After-repair value/}).click();
  await page.waitForURL('**/strategy-lab?tool=calculators&tab=arv');
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
  await browser.close();console.log(`${key}: Rendered states and complete guide / choice / continuation journeys passed`);
 }
 await writeFile(path.join(out,'results.json'),JSON.stringify({source:process.env.TESTED_SOURCE_SHA || 'working tree',serviceMode:'Local, no writes or live services',checks:evidence.length,results:evidence},null,2));
} catch(error) { await currentPage?.screenshot({path:path.join(out,'failure.png')}).catch(()=>{}); throw error; }
finally {await browser?.close();server.close();}
