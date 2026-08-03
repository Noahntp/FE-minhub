import { test, expect } from '@playwright/test';
test('Admin đăng nhập và vào Dashboard', async ({ page }) => {
  const email = process.env.PW_ADMIN_EMAIL;
  const password = process.env.PW_ADMIN_PASSWORD;
  if (!email || !password) {
    throw new Error('Thiếu PW_ADMIN_EMAIL hoặc PW_ADMIN_PASSWORD.');
  }
  const apiResponses: { status: number; url: string }[] = [];
  page.on('response', (response) => {
    if (response.url().includes('/api/')) {
      apiResponses.push({ status: response.status(), url: response.url() });
    }
  });
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  const avatar = page.getByRole('button', { name: 'Avatar' });
  if (await avatar.isVisible().catch(() => false)) {
    await avatar.click();
    await page.getByRole('menuitem', { name: 'Đăng xuất' }).click();
  }
  await page.getByRole('button', { name: 'Đăng nhập' }).click();
  await page.getByRole('textbox', { name: 'VD: student@gmail.com...' }).fill(email);
  await page.getByRole('textbox', { name: '••••••••' }).fill(password);
  await page.getByRole('button', { name: 'Truy cập Hệ thống' }).click();
  await expect(page).toHaveURL(/admin|dashboard/, { timeout: 15000 });
  await expect(page.getByText(/dashboard|tổng quan/i).first()).toBeVisible();
  const failedApi = apiResponses.filter((api) => api.status >= 400);
  console.log('API đã gọi:', apiResponses);
  expect(failedApi, `API lỗi: ${JSON.stringify(failedApi)}`).toEqual([]);
});
