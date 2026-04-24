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

test.describe('Favoritos UI', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('CT-FE-011 - Adicionar livro aos favoritos', async ({ page }) => {
    await page.goto('/detalhes.html?id=2');

    page.once('dialog', async dialog => {
      console.log('Add favorite alert:', dialog.message());
      expect(dialog.message()).toMatch(/favoritos|favorito/i);
      await dialog.accept();
    });

    await page.getByRole('button', { name: /adicionar aos favoritos/i }).click();

    await expect(page.getByRole('button', { name: /remover dos favoritos/i })).toBeVisible();

    console.log('Favorite button changed to remove');
  });

  test('CT-FE-012 - Remover livro dos favoritos', async ({ page }) => {
    await page.goto('/detalhes.html?id=2');

    const addButton = page.getByRole('button', { name: /adicionar aos favoritos/i });
    const removeButton = page.getByRole('button', { name: /remover dos favoritos/i });

    if (await addButton.isVisible().catch(() => false)) {
      page.once('dialog', async dialog => {
        console.log('Initial add favorite alert:', dialog.message());
        await dialog.accept();
      });

      await addButton.click();
      await expect(removeButton).toBeVisible();
    }

    page.once('dialog', async dialog => {
      console.log('Remove favorite alert:', dialog.message());
      expect(dialog.message()).toMatch(/removido|favoritos/i);
      await dialog.accept();
    });

    await removeButton.click();

    await expect(addButton).toBeVisible();

    console.log('Favorite removed and button returned to add');
  });

  test('CT-FE-013 - Listar livros favoritos', async ({ page }) => {
    await page.goto('/detalhes.html?id=2');

    const addButton = page.getByRole('button', { name: /adicionar aos favoritos/i });
    if (await addButton.isVisible().catch(() => false)) {
      page.once('dialog', async dialog => {
        console.log('Add favorite before list alert:', dialog.message());
        await dialog.accept();
      });

      await addButton.click();
    }

    await page.goto('/favoritos.html');

    console.log('Favoritos page URL:', page.url());

    const bodyText = await page.locator('body').textContent();
    console.log('Favoritos page body:', bodyText);

    await expect(page.locator('body')).toContainText(/favoritos|clean code|harry potter/i);
  });
});