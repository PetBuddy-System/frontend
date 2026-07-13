import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'

import { cn } from '~/shared/lib/cn'
import { Button, MaterialIcon } from '~/shared/ui'

import { StaffSidebar } from '../components/layout/staff-sidebar'
import { StaffTopNav } from '../components/layout/staff-top-nav'
import {
  addDays,
  formatStaffScheduleDay,
  formatStaffScheduleMonthYear,
  formatWeekday,
  getDaysBetween,
  parseDateInputValue,
  startOfWeek,
  toDateInputValue
} from '../lib/staff-schedule-format'
import { getStaffScheduleErrorMessage } from '../lib/staff-schedule-error'
import {
  getStaffAttendanceStatusClassName,
  getStaffScheduleShiftClassName,
  getStaffScheduleStatusClassName
} from '../lib/staff-schedule-style'
import {
  staffScheduleApi,
  type StaffScheduleResponse,
  type StaffScheduleStatus
} from '../services'

const STATUS_OPTIONS: Array<StaffScheduleStatus | 'ALL'> = [
  'ALL',
  'SCHEDULED',
  'WORKING',
  'COMPLETED',
  'CANCELLED'
]

function groupSchedulesByDate(schedules: StaffScheduleResponse[]) {
  return schedules.reduce<Record<string, StaffScheduleResponse[]>>((groups, schedule) => {
    groups[schedule.workDate] = [...(groups[schedule.workDate] ?? []), schedule]
    return groups
  }, {})
}

function sortSchedules(schedules: StaffScheduleResponse[]) {
  return [...schedules].sort((first, second) => first.startTime.localeCompare(second.startTime))
}

function getRangeTitle(fromDate: Date, toDate: Date) {
  const fromTitle = formatStaffScheduleMonthYear(fromDate)
  const toTitle = formatStaffScheduleMonthYear(toDate)

  return fromTitle === toTitle ? fromTitle : `${fromTitle} - ${toTitle}`
}

