# Espectro API

Implementacao inicial do backend MVP descrito em `espectro_mvp.md`.

Stack:
- NestJS + TypeScript
- Prisma + PostgreSQL
- Redis + BullMQ
- OpenAI via `openai`

## O que ja esta implementado

- Schema Prisma com as entidades centrais do MVP.
- API para criar stories e artigos manuais.
- Pipeline inicial de extracao, clustering, analise e agregacao.
- Workers BullMQ para as filas do documento.
- Integracao com OpenAI configuravel por variavel de ambiente.
- Fallback deterministico para analise quando `OPENAI_API_KEY` nao estiver definido.

## Setup

1. Copie `.env.example` para `.env`.
2. Suba a infra local:

```bash
docker compose up -d
```

3. Instale dependencias:

```bash
pnpm install
```

4. Gere o client Prisma e sincronize o schema:

```bash
pnpm prisma generate
pnpm prisma db push
```

5. Inicie a API:

```bash
pnpm start:dev
```

## Fluxo do MVP

1. `POST /stories`
2. `POST /articles/manual`
3. `POST /articles/:id/extract`
4. `POST /stories/:storyId/cluster/:articleId`
5. `POST /stories/:storyId/articles/:articleId/analyze`
6. `POST /stories/:storyId/aggregate`
7. `GET /stories/:storyId/aggregation`

## Exemplo rapido

```bash
curl -X POST http://localhost:3000/stories \
  -H 'Content-Type: application/json' \
  -d '{
    "title": "STF decide sobre marco temporal",
    "canonicalSummary": "Comparar como portais com diferentes linhas editoriais cobrem a decisao."
  }'
```

```bash
curl -X POST http://localhost:3000/articles/manual \
  -H 'Content-Type: application/json' \
  -d '{
    "publisherName": "Portal Exemplo",
    "publisherDomain": "exemplo.com",
    "biasLabel": "center-left",
    "biasScore": -0.2,
    "url": "https://exemplo.com/noticia/stf-marco-temporal",
    "title": "STF forma maioria contra marco temporal",
    "rawText": "O Supremo Tribunal Federal formou maioria..."
  }'
```

## Observacoes

- `story.discovery` e `candidate.fetch` estao stubados de proposito nesta fase.
- O caminho mais rapido para o MVP e alimentar stories e artigos manualmente, validar a comparacao e depois automatizar discovery/fetch.
- O modelo OpenAI usado fica em `OPENAI_MODEL`. O valor default esta em `.env.example`.
