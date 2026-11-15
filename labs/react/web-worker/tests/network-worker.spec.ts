import { expect, test } from '@playwright/test';

test.describe('Network + Worker', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/labs/react/web-worker');
    await page.getByRole('button', { name: 'Network + Worker', exact: true }).click();
    await expect(
      page.getByRole('heading', { name: 'Network + Worker Cancel Strategy' }),
    ).toBeVisible();
  });

  test('runs the real worker, paginates, replaces results and switches experiments', async ({
    page,
  }) => {
    const input = page.getByPlaceholder('Type fast to force out-of-order + cancel...');
    await expect(page.getByText(/Status: Idle/)).toBeVisible();
    await input.fill('react');
    await expect(page.getByText(/Status: Done id=1/)).toBeVisible();
    await expect(page.getByText(/Result count: 200,000/)).toBeVisible();
    const items = page.getByRole('listitem');
    await expect(items).toHaveCount(50);
    await expect(items.first()).toHaveText('react-server-item-0-react-worker');
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await expect(page.getByText('Page 2 / 4000')).toBeVisible();
    await expect(items.first()).toHaveText('react-server-item-50-react-worker');
    await input.fill('python');
    await expect(page.getByText(/Status: Fetching/)).toBeVisible();
    await expect(items).toHaveCount(0);
    await expect(page.getByText(/Status: Done id=2/)).toBeVisible();
    await expect(page.getByText('Page 1 / 4000')).toBeVisible();
    await expect(items.first()).toHaveText('python-server-item-0-react-worker');
    expect((await items.allTextContents()).every((item) => item.startsWith('python-'))).toBe(true);
    await expect(page.getByRole('button', { name: 'Prev', exact: true })).toBeDisabled();

    await input.fill('unmount');
    await expect(page.getByText(/Status: Fetching/)).toBeVisible();
    await page.getByRole('button', { name: 'Worker only', exact: true }).click();
    await expect(page.getByText('Ready: true / Items: 2,000,000')).toBeVisible({ timeout: 30_000 });
    await page.getByRole('button', { name: 'Network + Worker', exact: true }).click();
    await expect(input).toBeEmpty();
    await expect(page.getByText(/Status: Idle/)).toBeVisible();
    await expect(items).toHaveCount(0);
  });

  test('cancels the debounce before any request starts and allows a new search', async ({
    page,
  }) => {
    await page.clock.install();
    const input = page.getByPlaceholder('Type fast to force out-of-order + cancel...');
    await input.fill('never-start');
    await page.getByRole('button', { name: 'Cancel current request' }).click();
    await page.clock.fastForward(2_000);
    await expect(page.getByText(/Status: Request 0 cancelled/)).toBeVisible();
    await expect(page.getByRole('listitem')).toHaveCount(0);
    await input.fill('after-cancel');
    await expect(page.getByText(/Status: Done id=1/)).toBeVisible();
    await expect(page.getByRole('listitem').first()).toHaveText(
      'after-cancel-server-item-0-react-worker',
    );
  });

  test('aborts a pending API request and applies only the newest search', async ({ page }) => {
    const input = page.getByPlaceholder('Type fast to force out-of-order + cancel...');
    await input.fill('cancel-me');
    await expect(page.getByText(/Status: Fetching/)).toBeVisible();
    await page.getByRole('button', { name: 'Cancel current request' }).click();
    await expect(page.getByText(/Status: Fetch aborted/)).toBeVisible();
    await expect(page.getByRole('listitem')).toHaveCount(0);
    await input.fill('older');
    await expect(page.getByText(/Status: Fetching.*id=2/)).toBeVisible();
    await input.fill('newest');
    await expect(page.getByText(/Status: Done id=3/)).toBeVisible();
    await expect(page.getByText(/Result count: 200,000/)).toBeVisible();
    await expect(page.getByRole('listitem').first()).toHaveText(
      'newest-server-item-0-react-worker',
    );
  });

  test('cancels actual worker processing and then recovers', async ({ page }) => {
    // Click on the first rendered progress update so fast machines cannot finish
    // the small worker job between a remote assertion and a remote click.
    await page.evaluate(() => {
      const root = document.querySelector('[data-testid="lab-root"]')!;
      const observer = new MutationObserver(() => {
        if (!root.textContent?.includes('Worker progress')) return;
        observer.disconnect();
        const cancel = [...root.querySelectorAll('button')].find(
          (button) => button.textContent === 'Cancel current request',
        );
        cancel!.click();
      });
      observer.observe(root, { childList: true, subtree: true, characterData: true });
    });
    const input = page.getByPlaceholder('Type fast to force out-of-order + cancel...');
    await input.fill('worker-cancel');
    await expect(page.getByText(/Status: Worker canceled id=1/)).toBeVisible();
    await expect(page.getByRole('listitem')).toHaveCount(0);
    await input.fill('recovered');
    await expect(page.getByText(/Status: Done id=2/)).toBeVisible();
    await expect(page.getByRole('listitem').first()).toHaveText(
      'recovered-server-item-0-react-worker',
    );
  });
});
