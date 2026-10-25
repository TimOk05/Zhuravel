const { test, expect } = require('@playwright/test');

const viewports = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1440, height: 1000 }
];

for (const viewport of viewports) {
  test(`${viewport.name}: page renders without layout overflow or resource failures`, async ({ page }) => {
    const consoleErrors = [];
    const failedRequests = [];
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });
    page.on('requestfailed', (request) => failedRequests.push(`${request.method()} ${request.url()}`));

    await page.setViewportSize(viewport);
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1')).toContainText('Your car.');
    await expect(page.locator('img.hero__media')).toHaveJSProperty('complete', true);

    const dimensions = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth
    }));
    expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth + 1);
    expect(consoleErrors).toEqual([]);
    expect(failedRequests).toEqual([]);
  });
}

test('service tabs work with pointer and keyboard', async ({ page }) => {
  await page.goto('/');
  const exterior = page.getByRole('tab', { name: /Exterior care/i });
  const interior = page.getByRole('tab', { name: /Interior care/i });
  await expect(exterior).toHaveAttribute('aria-selected', 'true');
  await interior.click();
  await expect(interior).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('tabpanel')).toContainText('cabin');
  await interior.press('ArrowRight');
  await expect(page.getByRole('tab', { name: /Complete valet/i })).toHaveAttribute('aria-selected', 'true');
});

test('mobile menu opens, follows links and closes with Escape', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const menuButton = page.getByRole('button', { name: /menu/i });
  await menuButton.click();
  await expect(menuButton).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('Escape');
  await expect(menuButton).toHaveAttribute('aria-expanded', 'false');
  await menuButton.click();
  await page.getByRole('navigation').getByRole('link', { name: 'Services' }).click();
  await expect(menuButton).toHaveAttribute('aria-expanded', 'false');
  await expect(page).toHaveURL(/#services$/);
});

test('enquiry builder validates and prepares a message', async ({ page }) => {
  await page.goto('/');
  await page.locator('#vehicle').selectOption({ label: 'SUV / 4×4' });
  await page.locator('#focus').selectOption({ label: 'Complete inside & out' });
  await page.locator('#postcode').fill('po19');
  await page.getByRole('button', { name: /Copy my enquiry/i }).click();
  await expect(page.locator('[data-form-status]')).toContainText('Enquiry copied');
});

test('all meaningful images load and links have destinations', async ({ page }) => {
  await page.goto('/');
  await page.locator('footer').scrollIntoViewIfNeeded();
  await page.waitForLoadState('networkidle');
  const brokenImages = await page.locator('img').evaluateAll((images) =>
    images.filter((image) => !image.complete || image.naturalWidth === 0).map((image) => image.src)
  );
  const emptyLinks = await page.locator('a').evaluateAll((links) =>
    links.filter((link) => !link.getAttribute('href')).map((link) => link.textContent.trim())
  );
  expect(brokenImages).toEqual([]);
  expect(emptyLinks).toEqual([]);
});
