import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { cn } from '~/shared/lib/cn'
import { Button, MaterialIcon } from '~/shared/ui'

import { StaffSidebar } from '../components/layout/staff-sidebar'
import { StaffTopNav } from '../components/layout/staff-top-nav'
import { getStaffShiftRegistrationErrorMessage } from '../lib/staff-shift-registration-error'
import {
  formatStaffScheduleDate,
  formatStaffScheduleDateTime,
  formatWeekday,
  getDaysBetween,
  parseDateInputValue,
  toDateInputValue
} from '../lib/staff-schedule-format'
import {
  staffShiftRegistrationApi,
  type StaffRegistrationPeriodResponse,
  type StaffShiftRegistrationItem,
  type StaffShiftRegistrationResponse,
  type StaffShiftRegistrationShiftType
} from '../services'

type DraftShiftType = StaffShiftRegistrationShiftType | 'NONE'

interface RegistrationDraft {
  workDate: string
  preferredShift: DraftShiftType
  preferredStartTime: string
  preferredEndTime: string
  reason: string
}

const PERIOD_PAGE_SIZE = 6
const SHIFT_OPTIONS: DraftShiftType[] = ['NONE', 'MORNING', 'AFTERNOON', 'EVENING', 'FULL_DAY', 'CUSTOM']

const SHIFT_BADGE_CLASS_BY_TYPE: Record<StaffShiftRegistrationShiftType, string> = {
  MORNING: 'border-warning/30 bg-warning/10 text-warning',
  AFTERNOON: 'border-info/30 bg-info/10 text-info',
  EVENING: 'border-primary/30 bg-primary/10 text-primary',
  FULL_DAY: 'border-success/30 bg-success/10 text-success',
  CUSTOM: 'border-accent bg-accent text-accent-foreground'
}

const PERIOD_STATUS_CLASS_BY_STATUS: Record<StaffRegistrationPeriodResponse['status'], string> = {
  OPEN: 'border-success/30 bg-success/10 text-success',
  CLOSED: 'border-muted bg-muted text-muted-foreground'
}

function toTimeInputValue(value?: string | null) {
  return value ? value.slice(0, 5) : ''
}

function buildEmptyDraft(workDate: string): RegistrationDraft {
  return {
    workDate,
    preferredShift: 'NONE',
    preferredStartTime: '',
    preferredEndTime: '',
    reason: ''
  }
}

function getPeriodDates(period: StaffRegistrationPeriodResponse | null) {
  if (!period) return []

  const fromDate = parseDateInputValue(period.workFromDate)
  const toDate = parseDateInputValue(period.workToDate)

  if (!fromDate || !toDate || toDate < fromDate) return []

  return getDaysBetween(fromDate, toDate)
}

function buildDrafts(period: StaffRegistrationPeriodResponse, registrations: StaffShiftRegistrationResponse[]) {
  const nextDrafts = getPeriodDates(period).reduce<Record<string, RegistrationDraft>>((drafts, date) => {
    const workDate = toDateInputValue(date)
    drafts[workDate] = buildEmptyDraft(workDate)

    return drafts
  }, {})

  registrations.forEach((registration) => {
    nextDrafts[registration.workDate] = {
      workDate: registration.workDate,
      preferredShift: registration.preferredShift,
      preferredStartTime: toTimeInputValue(registration.preferredStartTime),
      preferredEndTime: toTimeInputValue(registration.preferredEndTime),
      reason: registration.reason ?? ''
    }
  })

  return nextDrafts
}

function getSelectedDrafts(draftMap: Record<string, RegistrationDraft>) {
  return Object.values(draftMap).filter((draft) => draft.preferredShift !== 'NONE')
}

function toPayloadItem(draft: RegistrationDraft): StaffShiftRegistrationItem {
  if (draft.preferredShift === 'NONE') {
    throw new Error('Shift registration draft must be selected before submitting.')
  }

  if (draft.preferredShift !== 'CUSTOM') {
    return {
      workDate: draft.workDate,
      preferredShift: draft.preferredShift,
      preferredStartTime: null,
      preferredEndTime: null,
      reason: null
    }
  }

  return {
    workDate: draft.workDate,
    preferredShift: draft.preferredShift,
    preferredStartTime: draft.preferredStartTime,
    preferredEndTime: draft.preferredEndTime,
    reason: draft.reason.trim()
  }
}

