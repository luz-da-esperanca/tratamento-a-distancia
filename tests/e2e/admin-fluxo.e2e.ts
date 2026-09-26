import { test, expect } from '@playwright/test';

// Fluxo administrativo. O login inválido roda em qualquer ambiente (só lê).
// Login válido/painel/logout exigem credenciais de staging — nunca produção:
//
//   E2E_BASE_URL=https://staging... E2E_ADMIN_EMAIL=... E2E_ADMIN_PASSWORD=...
const email = process.env.E2E_ADMIN_EMAIL;
const password = process.env.E2E_ADMIN_PASSWORD;
const authed = !!email && !!password;

test.describe('fluxo administrativo', () => {
  test('login inválido exibe erro sem redirecionar', async ({ page }) => {
    await page.goto('/admin/login');
    await page.locator('input[name="login"]').fill('ninguem@exemplo.com');
    await page.locator('input[name="senha"]').fill('senha-errada');
    await page.getByRole('button', { name: /entrar/i }).click();

    // Permanece no login e mostra erro do backend
    await expect(page).toHaveURL(/\/admin\/login$/);
    await expect(page.locator('body')).toContainText(/incorretos|inválidas|erro/i);
  });

  test('login válido → painel → logout', async ({ page }) => {
    test.skip(!authed, 'Requer E2E_ADMIN_EMAIL + E2E_ADMIN_PASSWORD (staging)');
    await page.goto('/admin/login');
    await page.locator('input[name="login"]').fill(email!);
    await page.locator('input[name="senha"]').fill(password!);
    await page.getByRole('button', { name: /entrar/i }).click();

    // Painel com dados
    await expect(page).toHaveURL(/\/admin\/painel$/, { timeout: 15_000 });
    await expect(page.getByRole('heading', { name: /painel de controle/i })).toBeVisible();

    // Sessão persiste no reload (middleware reconhece admin)
    await page.reload();
    await expect(page).toHaveURL(/\/admin\/painel$/);
    await expect(page.getByRole('heading', { name: /painel de controle/i })).toBeVisible();

    // Logout volta ao login e perde acesso ao painel
    await page.getByRole('button', { name: /^sair$/i }).click();
    await expect(page).toHaveURL(/\/admin\/login$/, { timeout: 15_000 });
    await page.goto('/admin/painel');
    await expect(page).toHaveURL(/\/admin\/login$/);
  });
});
