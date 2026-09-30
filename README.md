# Lead AI

Formulário de captação de leads → análise com Claude API → Neon (Postgres) → painel protegido para o vendedor.

Stack: Next.js (App Router) + TypeScript, Drizzle ORM, Neon, Zod, `jose` (JWT).

## Variáveis de ambiente

Veja `.env.example`. Todas são obrigatórias em produção:
`DATABASE_URL`, `ANTHROPIC_API_KEY`, `PAINEL_USER`, `PAINEL_PASSWORD`, `JWT_SECRET` (mín. 32 caracteres; gere com `openssl rand -base64 48`).

## Rodar local

```bash
npm install
cp .env.example .env.local   # preencha os valores
npm run db:push              # cria/atualiza as tabelas (inclui rate_limits)
npm run dev
```

## Deploy na Vercel

1. **Antes do deploy**, com a `DATABASE_URL` de produção no `.env.local`, rode `npm run db:push` (cria a tabela `rate_limits`; sem ela login e formulário retornam erro).
2. Suba o projeto para um repositório Git (o `.gitignore` já exclui `.env*`) e importe na Vercel (framework: Next.js, sem configurar build).
3. Em *Settings > Environment Variables*, cadastre as 5 variáveis acima (Production).
4. Deploy. Acesse `/login`.

## Segurança implementada

- **Login com JWT**: HS256 fixo, `iss`/`aud`/`exp` validados, 8 h de validade, cookie `HttpOnly` + `Secure` + `SameSite=Strict` (`__Host-` em produção).
- **Força bruta**: 5 tentativas por 15 min por visitante (contador no banco, funciona em serverless), mensagem de erro única, comparação em tempo constante.
- **Autorização em camadas**: proxy + revalidação da sessão dentro das rotas e do painel.
- **CSRF**: checagem de `Origin` + cookie `SameSite=Strict`.
- **Abuso / custo da IA**: rate limit no formulário (por visitante e global), limite de tamanho do corpo, honeypot, timeout na Claude API.
- **Headers**: CSP, HSTS, X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy.
- **Dependências** com versões fixas; pacotes não usados removidos.

Sessão é stateless: para invalidar todas as sessões, troque o `JWT_SECRET`.
