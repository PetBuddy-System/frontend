import type { AdminUserResponse } from '../services/users'

const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/
const BACKEND_DATE_PATTERN = /^(\d{2})-(\d{2})-(\d{4})$/

const dateTimeFormatter = new Intl.DateTimeFormat('vi-VN', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false
})

function formatDateParts(year: string, month: string, day: string) {
  return `${day}-${month}-${year}`
}

export function toDateInputValue(value?: string) {
  if (!value) return ''

  const inputMatch = DATE_ONLY_PATTERN.exec(value)
  if (inputMatch) return value

  const backendMatch = BACKEND_DATE_PATTERN.exec(value)
  if (backendMatch) {
    const [, day, month, year] = backendMatch
    return `${year}-${month}-${day}`
  }

  return ''
}

export function formatAdminUserDate(value?: string) {
  if (!value) return '-'

  const inputMatch = DATE_ONLY_PATTERN.exec(value)
  if (inputMatch) {
    const [, year, month, day] = inputMatch
    return formatDateParts(year, month, day)
  }

  const backendMatch = BACKEND_DATE_PATTERN.exec(value)
  if (backendMatch) {
    const [, day, month, year] = backendMatch
    return formatDateParts(year, month, day)
  }

  return value
}

export function formatAdminUserDateTime(value?: string) {
  if (!value) return '-'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return dateTimeFormatter.format(date)
}

export function getUserInitials(user: Pick<AdminUserResponse, 'email' | 'fullName'>) {
  const source = user.fullName.trim() || user.email
  const parts = source.split(/\s+/).filter(Boolean)

  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
  }

  return source.slice(0, 2).toUpperCase()
}

export function normalizeAdminGender(value?: string) {
  if (!value) return ''

  const normalizedValue = value.trim().toUpperCase()
  if (normalizedValue === 'NAM' || normalizedValue === 'MALE') return 'MALE'
  if (normalizedValue === 'NỮ' || normalizedValue === 'NU' || normalizedValue === 'FEMALE') return 'FEMALE'
  if (normalizedValue === 'KHÁC' || normalizedValue === 'KHAC' || normalizedValue === 'OTHER') return 'OTHER'

  return normalizedValue
}

export function getAdminUserAvatarUrl(user?: AdminUserResponse | null) {
  return user?.mediaFiles?.find(
    (mediaFile) => mediaFile.mediaPurpose === 'USER_PROFILE' && mediaFile.mediaStatus === 'ACTIVE'
  )?.fileUrl
}

export function sortUsersByCreatedAtDesc(users: AdminUserResponse[]) {
  return [...users].sort((first, second) => {
    const firstTime = new Date(first.createdAt).getTime()
    const secondTime = new Date(second.createdAt).getTime()

    return (Number.isNaN(secondTime) ? 0 : secondTime) - (Number.isNaN(firstTime) ? 0 : firstTime)
  })
}
