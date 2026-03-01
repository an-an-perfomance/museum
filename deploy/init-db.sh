#!/bin/bash
# Запуск один раз после первого поднятия контейнера db.
# Использование: из папки deploy выполнить: ./init-db.sh
# Или: bash init-db.sh

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "Ожидание запуска PostgreSQL..."
sleep 5

docker exec -i muzeum-postgres psql -U muzeum -d muzeum_db < "$PROJECT_ROOT/backend/init.sql"
echo "Готово: таблицы и начальные данные применены."