export function StaffShiftRegistrationPage() {
  const { t } = useTranslation('staff')
  const [periodPage, setPeriodPage] = useState(0)
  const [periods, setPeriods] = useState<StaffRegistrationPeriodResponse[]>([])
  const [periodTotalPages, setPeriodTotalPages] = useState(0)
  const [selectedPeriodId, setSelectedPeriodId] = useState('')
  const [savedRegistrations, setSavedRegistrations] = useState<StaffShiftRegistrationResponse[]>([])
  const [drafts, setDrafts] = useState<Record<string, RegistrationDraft>>({})
  const [updateDrafts, setUpdateDrafts] = useState<Record<string, RegistrationDraft>>({})
  const [isLoadingPeriods, setIsLoadingPeriods] = useState(false)
  const [isLoadingRegistrations, setIsLoadingRegistrations] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false)
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null)
  const [updateModalMessage, setUpdateModalMessage] = useState<{ type: 'error'; text: string } | null>(null)

  const selectedPeriod = useMemo(
    () => periods.find((period) => period.registrationPeriodId === selectedPeriodId) ?? null,
    [periods, selectedPeriodId]
  )
  const periodDates = useMemo(() => getPeriodDates(selectedPeriod), [selectedPeriod])
  const selectedDrafts = useMemo(() => getSelectedDrafts(drafts), [drafts])
  const updateSelectedDrafts = useMemo(() => getSelectedDrafts(updateDrafts), [updateDrafts])
  const savedRegistrationByDate = useMemo(
    () =>
      savedRegistrations.reduce<Record<string, StaffShiftRegistrationResponse>>((registrationsByDate, registration) => {
        registrationsByDate[registration.workDate] = registration

        return registrationsByDate
      }, {}),
    [savedRegistrations]
  )

  const loadPeriods = useCallback(async () => {
    setIsLoadingPeriods(true)

    try {
      const response = await staffShiftRegistrationApi.getRegistrationPeriods({
        status: 'ALL',
        page: periodPage,
        size: PERIOD_PAGE_SIZE
      })

      const content = response.data.content ?? []
      setPeriods(content)
      setPeriodTotalPages(response.data.totalPages ?? 0)
      setSelectedPeriodId((currentPeriodId) => {
        const currentPeriod = content.find((period) => period.registrationPeriodId === currentPeriodId)

        if (currentPeriod?.status === 'OPEN') {
          return currentPeriodId
        }

        return content.find((period) => period.status === 'OPEN')?.registrationPeriodId ?? ''
      })
    } catch (error) {
      setMessage({
        type: 'error',
        text: getStaffShiftRegistrationErrorMessage(error, t, 'shiftRegistration.messages.loadPeriodsFailed', 'periods')
      })
    } finally {
      setIsLoadingPeriods(false)
    }
  }, [periodPage, t])

  const loadMyRegistrations = useCallback(async () => {
    if (!selectedPeriod) {
      setSavedRegistrations([])
      setDrafts({})
      return
    }

    setIsLoadingRegistrations(true)

    try {
      const response = await staffShiftRegistrationApi.getMyRegistrations(selectedPeriod.registrationPeriodId)
      const registrations = response.data ?? []
      setSavedRegistrations(registrations)
      setDrafts(buildDrafts(selectedPeriod, registrations))
    } catch (error) {
      setSavedRegistrations([])
      setDrafts(buildDrafts(selectedPeriod, []))
      setMessage({
        type: 'error',
        text: getStaffShiftRegistrationErrorMessage(error, t, 'shiftRegistration.messages.loadRegistrationsFailed')
      })
    } finally {
      setIsLoadingRegistrations(false)
    }
  }, [selectedPeriod, t])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Registration periods are loaded from API pagination.
    void loadPeriods()
  }, [loadPeriods])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Staff registrations are loaded after selecting a period.
    void loadMyRegistrations()
  }, [loadMyRegistrations])

  function updateDraft(workDate: string, changes: Partial<RegistrationDraft>) {
    setDrafts((currentDrafts) => ({
      ...currentDrafts,
      [workDate]: {
        ...(currentDrafts[workDate] ?? buildEmptyDraft(workDate)),
        ...changes
      }
    }))
  }

  function updateModalDraft(workDate: string, changes: Partial<RegistrationDraft>) {
    setUpdateDrafts((currentDrafts) => ({
      ...currentDrafts,
      [workDate]: {
        ...(currentDrafts[workDate] ?? buildEmptyDraft(workDate)),
        ...changes
      }
    }))
  }

  function validateDrafts(nextDrafts: RegistrationDraft[]) {
    if (nextDrafts.length === 0) return t('shiftRegistration.validation.chooseAtLeastOne')

    for (const draft of nextDrafts) {
      if (draft.preferredShift !== 'CUSTOM') continue

      if (!draft.preferredStartTime || !draft.preferredEndTime || !draft.reason.trim()) {
        return t('shiftRegistration.validation.customRequired')
      }

      if (draft.preferredEndTime <= draft.preferredStartTime) {
        return t('shiftRegistration.validation.customTimeInvalid')
      }
    }

    return null
  }

  async function handleCreateSubmit() {
    if (!selectedPeriod) return

    const validationMessage = validateDrafts(selectedDrafts)

    if (validationMessage) {
      setMessage({ type: 'error', text: validationMessage })
      return
    }

    setIsSubmitting(true)
    setMessage(null)

    const registrations = selectedDrafts.map(toPayloadItem)

    try {
      const response = await staffShiftRegistrationApi.createMyRegistrations({
        registrationPeriodId: selectedPeriod.registrationPeriodId,
        registrations
      })

      const savedItems = response.data ?? []
      setSavedRegistrations(savedItems)
      setDrafts(buildDrafts(selectedPeriod, savedItems))
      setMessage({
        type: 'success',
        text: t('shiftRegistration.messages.createSuccess')
      })
    } catch (error) {
      setMessage({
        type: 'error',
        text: getStaffShiftRegistrationErrorMessage(error, t, 'shiftRegistration.messages.saveFailed')
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleOpenUpdateModal() {
    if (!selectedPeriod) return

    setMessage(null)
    setUpdateModalMessage(null)
    setUpdateDrafts(buildDrafts(selectedPeriod, savedRegistrations))
    setIsUpdateModalOpen(true)
  }

  async function handleUpdateSubmit() {
    if (!selectedPeriod) return

    const validationMessage = validateDrafts(updateSelectedDrafts)

    if (validationMessage) {
      setUpdateModalMessage({ type: 'error', text: validationMessage })
      return
    }

    setIsSubmitting(true)
    setMessage(null)
    setUpdateModalMessage(null)

    const registrations = updateSelectedDrafts.map(toPayloadItem)

    try {
      const response = await staffShiftRegistrationApi.updateMyRegistrations(selectedPeriod.registrationPeriodId, {
        registrations
      })

      const savedItems = response.data ?? []
      setSavedRegistrations(savedItems)
      setDrafts(buildDrafts(selectedPeriod, savedItems))
      setUpdateDrafts({})
      setIsUpdateModalOpen(false)
      setUpdateModalMessage(null)
      setMessage({ type: 'success', text: t('shiftRegistration.messages.updateSuccess') })
    } catch (error) {
      setUpdateModalMessage({
        type: 'error',
        text: getStaffShiftRegistrationErrorMessage(error, t, 'shiftRegistration.messages.saveFailed')
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className='flex h-screen overflow-hidden bg-background text-foreground'>
      <StaffSidebar activeItem='shiftRegistration' />
      <div className='flex min-w-0 flex-1 flex-col overflow-hidden'>
        <StaffTopNav titleKey='shiftRegistration.pageTitle' subtitleKey='shiftRegistration.pageSubtitle' />
        <main className='flex-1 overflow-y-auto p-4 md:p-6'>
          <div className='mx-auto flex max-w-7xl flex-col gap-6'>
            <section className='flex flex-col gap-4 border-b border-border pb-6 lg:flex-row lg:items-center lg:justify-between'>
              <div>
                <h1 className='font-display text-2xl font-bold text-card-foreground md:text-3xl'>
                  {t('shiftRegistration.heading')}
                </h1>
                <p className='mt-2 max-w-3xl text-muted-foreground'>{t('shiftRegistration.description')}</p>
              </div>
              <Button type='button' variant='outline' onClick={() => void loadPeriods()}>
                <MaterialIcon name='refresh' className='text-lg' />
                {t('shiftRegistration.actions.refresh')}
              </Button>
            </section>

            {message ? (
              <div
                className={cn(
                  'rounded-xl border px-4 py-3 text-sm font-semibold',
                  message.type === 'success'
                    ? 'border-success/30 bg-success/10 text-success'
                    : 'border-destructive/30 bg-destructive/10 text-destructive'
                )}
              >
                {message.text}
              </div>
            ) : null}

            <section className='grid gap-4'>
              <div>
                <h2 className='font-display text-xl font-bold text-card-foreground'>
                  {t('shiftRegistration.periods.title')}
                </h2>
                <p className='mt-1 text-sm text-muted-foreground'>{t('shiftRegistration.periods.subtitle')}</p>
              </div>

              {isLoadingPeriods ? (
                <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className='h-36 animate-pulse rounded-xl border border-border bg-muted' />
                  ))}
                </div>
              ) : periods.length > 0 ? (
                <>
                  <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
                    {periods.map((period) => (
                      <PeriodCard
                        key={period.registrationPeriodId}
                        isSelected={period.status === 'OPEN' && period.registrationPeriodId === selectedPeriodId}
                        period={period}
                        onSelect={() => {
                          if (period.status !== 'OPEN') return
                          setMessage(null)
                          setSelectedPeriodId(period.registrationPeriodId)
                        }}
                      />
                    ))}
                  </div>
                  <div className='flex items-center justify-end gap-2'>
                    <Button
                      type='button'
                      variant='outline'
                      size='icon'
                      disabled={periodPage <= 0}
                      onClick={() => setPeriodPage((currentPage) => Math.max(currentPage - 1, 0))}
                    >
                      <MaterialIcon name='chevron_left' className='text-lg' />
                    </Button>
                    <span className='text-sm font-bold text-muted-foreground'>
                      {t('shiftRegistration.pagination.page', {
                        page: periodTotalPages === 0 ? 0 : periodPage + 1,
                        totalPages: periodTotalPages
                      })}
                    </span>
                    <Button
                      type='button'
                      variant='outline'
                      size='icon'
                      disabled={periodPage + 1 >= periodTotalPages}
                      onClick={() => setPeriodPage((currentPage) => currentPage + 1)}
                    >
                      <MaterialIcon name='chevron_right' className='text-lg' />
                    </Button>
                  </div>
                </>
              ) : (
                <EmptyState
                  icon='event_busy'
                  title={t('shiftRegistration.periods.emptyTitle')}
                  description={t('shiftRegistration.periods.emptyDescription')}
                />
              )}
            </section>

            {selectedPeriod ? (
              <section className='grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]'>
                <div className='grid gap-4'>
                  <div>
                    <h2 className='font-display text-xl font-bold text-card-foreground'>
                      {t('shiftRegistration.form.title')}
                    </h2>
                    <p className='mt-1 text-sm text-muted-foreground'>{t('shiftRegistration.form.subtitle')}</p>
                  </div>

                  {isLoadingRegistrations ? (
                    <div className='grid gap-3'>
                      {Array.from({ length: 4 }).map((_, index) => (
                        <div key={index} className='h-32 animate-pulse rounded-xl border border-border bg-muted' />
                      ))}
                    </div>
                  ) : periodDates.length > 0 ? (
                    <div className='grid gap-3'>
                      {periodDates.map((date) => {
                        const workDate = toDateInputValue(date)
                        const draft = drafts[workDate] ?? buildEmptyDraft(workDate)
                        const savedRegistration = savedRegistrationByDate[workDate]

                        return (
                          <DayRegistrationCard
                            key={workDate}
                            date={date}
                            draft={draft}
                            isSaved={Boolean(savedRegistration)}
                            isReadOnly={savedRegistrations.length > 0}
                            onChange={(changes) => updateDraft(workDate, changes)}
                          />
                        )
                      })}
                    </div>
                  ) : (
                    <EmptyState
                      icon='date_range'
                      title={t('shiftRegistration.form.emptyRangeTitle')}
                      description={t('shiftRegistration.form.emptyRangeDescription')}
                    />
                  )}
                </div>

                <aside className='h-fit rounded-xl border border-border bg-card p-5 shadow-sm xl:sticky xl:top-6'>
                  <h2 className='font-display text-lg font-bold text-card-foreground'>
                    {t('shiftRegistration.summary.title')}
                  </h2>
                  <p className='mt-1 text-sm text-muted-foreground'>
                    {t('shiftRegistration.summary.count', { count: selectedDrafts.length })}
                  </p>

                  <div className='mt-4 grid gap-3'>
                    {selectedDrafts.length > 0 ? (
                      selectedDrafts.map((draft) => <SummaryItem key={draft.workDate} draft={draft} />)
                    ) : (
                      <p className='rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground'>
                        {t('shiftRegistration.summary.empty')}
                      </p>
                    )}
                  </div>

                  <Button
                    type='button'
                    className='mt-5 w-full'
                    disabled={isSubmitting || isLoadingRegistrations}
                    onClick={() =>
                      savedRegistrations.length > 0 ? handleOpenUpdateModal() : void handleCreateSubmit()
                    }
                  >
                    <MaterialIcon
                      name={savedRegistrations.length > 0 ? 'edit_calendar' : 'how_to_reg'}
                      className='text-lg'
                    />
                    {isSubmitting
                      ? t('shiftRegistration.actions.saving')
                      : savedRegistrations.length > 0
                        ? t('shiftRegistration.actions.update')
                        : t('shiftRegistration.actions.create')}
                  </Button>
                </aside>
              </section>
            ) : null}
          </div>
        </main>
      </div>

      <ShiftRegistrationUpdateModal
        drafts={updateDrafts}
        isOpen={isUpdateModalOpen}
        isSubmitting={isSubmitting}
        message={updateModalMessage}
        period={selectedPeriod}
        selectedCount={updateSelectedDrafts.length}
        onChange={updateModalDraft}
        onClose={() => {
          if (isSubmitting) return
          setUpdateModalMessage(null)
          setIsUpdateModalOpen(false)
        }}
        onSubmit={() => void handleUpdateSubmit()}
      />
    </div>
  )
}

interface PeriodCardProps {
  isSelected: boolean
  period: StaffRegistrationPeriodResponse
  onSelect: () => void
}

function PeriodCard({ isSelected, period, onSelect }: PeriodCardProps) {
  const { t } = useTranslation('staff')
  const canSelect = period.status === 'OPEN'

  return (
    <button
      type='button'
      disabled={!canSelect}
      onClick={onSelect}
      className={cn(
        'rounded-xl border bg-card p-4 text-left shadow-sm transition-colors',
        canSelect ? 'hover:border-primary hover:bg-muted/60' : 'cursor-not-allowed opacity-75',
        isSelected ? 'border-primary ring-2 ring-ring' : 'border-border'
      )}
    >
      <div className='flex items-start justify-between gap-3'>
        <span
          className={cn(
            'rounded-full border px-3 py-1 text-xs font-bold',
            PERIOD_STATUS_CLASS_BY_STATUS[period.status]
          )}
        >
          {t(`shiftRegistration.statuses.${period.status}`)}
        </span>
        {isSelected ? <MaterialIcon name='check_circle' className='text-primary' filled /> : null}
      </div>
      <p className='mt-4 text-sm font-bold uppercase text-muted-foreground'>
        {t('shiftRegistration.periods.workRange')}
      </p>
      <p className='mt-1 font-display text-lg font-bold text-card-foreground'>
        {formatStaffScheduleDate(period.workFromDate)} - {formatStaffScheduleDate(period.workToDate)}
      </p>
      <p className='mt-3 text-xs font-semibold text-muted-foreground'>
        {formatStaffScheduleDateTime(period.registerOpenAt)} - {formatStaffScheduleDateTime(period.registerCloseAt)}
      </p>
      {!canSelect ? (
        <p className='mt-3 rounded-lg border border-border bg-muted px-3 py-2 text-xs font-semibold text-muted-foreground'>
          {t('shiftRegistration.periods.closedHint')}
        </p>
      ) : null}
    </button>
  )
}

interface DayRegistrationCardProps {
  date: Date
  draft: RegistrationDraft
  isReadOnly?: boolean
  isSaved: boolean
  onChange: (changes: Partial<RegistrationDraft>) => void
}

function DayRegistrationCard({ date, draft, isReadOnly = false, isSaved, onChange }: DayRegistrationCardProps) {
  const { t } = useTranslation('staff')
  const isCustom = draft.preferredShift === 'CUSTOM'

  return (
    <article className='rounded-xl border border-border bg-card p-4 shadow-sm'>
      <div className='grid gap-4 lg:grid-cols-[11rem_minmax(0,1fr)] lg:items-start'>
        <div>
          <p className='text-sm font-bold uppercase text-muted-foreground'>{formatWeekday(date)}</p>
          <p className='mt-1 font-display text-2xl font-bold text-card-foreground'>
            {formatStaffScheduleDate(draft.workDate)}
          </p>
          {isSaved ? (
            <span className='mt-3 inline-flex rounded-full border border-success/30 bg-success/10 px-3 py-1 text-xs font-bold text-success'>
              {t('shiftRegistration.form.saved')}
            </span>
          ) : null}
        </div>

        <div className='grid gap-4 md:grid-cols-2'>
          <label className='grid gap-2'>
            <span className='text-sm font-bold text-card-foreground'>{t('shiftRegistration.form.shift')}</span>
            <select
              value={draft.preferredShift}
              disabled={isReadOnly}
              onChange={(event) =>
                onChange({
                  preferredShift: event.target.value as DraftShiftType,
                  preferredStartTime: '',
                  preferredEndTime: '',
                  reason: ''
                })
              }
              className='h-11 w-full rounded-lg border border-input bg-muted px-4 text-sm font-semibold text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-70'
            >
              {SHIFT_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option === 'NONE'
                    ? t('shiftRegistration.shiftTypes.NONE')
                    : t(`shiftRegistration.shiftTypes.${option}`)}
                </option>
              ))}
            </select>
          </label>

          {draft.preferredShift !== 'NONE' ? (
            <div className='flex items-end'>
              <ShiftBadge shiftType={draft.preferredShift} />
            </div>
          ) : null}

          {isCustom ? (
            <>
              <label className='grid gap-2'>
                <span className='text-sm font-bold text-card-foreground'>{t('shiftRegistration.form.startTime')}</span>
                <input
                  type='time'
                  value={draft.preferredStartTime}
                  disabled={isReadOnly}
                  onChange={(event) => onChange({ preferredStartTime: event.target.value })}
                  className='h-11 w-full rounded-lg border border-input bg-muted px-4 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-70'
                />
              </label>
              <label className='grid gap-2'>
                <span className='text-sm font-bold text-card-foreground'>{t('shiftRegistration.form.endTime')}</span>
                <input
                  type='time'
                  value={draft.preferredEndTime}
                  disabled={isReadOnly}
                  onChange={(event) => onChange({ preferredEndTime: event.target.value })}
                  className='h-11 w-full rounded-lg border border-input bg-muted px-4 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-70'
                />
              </label>
              <label className='grid gap-2 md:col-span-2'>
                <span className='text-sm font-bold text-card-foreground'>{t('shiftRegistration.form.reason')}</span>
                <textarea
                  value={draft.reason}
                  disabled={isReadOnly}
                  onChange={(event) => onChange({ reason: event.target.value })}
                  placeholder={t('shiftRegistration.form.reasonPlaceholder')}
                  rows={3}
                  className='w-full resize-none rounded-lg border border-input bg-muted px-4 py-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-70'
                />
              </label>
            </>
          ) : null}
        </div>
      </div>
    </article>
  )
}

