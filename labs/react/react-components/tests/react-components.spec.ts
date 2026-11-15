import { test, expect } from '@playwright/test';

test.describe('react/react-components', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/labs/react/react-components');
  });

  test('renders lab page', async ({ page }) => {
    await page.goto('/labs/react/react-components');
    await expect(page.getByRole('heading', { name: 'React Components' })).toBeVisible();
    await expect(page.getByTestId('lab-root')).toBeVisible();
  });

  test('searches normalized input and selects a suggestion with the mouse', async ({ page }) => {
    const input = page.getByRole('searchbox', { name: '검색어' });
    await input.fill('  REACT  ');
    await expect(page.getByText('추천 검색어를 불러오는 중...')).toBeVisible();
    const suggestion = page.getByRole('button', { name: 'react', exact: true });
    await expect(suggestion).toBeVisible();
    await expect(page.getByRole('listitem')).toHaveCount(1);
    await suggestion.click();
    await expect(input).toHaveValue('react');
    await expect(page.getByText('선택한 검색어: react')).toBeVisible();
    await expect(suggestion).toBeHidden();
  });

  test('navigates suggestions with arrows, Escape and Enter', async ({ page }) => {
    const input = page.getByRole('searchbox', { name: '검색어' });
    await input.fill('route');
    await expect(page.getByRole('listitem')).toHaveText(['route', 'router']);
    await input.press('Escape');
    await expect(page.getByRole('listitem')).toHaveCount(0);
    await input.blur();
    await input.focus();
    await expect(page.getByRole('listitem')).toHaveCount(2);
    await input.press('ArrowUp');
    await input.press('ArrowDown');
    await input.press('ArrowDown');
    await input.press('Enter');
    await expect(input).toHaveValue('router');
    await expect(page.getByText('선택한 검색어: router')).toBeVisible();
    await expect(page.getByRole('listitem')).toHaveCount(0);
  });

  test('replaces an in-flight search and clears empty results', async ({ page }) => {
    const input = page.getByRole('searchbox', { name: '검색어' });
    await input.fill('react');
    await expect(page.getByText('추천 검색어를 불러오는 중...')).toBeVisible();
    await input.fill('route');
    await expect(page.getByRole('listitem')).toHaveText(['route', 'router']);
    await input.fill('zz-no-match');
    await expect(page.getByText('검색 결과가 없습니다.')).toBeVisible();
    await expect(page.getByRole('listitem')).toHaveCount(0);
    await input.fill('r');
    await expect(page.getByText('검색 결과가 없습니다.')).toBeHidden();
    await expect(page.getByRole('listitem')).toHaveCount(0);
    await input.clear();
    await expect(input).toBeEmpty();
  });
});
