import { isAxiosError } from 'axios'
import type { TFunction } from 'i18next'

type PetProfileErrorContext = 'create' | 'detail' | 'list' | 'update'

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

function isGenericHttpMessage(message: string) {
  const normalizedMessage = message.toLowerCase()

  return (
    /^request failed with status code \d+$/.test(normalizedMessage) ||
    normalizedMessage === 'bad request' ||
    normalizedMessage === 'not found' ||
    normalizedMessage === 'internal server error'
  )
}

function getFallbackKey(info: ErrorInfo, context: PetProfileErrorContext) {
  if (info.status === 404) return 'petProfiles.errors.notFound'
  if (info.status === 403) return 'petProfiles.errors.forbidden'
  if (info.status && info.status >= 500) return 'petProfiles.errors.server'
  if (info.status === 400) return 'petProfiles.errors.badRequest'
  if (!info.status && !info.message) return 'petProfiles.errors.network'

  return `petProfiles.messages.${context}Failed`
}

export function getPetProfileErrorMessage(
  error: unknown,
  t: TFunction,
  context: PetProfileErrorContext
) {
  const info = extractErrorInfo(error)

  if (info.message && !isGenericHttpMessage(info.message)) {
    return info.message
  }

  return t(getFallbackKey(info, context))
}
