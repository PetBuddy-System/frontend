import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router'

import { cn } from '~/shared/lib/cn'
import { Button, MaterialIcon } from '~/shared/ui'

import { ManagerSidebar } from '../components/layout/manager-sidebar'
import { ManagerTopNav } from '../components/layout/manager-top-nav'
import { RegistrationPeriodStatusModal } from '../components/shift-registration/registration-period-status-modal'
import { getShiftRegistrationErrorMessage } from '../lib/shift-registration-error'
import { formatWorkScheduleDate, formatWorkScheduleDateTime } from '../lib/work-schedule-format'
import {
  shiftRegistrationApi,
  type PageRegistrationPeriodResponse,
  type RegistrationPeriodResponse,
  type RegistrationPeriodStatus
} from '../services'

type RegistrationPeriodStatusFilter = RegistrationPeriodStatus | 'ALL'

const DEFAULT_PAGE_SIZE = 10
const STATUS_FILTERS: RegistrationPeriodStatusFilter[] = ['ALL', 'OPEN', 'CLOSED']

const STATUS_CLASS_BY_STATUS: Record<RegistrationPeriodStatus, string> = {
  OPEN: 'border-success/30 bg-success/10 text-success',
  CLOSED: 'border-muted bg-muted text-muted-foreground'
}

function getSuccessMessage(state: unknown) {
  if (!state || typeof state !== 'object' || !('successMessage' in state)) return null

  const { successMessage } = state

  return typeof successMessage === 'string' ? successMessage : null
}

