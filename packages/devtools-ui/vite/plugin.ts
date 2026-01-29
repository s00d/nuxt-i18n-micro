import type { PluginOption, ViteDevServer, IndexHtmlTransformResult } from 'vite'
import type { IncomingMessage, ServerResponse } from 'node:http'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { readdir } from 'node:fs/promises'

export interface DevToolsPluginOptions {
  base?: string
  translationDir?: string
  injectButton?: boolean
}

// Вспомогательная функция для безопасного резолва пути
function safeResolvePath(projectRoot: string, filePath: string): string {
  const normalizedFile = filePath.replace(/^\/+/, '').replace(/\/+/g, '/')
  const resolvedPath = path.resolve(projectRoot, normalizedFile)
  const normalizedRoot = path.resolve(projectRoot)
  const normalizedFilePath = path.resolve(resolvedPath)

  if (!normalizedFilePath.startsWith(normalizedRoot)) {
    throw new Error(`Access denied: Path ${resolvedPath} is outside project root`)
  }

  return resolvedPath
}

// Рекурсивное сканирование директории для поиска JSON файлов
async function scanTranslationFiles(dir: string, baseDir: string): Promise<string[]> {
  const files: string[] = []
  try {
    const entries = await readdir(dir, { withFileTypes: true })
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        const subFiles = await scanTranslationFiles(fullPath, baseDir)
        files.push(...subFiles)
      }
      else if (entry.isFile() && entry.name.endsWith('.json')) {
        const relativePath = path.relative(baseDir, fullPath)
        files.push(relativePath.replace(/\\/g, '/')) // Нормализуем для кроссплатформенности
      }
    }
  }
  catch (error) {
    // Игнорируем ошибки доступа к директориям
    console.warn(`[i18n-devtools] Cannot scan directory ${dir}:`, error)
  }
  return files
}

