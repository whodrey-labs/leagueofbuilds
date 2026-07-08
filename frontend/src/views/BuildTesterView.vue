<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import RunePageEditor from '../components/runes/RunePageEditor.vue'

import {
  calculateBuildStats,
  detectChampionScaling,
  describeChampionAbilities,
  fetchChampionDetail,
  fetchLatestGameData,
  STAT_FILTERS,
} from '../lib/lol'

const loading = ref(true)
const errorMessage = ref('')
const version = ref('')
const champions = ref([])
const items = ref([])
const runeStyles = ref([])
const championId = ref('')
const championDetail = ref(null)
const championLevel = ref(1)
const selectedItems = ref([])
const itemSearch = ref('')
const activeFilters = ref([])
const scalingSignals = ref({})
const championCache = new Map()
const championPanelHeight = ref(null)
const browserPanelHeight = ref(null)
const browserPanel = ref(null)
const statPanel = ref(null)
const browserTooltip = ref(null)
let statPanelObserver = null

const selectedChampion = computed(
  () => champions.value.find((champion) => champion.id === championId.value) ?? null,
)
const visibleItems = computed(() => {
  const searchNeedle = itemSearch.value.trim().toLowerCase()

  return items.value.filter((item) => {
    const searchMatch =
      !searchNeedle ||
      `${item.name} ${item.cleanDescription} ${(item.tags ?? []).join(' ')}`
        .toLowerCase()
        .includes(searchNeedle)
    const filterMatch = activeFilters.value.every((filterKey) => item.filterStats.includes(filterKey))

    return searchMatch && filterMatch
  })
})
const buildStats = computed(() =>
  selectedChampion.value ? calculateBuildStats(selectedChampion.value, selectedItems.value, championLevel.value) : [],
)
const championAbilities = computed(() =>
  championDetail.value ? describeChampionAbilities(championDetail.value, version.value) : [],
)
const displayedStats = computed(() =>
  buildStats.value.filter((stat) => !stat.extraOnly || stat.bonus > 0),
)

onMounted(loadGameData)

onBeforeUnmount(() => {
  statPanelObserver?.disconnect()
})

watch(championId, async (nextChampionId) => {
  if (!nextChampionId) {
    championDetail.value = null
    scalingSignals.value = {}
    return
  }

  try {
    championDetail.value = null
    scalingSignals.value = {}
    const cachedDetail = championCache.get(nextChampionId)
    const detail = cachedDetail ?? (await fetchChampionDetail(version.value, nextChampionId))
    championCache.set(nextChampionId, detail)
    championDetail.value = detail
    scalingSignals.value = detectChampionScaling(detail)
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Failed to load champion details.'
  }
})

watch(
  loading,
  async (isLoading) => {
    if (!isLoading) {
      await attachChampionPanelHeightSync()
    }
  },
  { immediate: true },
)

async function loadGameData() {
  try {
    loading.value = true
    errorMessage.value = ''

    const gameData = await fetchLatestGameData()
    version.value = gameData.version
    champions.value = gameData.champions
    items.value = gameData.items
    runeStyles.value = gameData.runeStyles
    championId.value = gameData.champions[0]?.id ?? ''
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : 'Failed to load Riot static data.'
  } finally {
    loading.value = false
  }
}

async function attachChampionPanelHeightSync() {
  await nextTick()

  statPanelObserver?.disconnect()
  statPanelObserver = null

  if (!statPanel.value) {
    championPanelHeight.value = null
    browserPanelHeight.value = null
    return
  }

  statPanelObserver = new ResizeObserver(() => {
    syncChampionPanelHeight()
  })

  statPanelObserver.observe(statPanel.value)
  syncChampionPanelHeight()
}

function syncChampionPanelHeight() {
  const nextHeight = statPanel.value?.offsetHeight ? `${statPanel.value.offsetHeight}px` : null
  championPanelHeight.value = nextHeight
  browserPanelHeight.value = nextHeight
}

function addItem(item) {
  if (!canAddItem(item)) {
    return
  }

  selectedItems.value = [...selectedItems.value, item]
}

function removeItem(index) {
  selectedItems.value = selectedItems.value.filter((_, currentIndex) => currentIndex !== index)
}

function clearItems() {
  selectedItems.value = []
}

function toggleFilter(filterKey) {
  activeFilters.value = activeFilters.value.includes(filterKey)
    ? activeFilters.value.filter((key) => key !== filterKey)
    : [...activeFilters.value, filterKey]
}

function selectChampion(nextChampionId) {
  championId.value = nextChampionId
}

function formatStat(value, statKey = '') {
  const preservePrecisionStats = new Set(['attackSpeed', 'healthRegen', 'manaRegen'])
  const digits =
    preservePrecisionStats.has(statKey) || (Math.abs(value) > 0 && Math.abs(value) < 1) ? 2 : 0

  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits === 0 ? 0 : 2,
  }).format(value)
}

function scalingLabel(statKey, isExtraOnly) {
  if (isExtraOnly) {
    return '•'
  }

  return scalingSignals.value[statKey] ? 'mdi-chevron-double-up' : ''
}