interface ShiftRegistrationUpdateModalProps {
  drafts: Record<string, RegistrationDraft>
  isOpen: boolean
  isSubmitting: boolean
  message: { type: 'error'; text: string } | null
  period: StaffRegistrationPeriodResponse | null
  selectedCount: number
  onChange: (workDate: string, changes: Partial<RegistrationDraft>) => void
  onClose: () => void
  onSubmit: () => void
}

function ShiftRegistrationUpdateModal({
  drafts,
  isOpen,
  isSubmitting,
  message,
  period,
  selectedCount,
  onChange,
  onClose,
  onSubmit
}: ShiftRegistrationUpdateModalProps) {
  const { t } = useTranslation('staff')
  const periodDates = getPeriodDates(period)

  if (!isOpen || !period) return null

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm'>
      <section className='flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl border border-border bg-card shadow-xl'>
        <header className='flex shrink-0 items-start justify-between gap-4 border-b border-border px-5 py-4'>
          <div>
            <h2 className='font-display text-xl font-bold text-card-foreground'>
              {t('shiftRegistration.updateModal.title')}
            </h2>
            <p className='mt-1 text-sm text-muted-foreground'>{t('shiftRegistration.updateModal.subtitle')}</p>
          </div>
          <button
            type='button'
            aria-label={t('shiftRegistration.updateModal.close')}
            className='rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-primary'
            disabled={isSubmitting}
            onClick={onClose}
          >
            <MaterialIcon name='close' />
          </button>
        </header>

        <div className='min-h-0 flex-1 overflow-y-auto p-5'>
          {message ? (
            <div className='mb-4 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-semibold text-destructive'>
              {message.text}
            </div>
          ) : null}

          <div className='grid gap-3'>
            {periodDates.map((date) => {
              const workDate = toDateInputValue(date)
              const draft = drafts[workDate] ?? buildEmptyDraft(workDate)

              return (
                <DayRegistrationCard
                  key={workDate}
                  date={date}
                  draft={draft}
                  isSaved={false}
                  onChange={(changes) => onChange(workDate, changes)}
                />
              )
            })}
          </div>
        </div>

        <footer className='flex shrink-0 flex-col gap-3 border-t border-border bg-muted px-5 py-4 sm:flex-row sm:items-center sm:justify-between'>
          <p className='text-sm font-semibold text-muted-foreground'>
            {t('shiftRegistration.summary.count', { count: selectedCount })}
          </p>
          <div className='flex flex-col gap-2 sm:flex-row sm:items-center'>
            <Button type='button' variant='outline' disabled={isSubmitting} onClick={onClose}>
              {t('shiftRegistration.actions.cancel')}
            </Button>
            <Button type='button' disabled={isSubmitting} onClick={onSubmit}>
              <MaterialIcon name='save' className='text-lg' />
              {isSubmitting ? t('shiftRegistration.actions.saving') : t('shiftRegistration.actions.update')}
            </Button>
          </div>
        </footer>
      </section>
    </div>
  )
}

