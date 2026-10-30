max_cpu=0
max_mem=0

start_time=$(date +%s)  # Захват начального времени

npm run build &  # Запуск процесса в фоне
pid=$!           # Получение PID запущенного процесса

while kill -0 $pid 2>/dev/null; do
  # Получение всех процессов, связанных с родительским процессом
  total_cpu=0
  total_mem=0

  # Проход по всем дочерним процессам и суммирование их использования CPU и памяти
  for child in $(pgrep -P $pid); do
    cpu=$(ps -p $child -o %cpu= | awk '{print $1}')
    mem=$(ps -p $child -o rss= | awk '{print $1}')

    # Суммирование значений
    total_cpu=$(echo "$total_cpu + $cpu" | bc)
    total_mem=$((total_mem + mem))
  done

  # Обновление максимального использования CPU
  max_cpu=$(echo "$max_cpu $total_cpu" | awk '{if ($2 > $1) print $2; else print $1}')

  # Обновление максимального использования памяти
  max_mem=$(echo "$max_mem $total_mem" | awk '{if ($2 > $1) print $2; else print $1}')

  echo "Max CPU so far: $max_cpu%, Max Memory so far: $((max_mem / 1024)) MB"
  sleep 1
done

end_time=$(date +%s)  # Захват конечного времени
elapsed_time=$((end_time - start_time))  # Вычисление времени выполнения

# Преобразование времени в часы, минуты, секунды
hours=$((elapsed_time / 3600))
minutes=$(((elapsed_time % 3600) / 60))
seconds=$((elapsed_time % 60))

echo "Final Max CPU Usage: $max_cpu%"
echo "Final Max Memory Usage: $((max_mem / 1024)) MB"
echo "Elapsed Time: ${hours}h ${minutes}m ${seconds}s"
