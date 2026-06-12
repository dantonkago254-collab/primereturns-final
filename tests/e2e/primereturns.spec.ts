import { expect, test } from '@playwright/test';

test.describe('PrimeReturns E2E financial flows', () => {
  test('Flow A: referral route captures code and registration transmits referrerCode', async ({ page }) => {
    let registrationPayload: Record<string, unknown> | null = null;

    await page.route('**/api/referrals/validate/REFCODE123', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ok: true, valid: true }),
      });
    });

    await page.route('**/api/auth/register', async (route) => {
      registrationPayload = route.request().postDataJSON();
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ok: true,
          token: 'e2e-token',
          user: {
            id: 9001,
            name: 'QA Referral User',
            email: 'qa-referral@example.com',
            accountBalance: 0,
            totalInvested: 0,
            totalEarned: 0,
            totalReferralEarnings: 0,
            referralCode: 'QA9001',
            lastWithdrawalAt: null,
            role: 'user',
          },
        }),
      });
    });

    await page.goto('/ref/REFCODE123');
    await page.waitForURL('**/register');

    const captured = await page.evaluate(() => localStorage.getItem('primereturns_referrer_code'));
    expect(captured).toBe('REFCODE123');

    await page.getByPlaceholder('Enter your name').fill('QA Referral User');
    await page.getByPlaceholder('name@example.com').fill('qa-referral@example.com');
    await page.getByPlaceholder('••••••••').fill('Password123!');
    await page.getByRole('button', { name: /create account/i }).click();

    await expect.poll(() => registrationPayload).not.toBeNull();
    expect(registrationPayload).toMatchObject({
      name: 'QA Referral User',
      email: 'qa-referral@example.com',
      referrerCode: 'REFCODE123',
    });

    const afterSignup = await page.evaluate(() => localStorage.getItem('primereturns_referrer_code'));
    expect(afterSignup).toBeNull();
  });

  test('Flow B: dashboard balance renders from backend data without console errors', async ({ page }) => {
    const user = {
      id: 777,
      name: 'Realtime QA',
      email: 'realtime.qa@example.com',
      phone: '254700000000',
      accountBalance: 1000,
      totalInvested: 5000,
      totalEarned: 0,
      totalReferralEarnings: 0,
      referralCode: 'QA77777',
      lastWithdrawalAt: null,
      role: 'user',
    };

    await page.route('**/api/dashboard', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ok: true, user, investments: [], transactions: [], referrals: [] }),
      });
    });

    await page.addInitScript((seedUser) => {
      localStorage.setItem(
        'primereturns_auth_store',
        JSON.stringify({
          state: {
            user: seedUser,
            token: 'e2e-token',
            isAuthenticated: true,
          },
          version: 0,
        })
      );
    }, user);

    await page.goto('/dashboard');
    const balance = page.getByTestId('live-balance');
    await expect(balance).toBeVisible();
    await expect(balance).toContainText('1,000');

    const consoleErrors: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });

    await page.waitForTimeout(1_000);
    expect(consoleErrors).toEqual([]);
  });
});