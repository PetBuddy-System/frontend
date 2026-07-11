const VIETNAM_TIME_ZONE = 'Asia/Ho_Chi_Minh'
const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/
const JAVA_LOCAL_DATE_TIME_PATTERN =
  /^(\d{4})-(\d{2})-(\d{2})[T\s](\d{2}):(\d{2})(?::(\d{2})(?:\.\d{1,9})?)?$/

const dateFormatter = new Intl.DateTimeFormat('vi-VN', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric'
})

const weekdayFormatter = new Intl.DateTimeFormat('vi-VN', {
  weekday: 'short'
})

const monthYearFormatter = new Intl.DateTimeFormat('vi-VN', {
  month: 'long',
  year: 'numeric'
})

const dayOfMonthFormatter = new Intl.DateTimeFormat('vi-VN', {
  day: '2-digit'
})

const dateTimeFormatter = new Intl.DateTimeFormat('vi-VN', {
  timeZone: VIETNAM_TIME_ZONE,
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false
})

function toDatePart(value: number) {
  return String(value).padStart(2, '0')
}

function buildLocalDate(year: string, month: string, day: string) {
  return new Date(Number(year), Number(month) - 1, Number(day))
}

function buildUtcDateTime(
  year: string,
  month: string,
  day: string,
  hour: string,
  minute: string,
  second = '0'
) {
  return new Date(
    Date.UTC(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute), Number(second))
  )
}

function parseBrowserDate(value: string) {
  const normalizedValue = value.replace(/(\.\d{3})\d+([Zz]|[+-]\d{2}:?\d{2})$/, '$1$2')
  const date = new Date(normalizedValue)

  return Number.isNaN(date.getTime()) ? null : date
}

function getDateTimePart(parts: Intl.DateTimeFormatPart[], type: string) {
  return parts.find((part) => part.type === type)?.value ?? ''
}

function formatDateTimeParts(date: Date) {
  const parts = dateTimeFormatter.formatToParts(date)
  const day = getDateTimePart(parts, 'day')
  const month = getDateTimePart(parts, 'month')
  const year = getDateTimePart(parts, 'year')
  const hour = getDateTimePart(parts, 'hour')
  const minute = getDateTimePart(parts, 'minute')
  const second = getDateTimePart(parts, 'second')

  return `${day}/${month}/${year} ${hour}:${minute}:${second}`
}

export function toDateInputValue(date: Date) {
  return `${date.getFullYear()}-${toDatePart(date.getMonth() + 1)}-${toDatePart(date.getDate())}`
}

export function startOfWeek(date: Date) {
  const nextDate = new Date(date)
  const day = nextDate.getDay()
  const diff = day === 0 ? -6 : 1 - day
  nextDate.setDate(nextDate.getDate() + diff)
  nextDate.setHours(0, 0, 0, 0)

  return nextDate
}

export function addDays(date: Date, days: number) {
  const nextDate = new Date(date)
  nextDate.setDate(nextDate.getDate() + days)

  return nextDate
}

export function getDaysBetween(fromDate: Date, toDate: Date) {
  const days: Date[] = []
  const cursor = new Date(fromDate)

  while (cursor <= toDate) {
    days.push(new Date(cursor))
    cursor.setDate(cursor.getDate() + 1)
  }

  return days
}

export function parseDateInputValue(value: string) {
  const match = DATE_ONLY_PATTERN.exec(value)
  if (!match) return null

  const [, year, month, day] = match
  return buildLocalDate(year, month, day)
}

export function formatStaffScheduleDate(value?: string) {
  if (!value) return '-'

  const match = DATE_ONLY_PATTERN.exec(value)
  if (match) {
    const [, year, month, day] = match
    return dateFormatter.format(buildLocalDate(year, month, day))
  }

  const date = parseBrowserDate(value)
  if (!date) return value

  return dateFormatter.format(date)
}

export function formatStaffScheduleDateTime(value?: string) {
  if (!value) return '-'

  const localDateTimeMatch = JAVA_LOCAL_DATE_TIME_PATTERN.exec(value)

  if (localDateTimeMatch) {
    const [, year, month, day, hour, minute, second] = localDateTimeMatch
    return formatDateTimeParts(buildUtcDateTime(year, month, day, hour, minute, second))
  }

  const date = parseBrowserDate(value)
  if (!date) return value

  return formatDateTimeParts(date)
}

export function formatWeekday(date: Date) {
  return weekdayFormatter.format(date)
}

export function formatStaffScheduleMonthYear(date: Date) {
  return monthYearFormatter.format(date)
}

export function formatStaffScheduleDay(date: Date) {
  return dayOfMonthFormatter.format(date)
}
