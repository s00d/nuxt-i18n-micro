<script setup lang="ts">
/**
 * Props, slots and events of one component, read from the generated reference data.
 *
 * Every component page used to restate this next to its examples, which is exactly what
 * went stale. The examples stay on the page; the table comes from the source.
 */
import { computed } from 'vue'
import { data } from '../../../api/reference.data'

const props = defineProps<{
  /** Component tag, e.g. `i18n-t`. */
  tag: string
  /**
   * Hide the slots table for a component whose slots are explained in prose.
   *
   * Phrased as an opt-out rather than `slots = true`: Vue casts an absent boolean prop to
   * `false`, so a prop that has to default to true can never be left off.
   */
  hideSlots?: boolean
}>()

const component = computed(() => data.components.find((entry) => entry.tag === props.tag))
const showSlots = computed(() => !props.hideSlots && (component.value?.slots.length ?? 0) > 0)
</script>

<template>
  <div v-if="component">
    <table>
      <thead>
        <tr><th>Prop</th><th>Type</th><th>Default</th><th>Description</th></tr>
      </thead>
      <tbody>
        <tr v-for="prop in component.props" :key="prop.name">
          <td>
            <code>{{ prop.name }}</code>
            <strong v-if="prop.required"> *</strong>
          </td>
          <td><code>{{ prop.type }}</code></td>
          <td><code v-if="prop.default">{{ prop.default }}</code><span v-else>—</span></td>
          <td>{{ prop.description }}</td>
        </tr>
      </tbody>
    </table>
    <p v-if="component.props.some((prop) => prop.required)"><small>* required</small></p>

    <template v-if="showSlots">
      <h3>Slots</h3>
      <table>
        <thead>
          <tr><th>Slot</th><th>Bindings</th><th>Description</th></tr>
        </thead>
        <tbody>
          <tr v-for="slot in component.slots" :key="slot.name">
            <td><code>{{ slot.name }}</code></td>
            <td>
              <code v-for="binding in slot.bindings" :key="binding">{{ binding }}</code>
              <span v-if="slot.bindings.length === 0">—</span>
            </td>
            <td>{{ slot.description }}</td>
          </tr>
        </tbody>
      </table>
    </template>

    <template v-if="component.events.length">
      <h3>Events</h3>
      <ul>
        <li v-for="event in component.events" :key="event.name"><code>{{ event.name }}</code> — {{ event.description }}</li>
      </ul>
    </template>
  </div>
  <p v-else><em>No reference data for <code>{{ tag }}</code>. Run <code>pnpm run docs:data</code>.</em></p>
</template>
