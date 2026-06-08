# Fixtures de notícias

Cada subpasta é uma **story**. Cada `.txt` é um **artigo** de um veículo, com metadados no header.

## Como preencher

1. Abra a URL no header de cada `.txt`.
2. Copie só o corpo da matéria (sem menus / chamadas / comentários).
3. Substitua o bloco `COLE AQUI O CORPO DA MATÉRIA...` pelo texto. Mantenha o separador `---` antes do corpo.
4. Não mexa no header (`TITLE`, `URL`, `PUBLISHER`, `DOMAIN`, `BIAS_LABEL`, `BIAS_SCORE`).

Se uma URL estiver com paywall, troque pela alternativa do mesmo espectro listada no chat e atualize `URL` / `PUBLISHER` / `DOMAIN`.

## Como rodar

Com a API up (`pnpm start:dev`) e Postgres/Redis subidos:

```bash
chmod +x scripts/ingest-fixtures.sh
./scripts/ingest-fixtures.sh
```

O script cria a story, registra os 3 artigos manuais, roda extract → cluster → analyze e fecha com aggregate. Arquivos ainda não preenchidos são pulados (`SKIP`).

Inspeção:

```bash
curl -s http://localhost:3000/stories | jq                    # homepage
curl -s http://localhost:3000/stories/<id>/aggregation | jq   # distribuição + blindspots
```

## Stories

| Slug | Story | Espectros cobertos |
|---|---|---|
| `marco-temporal` | STF derruba marco temporal (set/2023) | left / center-left / right |
| `arcabouco-fiscal` | Lula sanciona arcabouço fiscal (ago/2023) | left / center / right |
| `8-de-janeiro` | PF mira financiadores do 8 de janeiro | left / center / right |
