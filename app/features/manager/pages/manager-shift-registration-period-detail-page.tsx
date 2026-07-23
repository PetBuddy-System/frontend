import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router'

import { cn } from '~/shared/lib/cn'
import { Button, MaterialIcon } from '~/shared/ui'

import { ManagerSidebar } from '../components/layout/manager-sidebar'
import { ManagerTopNav } from '../components/layout/manager-top-nav'
import { RegistrationPeriodStatusModal } from '../components/shift-registration/registration-period-status-modal'
import { getShiftRegistrationErrorMessage } from '../lib/shift-registration-error'
import { formatShiftRegistrationTime } from '../lib/shift-registration-format'
import { formatWorkScheduleDate, formatWorkScheduleDateTime } from '../lib/work-schedule-format'
import {
  shiftRegistrationApi,
  type PageShiftRegistrationResponse,
  type RegistrationPeriodResponse,
  type RegistrationPeriodStatus,
  type ShiftRegistrationResponse,
  type ShiftRegistrationShiftType
} from '../services'

type ShiftTypeFilter = ShiftRegistrationShiftType | 'ALL'

const DEFAULT_PAGE_SIZE = 10
const SHIFT_TYPE_FILTERS: ShiftTypeFilter[] = ['ALL', 'MORNING', 'AFTERNOON', 'EVENING', 'FULL_DAY', 'CUSTOM']

const STATUS_CLASS_BY_STATUS: Record<RegistrationPeriodStatus, string> = {
  OPEN: 'border-success/30 bg-success/10 text-success',
  CLOSED: 'border-muted bg-muted text-muted-foreground'
}

const SHIFT_CLASS_BY_TYPE: Record<string, string> = {
  MORNING: 'border-warning/30 bg-warning/10 text-warning',
  AFTERNOON: 'border-info/30 bg-info/10 text-info',
  EVENING: 'border-primary/30 bg-primary/10 text-primary',
  FULL_DAY: 'border-success/30 bg-success/10 text-success',
  CUSTOM: 'border-accent bg-accent text-accent-foreground'
}

