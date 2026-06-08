# Deploy do MVP — Espectro

## Stack do projeto

| Camada | Tecnologia |
|---|---|
| Frontend | Next.js 14 + Tailwind |
| Backend | NestJS + BullMQ |
| Banco | PostgreSQL (Prisma) |
| Fila | Redis |
| IA | OpenAI API |

---

## Recomendação: Railway (backend) + Vercel (frontend)

Essa é a combinação com menor atrito para um MVP de faculdade. Railway roda NestJS, PostgreSQL e Redis em um único painel com variáveis de ambiente compartilhadas. Vercel faz deploy do Next.js com zero configuração.

**Custo estimado**: Railway tem $5 de crédito grátis na criação da conta — suficiente para semanas de uso leve. Vercel é gratuito.

---

## Passo a passo

### 1. Backend no Railway

1. Acesse [railway.app](https://railway.app) e crie uma conta
2. Clique em **New Project → Deploy from GitHub repo**
3. Selecione este repositório e configure o **Root Directory** como `backend`
4. Railway vai detectar o NestJS automaticamente via Nixpacks

**Adicione os serviços de infraestrutura:**

No mesmo projeto Railway:
- Clique em **New → Database → PostgreSQL** — Railway injeta `DATABASE_URL` automaticamente
- Clique em **New → Database → Redis** — Railway injeta `REDIS_URL` automaticamente

**Variáveis de ambiente** (aba Variables do serviço NestJS):

```
NODE_ENV=production
PORT=4000
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
CORS_ORIGINS=https://seu-frontend.vercel.app
```

> `DATABASE_URL` e `REDIS_URL` são injetadas automaticamente pelo Railway — não precisa adicionar manualmente.

5. Após o deploy, copie a URL pública do serviço (ex: `https://espectro-api-production.up.railway.app`)

**Rode a migration do banco** via Railway CLI ou pelo painel de Deploy Commands:

```bash
prisma migrate deploy
```

---

### 2. Frontend no Vercel

1. Acesse [vercel.com](https://vercel.com) e crie uma conta
2. Clique em **Add New → Project → Import Git Repository**
3. Selecione este repositório e configure:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Next.js (detectado automaticamente)

**Variável de ambiente** (aba Environment Variables):

```
NEXT_PUBLIC_API_URL=https://espectro-api-production.up.railway.app
```

> Você precisará ajustar as chamadas de API no frontend para usar `NEXT_PUBLIC_API_URL` se ainda não estiver configurado.

4. Clique em **Deploy** — em ~2 minutos o frontend estará em `https://espectro-web.vercel.app` (ou domínio customizado)

---

## Checklist antes da apresentação

- [ ] Backend respondendo em `/` ou rota de health check
- [ ] Frontend carregando dados reais (não mock)
- [ ] Variável `CORS_ORIGINS` no Railway aponta para a URL do Vercel
- [ ] Migration do banco rodada (`prisma migrate deploy`)
- [ ] Testar o fluxo completo 1 hora antes da apresentação
- [ ] Railway e Vercel não estão no free tier inativo (os serviços não dormem no Railway por padrão)

---

## Alternativas (caso Railway ou Vercel não funcionem)

| Serviço | Substituto | Observação |
|---|---|---|
| Railway (backend) | Render | Free tier dorme após 15 min de inatividade — ruim para demo ao vivo |
| Railway (PostgreSQL) | Neon | Gratuito, Serverless PostgreSQL |
| Railway (Redis) | Upstash | Gratuito, Serverless Redis |
| Vercel (frontend) | Netlify | Suporte a Next.js é mais limitado |

---

## Estrutura de URLs após o deploy

```
https://espectro-web.vercel.app          ← frontend público
https://espectro-api-xxx.up.railway.app  ← API backend
```
