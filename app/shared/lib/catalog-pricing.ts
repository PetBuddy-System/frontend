export type WeightRange = 'EXTRA_SMALL' | 'SMALL' | 'MEDIUM' | 'LARGE' | 'EXTRA_LARGE' | 'EXTRA_EXTRA_LARGE'

export type SurchargeMap = Partial<Record<WeightRange, number>>

export const SURCHARGE_WEIGHT_RANGES = [
  'LARGE',
  'EXTRA_LARGE',
  'EXTRA_EXTRA_LARGE'
] as const satisfies readonly WeightRange[]

export interface PriceableCatalog {
  price: number
  surchargeConfig?: string | null
}

export function parseSurchargeConfig(config?: string | null): SurchargeMap {
  if (!config) {
    return {}
  }

  return config.split(';').reduce<SurchargeMap>((acc, entry) => {
    const [range, rawAmount] = entry.split(':')
    const amount = Number(rawAmount)

    if (isWeightRange(range) && Number.isFinite(amount) && amount > 0) {
      acc[range] = amount
    }

    return acc
  }, {})
}

export function serializeSurchargeConfig(surcharges: SurchargeMap): string | undefined {
  const config = SURCHARGE_WEIGHT_RANGES.map((range) => {
    const amount = Number(surcharges[range] ?? 0)

    return Number.isFinite(amount) && amount > 0 ? `${range}:${amount}` : null
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
  const surcharge = parseSurchargeConfig(catalog.surchargeConfig)[weightRange] ?? 0

  return {
    weightRange,
    basePrice,
    surcharge,
    totalPrice: basePrice + surcharge
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