// Скрипт для инжекции кнопки
const BUTTON_INJECTION_SCRIPT = `
(function() {
  if (typeof window === 'undefined' || document.getElementById('i18n-devtools-button-container')) {
    return;
  }

  const container = document.createElement('div');
  container.id = 'i18n-devtools-button-container';
  container.style.cssText = 'position: fixed; bottom: 20px; right: 20px; z-index: 99999; pointer-events: none;';
  document.body.appendChild(container);

  const button = document.createElement('button');
  button.id = 'i18n-devtools-button';
  button.type = 'button';
  button.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" style="display: inline-block; vertical-align: middle; margin-right: 8px;"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>i18n';
  button.style.cssText = 'cursor: pointer; background: #1e1e1e; color: white; padding: 8px 16px; border-radius: 9999px; display: flex; align-items: center; gap: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); border: 1px solid #333; font-size: 14px; font-weight: 600; transition: all 0.3s ease; opacity: 0.3; pointer-events: auto; font-family: system-ui, sans-serif;';

  let hideTimeout = null;
  let isVisible = true;
  let lastMouseY = window.innerHeight;

  function showButton() {
    if (!isVisible) {
      button.style.transform = 'translateX(0)';
      button.style.opacity = '0.3';
      isVisible = true;
    }
    if (hideTimeout) {
      clearTimeout(hideTimeout);
      hideTimeout = null;
    }
  }

  function hideButton() {
    if (isVisible) {
      // Оставляем видимой только небольшую часть кнопки (примерно 40px)
      button.style.transform = 'translateX(calc(100% - 40px))';
      button.style.opacity = '0.3';
      isVisible = false;
    }
  }

  function checkMouseDistance(e) {
    const buttonRect = button.getBoundingClientRect();
    const buttonCenterX = buttonRect.left + buttonRect.width / 2;
    const buttonCenterY = buttonRect.top + buttonRect.height / 2;
    const distanceX = Math.abs(e.clientX - buttonCenterX);
    const distanceY = Math.abs(e.clientY - buttonCenterY);
    const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

    if (distance > 200 && !button.matches(':hover')) {
      if (!hideTimeout) {
        hideTimeout = setTimeout(hideButton, 1000);
      }
    } else {
      if (hideTimeout) {
        clearTimeout(hideTimeout);
        hideTimeout = null;
      }
      if (!isVisible) {
        showButton();
      }
    }
    lastMouseY = e.clientY;
  }

  button.addEventListener('mouseenter', function() {
    this.style.opacity = '1';
    this.style.transform = 'translateX(0) translateY(-2px) scale(1.05)';
    if (hideTimeout) {
      clearTimeout(hideTimeout);
      hideTimeout = null;
    }
    // Показываем кнопку полностью при наведении
    if (!isVisible) {
      showButton();
    }
  });

  button.addEventListener('mouseleave', function() {
    if (isVisible) {
      this.style.opacity = '0.3';
      this.style.transform = 'translateX(0) scale(1)';
      hideTimeout = setTimeout(hideButton, 3000);
    }
  });

  button.addEventListener('click', function() {
    // Проверяем, не открыт ли уже редактор
    if (document.getElementById('i18n-devtools-modal')) {
      return;
    }

    // Открываем модальное окно с iframe
    const modal = document.createElement('div');
    modal.id = 'i18n-devtools-modal';
    modal.style.cssText = 'position: fixed; inset: 0; z-index: 999999; background: rgba(0, 0, 0, 0.2); backdrop-filter: blur(2px); display: flex; align-items: center; justify-content: center; padding: 2rem;';
    modal.addEventListener('click', function(e) {
      if (e.target === modal) {
        document.body.removeChild(modal);
      }
    });

    const content = document.createElement('div');
    content.style.cssText = 'background: white; width: 90vw; max-width: 1200px; height: 85vh; border-radius: 12px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); display: flex; flex-direction: column; overflow: hidden; border: 1px solid #e5e7eb;';
    content.addEventListener('click', function(e) {
      e.stopPropagation();
    });

    const header = document.createElement('div');
    header.style.cssText = 'display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; border-bottom: 1px solid #e2e8f0; background: #f8fafc; flex-shrink: 0;';
    header.innerHTML = '<div style="font-weight: 600; color: #334155; display: flex; align-items: center; gap: 8px;"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg> i18n DevTools</div><button id="i18n-devtools-close" style="background: transparent; border: none; cursor: pointer; padding: 4px; border-radius: 4px; display: flex; color: #64748b; transition: background 0.2s;">✕</button>';

    const closeBtn = header.querySelector('#i18n-devtools-close');
    closeBtn.addEventListener('mouseenter', function() {
      this.style.background = '#e2e8f0';
    });
    closeBtn.addEventListener('mouseleave', function() {
      this.style.background = 'transparent';
    });
    closeBtn.addEventListener('click', function() {
      document.body.removeChild(modal);
    });

    const iframeContainer = document.createElement('div');
    iframeContainer.style.cssText = 'flex: 1; position: relative; overflow: hidden; background: white;';

    const iframe = document.createElement('iframe');
    iframe.id = 'i18n-devtools-iframe';
    iframe.style.cssText = 'width: 100%; height: 100%; border: none; background: white;';
    iframe.src = '/__i18n_devtools.html';
    iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms allow-popups');

    iframeContainer.appendChild(iframe);
    content.appendChild(header);
    content.appendChild(iframeContainer);
    modal.appendChild(content);
    document.body.appendChild(modal);
  });

  document.addEventListener('mousemove', checkMouseDistance);

  // Автоматически скрываем через 3 секунды после загрузки
  setTimeout(() => {
    if (!button.matches(':hover')) {
      hideTimeout = setTimeout(hideButton, 3000);
    }
  }, 3000);

  container.appendChild(button);
})();
`