function abilityCardStyle(ability) {
  if (!ability.imageUrl) {
    return null
  }

  return {
    backgroundImage: `linear-gradient(180deg, rgba(11, 22, 35, 0.08) 0%, rgba(11, 22, 35, 0.72) 100%), url("${ability.imageUrl}")`,
  }
}

function formatAbilityScalingText(scalesWith) {
  if (!scalesWith.length) {
    return ''
  }

  return uniqueAbilityPillScalings(scalesWith)
    .map((scaling) => formatAbilityPillLabel(scaling.label))
    .join('\n')
}

function uniqueAbilityPillScalings(scalesWith) {
  const seenScalingKeys = new Set()

  return scalesWith.filter((scaling) => {
    const scalingKey = `${scaling.stat}:${scaling.statType}`
    if (seenScalingKeys.has(scalingKey)) {
      return false
    }

    seenScalingKeys.add(scalingKey)
    return true
  })
}

function formatAbilityPillLabel(label) {
  const segments = String(label ?? '').trim().split(' ')
  if (segments.length < 2) {
    return String(label ?? '')
  }

  const statLabel = segments.pop()
  const ratioLabel = segments.join(' ')
  const ratioParts = ratioLabel.split('/')

  if (ratioParts.length >= 4) {
    const midpoint = Math.ceil(ratioParts.length / 2)
    const firstLine = ratioParts.slice(0, midpoint).join('/')
    const secondLine = `${ratioParts.slice(midpoint).join('/')} ${statLabel}`
    return `${firstLine}\n${secondLine}`
  }

  return `${ratioParts.join('/\u200b')} ${statLabel}`
}

function showBrowserTooltip(event, item) {
  const panelRect = browserPanel.value?.getBoundingClientRect()
  const targetRect = event.currentTarget?.getBoundingClientRect?.()
  if (!panelRect || !targetRect) {
    return
  }

  const tooltipWidth = Math.min(320, window.innerWidth * 0.9)
  const horizontalPadding = 18
  const centeredLeft = targetRect.left + targetRect.width / 2 - panelRect.left
  const left = Math.min(
    Math.max(centeredLeft, tooltipWidth / 2 + horizontalPadding),
    panelRect.width - tooltipWidth / 2 - horizontalPadding,
  )

  const aboveTop = targetRect.top - panelRect.top - 12
  const fitsAbove = aboveTop >= 140

  browserTooltip.value = {
    title: item.name,
    html: formatItemTooltip(item.cleanDescription),
    style: {
      left: `${left}px`,
      top: `${fitsAbove ? aboveTop : targetRect.bottom - panelRect.top + 12}px`,
      transform: fitsAbove ? 'translate(-50%, -100%)' : 'translate(-50%, 0)',
      width: `min(${tooltipWidth}px, calc(100vw - 24px))`,
    },
  }
}

function hideBrowserTooltip() {
  browserTooltip.value = null
}

function canAddItem(item) {
  if (selectedItems.value.length >= 6) {
    return false
  }

  const alreadySelected = selectedItems.value.some((selectedItem) => selectedItem?.name === item.name)
  if (alreadySelected) {
    return false
  }

  if (item.hasSpellblade && selectedItems.value.some((selectedItem) => selectedItem?.hasSpellblade)) {
    return false
  }

  return true
}

function formatItemTooltip(description) {
  const { stats, effects } = splitTooltipSections(description)
  const sections = []

  if (stats.length > 0) {
    sections.push(`
      <section class="tooltip-section tooltip-stats-section">
        <div class="tooltip-section-title">Stats</div>
        ${stats
          .map((line) => `<div class="tooltip-line tooltip-stat-line">${formatTooltipInline(line)}</div>`)
          .join('')}
      </section>
    `)
  }

  if (effects.length > 0) {
    sections.push(`
      <section class="tooltip-section tooltip-effects-section">
        <div class="tooltip-section-title">Effects</div>
        ${effects
          .map((effect) => `<div class="tooltip-line tooltip-effect-line">${formatTooltipEffect(effect)}</div>`)
          .join('')}
      </section>
    `)
  }

  return `<div class="tooltip-sections">${sections.join('')}</div>`
}

function splitTooltipSections(description) {
  const lines = description
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)

  const stats = []
  const effects = []
  let currentEffect = null

  for (const line of lines) {
    if (isStatLine(line)) {
      stats.push(line)
      continue
    }

    if (isEffectHeadingLine(line)) {
      if (currentEffect) {
        effects.push(finalizeEffect(currentEffect))
      }

      currentEffect = parseEffectHeading(line)
      continue
    }

    if (!currentEffect) {
      currentEffect = { title: '', bodyParts: [line] }
      continue
    }

    currentEffect.bodyParts.push(line)
  }

  if (currentEffect) {
    effects.push(finalizeEffect(currentEffect))
  }

  return { stats, effects }
}

function isStatLine(line) {
  const normalizedLine = line.replace(/^- /, '').trim()

  return /^(\+?\d+(\.\d+)?%?\s+)/.test(normalizedLine) &&
    /(health|mana|damage|power|armor|resist|speed|haste|regen|steal|vamp|penetration|shield|critical|crit|lethality)/i.test(normalizedLine) &&
    !/:/.test(normalizedLine)
}

