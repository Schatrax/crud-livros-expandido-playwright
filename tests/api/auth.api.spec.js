import { test, expect } from '@playwright/test';

test.describe('Auth API', () => {
  test('CT-API-001 - Registro de novo usuário com sucesso', async ({ request }) => {
    const timestamp = Date.now();

    const payload = {
      nome: `Maria Silva ${timestamp}`,
      email: `maria.${timestamp}@teste.com`,
      senha: 'senha123'
    };

    const response = await request.post('/registro', { data: payload });
    const body = await response.json();

    console.log('POST /registro status:', response.status());
    console.log('POST /registro body:', body);

    expect(response.status()).toBe(201);
    expect(body.mensagem).toBe('Usuário criado com sucesso');
    expect(body.usuario.id).toBeGreaterThan(0);
    expect(body.usuario.nome).toBe(payload.nome);
    expect(body.usuario.email).toBe(payload.email);
    expect(body.usuario.senha).toBeUndefined();
  });

  test('CT-API-002 - Registro com email duplicado', async ({ request }) => {
    const payload = {
      nome: 'João Santos',
      email: 'admin@biblioteca.com',
      senha: 'senha456'
    };

    const response = await request.post('/registro', { data: payload });
    const body = await response.json();

    console.log('POST /registro duplicate status:', response.status());
    console.log('POST /registro duplicate body:', body);

    expect(response.status()).toBe(400);
    expect(body.mensagem).toBe('Email já cadastrado');
  });

  test('CT-API-003 - Login com credenciais válidas', async ({ request }) => {
    const start = Date.now();

    const response = await request.post('/login', {
      data: {
        email: 'admin@biblioteca.com',
        senha: '123456'
      }
    });

    const end = Date.now();
    const duration = end - start;

    const body = await response.json();

    console.log('POST /login success status:', response.status());
    console.log('POST /login success body:', body);
    console.log('POST /login response time:', duration, 'ms');

    expect(response.status()).toBe(200);
    expect(body.mensagem).toBe('Login realizado com sucesso');
    expect(body.usuario).toBeTruthy();
    expect(body.usuario.senha).toBeUndefined();
    expect(duration).toBeLessThan(2000);
  });

  test('CT-API-004 - Login com credenciais inválidas', async ({ request }) => {
    const response = await request.post('/login', {
      data: {
        email: 'admin@biblioteca.com',
        senha: 'senhaerrada'
      }
    });

    const body = await response.json();

    console.log('POST /login invalid status:', response.status());
    console.log('POST /login invalid body:', body);

    expect(response.status()).toBe(401);
    expect(body.mensagem).toBe('Email ou senha incorretos');
  });
});