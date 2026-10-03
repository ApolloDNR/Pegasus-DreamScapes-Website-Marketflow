import assert from 'node:assert/strict';

/** Exercise real history and route-shell boundaries with no form submission. */
export async function checkPublicRouteContinuity(page, origin) {
  const top = async (name) => {
    await page.getByRole('heading', { name, exact: true, level: 1 }).waitFor();
    await page.waitForFunction(() => Math.abs(window.scrollY) < 2);
    assert(await page.locator('main h1').evaluate(element => element === document.activeElement), `${name}: destination heading owns focus`);
  };
  const ownerFooter = async () => {
    const group = page.locator('footer details').filter({has:page.locator('summary').filter({hasText:'Real Estate'})});
    if (await group.getAttribute('open') === null) await group.locator('summary').click();
    await group.getByRole('link', {name:'Property owners',exact:true}).click();
    await top('A clear next step for your property.');
  };
  await page.goto(origin + '/work-with-apollo');
  await top('Buy or sell with Apollo.');
  await page.getByRole('link', {name:'Discuss representation',exact:true}).click();
  await page.waitForURL('**/work-with-apollo#apollo-paths');
  await page.waitForFunction(() => Math.abs(document.getElementById('apollo-paths').getBoundingClientRect().top) < 200);
  const before = await page.evaluate(() => scrollY);
  await page.getByRole('link', {name:'Explore the buyer paths',exact:true}).click();
  await top('Find a property with a plan.');
  await page.goBack();
  await page.getByRole('heading', {name:'Buy or sell with Apollo.',exact:true,level:1}).waitFor();
  await page.waitForFunction(y => Math.abs(scrollY-y) < 6, before);
  await page.goForward();
  await page.getByRole('heading', {name:'Find a property with a plan.',exact:true,level:1}).waitFor();
  await page.waitForFunction(() => Math.abs(scrollY) < 2);
  await ownerFooter();

  await page.goto(origin + '/deal-blueprint');
  await top('Request a Property Review.');
  await page.getByRole('link',{name:'Request a Property Review',exact:true}).first().click();
  await page.waitForURL(url => url.pathname === '/bring-an-opportunity' && url.searchParams.get('intent') === 'blueprint');
  await page.locator('.intake-page h1').filter({hasText:'Request a Property Review.'}).waitFor();
  await page.goBack();
  await page.waitForURL(url => url.pathname === '/deal-blueprint');
  await page.locator('.ep-opening h1').filter({hasText:'Request a Property Review.'}).waitFor();
  await ownerFooter();

  await page.goto(origin + '/projects/nelson-dr#project-gallery');
  await page.getByRole('heading',{name:'Before, during, and after.',exact:true}).waitFor();
  await page.waitForFunction(() => {
    const target = document.getElementById('project-gallery');
    const nav = document.querySelector('.site-nav');
    const top = target?.getBoundingClientRect().top;
    return top !== undefined && top >= nav.getBoundingClientRect().bottom && top < innerHeight / 2;
  });
  return {forwardTop:true,backForwardRestoration:true,footerShellCrossing:true,deepLink:true};
}
