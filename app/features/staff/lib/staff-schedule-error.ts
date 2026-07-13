import { isAxiosError } from 'axios'
import type { TFunction } from 'i18next'

type StaffScheduleErrorContext = 'checkIn' | 'checkOut' | 'detail' | 'list'

interface ErrorInfo {
  message: string | null
  status: number | null
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function extractMessage(data: unknown) {
  if (!isRecord(data)) return null

  if (typeof data.message === 'string') return data.message
  if (typeof data.error === 'string') return data.error

  return null
}

function extractErrorInfo(error: unknown): ErrorInfo {
  if (isAxiosError(error)) {
    return {
      message: extractMessage(error.response?.data) ?? error.message,
      status: error.response?.status ?? null
    }
  }

  if (error instanceof Error) {
    const errorWithResponse = error as Error & {
      data?: unknown
      status?: number
    }

    return {
      message: extractMessage(errorWithResponse.data) ?? error.message,
      status: typeof errorWithResponse.status === 'number' ? errorWithResponse.status : null
    }
  }

  return { message: null, status: null }
}

function normalizeMessage(message: string) {
  return message
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

function isGenericHttpMessage(message: string) {
  const normalizedMessage = normalizeMessage(message)

  return (
    /^request failed with status code \d+$/.test(normalizedMessage) ||
    normalizedMessage === 'bad request' ||
    normalizedMessage === 'not found' ||
    normalizedMessage === 'internal server error'
  )
}

function resolveFallbackKey(info: ErrorInfo, context: StaffScheduleErrorContext) {
  if (info.status === 404) return 'staffSchedule.errors.notFound'
  if (info.status === 403) return 'staffSchedule.errors.forbidden'
  if (info.status && info.status >= 500) return 'staffSchedule.errors.server'
  if (info.status === 400 && context === 'checkIn') return 'staffSchedule.errors.checkInNotAllowed'
  if (info.status === 400 && context === 'checkOut') return 'staffSchedule.errors.checkOutRequiresCheckIn'
  if (info.status === 400) return 'staffSchedule.errors.badRequest'
  if (!info.status && !info.message) return 'staffSchedule.errors.network'

  return null
}

export function getStaffScheduleErrorMessage(
  error: unknown,
  t: TFunction,
  fallbackKey: string,
  context: StaffScheduleErrorContext
) {
  const info = extractErrorInfo(error)

  if (info.message && !isGenericHttpMessage(info.message)) {
    return info.message
  }

  const resolvedFallbackKey = resolveFallbackKey(info, context)

  return t(resolvedFallbackKey ?? fallbackKey)
}
