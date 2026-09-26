import { test, expect } from '@playwright/test';

// Fluxo completo de ponta a ponta: ESCREVE NO BANCO.
// Só executa com E2E_WRITE_ENABLED=1 apontando para ambiente de staging
// (E2E_BASE_URL + banco de teste). Nunca rode contra produção.
const writeEnabled = process.env.E2E_WRITE_ENABLED === '1';

test.describe('cadastro completo (gated por E2E_WRITE_ENABLED)', () => {
  test.skip(!writeEnabled, 'Requer E2E_WRITE_ENABLED=1 + ambiente de staging');

  test('wizard → protocolo → acesso ao tratamento', async ({ page }) => {
    const stamp = Date.now().toString().slice(-6);
    const nome = `Paciente E2E ${stamp}`;
    const email = `e2e+${stamp}@exemplo.com`;

    await page.goto('/');

    // ---- Etapa 0: dados pessoais ----
    await page.getByPlaceholder('Ex.: Maria Oliveira').fill(nome);
    await page.getByPlaceholder('dd/mm/aaaa').fill('10052000');

    await page.getByPlaceholder('Selecione o país').click();
    await page.getByPlaceholder('Digite o nome do país...').fill('Brasil');
    await page.getByRole('option', { name: /brasil/i }).click();

    await page.getByPlaceholder('Selecione o estado').click();
    await page.getByPlaceholder('Digite o nome do estado...').fill('Ceará');
    await page.getByRole('option', { name: /ceará/i }).click();

    await page.getByPlaceholder('Parnaíba').fill('Fortaleza');
    await page.getByPlaceholder('Rua, número, bairro e complemento').fill('Rua E2E, 123');
    await page.getByRole('button', { name: /próxima etapa/i }).click();

    // ---- Etapa 1: contato (aguarda transição de etapa) ----
    await expect(page.getByPlaceholder('contato@exemplo.com')).toBeVisible();
    await page.getByPlaceholder('contato@exemplo.com').fill(email);
    await page.locator('#inscricao input[type="tel"]').first().fill('+5585999999999');
    // "Este número é WhatsApp" já vem marcado (E_WHATSAPP); sem cirurgia.
    await page.getByRole('button', { name: /próxima etapa/i }).click();

    // ---- Etapa 2: revisão → finalizar ----
    await expect(page.getByRole('button', { name: /finalizar inscrição/i })).toBeVisible();
    await expect(page.locator('#inscricao')).toContainText(nome);
    await page.getByRole('button', { name: /finalizar inscrição/i }).click();

    // ---- Sucesso: protocolo AGD-AAAA-NNNN ----
    await expect(page.getByText('Inscrição Confirmada!')).toBeVisible({ timeout: 30_000 });
    const protocoloBox = page.locator('#inscricao');
    await expect(protocoloBox.getByText(/AGD-\d{4}-\d{4}/)).toBeVisible();
    const protocolo = (await protocoloBox.getByText(/AGD-\d{4}-\d{4}/).first().innerText()).trim();

    // ---- Acesso ao tratamento com protocolo + nascimento ----
    await page.goto('/tratamento');
    await page.locator('input[name="protocolo"]').fill(protocolo);
    await page.getByPlaceholder('dd/mm/aaaa').fill('10052000');
    await page.getByRole('button', { name: /acessar/i }).click();

    await expect(page).toHaveURL(new RegExp(`/tratamento/${protocolo}$`), { timeout: 15_000 });
    await expect(page.locator('body')).toContainText(nome);
  });
});
