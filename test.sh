#!/bin/bash

# Параметры по умолчанию
PORT=${1:-10011}               # Порт (первый аргумент, по умолчанию 10011)
HOST=${2:-"localhost"}         # Хост (второй аргумент, по умолчанию "localhost")
FIXTURES_DIR=${3:-"./test/fixtures/strategy"}  # Папка с фикстурами (третий аргумент, по умолчанию "./test/fixtures/strategy")

# Списки ссылок и ожидаемых текстов для каждой стратегии
declare -A strategy_urls=(
  ["no_prefix"]="
    http://$HOST:$PORT|en
    http://$HOST:$PORT/contact|contact
    http://$HOST:$PORT/kontakt|contact
  "
  ["prefix_except_default"]="
    http://$HOST:$PORT|en
    http://$HOST:$PORT/ru|ru
    http://$HOST:$PORT/de|de
    http://$HOST:$PORT/ru/contact|contact
    http://$HOST:$PORT/de/kontakt|contact
  "
  ["prefix"]="
    http://$HOST:$PORT/en|en
    http://$HOST:$PORT/ru|ru
    http://$HOST:$PORT/de|de
    http://$HOST:$PORT/en/contact|contact
    http://$HOST:$PORT/ru/contact|contact
    http://$HOST:$PORT/de/kontakt|contact
  "
  ["prefix_and_default"]="
    http://$HOST:$PORT|en
    http://$HOST:$PORT/en|en
    http://$HOST:$PORT/ru|ru
    http://$HOST:$PORT/de|de
    http://$HOST:$PORT/en/contact|contact
    http://$HOST:$PORT/ru/contact|contact
    http://$HOST:$PORT/de/kontakt|contact
  "
)

# Функция для освобождения порта
free_port() {
  local port=$1

  echo "Checking if port $port is in use..."

  # Ищем процесс, использующий порт
  pid=$(lsof -ti :$port)
  if [ -n "$pid" ]; then
    echo "Port $port is in use by process $pid. Killing the process..."
    kill -9 $pid
    echo "Process $pid killed."
  else
    echo "Port $port is free."
  fi
}

# Функция для запуска команды
run_command() {
  echo "Running command: $1"
  eval $1 > /dev/null 2>&1
  if [ $? -ne 0 ]; then
    echo "❌ Command failed: $1"
    free_port $PORT
    exit 1  # Завершаем скрипт при ошибке
  fi
}

# Функция для проверки контента на странице
check_content() {
  local url=$1
  local expected_text=$2
  local strategy=$3

  echo "Checking $url for text: $expected_text"

  response=$(curl -s $url)
  if [[ $response == *"$expected_text"* ]]; then
    echo "✅ Text found: $expected_text"
  else
    echo "❌ [Strategy: $strategy] Text not found: $expected_text at $url"
    free_port $PORT
    exit 1  # Завершаем скрипт при ошибке
  fi
}

# Функция для ожидания появления контента
wait_for_content() {
  local url=$1
  local expected_text=$2
  local strategy=$3
  local max_attempts=${4:-30}  # Максимальное количество попыток (по умолчанию 30)
  local delay=${5:-1}          # Задержка между попытками (по умолчанию 1 секунда)

  echo "Waiting for content at $url..."

  for ((i=1; i<=max_attempts; i++)); do
    response=$(curl -s $url)
    if [[ $response == *"$expected_text"* ]]; then
      echo "✅ Content is available at $url"
      return 0
    else
      echo "Attempt $i: Content not ready yet, retrying in $delay seconds..."
      sleep $delay
    fi
  done

  echo "❌ [Strategy: $strategy] Content did not appear at $url after $max_attempts attempts"
  free_port $PORT
  exit 1  # Завершаем скрипт при ошибке
}


# Переходим в папку с фикстурами
run_command "cd $FIXTURES_DIR"

# Функция для тестирования стратегии
test_strategy() {
  local strategy=$1

  echo "Testing strategy: $strategy"

  run_command "rm -rf .nuxt"

  # Освобождаем порт перед запуском серверов
  free_port $PORT

  # Собираем проект
  run_command "STRATEGY=$strategy npm run generate"

  # Запускаем статический сервер в фоновом режиме
  echo "Starting static server on port $PORT..."
  npx serve ".output/public" -p $PORT > /dev/null 2>&1 &
  STATIC_SERVER_PID=$!

  # Ожидаем появления контента на статическом сервере
  wait_for_content "http://$HOST:$PORT" "en" "$strategy"

  # Проверяем статический сервер для всех ссылок стратегии
  for url_text in ${strategy_urls[$strategy]}; do
    # Разделяем URL и ожидаемый текст
    IFS='|' read -r url expected_text <<< "$url_text"
    check_content "$url" "$expected_text" "$strategy"
  done

  # Останавливаем статический сервер
  echo "Stopping static server..."
  kill $STATIC_SERVER_PID

  run_command "rm -rf .nuxt"

  # Собираем проект для SSR
  run_command "STRATEGY=$strategy npm run build"

  # Запускаем SSR сервер в фоновом режиме
  echo "Starting SSR server on port $PORT..."
  PORT=$PORT node ".output/server/index.mjs" > /dev/null 2>&1 &
  SSR_SERVER_PID=$!

  # Ожидаем появления контента на SSR сервере
  wait_for_content "http://$HOST:$PORT" "en" "$strategy"

  # Проверяем SSR сервер для всех ссылок стратегии
  for url_text in ${strategy_urls[$strategy]}; do
    # Разделяем URL и ожидаемый текст
    IFS='|' read -r url expected_text <<< "$url_text"
    check_content "$url" "$expected_text" "$strategy"
  done

  # Останавливаем SSR сервер
  echo "Stopping SSR server..."
  kill $SSR_SERVER_PID

  echo "✅ Tests passed for strategy: $strategy"
}

# Запускаем тесты для всех стратегий
for strategy in "${!strategy_urls[@]}"; do
  test_strategy "$strategy"
done

echo "✅ ✅ ✅ All tests passed for all strategies! ✅ ✅ ✅"
