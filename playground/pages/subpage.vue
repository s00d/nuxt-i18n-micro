<template>
  <div>
    <p>{{ $t('key2.key2.key2.key2.key2') }}</p>
    <p>Current Locale: {{ $getLocale() }}</p>

    <!-- Welcome and general information -->
    <div>
      {{ $t('welcome', { username: 'Alice', unreadCount: 5 }) }}
    </div>
    <div>
      {{ $tc('apples', 10) }}
    </div>

    <!-- Complex structure with nested sections -->
    <section>
      <header>
        <h1>{{ $t('mainHeader') }}</h1>
        <nav>
          <ul>
            <li><a href="#">{{ $t('nav.home') }}</a></li>
            <li><a href="#">{{ $t('nav.about') }}</a></li>
            <li><a href="#">{{ $t('nav.services') }}</a></li>
            <li><a href="#">{{ $t('nav.contact') }}</a></li>
          </ul>
        </nav>
      </header>

      <article>
        <section>
          <h2>{{ $t('section1.header') }}</h2>
          <p>{{ $t('section1.intro') }}</p>

          <div>
            <h3>{{ $t('section1.subsection1.header') }}</h3>
            <p>{{ $t('section1.subsection1.content') }}</p>
          </div>

          <div>
            <h3>{{ $t('section1.subsection2.header') }}</h3>
            <ul>
              <li>{{ $t('section1.subsection2.item1') }}</li>
              <li>{{ $t('section1.subsection2.item2') }}</li>
              <li>{{ $t('section1.subsection2.item3') }}</li>
            </ul>
          </div>
        </section>

        <section>
          <h2>{{ $t('section2.header') }}</h2>
          <p>{{ $t('section2.intro') }}</p>

          <div>
            <h3>{{ $t('section2.subsection1.header') }}</h3>
            <p>{{ $t('section2.subsection1.content') }}</p>
          </div>

          <div>
            <h3>{{ $t('section2.subsection2.header') }}</h3>
            <ol>
              <li>{{ $t('section2.subsection2.step1') }}</li>
              <li>{{ $t('section2.subsection2.step2') }}</li>
              <li>{{ $t('section2.subsection2.step3') }}</li>
            </ol>
          </div>

          <div>
            <h3>{{ $t('section2.subsection3.header') }}</h3>
            <blockquote>{{ $t('section2.subsection3.quote') }}</blockquote>
          </div>
        </section>

        <section>
          <h2>{{ $t('section3.header') }}</h2>
          <p>{{ $t('section3.intro') }}</p>

          <div>
            <h3>{{ $t('section3.subsection1.header') }}</h3>
            <p>{{ $t('section3.subsection1.content') }}</p>
          </div>

          <div>
            <h3>{{ $t('section3.subsection2.header') }}</h3>
            <p>{{ $t('section3.subsection2.content') }}</p>
          </div>

          <div>
            <h3>{{ $t('section3.subsection3.header') }}</h3>
            <ul>
              <li>{{ $t('section3.subsection3.item1') }}</li>
              <li>{{ $t('section3.subsection3.item2') }}</li>
              <li>{{ $t('section3.subsection3.item3') }}</li>
              <li>{{ $t('section3.subsection3.item4') }}</li>
            </ul>
          </div>
        </section>
      </article>

      <div v-html="$t('content.html1')" />
      <div v-html="$t('content.html2')" />

      <!-- Footer with nested lists -->
      <footer>
        <div>
          <h4>{{ $t('footer.contact.header') }}</h4>
          <address>
            {{ $t('footer.contact.address') }}<br>
            {{ $t('footer.contact.city') }}<br>
            {{ $t('footer.contact.phone') }}
          </address>
        </div>

        <div>
          <h4>{{ $t('footer.links.header') }}</h4>
          <ul>
            <li><a href="#">{{ $t('footer.links.privacy') }}</a></li>
            <li><a href="#">{{ $t('footer.links.terms') }}</a></li>
            <li><a href="#">{{ $t('footer.links.faq') }}</a></li>
          </ul>
        </div>
      </footer>
    </section>

    <!-- Links to switch locales -->
    <div>
      <button
        v-for="locale in $getLocales()"
        :key="locale"
        :disabled="locale === $getLocale()"
        @click="$switchLocale(locale.code)"
      >
        Switch to {{ locale.code }}
      </button>
    </div>

    <div>
      <NuxtLink :to="$localeRoute({ name: 'index' })">
        Go to Index
      </NuxtLink>
      |
      <NuxtLink :to="$localeRoute({ name: 'page' })">
        Go to page
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
import { useNuxtApp } from '#imports'

const { $getLocale, $switchLocale, $getLocales, $localeRoute, $t, $tc } = useNuxtApp()
</script>
