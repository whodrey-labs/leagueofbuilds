<script setup>
import { computed, ref } from 'vue'

import { getRunePathTheme, STAT_SHARD_ROWS } from '../../lib/rune-editor'
import RunePathPicker from './RunePathPicker.vue'
import RuneTree from './RuneTree.vue'
import StatShards from './StatShards.vue'

const props = defineProps({
  runeStyles: {
    type: Array,
    default: () => [],
  },
})

const selectedPrimaryPathId = ref(null)
const selectedSecondaryPathId = ref(null)
const selectedPrimaryRunes = ref([])
const selectedSecondaryRunes = ref([])
const selectedStatShards = ref(Array(STAT_SHARD_ROWS.length).fill(null))
const secondarySelectionOrder = ref([])
const currentPickerMode = ref('primary')
const pickerOpen = ref(true)
const hoveredPathId = ref(null)
const openPrimaryRow = ref(0)
const openSecondaryRow = ref(0)
const openShardRow = ref(-1)

const primaryPath = computed(() =>
  props.runeStyles.find((style) => style.id === selectedPrimaryPathId.value) ?? null,
)
const secondaryPath = computed(() =>
  props.runeStyles.find((style) => style.id === selectedSecondaryPathId.value) ?? null,
)
const availableSecondaryPaths = computed(() =>
  props.runeStyles.filter((style) => style.id !== selectedPrimaryPathId.value),
)
const pickerPaths = computed(() =>
  currentPickerMode.value === 'secondary' ? availableSecondaryPaths.value : props.runeStyles,
)
const showPrimaryPicker = computed(
  () => currentPickerMode.value === 'primary' && (pickerOpen.value || !primaryPath.value),
)
const showSecondaryPicker = computed(
  () =>
    Boolean(primaryPath.value) &&
    currentPickerMode.value === 'secondary' &&
    (pickerOpen.value || !secondaryPath.value),
)
const previewPath = computed(() => {
  if (hoveredPathId.value) {
    return props.runeStyles.find((style) => style.id === hoveredPathId.value) ?? null
  }

  if (showSecondaryPicker.value) {
    return secondaryPath.value ?? availableSecondaryPaths.value[0] ?? primaryPath.value ?? props.runeStyles[0] ?? null
  }

  if (showPrimaryPicker.value) {
    return primaryPath.value ?? props.runeStyles[0] ?? null
  }

  return secondaryPath.value ?? primaryPath.value ?? props.runeStyles[0] ?? null
})
const previewTheme = computed(() => getRunePathTheme(previewPath.value?.id))
const primarySelectionCount = computed(() => selectedPrimaryRunes.value.filter(Boolean).length)
const secondarySelectionCount = computed(() => selectedSecondaryRunes.value.filter(Boolean).length)
const shardSelectionCount = computed(() => selectedStatShards.value.filter(Boolean).length)

function openPicker(mode) {
  if (mode === 'secondary' && !primaryPath.value) {
    currentPickerMode.value = 'primary'
    pickerOpen.value = true
    return
  }

  currentPickerMode.value = mode
  pickerOpen.value = true
}

function selectPath(pathId) {
  if (currentPickerMode.value === 'secondary') {
    selectSecondaryPath(pathId)
    return
  }

  selectPrimaryPath(pathId)
}

function selectPrimaryPath(pathId) {
  const path = props.runeStyles.find((style) => style.id === pathId)
  if (!path) {
    return
  }

  selectedPrimaryPathId.value = pathId
  selectedPrimaryRunes.value = Array.from({ length: path.slots.length }, () => null)
  openPrimaryRow.value = 0

  if (selectedSecondaryPathId.value === pathId) {
    clearSecondaryPath()
  }

  if (!selectedSecondaryPathId.value) {
    currentPickerMode.value = 'secondary'
    pickerOpen.value = true
  } else {
    pickerOpen.value = false
  }
}

function selectSecondaryPath(pathId) {
  if (!primaryPath.value || pathId === selectedPrimaryPathId.value) {
    return
  }

  const path = props.runeStyles.find((style) => style.id === pathId)
  if (!path) {
    return
  }

  selectedSecondaryPathId.value = pathId
  selectedSecondaryRunes.value = Array.from({ length: path.slots.length - 1 }, () => null)
  secondarySelectionOrder.value = []
  openSecondaryRow.value = 0
  pickerOpen.value = false
}

function clearSecondaryPath() {
  selectedSecondaryPathId.value = null
  selectedSecondaryRunes.value = []
  secondarySelectionOrder.value = []
  openSecondaryRow.value = 0
}

function selectPrimaryRune({ rowIndex, runeId }) {
  const nextSelections = [...selectedPrimaryRunes.value]
  nextSelections[rowIndex] = runeId
  selectedPrimaryRunes.value = nextSelections
  openPrimaryRow.value = rowIndex < nextSelections.length - 1 ? rowIndex + 1 : -1
}

