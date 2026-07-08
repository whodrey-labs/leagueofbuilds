const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api'
const LOCALE = 'en_US'
const ABILITY_SLOT_LABELS = ['Q', 'W', 'E', 'R']

const BASE_STAT_DEFINITIONS = [
  {
    key: 'health',
    label: 'Health',
    unit: '',
    championKey: 'hp',
    itemKey: 'FlatHPPoolMod',
    scaleKeys: ['health', 'max health', 'bonus health'],
  },
  {
    key: 'mana',
    label: 'Mana',
    unit: '',
    championKey: 'mp',
    itemKey: 'FlatMPPoolMod',
    scaleKeys: ['mana', 'max mana', 'bonus mana'],
  },
  {
    key: 'attackDamage',
    label: 'Attack Damage',
    unit: '',
    championKey: 'attackdamage',
    itemKey: 'FlatPhysicalDamageMod',
    scaleKeys: ['attack damage', 'bonus ad', 'total ad', 'bonus attack damage'],
  },
  {
    key: 'abilityPower',
    label: 'Ability Power',
    unit: '',
    championKey: null,
    itemKey: 'FlatMagicDamageMod',
    scaleKeys: ['ability power', ' ap', '(ap', 'magic damage per 100 ap'],
  },
  {
    key: 'armor',
    label: 'Armor',
    unit: '',
    championKey: 'armor',
    itemKey: 'FlatArmorMod',
    scaleKeys: ['armor'],
  },
  {
    key: 'magicResist',
    label: 'Magic Resist',
    unit: '',
    championKey: 'spellblock',
    itemKey: 'FlatSpellBlockMod',
    scaleKeys: ['magic resist', 'magic resistance'],
  },
  {
    key: 'moveSpeed',
    label: 'Move Speed',
    unit: '',
    championKey: 'movespeed',
    itemKey: null,
    scaleKeys: ['move speed', 'movement speed'],
  },
  {
    key: 'attackSpeed',
    label: 'Attack Speed',
    unit: '',
    championKey: 'attackspeed',
    itemKey: null,
    scaleKeys: ['attack speed'],
  },
  {
    key: 'critChance',
    label: 'Crit Chance',
    unit: '%',
    championKey: 'crit',
    itemKey: 'FlatCritChanceMod',
    scaleKeys: ['critical strike chance', 'critical strike', 'crit chance'],
  },
  {
    key: 'healthRegen',
    label: 'Health Regen',
    unit: '',
    championKey: 'hpregen',
    itemKey: 'FlatHPRegenMod',
    scaleKeys: ['health regen'],
  },
  {
    key: 'manaRegen',
    label: 'Mana Regen',
    unit: '',
    championKey: 'mpregen',
    itemKey: 'FlatMPRegenMod',
    scaleKeys: ['mana regen'],
  },
]

const EXTRA_STAT_PATTERNS = [
  { key: 'abilityHaste', label: 'Ability Haste', unit: '', regex: /(\d+(?:\.\d+)?)\s+Ability Haste/gi },
  { key: 'lifeSteal', label: 'Life Steal', unit: '%', regex: /(\d+(?:\.\d+)?)%\s+Life Steal/gi },
  { key: 'omnivamp', label: 'Omnivamp', unit: '%', regex: /(\d+(?:\.\d+)?)%\s+Omnivamp/gi },
  {
    key: 'armorPenPercent',
    label: 'Armor Penetration',
    unit: '%',
    regex: /(\d+(?:\.\d+)?)%\s+Armor Penetration/gi,
  },
  {
    key: 'magicPenFlat',
    label: 'Magic Penetration',
    unit: '',
    regex: /(\d+(?:\.\d+)?)\s+Magic Penetration/gi,
  },
  {
    key: 'magicPenPercent',
    label: 'Magic Penetration',
    unit: '%',
    regex: /(\d+(?:\.\d+)?)%\s+Magic Penetration/gi,
  },
  {
    key: 'healShieldPower',
    label: 'Heal and Shield Power',
    unit: '%',
    regex: /(\d+(?:\.\d+)?)%\s+Heal and Shield Power/gi,
  },
]

