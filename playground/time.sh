#!/bin/bash

# Запускаем команду и замеряем время выполнения
start_time=$(date +%s)

# Выполняем команду
npm run build

# Записываем время окончания
end_time=$(date +%s)

# Вычисляем разницу
elapsed_time=$((end_time - start_time))

# Выводим результат
echo "Время выполнения: $elapsed_time секунд"
