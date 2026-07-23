import { isAxiosError } from 'axios'
import type { TFunction } from 'i18next'

interface ErrorInfo {
  code: number | null
  message: string | null
  status: number | null
}

type StaffShiftRegistrationErrorContext = 'periods' | 'registration'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function extractMessage(data: unknown) {
  if (!isRecord(data)) return null

  if (typeof data.message === 'string') return data.message
  if (typeof data.error === 'string') return data.error

  return null
}

function extractCode(data: unknown) {
  if (!isRecord(data)) return null

  if (typeof data.code === 'number') return data.code
  if (typeof data.code === 'string') {
    const parsedCode = Number(data.code)
    return Number.isNaN(parsedCode) ? null : parsedCode
  }

  return null
}

function extractErrorInfo(error: unknown): ErrorInfo {
  if (isAxiosError(error)) {
    return {
      code: extractCode(error.response?.data),
      message: extractMessage(error.response?.data) ?? error.message,
      status: error.response?.status ?? null
    }
  }

  if (error instanceof Error) {
    return {
      code: null,
      message: error.message,
      status: null
    }
  }

  return { code: null, message: null, status: null }
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

function resolveMessageKey(info: ErrorInfo, context: StaffShiftRegistrationErrorContext) {
  const normalizedMessage = info.message ? normalizeMessage(info.message) : ''

  const keyByCode: Record<number, string> = {
    9026: 'shiftRegistration.errors.notFound',
    9028: 'shiftRegistration.errors.periodClosed',
    9029: 'shiftRegistration.errors.notOpen',
    9030: 'shiftRegistration.errors.expired',
    9031: 'shiftRegistration.errors.emptyRegistration',
    9032: 'shiftRegistration.errors.alreadyExists',
    9033: 'shiftRegistration.errors.workDateRequired',
    9034: 'shiftRegistration.errors.shiftTypeRequired',
    9035: 'shiftRegistration.errors.workDateOutOfPeriod',
    9036: 'shiftRegistration.errors.customTimeRequired',
    9037: 'shiftRegistration.errors.customReasonRequired',
    9038: 'shiftRegistration.errors.invalidCustomTime',
    9039: 'shiftRegistration.errors.duplicateRegistration',
    9040: 'shiftRegistration.errors.customFieldsNotAllowed'
  }

  if (info.code && keyByCode[info.code]) {
    return keyByCode[info.code]
  }

  if (normalizedMessage.includes('registration period is closed')) {
    return 'shiftRegistration.errors.periodClosed'
  }

  if (normalizedMessage.includes('registration is not open')) {
    return 'shiftRegistration.errors.notOpen'
  }

  if (normalizedMessage.includes('registration has expired')) {
    return 'shiftRegistration.errors.expired'
  }

  if (normalizedMessage.includes('does not exist') || info.status === 404) {
    return 'shiftRegistration.errors.notFound'
  }

  if (normalizedMessage.includes('list must not be empty')) {
    return 'shiftRegistration.errors.emptyRegistration'
  }

  if (normalizedMessage.includes('already registered')) {
    return 'shiftRegistration.errors.alreadyExists'
  }

  if (normalizedMessage.includes('work date is required')) {
    return 'shiftRegistration.errors.workDateRequired'
  }

  if (normalizedMessage.includes('shift type is required')) {
    return 'shiftRegistration.errors.shiftTypeRequired'
  }

  if (normalizedMessage.includes('within the registration work period')) {
    return 'shiftRegistration.errors.workDateOutOfPeriod'
  }

  if (normalizedMessage.includes('custom shift start time and end time are required')) {
    return 'shiftRegistration.errors.customTimeRequired'
  }

  if (normalizedMessage.includes('custom shift reason is required')) {
    return 'shiftRegistration.errors.customReasonRequired'
  }

  if (normalizedMessage.includes('duplicate shift registration')) {
    return 'shiftRegistration.errors.duplicateRegistration'
  }

  if (normalizedMessage.includes('custom shift fields are only allowed')) {
    return 'shiftRegistration.errors.customFieldsNotAllowed'
  }

  if (normalizedMessage.includes('start') && normalizedMessage.includes('end')) {
    return 'shiftRegistration.errors.invalidCustomTime'
  }

  if (info.status === 403) {
    return context === 'periods' ? 'shiftRegistration.errors.periodForbidden' : 'shiftRegistration.errors.forbidden'
  }
  if (info.status && info.status >= 500) return 'shiftRegistration.errors.server'
  if (!info.status && !info.message) return 'shiftRegistration.errors.network'
  if (info.status === 400 && (!info.message || isGenericHttpMessage(info.message))) {
    return 'shiftRegistration.errors.badRequest'
  }

  return null
}

export function getStaffShiftRegistrationErrorMessage(
  error: unknown,
  t: TFunction,
  fallbackKey: string,
  context: StaffShiftRegistrationErrorContext = 'registration'
) {
  const info = extractErrorInfo(error)
  const resolvedKey = resolveMessageKey(info, context)

  if (resolvedKey) return t(resolvedKey)
  if (info.message && !isGenericHttpMessage(info.message)) return info.message

  return t(fallbackKey)
}
