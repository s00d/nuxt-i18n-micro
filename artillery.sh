#!/bin/bash

# Проверка наличия Artillery
if ! command -v artillery &> /dev/null; then
    echo "Artillery не установлен. Установите его с помощью npm install -g artillery."
    exit 1
fi


# Запуск Artillery
echo "Запуск Artillery теста на $1..."
artillery run "artillery-config.yml" --record --key a9_jGi0MTv-pQ5rBTZgmFNlJ4CoonVxYQQa

# Обработка результатов
echo "Результаты теста:"
artillery report artillery-output.json
