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

    test('CT-FE-010 - Visualizar detalhes de livro', async ({ page, request }) => {
        const livro = {
            nome: `Livro Detalhes ${Date.now()}`,
            autor: 'Autor Teste',
            paginas: 250,
            descricao: 'Descrição para teste de detalhes',
            imagemUrl: 'https://exemplo.com/imagem.jpg'
        };

        const createResponse = await request.post('/livros', {
            data: livro
        });

        expect(createResponse.status()).toBe(201);

        const createdBook = await createResponse.json();
        console.log('Livro criado para detalhes:', createdBook);

        await page.goto(`/detalhes.html?id=${createdBook.id}`);

        console.log('Details page URL:', page.url());

        await expect(page).toHaveURL(new RegExp(`detalhes\\.html\\?id=${createdBook.id}`));

        await expect(page.locator('body')).toContainText(livro.nome);
        await expect(page.locator('body')).toContainText(livro.autor);
        await expect(page.locator('body')).toContainText(String(livro.paginas));
        await expect(page.locator('body')).toContainText(livro.descricao);

        await expect(page.getByRole('button', { name: /favoritos/i })).toBeVisible();
        await expect(page.getByRole('button', { name: /deletar livro/i })).toBeVisible();
    });

    test('CT-FE-014 - Deletar livro com confirmação', async ({ page, request }) => {
        const livro = {
            nome: `Livro para Delete ${Date.now()}`,
            autor: 'Autor Teste',
            paginas: 150,
            descricao: 'Livro criado para testar delete com confirmação',
            imagemUrl: 'https://exemplo.com/delete.jpg'
        };

        const createResponse = await request.post('/livros', { data: livro });
        expect(createResponse.status()).toBe(201);

        const createdBook = await createResponse.json();
        console.log('Livro criado para delete:', createdBook);

        await page.goto(`/detalhes.html?id=${createdBook.id}`);

        page.once('dialog', async dialog => {
            console.log('Delete confirm dialog:', dialog.message());
            expect(dialog.message()).toContain('Tem certeza que deseja deletar este livro?');
            await dialog.accept();
        });

        await page.getByRole('button', { name: /deletar livro/i }).click();

        await expect(page).toHaveURL(/livros\.html/);
        console.log('Redirected to livros page after delete');

        const getDeletedResponse = await request.get(`/livros/${createdBook.id}`);
        console.log('GET deleted book status:', getDeletedResponse.status());

        expect(getDeletedResponse.status()).toBe(404);
    });

    test('CT-FE-015 - Cancelar deleção de livro', async ({ page, request }) => {
        const livro = {
            nome: `Livro para Cancelar Delete ${Date.now()}`,
            autor: 'Autor Teste',
            paginas: 200,
            descricao: 'Livro criado para testar cancelamento de delete',
            imagemUrl: 'https://exemplo.com/cancel-delete.jpg'
        };

        const createResponse = await request.post('/livros', { data: livro });
        expect(createResponse.status()).toBe(201);

        const createdBook = await createResponse.json();
        console.log('Livro criado para cancelar delete:', createdBook);

        await page.goto(`/detalhes.html?id=${createdBook.id}`);

        page.once('dialog', async dialog => {
            console.log('Delete cancel dialog:', dialog.message());
            await dialog.dismiss();
        });

        await page.getByRole('button', { name: /deletar livro/i }).click();

        await expect(page).toHaveURL(new RegExp(`detalhes\\.html\\?id=${createdBook.id}`));
        console.log('Stayed on details page after cancel delete');

        const getBookResponse = await request.get(`/livros/${createdBook.id}`);
        console.log('GET book after cancel delete status:', getBookResponse.status());

        expect(getBookResponse.status()).toBe(200);
    });
});