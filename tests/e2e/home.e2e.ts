import { test, expect } from '@playwright/test';

// Smoke da página pública: renderiza e valida client-side sem escrever no banco.
// Nota: erros por campo só tingem o label de vermelho (text-error) + aria-invalid;
// a mensagem textual aparece apenas no box global de erro do envio.
test.describe('página inicial (cadastro público)', () => {
  test('carrega hero + formulário de inscrição', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /próxima etapa/i })).toBeVisible();
  });

  test('etapa 0 vazia bloqueia avanço (labels em erro, sem avançar)', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: /próxima etapa/i }).click();

    // Campo nome marcado como inválido via aria-invalid...
    const nome = page.getByPlaceholder(/maria oliveira/i);
    await expect(nome).toHaveAttribute('aria-invalid', 'true');
    // ...e continua na etapa 0 (sem botão de finalizar)
    await expect(page.getByRole('button', { name: /finalizar inscrição/i })).toHaveCount(0);
  });
});