function isEffectHeadingLine(line) {
  return /^((?:UNIQUE\s+)?(?:PASSIVE|ACTIVE|Passive|Active|Mythic Passive|Aura))(?:\s*[-–]\s*[^:]+)?[:]?/i.test(line) ||
    /^[A-Z][A-Za-z' -]+:/.test(line) ||
    /^[A-Z][A-Za-z' -]*(?:\s\([^)]+\))?$/.test(line)
}

function parseEffectHeading(line) {
  const passiveMatch = line.match(
    /^((?:UNIQUE\s+)?(?:PASSIVE|ACTIVE|Passive|Active|Mythic Passive|Aura))(?:\s*[-–]\s*([^:]+))?(:?)\s*(.*)$/i,
  )

  if (passiveMatch) {
    const [, effectType, effectName = '', colon = '', effectBody = ''] = passiveMatch
    return {
      title: `${[effectType.trim(), effectName.trim()].filter(Boolean).join(' - ')}${colon}`,
      bodyParts: effectBody ? [effectBody.trim()] : [],
    }
  }

  const titledEffectMatch = line.match(/^([^:]+:)\s*(.*)$/)
  if (titledEffectMatch && /[A-Z]/.test(titledEffectMatch[1])) {
    const [, effectTitle, effectBody = ''] = titledEffectMatch
    return {
      title: effectTitle.trim(),
      bodyParts: effectBody ? [effectBody.trim()] : [],
    }
  }

  return {
    title: line.trim(),
    bodyParts: [],
  }
}

function finalizeEffect(effect) {
  return {
    title: effect.title.trim(),
    body: effect.bodyParts.join(' ').trim(),
  }
}

function formatTooltipEffect(effect) {
  return `
    ${effect.title ? `<em class="tooltip-action-label">${escapeHtml(effect.title)}</em>` : ''}
    ${effect.body ? `<span class="tooltip-effect-body">${formatTooltipInlineHtml(escapeHtml(effect.body))}</span>` : ''}
  `.trim()
}

function formatTooltipInline(text) {
  return formatTooltipInlineHtml(escapeHtml(text))
}

function formatTooltipMultiline(text) {
  return formatTooltipInline(text).replaceAll('\n', '<br>')
}

function formatTooltipInlineHtml(sourceText) {
  return [
    {
      pattern: /\bmagic damage\b/gi,
      icon: 'mdi-auto-fix',
      className: 'tooltip-magic',
    },
    {
      pattern: /\bphysical damage\b/gi,
      icon: 'mdi-sword',
      className: 'tooltip-physical',
    },
    {
      pattern: /\btrue damage\b/gi,
      icon: 'mdi-flash',
      className: 'tooltip-true',
    },
    {
      pattern: /\bability power\b/gi,
      icon: 'mdi-star-four-points',
      className: 'tooltip-magic',
    },
    {
      pattern: /\battack damage\b/gi,
      icon: 'mdi-sword-cross',
      className: 'tooltip-physical',
    },
    {
      pattern: /\barmor\b/gi,
      icon: 'mdi-shield-outline',
      className: 'tooltip-defense',
    },
    {
      pattern: /\bmagic resist(?:ance)?\b/gi,
      icon: 'mdi-shield-star-outline',
      className: 'tooltip-defense',
    },
    {
      pattern: /\bhealth\b/gi,
      icon: 'mdi-heart-plus',
      className: 'tooltip-health',
    },
    {
      pattern: /\bmana\b/gi,
      icon: 'mdi-water',
      className: 'tooltip-mana',
    },
    {
      pattern: /\bmove(?:ment)? speed\b/gi,
      icon: 'mdi-run-fast',
      className: 'tooltip-speed',
    },
    {
      pattern: /\battack speed\b/gi,
      icon: 'mdi-weather-windy',
      className: 'tooltip-speed',
    },
    {
      pattern: /\bcritical strike chance\b|\bcrit chance\b/gi,
      icon: 'mdi-bullseye-arrow',
      className: 'tooltip-crit',
    },
    {
      pattern: /\bability haste\b/gi,
      icon: 'mdi-timer-outline',
      className: 'tooltip-haste',
    },
    {
      pattern: /\blife steal\b/gi,
      icon: 'mdi-blood-bag',
      className: 'tooltip-health',
    },
    {
      pattern: /\bomnivamp\b/gi,
      icon: 'mdi-vampire',
      className: 'tooltip-health',
    },
    {
      pattern: /\bheal(?:ing|s|ed)?\b/gi,
      icon: 'mdi-heart-plus',
      className: 'tooltip-health',
    },
    {
      pattern: /\bshield(?:ing|s|ed)?\b/gi,
      icon: 'mdi-shield-plus-outline',
      className: 'tooltip-defense',
    },
  ].reduce(
    (text, rule) =>
      text.replace(
        rule.pattern,
        (match) =>
          `<span class="tooltip-token ${rule.className}"><i class="mdi ${rule.icon}"></i>${match}</span>`,
      ),
    sourceText,
  )
}

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}
</script>

<template>
  <div class="app-shell">
    <header class="hero">
      <p class="eyebrow">League Build Tester</p>
      <p v-if="version" class="patch-pill">Patch {{ version }}</p>
    </header>

    <div v-if="loading" class="state-card">Loading latest Riot data...</div>
    <div v-else-if="errorMessage" class="state-card state-error">{{ errorMessage }}</div>

    <main v-else class="workspace">
      <section class="content-column">
        <section class="side-column champion-column">
          <article class="panel" :style="championPanelHeight ? { height: championPanelHeight } : null">
            <div class="panel-head">
              <h2>Champion</h2>
              <p v-if="selectedChampion">{{ selectedChampion.name }}</p>
            </div>

            <div class="champion-grid-scroll">
              <div class="champion-grid">
                <button
                  v-for="champion in champions"
                  :key="champion.id"
                  class="champion-button"
                  :class="{ active: champion.id === championId }"
                  type="button"
                  :title="champion.name"
                  @click="selectChampion(champion.id)"
                >
                  <img :src="champion.imageUrl" :alt="champion.name" class="champion-grid-icon" />
                </button>
              </div>
            </div>

            <article v-if="selectedChampion" class="champion-card">
              <img :src="selectedChampion.imageUrl" :alt="selectedChampion.name" class="champion-card-icon" />
              <div>
                <h3>{{ selectedChampion.name }}</h3>
                <p>{{ selectedChampion.title }}</p>
                <div class="tag-row">
                  <span v-for="tag in selectedChampion.tags" :key="tag" class="tag">{{ tag }}</span>
                </div>
              </div>
            </article>

          </article>
        </section>

        <section ref="statPanel" class="panel stat-panel">
          <div class="panel-head stat-headline">
            <div>
              <h2>Live Stats</h2>
              <p>Champion stats at the selected level plus current completed-item bonuses.</p>
            </div>
            <div class="stat-head-controls">
              <label class="level-control" for="champion-level">
                <span class="level-control-label">Level {{ championLevel }}</span>
                <input
                  id="champion-level"
                  v-model.number="championLevel"
                  class="level-slider"
                  type="range"
                  min="1"
                  max="18"
                  step="1"
                />
              </label>
              <div v-if="selectedChampion" class="stat-hero">
                <img :src="selectedChampion.imageUrl" :alt="selectedChampion.name" class="stat-hero-icon" />
                <span>{{ selectedChampion.name }}</span>
              </div>
            </div>
          </div>

          <div class="stats-grid">
            <div v-for="stat in displayedStats" :key="stat.key" class="stat-card">
              <div class="stat-card-head">
                <strong>{{ stat.label }}</strong>
                <span
                  class="scale-pill"
                  :class="{ active: scalingSignals[stat.key], utility: stat.extraOnly }"
                  :title="scalingSignals[stat.key] ? 'Champion scales with this stat' : stat.extraOnly ? 'Utility stat' : ''"
                >
                  <i v-if="scalingSignals[stat.key]" class="mdi" :class="scalingLabel(stat.key, stat.extraOnly)"></i>
                  <template v-else>{{ scalingLabel(stat.key, stat.extraOnly) }}</template>
                </span>
              </div>

              <div class="stat-values">
                <div class="stat-value">
                  <span class="stat-caption">Base</span>
                  <strong>{{ formatStat(stat.base, stat.key) }}{{ stat.unit }}</strong>
                </div>
                <div class="stat-value">
                  <span class="stat-caption">Bonus</span>
                  <strong class="bonus">+{{ formatStat(stat.bonus, stat.key) }}{{ stat.unit }}</strong>
                </div>
                <div class="stat-value">
                  <span class="stat-caption">Total</span>
                  <strong>{{ formatStat(stat.total, stat.key) }}{{ stat.unit }}</strong>
                </div>
              </div>
            </div>
          </div>

          <div v-if="championAbilities.length" class="ability-section">
            <div class="panel-head inline-head">
              <h2>Champion Abilities</h2>
              <p>Passive, Q, W, E, and R with detected stat scaling.</p>
            </div>

            <div class="ability-grid">
              <article
                v-for="ability in championAbilities"
                :key="ability.slot"
                class="ability-stat-card hover-card"
                :style="abilityCardStyle(ability)"
              >
                <span class="ability-corner-badge">{{ ability.slot }}</span>
                <span v-if="ability.scalesWith.length" class="ability-overlay-pill">
                  {{ formatAbilityScalingText(ability.scalesWith) }}
                </span>

                <div class="tooltip-card ability-tooltip">
                  <strong>{{ ability.name }}</strong>
                  <div v-if="ability.detailRows.length" class="ability-tooltip-section">
                    <span class="ability-tooltip-label">Details</span>
                    <div
                      v-for="detail in ability.detailRows"
                      :key="`${ability.slot}-detail-${detail.label}-${detail.value}`"
                      class="ability-tooltip-line tooltip-effect-line ability-tooltip-detail-line"
                    >
                      <em v-html="formatTooltipInline(detail.label)"></em>
                      <span v-html="formatTooltipInline(detail.value)"></span>
                    </div>
                  </div>

                  <div v-if="ability.effectRows.length" class="ability-tooltip-section">
                    <span class="ability-tooltip-label">Effects</span>
                    <div
                      v-for="effect in ability.effectRows"
                      :key="`${ability.slot}-effect-${effect.label}-${effect.value}`"
                      class="ability-tooltip-line tooltip-effect-line ability-tooltip-detail-line"
                    >
                      <em v-html="formatTooltipInline(effect.label)"></em>
                      <span v-html="formatTooltipInline(effect.value)"></span>
                    </div>
                  </div>

                  <div v-if="ability.rankChanges.length" class="ability-tooltip-section">
                    <span class="ability-tooltip-label">By Rank</span>
                    <div
                      v-for="rankChange in ability.rankChanges"
                      :key="`${ability.slot}-${rankChange.label}`"
                      class="ability-tooltip-line"
                    >
                      <em>{{ rankChange.label }}</em>
                      <span>{{ rankChange.values }}</span>
                    </div>
                  </div>

                  <div class="ability-tooltip-copy" v-html="formatTooltipMultiline(ability.description)"></div>
                </div>
              </article>
            </div>
          </div>

          <div class="selected-items-inline">
            <div class="panel-head inline-head">
              <h2>Selected Items</h2>
              <button class="ghost-button" type="button" @click="clearItems">Clear</button>
            </div>

            <div class="selected-grid">
              <button
                v-for="slotIndex in 6"
                :key="`slot-${slotIndex}`"
                class="selected-slot"
                :class="{ filled: Boolean(selectedItems[slotIndex - 1]) }"
                type="button"
                @click="selectedItems[slotIndex - 1] && removeItem(slotIndex - 1)"
              >
                <template v-if="selectedItems[slotIndex - 1]">
                  <div class="selected-item hover-card">
                    <span class="item-art">
                      <img
                        :src="selectedItems[slotIndex - 1].imageUrl"
                        :alt="selectedItems[slotIndex - 1].name"
                        class="item-icon"
                      />
                    </span>

                    <div class="tooltip-card">
                      <strong>{{ selectedItems[slotIndex - 1].name }}</strong>
                      <div v-html="formatItemTooltip(selectedItems[slotIndex - 1].cleanDescription)"></div>
                    </div>
                  </div>
                </template>

                <template v-else>
                  <span class="empty-slot-chip"></span>
                </template>
              </button>
            </div>
          </div>
        </section>

        <article class="panel rune-panel">
          <RunePageEditor :rune-styles="runeStyles" />
        </article>
      </section>

      <section class="side-column browser-column">
        <article
          ref="browserPanel"
          class="panel browser-panel"
          :style="browserPanelHeight ? { height: browserPanelHeight } : null"
        >
          <div class="panel-head browser-head">
            <h2>Items</h2>
            <p>{{ visibleItems.length }} available</p>
          </div>

          <div class="browser-controls">
            <label class="field">
              <span>Search items</span>
              <input v-model="itemSearch" type="search" placeholder="Crit, AP, armor..." />
            </label>

            <div class="filter-group">
              <button
                v-for="filter in STAT_FILTERS"
                :key="filter.key"
                class="filter-chip"
                type="button"
                :class="{ active: activeFilters.includes(filter.key) }"
                @click="toggleFilter(filter.key)"
              >
                {{ filter.label }}
              </button>
            </div>
          </div>

          <div class="item-grid-scroll" @scroll="hideBrowserTooltip">
            <div v-if="visibleItems.length" class="item-grid">
              <button
                v-for="item in visibleItems"
                :key="item.id"
                class="item-card"
                type="button"
                :disabled="!canAddItem(item)"
                @click="addItem(item)"
                @mouseenter="showBrowserTooltip($event, item)"
                @mouseleave="hideBrowserTooltip"
                @focus="showBrowserTooltip($event, item)"
                @blur="hideBrowserTooltip"
              >
                <span class="item-art">
                  <img :src="item.imageUrl" :alt="item.name" class="item-icon" />
                </span>
              </button>
            </div>

            <p v-else class="empty-state">No completed items match the current filters.</p>
          </div>

          <div
            v-if="browserTooltip"
            class="tooltip-card browser-floating-tooltip"
            :style="browserTooltip.style"
          >
            <strong>{{ browserTooltip.title }}</strong>
            <div v-html="browserTooltip.html"></div>
          </div>
        </article>
      </section>
    </main>
  </div>
</template>

<style scoped>
:global(*) {
  box-sizing: border-box;
}

:global(body) {
  margin: 0;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  background:
    radial-gradient(circle at top, rgba(181, 53, 76, 0.18), transparent 28%),
    radial-gradient(circle at right, rgba(22, 87, 114, 0.14), transparent 24%),
    linear-gradient(180deg, #f6efe5 0%, #e7dbca 100%);
  color: #13263d;
}

:global(button),
:global(input) {
  font: inherit;
}

.app-shell {
  max-width: 1600px;
  margin: 0 auto;
  padding: 28px 20px 48px;
}

.hero {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 18px;
}

.eyebrow {
  margin: 0;
  color: #8b233a;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  font-size: 0.8rem;
  font-weight: 700;
}

.patch-pill,
.tag,
.scale-pill,
.filter-chip {
  border: 1px solid rgba(19, 38, 61, 0.14);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.76);
}

.patch-pill {
  margin: 0;
  padding: 10px 14px;
  font-weight: 700;
}

.workspace {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 420px;
  gap: 20px;
  align-items: start;
}

.content-column {
  display: grid;
  grid-template-columns: 360px minmax(0, 1fr);
  gap: 20px;
  align-items: stretch;
}

.side-column {
  display: grid;
  gap: 20px;
}

.champion-column {
  grid-column: 1;
  align-self: stretch;
  display: flex;
}

.champion-column .panel {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.browser-column {
  grid-column: 2;
}

.browser-column .panel {
  position: relative;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: visible;
}

.panel,
.state-card {
  background: rgba(255, 252, 247, 0.92);
  border: 1px solid rgba(19, 38, 61, 0.12);
  border-radius: 24px;
  padding: 22px;
  box-shadow: 0 18px 40px rgba(19, 38, 61, 0.08);
}

.state-card {
  font-weight: 600;
}

.state-error {
  color: #8f2230;
}

.panel-head,
.browser-head,
.stat-headline {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.panel-head h2,
.browser-head h2,
.stat-headline h2 {
  margin: 0;
  font-size: 1.12rem;
}

.panel-head p,
.browser-head p,
.stat-headline p {
  margin: 0;
  color: #55697f;
  font-size: 0.9rem;
}

.champion-grid-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 4px;
  border-radius: 18px;
  background: rgba(15, 31, 48, 0.05);
  box-shadow: inset 0 0 0 1px rgba(19, 38, 61, 0.08);
}

.champion-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 8px;
  align-content: start;
}

.champion-button,
.selected-slot,
.item-card,
.ghost-button,
.filter-chip {
  cursor: pointer;
  border: 0;
}

.champion-button {
  padding: 0;
  border-radius: 14px;
  overflow: hidden;
  background: #0f1f30;
  box-shadow: inset 0 0 0 1px rgba(19, 38, 61, 0.08);
  transition: transform 150ms ease, box-shadow 150ms ease;
}

.champion-button.active {
  transform: translateY(-1px);
  box-shadow:
    inset 0 0 0 2px rgba(255, 255, 255, 0.72),
    0 0 0 2px rgba(178, 47, 74, 0.72);
}

.champion-grid-icon,
.item-icon {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 14px;
  object-fit: cover;
  display: block;
}

.champion-grid-icon,
.champion-card-icon {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 14px;
  object-fit: cover;
  object-position: center 16%;
  transform: scale(1.12);
  transform-origin: center;
  display: block;
}

.champion-card-icon {
  width: 84px;
  flex-shrink: 0;
  object-position: center 18%;
}

.champion-card {
  display: flex;
  gap: 16px;
  align-items: center;
  margin-top: 18px;
  padding: 16px;
  border-radius: 20px;
  background: linear-gradient(140deg, rgba(17, 36, 55, 0.96), rgba(125, 34, 58, 0.9));
  color: #fff8f2;
}

.champion-card h3,
.champion-card p {
  margin: 0;
}

.champion-card p {
  margin-top: 4px;
  color: rgba(255, 248, 242, 0.84);
}

.ability-corner-badge,
.ability-scale-tag {
  border: 1px solid rgba(19, 38, 61, 0.14);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.76);
}