const SCALING_STAT_DEFINITIONS = [
  {
    key: 'health',
    label: 'Health',
    shortLabel: 'HP',
    defaultLabel: 'health',
    regexes: [/\b(?:bonus|max(?:imum)?|missing)?\s*health\b/i],
    varLinks: ['health', 'bonushealth', 'maxhealth'],
    riotPatterns: ['health', 'maxhealth', 'missinghealth', 'percenthealth', 'bonushealth'],
  },
  {
    key: 'mana',
    label: 'Mana',
    shortLabel: 'Mana',
    defaultLabel: 'mana',
    regexes: [/\b(?:bonus|max(?:imum)?|missing)?\s*mana\b/i],
    varLinks: ['mana', 'maxmana'],
    riotPatterns: ['mana', 'maxmana'],
  },
  {
    key: 'attackDamage',
    label: 'Attack Damage',
    shortLabel: 'AD',
    defaultLabel: 'AD',
    regexes: [/\b(?:bonus|total)?\s*(?:attack damage|ad)\b/i],
    varLinks: ['attackdamage', 'bonusattackdamage'],
    riotPatterns: ['adratio', 'attackdamage', 'bonusattackdamage', 'totalad', 'totaladratio'],
  },
  {
    key: 'abilityPower',
    label: 'Ability Power',
    shortLabel: 'AP',
    defaultLabel: 'AP',
    regexes: [/\b(?:ability power|ap)\b/i],
    varLinks: ['spelldamage'],
    riotPatterns: ['apratio', 'spelldamage', 'bonusap', 'abilitypower'],
  },
  {
    key: 'armor',
    label: 'Armor',
    shortLabel: 'Armor',
    defaultLabel: 'armor',
    regexes: [/\b(?:bonus\s+)?armor\b/i],
    varLinks: ['armor', 'bonusarmor'],
    riotPatterns: ['armor', 'bonusarmor'],
  },
  {
    key: 'magicResist',
    label: 'Magic Resist',
    shortLabel: 'MR',
    defaultLabel: 'magic resist',
    regexes: [/\b(?:bonus\s+)?magic resist(?:ance)?\b/i],
    varLinks: ['spellblock', 'bonusspellblock'],
    riotPatterns: ['magicresist', 'spellblock', 'bonusspellblock'],
  },
  {
    key: 'moveSpeed',
    label: 'Move Speed',
    shortLabel: 'MS',
    defaultLabel: 'movement speed',
    regexes: [/\bmove(?:ment)? speed\b/i],
    varLinks: ['movespeed'],
    riotPatterns: ['movespeed', 'speed'],
  },
  {
    key: 'attackSpeed',
    label: 'Attack Speed',
    shortLabel: 'AS',
    defaultLabel: 'attack speed',
    regexes: [/\battack speed\b/i],
    varLinks: ['attackspeed'],
    riotPatterns: ['attackspeed', 'onhitratio'],
  },
  {
    key: 'critChance',
    label: 'Crit Chance',
    shortLabel: 'Crit',
    defaultLabel: 'crit chance',
    regexes: [/\b(?:critical strike chance|crit(?:ical)? chance|critical strike)\b/i],
    varLinks: ['criticalstrikechance'],
    riotPatterns: ['crit', 'criticalstrikechance'],
  },
  {
    key: 'healthRegen',
    label: 'Health Regen',
    shortLabel: 'HP Regen',
    defaultLabel: 'health regen',
    regexes: [/\bhealth regen\b/i],
    varLinks: ['hpregen'],
    riotPatterns: ['healthregen', 'hpregen'],
  },
  {
    key: 'manaRegen',
    label: 'Mana Regen',
    shortLabel: 'Mana Regen',
    defaultLabel: 'mana regen',
    regexes: [/\bmana regen\b/i],
    varLinks: ['mpregen'],
    riotPatterns: ['manaregen', 'mpregen'],
  },
  {
    key: 'championLevel',
    label: 'Champion Level',
    shortLabel: 'Level',
    defaultLabel: 'champion level',
    regexes: [/\bchampion level\b/i],
    varLinks: ['charlevel', 'championlevel'],
    riotPatterns: ['charlevel', 'championlevel'],
  },
]

const SCALING_TEXT_PATTERNS = [
  { pattern: /(\d+(?:\.\d+)?(?:\s*\/\s*\d+(?:\.\d+)?)*)%\s+bonus\s+ad\b/gi, stat: 'attackDamage', statType: 'bonus', label: 'bonus AD' },
  { pattern: /(\d+(?:\.\d+)?(?:\s*\/\s*\d+(?:\.\d+)?)*)%\s+total\s+ad\b/gi, stat: 'attackDamage', statType: 'total', label: 'total AD' },
  { pattern: /(\d+(?:\.\d+)?(?:\s*\/\s*\d+(?:\.\d+)?)*)%\s+ad\b/gi, stat: 'attackDamage', statType: 'total', label: 'AD' },
  { pattern: /(\d+(?:\.\d+)?(?:\s*\/\s*\d+(?:\.\d+)?)*)%\s+ap\b/gi, stat: 'abilityPower', statType: 'total', label: 'AP' },
  { pattern: /(\d+(?:\.\d+)?(?:\s*\/\s*\d+(?:\.\d+)?)*)%\s+bonus\s+health\b/gi, stat: 'health', statType: 'bonus', label: 'bonus health' },
  { pattern: /(\d+(?:\.\d+)?(?:\s*\/\s*\d+(?:\.\d+)?)*)%\s+max(?:imum)?\s+health\b/gi, stat: 'health', statType: 'max', label: 'max health' },
  { pattern: /(\d+(?:\.\d+)?(?:\s*\/\s*\d+(?:\.\d+)?)*)%\s+health\b/gi, stat: 'health', statType: 'total', label: 'health' },
  { pattern: /(\d+(?:\.\d+)?(?:\s*\/\s*\d+(?:\.\d+)?)*)%\s+armor\b/gi, stat: 'armor', statType: 'total', label: 'armor' },
  { pattern: /(\d+(?:\.\d+)?(?:\s*\/\s*\d+(?:\.\d+)?)*)%\s+magic\s+resist(?:ance)?\b/gi, stat: 'magicResist', statType: 'total', label: 'magic resist' },
  { pattern: /(\d+(?:\.\d+)?(?:\s*\/\s*\d+(?:\.\d+)?)*)%\s+attack\s+speed\b/gi, stat: 'attackSpeed', statType: 'total', label: 'attack speed' },
  { pattern: /(\d+(?:\.\d+)?(?:\s*\/\s*\d+(?:\.\d+)?)*)%\s+(?:critical\s+strike\s+chance|crit(?:ical)?\s+chance)\b/gi, stat: 'critChance', statType: 'total', label: 'crit chance' },
  { pattern: /(\d+(?:\.\d+)?(?:\s*\/\s*\d+(?:\.\d+)?)*)%\s+(?:move(?:ment)?\s+speed)\b/gi, stat: 'moveSpeed', statType: 'total', label: 'movement speed' },
  { pattern: /(\d+(?:\.\d+)?(?:\s*\/\s*\d+(?:\.\d+)?)*)%\s+champion\s+level\b/gi, stat: 'championLevel', statType: 'total', label: 'champion level' },
]

