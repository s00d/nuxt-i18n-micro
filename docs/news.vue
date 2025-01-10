<template>
  <div class="news-card">
    <img
      :src="image"
      alt="News Image"
      class="news-card-image"
    >
    <div class="news-card-content">
      <h3
        v-if="image"
        class="news-card-title"
      >
        <a
          v-if="link"
          :href="link"
          class="news-card-link"
        >{{ title }}</a>
        <span v-else>{{ title }}</span>
      </h3>
      <p class="news-card-date">
        {{ date }}
      </p>

      <p
        v-if="version"
        class="news-card-version"
      >
        Version Introduced: {{ version }}
      </p>

      <p
        v-if="excerpt"
        class="news-card-excerpt"
      >
        {{ excerpt }}
      </p>

      <a
        v-if="link"
        :href="link"
        class="news-card-link"
      >Read more</a>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: String,
  date: String,
  excerpt: {
    type: String,
    default: null, // Default value for version is null
  },
  image: {
    type: String,
    default: null, // Default value for version is null
  },
  link: {
    type: String,
    default: null, // Default value for version is null
  },
  version: {
    type: String,
    default: null, // Default value for version is null
  },
})
</script>

<style scoped>
.news-card {
  display: flex;
  background: #fff;
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  padding: 10px;
  margin: 20px;
  overflow: hidden;
}

.news-card-image {
  border-radius: 8px;
  width: 200px;
  height: 150px;
  object-fit: cover;
}

.news-card-content {
  padding: 16px;
  flex: 1;
}

.news-card-title {
  font-size: 1.2em;
  margin: 0;
}

.news-card-date {
  color: #888;
  font-size: 0.9em;
}

.news-card-version {
  font-size: 0.9em;
  color: #007bff;
}

.news-card-excerpt {
  margin: 10px 0;
  font-size: 1em;
}

.news-card-link {
  color: #007bff;
  text-decoration: none;
}

.news-card-link:hover {
  text-decoration: underline;
}
</style>
