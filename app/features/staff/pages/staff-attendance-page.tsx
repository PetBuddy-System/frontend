import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { AttendanceMonthPicker } from '../components/attendance/attendance-month-picker'
import { AttendanceSummaryCards, type AttendanceSummary } from '../components/attendance/attendance-summary-cards'
import {
  AttendanceTable,
  type AttendanceRecord,
  type AttendanceStatus
} from '../components/attendance/attendance-table'
import { StaffSidebar } from '../components/layout/staff-sidebar'
import { StaffTopNav } from '../components/layout/staff-top-nav'
import { getStaffScheduleErrorMessage } from '../lib/staff-schedule-error'
import {
  formatStaffScheduleTime,
  parseDateInputValue,
  parseStaffScheduleDateTime,
  toDateInputValue
} from '../lib/staff-schedule-format'
import { staffScheduleApi, type StaffScheduleResponse } from '../services'

const monthFormatterByLanguage = {
  en: new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }),
  vi: new Intl.DateTimeFormat('vi-VN', { month: 'long', year: 'numeric' })
} as const

const dateLabelFormatterByLanguage = {
  en: new Intl.DateTimeFormat('en-US', {
    day: '2-digit',
    month: '2-digit',
    weekday: 'short'
  }),
  vi: new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    weekday: 'short'
  })
} as const

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function endOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0)
}

function addMonths(date: Date, months: number) {
  return new Date(date.getFullYear(), date.getMonth() + months, 1)
}

function getLanguageKey(language: string) {
  return language.startsWith('en') ? 'en' : 'vi'
}

function getScheduleHours(schedule: StaffScheduleResponse) {
  const checkIn = parseStaffScheduleDateTime(schedule.checkInAt)
  const checkOut = parseStaffScheduleDateTime(schedule.checkOutAt)

  if (!checkIn || !checkOut) return 0

  return Math.max((checkOut.getTime() - checkIn.getTime()) / 3_600_000, 0)
}

function formatHours(hours: number) {
  return hours.toLocaleString('vi-VN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: hours % 1 === 0 ? 0 : 1
  })
}

function getAttendanceStatus(schedule: StaffScheduleResponse): AttendanceStatus {
  if (schedule.attendanceStatus === 'ON_TIME') return 'onTime'
  if (schedule.attendanceStatus === 'LATE') return 'late'
  if (schedule.attendanceStatus === 'ABSENT') return 'absent'
  if (schedule.attendanceStatus === 'LEAVE') return 'leave'

  return 'pending'
}

function buildAttendanceSummary(schedules: StaffScheduleResponse[]): AttendanceSummary {
  const workedDates = new Set(
    schedules
      .filter(
        (schedule) =>
          schedule.checkInAt || schedule.attendanceStatus === 'ON_TIME' || schedule.attendanceStatus === 'LATE'
      )
      .map((schedule) => schedule.workDate)
  )
  const totalHours = schedules.reduce((total, schedule) => total + getScheduleHours(schedule), 0)
  const lateCount = schedules.filter((schedule) => schedule.attendanceStatus === 'LATE').length
  const dayOffCount = schedules.filter(
    (schedule) => schedule.attendanceStatus === 'ABSENT' || schedule.attendanceStatus === 'LEAVE'
  ).length

  return {
    daysOff: String(dayOffCount),
    lateEarly: String(lateCount),
    totalDays: String(workedDates.size),
    totalHours: formatHours(totalHours)
  }
}

function buildAttendanceRecords(schedules: StaffScheduleResponse[], language: string): AttendanceRecord[] {
  const languageKey = getLanguageKey(language)
  const dateLabelFormatter = dateLabelFormatterByLanguage[languageKey]

  return [...schedules]
    .sort((first, second) =>
      `${first.workDate} ${first.startTime}`.localeCompare(`${second.workDate} ${second.startTime}`)
    )
    .map((schedule) => {
      const workDate = parseDateInputValue(schedule.workDate)
      const hours = getScheduleHours(schedule)

      return {
        key: schedule.staffScheduleId,
        dayLabel: workDate ? dateLabelFormatter.format(workDate) : schedule.workDate,
        checkIn: formatStaffScheduleTime(schedule.checkInAt),
        checkOut: formatStaffScheduleTime(schedule.checkOutAt),
        totalHours: `${formatHours(hours)}h`,
        status: getAttendanceStatus(schedule),
        note: schedule.note
      }
    })
}

export function StaffAttendancePage() {
  const { i18n, t } = useTranslation('staff')
  const [selectedMonth, setSelectedMonth] = useState(() => startOfMonth(new Date()))
  const [schedules, setSchedules] = useState<StaffScheduleResponse[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'error'; text: string } | null>(null)
  const languageKey = getLanguageKey(i18n.language)
  const monthLabel = monthFormatterByLanguage[languageKey].format(selectedMonth)
  const fromDate = toDateInputValue(startOfMonth(selectedMonth))
  const toDate = toDateInputValue(endOfMonth(selectedMonth))
  const summary = useMemo(() => buildAttendanceSummary(schedules), [schedules])
  const records = useMemo(() => buildAttendanceRecords(schedules, i18n.language), [i18n.language, schedules])

  const loadAttendance = useCallback(async () => {
    setIsLoading(true)
    setMessage(null)

    try {
      const response = await staffScheduleApi.getMySchedules({ fromDate, toDate })
      setSchedules(response.data)
    } catch (error) {
      setMessage({
        type: 'error',
        text: getStaffScheduleErrorMessage(error, t, 'attendance.messages.loadFailed', 'list')
      })
    } finally {
      setIsLoading(false)
    }
  }, [fromDate, t, toDate])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Attendance history is loaded after the selected month changes.
    void loadAttendance()
  }, [loadAttendance])

  return (
    <div className='flex h-screen overflow-hidden bg-background text-foreground'>
      <StaffSidebar activeItem='attendanceHistory' />
      <div className='flex min-w-0 flex-1 flex-col overflow-hidden'>
        <StaffTopNav titleKey='attendance.pageTitle' subtitleKey='attendance.pageSubtitle' />
        <main className='flex-1 overflow-y-auto p-4 md:p-6'>
          <div className='mx-auto flex max-w-7xl flex-col gap-6'>
            {/* Header + Month Picker */}
            <div className='flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center'>
              <div>
                <h1 className='font-display text-2xl font-bold lg:text-3xl'>{t('attendance.heading')}</h1>
                <p className='mt-2 text-base text-muted-foreground'>{t('attendance.description')}</p>
              </div>
              <AttendanceMonthPicker
                monthLabel={monthLabel}
                onPreviousMonth={() => setSelectedMonth((current) => addMonths(current, -1))}
                onNextMonth={() => setSelectedMonth((current) => addMonths(current, 1))}
              />
            </div>

            {message ? (
              <div className='rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive'>
                {message.text}
              </div>
            ) : null}

            <AttendanceSummaryCards summary={summary} />

            <AttendanceTable isLoading={isLoading} records={records} />
          </div>
        </main>
      </div>
    </div>
  )
}
