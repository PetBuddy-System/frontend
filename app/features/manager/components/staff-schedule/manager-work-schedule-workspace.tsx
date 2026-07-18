import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'

import { Button, MaterialIcon } from '~/shared/ui'

import {
  workScheduleApi,
  type WorkScheduleResponse,
  type WorkScheduleShiftType
} from '../../services'
import { formatWorkScheduleDate } from '../../lib/work-schedule-format'
import { getWorkScheduleErrorMessage } from '../../lib/work-schedule-error'

const SHIFT_TYPES: Array<WorkScheduleShiftType | 'ALL'> = [
  'ALL',
  'MORNING',
  'AFTERNOON',
  'EVENING',
  'FULL_DAY',
  'CUSTOM'
]

const PAGE_SIZE_OPTIONS = [5, 10, 20] as const

export function ManagerWorkScheduleWorkspace() {
  const { t } = useTranslation('manager')
  const navigate = useNavigate()
  const [schedules, setSchedules] = useState<WorkScheduleResponse[]>([])
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [shiftType, setShiftType] = useState<WorkScheduleShiftType | 'ALL'>('ALL')
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const totalAssignedStaffs = useMemo(
    () => schedules.reduce((total, schedule) => total + (schedule.assignedStaffs?.length ?? 0), 0),
    [schedules]
  )

  const loadSchedules = useCallback(async () => {
    setIsLoading(true)
    setErrorMessage(null)

    if (fromDate && toDate && toDate < fromDate) {
      setErrorMessage(t('staffSchedule.workSchedules.errors.invalidDateRange'))
      setIsLoading(false)
      return
    }

    try {
      const response = await workScheduleApi.getWorkSchedules({
        fromDate,
        toDate,
        shiftType,
        page,
        size: pageSize
      })

      setSchedules(response.data.content)
      setTotalPages(response.data.totalPages)
      setTotalElements(response.data.totalElements)
    } catch (error) {
      setErrorMessage(
        getWorkScheduleErrorMessage(error, t, 'staffSchedule.workSchedules.messages.loadListFailed', 'overview')
      )
    } finally {
      setIsLoading(false)
    }
  }, [fromDate, page, pageSize, shiftType, t, toDate])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Data load is synchronized after filters/page change.
    void loadSchedules()
  }, [loadSchedules])

  const resultsFrom = totalElements > 0 ? page * pageSize + 1 : 0
  const resultsTo = Math.min((page + 1) * pageSize, totalElements)

  return (
    <div className='flex flex-col gap-6'>
      <section className='grid gap-4 md:grid-cols-3'>
        <StatCard
          icon='event_available'
          label={t('staffSchedule.workSchedules.stats.total')}
          value={String(totalElements)}
        />
        <StatCard
          icon='groups'
          label={t('staffSchedule.workSchedules.stats.assigned')}
          value={String(totalAssignedStaffs)}
        />
        <StatCard
          icon='schedule'
          label={t('staffSchedule.workSchedules.stats.page')}
          value={`${page + 1}/${Math.max(totalPages, 1)}`}
        />
      </section>

      {errorMessage && (
        <div className='rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive'>
          {errorMessage}
        </div>
      )}

      <section className='rounded-xl border border-border bg-card p-4 shadow-sm'>
        <div className='grid gap-3 lg:grid-cols-[1fr_1fr_1fr_120px_auto_auto]'>
          <Field label={t('staffSchedule.workSchedules.filters.fromDate')}>
            <input
              type='date'
              value={fromDate}
              onChange={(event) => {
                setPage(0)
                setFromDate(event.target.value)
              }}
              className='h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring'
            />
          </Field>
          <Field label={t('staffSchedule.workSchedules.filters.toDate')}>
            <input
              type='date'
              value={toDate}
              onChange={(event) => {
                setPage(0)
                setToDate(event.target.value)
              }}
              className='h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring'
            />
          </Field>
          <Field label={t('staffSchedule.workSchedules.filters.shiftType')}>
            <select
              value={shiftType}
              onChange={(event) => {
                setPage(0)
                setShiftType(event.target.value as WorkScheduleShiftType | 'ALL')
              }}
              className='h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring'
            >
              {SHIFT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {t(`staffSchedule.workSchedules.shiftTypes.${type}`)}
                </option>
              ))}
            </select>
          </Field>
          <Field label={t('staffSchedule.workSchedules.filters.pageSize')}>
            <select
              value={pageSize}
              onChange={(event) => {
                setPage(0)
                setPageSize(Number(event.target.value))
              }}
              className='h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring'
            >
              {PAGE_SIZE_OPTIONS.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </Field>
          <div className='flex items-end'>
            <Button
              type='button'
              variant='outline'
              className='w-full whitespace-nowrap'
              onClick={() => {
                setFromDate('')
                setToDate('')
                setShiftType('ALL')
                setPage(0)
              }}
            >
              <MaterialIcon name='filter_alt_off' className='text-lg' />
              {t('staffSchedule.workSchedules.actions.clearFilters')}
            </Button>
          </div>
          <div className='flex items-end'>
            <Button
              type='button'
              className='w-full whitespace-nowrap'
              onClick={() => void navigate('/manager/staff-schedule/new')}
            >
              <MaterialIcon name='add' className='text-lg' />
              {t('staffSchedule.workSchedules.actions.create')}
            </Button>
          </div>
        </div>
      </section>

      <section className='overflow-hidden rounded-xl border border-border bg-card shadow-sm'>
        <div className='flex flex-col gap-3 border-b border-border px-4 py-3 md:flex-row md:items-center md:justify-between'>
          <div>
            <h2 className='font-display text-lg font-bold text-card-foreground'>
              {t('staffSchedule.workSchedules.list.title')}
            </h2>
            <p className='text-sm text-muted-foreground'>
              {t('staffSchedule.workSchedules.list.showing', {
                from: resultsFrom,
                to: resultsTo,
                total: totalElements
              })}
            </p>
          </div>
          <Button type='button' variant='outline' size='sm' onClick={() => void loadSchedules()}>
            <MaterialIcon name='refresh' className='text-lg' />
            {t('staffSchedule.workSchedules.actions.refresh')}
          </Button>
        </div>

        <div className='overflow-x-auto'>
          <table className='w-full min-w-[960px] border-collapse text-left'>
            <thead>
              <tr className='border-b border-border bg-muted/50 text-xs font-bold uppercase text-muted-foreground'>
                <th className='px-4 py-3'>{t('staffSchedule.workSchedules.table.date')}</th>
                <th className='px-4 py-3'>{t('staffSchedule.workSchedules.table.time')}</th>
                <th className='px-4 py-3'>{t('staffSchedule.workSchedules.table.shift')}</th>
                <th className='px-4 py-3'>{t('staffSchedule.workSchedules.table.staffs')}</th>
                <th className='px-4 py-3'>{t('staffSchedule.workSchedules.table.note')}</th>
                <th className='px-4 py-3 text-right'>{t('staffSchedule.workSchedules.table.actions')}</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-border'>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={index} className='animate-pulse'>
                    <td className='px-4 py-4'><div className='h-4 w-24 rounded bg-muted' /></td>
                    <td className='px-4 py-4'><div className='h-4 w-32 rounded bg-muted' /></td>
                    <td className='px-4 py-4'><div className='h-6 w-24 rounded-full bg-muted' /></td>
                    <td className='px-4 py-4'><div className='h-4 w-16 rounded bg-muted' /></td>
                    <td className='px-4 py-4'><div className='h-4 w-56 rounded bg-muted' /></td>
                    <td className='px-4 py-4'><div className='ml-auto h-8 w-24 rounded bg-muted' /></td>
                  </tr>
                ))
              ) : schedules.length > 0 ? (
                schedules.map((schedule) => (
                  <tr key={schedule.workScheduleId} className='transition-colors hover:bg-muted/60'>
                    <td className='px-4 py-4 text-sm font-semibold text-foreground'>
                      {formatWorkScheduleDate(schedule.workDate)}
                    </td>
                    <td className='px-4 py-4 text-sm text-card-foreground'>
                      {schedule.startTime} - {schedule.endTime}
                    </td>
                    <td className='px-4 py-4'>
                      <span className='inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary'>
                        {t(`staffSchedule.workSchedules.shiftTypes.${schedule.shiftType}`)}
                      </span>
                    </td>
                    <td className='px-4 py-4 text-sm text-card-foreground'>
                      {schedule.assignedStaffs?.length ?? 0}
                    </td>
                    <td className='max-w-80 px-4 py-4 text-sm text-muted-foreground'>
                      <span className='line-clamp-2'>{schedule.note || '-'}</span>
                    </td>
                    <td className='px-4 py-4'>
                      <div className='flex justify-end gap-2'>
                        <IconButton
                          label={t('staffSchedule.workSchedules.actions.viewDetails')}
                          icon='visibility'
                          onClick={() => void navigate(`/manager/staff-schedule/${schedule.workScheduleId}`)}
                        />
                        <IconButton
                          label={t('staffSchedule.workSchedules.actions.edit')}
                          icon='edit'
                          onClick={() => void navigate(`/manager/staff-schedule/${schedule.workScheduleId}/edit`)}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className='px-4 py-10 text-center text-sm text-muted-foreground'>
                    {t('staffSchedule.workSchedules.empty')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className='flex flex-col gap-3 border-t border-border bg-muted/30 px-4 py-3 sm:flex-row sm:items-center sm:justify-between'>
          <p className='text-sm font-medium text-muted-foreground'>
            {t('staffSchedule.workSchedules.list.showing', {
              from: resultsFrom,
              to: resultsTo,
              total: totalElements
            })}
          </p>
          <div className='flex items-center gap-2'>
            <Button
              type='button'
              variant='outline'
              size='icon'
              disabled={page === 0}
              aria-label={t('staffSchedule.workSchedules.pagination.previous')}
              onClick={() => setPage((current) => Math.max(current - 1, 0))}
            >
              <MaterialIcon name='chevron_left' className='text-lg' />
            </Button>
            <span className='min-w-24 text-center text-sm font-bold text-foreground'>
              {t('staffSchedule.workSchedules.pagination.page', {
                page: page + 1,
                totalPages: Math.max(totalPages, 1)
              })}
            </span>
            <Button
              type='button'
              variant='outline'
              size='icon'
              disabled={totalPages === 0 || page >= totalPages - 1}
              aria-label={t('staffSchedule.workSchedules.pagination.next')}
              onClick={() => setPage((current) => current + 1)}
            >
              <MaterialIcon name='chevron_right' className='text-lg' />
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}

interface FieldProps {
  label: string
  children: ReactNode
}

function Field({ label, children }: FieldProps) {
  return (
    <label className='flex flex-col gap-1.5'>
      <span className='text-xs font-bold uppercase text-muted-foreground'>{label}</span>
      {children}
    </label>
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

interface IconButtonProps {
  icon: string
  label: string
  onClick: () => void
}

function IconButton({ icon, label, onClick }: IconButtonProps) {
  return (
    <button
      type='button'
      aria-label={label}
      title={label}
      onClick={onClick}
      className='flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-primary focus:outline-none focus:ring-2 focus:ring-ring'
    >
      <MaterialIcon name={icon} className='text-lg' />
    </button>
  )
}
