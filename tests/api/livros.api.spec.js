// @ts-check
import { test, expect } from '@playwright/test';

test.describe('Livros API', () => {
  test('CT-API-005 - Listar todos os livros', async ({ request }) => {
    const response = await request.get('/livros');
    const body = await response.json();

    console.log('GET /livros status:', response.status());
    console.log('GET /livros body:', body);

    expect(response.status()).toBe(200);
    expect(Array.isArray(body)).toBe(true);

    if (body.length > 0) {
      const livro = body[0];

      expect(livro).toHaveProperty('id');
      expect(livro).toHaveProperty('nome');
      expect(livro).toHaveProperty('autor');
      expect(livro).toHaveProperty('paginas');
      expect(livro).toHaveProperty('descricao');
      expect(livro).toHaveProperty('imagemUrl');
      expect(livro).toHaveProperty('dataCadastro');

      expect(Number.isInteger(livro.paginas)).toBe(true);
      expect(livro.paginas).toBeGreaterThan(0);
      expect(new Date(livro.dataCadastro).toString()).not.toBe('Invalid Date');
    }
  });

  test('CT-API-006 - Buscar livro por ID existente', async ({ request }) => {
    const response = await request.get('/livros/1');
    const body = await response.json();

    console.log('GET /livros/1 status:', response.status());
    console.log('GET /livros/1 body:', body);

    expect(response.status()).toBe(200);
    expect(body.id).toBe(1);
    expect(body.nome).toBeTruthy();
    expect(body.autor).toBeTruthy();
    expect(body.paginas).toBeGreaterThan(0);
  });

  test('CT-API-007 - Buscar livro por ID inexistente', async ({ request }) => {
    const response = await request.get('/livros/9999');
    const body = await response.json();

    console.log('GET /livros/9999 status:', response.status());
    console.log('GET /livros/9999 body:', body);

    expect(response.status()).toBe(404);
    expect(body.mensagem).toBe('Livro não encontrado');
  });

  test('CT-API-008 - Adicionar novo livro', async ({ request }) => {
    const payload = {
      nome: `Código Limpo ${Date.now()}`,
      autor: 'Robert C. Martin',
      paginas: 425,
      descricao: 'Manual de boas práticas',
      imagemUrl: 'https://exemplo.com/imagem.jpg'
    };

    const response = await request.post('/livros', { data: payload });
    const body = await response.json();

    console.log('POST /livros status:', response.status());
    console.log('POST /livros body:', body);

    expect(response.status()).toBe(201);
    expect(body.id).toBeGreaterThan(0);
    expect(body.nome).toBe(payload.nome);
    expect(body.autor).toBe(payload.autor);
    expect(body.paginas).toBe(payload.paginas);
    expect(body.descricao).toBe(payload.descricao);
    expect(body.imagemUrl).toBe(payload.imagemUrl);
    expect(body.dataCadastro).toBeTruthy();
  });

  test('CT-API-009 - Atualizar livro existente', async ({ request }) => {
    const createPayload = {
      nome: `Livro Base ${Date.now()}`,
      autor: 'Autor Base',
      paginas: 300,
      descricao: 'Descrição base',
      imagemUrl: 'https://exemplo.com/base.jpg'
    };

    const createResponse = await request.post('/livros', { data: createPayload });
    const createdBook = await createResponse.json();

    console.log('Created book for update:', createdBook);

    const updatePayload = {
      nome: 'Clean Code - Edição Atualizada',
      autor: 'Robert C. Martin',
      paginas: 464,
      descricao: 'Guia completo atualizado',
      imagemUrl: 'https://exemplo.com/nova-imagem.jpg'
    };

    const updateResponse = await request.put(`/livros/${createdBook.id}`, {
      data: updatePayload
    });

    const updatedBook = await updateResponse.json();

    console.log('PUT /livros/:id status:', updateResponse.status());
    console.log('PUT /livros/:id body:', updatedBook);

    expect(updateResponse.status()).toBe(200);
    expect(updatedBook.id).toBe(createdBook.id);
    expect(updatedBook.nome).toBe(updatePayload.nome);
    expect(updatedBook.autor).toBe(updatePayload.autor);
    expect(updatedBook.paginas).toBe(updatePayload.paginas);
    expect(updatedBook.descricao).toBe(updatePayload.descricao);
    expect(updatedBook.imagemUrl).toBe(updatePayload.imagemUrl);
  });

  test('CT-API-010 - Deletar livro', async ({ request }) => {
    const createPayload = {
      nome: `Livro para delete ${Date.now()}`,
      autor: 'Autor Delete',
      paginas: 123,
      descricao: 'Será removido',
      imagemUrl: 'https://exemplo.com/delete.jpg'
    };

    const createResponse = await request.post('/livros', { data: createPayload });
    const createdBook = await createResponse.json();

    console.log('Created book for delete:', createdBook);

    const deleteResponse = await request.delete(`/livros/${createdBook.id}`);
    const deleteBody = await deleteResponse.json();

    console.log('DELETE /livros/:id status:', deleteResponse.status());
    console.log('DELETE /livros/:id body:', deleteBody);

    expect(deleteResponse.status()).toBe(200);
    expect(deleteBody.mensagem).toBe('Livro removido com sucesso');

    const getDeletedResponse = await request.get(`/livros/${createdBook.id}`);
    const getDeletedBody = await getDeletedResponse.json();

    console.log('GET deleted book status:', getDeletedResponse.status());
    console.log('GET deleted book body:', getDeletedBody);

    expect(getDeletedResponse.status()).toBe(404);
  });
});