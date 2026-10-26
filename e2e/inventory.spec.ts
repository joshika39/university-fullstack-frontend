import { test, expect } from '@playwright/test';

test('opens quick details and the full card page from inventory', async ({ page }) => {
  const card = {
    id: 1,
    name: 'Korra',
    rarity: 'Legendary',
    element: 'Water',
    description: 'The Avatar, master of all four elements.',
    lore: 'Korra was born in the Southern Water Tribe.',
    imageUrl: '',
  };

  // Mock both endpoints so this example needs no backend or database.
  await page.route('**/api/cards', (route) =>
    route.fulfill({
      json: [card],
      headers: { 'access-control-allow-origin': '*' },
    }),
  );
  await page.route('**/api/cards/1', (route) =>
    route.fulfill({
      json: card,
      headers: { 'access-control-allow-origin': '*' },
    }),
  );

  await page.goto('/inventory');
  await expect(page.getByRole('heading', { name: 'Inventory', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Quick details for Korra', exact: true }).click();

  const quickDetails = page.getByRole('complementary', { name: 'Quick details' });
  await expect(quickDetails.getByRole('heading', { name: 'Korra', exact: true })).toBeVisible();
  await expect(quickDetails.getByText(card.description, { exact: true })).toBeVisible();
  await quickDetails.getByRole('link', { name: 'View full card' }).click();

  await expect(page).toHaveURL('/cards/1');
  await expect(page.getByRole('heading', { name: 'Korra', exact: true })).toBeVisible();
  await expect(page.getByText(card.lore, { exact: true })).toBeVisible();
});
