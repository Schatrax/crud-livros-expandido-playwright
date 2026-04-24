import { test, expect } from '@playwright/test';

test.describe('Auth UI', () => {
  test('CT-FE-001 - Fluxo completo de registro', async ({ page }) => {
    const timestamp = Date.now();

    await page.goto('/registro.html');

    await page.getByRole('textbox', { name: 'Nome:', exact: true }).fill(`Carlos Oliveira ${timestamp}`);
    await page.getByRole('textbox', { name: 'Email:', exact: true }).fill(`carlos${timestamp}@teste.com`);
    await page.getByRole('textbox', { name: 'Senha:', exact: true }).fill('senha123');
    await page.getByRole('textbox', { name: 'Confirmar Senha:', exact: true }).fill('senha123');

    page.once('dialog', async dialog => {
      console.log('Register success alert:', dialog.message());
      expect(dialog.message()).toContain('Conta criada com sucesso');
      await dialog.accept();
    });

    await page.getByRole('button', { name: /registrar/i }).click();

    await expect(page).toHaveURL(/login\.html/);
    console.log('Current URL after register:', page.url());
  });

  test('CT-FE-002 - Validação de senhas não correspondentes', async ({ page }) => {
    await page.goto('/registro.html');

    await page.getByRole('textbox', { name: 'Nome:', exact: true }).fill('Carlos Oliveira');
    await page.getByRole('textbox', { name: 'Email:', exact: true }).fill(`teste${Date.now()}@email.com`);
    await page.getByRole('textbox', { name: 'Senha:', exact: true }).fill('senha123');
    await page.getByRole('textbox', { name: 'Confirmar Senha:', exact: true }).fill('senha456');

    page.once('dialog', async dialog => {
      console.log('Password mismatch alert:', dialog.message());
      expect(dialog.message()).toContain('As senhas não coincidem');
      await dialog.accept();
    });

    await page.getByRole('button', { name: /registrar/i }).click();

    await expect(page).toHaveURL(/registro\.html/);
    console.log('User remained on register page');
  });

  test('CT-FE-003 - Login com sucesso', async ({ page }) => {
    await page.goto('/login.html');

    await page.getByRole('textbox', { name: 'Email:', exact: true }).fill('admin@biblioteca.com');
    await page.getByRole('textbox', { name: 'Senha:', exact: true }).fill('123456');

    page.once('dialog', async dialog => {
      console.log('Login success alert:', dialog.message());
      expect(dialog.message()).toContain('Login realizado com sucesso');
      await dialog.accept();
    });

    await page.getByRole('button', { name: /entrar/i }).click();

    await expect(page).toHaveURL(/dashboard\.html/);

    const localStorageUser = await page.evaluate(() => ({
      usuarioLogado: localStorage.getItem('usuarioLogado'),
      usuario: localStorage.getItem('usuario')
    }));

    console.log('localStorage after login:', localStorageUser);
  });

  test('CT-FE-004 - Login com credenciais inválidas', async ({ page }) => {
    await page.goto('/login.html');

    await page.getByRole('textbox', { name: 'Email:', exact: true }).fill('admin@biblioteca.com');
    await page.getByRole('textbox', { name: 'Senha:', exact: true }).fill('senhaerrada');

    page.once('dialog', async dialog => {
      console.log('Invalid login alert:', dialog.message());
      await dialog.accept();
    });

    await page.getByRole('button', { name: /entrar/i }).click();

    await expect(page).toHaveURL(/login\.html/);
    await expect(page.getByRole('textbox', { name: 'Email:', exact: true })).toHaveValue('admin@biblioteca.com');

    console.log('Stayed on login page after invalid login');
  });

  test('CT-FE-005 - Verificar dashboard sem login', async ({ page }) => {
    await page.goto('/login.html');
    await page.evaluate(() => localStorage.clear());

    await page.goto('/dashboard.html');

    console.log('Current URL after protected route access:', page.url());

    await expect(page).toHaveURL(/login\.html/);
  });

  test('CT-FE-016 - Logout do sistema', async ({ page }) => {
    await page.goto('/login.html');

    page.once('dialog', async dialog => {
      console.log('Login alert before logout:', dialog.message());
      await dialog.accept();
    });

    await page.getByRole('textbox', { name: 'Email:', exact: true }).fill('admin@biblioteca.com');
    await page.getByRole('textbox', { name: 'Senha:', exact: true }).fill('123456');
    await page.getByRole('button', { name: /entrar/i }).click();

    await expect(page).toHaveURL(/dashboard\.html/);

    await page.getByRole('button', { name: /sair/i }).click();

    await expect(page).toHaveURL(/login\.html/);

    const storageData = await page.evaluate(() => ({
      usuarioLogado: localStorage.getItem('usuarioLogado'),
      usuario: localStorage.getItem('usuario')
    }));

    console.log('localStorage after logout:', storageData);
  });
});