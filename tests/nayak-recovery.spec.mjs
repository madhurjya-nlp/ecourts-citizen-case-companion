import {test,expect} from '@playwright/test';

for (const width of [360, 900]) {
  test(`menu drawer and failed chat remain navigable at ${width}px`, async ({page}) => {
    await page.setViewportSize({width,height:560});
    await page.goto('/index.html');
    await page.locator('[data-action="tour-skip"]').click();
    await page.locator('[data-action="menu"]').click();
    const menu=page.locator('.menu');
    await expect(menu).toHaveCSS('background-color','rgb(255, 255, 255)');
    await expect(menu.locator('.menu-close')).toBeInViewport();
    await expect(menu.locator('[data-voice-controls]')).toHaveCount(0);
    await page.screenshot({animations:"disabled",path:`output/playwright/menu-fixed-${width}.png`});
    await menu.locator('.menu-close').click();
    await expect(menu).toHaveCount(0);
    await expect(page.locator('[data-action="menu"]')).toBeFocused();
    let requests=0;
    await page.route('**/chat',route => {
      requests++;
      return requests===1 ? route.abort('failed') : route.fulfill({json:{answer:'This is a sample response. '.repeat(90),answer_type:'case',boundary:'Sample only.'}});
    });
    await page.locator('.nayak-dock').click();
    await page.locator('.nyk-starter').first().click();
    await expect(page.locator('.nyk-error')).toContainText('couldn’t connect');
    await expect(page.locator('.nyk-remaining')).toContainText('12');
    await expect(page.locator('.nyk-back-button')).toBeInViewport();
    await expect(page.locator('.nyk-head button[aria-label="Close"]')).toBeInViewport();
    await expect(page.locator('.nyk-message.user')).toHaveCSS('color','rgb(45, 27, 98)');
    await page.screenshot({animations:"disabled",path:`output/playwright/nayak-error-fixed-${width}.png`});
    await page.locator('.nyk-return').click();
    await expect(page.locator('.nyk-panel')).toHaveCount(0);
    await expect(page.locator('.nayak-dock')).toBeFocused();
    await page.locator('.nayak-dock').click();
    await page.locator('.nyk-retry').click();
    await expect(page.locator('.nyk-message.assistant').last()).toContainText('sample response');
    await expect(page.locator('.nyk-remaining')).toContainText('11');
    await expect(page.locator('.nyk-back-button')).toBeInViewport();
    await expect(page.locator('.nyk-form textarea')).toBeInViewport();
    const metrics=await page.locator('.nyk-body').evaluate(e=>({height:e.clientHeight,scroll:e.scrollHeight}));
    expect(metrics.scroll).toBeGreaterThan(metrics.height);
    await page.locator('.nyk-back-button').click();
    await expect(page.locator('.nyk-panel')).toHaveCount(0);
    expect(requests).toBe(2);
  });
}

test('rate-limit error and pending cancellation have usable exits', async ({page}) => {
  await page.goto('/index.html');
  await page.route('**/chat',r=>r.fulfill({status:429,json:{error:'Limit reached'}}));
  await page.locator('.nayak-dock').click();
  await page.locator('.nyk-starter').first().click();
  await expect(page.locator('.nyk-error')).toContainText('Wait a minute');
  await page.locator('.nyk-back-button').click();
  await expect(page.locator('.nyk-panel')).toHaveCount(0);
  await page.unroute('**/chat');
  await page.route('**/chat',async r=>{await new Promise(resolve=>setTimeout(resolve,1000));await r.fulfill({json:{answer:'Late response'}}).catch(()=>{});});
  await page.locator('.nayak-dock').click();
  await page.locator('.nyk-retry').click();
  await expect(page.locator('.nyk-loading')).toBeVisible();
  await page.locator('.nyk-back-button').click();
  await expect(page.locator('.nyk-panel')).toHaveCount(0);
  await expect(page.locator('.nayak-dock')).toBeFocused();
});
