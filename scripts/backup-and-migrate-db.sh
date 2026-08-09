#!/usr/bin/env bash
set -euo pipefail

# OpenSloth — Database Backup & Rename Migration Script
# Backs up the legacy 'examforge' database and restores it into 'opensloth'

BACKUP_DIR="backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/examforge_backup_${TIMESTAMP}.sql"

mkdir -p "${BACKUP_DIR}"

echo "🐘 OpenSloth DB Migration Tool"
echo "──────────────────────────────"

# Check container running
CONTAINER=$(docker ps --filter "name=postgres" --format "{{.Names}}" | head -n 1)

if [ -z "${CONTAINER}" ]; then
  echo "⚠️  No running Postgres container found."
  echo "    Start Docker / docker compose first, then run this script."
  exit 1
fi

echo "📦 1. Dumping legacy 'examforge' database from container '${CONTAINER}'..."
if docker exec "${CONTAINER}" pg_dump -U postgres -d examforge > "${BACKUP_FILE}" 2>/dev/null; then
  echo "  ✓ Saved backup to: ${BACKUP_FILE}"
else
  echo "  ℹ️  DB 'examforge' does not exist yet inside container (fresh install)."
  echo "      No backup needed. Running seeds will set up 'opensloth' automatically."
  exit 0
fi

echo "🏗️ 2. Creating 'opensloth' database if missing..."
docker exec "${CONTAINER}" psql -U postgres -c "CREATE DATABASE opensloth;" 2>/dev/null || echo "  ✓ Database 'opensloth' already exists."

echo "🔄 3. Restoring data into 'opensloth'..."
docker exec -i "${CONTAINER}" psql -U postgres -d opensloth < "${BACKUP_FILE}" > /dev/null

echo "✅ Migration complete! Your data was safely backed up and copied to 'opensloth'."
