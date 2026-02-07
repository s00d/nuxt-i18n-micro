<template>
  <div class="container">
    <h1>Node.js I18n Package Demo</h1>
    <p>This page demonstrates the usage of <code>@i18n-micro/node</code> package in a Node.js environment.</p>

    <div class="controls">
      <div class="control-group">
        <label for="locale">Locale:</label>
        <select
          id="locale"
          v-model="selectedLocale"
          @change="loadData"
        >
          <option value="en">
            English
          </option>
          <option value="de">
            German
          </option>
          <option value="fr">
            French
          </option>
          <option value="ru">
            Russian
          </option>
        </select>
      </div>

      <div class="control-group">
        <label for="route">Route:</label>
        <select
          id="route"
          v-model="selectedRoute"
          @change="loadData"
        >
          <option value="general">
            General
          </option>
          <option value="node-i18n-demo">
            Node I18n Demo
          </option>
          <option value="index">
            Index
          </option>
          <option value="page">
            Page
          </option>
          <option value="contact">
            Contact
          </option>
        </select>
      </div>

      <button @click="loadData">
        Reload
      </button>
    </div>

    <div
      v-if="loading"
      class="loading"
    >
      Loading...
    </div>

    <div
      v-else-if="error"
      class="error"
    >
      Error: {{ error }}
    </div>

    <div
      v-else-if="data"
      class="results"
    >
      <div class="info">
        <p><strong>Current Locale:</strong> {{ data.locale }}</p>
        <p><strong>Current Route:</strong> {{ data.route }}</p>
      </div>

      <div class="translations">
        <h2>Translations</h2>
        <div class="translation-item">
          <strong>Welcome:</strong> {{ data.translations.welcome }}
        </div>
        <div class="translation-item">
          <strong>Greeting:</strong> {{ data.translations.greeting }}
        </div>
        <div class="translation-item">
          <strong>Nested:</strong> {{ data.translations.nested }}
        </div>
        <div class="translation-item">
          <strong>Apples (pluralization):</strong>
          <ul>
            <li>0: {{ data.translations.apples.zero }}</li>
            <li>1: {{ data.translations.apples.one }}</li>
            <li>5: {{ data.translations.apples.many }}</li>
          </ul>
        </div>
        <div class="translation-item">
          <strong>Number formatting:</strong> {{ data.translations.number }}
        </div>
        <div class="translation-item">
          <strong>Date formatting:</strong> {{ data.translations.date }}
        </div>
        <div class="translation-item">
          <strong>Relative time:</strong> {{ data.translations.relativeTime }}
        </div>
        <div class="translation-item">
          <strong>Route-specific:</strong> {{ data.translations.routeSpecific }}
        </div>
      </div>

      <div class="methods">
        <h2>Methods Info</h2>
        <div class="method-item">
          <strong>Has 'welcome' translation:</strong> {{ data.methods.hasTranslation }}
        </div>
        <div class="method-item">
          <strong>Current Route:</strong> {{ data.methods.currentRoute }}
        </div>
        <div class="method-item">
          <strong>Current Locale:</strong> {{ data.methods.currentLocale }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const { $getRouteName, $getLocale } = useI18n()
const selectedLocale = ref($getLocale())
// Get current route name without locale prefix
const currentRouteName = computed(() => $getRouteName() || 'node-i18n-demo')
const selectedRoute = ref(currentRouteName.value)
const data = ref(null)
const loading = ref(false)
const error = ref(null)

async function loadData() {
  loading.value = true
  error.value = null

  try {
    const response = await $fetch('/api/node-i18n-example', {
      query: {
        locale: selectedLocale.value,
        route: selectedRoute.value,
      },
    })
    data.value = response
  } catch (err) {
    error.value = err.message || 'Failed to load data'
    console.error('Error loading i18n data:', err)
  } finally {
    loading.value = false
  }
}

// Watch for locale changes
watch(
  () => $getLocale(),
  (newLocale) => {
    selectedLocale.value = newLocale
    loadData()
  },
)

// Watch for route changes
watch(
  () => $getRouteName(),
  (newRoute) => {
    selectedRoute.value = newRoute || 'node-i18n-demo'
    loadData()
  },
)

// Load data on mount
onMounted(() => {
  loadData()
})
</script>

<style scoped>
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

h1 {
  margin-bottom: 1rem;
}

.controls {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 1rem;
  background: #f5f5f5;
  border-radius: 8px;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.control-group label {
  font-weight: bold;
  font-size: 0.9rem;
}

.control-group select {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

button {
  padding: 0.5rem 1rem;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  align-self: flex-end;
}

button:hover {
  background: #0056b3;
}

.loading {
  text-align: center;
  padding: 2rem;
  font-style: italic;
}

.error {
  padding: 1rem;
  background: #fee;
  color: #c33;
  border-radius: 4px;
  margin-bottom: 1rem;
}

.results {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.info {
  padding: 1rem;
  background: #e7f3ff;
  border-radius: 4px;
}

.info p {
  margin: 0.5rem 0;
}

.translations,
.methods {
  padding: 1rem;
  background: #f9f9f9;
  border-radius: 4px;
}

.translations h2,
.methods h2 {
  margin-top: 0;
  margin-bottom: 1rem;
}

.translation-item,
.method-item {
  margin-bottom: 1rem;
  padding: 0.5rem;
  background: white;
  border-radius: 4px;
}

.translation-item ul {
  margin: 0.5rem 0;
  padding-left: 1.5rem;
}

code {
  background: #f0f0f0;
  padding: 0.2rem 0.4rem;
  border-radius: 3px;
  font-family: monospace;
}
</style>
