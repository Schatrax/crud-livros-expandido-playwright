# 📚 Test Automation - Biblioteca

Este projeto contém testes automatizados para o sistema de Biblioteca, cobrindo:

- Testes de API (Backend)
- Testes de UI (Frontend)

Os testes foram desenvolvidos com **Playwright**.

---

## 🎯 Objetivo

Garantir a qualidade da aplicação através de:

- Validação de regras de negócio
- Testes de fluxos do utilizador
- Verificação de integração entre frontend e backend
- Cobertura de cenários positivos e negativos

---

## 🛠️ Tecnologias Utilizadas

- Node.js
- Playwright
- JavaScript
- API REST

---

## 📋 Pré-requisitos

Antes de correr os testes, garantir que tens:

- Node.js (v16 ou superior recomendado)
- npm instalado
- Projeto da biblioteca a correr localmente

---

## 🚀 Como correr o projeto

### 1. Clonar o repositório

```bash
git clone https://github.com/Schatrax/crud-livros-expandido-playwright
cd crud-livros-expandido-playwright
```

### 2. Instalação
Na raiz do projeto, instalar as dependências:
```bash
npm install
```

Caso o Playwright ainda não esteja instalado:
```bash
npm install -D @playwright/test
npx playwright install
```

### 3. Correr a aplicação
Antes de correr os testes, é necessário iniciar o servidor da aplicação.

Na raiz do projeto:
```bash
npm start
```

A aplicação deve ficar disponível em:
- **App:** <http://localhost:3000>
- **Swagger:** <http://localhost:3000/api-docs>

### 4. Configuração do Playwright
O ficheiro playwright.config.js deve ter o baseURL configurado para:
```javascript
use: {
  baseURL: 'http://localhost:3000',
  screenshot: 'only-on-failure',
  video: 'retain-on-failure',
  trace: 'on-first-retry'
}
```

Com isto, os testes podem usar caminhos relativos, por exemplo:
```javascript
await page.goto('/login.html');
await request.get('/livros');
```

### 5. Estrutura dos testes
A estrutura usada foi separada entre testes de API e testes de UI:

```text
tests/
  api/
    auth.api.spec.js
    livros.api.spec.js
    estatisticas.api.spec.js
    favoritos.api.spec.js

  ui/
    auth.ui.spec.js
    dashboard.ui.spec.js
    livros.ui.spec.js
    favoritos.ui.spec.js
```

### 6. Como correr os testes

Correr todos os testes em headless mode:

```bash
npx playwright test
```

Correr com a interface gráfica do Playwright (ideal para debug):
```bash
npx playwright test --ui
```

### 7. Dados de teste usados
O sistema já contém um utilizador padrão:
Email: admin@biblioteca.com
Senha: 123456


Também existem livros criados:
1. Clean Code - Robert C. Martin
2. Harry Potter - J.K. Rowling

Nos testes que criam novos dados, foi usado Date.now() para gerar dados únicos, evitando conflitos entre execuções.
Exemplo:
```javascript
const email = `maria.${Date.now()}@teste.com`;
```


### 8. Testes de API
Os testes de API validam diretamente os endpoints REST, sem usar o browser.

Funcionalidades cobertas:
- Registro de utilizador
- Login
- Listagem de livros
- Consulta de livro por ID
- Criação de livro
- Atualização de livro
- Remoção de livro
- Estatísticas
- Favoritos

Exemplo de execução de request:
```javascript
const response = await request.get('/livros');
expect(response.status()).toBe(200);
```

### 9. Testes de UI
Os testes de UI validam o comportamento do utilizador no frontend.

Funcionalidades cobertas:
- Registro
- Login
- Proteção de rotas
- Logout
- Dashboard
- Navegação
- Gestão de livros
- Detalhes do livro
- Favoritos

Exemplo:
```javascript
await page.goto('/login.html');
await page.getByRole('textbox', { name: 'Email:', exact: true }).fill('admin@biblioteca.com');
await page.getByRole('textbox', { name: 'Senha:', exact: true }).fill('123456');
await page.getByRole('button', { name: /entrar/i }).click();
```

### 10. Boas práticas aplicadas
- Separação entre testes de API e testes de UI
- Uso de baseURL para evitar URLs repetidas
- Dados dinâmicos para evitar duplicação
- Validação de status codes
- Validação de conteúdo das respostas
- Validação de regras de negócio
- Verificação de comportamento após ações críticas
- Evidências automáticas em caso de falha
- Evitar waits fixos sempre que possível
- Uso de asserts explícitos com expect