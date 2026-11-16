import { test, expect } from '@playwright/test';

test('times answers and excludes feedback time from the average', async ({ page }) => {
  await page.goto('/games');
  const time = page.getByRole('definition').nth(0);
  const average = page.getByRole('definition').nth(1);
  await expect(average).toHaveText('—');
  await expect(page.getByLabel('Your answer')).toHaveCount(0);
  await page.waitForTimeout(1200);
  await expect(time).toHaveText('0.0s');
  await page.getByRole('button', { name: 'Start', exact: true }).click();
  await expect.poll(async () => parseFloat(await time.innerText())).toBeGreaterThan(0.5);

  await page.getByLabel('Your answer').fill('0');
  await page.getByRole('button', { name: 'Check answer' }).click();
  await expect(page.getByRole('status')).not.toBeEmpty();
  const firstTime = await time.innerText();
  await expect(average).toHaveText(firstTime);

  await page.waitForTimeout(1200);
  await expect(time).toHaveText(firstTime);
  await expect(average).toHaveText(firstTime);
  await page.getByRole('button', { name: 'Next question' }).click();
  await expect
    .poll(async () => parseFloat(await time.innerText()))
    .toBeGreaterThan(parseFloat(firstTime) + 0.5);
  await page.getByLabel('Your answer').fill('0');
  await page.getByRole('button', { name: 'Check answer' }).click();
  await expect(page.getByRole('status')).not.toBeEmpty();
  const total = parseFloat(await time.innerText());
  const mean = parseFloat(await average.innerText());
  expect(Math.abs(mean - total / 2)).toBeLessThanOrEqual(0.1);
});

test('plays a round, reports the score, and starts again', async ({ page }) => {
  await page.goto('/login');
  await page.getByRole('link', { name: 'Games', exact: true }).click();
  await expect(page).toHaveURL('/games');
  await expect(page.getByRole('heading', { name: 'Quick maths' })).toBeVisible();
  await page.getByRole('button', { name: 'Start', exact: true }).click();

  await page.getByRole('button', { name: 'Check answer' }).click();
  await expect(page.getByText('Question 1 / 10', { exact: true })).toBeVisible();
  await expect(page.getByRole('status')).toBeEmpty();

  for (let question = 1; question <= 10; question++) {
    await expect(page.getByText(`Question ${question} / 10`, { exact: true })).toBeVisible();
    const equation = await page.getByLabel('Equation', { exact: true }).innerText();
    const [left, operator, right] = equation.trim().split(/\s+/);
    const a = Number(left);
    const b = Number(right);
    const answers: Record<string, number> = { '+': a + b, '−': a - b, '×': a * b, '÷': a / b };
    const answer = answers[operator];

    await page.getByLabel('Your answer').fill(String(question === 1 ? answer + 1 : answer));
    await page.getByRole('button', { name: 'Check answer' }).click();
    await expect(page.getByRole('status')).toHaveText(
      question === 1 ? `The correct answer is ${answer}.` : 'Correct!',
    );
    await expect(page.getByLabel('Your answer')).toHaveAttribute('readonly');
    await page
      .getByRole('button', { name: question === 10 ? 'See results' : 'Next question' })
      .click();
  }

  await expect(page.getByRole('heading', { name: 'Round complete' })).toBeVisible();
  await expect(page.getByText('9 / 10', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Play again' }).click();
  await expect(page.getByText('Question 1 / 10', { exact: true })).toBeVisible();
  await expect(page.getByText('Score: 0', { exact: true })).toBeVisible();
  await expect(page.getByLabel('Your answer')).toBeEmpty();
  await expect(page.getByRole('definition').nth(1)).toHaveText('—');
});
