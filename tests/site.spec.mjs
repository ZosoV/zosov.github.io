import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const allPages = ['/', '/projects/bper/', '/projects/covariancenet/', '/projects/stylegan/', '/projects/path-planning/', '/projects/neural-model/', '/projects/rl-hangman/', '/projects/hangman-bert/', '/projects/minimal-rl/', '/projects/license-plates/', '/projects/grapes/', '/projects/game-jam/', '/notes/first-semester/', '/notes/hoeffding-inequality/', '/notes/generalization-bound/', '/notes/dichotomy/'];

test('the homepage keeps the full about, project, and notes reading flow', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Oscar Guarnizo');
  await expect(page.locator('.story-main')).toContainText('Scientific Computing Group');
  await expect(page.locator('.story-main')).toContainText('KAUST');
  await expect(page.locator('#research .project-row')).toHaveCount(5);
  await expect(page.locator('#software .project-row')).toHaveCount(6);
  await expect(page.locator('#learning .note-row')).toHaveCount(6);
  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Research' }).click();
  await expect(page).toHaveURL(/#research$/);
  await page.locator('#research .project-row').first().getByRole('link', { name: /Bisimulation Prioritized Experience Replay/ }).last().click();
  await expect(page).toHaveURL(/\/projects\/bper\/$/);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Bisimulation Prioritized Experience Replay');
  await expect(page.getByRole('heading', { name: 'Abstract' })).toBeVisible();
});

test('mobile layout has readable navigation and no horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');
  await expect(page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Learning' })).toBeVisible();
  await expect(page.locator('.portrait-frame img')).toBeVisible();
  await expect(page.locator('#research .project-row')).toHaveCount(5);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  await page.getByRole('link', { name: /MSc AI & ML: first semester/ }).click();
  await expect(page).toHaveURL(/\/notes\/first-semester\/$/);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('first semester');
});

test('all internal page and resource links exist', async ({ page, request }) => {
  const targets = new Set();
  for (const path of allPages) {
    const response = await page.goto(path);
    expect(response?.status(), path).toBe(200);
    for (const target of await page.locator('a[href^="/"], img[src^="/"], video source[src^="/"]').evaluateAll((elements) => elements.map((element) => element.getAttribute('href') || element.getAttribute('src')))) {
      targets.add(target.split('#')[0]);
    }
  }
  for (const target of targets) {
    const response = await request.head(target);
    expect(response.status(), target).toBe(200);
  }
});

test('every page passes automated accessibility checks', async ({ page }) => {
  test.setTimeout(90_000);
  for (const path of allPages) {
    await page.goto(path);
    const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
    expect(result.violations, path).toEqual([]);
  }
});