const MERAKI_UNIT_PATTERNS = [
  { pattern: /^% ap$/, stat: 'abilityPower', statType: 'total', label: 'AP' },
  { pattern: /^% bonus ad$/, stat: 'attackDamage', statType: 'bonus', label: 'bonus AD' },
  { pattern: /^% ad$/, stat: 'attackDamage', statType: 'total', label: 'AD' },
  { pattern: /^% bonus health$/, stat: 'health', statType: 'bonus', label: 'bonus health' },
  { pattern: /^% maximum health$/, stat: 'health', statType: 'max', label: 'max health' },
  { pattern: /^% health$/, stat: 'health', statType: 'total', label: 'health' },
  { pattern: /^% armor$/, stat: 'armor', statType: 'total', label: 'armor' },
  { pattern: /^% magic resistance?$/, stat: 'magicResist', statType: 'total', label: 'magic resist' },
  { pattern: /^% bonus movement speed$/, stat: 'moveSpeed', statType: 'bonus', label: 'bonus movement speed' },
  { pattern: /^% movement speed$/, stat: 'moveSpeed', statType: 'total', label: 'movement speed' },
  { pattern: /^% attack speed$/, stat: 'attackSpeed', statType: 'total', label: 'attack speed' },
  { pattern: /^% per 100 ap$/, stat: 'abilityPower', statType: 'per100', label: 'per 100 AP' },
  {
    pattern: /^% per 100% bonus attack speed$/,
    stat: 'attackSpeed',
    statType: 'bonusPer100',
    label: 'per 100% bonus attack speed',
  },
]

const ABILITY_TOOLTIP_DETAIL_PATTERN =
  /\b(?:magic|physical|true)\s+damage\b|\b(?:move(?:ment)?|attack)\s+speed\b|\b(?:heal|shield|health|mana|armor|magic resist(?:ance)?|slow|stun|root|snare|airborne|knockup|knock-up|silence|taunt|fear|charm|cooldown|cost|range|haste|crit(?:ical)?|omnivamp|life steal)\b/i

export const STAT_FILTERS = [
  { key: 'health', label: 'Health' },
  { key: 'mana', label: 'Mana' },
  { key: 'attackDamage', label: 'Attack Damage' },
  { key: 'abilityPower', label: 'Ability Power' },
  { key: 'armor', label: 'Armor' },
  { key: 'magicResist', label: 'Magic Resist' },
  { key: 'moveSpeed', label: 'Move Speed' },
  { key: 'attackSpeed', label: 'Attack Speed' },
  { key: 'critChance', label: 'Crit Chance' },
  { key: 'healthRegen', label: 'Health Regen' },
  { key: 'manaRegen', label: 'Mana Regen' },
  { key: 'abilityHaste', label: 'Ability Haste' },
  { key: 'lifeSteal', label: 'Life Steal' },
  { key: 'omnivamp', label: 'Omnivamp' },
  { key: 'armorPenPercent', label: 'Armor Pen' },
  { key: 'magicPenFlat', label: 'Magic Pen' },
  { key: 'magicPenPercent', label: 'Magic Pen %' },
  { key: 'healShieldPower', label: 'Heal/Shield' },
]

export async function fetchLatestGameData() {
  const { version, championList, itemList, runeList } = await fetchJson(`${API_BASE_URL}/game-data`)

  return {
    version,
    champions: normalizeChampions(championList.data, version),
    items: normalizeItems(itemList.data, version),
    runeStyles: normalizeRuneStyles(runeList),
  }
}

export async function fetchChampionDetail(version, championId) {
  return fetchJson(
    `${API_BASE_URL}/champion/${championId}?version=${encodeURIComponent(version)}`,
  )
}

export function describeChampionAbilities(championDetail, version) {
  const passive = championDetail.passive
    ? [
        buildAbilityEntry(
          championDetail.passive,
          'P',
          version,
          'passive',
          findMerakiAbilityBySlot(championDetail.merakiChampion, 'P', championDetail.passive.name),
        ),
      ]
    : []

  const spells = (championDetail.spells ?? []).map((spell, index) =>
    buildAbilityEntry(
      spell,
      ABILITY_SLOT_LABELS[index] ?? `Spell ${index + 1}`,
      version,
      'spell',
      findMerakiAbilityBySlot(
        championDetail.merakiChampion,
        ABILITY_SLOT_LABELS[index] ?? `Spell ${index + 1}`,
        spell.name,
      ),
    ),
  )

  return [...passive, ...spells]
}

export function calculateBuildStats(champion, items, championLevel = 1) {
  const normalizedLevel = normalizeChampionLevel(championLevel)
  const totals = Object.fromEntries(BASE_STAT_DEFINITIONS.map((definition) => [definition.key, 0]))
  const extras = Object.fromEntries(EXTRA_STAT_PATTERNS.map((definition) => [definition.key, 0]))

  for (const item of items) {
    if (!item) {
      continue
    }

    for (const definition of BASE_STAT_DEFINITIONS) {
      if (!definition.itemKey) {
        continue
      }

      totals[definition.key] += getItemStatValue(item.stats, definition.itemKey, definition.key)
    }

    totals.moveSpeed += item.flatMoveSpeed
    totals.attackSpeed += item.percentAttackSpeed

    for (const definition of EXTRA_STAT_PATTERNS) {
      extras[definition.key] += item.extraStats[definition.key] ?? 0
    }
  }

  return BASE_STAT_DEFINITIONS.map((definition) => {
    const base = getChampionBaseStatAtLevel(champion, definition, normalizedLevel)
    let bonus = totals[definition.key]
    let total = base + bonus

    if (definition.key === 'moveSpeed') {
      total = (base + bonus) * (1 + getPercentMoveSpeed(items) / 100)
      bonus = total - base
    }

    if (definition.key === 'attackSpeed') {
      total = base * (1 + bonus / 100)
      bonus = total - base
    }

    if (definition.key === 'critChance') {
      total = base + bonus
    }

    return {
      ...definition,
      base,
      bonus,
      total,
    }
  }).concat(
    EXTRA_STAT_PATTERNS.map((definition) => ({
      key: definition.key,
      label: definition.label,
      unit: definition.unit,
      base: 0,
      bonus: extras[definition.key],
      total: extras[definition.key],
      extraOnly: true,
    })),
  )
}

