#!/usr/bin/env bash
# Ingere as novas histórias: Caso Master, Pesquisa AtlasIntel, Escala 6x1, Bets.
# Uso: API=https://... bash scripts/ingest-fixtures-2.sh

set -euo pipefail
API=${API:-http://localhost:4000}
ROOT=${ROOT:-fixtures/news}

SLUGS=("caso-master" "pesquisa-atlasIntel" "escala-6x1" "regulacao-bets")

story_payload () {
  case "$1" in
    caso-master)
      echo '{"title":"Caso Master e o áudio de Flávio Bolsonaro","canonicalSummary":"Áudios obtidos pela PF mostram Flávio Bolsonaro pedindo R$ 134 milhões ao dono do Banco Master para financiar filme sobre Jair Bolsonaro, ampliando a crise do banco em ano eleitoral.","seedKeywords":["Banco Master","Flávio Bolsonaro","Dark Horse","PF","escândalo"]}'
      ;;
    pesquisa-atlasIntel)
      echo '{"title":"Nunes Marques suspende pesquisa da AtlasIntel sobre Flávio Bolsonaro","canonicalSummary":"Ministro do STF indicado por Bolsonaro atende pedido do senador e suspende divulgação de pesquisa que mostrava queda nas intenções de voto após o escândalo do Master.","seedKeywords":["AtlasIntel","Nunes Marques","STF","pesquisa eleitoral","censura"]}'
      ;;
    escala-6x1)
      echo '{"title":"Debate sobre o fim da escala de trabalho 6x1 no Senado","canonicalSummary":"PEC 221/19 propõe extinguir a escala 6x1. Enquanto a esquerda defende a saúde dos trabalhadores, a direita alerta para risco de desemprego e propõe modelo de flexibilização.","seedKeywords":["escala 6x1","PEC 221","jornada de trabalho","Rogério Marinho","direitos trabalhistas"]}'
      ;;
    regulacao-bets)
      echo '{"title":"Proibição ou regulação das apostas esportivas online","canonicalSummary":"Lula defende medidas duras contra bets alegando dano social às famílias, enquanto oposição no Senado prefere aumentar a taxação e criar CPI para investigar lavagem de dinheiro.","seedKeywords":["bets","apostas esportivas","regulação","CPI","Lula","taxação"]}'
      ;;
  esac
}

parse_meta () {
  awk -v k="$2" -F': *' '$1==k {sub(/^[^:]+: */,""); print; exit}' "$1"
}

extract_body () {
  awk '/^---$/{p=1;next} p' "$1"
}

for slug in "${SLUGS[@]}"; do
  echo "==> Story: $slug"

  STORY_RESP=$(curl -s -X POST "$API/stories" -H 'Content-Type: application/json' -d "$(story_payload "$slug")")
  STORY_ID=$(echo "$STORY_RESP" | jq -r '.id // empty')
  if [[ -z "$STORY_ID" ]]; then
    echo "   ERRO criando story: $STORY_RESP"; exit 1
  fi
  echo "   story_id=$STORY_ID"

  shopt -s nullglob
  for f in "$ROOT/$slug"/*.txt; do
    title=$(parse_meta "$f" TITLE)
    url=$(parse_meta "$f" URL)
    pub=$(parse_meta "$f" PUBLISHER)
    domain=$(parse_meta "$f" DOMAIN)
    bias=$(parse_meta "$f" BIAS_LABEL)
    score=$(parse_meta "$f" BIAS_SCORE)
    body=$(extract_body "$f")

    if [[ "$body" == *"COLE AQUI O CORPO DA MATÉRIA"* ]] || [[ -z "${body// /}" ]]; then
      echo "   - SKIP $(basename "$f") (corpo ainda não preenchido)"
      continue
    fi

    payload=$(jq -n \
      --arg pn "$pub" --arg pd "$domain" --arg bl "$bias" \
      --argjson bs "$score" --arg url "$url" --arg t "$title" --arg rt "$body" \
      '{publisherName:$pn,publisherDomain:$pd,biasLabel:$bl,biasScore:$bs,url:$url,title:$t,rawText:$rt}')

    ART_RESP=$(curl -s -X POST "$API/articles/manual" -H 'Content-Type: application/json' -d "$payload")
    ART_ID=$(echo "$ART_RESP" | jq -r '.id // empty')
    if [[ -z "$ART_ID" ]]; then
      echo "   - ERRO criando article ($pub): $ART_RESP"; continue
    fi
    echo "   - $pub article=$ART_ID"

    curl -s -X POST "$API/articles/$ART_ID/extract" >/dev/null
    curl -s -X POST "$API/stories/$STORY_ID/cluster/$ART_ID" \
      -H 'Content-Type: application/json' -d '{}' >/dev/null
    curl -s -X POST "$API/stories/$STORY_ID/articles/$ART_ID/analyze" \
      -H 'Content-Type: application/json' -d '{}' >/dev/null
  done

  curl -s -X POST "$API/stories/$STORY_ID/aggregate" \
    -H 'Content-Type: application/json' -d '{}' >/dev/null
  echo "   aggregation OK -> $API/stories/$STORY_ID/aggregation"
done

echo "---"
echo "Homepage: curl -s $API/feed/homepage | jq"