function selectSecondaryRune({ rowIndex, runeId }) {
  const nextSelections = [...selectedSecondaryRunes.value]
  let nextOrder = secondarySelectionOrder.value.filter((index) => index !== rowIndex)

  if (nextSelections[rowIndex] == null && nextSelections.filter(Boolean).length >= 2) {
    const oldestRow = nextOrder[0]
    nextSelections[oldestRow] = null
    nextOrder = nextOrder.slice(1)
  }

  nextSelections[rowIndex] = runeId
  nextOrder.push(rowIndex)

  selectedSecondaryRunes.value = nextSelections
  secondarySelectionOrder.value = nextOrder
  openSecondaryRow.value = rowIndex < nextSelections.length - 1 ? rowIndex + 1 : -1
}

function selectShard({ rowIndex, optionId }) {
  const nextSelections = [...selectedStatShards.value]
  nextSelections[rowIndex] = optionId
  selectedStatShards.value = nextSelections
  openShardRow.value = rowIndex < nextSelections.length - 1 ? rowIndex + 1 : -1
}

function primaryPathLabel() {
  return primaryPath.value?.name ?? 'Choose Primary'
}

function secondaryPathLabel() {
  return secondaryPath.value?.name ?? 'Choose Secondary'
}
</script>

<template>
  <section class="editor-shell">
    <header class="editor-top">
      <div class="top-paths">
        <button class="path-trigger" :class="{ active: currentPickerMode === 'primary' }" type="button" @click="openPicker('primary')">
          <span class="path-trigger-label">Primary Path</span>
          <span class="path-trigger-copy">
            <img v-if="primaryPath" :src="primaryPath.iconUrl" :alt="primaryPath.name" />
            <i v-else class="mdi mdi-plus-circle-outline"></i>
            <strong>{{ primaryPathLabel() }}</strong>
          </span>
        </button>

        <button class="path-trigger" :class="{ active: currentPickerMode === 'secondary' }" type="button" @click="openPicker('secondary')">
          <span class="path-trigger-label">Secondary Path</span>
          <span class="path-trigger-copy">
            <img v-if="secondaryPath" :src="secondaryPath.iconUrl" :alt="secondaryPath.name" />
            <i v-else class="mdi mdi-plus-circle-outline"></i>
            <strong>{{ secondaryPathLabel() }}</strong>
          </span>
        </button>
      </div>

      <div class="path-tabs">
        <button
          v-for="path in pickerPaths"
          :key="`tab-${path.id}`"
          class="path-tab"
          :class="{
            selected:
              path.id === selectedPrimaryPathId ||
              path.id === selectedSecondaryPathId,
          }"
          type="button"
          @mouseenter="hoveredPathId = path.id"
          @mouseleave="hoveredPathId = null"
          @click="selectPath(path.id)"
        >
          <img :src="path.iconUrl" :alt="path.name" />
        </button>
      </div>
    </header>

    <div class="editor-grid">
      <RunePathPicker
        v-if="showPrimaryPicker"
        :paths="runeStyles"
        mode="primary"
        :selected-path-id="selectedPrimaryPathId"
        @select="selectPrimaryPath"
        @hover="hoveredPathId = $event"
      />
      <RuneTree
        v-else-if="primaryPath"
        :path="primaryPath"
        mode="primary"
        :selected-runes="selectedPrimaryRunes"
        :open-row="openPrimaryRow"
        @toggle-row="openPrimaryRow = openPrimaryRow === $event ? -1 : $event"
        @pick-rune="selectPrimaryRune"
      />
      <section v-else class="locked-panel">
        <strong>Pick a primary path to begin.</strong>
      </section>

      <RunePathPicker
        v-if="showSecondaryPicker"
        :paths="availableSecondaryPaths"
        mode="secondary"
        :selected-path-id="selectedSecondaryPathId"
        :excluded-path-id="selectedPrimaryPathId"
        @select="selectSecondaryPath"
        @hover="hoveredPathId = $event"
      />
      <RuneTree
        v-else-if="secondaryPath"
        :path="secondaryPath"
        mode="secondary"
        :selected-runes="selectedSecondaryRunes"
        :open-row="openSecondaryRow"
        :secondary-selection-count="secondarySelectionCount"
        @toggle-row="openSecondaryRow = openSecondaryRow === $event ? -1 : $event"
        @pick-rune="selectSecondaryRune"
      />
      <section v-else class="locked-panel">
        <strong>Choose a primary path first, then lock in your secondary tree.</strong>
      </section>

      <aside class="preview-panel" :style="{ '--path-accent': previewTheme.accent, '--path-glow': previewTheme.glow }">
        <img v-if="previewPath" :src="previewPath.iconUrl" :alt="previewPath.name" class="preview-mark" />

        <div class="preview-copy">
          <span class="preview-label">{{ showPrimaryPicker ? 'Primary Picker' : showSecondaryPicker ? 'Secondary Picker' : 'Rune Summary' }}</span>
          <h3>{{ previewPath?.name || 'Rune Page Editor' }}</h3>
          <p>{{ previewPath ? previewTheme.preview : 'Shape a page by choosing a primary path, a secondary path, and a full set of shards.' }}</p>
        </div>

        <div class="preview-stats">
          <div>
            <span>Primary Runes</span>
            <strong>{{ primarySelectionCount }}/4</strong>
          </div>
          <div>
            <span>Secondary Runes</span>
            <strong>{{ secondarySelectionCount }}/2</strong>
          </div>
          <div>
            <span>Stat Shards</span>
            <strong>{{ shardSelectionCount }}/3</strong>
          </div>
        </div>
      </aside>
    </div>

    <StatShards
      :rows="STAT_SHARD_ROWS"
      :selected-shards="selectedStatShards"
      :open-row="openShardRow"
      @toggle-row="openShardRow = openShardRow === $event ? -1 : $event"
      @pick-shard="selectShard"
    />
  </section>