export function detectChampionScaling(championDetail) {
  const abilityScalingKeys = new Set(
    describeChampionAbilities(championDetail)
      .flatMap((ability) => ability.scalesWith)
      .map((scaling) => scaling.stat),
  )

  return Object.fromEntries(
    BASE_STAT_DEFINITIONS.map((definition) => [
      definition.key,
      abilityScalingKeys.has(definition.key),
    ]),
  )
}

export function describeRuneSelection(primaryStyle, secondaryStyle, selections) {
  const primaryRunes = primaryStyle?.slots
    .map((slot, index) => slot.runes.find((rune) => rune.id === selections.primary[index]))
    .filter(Boolean)

  const secondaryRunes = selections.secondary
    .map((runeId) =>
      secondaryStyle?.slots
        .slice(1)
        .flatMap((slot) => slot.runes)
        .find((rune) => rune.id === runeId),
    )
    .filter(Boolean)

  return { primaryRunes, secondaryRunes }
}

function normalizeChampions(championsById, version) {
  return Object.values(championsById)
    .map((champion) => ({
      ...champion,
      imageUrl: buildImageUrl(version, 'champion', champion.image.full),
    }))
    .sort((left, right) => left.name.localeCompare(right.name))
}

function normalizeItems(itemsById, version) {
  const finalItems = Object.entries(itemsById)
    .map(([id, item]) => {
      const cleanDescription = normalizeText(item.description)
      const extraStats = extractExtraStats(cleanDescription)
      const filterStats = buildFilterStats(item.stats, extraStats, cleanDescription)

      return {
        ...item,
        id,
        imageUrl: buildImageUrl(version, 'item', item.image.full),
        cleanDescription,
        hasSpellblade: /\bspellblade\b/i.test(cleanDescription),
        extraStats,
        filterStats,
        flatMoveSpeed: extractMoveSpeedBonus(item.stats, cleanDescription),
        percentMoveSpeed: extractPercentMoveSpeedBonus(item.stats, cleanDescription),
        percentAttackSpeed: getItemStatValue(item.stats, 'PercentAttackSpeedMod', 'attackSpeed'),
      }
    })
    .filter(isSummonersRiftShopItem)
    .filter(isCompletedBuildItem)
    .filter(isNotArenaPlaceholder)

  return dedupeItemsByName(finalItems)
    .sort((left, right) => left.name.localeCompare(right.name))
}

function normalizeChampionLevel(value) {
  return Math.max(1, Math.min(18, Number(value) || 1))
}

function getChampionBaseStatAtLevel(champion, definition, level) {
  if (!definition.championKey) {
    return 0
  }

  if (definition.key === 'attackSpeed') {
    return getChampionAttackSpeedAtLevel(champion, level)
  }

  const baseValue = Number(champion.stats?.[definition.championKey] ?? 0)
  const growthValue = Number(champion.stats?.[`${definition.championKey}perlevel`] ?? 0)

  if (level <= 1 || growthValue === 0) {
    return baseValue
  }

  return baseValue + growthValue * getChampionLevelGrowthMultiplier(level)
}

function getChampionAttackSpeedAtLevel(champion, level) {
  const baseAttackSpeed = Number(champion.stats?.attackspeed ?? 0)
  const growthPerLevel = Number(champion.stats?.attackspeedperlevel ?? 0)

  if (level <= 1 || growthPerLevel === 0) {
    return baseAttackSpeed
  }

  return baseAttackSpeed * (1 + (growthPerLevel * getChampionLevelGrowthMultiplier(level)) / 100)
}

function getChampionLevelGrowthMultiplier(level) {
  const levelOffset = Math.max(0, level - 1)
  return (0.7025 + 0.0175 * levelOffset) * levelOffset
}

function normalizeRuneStyles(runeStyles) {
  return runeStyles.map((style) => ({
    ...style,
    description: getRuneStyleDescription(style.id, style.name),
    iconUrl: `https://ddragon.leagueoflegends.com/cdn/img/${style.icon}`,
    slots: style.slots.map((slot) => ({
      ...slot,
      runes: slot.runes.map((rune) => ({
        ...rune,
        iconUrl: `https://ddragon.leagueoflegends.com/cdn/img/${rune.icon}`,
        shortDescription: normalizeText(rune.shortDesc),
        longDescription: normalizeText(rune.longDesc),
      })),
    })),
  }))
}

function buildAbilityEntry(ability, slot, version, imageGroup, merakiAbility = null) {
  const description = formatAbilityText(
    ability.sanitizedDescription ?? ability.description ?? ability.tooltip ?? '',
    ability,
  )
  const tooltip = formatAbilityText(
    ability.sanitizedTooltip ?? ability.tooltip ?? ability.description ?? '',
    ability,
  )
  const scalesWith = detectAbilityScaling(ability, description, tooltip, merakiAbility)
  const rankChanges = describeAbilityRankScaling(ability)
  const detailRows = describeAbilityDetailRows(ability)
  const effectRows = describeAbilityEffectRows(tooltip, detailRows)

  return {
    slot,
    name: ability.name,
    description: description || tooltip || 'No description available.',
    tooltip,
    scalesWith,
    rankChanges,
    detailRows,
    effectRows,
    imageUrl:
      version && ability.image?.full ? buildImageUrl(version, imageGroup, ability.image.full) : '',
  }
}

