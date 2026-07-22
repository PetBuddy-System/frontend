const VIETNAM_TIME_ZONE = 'Asia/Ho_Chi_Minh'
const VIETNAM_UTC_OFFSET_HOURS = 7
const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/
const JAVA_LOCAL_DATE_TIME_PATTERN = /^(\d{4})-(\d{2})-(\d{2})[T\s](\d{2}):(\d{2})(?::(\d{2})(?:\.\d{1,9})?)?$/

const localDateFormatter = new Intl.DateTimeFormat('vi-VN', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric'
})

const vietnamDateFormatter = new Intl.DateTimeFormat('vi-VN', {
  timeZone: VIETNAM_TIME_ZONE,
  day: '2-digit',
  month: '2-digit',
  year: 'numeric'
})

const vietnamDateTimeFormatter = new Intl.DateTimeFormat('vi-VN', {
  timeZone: VIETNAM_TIME_ZONE,
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false
})

function buildLocalDate(year: string, month: string, day: string) {
  return new Date(Number(year), Number(month) - 1, Number(day))
}

function buildVietnamDateTime(year: string, month: string, day: string, hour: string, minute: string, second = '0') {
  return new Date(
    Date.UTC(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hour) - VIETNAM_UTC_OFFSET_HOURS,
      Number(minute),
      Number(second)
    )
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

function formatDateTime(formatter: Intl.DateTimeFormat, date: Date) {
  const parts = formatter.formatToParts(date)
  const day = getDateTimePart(parts, 'day')
  const month = getDateTimePart(parts, 'month')
  const year = getDateTimePart(parts, 'year')
  const hour = getDateTimePart(parts, 'hour')
  const minute = getDateTimePart(parts, 'minute')
  const second = getDateTimePart(parts, 'second')

  return `${day}/${month}/${year} ${hour}:${minute}:${second}`
}

export function formatWorkScheduleDate(value?: string) {
  if (!value) return '-'

  const match = DATE_ONLY_PATTERN.exec(value)
  if (match) {
    const [, year, month, day] = match
    return localDateFormatter.format(buildLocalDate(year, month, day))
  }

  const date = parseBrowserDate(value)
  if (!date) return value

  return vietnamDateFormatter.format(date)
}

export function formatWorkScheduleDateTime(value?: string) {
  if (!value) return '-'

  const localDateTimeMatch = JAVA_LOCAL_DATE_TIME_PATTERN.exec(value)

  if (localDateTimeMatch) {
    const [, year, month, day, hour, minute, second] = localDateTimeMatch
    return formatDateTime(vietnamDateTimeFormatter, buildVietnamDateTime(year, month, day, hour, minute, second))
  }

  const date = parseBrowserDate(value)
  if (!date) return value

  return formatDateTime(vietnamDateTimeFormatter, date)
}
