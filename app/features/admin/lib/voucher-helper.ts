export function toDateTimeLocal(isoString: string) {
  if (!isoString) return ''
  try {
    const date = new Date(isoString.endsWith('Z') ? isoString : isoString + 'Z')
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day}T${hours}:${minutes}`
  } catch {
    return ''
  }
}

export function toISOString(datetimeLocal: string) {
  if (!datetimeLocal) return ''
  return new Date(datetimeLocal).toISOString()
}

export function deriveStatus(
  startAt: string,
  expiredAt: string,
  currentStatus: string
): 'ACTIVE' | 'INACTIVE' | 'EXPIRED' {
  if (!startAt || !expiredAt) return currentStatus as 'ACTIVE' | 'INACTIVE' | 'EXPIRED'
  const now = Date.now()
  const start = new Date(startAt).getTime()
  const end = new Date(expiredAt).getTime()
  if (now > end) return 'EXPIRED'
  if (now < start) return 'INACTIVE'
  return 'ACTIVE'
}
