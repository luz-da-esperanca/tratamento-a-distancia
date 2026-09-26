import { test, expect } from '@playwright/test';

// Acesso do paciente: sem sessão HMAC válida, qualquer protocolo cai no login.
// (O caminho com sessão válida é coberto pelo cadastro.e2e.ts, gated por staging.)
test.describe('acesso do paciente por protocolo', () => {
  test('protocolo sem sessão redireciona ao login do tratamento', async ({ page }) => {
    await page.goto('/tratamento/AGD-2026-9999');

    await expect(page).toHaveURL(/\/tratamento$/, { timeout: 15_000 });
    await expect(
      page.getByRole('heading', { name: /acompanhe seu tratamento/i }),
    ).toBeVisible();
  });

  test('protocolo malformado também cai no login, sem 500', async ({ page }) => {
    const response = await page.goto('/tratamento/INVALIDO');

    expect(response?.status()).not.toBe(500);
    await expect(page).toHaveURL(/\/tratamento$/, { timeout: 15_000 });
    await expect(
      page.getByRole('heading', { name: /acompanhe seu tratamento/i }),
    ).toBeVisible();
  });

  test('login do tratamento com credencial inválida exibe erro genérico', async ({ page }) => {
    await page.goto('/tratamento');
    await page.locator('input[name="protocolo"]').fill('AGD-2026-9999');
    await page.getByPlaceholder('dd/mm/aaaa').fill('10052000');
    await page.getByRole('button', { name: /acessar/i }).click();

    // Permanece no login com mensagem genérica (anti-enumeração)
    await expect(page).toHaveURL(/\/tratamento$/);
    await expect(page.locator('body')).toContainText(
      /protocolo ou data de nascimento inválidos/i,
    );
  });
});
