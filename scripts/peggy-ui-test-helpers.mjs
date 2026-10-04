/** Open Peggy through the invitation currently available to the visitor. */
export async function openAvailablePeggy(page, { pageGuide = false } = {}) {
  // A navigation's document load can finish before its lazy public page mounts.
  await page.locator('[data-peggy-page] h1').first().waitFor();
  let opened = false;
  let preparesSectionQuestion = false;
  for (const selector of ['[data-peggy-invitation]', '.journey-wayfinder-ask', '.peggy-fab']) {
    for (const trigger of await page.locator(selector).all()) {
      if (!await trigger.isVisible()) continue;
      const inViewport = await trigger.evaluate(element => {
        const rect = element.getBoundingClientRect();
        const top = Math.max(0, document.querySelector('.site-nav')?.getBoundingClientRect().bottom ?? 0);
        return rect.top >= top && rect.bottom <= innerHeight && rect.left >= 0 && rect.right <= innerWidth;
      });
      if (!inViewport) continue;
      preparesSectionQuestion = await trigger.evaluate(element => element.matches('.journey-explain,.journey-wayfinder-ask'));
      await trigger.click();
      opened = true;
      break;
    }
    if (opened) break;
  }
  if (!opened) {
    await page.getByRole('button', { name: 'Open menu', exact: true }).click();
    await page.getByRole('button', { name: 'Talk to Peggy', exact: true }).click();
  }
  await page.locator('.peggy-panel.is-open,.peggy-tour').first().waitFor();
  if (await page.locator('.peggy-tour').isVisible()) {
    preparesSectionQuestion = true;
    await page.locator('.peggy-tour').getByRole('button', { name: 'Ask about this', exact: true }).click();
  }
  await page.locator('.peggy-panel.is-open').waitFor();
  const back = page.locator('.peggy-panel').getByRole('button', { name: 'Back to page guide', exact: true });
  if (pageGuide && await back.isVisible()) await back.click();
  return { preparesSectionQuestion };
}
