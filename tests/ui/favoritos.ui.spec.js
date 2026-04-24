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

async function createBook(request) {
    const livro = {
        nome: `Livro Favorito ${Date.now()}`,
        autor: 'Autor Favorito',
        paginas: 180,
        descricao: 'Livro criado para testes de favoritos',
        imagemUrl: 'https://exemplo.com/favorito.jpg'
    };

    const response = await request.post('/livros', { data: livro });
    expect(response.status()).toBe(201);

    const createdBook = await response.json();
    console.log('Livro criado para favorito:', createdBook);

    return createdBook;
}

test.describe('Favoritos UI', () => {
    test.beforeEach(async ({ page }) => {
        await login(page);
    });

    test('CT-FE-011 - Adicionar livro aos favoritos', async ({ page, request }) => {
        const createdBook = await createBook(request);

        await page.goto(`/detalhes.html?id=${createdBook.id}`);

        page.once('dialog', async dialog => {
            console.log('Add favorite alert:', dialog.message());
            expect(dialog.message()).toMatch(/favoritos|favorito/i);
            await dialog.accept();
        });

        await page.getByRole('button', { name: /adicionar aos favoritos/i }).click();

        await expect(page.getByRole('button', { name: /remover dos favoritos/i })).toBeVisible();

        console.log('Favorite button changed to remove');
    });

    test('CT-FE-012 - Remover livro dos favoritos', async ({ page, request }) => {
        const createdBook = await createBook(request);

        await page.goto(`/detalhes.html?id=${createdBook.id}`);

        page.once('dialog', async dialog => {
            console.log('Initial add favorite alert:', dialog.message());
            await dialog.accept();
        });

        await page.getByRole('button', { name: /adicionar aos favoritos/i }).click();

        const removeButton = page.getByRole('button', { name: /remover dos favoritos/i });
        await expect(removeButton).toBeVisible();

        page.once('dialog', async dialog => {
            console.log('Remove favorite alert:', dialog.message());
            expect(dialog.message()).toMatch(/removido|favoritos/i);
            await dialog.accept();
        });

        await removeButton.click();

        await expect(page.getByRole('button', { name: /adicionar aos favoritos/i })).toBeVisible();

        console.log('Favorite removed and button returned to add');
    });

    test('CT-FE-013 - Listar livros favoritos', async ({ page, request }) => {
        const createdBook = await createBook(request);

        await page.goto(`/detalhes.html?id=${createdBook.id}`);

        page.once('dialog', async dialog => {
            console.log('Add favorite before list alert:', dialog.message());
            await dialog.accept();
        });

        await page.getByRole('button', { name: /adicionar aos favoritos/i }).click();
        await expect(page.getByRole('button', { name: /remover dos favoritos/i })).toBeVisible();

        await page.goto('/favoritos.html');

        console.log('Favoritos page URL:', page.url());

        const bodyText = await page.locator('body').textContent();
        console.log('Favoritos page body:', bodyText);

        await expect(page.locator('body')).toContainText(createdBook.nome);
        await expect(page.locator('body')).toContainText(createdBook.autor);
    });
});