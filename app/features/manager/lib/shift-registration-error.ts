import { isAxiosError } from 'axios'
import type { TFunction } from 'i18next'

interface ShiftRegistrationErrorInfo {
  code: number | null
  message: string | null
  status: number | null
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function extractErrorInfo(error: unknown): ShiftRegistrationErrorInfo {
  if (isAxiosError(error)) {
    const data = error.response?.data
    const code = isRecord(data) && typeof data.code === 'number' ? data.code : null
    const message = isRecord(data) && typeof data.message === 'string' ? data.message : error.message

    return {
      code,
      message,
      status: error.response?.status ?? null
    }
  }

  if (error instanceof Error) {
    const errorWithMeta = error as Error & { code?: unknown; status?: unknown }

    return {
      code: typeof errorWithMeta.code === 'number' ? errorWithMeta.code : null,
      message: error.message,
      status: typeof errorWithMeta.status === 'number' ? errorWithMeta.status : null
    }
  }

  return { code: null, message: null, status: null }
}

function isGenericHttpMessage(message: string) {
  const normalizedMessage = message.toLowerCase()

  return (
    /^request failed with status code \d+$/.test(normalizedMessage) ||
    normalizedMessage === 'bad request' ||
    normalizedMessage === 'not found' ||
    normalizedMessage === 'internal server error'
  )
}

function normalizeMessage(message: string) {
  return message.toLowerCase()
}

function resolveErrorKey(info: ShiftRegistrationErrorInfo) {
  const message = info.message ? normalizeMessage(info.message) : ''

  switch (info.code) {
    case 9024:
      return 'invalidRegistrationTime'
    case 9025:
      return 'invalidRegisterCloseTime'
    case 9026:
      return 'notFound'
    case 9027:
      return 'registrationPeriodExists'
    case 9028:
      return 'registrationPeriodClosed'
    case 9029:
      return 'registrationNotOpen'
    case 9030:
      return 'registrationExpired'
    default:
      break
  }

  if (message.includes('open time') && message.includes('close time')) return 'invalidRegistrationTime'
  if (message.includes('close time') && message.includes('work period')) return 'invalidRegisterCloseTime'
  if (message.includes('does not exist') || message.includes('not existed')) return 'notFound'
  if (message.includes('already exists')) return 'registrationPeriodExists'
  if (message.includes('period is closed')) return 'registrationPeriodClosed'
  if (message.includes('registration is not open')) return 'registrationNotOpen'
  if (message.includes('registration has expired')) return 'registrationExpired'
  if (message.includes('invalid date range') || message.includes('working time')) return 'invalidDateRange'

  if (info.status === 403) return 'forbidden'
  if (info.status === 404) return 'notFound'
  if (info.status && info.status >= 500) return 'server'

  return null
}

export function getShiftRegistrationErrorMessage(error: unknown, t: TFunction, fallbackKey: string) {
  const info = extractErrorInfo(error)
  const errorKey = resolveErrorKey(info)

  if (errorKey) {
    return t(`shiftRegistration.errors.${errorKey}`)
  }

  if (info.message && !isGenericHttpMessage(info.message)) return info.message
  if (!info.message) return t('shiftRegistration.errors.network')

  return t(fallbackKey)
}
