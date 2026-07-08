<script setup>
import RuneRow from './RuneRow.vue'

defineProps({
  rows: {
    type: Array,
    default: () => [],
  },
  selectedShards: {
    type: Array,
    default: () => [],
  },
  openRow: {
    type: Number,
    default: -1,
  },
})

const emit = defineEmits(['toggle-row', 'pick-shard'])

function selectedOption(row, rowIndex, selectedShards) {
  return row.options.find((option) => option.id === selectedShards[rowIndex]) ?? null
}
</script>

<template>
  <section class="shards-panel">
    <header class="shards-header">
      <h3>Stat Shards</h3>
      <p>Round out the page with three minor bonuses.</p>
    </header>

    <div class="shards-grid">
      <RuneRow
        v-for="(row, rowIndex) in rows"
        :key="row.key"
        :label="row.name"
        :selected-option="selectedOption(row, rowIndex, selectedShards)"
        :placeholder-title="`Choose ${row.name}`"
        :placeholder-description="row.description"
        :options="row.options"
        :open="openRow === rowIndex"
        variant="shard"
        :is-selected="(optionId) => selectedShards[rowIndex] === optionId"
        @toggle="emit('toggle-row', rowIndex)"
        @pick="emit('pick-shard', { rowIndex, optionId: $event })"
      />
    </div>
  </section>
</template>

<style scoped>
.shards-panel {
  display: grid;
  gap: 16px;
  padding: 20px;
  border-radius: 24px;
  background: rgba(10, 21, 33, 0.88);
  box-shadow: inset 0 0 0 1px rgba(255, 247, 239, 0.08);
}

.shards-header h3,
.shards-header p {
  margin: 0;
}

.shards-header h3 {
  color: #fff7ef;
  font-size: 1.04rem;
}

.shards-header p {
  margin-top: 6px;
  color: rgba(240, 248, 255, 0.76);
  font-size: 0.86rem;
}

.shards-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

@media (max-width: 1220px) {
  .shards-grid {
    grid-template-columns: 1fr;
  }
}
</style>
