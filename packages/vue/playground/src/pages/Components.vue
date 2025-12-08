<template>
  <div>
    <h1>{{ t('components.title') }}</h1>
    <p>{{ t('components.description') }}</p>

    <section>
      <h2>I18nT Component</h2>
      <I18nT keypath="welcome" />
      <br>
      <I18nT
        keypath="greeting"
        :params="{ name: 'Vue' }"
      />
      <br>
      <I18nT
        keypath="apples"
        :plural="0"
      />
      <br>
      <I18nT
        keypath="apples"
        :plural="1"
      />
      <br>
      <I18nT
        keypath="apples"
        :plural="5"
      />
      <br>
      <I18nT
        keypath="number"
        :number="1234.56"
      />
      <br>
      <I18nT
        keypath="date"
        :date="new Date()"
      />
      <br>
      <I18nT
        keypath="relativeDate"
        :relative-date="oneHourAgo"
      />
    </section>

    <section>
      <h2>I18nLink Component</h2>
      <I18nLink to="/">
        Home Link
      </I18nLink>
      <br>
      <I18nLink to="/about">
        About Link
      </I18nLink>
      <br>
      <I18nLink
        to="/components"
        :active-style="{ color: 'red' }"
      >
        Components Link (Active Style)
      </I18nLink>
    </section>

    <section>
      <h2>I18nGroup Component</h2>
      <I18nGroup prefix="home">
        <template #default="{ t: groupT }">
          <p>{{ groupT('title') }}</p>
          <p>{{ groupT('description') }}</p>
        </template>
      </I18nGroup>
    </section>

    <section>
      <h2>I18nSwitcher Component</h2>
      <I18nSwitcher />
    </section>

    <section>
      <h2>Formatting Examples</h2>
      <p>Number: {{ tn(1234.56) }}</p>
      <p>Date: {{ td(new Date()) }}</p>
      <p>Relative Time: {{ tdr(oneHourAgo) }}</p>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { I18nT, I18nLink, I18nGroup, I18nSwitcher, useI18n } from '@i18n-micro/vue'

const { t, tn, td, tdr } = useI18n()

const oneHourAgo = computed(() => new Date(Date.now() - 3600000))
</script>

<style scoped>
section {
  margin: 30px 0;
  padding: 20px;
  background-color: white;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

h2 {
  margin-top: 0;
  color: #42b983;
}
</style>