export function i18nDevToolsPlugin(options: DevToolsPluginOptions = {}): PluginOption {
  const apiBase = options.base || '/__i18n_api'
  const translationDir = options.translationDir || 'src/locales'
  const injectButton = options.injectButton !== false // По умолчанию true

  return {
    name: 'i18n-micro-devtools-plugin',
    apply: 'serve', // Работает только в dev server

    resolveId(id: string) {
      if (id === '/@vite-plugin-i18n-devtools/devtools-ui.js') {
        return id
      }
      return null
    },

    load(id: string) {
      if (id === '/@vite-plugin-i18n-devtools/devtools-ui.js') {
        // Возвращаем реэкспорт из devtools-ui пакета
        return `export * from '@i18n-micro/devtools-ui'`
      }
      return null
    },

    transformIndexHtml(html: string): IndexHtmlTransformResult {
      if (!injectButton) {
        return html
      }

      // Инжектируем скрипт перед закрывающим тегом </body>
      const scriptTag = `<script>${BUTTON_INJECTION_SCRIPT}</script>`
      if (html.includes('</body>')) {
        return html.replace('</body>', `${scriptTag}</body>`)
      }
      // Если нет </body>, добавляем в конец
      return html + scriptTag
    },

    configureServer(server: ViteDevServer) {
      // Используем server.config.root как источник правды для корня проекта
      const projectRoot = server.config.root

      // HTML страница для iframe с devtools UI
      // Используем виртуальный модуль для правильного импорта
      const devtoolsHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>i18n DevTools</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: system-ui, -apple-system, sans-serif;
      overflow: hidden;
      height: 100vh;
    }
    #app {
      width: 100%;
      height: 100%;
    }
    .loading {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: #64748b;
    }
  </style>
</head>
<body>
  <div id="app">
    <div class="loading">Loading DevTools...</div>
  </div>
  <script type="module">
    // Импортируем devtools UI
    // Пытаемся импортировать через разные пути для совместимости
    let register;
    try {
      const devtoolsModule = await import('/@vite-plugin-i18n-devtools/devtools-ui.js');
      register = devtoolsModule.register;
    } catch (e) {
      // Fallback: пытаемся импортировать напрямую
      try {
        const devtoolsModule = await import('@i18n-micro/devtools-ui');
        register = devtoolsModule.register;
      } catch (e2) {
        console.error('Failed to load devtools UI:', e2);
        document.getElementById('app').innerHTML = '<div class="loading" style="color: #ef4444;">Failed to load DevTools. Please ensure @i18n-micro/devtools-ui is installed.</div>';
        throw e2;
      }
    }

    // Регистрируем custom element
    register();

    // Создаем bridge через API
    const bridge = {
      async getLocalesAndTranslations() {
        try {
          const response = await fetch('/__i18n_api/files');
          const data = await response.json();
          const result = {};
          for (const file of data.files || []) {
            try {
              const fileResponse = await fetch('/__i18n_api/file?path=' + encodeURIComponent(file));
              const fileData = await fileResponse.json();
              if (fileData.success && fileData.content) {
                result[file] = fileData.content;
              }
            } catch (e) {
              console.warn('Failed to load file:', file, e);
            }
          }
          return result;
        } catch (e) {
          console.error('Failed to get locales:', e);
          return {};
        }
      },

      async getConfigs() {
        try {
          const response = await fetch('/__i18n_api/config');
          return await response.json();
        } catch (e) {
          return {
            defaultLocale: 'en',
            fallbackLocale: 'en',
            locales: [],
            translationDir: '${translationDir}',
          };
        }
      },

      async saveTranslation(filePath, content) {
        const response = await fetch('/__i18n_api/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ file: filePath, content }),
        });
        if (!response.ok) {
          const error = await response.json().catch(() => ({ error: 'Unknown error' }));
          throw new Error(error.error || 'Failed to save');
        }
      },

      onLocalesUpdate(callback) {
        let interval = null;
        interval = setInterval(async () => {
          try {
            const data = await bridge.getLocalesAndTranslations();
            callback(data);
          } catch (e) {
            console.error('Failed to update locales:', e);
          }
        }, 2000);
        return () => {
          if (interval) {
            clearInterval(interval);
          }
        };
      },
    };

    const app = document.getElementById('app');
    app.innerHTML = '';
    const element = document.createElement('i18n-devtools-ui');
    element.bridge = bridge;
    element.style.cssText = 'width: 100%; height: 100%; display: block;';
    app.appendChild(element);
  </script>