.ability-corner-badge {
  position: absolute;
  top: 8px;
  left: 8px;
  z-index: 1;
  min-width: 22px;
  padding: 2px 5px;
  text-align: center;
  font-size: 0.62rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: #8b233a;
  background: rgba(255, 252, 247, 0.84);
  backdrop-filter: blur(4px);
  box-shadow: 0 4px 10px rgba(19, 38, 61, 0.12);
}

.ability-scale-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px 8px;
  font-size: 0.68rem;
  font-weight: 700;
  color: #13263d;
  text-align: center;
}

.tag-row,
.filter-group,
.tree-options {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.tag {
  display: inline-flex;
  padding: 8px 12px;
  margin-top: 12px;
  color: #13263d;
  font-size: 0.84rem;
  font-weight: 700;
}

.rune-panel {
  grid-column: 1 / span 2;
  padding: 24px;
}

.stat-panel {
  grid-column: 2;
  align-self: start;
}

.ability-section,
.selected-items-inline {
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px solid rgba(19, 38, 61, 0.1);
}

.inline-head {
  margin-bottom: 10px;
}

.stat-head-controls {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  flex-wrap: wrap;
}

.level-control {
  display: grid;
  gap: 6px;
  min-width: min(220px, 100%);
  padding: 8px 12px;
  border-radius: 16px;
  background: rgba(19, 38, 61, 0.06);
}

.level-control-label {
  color: #13263d;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.level-slider {
  width: 100%;
  accent-color: #13263d;
}

.stat-hero {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(19, 38, 61, 0.06);
}

.stat-hero-icon {
  width: 36px;
  height: 36px;
  border-radius: 999px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.stat-card {
  position: relative;
  display: grid;
  grid-template-rows: auto 1fr;
  gap: 8px;
  min-height: 132px;
  padding: 12px;
  border-radius: 14px;
  background: rgba(19, 38, 61, 0.04);
  box-shadow: inset 0 0 0 1px rgba(19, 38, 61, 0.08);
}

.ability-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 12px;
}

.ability-stat-card {
  position: relative;
  min-height: 112px;
  padding: 10px;
  border: 0;
  border-radius: 18px;
  background:
    linear-gradient(180deg, rgba(10, 20, 32, 0.1) 0%, rgba(10, 20, 32, 0.78) 100%),
    linear-gradient(135deg, rgba(19, 38, 61, 0.92), rgba(139, 35, 58, 0.72));
  background-position: center;
  background-size: cover;
  box-shadow:
    inset 0 0 0 1px rgba(255, 250, 245, 0.08),
    0 10px 24px rgba(19, 38, 61, 0.14);
  overflow: visible;
}

.ability-overlay-pill {
  position: absolute;
  right: 8px;
  bottom: 8px;
  left: 8px;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 24px;
  padding: 4px 8px;
  border-radius: 999px;
  background: rgba(255, 252, 247, 0.9);
  box-shadow: 0 8px 18px rgba(19, 38, 61, 0.18);
  color: #13263d;
  font-size: 0.64rem;
  font-weight: 800;
  line-height: 1.2;
  text-align: center;
  white-space: pre-line;
}

.ability-tooltip {
  width: min(360px, 90vw);
}

.ability-tooltip-section {
  display: grid;
  gap: 8px;
  margin-top: 10px;
}

.ability-tooltip-label {
  color: rgba(255, 250, 245, 0.58);
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.ability-tooltip-line {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  align-items: baseline;
  font-size: 0.8rem;
  color: rgba(255, 250, 245, 0.88);
}

.ability-tooltip-line em {
  color: rgba(255, 240, 214, 0.9);
  font-style: normal;
  font-weight: 700;
}

.ability-tooltip-line span {
  text-align: right;
}

.ability-tooltip-detail-line {
  align-items: flex-start;
}

.ability-tooltip-detail-line em,
.ability-tooltip-detail-line span {
  display: block;
}

.ability-tooltip-detail-line span {
  color: rgba(255, 250, 245, 0.92);
}

.ability-tooltip-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.ability-tooltip-copy {
  margin-top: 10px;
  color: rgba(255, 250, 245, 0.88);
  font-size: 0.8rem;
  line-height: 1.45;
}

.stat-card-head {
  min-height: 32px;
  padding-right: 34px;
}

.stat-values {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
  align-items: start;
}

.stat-value {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
  min-width: 0;
}

.stat-caption {
  color: #55697f;
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  flex-shrink: 0;
}

.stat-value strong {
  display: block;
  min-width: 0;
  font-size: 0.88rem;
  line-height: 1.15;
  white-space: nowrap;
  overflow: visible;
  text-overflow: clip;
  text-align: right;
  font-variant-numeric: tabular-nums;
}

.bonus {
  color: #0d7553;
  font-weight: 700;
}

.scale-pill {
  position: absolute;
  top: 12px;
  right: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  min-height: 28px;
  padding: 4px;
  font-size: 0.95rem;
  font-weight: 700;
}

.scale-pill .mdi {
  font-size: 1rem;
  line-height: 1;
}

.scale-pill.active,
.filter-chip.active {
  background: #13263d;
  color: #fffaf5;
}

.scale-pill:not(.active):not(.utility) {
  opacity: 0;
}

.scale-pill.utility {
  color: #55697f;
}

.ghost-button,
.filter-chip {
  padding: 5px 9px;
  border: 1px solid rgba(19, 38, 61, 0.14);
  border-radius: 999px;
  background: transparent;
  color: #13263d;
}

.filter-chip {
  font-size: 0.72rem;
  line-height: 1;
}

.selected-grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 8px;
}

.selected-slot {
  position: relative;
  aspect-ratio: 1;
  min-height: auto;
  padding: 4px;
  border-radius: 16px;
  overflow: visible;
  background: rgba(19, 38, 61, 0.05);
  box-shadow: inset 0 0 0 1px rgba(19, 38, 61, 0.12);
  color: #55697f;
  display: flex;
  align-items: center;
  justify-content: center;
}

.selected-slot.filled {
  background: rgba(255, 255, 255, 0.78);
  color: #13263d;
}

.selected-item {
  position: relative;
  display: block;
  width: 100%;
  height: 100%;
}

.empty-slot-chip {
  width: 58%;
  height: 58%;
  border-radius: 12px;
  background: rgba(19, 38, 61, 0.06);
  box-shadow: inset 0 0 0 1px rgba(19, 38, 61, 0.08);
}

.browser-controls {
  display: grid;
  gap: 12px;
  margin-bottom: 14px;
}

.field {
  display: grid;
  gap: 6px;
}

.field span {
  font-size: 0.78rem;
  font-weight: 700;
  color: #55697f;
}

.field input {
  width: 100%;
  min-height: 40px;
  padding: 9px 12px;
  border: 1px solid rgba(19, 38, 61, 0.14);
  border-radius: 12px;
  background: #fffdf9;
  color: #13263d;
}

.item-grid-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 4px;
  border-radius: 18px;
  background: rgba(15, 31, 48, 0.05);
  box-shadow: inset 0 0 0 1px rgba(19, 38, 61, 0.08);
}