function formatAbilityText(value, ability) {
  return normalizeText(resolveAbilityPlaceholders(value, ability))
}

function resolveAbilityPlaceholders(value, ability) {
  if (!value) {
    return ''
  }

  const tokenMap = buildAbilityTokenMap(ability)

  return String(value)
    .replace(/\{\{\s*([^}]+?)\s*\}\}/g, (match, token) => resolveAbilityToken(token, tokenMap, match))
    .replace(/@([^@]+?)@/g, (match, token) => resolveAbilityToken(token, tokenMap, match))
}

function resolveAbilityToken(token, tokenMap, fallbackValue) {
  const normalizedToken = normalizeAbilityToken(token)
  if (!normalizedToken) {
    return fallbackValue
  }

  const directMatch = tokenMap.get(normalizedToken)
  if (directMatch) {
    return directMatch
  }

  const effectTokenMatch = normalizedToken.match(/^effect(\d+)amount$/)
  if (effectTokenMatch) {
    return tokenMap.get(`e${effectTokenMatch[1]}`) ?? fallbackValue
  }

  return fallbackValue
}

function buildAbilityTokenMap(ability) {
  const tokenMap = new Map()
  const resourceName = normalizeText(ability.costType ?? '').replace(/^:+\s*/, '').trim()

  addAbilityToken(tokenMap, 'cost', normalizeAbilityProgression(ability.costBurn))
  addAbilityToken(tokenMap, 'cooldown', normalizeAbilityProgression(ability.cooldownBurn))
  addAbilityToken(tokenMap, 'range', normalizeAbilityProgression(ability.rangeBurn))
  addAbilityToken(tokenMap, 'maxammo', normalizeAbilityProgression(ability.maxammo))
  addAbilityToken(tokenMap, 'ammorechargetime', normalizeAbilityProgression(ability.ammoRechargeTime))
  addAbilityToken(tokenMap, 'ammorechargetimeburn', normalizeAbilityProgression(ability.ammoRechargeTimeBurn))
  addAbilityToken(tokenMap, 'abilityresourcename', resourceName)

  for (const [index, value] of (ability.effectBurn ?? []).entries()) {
    if (index === 0) {
      continue
    }

    addAbilityToken(tokenMap, `e${index}`, normalizeAbilityProgression(value))
  }

  for (const variable of ability.vars ?? []) {
    if (!variable?.key) {
      continue
    }

    addAbilityToken(tokenMap, variable.key, formatAbilityVariable(variable))
  }

  return tokenMap
}

function addAbilityToken(tokenMap, key, value) {
  const normalizedKey = normalizeAbilityToken(key)
  if (!normalizedKey || !value) {
    return
  }

  tokenMap.set(normalizedKey, value)
}

