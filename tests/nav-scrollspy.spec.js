const { test, expect } = require('@playwright/test');

test.describe('phase-nav scroll-spy', () => {
  test('no nav link is active while still in the hero (above the first section)', async ({ page }) => {
    await page.goto('/a320-pilota-reale.html');
    await expect(page.locator('#navlinks a.active')).toHaveCount(0);
  });

  test('scrolling into the first section activates its nav link', async ({ page }) => {
    await page.goto('/a320-pilota-reale.html');
    await page.locator('#mentalita').scrollIntoViewIfNeeded();
    await page.waitForTimeout(150);

    const active = page.locator('#navlinks a.active');
    await expect(active).toHaveCount(1);
    await expect(active).toHaveAttribute('href', '#mentalita');
  });

  test('exactly one nav link is active at a time while scrolling', async ({ page }) => {
    await page.goto('/a320-pilota-reale.html');

    const sectionIds = await page.locator('section.phase').evaluateAll(
      (sections) => sections.map((s) => s.id)
    );
    expect(sectionIds.length).toBeGreaterThan(0);

    for (const id of sectionIds) {
      await page.locator(`#${id}`).scrollIntoViewIfNeeded();
      // Let the IntersectionObserver callback fire.
      await page.waitForTimeout(150);

      const active = page.locator('#navlinks a.active');
      await expect(active).toHaveCount(1);
    }
  });

  test('scrolling to the landing section activates its own nav link', async ({ page }) => {
    await page.goto('/a320-pilota-reale.html');
    await page.locator('#landing').scrollIntoViewIfNeeded();
    await page.waitForTimeout(150);

    await expect(page.locator('#navlinks a.active')).toHaveAttribute('href', '#landing');
  });

  test('clicking a nav link scrolls to the matching section', async ({ page }) => {
    await page.goto('/a320-pilota-reale.html');
    await page.locator('#navlinks a[href="#ecam"]').click();
    await page.waitForTimeout(150);

    const ecamInView = await page.locator('#ecam').isVisible();
    expect(ecamInView).toBeTruthy();
  });
});
