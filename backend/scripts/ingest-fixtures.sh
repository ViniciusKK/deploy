#!/usr/bin/env bash
# Lê os .txt em fixtures/news/<slug>/ e popula a API:
#   POST /stories -> POST /articles/manual -> /extract -> /cluster -> /analyze -> /aggregate
# Requer: jq, curl, API up em $API (default http://localhost:3000).

set -euo pipefail
API=${API:-http://localhost:3000}
ROOT=${ROOT:-fixtures/news}

SLUGS=("marco-temporal" "arcabouco-fiscal" "8-de-janeiro")

story_payload () {
  case "$1" in
    marco-temporal)
      echo '{"title":"STF derruba marco temporal das terras indígenas","canonicalSummary":"Em 21/09/2023 o STF rejeitou por 9 a 2 a tese do marco temporal para demarcação de terras indígenas.","seedKeywords":["marco temporal","STF","indígenas","demarcação"]}'
      ;;
    arcabouco-fiscal)
      echo '{"title":"Lula sanciona novo arcabouço fiscal","canonicalSummary":"Em 31/08/2023 foi sancionada a LC 200, que substitui o teto de gastos.","seedKeywords":["arcabouço fiscal","Haddad","teto de gastos","LC 200"]}'
      ;;
    8-de-janeiro)
      echo '{"title":"PF mira financiadores dos atos de 8 de janeiro","canonicalSummary":"Operação Lesa Pátria avança sobre empresários e ruralistas suspeitos de financiar os atos golpistas.","seedKeywords":["8 de janeiro","Lesa Pátria","financiadores","PF"]}'
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
echo "Homepage: curl -s $API/stories | jq"
