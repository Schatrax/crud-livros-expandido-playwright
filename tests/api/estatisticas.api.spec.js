import { test, expect } from '@playwright/test';

test.describe('Estatísticas API', () => {
  test('CT-API-011 - Obter estatísticas da biblioteca', async ({ request }) => {
    const livrosResponse = await request.get('/livros');
    const livros = await livrosResponse.json();

    const response = await request.get('/estatisticas');
    const body = await response.json();

    console.log('GET /estatisticas status:', response.status());
    console.log('GET /estatisticas body:', body);

    const somaPaginas = livros.reduce((acc, livro) => acc + livro.paginas, 0);

    expect(response.status()).toBe(200);
    expect(Number.isInteger(body.totalLivros)).toBe(true);
    expect(Number.isInteger(body.totalPaginas)).toBe(true);
    expect(Number.isInteger(body.totalUsuarios)).toBe(true);

    expect(body.totalLivros).toBeGreaterThanOrEqual(0);
    expect(body.totalPaginas).toBeGreaterThanOrEqual(0);
    expect(body.totalUsuarios).toBeGreaterThanOrEqual(0);

    expect(body.totalPaginas).toBe(somaPaginas);
  });
});