function ShiftBadge({ shiftType }: { shiftType: StaffShiftRegistrationShiftType }) {
  const { t } = useTranslation('staff')

  return (
    <span
      className={cn(
        'inline-flex rounded-full border px-3 py-1 text-xs font-bold',
        SHIFT_BADGE_CLASS_BY_TYPE[shiftType]
      )}
    >
      {t(`shiftRegistration.shiftTypes.${shiftType}`)}
    </span>
  )
}

function SummaryItem({ draft }: { draft: RegistrationDraft }) {
  const { t } = useTranslation('staff')
  const isCustom = draft.preferredShift === 'CUSTOM'

  return (
    <div className='rounded-lg border border-border bg-background p-3'>
      <div className='flex items-center justify-between gap-3'>
        <p className='font-semibold text-card-foreground'>{formatStaffScheduleDate(draft.workDate)}</p>
        <ShiftBadge shiftType={draft.preferredShift as StaffShiftRegistrationShiftType} />
      </div>
      {isCustom ? (
        <p className='mt-2 text-sm text-muted-foreground'>
          {draft.preferredStartTime} - {draft.preferredEndTime}
        </p>
      ) : (
        <p className='mt-2 text-sm text-muted-foreground'>{t('shiftRegistration.summary.standardShift')}</p>
      )}
    </div>
  )
}

interface EmptyStateProps {
  description: string
  icon: string
  title: string
}

function EmptyState({ description, icon, title }: EmptyStateProps) {
  return (
    <div className='rounded-xl border border-dashed border-border bg-card p-8 text-center'>
      <MaterialIcon name={icon} className='mx-auto text-4xl text-muted-foreground' />
      <h2 className='mt-3 font-display text-lg font-bold text-card-foreground'>{title}</h2>
      <p className='mx-auto mt-2 max-w-lg text-sm text-muted-foreground'>{description}</p>
    </div>
  )
}