export function ManagerShiftRegistrationPeriodsPage() {
  const { t } = useTranslation('manager')
  const location = useLocation()
  const navigate = useNavigate()
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [status, setStatus] = useState<RegistrationPeriodStatusFilter>('ALL')
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
  const [pageData, setPageData] = useState<PageRegistrationPeriodResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isStatusSubmitting, setIsStatusSubmitting] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState<RegistrationPeriodResponse | null>(null)
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(() => {
    const successMessage = getSuccessMessage(location.state)

    return successMessage ? { type: 'success', text: successMessage } : null
  })

  const periods = useMemo(() => pageData?.content ?? [], [pageData])
  const totalElements = pageData?.totalElements ?? 0
  const totalPages = pageData?.totalPages ?? 0
  const fromItem = totalElements === 0 ? 0 : page * pageSize + 1
  const toItem = Math.min(fromItem + periods.length - 1, totalElements)

  const loadPeriods = useCallback(async () => {
    if (fromDate && toDate && toDate < fromDate) {
      setMessage({ type: 'error', text: t('shiftRegistration.errors.invalidDateRange') })
      return
    }

    setIsLoading(true)

    try {
      const response = await shiftRegistrationApi.getRegistrationPeriods({
        fromDate,
        toDate,
        status,
        page,
        size: pageSize
      })

      setPageData(response.data)
    } catch (error) {
      setMessage({
        type: 'error',
        text: getShiftRegistrationErrorMessage(error, t, 'shiftRegistration.messages.loadPeriodsFailed')
      })
    } finally {
      setIsLoading(false)
    }
  }, [fromDate, page, pageSize, status, t, toDate])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Registration periods are loaded from API after filters/page changes.
    void loadPeriods()
  }, [loadPeriods])

  async function handleStatusSubmit(nextStatus: RegistrationPeriodStatus) {
    if (!selectedPeriod) return

    setIsStatusSubmitting(true)
    setMessage(null)

    try {
      await shiftRegistrationApi.updateRegistrationPeriodStatus(selectedPeriod.registrationPeriodId, nextStatus)
      setSelectedPeriod(null)
      setMessage({ type: 'success', text: t('shiftRegistration.messages.statusUpdated') })
      await loadPeriods()
    } catch (error) {
      setMessage({
        type: 'error',
        text: getShiftRegistrationErrorMessage(error, t, 'shiftRegistration.messages.statusUpdateFailed')
      })
    } finally {
      setIsStatusSubmitting(false)
    }
  }

  return (
    <div className='flex h-screen overflow-hidden bg-background text-foreground'>
      <ManagerSidebar activeItem='shiftRegistrations' />
      <div className='flex min-w-0 flex-1 flex-col overflow-hidden'>
        <ManagerTopNav titleKey='shiftRegistration.title' subtitleKey='shiftRegistration.subtitle' />
        <main className='flex-1 overflow-y-auto p-4 md:p-6'>
          <div className='mx-auto flex max-w-7xl flex-col gap-6'>
            <section className='flex flex-col gap-4 border-b border-border pb-6 lg:flex-row lg:items-center lg:justify-between'>
              <div>
                <h1 className='font-display text-2xl font-bold text-card-foreground md:text-3xl'>
                  {t('shiftRegistration.title')}
                </h1>
                <p className='mt-2 max-w-3xl text-muted-foreground'>{t('shiftRegistration.subtitle')}</p>
              </div>
              <Button type='button' size='lg' onClick={() => void navigate('/manager/shift-registration-periods/new')}>
                <MaterialIcon name='add' className='text-lg' />
                {t('shiftRegistration.actions.create')}
              </Button>
            </section>

            {message ? (
              <div
                className={
                  message.type === 'success'
                    ? 'rounded-xl border border-success/30 bg-success/10 px-4 py-3 text-sm font-semibold text-success'
                    : 'rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-semibold text-destructive'
                }
              >
                {message.text}
              </div>
            ) : null}

            <section className='rounded-xl border border-border bg-card p-5 shadow-sm'>
              <div className='grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end'>
                <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
                  <Field label={t('shiftRegistration.filters.fromDate')}>
                    <input
                      type='date'
                      value={fromDate}
                      onChange={(event) => {
                        setFromDate(event.target.value)
                        setPage(0)
                      }}
                      className='h-11 rounded-lg border border-input bg-muted px-4 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring'
                    />
                  </Field>
                  <Field label={t('shiftRegistration.filters.toDate')}>
                    <input
                      type='date'
                      value={toDate}
                      onChange={(event) => {
                        setToDate(event.target.value)
                        setPage(0)
                      }}
                      className='h-11 rounded-lg border border-input bg-muted px-4 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring'
                    />
                  </Field>
                  <Field label={t('shiftRegistration.filters.status')}>
                    <select
                      value={status}
                      onChange={(event) => {
                        setStatus(event.target.value as RegistrationPeriodStatusFilter)
                        setPage(0)
                      }}
                      className='h-11 rounded-lg border border-input bg-muted px-4 text-sm font-semibold text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring'
                    >
                      {STATUS_FILTERS.map((option) => (
                        <option key={option} value={option}>
                          {option === 'ALL'
                            ? t('shiftRegistration.statuses.ALL')
                            : t(`shiftRegistration.statuses.${option}`)}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label={t('shiftRegistration.filters.pageSize')}>
                    <select
                      value={pageSize}
                      onChange={(event) => {
                        setPageSize(Number(event.target.value))
                        setPage(0)
                      }}
                      className='h-11 rounded-lg border border-input bg-muted px-4 text-sm font-semibold text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring'
                    >
                      {[10, 20, 30].map((size) => (
                        <option key={size} value={size}>
                          {size}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>
                <div className='flex flex-wrap gap-3'>
                  <Button
                    type='button'
                    variant='outline'
                    onClick={() => {
                      setFromDate('')
                      setToDate('')
                      setStatus('ALL')
                      setPage(0)
                    }}
                  >
                    <MaterialIcon name='filter_alt_off' className='text-lg' />
                    {t('shiftRegistration.actions.clearFilters')}
                  </Button>
                  <Button type='button' variant='outline' onClick={() => void loadPeriods()}>
                    <MaterialIcon name='refresh' className='text-lg' />
                    {t('shiftRegistration.actions.refresh')}
                  </Button>
                </div>
              </div>
            </section>

            <section className='overflow-hidden rounded-xl border border-border bg-card shadow-sm'>
              <div className='flex flex-col gap-2 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between'>
                <div>
                  <h2 className='font-display text-xl font-bold text-card-foreground'>
                    {t('shiftRegistration.list.title')}
                  </h2>
                  <p className='mt-1 text-sm text-muted-foreground'>
                    {t('shiftRegistration.list.showing', { from: fromItem, to: toItem, total: totalElements })}
                  </p>
                </div>
              </div>

              <div className='overflow-x-auto'>
                <table className='w-full min-w-[960px] border-collapse text-left'>
                  <thead>
                    <tr className='border-b border-border bg-muted text-sm font-semibold text-muted-foreground'>
                      <th className='px-4 py-3'>{t('shiftRegistration.table.workRange')}</th>
                      <th className='px-4 py-3'>{t('shiftRegistration.table.registrationTime')}</th>
                      <th className='px-4 py-3'>{t('shiftRegistration.table.status')}</th>
                      <th className='px-4 py-3 text-right'>{t('shiftRegistration.table.actions')}</th>
                    </tr>
                  </thead>
                  <tbody className='divide-y divide-border'>
                    {isLoading ? (
                      Array.from({ length: 5 }).map((_, index) => (
                        <tr key={index}>
                          <td colSpan={4} className='p-4'>
                            <div className='h-12 animate-pulse rounded-lg bg-muted' />
                          </td>
                        </tr>
                      ))
                    ) : periods.length > 0 ? (
                      periods.map((period) => (
                        <tr key={period.registrationPeriodId} className='transition-colors hover:bg-muted/60'>
                          <td className='px-4 py-4'>
                            <p className='font-semibold text-card-foreground'>
                              {formatWorkScheduleDate(period.workFromDate)} -{' '}
                              {formatWorkScheduleDate(period.workToDate)}
                            </p>
                            <p className='mt-1 text-xs text-muted-foreground'>
                              {t('shiftRegistration.table.workRangeHint')}
                            </p>
                          </td>
                          <td className='px-4 py-4 text-sm text-muted-foreground'>
                            <span className='block'>{formatWorkScheduleDateTime(period.registerOpenAt)}</span>
                            <span className='block'>{formatWorkScheduleDateTime(period.registerCloseAt)}</span>
                          </td>
                          <td className='px-4 py-4'>
                            <StatusBadge status={period.status} />
                          </td>
                          <td className='px-4 py-4'>
                            <div className='flex justify-end gap-1'>
                              <IconAction
                                label={t('shiftRegistration.actions.viewDetails')}
                                icon='visibility'
                                onClick={() =>
                                  void navigate(`/manager/shift-registration-periods/${period.registrationPeriodId}`)
                                }
                              />
                              <IconAction
                                label={t('shiftRegistration.actions.updateStatus')}
                                icon='published_with_changes'
                                onClick={() => setSelectedPeriod(period)}
                              />
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className='p-10 text-center text-sm text-muted-foreground'>
                          {t('shiftRegistration.empty')}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className='flex flex-col gap-4 border-t border-border bg-muted px-4 py-3 sm:flex-row sm:items-center sm:justify-between'>
                <p className='text-sm text-muted-foreground'>
                  {t('shiftRegistration.list.showing', { from: fromItem, to: toItem, total: totalElements })}
                </p>
                <nav aria-label={t('shiftRegistration.pagination.label')} className='flex items-center gap-1'>
                  <Button
                    type='button'
                    variant='outline'
                    size='icon'
                    disabled={page <= 0}
                    onClick={() => setPage((current) => Math.max(current - 1, 0))}
                  >
                    <MaterialIcon name='chevron_left' className='text-lg' />
                  </Button>
                  <span className='px-3 text-sm font-bold text-card-foreground'>
                    {t('shiftRegistration.pagination.page', { page: totalPages === 0 ? 0 : page + 1, totalPages })}
                  </span>
                  <Button
                    type='button'
                    variant='outline'
                    size='icon'
                    disabled={page + 1 >= totalPages}
                    onClick={() => setPage((current) => current + 1)}
                  >
                    <MaterialIcon name='chevron_right' className='text-lg' />
                  </Button>
                </nav>
              </div>
            </section>
          </div>
        </main>
      </div>

      <RegistrationPeriodStatusModal
        key={selectedPeriod?.registrationPeriodId ?? 'empty'}
        isSubmitting={isStatusSubmitting}
        period={selectedPeriod}
        onClose={() => setSelectedPeriod(null)}
        onSubmit={(nextStatus) => void handleStatusSubmit(nextStatus)}
      />
    </div>
  )
}

interface FieldProps {
  children: React.ReactNode
  label: string
}

function Field({ children, label }: FieldProps) {
  return (
    <label className='grid gap-2'>
      <span className='text-sm font-bold text-card-foreground'>{label}</span>
      {children}
    </label>
  )
}

interface IconActionProps {
  icon: string
  label: string
  onClick: () => void
}

function IconAction({ icon, label, onClick }: IconActionProps) {
  return (
    <button
      type='button'
      aria-label={label}
      title={label}
      onClick={onClick}
      className='flex h-9 w-9 items-center justify-center rounded-full text-primary transition-colors hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring'
    >
      <MaterialIcon name={icon} className='text-lg' />
    </button>
  )
}

function StatusBadge({ status }: { status: RegistrationPeriodStatus }) {
  const { t } = useTranslation('manager')

  return (
    <span
      className={cn(
        'inline-flex rounded-full border px-3 py-1 text-xs font-bold',
        STATUS_CLASS_BY_STATUS[status] ?? 'border-border bg-muted text-muted-foreground'
      )}
    >
      {t(`shiftRegistration.statuses.${status}`)}
    </span>
  )
}