.item-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 10px;
}

.item-card {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: visible;
  aspect-ratio: 1;
  min-height: auto;
  padding: 4px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.72);
  box-shadow: inset 0 0 0 1px rgba(19, 38, 61, 0.12);
}

.item-art {
  display: block;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: 14px;
}

.item-card .item-icon,
.selected-item .item-icon {
  width: 100%;
  height: 100%;
  border-radius: 14px;
}

.item-card strong,
.item-card span {
  display: block;
}

.item-card:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.browser-floating-tooltip {
  position: absolute;
  z-index: 8;
  opacity: 1;
  pointer-events: none;
}

.hover-card:hover .tooltip-card,
.hover-card:focus-visible .tooltip-card {
  opacity: 1;
  transform: translateY(0);
  pointer-events: auto;
}

.tooltip-card {
  position: absolute;
  left: 50%;
  bottom: calc(100% + 12px);
  z-index: 5;
  width: min(320px, 90vw);
  padding: 14px;
  border-radius: 16px;
  background: #13263d;
  color: #fffaf5;
  box-shadow: 0 18px 36px rgba(19, 38, 61, 0.24);
  opacity: 0;
  transform: translate(-50%, 10px);
  pointer-events: none;
  transition: opacity 160ms ease, transform 160ms ease;
  text-align: left;
}