</body>
</html>`

      // Middleware для обслуживания HTML страницы devtools
      server.middlewares.use('/__i18n_devtools.html', (_req: IncomingMessage, res: ServerResponse) => {
        res.statusCode = 200
        res.setHeader('Content-Type', 'text/html; charset=utf-8')
        res.end(devtoolsHtml)
      })

      // Эндпоинт для получения конфигурации
      server.middlewares.use(`${apiBase}/config`, async (_req: IncomingMessage, res: ServerResponse, next) => {
        if (_req.method !== 'GET') {
          return next()
        }

        try {
          res.statusCode = 200
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({
            defaultLocale: 'en',
            fallbackLocale: 'en',
            locales: [],
            translationDir,
          }))
        }
        catch (e) {
          console.error('[i18n-devtools] Config error:', e)
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({
            success: false,
            error: e instanceof Error ? e.message : String(e),
          }))
        }
      })

      // Эндпоинт для получения списка файлов
      server.middlewares.use(`${apiBase}/files`, async (req: IncomingMessage, res: ServerResponse, next) => {
        if (req.method !== 'GET') {
          return next()
        }

        try {
          const localesPath = path.resolve(projectRoot, translationDir)

          // Проверяем, что путь безопасен
          safeResolvePath(projectRoot, translationDir)

          if (!fs.existsSync(localesPath)) {
            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ files: [], structure: {} }))
            return
          }

          const files = await scanTranslationFiles(localesPath, localesPath)

          // Строим структуру директорий
          const structure: Record<string, unknown> = {}
          for (const file of files) {
            const parts = file.split('/')
            let current = structure
            for (let i = 0; i < parts.length - 1; i++) {
              const part = parts[i]!
              if (!current[part]) {
                current[part] = {}
              }
              current = current[part] as Record<string, unknown>
            }
            const last = parts[parts.length - 1]
            if (last !== undefined) {
              current[last] = file
            }
          }

          res.statusCode = 200
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ files, structure }))
        }
        catch (e) {
          console.error('[i18n-devtools] Files list error:', e)
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({
            success: false,
            error: e instanceof Error ? e.message : String(e),
          }))
        }
      })

      // Эндпоинт для загрузки конкретного файла
      server.middlewares.use(`${apiBase}/file`, async (req: IncomingMessage, res: ServerResponse, next) => {
        if (req.method !== 'GET') {
          return next()
        }

        try {
          const url = new URL(req.url || '', `http://${req.headers.host}`)
          const filePath = url.searchParams.get('path')

          if (!filePath) {
            throw new Error('Path parameter is required')
          }

          // Резолвим путь относительно translationDir
          const fullPath = path.join(translationDir, filePath)
          const resolvedPath = safeResolvePath(projectRoot, fullPath)

          if (!fs.existsSync(resolvedPath)) {
            res.statusCode = 404
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ success: false, error: 'File not found' }))
            return
          }

          if (!resolvedPath.endsWith('.json')) {
            throw new Error('Invalid file: only .json files are allowed')
          }

          const content = fs.readFileSync(resolvedPath, 'utf-8')
          const parsed = JSON.parse(content)

          res.statusCode = 200
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ success: true, content: parsed, path: filePath }))
        }
        catch (e) {
          console.error('[i18n-devtools] File read error:', e)
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({
            success: false,
            error: e instanceof Error ? e.message : String(e),
          }))
        }
      })

      // Эндпоинт для сохранения файла
      server.middlewares.use(`${apiBase}/save`, async (req: IncomingMessage, res: ServerResponse, next) => {
        if (req.method !== 'POST') {
          return next()
        }

        try {
          // Чтение тела запроса
          const buffers: Buffer[] = []
          for await (const chunk of req) {
            buffers.push(chunk)
          }
          const bodyData = Buffer.concat(buffers).toString()

          if (!bodyData) {
            throw new Error('Empty request body')
          }

          const body = JSON.parse(bodyData)
          const { file, content } = body

          if (!file || !content) {
            throw new Error('Invalid data: file and content are required')
          }

          // Резолвим путь относительно translationDir, если путь не абсолютный
          const fullPath = file.startsWith(translationDir) ? file : path.join(translationDir, file)
          const filePath = safeResolvePath(projectRoot, fullPath)

          // Проверка расширения
          if (!filePath.endsWith('.json')) {
            throw new Error('Invalid file: only .json files are allowed')
          }

          // Создаем директорию, если её нет
          const dir = path.dirname(filePath)
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true })
          }

          // Записываем файл
          fs.writeFileSync(filePath, JSON.stringify(content, null, 2), 'utf-8')

          // Успешный ответ
          res.statusCode = 200
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ success: true }))
        }
        catch (e) {
          console.error('[i18n-devtools] Save error:', e)
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({
            success: false,
            error: e instanceof Error ? e.message : String(e),
          }))
        }
      })
    },
  } as PluginOption
}