function normalizeAbilityToken(value) {
  return String(value ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
}

function formatAbilityVariable(variable) {
  const ratios = normalizeCoefficientNumbers(variable.coeff)
  if (!ratios.length) {
    return ''
  }

  const scaling = buildScalingFromVar(variable)

  if (!scaling) {
    return formatPercentRatios(ratios)
  }

  return scaling.label
}

function detectAbilityScaling(ability, description, tooltip, merakiAbility = null) {
  const matchedScalings = new Map()

  for (const scaling of extractMerakiAbilityScaling(merakiAbility)) {
    matchedScalings.set(scaling.id, scaling)
  }

  for (const variable of ability.vars ?? []) {
    const scaling = buildScalingFromVar(variable)
    if (scaling) {
      matchedScalings.set(scaling.id, scaling)
    }
  }

  for (const scaling of extractScalingFromText([description, tooltip].filter(Boolean).join('\n'), {
    requireAdditiveContext: true,
  })) {
    matchedScalings.set(scaling.id, matchedScalings.get(scaling.id) ?? scaling)
  }

  const riotScalingHints = extractRiotScalingHints(ability, description, tooltip)
  for (const definition of SCALING_STAT_DEFINITIONS) {
    if (definition.riotPatterns?.some((pattern) => riotScalingHints.some((hint) => hint.includes(pattern)))) {
      const hasExactStatMatch = [...matchedScalings.values()].some((scaling) => scaling.stat === definition.key)
      if (hasExactStatMatch) {
        continue
      }

      const fallbackScaling = createScalingFallbackEntry(definition.key)
      if (fallbackScaling) {
        matchedScalings.set(fallbackScaling.id, matchedScalings.get(fallbackScaling.id) ?? fallbackScaling)
      }
    }
  }

  return [...matchedScalings.values()]
}

function normalizeVarLink(value) {
  return String(value ?? '')
    .toLowerCase()
    .replace(/[^a-z]/g, '')
}

function extractRiotScalingHints(ability, description, tooltip) {
  const hints = [
    ...(ability.leveltip?.label ?? []),
    ...(ability.leveltip?.effect ?? []),
    ability.tooltip,
    description,
    tooltip,
  ]
    .filter(Boolean)
    .flatMap((value) => String(value).match(/[A-Za-z]+/g) ?? [])
    .map((token) => token.toLowerCase())

  return [...new Set(hints)]
}

function describeAbilityRankScaling(ability) {
  return (ability.leveltip?.label ?? [])
    .map((label, index) => {
      const values = ability.leveltip?.effect?.[index]
      const displayValues = normalizeAbilityProgression(values)

      if (!displayValues) {
        return null
      }

      return {
        label,
        values: displayValues,
      }
    })
    .filter(Boolean)
}

function describeAbilityDetailRows(ability) {
  return dedupeAbilityRows([
    buildAbilityDetailRow('Cooldown', ability.cooldownBurn),
    buildAbilityResourceRow(ability),
    buildAbilityDetailRow('Range', ability.rangeBurn),
  ])
}

function buildAbilityDetailRow(label, value) {
  const normalizedValue = normalizeAbilityProgression(value)
  if (!normalizedValue) {
    return null
  }

  return { label, value: normalizedValue }
}

function buildAbilityResourceRow(ability) {
  const resourceText = formatAbilityText(ability.resource ?? '', ability)
  if (resourceText && /[\d%]/.test(resourceText)) {
    const [label, value] = splitAbilityDetailLine(resourceText)
    return {
      label: label || 'Cost',
      value: value || resourceText,
    }
  }

  const costValue = normalizeAbilityProgression(ability.costBurn)
  if (!costValue) {
    return null
  }

  const resourceSuffix = normalizeText(ability.costType ?? '').trim()
  return {
    label: 'Cost',
    value: `${costValue}${resourceSuffix}`.trim(),
  }
}

function describeAbilityEffectRows(tooltip, detailRows) {
  const blockedKeys = new Set(detailRows.map((row) => normalizeAbilityRowKey(row?.label)))

  return dedupeAbilityRows(
    tooltip
      .split('\n')
      .map((line) => parseAbilityEffectRow(line))
      .filter((row) => row && !blockedKeys.has(normalizeAbilityRowKey(row.label))),
  )
}

function parseAbilityEffectRow(line) {
  const normalizedLine = line.replace(/^[•-]\s*/, '').trim()
  if (!normalizedLine) {
    return null
  }

  const [label, value] = splitAbilityDetailLine(normalizedLine)
  if (!label || !value) {
    return null
  }

  if (!shouldKeepAbilityEffectRow(label, value)) {
    return null
  }

  return { label, value }
}

function splitAbilityDetailLine(line) {
  const detailMatch = line.match(/^([^:]{1,60}):\s*(.+)$/)
  if (!detailMatch) {
    return ['', '']
  }

  return [detailMatch[1].trim(), detailMatch[2].trim()]
}

function shouldKeepAbilityEffectRow(label, value) {
  const combinedText = `${label} ${value}`.trim()
  if (!/[\d%]/.test(combinedText)) {
    return false
  }

  if (/[{}[\]]/.test(combinedText) || /\b(?:undefined|null|nan)\b/i.test(combinedText)) {
    return false
  }

  return ABILITY_TOOLTIP_DETAIL_PATTERN.test(combinedText)
}

function dedupeAbilityRows(rows) {
  const seenRows = new Set()

  return rows.filter((row) => {
    if (!row?.label || !row.value) {
      return false
    }

    const rowKey = `${normalizeAbilityRowKey(row.label)}:${row.value.toLowerCase()}`
    if (seenRows.has(rowKey)) {
      return false
    }

    seenRows.add(rowKey)
    return true
  })
}

function normalizeAbilityRowKey(value) {
  return String(value ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
}

function buildScalingFromVar(variable) {
  const ratios = normalizeCoefficientNumbers(variable?.coeff)
  if (!ratios.length) {
    return null
  }

  const varLink = normalizeVarLink(variable?.link)
  const statDefinition = SCALING_STAT_DEFINITIONS.find((definition) => definition.varLinks.includes(varLink))
  if (!statDefinition) {
    return null
  }

  return createScalingEntry(statDefinition.key, inferStatTypeFromVarLink(varLink, statDefinition.key), ratios)
}

function findMerakiAbilityBySlot(merakiChampion, slot, abilityName) {
  const entries = merakiChampion?.abilities?.[slot] ?? []
  if (!entries.length) {
    return null
  }

  const normalizedAbilityName = normalizeAbilityName(abilityName)
  const matchingEntry = entries.find((entry) => normalizeAbilityName(entry?.name) === normalizedAbilityName)

  return matchingEntry ?? (entries.length === 1 ? entries[0] : null)
}

function normalizeAbilityName(value) {
  return normalizeText(value ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
}

function extractMerakiAbilityScaling(merakiAbility) {
  if (!merakiAbility) {
    return []
  }

  const matchedScalings = new Map()

  for (const effect of merakiAbility.effects ?? []) {
    for (const leveling of effect.leveling ?? []) {
      for (const modifier of leveling.modifiers ?? []) {
        const scaling = buildScalingFromMerakiModifier(modifier)
        if (scaling) {
          matchedScalings.set(scaling.id, scaling)
        }
      }
    }
  }

  const merakiText = buildMerakiAbilityText(merakiAbility)
  for (const scaling of extractScalingFromText(merakiText, { requireAdditiveContext: true })) {
    matchedScalings.set(scaling.id, matchedScalings.get(scaling.id) ?? scaling)
  }

  if (/based on level/i.test(merakiText)) {
    const levelScaling = createScalingFallbackEntry('championLevel')
    if (levelScaling) {
      matchedScalings.set(levelScaling.id, matchedScalings.get(levelScaling.id) ?? levelScaling)
    }
  }

  return [...matchedScalings.values()]
}

function buildScalingFromMerakiModifier(modifier) {
  const unitMatch = matchMerakiScalingUnit(modifier?.units ?? [])
  if (!unitMatch) {
    return null
  }

  const ratios = normalizeMerakiModifierRatios(modifier.values)
  if (!ratios.length) {
    return null
  }

  return createScalingEntry(unitMatch.stat, unitMatch.statType, ratios, unitMatch.label)
}

function matchMerakiScalingUnit(units) {
  const normalizedUnits = uniqueStrings(
    units
      .map((unit) => normalizeMerakiUnit(unit))
      .filter(Boolean),
  )

  for (const unit of normalizedUnits) {
    const matchingPattern = MERAKI_UNIT_PATTERNS.find((definition) => definition.pattern.test(unit))
    if (matchingPattern) {
      return matchingPattern
    }
  }

  return null
}

function normalizeMerakiUnit(value) {
  return String(value ?? '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}

function normalizeMerakiModifierRatios(values) {
  return uniqueNumbers(
    (Array.isArray(values) ? values : [values])
      .map((value) => Number(value))
      .filter((value) => Number.isFinite(value))
      .map((value) => value / 100),
  )
}

function buildMerakiAbilityText(merakiAbility) {
  return [
    merakiAbility.blurb,
    ...(merakiAbility.effects ?? []).map((effect) => effect.description),
  ]
    .filter(Boolean)
    .join('\n')
}

function inferStatTypeFromVarLink(varLink, statKey) {
  if (varLink.startsWith('bonus')) {
    return 'bonus'
  }

  if (varLink.startsWith('max')) {
    return 'max'
  }

  if (varLink.startsWith('missing')) {
    return 'missing'
  }

  if (varLink.includes('total')) {
    return 'total'
  }

  if (statKey === 'abilityPower' || statKey === 'attackDamage' || statKey === 'championLevel') {
    return 'total'
  }

  return 'total'
}

function extractScalingFromText(text, options = {}) {
  const scalings = []

  for (const definition of SCALING_TEXT_PATTERNS) {
    const matcher = new RegExp(definition.pattern.source, definition.pattern.flags)
    for (const match of text.matchAll(matcher)) {
      const [fullMatch, ratioText] = match
      if (!shouldKeepScalingTextMatch(text, match.index ?? 0, fullMatch, options)) {
        continue
      }

      const ratios = parseRatioList(ratioText)
      if (!ratios.length) {
        continue
      }

      const scaling = createScalingEntry(definition.stat, definition.statType, ratios, definition.label)
      if (scaling) {
        scalings.push(scaling)
      }
    }
  }

  return scalings
}

function shouldKeepScalingTextMatch(text, matchIndex, fullMatch, options = {}) {
  const before = text.slice(Math.max(0, matchIndex - 12), matchIndex).toLowerCase()
  const after = text.slice(matchIndex, matchIndex + fullMatch.length + 24).toLowerCase()

  if (options.requireAdditiveContext) {
    const hasAdditiveContext = /[+(]/.test(before) || /\bplus\s*$/.test(before)
    if (!hasAdditiveContext && !fullMatch.trim().startsWith('+')) {
      return false
    }
  }

  return !/\b(?:target(?:'s)?|enemy(?:'s)?|their)\b/.test(after)
}

function createScalingEntry(stat, statType, ratios, explicitLabel) {
  const statDefinition = SCALING_STAT_DEFINITIONS.find((definition) => definition.key === stat)
  if (!statDefinition || !ratios.length) {
    return null
  }

  const label = `${formatPercentRatios(ratios)} ${explicitLabel ?? formatScalingStatLabel(statDefinition, statType)}`

  return {
    id: `${stat}:${statType}:${label}`,
    stat,
    statType,
    ratio: ratios[0],
    ratios,
    label,
  }
}

function createScalingFallbackEntry(stat, statType = 'total') {
  const statDefinition = SCALING_STAT_DEFINITIONS.find((definition) => definition.key === stat)
  if (!statDefinition) {
    return null
  }

  const label = formatScalingStatLabel(statDefinition, statType)

  return {
    id: `${stat}:${statType}:fallback`,
    stat,
    statType,
    ratio: null,
    ratios: [],
    label,
  }
}

function formatScalingStatLabel(statDefinition, statType) {
  if (statDefinition.key === 'attackDamage') {
    if (statType === 'bonus') {
      return 'bonus AD'
    }

    if (statType === 'total') {
      return 'AD'
    }
  }

  if (statDefinition.key === 'abilityPower') {
    return 'AP'
  }

  if (statType === 'bonus') {
    return `bonus ${statDefinition.defaultLabel}`
  }

  if (statType === 'max') {
    return `max ${statDefinition.defaultLabel}`
  }

  if (statType === 'missing') {
    return `missing ${statDefinition.defaultLabel}`
  }

  return statDefinition.defaultLabel
}

function normalizeCoefficientNumbers(coeff) {
  return (Array.isArray(coeff) ? coeff : [coeff])
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value))
}

function parseRatioList(value) {
  return String(value ?? '')
    .split('/')
    .map((part) => Number(part.trim()) / 100)
    .filter((ratio) => Number.isFinite(ratio))
}

function formatPercentRatios(ratios) {
  return ratios.map((value) => `${trimTrailingZeroes(value * 100)}%`).join('/')
}

function uniqueNumbers(values) {
  const seenValues = new Set()

  return values.filter((value) => {
    const normalizedValue = Number(value)
    if (!Number.isFinite(normalizedValue) || seenValues.has(normalizedValue)) {
      return false
    }

    seenValues.add(normalizedValue)
    return true
  })
}

function uniqueStrings(values) {
  const seenValues = new Set()

  return values.filter((value) => {
    if (!value || seenValues.has(value)) {
      return false
    }

    seenValues.add(value)
    return true
  })
}

function normalizeAbilityProgression(value) {
  const text = normalizeText(Array.isArray(value) ? value.join(' / ') : value ?? '')
  if (!text) {
    return ''
  }

  const condensed = text.replace(/\s*\/\s*/g, ' / ').trim()
  if (!/[\d%]/.test(condensed)) {
    return ''
  }

  if (/[{}[\]]/.test(condensed) || /\b(?:undefined|null|nan)\b/i.test(condensed)) {
    return ''
  }

  return condensed
}

function trimTrailingZeroes(value) {
  return Number.isInteger(value) ? String(value) : value.toFixed(2).replace(/\.?0+$/, '')
}

function getRuneStyleDescription(styleId, styleName) {
  return (
    {
      8000: 'Improved attacks and sustained damage.',
      8100: 'Burst damage and target access.',
      8200: 'Empowered abilities and resource control.',
      8300: 'Creative tools and rule bending.',
      8400: 'Durability, crowd control, and resistances.',
    }[styleId] ??
    styleName
  )
}

function isSummonersRiftShopItem(item) {
  return Boolean(
    item.maps?.['11'] &&
      item.gold?.purchasable &&
      item.gold?.total > 0 &&
      item.inStore !== false &&
      item.hideFromAll !== true &&
      item.consumed !== true &&
      item.requiredAlly == null &&
      item.requiredChampion == null &&
      !item.tags?.includes('Consumable') &&
      !item.tags?.includes('Trinket'),
  )
}

function isCompletedBuildItem(item) {
  const isBoots = item.tags?.includes('Boots')
  const bootTier = item.depth ?? 1
  const hasUpgradePath = Array.isArray(item.into) && item.into.length > 0
  const isLaneStarter = item.tags?.includes('Lane')
  const isBasicJungleItem = item.tags?.includes('Jungle') && item.gold?.total < 1500
  const isBasicSupportItem = item.tags?.includes('GoldPer') && item.gold?.total < 1500
  const isEnhancedBoots = isBoots && bootTier > 2

  if (isBoots) {
    return !isEnhancedBoots
  }

  return !hasUpgradePath && !isLaneStarter && !isBasicJungleItem && !isBasicSupportItem
}

function isNotArenaPlaceholder(item) {
  return !item.name.includes('(Placeholder)') && Number(item.id) < 300000
}

function dedupeItemsByName(items) {
  const bestItemByName = new Map()

  for (const item of items) {
    const existingItem = bestItemByName.get(item.name)
    if (!existingItem || compareItemPriority(item, existingItem) > 0) {
      bestItemByName.set(item.name, item)
    }
  }

  return [...bestItemByName.values()]
}

function compareItemPriority(left, right) {
  const leftScore = getItemPriorityScore(left)
  const rightScore = getItemPriorityScore(right)

  if (leftScore !== rightScore) {
    return leftScore - rightScore
  }

  return Number(left.id) - Number(right.id)
}

function getItemPriorityScore(item) {
  return (item.depth ?? 0) * 10000 + (item.gold?.total ?? 0)
}

function buildFilterStats(itemStats, extraStats, cleanDescription) {
  const filters = new Set()

  for (const definition of BASE_STAT_DEFINITIONS) {
    if (!definition.itemKey) {
      continue
    }

    if (getItemStatValue(itemStats, definition.itemKey, definition.key) > 0) {
      filters.add(definition.key)
    }
  }

  if (extractMoveSpeedBonus(itemStats, cleanDescription) > 0 || extractPercentMoveSpeedBonus(itemStats, cleanDescription) > 0) {
    filters.add('moveSpeed')
  }

  if (getItemStatValue(itemStats, 'PercentAttackSpeedMod', 'attackSpeed') > 0) {
    filters.add('attackSpeed')
  }

  for (const definition of EXTRA_STAT_PATTERNS) {
    if ((extraStats[definition.key] ?? 0) > 0) {
      filters.add(definition.key)
    }
  }

  return [...filters]
}

function extractExtraStats(cleanDescription) {
  return Object.fromEntries(
    EXTRA_STAT_PATTERNS.map((definition) => [definition.key, sumMatches(cleanDescription, definition.regex)]),
  )
}

function extractMoveSpeedBonus(itemStats, cleanDescription) {
  const directValue = Number(itemStats?.FlatMovementSpeedMod ?? 0)
  if (directValue > 0) {
    return directValue
  }

  return sumMatches(cleanDescription, /(\d+(?:\.\d+)?)\s+Move Speed/gi, {
    ignorePercentValues: true,
  })
}

function extractPercentMoveSpeedBonus(itemStats, cleanDescription) {
  const directValue = Number(itemStats?.PercentMovementSpeedMod ?? 0)
  if (directValue > 0) {
    return directValue * 100
  }

  return sumMatches(cleanDescription, /(\d+(?:\.\d+)?)%\s+Move Speed/gi)
}

function getPercentMoveSpeed(items) {
  return items.reduce((total, item) => total + (item?.percentMoveSpeed ?? 0), 0)
}

function getItemStatValue(itemStats, statKey, definitionKey) {
  const rawValue = Number(itemStats?.[statKey] ?? 0)
  if (rawValue === 0) {
    return 0
  }

  if (definitionKey === 'attackSpeed' || definitionKey === 'critChance') {
    return rawValue * 100
  }

  return rawValue
}

function sumMatches(text, regex, options = {}) {
  const matcher = new RegExp(regex.source, regex.flags)
  let total = 0

  for (const match of text.matchAll(matcher)) {
    const fullMatch = match[0]
    if (options.ignorePercentValues && fullMatch.includes('%')) {
      continue
    }

    total += Number(match[1])
  }

  return total
}

function buildDataUrl(version, filename) {
  return `https://ddragon.leagueoflegends.com/cdn/${version}/data/${LOCALE}/${filename}`
}

function buildImageUrl(version, group, fileName) {
  return `https://ddragon.leagueoflegends.com/cdn/${version}/img/${group}/${fileName}`
}

async function fetchJson(url) {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}`)
  }

  return response.json()
}

function normalizeText(value) {
  if (!value) {
    return ''
  }

  const parser = new DOMParser()
  const document = parser.parseFromString(
    value
      .replaceAll('<br>', '\n')
      .replaceAll('<br />', '\n')
      .replaceAll('<li>', '\n- '),
    'text/html',
  )

  return document.body.textContent?.replace(/\s+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim() ?? ''
}
