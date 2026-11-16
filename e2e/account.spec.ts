import { test, expect } from '@playwright/test';

test('registers, logs in, refreshes the session, and logs out', async ({ page }) => {
  const user = { id: '1', userName: 'collector', email: 'collector@example.com' };
  const session = { userId: '1', accessToken: 'expired', refreshToken: 'refresh' };
  const renewed = { ...session, accessToken: 'valid', refreshToken: 'rotated' };
  await page.route('**/api/**', (route) => {
    const path = new URL(route.request().url()).pathname;
    const headers = { 'access-control-allow-origin': '*' };
    if (path === '/api/users/1') {
      return route.fulfill({
        headers,
        status: route.request().headers()['authorization'] === 'Bearer valid' ? 200 : 401,
        json: user,
      });
    }
    const responses: Record<string, object> = {
      '/api/auth/register': user,
      '/api/auth/login': session,
      '/api/auth/refresh': renewed,
    };
    return route.fulfill({
      headers,
      status: path === '/api/auth/logout' ? 204 : 200,
      ...(responses[path] ? { json: responses[path] } : {}),
    });
  });

  await page.goto('/register');
  await page.getByLabel('Username', { exact: true }).fill(user.userName);
  await page.getByLabel('Email', { exact: true }).fill(user.email);
  await page.getByLabel('Password', { exact: true }).fill('Password1!');
  await page.getByLabel('Confirm password', { exact: true }).fill('Password1!');
  await page.getByRole('button', { name: 'Create account' }).click();
  await expect(page).toHaveURL('/login?registered=1');

  await page.getByLabel('Email', { exact: true }).fill(user.email);
  await page.getByLabel('Password', { exact: true }).fill('Password1!');
  await page.getByRole('button', { name: 'Log in', exact: true }).click();
  await expect(page).toHaveURL('/profile');
  await expect(page.getByText(user.userName, { exact: true })).toBeVisible();
  await expect(page.getByText(user.email, { exact: true })).toBeVisible();
  await expect(
    page
      .getByRole('navigation', { name: 'Account navigation' })
      .getByRole('link', { name: 'Register' }),
  ).toHaveCount(0);
  await page.reload();
  await expect(page.getByText(user.userName, { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Log out' }).click();
  await expect(page).toHaveURL('/login');
  await page.goto('/profile');
  await expect(page).toHaveURL('/login');
});
