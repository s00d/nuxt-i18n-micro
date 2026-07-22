#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG="${SCRIPT_DIR}/artillery-config.yml"
OUTPUT="${SCRIPT_DIR}/artillery-output.json"

# Проверка наличия Artillery
if ! command -v artillery &> /dev/null; then
    echo "Artillery не установлен. Установите его с помощью npm install -g artillery."
    exit 1
fi

# Ключ Artillery Cloud берётся из окружения: export ARTILLERY_CLOUD_KEY=...
if [ -z "${ARTILLERY_CLOUD_KEY:-}" ]; then
    echo "ARTILLERY_CLOUD_KEY не задан. Запуск без записи в Artillery Cloud..."
    artillery run "$CONFIG" --output "$OUTPUT"
else
    echo "Запуск Artillery теста (запись в Artillery Cloud)..."
    # Ключ передаём через переменную окружения, чтобы он не светился в argv/списке процессов.
    ARTILLERY_CLOUD_API_KEY="$ARTILLERY_CLOUD_KEY" artillery run "$CONFIG" --record --output "$OUTPUT"
fi

# Обработка результатов
echo "Результаты теста:"
artillery report "$OUTPUT"