export function StaffWeeklySchedulePage() {
  const { t } = useTranslation('staff')
  const navigate = useNavigate()
  const todayWeekStart = startOfWeek(new Date())
  const [fromDate, setFromDate] = useState(() => toDateInputValue(todayWeekStart))
  const [toDate, setToDate] = useState(() => toDateInputValue(addDays(todayWeekStart, 6)))
  const [statusFilter, setStatusFilter] = useState<StaffScheduleStatus | 'ALL'>('ALL')
  const [schedules, setSchedules] = useState<StaffScheduleResponse[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'error'; text: string } | null>(null)

  const rangeStart = parseDateInputValue(fromDate) ?? todayWeekStart
  const rangeEnd = parseDateInputValue(toDate) ?? addDays(todayWeekStart, 6)
  const isInvalidRange = toDate < fromDate
  const rangeDays = useMemo(
    () => (isInvalidRange ? [] : getDaysBetween(rangeStart, rangeEnd)),
    [isInvalidRange, rangeEnd, rangeStart]
  )
  const groupedSchedules = useMemo(() => groupSchedulesByDate(schedules), [schedules])
  const stats = useMemo(
    () => ({
      total: schedules.length,
      scheduled: schedules.filter((schedule) => schedule.scheduleStatus === 'SCHEDULED').length,
      working: schedules.filter((schedule) => schedule.scheduleStatus === 'WORKING').length,
      completed: schedules.filter((schedule) => schedule.scheduleStatus === 'COMPLETED').length
    }),
    [schedules]
  )

  const loadSchedules = useCallback(async () => {
    setIsLoading(true)
    setMessage(null)

    if (isInvalidRange) {
      setSchedules([])
      setMessage({ type: 'error', text: t('staffSchedule.errors.invalidDateRange') })
      setIsLoading(false)
      return
    }

    try {
      const response = await staffScheduleApi.getMySchedules({
        fromDate,
        toDate,
        scheduleStatus: statusFilter
      })

      setSchedules(response.data)
    } catch (error) {
      setMessage({
        type: 'error',
        text: getStaffScheduleErrorMessage(error, t, 'staffSchedule.messages.loadFailed', 'list')
      })
    } finally {
      setIsLoading(false)
    }
  }, [fromDate, isInvalidRange, statusFilter, t, toDate])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Schedule list is synchronized after filter changes.
    void loadSchedules()
  }, [loadSchedules])

  function handleMoveRange(days: number) {
    const currentStart = parseDateInputValue(fromDate) ?? todayWeekStart
    const currentEnd = parseDateInputValue(toDate) ?? addDays(currentStart, 6)

    setFromDate(toDateInputValue(addDays(currentStart, days)))
    setToDate(toDateInputValue(addDays(currentEnd, days)))
  }

  function handleShowCurrentWeek() {
    setFromDate(toDateInputValue(todayWeekStart))
    setToDate(toDateInputValue(addDays(todayWeekStart, 6)))
  }

  return (
    <div className='flex h-screen overflow-hidden bg-background text-foreground'>
      <StaffSidebar activeItem='weeklySchedule' />
      <div className='flex min-w-0 flex-1 flex-col overflow-hidden'>
        <StaffTopNav titleKey='staffSchedule.pageTitle' subtitleKey='staffSchedule.pageSubtitle' />
        <main className='flex-1 overflow-y-auto p-4 md:p-6'>
          <div className='mx-auto flex max-w-7xl flex-col gap-6'>
            <section className='flex flex-col gap-4 border-b border-border pb-6 lg:flex-row lg:items-center lg:justify-between'>
              <div>
                <h1 className='font-display text-2xl font-bold text-card-foreground lg:text-3xl'>
                  {t('staffSchedule.heading')}
                </h1>
                <p className='mt-2 max-w-3xl text-muted-foreground'>{t('staffSchedule.description')}</p>
              </div>
              <Button type='button' variant='outline' onClick={() => void loadSchedules()}>
                <MaterialIcon name='refresh' className='text-lg' />
                {t('staffSchedule.actions.refresh')}
              </Button>
            </section>

            {message && (
              <div className='rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive'>
                {message.text}
              </div>
            )}

            <section className='grid gap-4 md:grid-cols-4'>
              <StatCard icon='calendar_month' label={t('staffSchedule.stats.total')} value={String(stats.total)} />
              <StatCard icon='event_available' label={t('staffSchedule.stats.scheduled')} value={String(stats.scheduled)} />
              <StatCard icon='play_circle' label={t('staffSchedule.stats.working')} value={String(stats.working)} />
              <StatCard icon='task_alt' label={t('staffSchedule.stats.completed')} value={String(stats.completed)} />
            </section>

            <section className='rounded-xl border border-border bg-card p-4 shadow-sm'>
              <div className='grid gap-3 lg:grid-cols-[1fr_1fr_220px_auto] lg:items-end'>
                <label className='flex flex-col gap-1.5'>
                  <span className='text-xs font-bold uppercase text-muted-foreground'>
                    {t('staffSchedule.filters.fromDate')}
                  </span>
                  <input
                    type='date'
                    value={fromDate}
                    onChange={(event) => setFromDate(event.target.value)}
                    className='h-10 rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring'
                  />
                </label>
                <label className='flex flex-col gap-1.5'>
                  <span className='text-xs font-bold uppercase text-muted-foreground'>
                    {t('staffSchedule.filters.toDate')}
                  </span>
                  <input
                    type='date'
                    value={toDate}
                    onChange={(event) => setToDate(event.target.value)}
                    className='h-10 rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring'
                  />
                </label>
                <label className='flex flex-col gap-1.5'>
                  <span className='text-xs font-bold uppercase text-muted-foreground'>
                    {t('staffSchedule.filters.status')}
                  </span>
                  <select
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value as StaffScheduleStatus | 'ALL')}
                    className='h-10 rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring'
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        {t(`staffSchedule.statuses.${status}`)}
                      </option>
                    ))}
                  </select>
                </label>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => {
                    setFromDate(toDateInputValue(todayWeekStart))
                    setToDate(toDateInputValue(addDays(todayWeekStart, 6)))
                    setStatusFilter('ALL')
                  }}
                >
                  <MaterialIcon name='filter_alt_off' className='text-lg' />
                  {t('staffSchedule.actions.clearFilters')}
                </Button>
              </div>
            </section>

            <section className='overflow-hidden rounded-xl border border-border bg-card shadow-sm'>
              <div className='flex flex-col gap-4 border-b border-border bg-muted/40 px-4 py-4 xl:flex-row xl:items-end xl:justify-between'>
                <div>
                  <p className='text-xs font-bold uppercase text-muted-foreground'>
                    {t('staffSchedule.scheduleBoard.monthYear')}
                  </p>
                  <h2 className='font-display text-2xl font-bold text-card-foreground'>
                    {getRangeTitle(rangeStart, rangeEnd)}
                  </h2>
                </div>
                <div className='flex flex-col gap-3 sm:flex-row sm:items-center'>
                  <p className='text-sm font-medium text-muted-foreground'>
                    {t('staffSchedule.scheduleBoard.rangeCount', { count: rangeDays.length })}
                  </p>
                  <div className='grid gap-2 sm:grid-cols-3'>
                    <Button type='button' variant='outline' size='sm' onClick={() => handleMoveRange(-7)}>
                      <MaterialIcon name='chevron_left' className='text-lg' />
                      {t('staffSchedule.actions.previousWeek')}
                    </Button>
                    <Button type='button' variant='outline' size='sm' onClick={handleShowCurrentWeek}>
                      <MaterialIcon name='today' className='text-lg' />
                      {t('staffSchedule.actions.thisWeek')}
                    </Button>
                    <Button type='button' variant='outline' size='sm' onClick={() => handleMoveRange(7)}>
                      {t('staffSchedule.actions.nextWeek')}
                      <MaterialIcon name='chevron_right' className='text-lg' />
                    </Button>
                  </div>
                </div>
              </div>

              {isLoading ? (
                <div className='grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-7'>
                  {Array.from({ length: 7 }).map((_, index) => (
                    <div key={index} className='h-64 animate-pulse rounded-lg bg-muted' />
                  ))}
                </div>
              ) : rangeDays.length > 0 ? (
                <div className='overflow-x-auto'>
                  <div
                    className='grid min-w-[980px] gap-px bg-border'
                    style={{ gridTemplateColumns: `repeat(${rangeDays.length}, minmax(150px, 1fr))` }}
                  >
                    {rangeDays.map((day) => {
                      const dateValue = toDateInputValue(day)
                      const daySchedules = sortSchedules(groupedSchedules[dateValue] ?? [])

                      return (
                        <article key={dateValue} className='min-h-[28rem] bg-card'>
                          <div className='sticky top-0 z-10 border-b border-border bg-card px-3 py-3'>
                            <p className='text-xs font-bold uppercase text-muted-foreground'>
                              {formatWeekday(day)}
                            </p>
                            <p className='font-display text-3xl font-bold text-foreground'>
                              {formatStaffScheduleDay(day)}
                            </p>
                          </div>

                          <div className='flex flex-col gap-3 p-3'>
                            {daySchedules.length > 0 ? (
                              daySchedules.map((schedule) => (
                                <button
                                  key={schedule.staffScheduleId}
                                  type='button'
                                  onClick={() =>
                                    void navigate(`/staff/weekly-schedule/${schedule.staffScheduleId}`)
                                  }
                                  className={cn(
                                    'group rounded-lg border p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-ring',
                                    getStaffScheduleShiftClassName(schedule.shiftType)
                                  )}
                                >
                                  <div className='flex items-start justify-between gap-2'>
                                    <span className='font-display text-base font-bold'>
                                      {t(`staffSchedule.shiftTypes.${schedule.shiftType}`)}
                                    </span>
                                    <MaterialIcon name='open_in_new' className='text-base opacity-70 group-hover:opacity-100' />
                                  </div>
                                  <div className='mt-3 grid gap-1 text-xs font-semibold'>
                                    <span className='flex items-center justify-between gap-2'>
                                      <span className='opacity-80'>{t('staffSchedule.detail.startTime')}</span>
                                      <span>{schedule.startTime}</span>
                                    </span>
                                    <span className='flex items-center justify-between gap-2'>
                                      <span className='opacity-80'>{t('staffSchedule.detail.endTime')}</span>
                                      <span>{schedule.endTime}</span>
                                    </span>
                                  </div>
                                  <div className='mt-3 flex flex-wrap gap-1.5'>
                                    <span
                                      className={cn(
                                        'inline-flex rounded-full border px-2 py-1 text-[11px] font-bold',
                                        getStaffScheduleStatusClassName(schedule.scheduleStatus)
                                      )}
                                    >
                                      {t(`staffSchedule.statuses.${schedule.scheduleStatus}`)}
                                    </span>
                                    {schedule.attendanceStatus ? (
                                      <span
                                        className={cn(
                                          'inline-flex rounded-full border px-2 py-1 text-[11px] font-bold',
                                          getStaffAttendanceStatusClassName(schedule.attendanceStatus)
                                        )}
                                      >
                                        {t(`staffSchedule.attendanceStatuses.${schedule.attendanceStatus}`)}
                                      </span>
                                    ) : null}
                                  </div>
                                </button>
                              ))
                            ) : (
                              <div className='rounded-lg border border-dashed border-border bg-background/70 p-4 text-center text-sm text-muted-foreground'>
                                {t('staffSchedule.scheduleBoard.noShift')}
                              </div>
                            )}
                          </div>
                        </article>
                      )
                    })}
                  </div>
                </div>
              ) : (
                <div className='p-8 text-center text-sm text-muted-foreground'>
                  {t('staffSchedule.scheduleBoard.emptyRange')}
                </div>
              )}
            </section>
          </div>
        </main>
      </div>
    </div>
  )
}

interface StatCardProps {
  icon: string
  label: string
  value: string
}

function StatCard({ icon, label, value }: StatCardProps) {
  return (
    <article className='rounded-xl border border-border bg-card p-4 shadow-sm'>
      <div className='flex items-center justify-between gap-3'>
        <div>
          <p className='text-xs font-bold uppercase text-muted-foreground'>{label}</p>
          <p className='mt-2 font-display text-2xl font-bold text-foreground'>{value}</p>
        </div>
        <span className='flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary'>
          <MaterialIcon name={icon} className='text-2xl' />
        </span>
      </div>
    </article>
  )
}