</template>

<style scoped>
.editor-shell {
  display: grid;
  gap: 18px;
}

.editor-top {
  display: grid;
  gap: 14px;
}

.top-paths {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.path-trigger {
  display: grid;
  gap: 8px;
  padding: 14px 16px;
  border: 0;
  border-radius: 20px;
  background: rgba(12, 24, 38, 0.92);
  box-shadow: inset 0 0 0 1px rgba(255, 247, 239, 0.08);
  color: #fff7ef;
  cursor: pointer;
  text-align: left;
}

.path-trigger.active {
  box-shadow:
    inset 0 0 0 1px rgba(255, 235, 201, 0.2),
    0 0 18px rgba(228, 189, 111, 0.12);
}

.path-trigger-label {
  color: rgba(201, 229, 255, 0.62);
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.path-trigger-copy {
  display: flex;
  align-items: center;
  gap: 10px;
}

.path-trigger-copy img,
.path-trigger-copy .mdi {
  width: 30px;
  height: 30px;
}

.path-trigger-copy .mdi {
  font-size: 1.5rem;
  color: rgba(255, 247, 239, 0.66);
}

.path-trigger-copy strong {
  font-size: 0.96rem;
}

.path-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.path-tab {
  width: 48px;
  height: 48px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 999px;
  background: rgba(12, 24, 38, 0.92);
  box-shadow: inset 0 0 0 1px rgba(255, 247, 239, 0.08);
  cursor: pointer;
}

.path-tab.selected {
  box-shadow:
    0 0 0 2px rgba(255, 218, 150, 0.54),
    0 0 18px rgba(230, 186, 99, 0.16);
}

.path-tab img {
  width: 28px;
  height: 28px;
}

.editor-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) 320px;
  gap: 18px;
  align-items: stretch;
}

.locked-panel {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 320px;
  padding: 20px;
  border-radius: 24px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.02)),
    linear-gradient(145deg, rgba(10, 21, 33, 0.96), rgba(28, 40, 58, 0.9));
  box-shadow: inset 0 0 0 1px rgba(255, 247, 239, 0.08);
  color: rgba(240, 248, 255, 0.82);
  text-align: center;
}

.preview-panel {
  position: relative;
  display: grid;
  gap: 18px;
  align-content: space-between;
  min-height: 100%;
  overflow: hidden;
  padding: 22px;
  border-radius: 24px;
  background:
    radial-gradient(circle at top right, var(--path-glow) 0, transparent 48%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.02)),
    linear-gradient(155deg, rgba(12, 22, 36, 0.98), rgba(18, 30, 46, 0.94));
  box-shadow: inset 0 0 0 1px rgba(255, 247, 239, 0.08);
}

.preview-mark {
  position: absolute;
  right: -16px;
  top: 18px;
  width: 180px;
  height: 180px;
  opacity: 0.16;
  filter: drop-shadow(0 0 22px var(--path-glow));
}

.preview-copy {
  position: relative;
  z-index: 1;
}

.preview-label {
  color: var(--path-accent);
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.preview-copy h3,
.preview-copy p {
  margin: 0;
}

.preview-copy h3 {
  margin-top: 10px;
  color: #fff7ef;
  font-size: 1.2rem;
}

.preview-copy p {
  margin-top: 8px;
  color: rgba(240, 248, 255, 0.82);
  font-size: 0.86rem;
  line-height: 1.55;
}

.preview-stats {
  position: relative;
  z-index: 1;
  display: grid;
  gap: 12px;
}

.preview-stats div {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding-top: 10px;
  border-top: 1px solid rgba(255, 247, 239, 0.08);
}

.preview-stats span {
  color: rgba(201, 229, 255, 0.72);
  font-size: 0.8rem;
}

.preview-stats strong {
  color: #fff7ef;
}

@media (max-width: 1220px) {
  .editor-grid {
    grid-template-columns: 1fr;
  }

  .top-paths {
    grid-template-columns: 1fr;
  }
}
</style>
