<script setup>
const props = defineProps({
  paths: {
    type: Array,
    default: () => [],
  },
  mode: {
    type: String,
    required: true,
  },
  selectedPathId: {
    type: Number,
    default: null,
  },
  excludedPathId: {
    type: Number,
    default: null,
  },
})

const emit = defineEmits(['select', 'hover'])

const title = props.mode === 'primary' ? 'Choose Your Primary Path' : 'Choose Your Secondary Path'
const subtitle = props.mode === 'primary'
  ? 'Start by locking the main identity of the page.'
  : 'Pick a supporting tree. It cannot match the primary path.'

function onSelect(pathId) {
  emit('select', pathId)
}

function onHover(pathId) {
  emit('hover', pathId)
}
</script>

<template>
  <section class="picker-panel">
    <header class="picker-header">
      <h3>{{ title }}</h3>
      <p>{{ subtitle }}</p>
    </header>

    <div class="picker-grid">
      <button
        v-for="path in paths"
        :key="path.id"
        class="path-card"
        :class="{
          selected: path.id === selectedPathId,
          blocked: path.id === excludedPathId,
        }"
        type="button"
        :disabled="path.id === excludedPathId"
        @mouseenter="onHover(path.id)"
        @mouseleave="onHover(null)"
        @click="onSelect(path.id)"
      >
        <span class="path-card-icon">
          <img :src="path.iconUrl" :alt="path.name" />
        </span>

        <span class="path-card-copy">
          <strong>{{ path.name }}</strong>
          <span>{{ path.description }}</span>
        </span>
      </button>
    </div>
  </section>
</template>

<style scoped>
.picker-panel {
  display: grid;
  gap: 18px;
  padding: 20px;
  min-height: 100%;
  border-radius: 24px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.02)),
    linear-gradient(145deg, rgba(10, 21, 33, 0.96), rgba(28, 40, 58, 0.9));
  box-shadow: inset 0 0 0 1px rgba(255, 247, 239, 0.08);
}

.picker-header h3,
.picker-header p {
  margin: 0;
}

.picker-header h3 {
  color: #fff7ef;
  font-size: 1.08rem;
}

.picker-header p {
  margin-top: 6px;
  color: rgba(240, 248, 255, 0.78);
  font-size: 0.88rem;
}

.picker-grid {
  display: grid;
  gap: 12px;
}

.path-card {
  display: grid;
  grid-template-columns: 60px minmax(0, 1fr);
  gap: 14px;
  align-items: center;
  padding: 14px;
  border: 0;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.05);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.08);
  color: #fff7ef;
  cursor: pointer;
  text-align: left;
  transition: transform 150ms ease, box-shadow 150ms ease, background 150ms ease, opacity 150ms ease;
}

.path-card:hover {
  transform: translateY(-1px);
  background: rgba(255, 255, 255, 0.08);
}

.path-card.selected {
  background: rgba(209, 166, 89, 0.14);
  box-shadow:
    inset 0 0 0 1px rgba(249, 221, 161, 0.26),
    0 0 18px rgba(236, 189, 102, 0.14);
}

.path-card.blocked {
  opacity: 0.34;
  cursor: not-allowed;
}

.path-card-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.12);
}

.path-card-icon img {
  width: 34px;
  height: 34px;
  object-fit: contain;
}

.path-card-copy {
  display: grid;
  gap: 4px;
}

.path-card-copy strong {
  color: #fffaf4;
  font-size: 0.92rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.path-card-copy span {
  color: rgba(240, 248, 255, 0.78);
  font-size: 0.8rem;
  line-height: 1.45;
}
</style>
