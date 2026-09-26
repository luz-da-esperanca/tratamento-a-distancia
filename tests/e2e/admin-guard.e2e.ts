import { test, expect } from '@playwright/test';

// Guard administrativo: sem sessão, /admin/painel deve cair no login.
test.describe('guard administrativo', () => {
  test('/admin/painel sem sessão redireciona para /admin/login', async ({ page }) => {
    await page.goto('/admin/painel');

    await expect(page).toHaveURL(/\/admin\/login$/);
    await expect(page.getByRole('heading', { name: /acesso administrativo/i })).toBeVisible();
  });

  test('/admin/login renderiza formulário de credenciais', async ({ page }) => {
    await page.goto('/admin/login');

    await expect(page.locator('input[name="login"]')).toBeVisible();
    await expect(page.locator('input[name="senha"]')).toBeVisible();
  });
});
