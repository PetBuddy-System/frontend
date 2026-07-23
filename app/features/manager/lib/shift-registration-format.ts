const TIME_PATTERN = /^(\d{2}):(\d{2})(?::\d{2})?$/

export function formatShiftRegistrationTime(value?: string | null) {
  if (!value) return '-'

  const match = TIME_PATTERN.exec(value)
  if (!match) return value

  return `${match[1]}:${match[2]}`
}

export function formatShiftRegistrationDateRange(fromDate?: string, toDate?: string) {
  if (!fromDate && !toDate) return '-'
  if (fromDate === toDate) return fromDate ?? '-'

  return `${fromDate ?? '-'} - ${toDate ?? '-'}`
}

export function buildRegistrationPeriodSummary(workFromDate?: string, workToDate?: string) {
  return formatShiftRegistrationDateRange(workFromDate, workToDate)
}
