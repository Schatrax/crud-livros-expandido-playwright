import { test, expect } from '@playwright/test';

test.describe('Favoritos API', () => {
  test('CT-API-012 - Adicionar livro aos favoritos', async ({ request }) => {
    const response = await request.post('/favoritos', {
      data: {
        usuarioId: 1,
        livroId: 1
      }
    });

    const body = await response.json();

    console.log('POST /favoritos status:', response.status());
    console.log('POST /favoritos body:', body);

    expect(response.status()).toBe(201);
    expect(body.mensagem).toBe('Livro adicionado aos favoritos');
  });

  test('CT-API-013 - Listar favoritos do usuário', async ({ request }) => {
    await request.post('/favoritos', {
      data: {
        usuarioId: 1,
        livroId: 1
      }
    });

    const response = await request.get('/favoritos/1');
    const body = await response.json();

    console.log('GET /favoritos/1 status:', response.status());
    console.log('GET /favoritos/1 body:', body);

    expect(response.status()).toBe(200);
    expect(Array.isArray(body)).toBe(true);
  });
});