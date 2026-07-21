export type WeightRange = 'EXTRA_SMALL' | 'SMALL' | 'MEDIUM' | 'LARGE' | 'EXTRA_LARGE' | 'EXTRA_EXTRA_LARGE'

export type DurationConfigMap = Partial<Record<WeightRange, number>>

export const DURATION_CONFIG_WEIGHT_RANGES = [
  'MEDIUM',
  'LARGE',
  'EXTRA_LARGE',
  'EXTRA_EXTRA_LARGE'
] as const satisfies readonly WeightRange[]

export interface PriceableCatalog {
  price: number
  durationMinute?: number | null
  additionalDurationConfig?: string | null
  durationConfig?: string | null
  additionalPricePerMinute?: number | null
}

export function parseDurationConfig(config?: string | null): DurationConfigMap {
  if (!config) {
    return {}
  }

  return config.split(';').reduce<DurationConfigMap>((acc, entry) => {
    const [range, rawMinutes] = entry.split(':')
    const minutes = Number(rawMinutes)

    if (isWeightRange(range) && Number.isFinite(minutes) && minutes > 0) {
      acc[range] = minutes
    }

    return acc
  }, {})
}

export function serializeDurationConfig(durations: DurationConfigMap): string | undefined {
  const config = DURATION_CONFIG_WEIGHT_RANGES.map((range) => {
    const minutes = Number(durations[range] ?? 0)

    return Number.isFinite(minutes) && minutes > 0 ? `${range}:${minutes}` : null
  })
    .filter(Boolean)
    .join(';')

  return config.length > 0 ? config : undefined
}

export function getWeightRangeFromWeight(weight: number): WeightRange {
  if (weight < 5) {
    return 'EXTRA_SMALL'
  }

  if (weight < 8) {
    return 'SMALL'
  }

  if (weight < 12) {
    return 'MEDIUM'
  }

  if (weight < 18) {
    return 'LARGE'
  }

  if (weight < 25) {
    return 'EXTRA_LARGE'
  }

  return 'EXTRA_EXTRA_LARGE'
}

export function getCatalogPriceForWeight(catalog: PriceableCatalog, weight: number) {
  const weightRange = getWeightRangeFromWeight(weight)
  const basePrice = Number(catalog.price ?? 0)
  const additionalMinutes =
    parseDurationConfig(catalog.additionalDurationConfig ?? catalog.durationConfig)[weightRange] ?? 0
  const additionalPricePerMinute = Number(catalog.additionalPricePerMinute ?? 0)
  const additionalPrice = additionalMinutes * additionalPricePerMinute
  const durationMinute = Number(catalog.durationMinute ?? 0) + additionalMinutes

  return {
    weightRange,
    basePrice,
    additionalMinutes,
    additionalPricePerMinute,
    additionalPrice,
    durationMinute,
    totalPrice: basePrice + additionalPrice
  }
}

function isWeightRange(value: string | undefined): value is WeightRange {
  return (
    value === 'EXTRA_SMALL' ||
    value === 'SMALL' ||
    value === 'MEDIUM' ||
    value === 'LARGE' ||
    value === 'EXTRA_LARGE' ||
    value === 'EXTRA_EXTRA_LARGE'
  )
}
