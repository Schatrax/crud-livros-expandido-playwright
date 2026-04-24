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

test.describe('Dashboard UI', () => {
    test.beforeEach(async ({ page }) => {
        await login(page);
    });

    test('CT-FE-006 - Visualizar dashboard com estatísticas', async ({ page, request }) => {
        await page.goto('/dashboard.html');

        // validar estrutura
        await expect(page.getByText('Total de Livros')).toBeVisible();
        await expect(page.getByText('Total de Páginas')).toBeVisible();
        await expect(page.getByText('Usuários Cadastrados')).toBeVisible();
        await expect(page.getByRole('heading', { name: 'Últimos Livros Adicionados' })).toBeVisible();

        const bodyText = await page.locator('body').innerText();
        console.log('Dashboard visible text content:', bodyText);

        // validar com API
        const response = await request.get('/estatisticas');
        const stats = await response.json();

        await expect(page.getByText(`Total de Livros ${stats.totalLivros}`)).toBeVisible();

        // validar últimos livros
        const livrosRecentes = await request.get('/livros/recentes/ultimos').then(r => r.json());

        for (const livro of livrosRecentes) {
            await expect(page.locator('body')).toContainText(livro.nome);
        }

        console.log('Dashboard validated with dynamic data');
    });

    test('CT-FE-009 - Navegação entre páginas', async ({ page }) => {
        await page.goto('/dashboard.html');

        await page.getByRole('link', { name: /dashboard/i }).click();
        await expect(page).toHaveURL(/dashboard\.html/);
        console.log('Navigated to dashboard:', page.url());

        await page.getByRole('link', { name: /gerenciar livros|livros/i }).click();
        await expect(page).toHaveURL(/livros\.html/);
        console.log('Navigated to livros:', page.url());

        await page.getByRole('link', { name: /favoritos|meus favoritos/i }).click();
        await expect(page).toHaveURL(/favoritos\.html/);
        console.log('Navigated to favoritos:', page.url());
    });
});