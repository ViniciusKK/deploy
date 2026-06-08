#!/usr/bin/env bash
# Move stories para datas anteriores para testar a navegação do calendário.
# Requer: psql disponível ou DATABASE_URL apontando pro Railway.
# Uso: DATABASE_URL="postgresql://..." bash scripts/backfill-dates.sh

set -euo pipefail

DB=${DATABASE_URL:?'DATABASE_URL não definida'}

echo "Buscando stories existentes..."

# Lista todas as stories ordenadas por createdAt
STORIES=$(psql "$DB" -t -A -F'|' -c "SELECT id, title FROM stories ORDER BY created_at ASC")

if [[ -z "$STORIES" ]]; then
  echo "Nenhuma story encontrada."; exit 1
fi

# Converte para array
IDS=()
TITLES=()
while IFS='|' read -r id title; do
  IDS+=("$id")
  TITLES+=("$title")
done <<< "$STORIES"

TOTAL=${#IDS[@]}
echo "Encontradas $TOTAL stories."
echo ""

# Distribui as stories em dias: hoje, ontem, anteontem...
# Stories mais antigas recebem datas mais antigas
TODAY=$(date -u +%Y-%m-%d)

for i in "${!IDS[@]}"; do
  ID="${IDS[$i]}"
  TITLE="${TITLES[$i]}"

  # Calcula quantos dias atrás: últimas ficam em hoje, primeiras ficam mais atrás
  DAYS_AGO=$(( (TOTAL - 1 - i) / 3 ))  # agrupa ~3 stories por dia
  TARGET_DATE=$(date -u -v-${DAYS_AGO}d +"%Y-%m-%d" 2>/dev/null || date -u -d "-${DAYS_AGO} days" +"%Y-%m-%d")
  TARGET_TS="${TARGET_DATE}T12:00:00.000Z"

  echo "  [$((i+1))/$TOTAL] $TITLE"
  echo "        → $TARGET_DATE"

  psql "$DB" -c "UPDATE stories SET created_at = '$TARGET_TS', updated_at = '$TARGET_TS' WHERE id = '$ID';" > /dev/null
done

echo ""
echo "Pronto. Datas atualizadas:"
psql "$DB" -c "SELECT TO_CHAR(created_at, 'YYYY-MM-DD') as data, COUNT(*) as stories FROM stories GROUP BY 1 ORDER BY 1 DESC;"
