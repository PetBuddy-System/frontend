import { DURATION_CONFIG_WEIGHT_RANGES, type WeightRange } from '~/shared/lib/catalog-pricing'

export const CATALOG_TYPES = ['AT_STORE', 'AT_HOME'] as const
export const PET_SPECIES = ['DOG', 'CAT', 'ALL'] as const

export const WEIGHT_RANGES = [
  'EXTRA_SMALL',
  'SMALL',
  ...DURATION_CONFIG_WEIGHT_RANGES
] as const satisfies readonly WeightRange[]
export const CATALOG_STATUSES = ['AVAILABLE', 'UNAVAILABLE'] as const
export const WEEK_DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'] as const

export type CatalogType = (typeof CATALOG_TYPES)[number]
export type PetSpecies = (typeof PET_SPECIES)[number]
export type CatalogStatus = (typeof CATALOG_STATUSES)[number]
export type WeekDay = (typeof WEEK_DAYS)[number]

export interface ApiResponse<T> {
  code?: number
  message?: string
  success?: boolean
  data: T
  timestamp?: string
}

export interface CatalogResponse {
  catalogId: number
  catalogName: string
  description?: string | null
  catalogType: CatalogType | string
  petSpecies: PetSpecies | string
  price: number
  weightRange?: WeightRange | string | null
  durationMinute: number
  bufferTime: number
  status: CatalogStatus | string
  durationConfig?: string | null
  additionalDurationConfig?: string | null
  additionalPricePerMinute?: number | null
  imageUrl?: string | null
  createdAt?: string | null
  updatedAt?: string | null
}

export type CatalogRequest = {
  catalogName: string
  description: string
  catalogType: CatalogType
  petSpecies: PetSpecies
  price: number
  weightRange?: WeightRange
  durationMinute: number
  bufferTime: number
  status: CatalogStatus
  additionalDurationConfig?: string
  additionalPricePerMinute?: number
  imageUrl?: string
}

export interface TimeSlotResponse {
  timeSlotId: number
  catalogId: number
  catalogName?: string
  durationMinute?: number
  dayOfWeek: WeekDay | string
  startTime: string
  isActive: boolean
  maxPets?: number | null
}

export type TimeSlotRequest = {
  catalogId: number
  dayOfWeek: WeekDay
  startTime: string
  isActive: boolean
  maxPets: number
}

export type TimeSlotUpdateRequest = Omit<TimeSlotRequest, 'catalogId'>

export interface AdminCatalog extends CatalogRequest {
  catalogId: number
  updatedAt: string
  icon: string
}

export interface AdminTimeSlot {
  timeSlotId: number
  catalogId: number
  dayOfWeek: WeekDay
  startTime: string
  isActive: boolean
  maxPets: number
}

const ICON_BY_CATALOG_TYPE: Record<CatalogType, string> = {
  AT_STORE: 'storefront',
  AT_HOME: 'home_pin'
}

function coerceCatalogType(value: string): CatalogType {
  return CATALOG_TYPES.includes(value as CatalogType) ? (value as CatalogType) : 'AT_STORE'
}

function coercePetSpecies(value: string): PetSpecies {
  return PET_SPECIES.includes(value as PetSpecies) ? (value as PetSpecies) : 'ALL'
}

function coerceCatalogStatus(value: string): CatalogStatus {
  return CATALOG_STATUSES.includes(value as CatalogStatus) ? (value as CatalogStatus) : 'UNAVAILABLE'
}

function coerceWeekDay(value: string): WeekDay {
  return WEEK_DAYS.includes(value as WeekDay) ? (value as WeekDay) : 'MONDAY'
}

function formatUpdatedAt(value?: string | null): string {
  if (!value) {
    return '--'
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat('vi-VN').format(date)
}

export function mapCatalogResponseToAdminCatalog(catalog: CatalogResponse): AdminCatalog {
  const catalogType = coerceCatalogType(catalog.catalogType)

  return {
    catalogId: catalog.catalogId,
    catalogName: catalog.catalogName,
    description: catalog.description ?? '',
    catalogType,
    petSpecies: coercePetSpecies(catalog.petSpecies),
    price: Number(catalog.price ?? 0),
    weightRange:
      catalog.weightRange && WEIGHT_RANGES.includes(catalog.weightRange as WeightRange)
        ? (catalog.weightRange as WeightRange)
        : undefined,
    durationMinute: Number(catalog.durationMinute ?? 0),
    bufferTime: Number(catalog.bufferTime ?? 0),
    status: coerceCatalogStatus(catalog.status),
    additionalDurationConfig: catalog.additionalDurationConfig ?? catalog.durationConfig ?? undefined,
    additionalPricePerMinute: Number(catalog.additionalPricePerMinute ?? 0),
    imageUrl: catalog.imageUrl ?? undefined,
    updatedAt: formatUpdatedAt(catalog.updatedAt ?? catalog.createdAt),
    icon: ICON_BY_CATALOG_TYPE[catalogType]
  }
}

export function mapTimeSlotResponseToAdminTimeSlot(slot: TimeSlotResponse): AdminTimeSlot {
  return {
    timeSlotId: slot.timeSlotId,
    catalogId: slot.catalogId,
    dayOfWeek: coerceWeekDay(slot.dayOfWeek),
    startTime: slot.startTime,
    isActive: Boolean(slot.isActive),
    maxPets: Number(slot.maxPets ?? 5)
  }
}

export function mapAdminCatalogToCatalogRequest(catalog: AdminCatalog): CatalogRequest {
  return {
    catalogName: catalog.catalogName,
    description: catalog.description,
    catalogType: catalog.catalogType,
    petSpecies: catalog.petSpecies,
    price: catalog.price,
    weightRange: catalog.weightRange as WeightRange | undefined,
    durationMinute: catalog.durationMinute,
    bufferTime: catalog.bufferTime,
    status: catalog.status,
    additionalDurationConfig: catalog.additionalDurationConfig,
    additionalPricePerMinute: catalog.additionalPricePerMinute,
    imageUrl: catalog.imageUrl
  }
}

export { DURATION_CONFIG_WEIGHT_RANGES }
