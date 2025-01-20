#!/bin/bash

# Используем gdate (GNU date) для получения времени в наносекундах
start_time=$(gdate +%s%N)

# Выполняем команду
npm run build

# Записываем время окончания
end_time=$(gdate +%s%N)

# Вычисляем разницу в наносекундах
elapsed_ns=$((end_time - start_time))

# Преобразуем наносекунды в миллисекунды
elapsed_ms=$((elapsed_ns / 1000000))

# Преобразуем миллисекунды в часы, минуты, секунды и миллисекунды
hours=$((elapsed_ms / 3600000))
elapsed_ms=$((elapsed_ms % 3600000))

minutes=$((elapsed_ms / 60000))
elapsed_ms=$((elapsed_ms % 60000))

seconds=$((elapsed_ms / 1000))
milliseconds=$((elapsed_ms % 1000))

# Выводим результат в формате h:m:s:ms
printf "Время выполнения: %02d:%02d:%02d:%03d\n" "$hours" "$minutes" "$seconds" "$milliseconds"