.tooltip-card.browser-floating-tooltip {
  bottom: auto;
  z-index: 8;
  background: #13263d;
  border: 1px solid rgba(8, 17, 27, 0.92);
  box-shadow: 0 18px 36px rgba(8, 17, 27, 0.32);
  opacity: 1;
  pointer-events: none;
  transition: none;
}

.tooltip-card strong,
.tooltip-card p {
  display: block;
}

.tooltip-card :deep(.tooltip-sections) {
  display: grid;
  gap: 10px;
  margin-top: 8px;
  font-size: 0.8rem;
  line-height: 1.35;
}

.tooltip-card :deep(.tooltip-section) {
  display: grid;
  gap: 6px;
}

.tooltip-card :deep(.tooltip-stats-section) {
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(255, 250, 245, 0.12);
}

.tooltip-card :deep(.tooltip-section-title) {
  color: rgba(255, 250, 245, 0.58);
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.tooltip-card :deep(.tooltip-line) {
  color: rgba(255, 250, 245, 0.88);
  white-space: normal;
}

.tooltip-card :deep(.tooltip-stat-line) {
  font-weight: 700;
}

.tooltip-card :deep(.tooltip-effect-line) {
  font-size: 0.78rem;
  padding: 8px 10px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.05);
  box-shadow: inset 0 0 0 1px rgba(255, 250, 245, 0.08);
}

