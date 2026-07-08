export const STAT_SHARD_ROWS = [
  {
    key: 'offense',
    name: 'Offense',
    description: 'Pick a damage-focused shard.',
    options: [
      {
        id: 'offense-adaptive-force',
        name: 'Adaptive Force',
        description: '+9 Adaptive Force',
        icon: 'mdi-star-four-points',
      },
      {
        id: 'offense-attack-speed',
        name: 'Attack Speed',
        description: '+10% Attack Speed',
        icon: 'mdi-weather-windy',
      },
      {
        id: 'offense-ability-haste',
        name: 'Ability Haste',
        description: '+8 Ability Haste',
        icon: 'mdi-timer-outline',
      },
    ],
  },
  {
    key: 'flex',
    name: 'Flex',
    description: 'Choose a versatile mid-line bonus.',
    options: [
      {
        id: 'flex-adaptive-force',
        name: 'Adaptive Force',
        description: '+9 Adaptive Force',
        icon: 'mdi-star-four-points',
      },
      {
        id: 'flex-move-speed',
        name: 'Move Speed',
        description: '+2% Move Speed',
        icon: 'mdi-run-fast',
      },
      {
        id: 'flex-health-scaling',
        name: 'Health Scaling',
        description: '+10-180 Health (based on level)',
        icon: 'mdi-heart-plus',
      },
    ],
  },
  {
    key: 'defense',
    name: 'Defense',
    description: 'Round out your defenses.',
    options: [
      {
        id: 'defense-health',
        name: 'Health',
        description: '+65 Health',
        icon: 'mdi-heart',
      },
      {
        id: 'defense-armor',
        name: 'Armor',
        description: '+10 Armor',
        icon: 'mdi-shield-outline',
      },
      {
        id: 'defense-magic-resist',
        name: 'Magic Resist',
        description: '+10 Magic Resist',
        icon: 'mdi-shield-star-outline',
      },
    ],
  },
]

const PATH_THEMES = {
  8000: {
    accent: '#e0b96b',
    glow: 'rgba(224, 185, 107, 0.35)',
    preview: 'Balanced combat patterns with empowered attacks and steady damage windows.',
  },
  8100: {
    accent: '#d35a6a',
    glow: 'rgba(211, 90, 106, 0.35)',
    preview: 'Aggressive access, burst pressure, and fast target takedowns.',
  },
  8200: {
    accent: '#6ebdf5',
    glow: 'rgba(110, 189, 245, 0.35)',
    preview: 'Spell amplification, pacing tools, and ability-oriented setups.',
  },
  8300: {
    accent: '#73d5c1',
    glow: 'rgba(115, 213, 193, 0.35)',
    preview: 'Rule-bending utility, economy tools, and flexible problem solving.',
  },
  8400: {
    accent: '#8bb377',
    glow: 'rgba(139, 179, 119, 0.35)',
    preview: 'Resilience, control, and front-line survivability.',
  },
}

export function getRunePathTheme(pathId) {
  return PATH_THEMES[pathId] ?? {
    accent: '#d6c7a0',
    glow: 'rgba(214, 199, 160, 0.28)',
    preview: 'Shape a rune page around a focused combat identity.',
  }
}
