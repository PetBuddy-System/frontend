import { isAxiosError } from 'axios'
import type { TFunction } from 'i18next'

type WorkScheduleErrorContext = 'assign' | 'create' | 'detail' | 'overview' | 'reassign' | 'remove' | 'update'

interface ErrorInfo {
  message: string | null
  status: number | null
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function getFirstErrorMessage(errors: unknown) {
  if (typeof errors === 'string') return errors

  if (Array.isArray(errors)) {
    return errors.find((error): error is string => typeof error === 'string') ?? null
  }

  if (isRecord(errors)) {
    const firstValue = Object.values(errors)[0]

    if (typeof firstValue === 'string') return firstValue
    if (Array.isArray(firstValue)) {
      return firstValue.find((error): error is string => typeof error === 'string') ?? null
    }
  }

  return null
}

function extractMessage(data: unknown) {
  if (!isRecord(data)) return null

  if (typeof data.message === 'string') return data.message
  if (typeof data.error === 'string') return data.error

  return getFirstErrorMessage(data.errors)
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

function hasAny(normalizedMessage: string, keywords: string[]) {
  return keywords.some((keyword) => normalizedMessage.includes(keyword))
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

function resolveErrorKey(info: ErrorInfo, context: WorkScheduleErrorContext) {
  const message = info.message ? normalizeMessage(info.message) : ''

  if (info.status === 404 || hasAny(message, ['not found', 'khong tim thay', 'khong ton tai'])) {
    return 'notFound'
  }

  if (
    context === 'overview' &&
    hasAny(message, ['from date', 'to date', 'date range', 'khoang thoi gian', 'tu ngay', 'den ngay'])
  ) {
    return 'invalidDateRange'
  }

  if (
    hasAny(message, ['end time', 'start time', 'gio ket thuc', 'gio bat dau']) &&
    hasAny(message, ['before', 'after', 'sau', 'truoc', 'invalid', 'khong hop le'])
  ) {
    return 'invalidTime'
  }

  if (
    context === 'reassign' &&
    hasAny(message, ['same', 'duplicate', 'trung', 'da ton tai', 'da co']) &&
    hasAny(message, ['staff', 'nhan vien'])
  ) {
    return 'duplicateStaff'
  }

  if (
    (context === 'assign' || context === 'reassign' || context === 'update') &&
    hasAny(message, ['staff', 'nhan vien']) &&
    hasAny(message, [
      'conflict',
      'overlap',
      'duplicate',
      'trung',
      'da co lich',
      'co ca',
      'khung gio',
      'schedule',
      'lich'
    ])
  ) {
    return 'staffConflict'
  }

  if (
    hasAny(message, ['duplicate', 'already exists', 'already existed', 'exist', 'trung', 'ton tai', 'da co']) &&
    hasAny(message, ['schedule', 'lich'])
  ) {
    return 'duplicateSchedule'
  }

  if (
    (context === 'update' || context === 'assign' || context === 'reassign') &&
    hasAny(message, ['started', 'already start', 'begun', 'bat dau', 'toi ngay', 'dang dien ra', 'completed'])
  ) {
    return 'updateLocked'
  }

  if (
    context === 'remove' &&
    hasAny(message, ['status', 'scheduled', 'remove', 'delete', 'cancel', 'xoa', 'huy']) &&
    hasAny(message, ['not', 'only', 'khong', 'chi'])
  ) {
    return 'invalidRemoveStatus'
  }

  if (info.status === 400) return 'badRequest'
  if (info.status === 403) return 'forbidden'
  if (info.status && info.status >= 500) return 'server'

  return null
}

export function getWorkScheduleErrorMessage(
  error: unknown,
  t: TFunction,
  fallbackKey: string,
  context: WorkScheduleErrorContext
) {
  const info = extractErrorInfo(error)
  const errorKey = resolveErrorKey(info, context)

  if (errorKey) {
    return t(`staffSchedule.workSchedules.errors.${errorKey}`)
  }

  if (info.message && !isGenericHttpMessage(info.message)) {
    return info.message
  }

  if (!info.status && !info.message) {
    return t('staffSchedule.workSchedules.errors.network')
  }

  return t(fallbackKey)
}
