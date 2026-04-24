import { test, expect } from '@playwright/test';

async function login(page) {
  page.once('dialog', async dialog => {
    console.log('Login dialog:', dialog.message());
    await dialog.accept();
  });

  await page.goto('/login.html');
  await page.getByRole('textbox', { name: 'Email:', exact: true }).fill('admin@biblioteca.com');
  await page.getByRole('textbox', { name: 'Senha:', exact: true }).fill('123456');
  await page.getByRole('button', { name: /entrar/i }).click();
  await expect(page).toHaveURL(/dashboard\.html/);
}

test.describe('Livros UI', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('CT-FE-007 - Adicionar novo livro', async ({ page }) => {
    await page.goto('/livros.html');

    const titulo = `O Hobbit ${Date.now()}`;

    await page.getByRole('textbox', { name: /nome do livro|nome/i }).fill(titulo);
    await page.getByRole('textbox', { name: /autor/i }).fill('J.R.R. Tolkien');
    await page.getByRole('spinbutton', { name: /número de páginas|páginas/i }).fill('310');
    await page.getByRole('textbox', { name: /descrição/i }).fill('Livro clássico de fantasia');
    await page.getByRole('textbox', { name: /url da imagem|imagem/i }).fill('https://exemplo.com/hobbit.jpg');

    page.once('dialog', async dialog => {
      console.log('Add book alert:', dialog.message());
      expect(dialog.message()).toContain('Livro adicionado com sucesso');
      await dialog.accept();
    });

    await page.getByRole('button', { name: /adicionar livro/i }).click();

    await expect(page.getByRole('textbox', { name: /nome do livro|nome/i })).toHaveValue('');
    await expect(page.locator('body')).toContainText(titulo);

    console.log('Book added and visible in page:', titulo);
  });

  test('CT-FE-008 - Validação de campos obrigatórios', async ({ page }) => {
    await page.goto('/livros.html');

    await page.getByRole('button', { name: /adicionar livro/i }).click();

    const nomeInput = page.getByRole('textbox', { name: /nome do livro|nome/i });
    const isInvalid = await nomeInput.evaluate(el => !el.checkValidity());

    console.log('Name field invalid after empty submit:', isInvalid);

    expect(isInvalid).toBe(true);
  });

  test('CT-FE-010 - Visualizar detalhes de livro', async ({ page }) => {
    await page.goto('/livros.html');

    const firstBookLink = page.locator('a[href*="detalhes.html?id="]').first();
    await expect(firstBookLink).toBeVisible();

    const href = await firstBookLink.getAttribute('href');
    console.log('First details href:', href);

    await firstBookLink.click();

    await expect(page).toHaveURL(/detalhes\.html\?id=/);
    console.log('Details page URL:', page.url());

    await expect(page.locator('body')).toContainText(/autor|páginas|descrição|data/i);
  });

  test('CT-FE-014 - Deletar livro com confirmação', async ({ page }) => {
    await page.goto('/detalhes.html?id=1');

    page.once('dialog', async dialog => {
      console.log('Delete confirm dialog:', dialog.message());
      await dialog.accept();
    });

    page.once('dialog', async dialog => {
      console.log('Delete success alert:', dialog.message());
      await dialog.accept();
    });

    await page.getByRole('button', { name: /deletar livro/i }).click();

    await expect(page).toHaveURL(/livros\.html/);
    console.log('Redirected to livros page after delete');
  });

  test('CT-FE-015 - Cancelar deleção de livro', async ({ page }) => {
    await page.goto('/detalhes.html?id=1');

    page.once('dialog', async dialog => {
      console.log('Delete cancel dialog:', dialog.message());
      await dialog.dismiss();
    });

    await page.getByRole('button', { name: /deletar livro/i }).click();

    await expect(page).toHaveURL(/detalhes\.html\?id=1/);
    console.log('Stayed on details page after cancel delete');
  });
});