#!/usr/bin/env bash
# Ingere a notícia do árbitro somali Omar Artan (Supercopa da Europa 2026).
# Requer: jq, curl, API rodando em $API (default http://localhost:4000).

set -euo pipefail
API=${API:-http://localhost:4000}
ROOT=${ROOT:-fixtures/news/arbitro-somali}

STORY_PAYLOAD=$(jq -n \
  --arg title "Vetado pelos EUA, árbitro somali é escalado para a Supercopa da Europa" \
  --arg summary "Omar Artan foi impedido de entrar nos EUA para a Copa do Mundo por preocupações com triagem, retornou à Somália e foi nomeado pela UEFA para apitar a Supercopa entre PSG e Aston Villa em agosto de 2026." \
  '{title:$title,canonicalSummary:$summary,seedKeywords:["Omar Artan","árbitro somali","UEFA","Supercopa da Europa","Copa do Mundo","EUA","Somália","PSG","Aston Villa"]}'
)

parse_meta () {
  awk -v k="$2" -F': *' '$1==k {sub(/^[^:]+: */,""); print; exit}' "$1"
}

extract_body () {
  awk '/^---$/{p=1;next} p' "$1"
}

echo "==> Criando story: Árbitro Somali / Supercopa da Europa"
STORY_RESP=$(curl -s -X POST "$API/stories" \
  -H 'Content-Type: application/json' \
  -d "$STORY_PAYLOAD")
STORY_ID=$(echo "$STORY_RESP" | jq -r '.id // empty')
if [[ -z "$STORY_ID" ]]; then
  echo "ERRO criando story: $STORY_RESP"; exit 1
fi
echo "   story_id=$STORY_ID"

for f in "$ROOT"/*.txt; do
  title=$(parse_meta "$f" TITLE)
  url=$(parse_meta "$f" URL)
  pub=$(parse_meta "$f" PUBLISHER)
  domain=$(parse_meta "$f" DOMAIN)
  bias=$(parse_meta "$f" BIAS_LABEL)
  score=$(parse_meta "$f" BIAS_SCORE)
  body=$(extract_body "$f")

  payload=$(jq -n \
    --arg pn "$pub" --arg pd "$domain" --arg bl "$bias" \
    --argjson bs "$score" --arg url "$url" --arg t "$title" --arg rt "$body" \
    '{publisherName:$pn,publisherDomain:$pd,biasLabel:$bl,biasScore:$bs,url:$url,title:$t,rawText:$rt}')

  ART_RESP=$(curl -s -X POST "$API/articles/manual" \
    -H 'Content-Type: application/json' \
    -d "$payload")
  ART_ID=$(echo "$ART_RESP" | jq -r '.id // empty')
  if [[ -z "$ART_ID" ]]; then
    echo "   ERRO criando artigo ($pub): $ART_RESP"; continue
  fi
  echo "   + $pub -> article=$ART_ID"

  curl -s -X POST "$API/articles/$ART_ID/extract" > /dev/null
  echo "     extract OK"

  curl -s -X POST "$API/stories/$STORY_ID/cluster/$ART_ID" \
    -H 'Content-Type: application/json' \
    -d '{"overrideDecision":"MATCH","rationale":"Inserção manual com decisão confirmada."}' > /dev/null
  echo "     cluster OK (MATCH forçado)"

  curl -s -X POST "$API/stories/$STORY_ID/articles/$ART_ID/analyze" \
    -H 'Content-Type: application/json' \
    -d '{}' > /dev/null
  echo "     analyze OK"
done

curl -s -X POST "$API/stories/$STORY_ID/aggregate" \
  -H 'Content-Type: application/json' \
  -d '{}' > /dev/null
echo "   aggregate OK"
echo ""
echo "Concluído! story_id=$STORY_ID"
echo "Verifique: curl -s $API/feed/homepage | jq '.hero.title'"
