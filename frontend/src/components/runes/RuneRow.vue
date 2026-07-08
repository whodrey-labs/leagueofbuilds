<script setup>
const props = defineProps({
  label: {
    type: String,
    required: true,
  },
  selectedOption: {
    type: Object,
    default: null,
  },
  placeholderTitle: {
    type: String,
    required: true,
  },
  placeholderDescription: {
    type: String,
    required: true,
  },
  options: {
    type: Array,
    default: () => [],
  },
  open: {
    type: Boolean,
    default: false,
  },
  variant: {
    type: String,
    default: 'rune',
  },
  isSelected: {
    type: Function,
    default: () => false,
  },
  isDisabled: {
    type: Function,
    default: () => false,
  },
})

const emit = defineEmits(['toggle', 'pick'])

function pick(optionId) {
  emit('pick', optionId)
}

function hasImage(option) {
  return Boolean(option?.iconUrl)
}
</script>

<template>
  <article class="row-card" :class="[variant, { open }]">
    <button class="row-summary" type="button" @click="emit('toggle')">
      <span v-if="hasImage(selectedOption)" class="summary-icon">
        <img :src="selectedOption.iconUrl" :alt="selectedOption.name" />
      </span>
      <span v-else class="summary-icon placeholder">
        <i v-if="selectedOption?.icon" class="mdi" :class="selectedOption.icon"></i>
        <i v-else class="mdi mdi-circle-outline"></i>
      </span>

      <span class="summary-copy">
        <span class="summary-label">{{ label }}</span>
        <strong>{{ selectedOption?.name || placeholderTitle }}</strong>
        <span>{{ selectedOption?.longDescription || selectedOption?.shortDescription || selectedOption?.description || placeholderDescription }}</span>
      </span>

      <i class="mdi summary-toggle" :class="open ? 'mdi-chevron-up' : 'mdi-chevron-down'"></i>
    </button>

    <div v-if="open" class="row-menu">
      <button
        v-for="option in options"
        :key="option.id"
        class="option-button"
        :class="[variant, { selected: isSelected(option.id) }]"
        type="button"
        :disabled="isDisabled(option.id)"
        :title="option.name"
        @click="pick(option.id)"
      >
        <img v-if="hasImage(option)" :src="option.iconUrl" :alt="option.name" />
        <i v-else class="mdi" :class="option.icon"></i>
      </button>
    </div>
  </article>
</template>

<style scoped>
.row-card {
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.04);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.08);
}

.row-card.open {
  background: rgba(255, 255, 255, 0.07);
}

.row-card.keystone {
  background: rgba(120, 226, 255, 0.08);
  box-shadow:
    inset 0 0 0 1px rgba(134, 236, 255, 0.18),
    0 0 18px rgba(113, 226, 255, 0.1);
}

.row-summary {
  width: 100%;
  display: grid;
  grid-template-columns: 42px minmax(0, 1fr) 24px;
  gap: 12px;
  align-items: start;
  padding: 12px;
  border: 0;
  background: transparent;
  color: inherit;
  cursor: pointer;
  text-align: left;
}

.summary-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.14);
  overflow: hidden;
}

.summary-icon img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.summary-icon.placeholder .mdi {
  color: rgba(255, 247, 239, 0.72);
  font-size: 1.1rem;
}

.summary-copy {
  min-width: 0;
  display: grid;
  gap: 4px;
}

.summary-label {
  color: rgba(201, 229, 255, 0.62);
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.summary-copy strong {
  color: #f3fbff;
  font-size: 0.84rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.summary-copy span:last-child {
  color: rgba(240, 248, 255, 0.82);
  font-size: 0.76rem;
  line-height: 1.45;
}

.summary-toggle {
  align-self: center;
  color: rgba(255, 247, 239, 0.7);
  font-size: 1rem;
}

.row-menu {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  padding: 0 12px 12px;
}

.option-button {
  width: 54px;
  height: 54px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.14);
  color: #fff7ef;
  cursor: pointer;
  transition: transform 150ms ease, box-shadow 150ms ease, opacity 150ms ease;
}

.option-button img {
  width: 32px;
  height: 32px;
  filter: grayscale(1) brightness(0.82);
}

.option-button .mdi {
  font-size: 1.22rem;
}

.option-button.keystone {
  width: 64px;
  height: 64px;
}

.option-button.keystone img {
  width: 40px;
  height: 40px;
}

.option-button.shard {
  width: 44px;
  height: 44px;
}

.option-button.selected {
  transform: translateY(-1px);
  background: rgba(255, 215, 166, 0.14);
  box-shadow:
    0 0 0 2px rgba(255, 213, 142, 0.58),
    0 0 24px rgba(255, 179, 96, 0.24);
}

.option-button.selected img {
  filter: none;
}

.option-button:disabled {
  opacity: 0.34;
  cursor: not-allowed;
}

@media (max-width: 1220px) {
  .row-summary {
    grid-template-columns: 42px minmax(0, 1fr) 20px;
  }
}
</style>
