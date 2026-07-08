<script setup>
import RuneRow from './RuneRow.vue'

const props = defineProps({
  path: {
    type: Object,
    required: true,
  },
  mode: {
    type: String,
    required: true,
  },
  selectedRunes: {
    type: Array,
    default: () => [],
  },
  openRow: {
    type: Number,
    default: -1,
  },
  secondarySelectionCount: {
    type: Number,
    default: 0,
  },
  isRuneDisabled: {
    type: Function,
    default: () => false,
  },
})

const emit = defineEmits(['toggle-row', 'pick-rune'])

function rows() {
  return props.mode === 'primary' ? props.path.slots : props.path.slots.slice(1)
}

function selectedRune(rowIndex) {
  const runeId = props.selectedRunes[rowIndex]
  return rows()[rowIndex]?.runes.find((rune) => rune.id === runeId) ?? null
}

function rowLabel(rowIndex) {
  if (props.mode === 'primary') {
    return rowIndex === 0 ? 'Keystone' : `Rune Row ${rowIndex}`
  }

  return `Secondary Row ${rowIndex + 1}`
}

function placeholderTitle(rowIndex) {
  if (props.mode === 'primary') {
    return rowIndex === 0 ? 'Choose a Keystone' : 'Choose a Rune'
  }

  return 'Choose a Secondary Rune'
}

function placeholderDescription(rowIndex) {
  if (props.mode === 'primary') {
    return rowIndex === 0
      ? 'Pick the central effect that defines your main rune path.'
      : 'Open this row to select a supporting rune.'
  }

  return 'Select up to two secondary runes in total. A third choice replaces the oldest pick.'
}

function isSelected(rowIndex, runeId) {
  return props.selectedRunes[rowIndex] === runeId
}

function onPick(rowIndex, runeId) {
  emit('pick-rune', { rowIndex, runeId })
}
</script>

<template>
  <section class="tree-panel" :class="mode">
    <header class="tree-header">
      <span class="tree-path">
        <img :src="path.iconUrl" :alt="path.name" />
        <span>
          <strong>{{ path.name }}</strong>
          <span>{{ mode === 'primary' ? 'Primary path' : `${secondarySelectionCount}/2 selected` }}</span>
        </span>
      </span>
      <p>{{ path.description }}</p>
    </header>

    <div class="row-stack">
      <RuneRow
        v-for="(slot, rowIndex) in rows()"
        :key="`${path.id}-${mode}-${rowIndex}`"
        :label="rowLabel(rowIndex)"
        :selected-option="selectedRune(rowIndex)"
        :placeholder-title="placeholderTitle(rowIndex)"
        :placeholder-description="placeholderDescription(rowIndex)"
        :options="slot.runes"
        :open="openRow === rowIndex"
        :variant="mode === 'primary' && rowIndex === 0 ? 'keystone' : 'rune'"
        :is-selected="(runeId) => isSelected(rowIndex, runeId)"
        :is-disabled="(runeId) => isRuneDisabled(rowIndex, runeId)"
        @toggle="emit('toggle-row', rowIndex)"
        @pick="onPick(rowIndex, $event)"
      />
    </div>
  </section>
</template>

<style scoped>
.tree-panel {
  display: grid;
  gap: 16px;
  min-height: 100%;
  padding: 20px;
  border-radius: 24px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.18), rgba(255, 255, 255, 0.02)),
    linear-gradient(140deg, rgba(14, 28, 43, 0.96), rgba(52, 20, 39, 0.92));
  color: #fff7ef;
  box-shadow: inset 0 0 0 1px rgba(255, 247, 239, 0.08);
}

.tree-panel.secondary {
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.18), rgba(255, 255, 255, 0.02)),
    linear-gradient(140deg, rgba(31, 47, 61, 0.95), rgba(18, 64, 72, 0.92));
}

.tree-header {
  display: grid;
  gap: 10px;
}

.tree-path {
  display: flex;
  align-items: center;
  gap: 14px;
}

.tree-path img {
  width: 44px;
  height: 44px;
}

.tree-path strong,
.tree-path span {
  display: block;
}

.tree-path strong {
  color: #fff7ef;
}

.tree-path span:last-child {
  color: rgba(255, 247, 239, 0.72);
  font-size: 0.84rem;
}

.tree-header p {
  margin: 0;
  color: rgba(255, 247, 239, 0.82);
  font-size: 0.84rem;
  line-height: 1.45;
  max-width: 30ch;
}

.row-stack {
  display: grid;
  gap: 12px;
}
</style>
