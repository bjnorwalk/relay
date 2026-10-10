import { expect, test as base } from '@playwright/test';
import type { Page } from '@playwright/test';

const test = base.extend<{ consoleCheck: void }>({
  consoleCheck: [
    async ({ page }, use) => {
      const errors: string[] = [];
      page.on('pageerror', (error) => errors.push(error.message));
      page.on('console', (message) => {
        if (['error', 'warning'].includes(message.type()))
          errors.push(message.text());
      });
      await use();
      expect(errors, 'browser errors and warnings').toEqual([]);
    },
    { auto: true },
  ],
});

const modifier = process.platform === 'darwin' ? 'Meta' : 'Control';
const body = (page: Page) =>
  page.getByRole('textbox', { name: 'Document content' });

async function selectText(page: Page, text = 'Some text') {
  await body(page).fill(text);
  await body(page).press(`${modifier}+a`);
  await expect(
    page.getByRole('group', { name: 'Text formatting', exact: true }),
  ).toBeVisible();
}

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await expect(body(page)).toHaveAttribute('contenteditable', 'true');
});

test('native formatting shortcuts preserve selection and history', async ({
  page,
}) => {
  await selectText(page);
  await body(page).press(`${modifier}+b`);
  await body(page).press(`${modifier}+i`);
  await expect(body(page).locator('strong em, em strong')).toHaveText(
    'Some text',
  );
  await expect(
    page.getByRole('button', { name: 'Bold', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true');
  await body(page).press(`${modifier}+z`);
  await expect(body(page).locator('em')).toHaveCount(0);
  await body(page).press(`${modifier}+Shift+z`);
  await expect(body(page).locator('em')).toHaveText('Some text');
});

test('keyboard activation returns to selected text; Escape dismisses the menu', async ({
  page,
}) => {
  await selectText(page);
  await page.keyboard.press('Tab');
  await expect(
    page.getByRole('button', { name: 'Bold', exact: true }),
  ).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(body(page)).toBeFocused();
  await expect(body(page).locator('strong')).toHaveText('Some text');
  await page.keyboard.press('Escape');
  await expect(
    page.getByRole('group', { name: 'Text formatting', exact: true }),
  ).toHaveCount(0);
  await page.keyboard.type('Replacement');
  await expect(body(page)).toHaveText('Replacement');
});

test('link form submits with Enter and Escape returns focus without applying', async ({
  page,
}) => {
  await selectText(page);
  await page.getByRole('button', { name: 'Link', exact: true }).click();
  const address = page.getByRole('textbox', { name: 'Link address' });
  await expect(address).toBeFocused();
  await address.fill('https://example.com');
  await address.press('Enter');
  await expect(body(page).locator('a')).toHaveAttribute(
    'href',
    'https://example.com',
  );
  await expect(body(page)).toBeFocused();
  await page.getByRole('button', { name: 'Link', exact: true }).click();
  await address.fill('https://example.org');
  await address.press('Escape');
  await expect(address).toHaveCount(0);
  await expect(body(page)).toBeFocused();
  await expect(body(page).locator('a')).toHaveAttribute(
    'href',
    'https://example.com',
  );
});

test('native input rules, list exit, soft breaks and code exit', async ({
  page,
}) => {
  await body(page).click();
  await page.keyboard.type('## Heading');
  await expect(body(page).locator('h2')).toHaveText('Heading');
  await page.keyboard.press('Enter');
  await page.keyboard.type('- First');
  await page.keyboard.press('Enter');
  await page.keyboard.type('Second');
  await expect(body(page).locator('li')).toHaveCount(2);
  await page.keyboard.press('Enter');
  await page.keyboard.press('Enter');
  await page.keyboard.type('Body');
  await page.keyboard.press('Shift+Enter');
  await page.keyboard.type('Continued');
  await expect(
    body(page).locator('p').filter({ hasText: 'Body' }).locator('br'),
  ).toHaveCount(1);
  await page.keyboard.press('Enter');
  await page.keyboard.type('```');
  await page.keyboard.press('Space');
  await page.keyboard.type('code');
  await expect(body(page).locator('pre')).toHaveText('code');
  await page.keyboard.press('Enter');
  await page.keyboard.press('Enter');
  await page.keyboard.press('Enter');
  await page.keyboard.type('Outside');
  await expect(
    body(page).locator('p').filter({ hasText: 'Outside' }),
  ).toHaveText('Outside');
  await expect(body(page).locator('pre')).toHaveText('code');
});

for (const theme of ['light', 'dark'] as const) {
  test(`${theme} narrow viewport keeps keyboard controls usable after refresh`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 640, height: 800 });
    await page.getByLabel('Appearance').selectOption(theme);
    await selectText(page, 'Review');
    await page.keyboard.press('Escape');
    await page.keyboard.press('Shift+Tab');
    await expect(
      page.getByRole('button', { name: 'Horizontal rule', exact: true }),
    ).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(body(page)).toBeFocused();
    await expect
      .poll(() =>
        page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      )
      .toBe(true);
    await expect(page.getByRole('status')).toContainText('Saved locally');
    await page.reload();
    await expect(body(page)).toHaveText('Review');
  });
}

test('ordered-list and quote input rules keep text in the intended blocks', async ({
  page,
}) => {
  await body(page).click();
  await page.keyboard.type('1. First');
  await page.keyboard.press('Enter');
  await page.keyboard.type('Second');
  await expect(body(page).locator('ol li')).toHaveCount(2);
  await page.keyboard.press('Enter');
  await page.keyboard.press('Enter');
  await page.keyboard.type('> Quote');
  await expect(body(page).locator('blockquote')).toHaveText('Quote');
});

test('Space activates document controls without losing the selection', async ({
  page,
}) => {
  await selectText(page);
  await page.keyboard.press('Escape');
  await page.keyboard.press('Shift+Tab');
  await page.keyboard.press('Shift+Tab');
  await expect(
    page.getByRole('button', { name: 'Code block', exact: true }),
  ).toBeFocused();
  await page.keyboard.press('Space');
  await expect(body(page)).toBeFocused();
  await expect(body(page).locator('pre')).toHaveText('Some text');
  await page.getByRole('button', { name: 'Undo', exact: true }).click();
  await expect(body(page)).toBeFocused();
  await expect(body(page).locator('pre')).toHaveCount(0);
  await page.keyboard.type('Replacement');
  await expect(body(page)).toHaveText('Replacement');
});
