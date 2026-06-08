#!/usr/bin/env bash
# Reprocessa todas as analyses existentes com force=true, util quando o schema
# do output da LLM muda (ex.: novo campo editorialReading).
# Requer: jq, curl, API em $API (default http://localhost:3000).

set -euo pipefail
API=${API:-http://localhost:3000}

stories=$(curl -s "$API/stories" | jq -r '.[].id')

for sid in $stories; do
  echo "==> Story $sid"
  detail=$(curl -s "$API/stories/$sid")
  echo "$detail" | jq -c '.storyArticleLinks[] | select(.decision=="MATCH") | {storyId: "'"$sid"'", articleId: .article.id, publisher: .article.publisher.name}' | while read -r row; do
    aid=$(echo "$row" | jq -r '.articleId')
    pub=$(echo "$row" | jq -r '.publisher')
    echo "   - reanalisando $pub ($aid)"
    curl -s -X POST "$API/stories/$sid/articles/$aid/analyze" \
      -H 'Content-Type: application/json' \
      -d '{"force":true}' >/dev/null
  done
  curl -s -X POST "$API/stories/$sid/aggregate" \
    -H 'Content-Type: application/json' -d '{}' >/dev/null
  echo "   aggregation OK"
done

echo "---"
echo "Pronto. Veja em $API/feed/homepage"
