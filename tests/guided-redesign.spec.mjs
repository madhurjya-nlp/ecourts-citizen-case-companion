import { test, expect } from '@playwright/test';

for (const width of [360,390,1440]) {
  test(`guided screens and centered Nayak at ${width}px`, async ({page}) => {
    await page.setViewportSize({width,height:844});
    const errors=[];
    page.on('pageerror', e=>errors.push(e.message));
    await page.goto('/index.html');
    await page.locator('[data-action="tour-skip"]').click();
    await expect(page.locator('.dock button')).toHaveCount(5);
    await expect(page.locator('.dock button').nth(2)).toHaveAccessibleName('Nayak');
    await expect(page.locator('.dock button').last()).toHaveText('Help');
    await expect(page.locator('.home-intro')).toContainText('Justice. Closer to You.');
    await expect(page.locator('.guided-card')).toHaveCount(4);
    const homeHierarchy = await page.evaluate(() => ({
      inputHeight: document.querySelector('#home-query').getBoundingClientRect().height,
      submitHeight: document.querySelector('#home-search button').getBoundingClientRect().height,
      actionsBottom: document.querySelector('.guided-actions').getBoundingClientRect().bottom,
      scannerTop: document.querySelector('.scanner-teaser').getBoundingClientRect().top,
    }));
    expect(homeHierarchy.inputHeight).toBeGreaterThanOrEqual(44);
    expect(homeHierarchy.submitHeight).toBeGreaterThanOrEqual(44);
    expect(homeHierarchy.scannerTop).toBeGreaterThanOrEqual(homeHierarchy.actionsBottom);
    const check = async name => {
      expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBe(width);
      await expect(page.locator('.dock [aria-current="page"]')).toHaveCount(1);
      await page.screenshot({path:`output/playwright/guided-${name}-${width}.png`,fullPage:true,animations:"disabled"});
    };
    await check('home');
    await page.locator('.dock [data-go="finder"]').click();
    await expect(page.locator('.guided-steps li')).toHaveCount(3);
    await page.locator('[data-tab="number"]').click();
    await page.locator('#query').fill('DEMO-CIV-114-2026');
    await page.locator('[name="year"]').selectOption('2025');
    await page.locator('#query').press('Enter');
    await expect(page.locator('.finder-empty')).toBeVisible();
    await page.locator('#query').fill('DEMO-CIV-114-2026');
    await page.locator('[name="year"]').selectOption('2026');
    await page.locator('#query').press('Enter');
    await expect(page.locator('.finder-result')).toContainText('Demo Petitioner A');
    await page.locator('[data-tab="advocate"]').click();
    await page.locator('#query').fill('Demo Advocate A');
    await page.locator('#query').press('Enter');
    await expect(page.locator('.finder-result')).toContainText('Demo Advocate A');
    await page.locator('[data-tab="number"]').click();
    await check('finder');
    await page.locator('.dock [data-go="courts"]').click();
    await expect(page.locator('.guided-service-card')).toHaveCount(6);
    await check('services');
    await page.locator('.guided-service-card').first().click();
    await expect(page.getByRole('dialog')).toContainText('does not file applications');
    await page.keyboard.press('Escape');
    await page.locator('.dock [data-go="help"]').click();
    await expect(page).toHaveURL(/#help$/u);
    await expect(page.locator('.help-guide-action')).toHaveCount(4);
    await expect(page.locator('.knowledge-base')).toHaveCount(2);
    await page.locator('.dock [data-action="home"]').click();
    await page.locator('.guided-card[data-go="paper"]').click();
    await expect(page).toHaveURL(/#finder\/paper$/u);
    await expect(page.locator('.finder-page h1')).toHaveText('Find a Case');
    await expect(page.locator('[data-tab="paper"]')).toHaveAttribute('aria-selected','true');
    await expect(page.locator('.paper-benefits')).toContainText('Key dates and next steps');
    await check('paper');
    await page.locator('#paper-upload').setInputFiles({name:'invalid.txt',mimeType:'text/plain',buffer:Buffer.from('not a court paper')});
    await expect(page.locator('.paper-selection')).toHaveClass(/invalid/);
    await expect(page.locator('.paper-analyse')).toBeDisabled();
    await page.locator('#paper-upload').setInputFiles({name:'sample.pdf',mimeType:'application/pdf',buffer:Buffer.from('%PDF-1.4 synthetic test')});
    await expect(page.locator('.paper-analyse')).toBeEnabled();
    await page.locator('.nayak-dock').click();
    await expect(page.locator('.nyk-panel')).toBeVisible();
    await expect(page.locator('.nyk-mic')).toBeVisible();
    await page.screenshot({path:`output/playwright/guided-nayak-${width}.png`,fullPage:true,animations:"disabled"});
    await page.keyboard.press('Escape');
    await expect(page.locator('.nyk-panel')).toHaveCount(0);
    expect(errors).toEqual([]);
  });
}
