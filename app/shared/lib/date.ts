export function formatDateTime(dateStr?: string | null): string {
  if (!dateStr) return '—'
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/)
  if (!match) return dateStr
  const [, year, month, day, hour, minute] = match
  return `${day}/${month}/${year} ${hour}:${minute}`
}

export function formatDateOnly(dateStr?: string | null): string {
  if (!dateStr) return '—'
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (!match) return dateStr
  const [, year, month, day] = match
  return `${day}/${month}/${year}`
}

export function formatTimeOnly(dateStr?: string | null): string {
  if (!dateStr) return ''
  const match = dateStr.match(/T(\d{2}):(\d{2})/)
  if (!match) return ''
  const [, hour, minute] = match
  return `${hour}:${minute}`
}