export function ManagerShiftRegistrationPeriodDetailPage() {
  const { t } = useTranslation('manager')
  const navigate = useNavigate()
  const { periodId } = useParams()
  const [period, setPeriod] = useState<RegistrationPeriodResponse | null>(null)
  const [registrationsPage, setRegistrationsPage] = useState<PageShiftRegistrationResponse | null>(null)
  const [staffKeyword, setStaffKeyword] = useState('')
  const [workDate, setWorkDate] = useState('')
  const [shiftType, setShiftType] = useState<ShiftTypeFilter>('ALL')
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
  const [isLoadingPeriod, setIsLoadingPeriod] = useState(false)
  const [isLoadingRegistrations, setIsLoadingRegistrations] = useState(false)
  const [isStatusSubmitting, setIsStatusSubmitting] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState<RegistrationPeriodResponse | null>(null)
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null)

  const registrations = useMemo(() => registrationsPage?.content ?? [], [registrationsPage])
  const totalElements = registrationsPage?.totalElements ?? 0
  const totalPages = registrationsPage?.totalPages ?? 0
  const fromItem = totalElements === 0 ? 0 : page * pageSize + 1
  const toItem = Math.min(fromItem + registrations.length - 1, totalElements)

  const loadPeriod = useCallback(async () => {
    if (!periodId) return

    setIsLoadingPeriod(true)

    try {
      const response = await shiftRegistrationApi.getRegistrationPeriodById(periodId)
      setPeriod(response.data)
    } catch (error) {
      setMessage({
        type: 'error',
        text: getShiftRegistrationErrorMessage(error, t, 'shiftRegistration.messages.loadDetailFailed')
      })
    } finally {
      setIsLoadingPeriod(false)
    }
  }, [periodId, t])

  const loadRegistrations = useCallback(async () => {
    if (!periodId) return

    setIsLoadingRegistrations(true)

    try {
      const response = await shiftRegistrationApi.getRegistrationsForManager(periodId, {
        staffKeyword,
        workDate,
        shiftType,
        page,
        size: pageSize
      })

      setRegistrationsPage(response.data)
    } catch (error) {
      setMessage({
        type: 'error',
        text: getShiftRegistrationErrorMessage(error, t, 'shiftRegistration.messages.loadRegistrationsFailed')
      })
    } finally {
      setIsLoadingRegistrations(false)
    }
  }, [page, pageSize, periodId, shiftType, staffKeyword, t, workDate])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Period detail is loaded from route params.
    void loadPeriod()
  }, [loadPeriod])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Staff registrations are loaded from API after filters/page changes.
    void loadRegistrations()
  }, [loadRegistrations])

  async function handleStatusSubmit(nextStatus: RegistrationPeriodStatus) {
    if (!selectedPeriod) return

    setIsStatusSubmitting(true)
    setMessage(null)

    try {
      const response = await shiftRegistrationApi.updateRegistrationPeriodStatus(
        selectedPeriod.registrationPeriodId,
        nextStatus
      )
      setPeriod(response.data)
      setSelectedPeriod(null)
      setMessage({ type: 'success', text: t('shiftRegistration.messages.statusUpdated') })
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
        <ManagerTopNav
          titleKey='shiftRegistration.detailPage.title'
          subtitleKey='shiftRegistration.detailPage.subtitle'
        />
        <main className='flex-1 overflow-y-auto p-4 md:p-6'>
          <div className='mx-auto flex max-w-7xl flex-col gap-6'>
            <section className='flex flex-col gap-4 border-b border-border pb-6 md:flex-row md:items-center md:justify-between'>
              <div>
                <h1 className='font-display text-2xl font-bold text-card-foreground md:text-3xl'>
                  {t('shiftRegistration.detailPage.title')}
                </h1>
                <p className='mt-2 text-muted-foreground'>{t('shiftRegistration.detailPage.subtitle')}</p>
              </div>
              <Button
                type='button'
                variant='outline'
                onClick={() => void navigate('/manager/shift-registration-periods')}
              >
                <MaterialIcon name='arrow_back' className='text-lg' />
                {t('shiftRegistration.actions.backToList')}
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
              {isLoadingPeriod ? (
                <div className='grid gap-3 md:grid-cols-2'>
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className='h-20 animate-pulse rounded-lg bg-muted' />
                  ))}
                </div>
              ) : period ? (
                <div className='grid gap-5'>
                  <div className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
                    <div>
                      <h2 className='font-display text-xl font-bold text-card-foreground'>
                        {formatWorkScheduleDate(period.workFromDate)} - {formatWorkScheduleDate(period.workToDate)}
                      </h2>
                      <p className='mt-1 text-sm text-muted-foreground'>
                        {t('shiftRegistration.detail.workRangeHint')}
                      </p>
                    </div>
                    <div className='flex flex-wrap gap-3'>
                      <StatusBadge status={period.status} />
                      <Button type='button' variant='outline' onClick={() => setSelectedPeriod(period)}>
                        <MaterialIcon name='published_with_changes' className='text-lg' />
                        {t('shiftRegistration.actions.updateStatus')}
                      </Button>
                    </div>
                  </div>
                  <div className='grid gap-3 md:grid-cols-2'>
                    <DetailItem
                      icon='date_range'
                      label={t('shiftRegistration.detail.workRange')}
                      value={`${formatWorkScheduleDate(period.workFromDate)} - ${formatWorkScheduleDate(period.workToDate)}`}
                    />
                    <DetailItem
                      icon='how_to_reg'
                      label={t('shiftRegistration.detail.registrationWindow')}
                      value={`${formatWorkScheduleDateTime(period.registerOpenAt)} - ${formatWorkScheduleDateTime(period.registerCloseAt)}`}
                    />
                  </div>
                </div>
              ) : (
                <p className='py-8 text-center text-sm text-muted-foreground'>
                  {t('shiftRegistration.errors.notFound')}
                </p>
              )}
            </section>

            <section className='rounded-xl border border-border bg-card p-5 shadow-sm'>
              <div className='grid gap-5'>
                <div className='flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between'>
                  <div>
                    <h2 className='font-display text-xl font-bold text-card-foreground'>
                      {t('shiftRegistration.registrations.title')}
                    </h2>
                    <p className='mt-2 max-w-3xl text-sm text-muted-foreground'>
                      {t('shiftRegistration.registrations.subtitle')}
                    </p>
                  </div>
                  <Button
                    type='button'
                    variant='outline'
                    className='w-full lg:w-auto'
                    onClick={() => void loadRegistrations()}
                  >
                    <MaterialIcon name='refresh' className='text-lg' />
                    {t('shiftRegistration.actions.refresh')}
                  </Button>
                </div>
                <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-[minmax(16rem,1.4fr)_minmax(12rem,1fr)_minmax(12rem,1fr)_minmax(8rem,0.7fr)_auto] xl:items-end'>
                  <Field label={t('shiftRegistration.filters.staffKeyword')}>
                    <input
                      value={staffKeyword}
                      onChange={(event) => {
                        setStaffKeyword(event.target.value)
                        setPage(0)
                      }}
                      placeholder={t('shiftRegistration.filters.staffKeywordPlaceholder')}
                      className='h-11 w-full rounded-lg border border-input bg-muted px-4 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring'
                    />
                  </Field>
                  <Field label={t('shiftRegistration.filters.workDate')}>
                    <input
                      type='date'
                      value={workDate}
                      onChange={(event) => {
                        setWorkDate(event.target.value)
                        setPage(0)
                      }}
                      className='h-11 w-full rounded-lg border border-input bg-muted px-4 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring'
                    />
                  </Field>
                  <Field label={t('shiftRegistration.filters.shiftType')}>
                    <select
                      value={shiftType}
                      onChange={(event) => {
                        setShiftType(event.target.value as ShiftTypeFilter)
                        setPage(0)
                      }}
                      className='h-11 w-full rounded-lg border border-input bg-muted px-4 text-sm font-semibold text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring'
                    >
                      {SHIFT_TYPE_FILTERS.map((option) => (
                        <option key={option} value={option}>
                          {option === 'ALL'
                            ? t('shiftRegistration.shiftTypes.ALL')
                            : t(`shiftRegistration.shiftTypes.${option}`)}
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
                      className='h-11 w-full rounded-lg border border-input bg-muted px-4 text-sm font-semibold text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring'
                    >
                      {[10, 20, 30].map((size) => (
                        <option key={size} value={size}>
                          {size}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <div className='flex items-end md:col-span-2 xl:col-span-1'>
                    <Button
                      type='button'
                      variant='outline'
                      className='w-full whitespace-nowrap xl:w-auto'
                      onClick={() => {
                        setStaffKeyword('')
                        setWorkDate('')
                        setShiftType('ALL')
                        setPage(0)
                      }}
                    >
                      <MaterialIcon name='filter_alt_off' className='text-lg' />
                      {t('shiftRegistration.actions.clearFilters')}
                    </Button>
                  </div>
                </div>
              </div>
            </section>

            <section className='overflow-hidden rounded-xl border border-border bg-card shadow-sm'>
              <div className='flex flex-col gap-2 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between'>
                <div>
                  <h2 className='font-display text-xl font-bold text-card-foreground'>
                    {t('shiftRegistration.registrations.listTitle')}
                  </h2>
                  <p className='mt-1 text-sm text-muted-foreground'>
                    {t('shiftRegistration.registrations.showing', {
                      from: fromItem,
                      to: toItem,
                      total: totalElements
                    })}
                  </p>
                </div>
              </div>

              <div className='overflow-x-auto'>
                <table className='w-full min-w-[1040px] border-collapse text-left'>
                  <thead>
                    <tr className='border-b border-border bg-muted text-sm font-semibold text-muted-foreground'>
                      <th className='px-4 py-3'>{t('shiftRegistration.registrations.table.staff')}</th>
                      <th className='px-4 py-3'>{t('shiftRegistration.registrations.table.workDate')}</th>
                      <th className='px-4 py-3'>{t('shiftRegistration.registrations.table.shift')}</th>
                      <th className='px-4 py-3'>{t('shiftRegistration.registrations.table.customTime')}</th>
                      <th className='px-4 py-3'>{t('shiftRegistration.registrations.table.reason')}</th>
                      <th className='px-4 py-3'>{t('shiftRegistration.registrations.table.createdAt')}</th>
                    </tr>
                  </thead>
                  <tbody className='divide-y divide-border'>
                    {isLoadingRegistrations ? (
                      Array.from({ length: 5 }).map((_, index) => (
                        <tr key={index}>
                          <td colSpan={6} className='p-4'>
                            <div className='h-12 animate-pulse rounded-lg bg-muted' />
                          </td>
                        </tr>
                      ))
                    ) : registrations.length > 0 ? (
                      registrations.map((registration) => (
                        <RegistrationRow key={registration.registrationId} registration={registration} />
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className='p-10 text-center text-sm text-muted-foreground'>
                          {t('shiftRegistration.registrations.empty')}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className='flex flex-col gap-4 border-t border-border bg-muted px-4 py-3 sm:flex-row sm:items-center sm:justify-between'>
                <p className='text-sm text-muted-foreground'>
                  {t('shiftRegistration.registrations.showing', { from: fromItem, to: toItem, total: totalElements })}
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
  children: ReactNode
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

interface DetailItemProps {
  icon: string
  label: string
  value: string
}

function DetailItem({ icon, label, value }: DetailItemProps) {
  return (
    <div className='flex items-center gap-3 rounded-lg border border-border bg-background p-4'>
      <span className='flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-primary'>
        <MaterialIcon name={icon} className='text-lg' />
      </span>
      <div className='min-w-0'>
        <p className='text-xs font-bold uppercase text-muted-foreground'>{label}</p>
        <p className='mt-1 font-semibold text-foreground'>{value}</p>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: RegistrationPeriodStatus }) {
  const { t } = useTranslation('manager')

  return (
    <span
      className={cn(
        'inline-flex h-fit rounded-full border px-3 py-1 text-xs font-bold',
        STATUS_CLASS_BY_STATUS[status] ?? 'border-border bg-muted text-muted-foreground'
      )}
    >
      {t(`shiftRegistration.statuses.${status}`)}
    </span>
  )
}

function ShiftBadge({ shiftType }: { shiftType: ShiftRegistrationShiftType }) {
  const { t } = useTranslation('manager')

  return (
    <span
      className={cn(
        'inline-flex rounded-full border px-3 py-1 text-xs font-bold',
        SHIFT_CLASS_BY_TYPE[shiftType] ?? 'border-border bg-muted text-muted-foreground'
      )}
    >
      {t(`shiftRegistration.shiftTypes.${shiftType}`)}
    </span>
  )
}

function RegistrationRow({ registration }: { registration: ShiftRegistrationResponse }) {
  const { t } = useTranslation('manager')
  const hasCustomTime = registration.preferredShift === 'CUSTOM'

  return (
    <tr className='transition-colors hover:bg-muted/60'>
      <td className='px-4 py-4'>
        <div className='min-w-0'>
          <p className='font-semibold text-card-foreground'>{registration.staffName}</p>
          {registration.staffEmail ? (
            <p className='mt-1 break-all text-xs font-medium text-muted-foreground'>{registration.staffEmail}</p>
          ) : null}
        </div>
      </td>
      <td className='px-4 py-4 text-sm text-muted-foreground'>{formatWorkScheduleDate(registration.workDate)}</td>
      <td className='px-4 py-4'>
        <ShiftBadge shiftType={registration.preferredShift} />
      </td>
      <td className='px-4 py-4 text-sm text-muted-foreground'>
        {hasCustomTime
          ? `${formatShiftRegistrationTime(registration.preferredStartTime)} - ${formatShiftRegistrationTime(
              registration.preferredEndTime
            )}`
          : t('shiftRegistration.registrations.standardShift')}
      </td>
      <td className='max-w-xs px-4 py-4 text-sm text-muted-foreground'>
        {hasCustomTime ? registration.reason || '-' : '-'}
      </td>
      <td className='px-4 py-4 text-sm text-muted-foreground'>{formatWorkScheduleDateTime(registration.createdAt)}</td>
    </tr>
  )
}