.tooltip-card :deep(.tooltip-action-label) {
  display: block;
  margin-bottom: 4px;
  color: rgba(255, 240, 214, 0.9);
  font-style: italic;
  font-weight: 700;
}

.tooltip-card :deep(.tooltip-effect-body) {
  display: block;
  color: rgba(255, 250, 245, 0.86);
}

.tooltip-card p {
  margin: 8px 0 0;
  color: rgba(255, 250, 245, 0.88);
}

:deep(.tooltip-token) {
  display: inline;
  font-weight: 700;
  white-space: normal;
}

:deep(.tooltip-token .mdi) {
  font-size: 0.95rem;
  line-height: 1;
  display: inline-block;
  margin-right: 4px;
  vertical-align: text-bottom;
}

:deep(.tooltip-magic) {
  color: #7ec7ff;
}

:deep(.tooltip-physical) {
  color: #ffb169;
}

:deep(.tooltip-true) {
  color: #f3f1db;
}

:deep(.tooltip-defense) {
  color: #d8dac8;
}

:deep(.tooltip-health) {
  color: #ff8a94;
}

:deep(.tooltip-mana) {
  color: #74a8ff;
}

:deep(.tooltip-speed) {
  color: #b0f0cb;
}

:deep(.tooltip-crit) {
  color: #ffd36f;
}

:deep(.tooltip-haste) {
  color: #cab8ff;
}

.empty-state {
  margin: 0;
  padding: 10px 6px;
  color: #55697f;
}

@media (max-width: 1220px) {
  .workspace {
    grid-template-columns: 1fr;
  }

  .content-column {
    grid-template-columns: 1fr;
  }

  .champion-column,
  .stat-panel,
  .rune-panel,
  .browser-column {
    grid-column: auto;
  }

  .stats-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

@media (max-width: 760px) {
  .hero {
    flex-direction: column;
  }

  .champion-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .selected-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 520px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
