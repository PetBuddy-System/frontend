import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router'

import { cn } from '~/shared/lib/cn'
import { Button, MaterialIcon } from '~/shared/ui'

import { StaffSidebar } from '../components/layout/staff-sidebar'
import { StaffTopNav } from '../components/layout/staff-top-nav'
import { getStaffScheduleErrorMessage } from '../lib/staff-schedule-error'
import {
  formatStaffScheduleDate,
  formatStaffScheduleDateTime
} from '../lib/staff-schedule-format'
import {
  getStaffScheduleShiftClassName,
  getStaffScheduleStatusClassName
} from '../lib/staff-schedule-style'
import { staffScheduleApi, type StaffScheduleResponse } from '../services'

export function StaffScheduleDetailPage() {
  const { t } = useTranslation('staff')
  const navigate = useNavigate()
  const { staffScheduleId } = useParams()
  const [schedule, setSchedule] = useState<StaffScheduleResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const loadSchedule = useCallback(async () => {
    if (!staffScheduleId) return

    setIsLoading(true)
    setMessage(null)

    try {
      const response = await staffScheduleApi.getStaffSchedule(staffScheduleId)
      setSchedule(response.data)
    } catch (error) {
      setMessage({
        type: 'error',
        text: getStaffScheduleErrorMessage(error, t, 'staffSchedule.messages.loadDetailFailed', 'detail')
      })
    } finally {
      setIsLoading(false)
    }
  }, [staffScheduleId, t])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Detail data is loaded from route params.
    void loadSchedule()
  }, [loadSchedule])

  async function handleCheckIn() {
    if (!schedule) return

    setIsSubmitting(true)
    setMessage(null)

    try {
      const response = await staffScheduleApi.checkIn(schedule.staffScheduleId)
      setSchedule(response.data)
      setMessage({ type: 'success', text: t('staffSchedule.messages.checkInSuccess') })
    } catch (error) {
      setMessage({
        type: 'error',
        text: getStaffScheduleErrorMessage(error, t, 'staffSchedule.messages.checkInFailed', 'checkIn')
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleCheckOut() {
    if (!schedule) return

    setIsSubmitting(true)
    setMessage(null)

    try {
      const response = await staffScheduleApi.checkOut(schedule.staffScheduleId)
      setSchedule(response.data)
      setMessage({ type: 'success', text: t('staffSchedule.messages.checkOutSuccess') })
    } catch (error) {
      setMessage({
        type: 'error',
        text: getStaffScheduleErrorMessage(error, t, 'staffSchedule.messages.checkOutFailed', 'checkOut')
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className='flex h-screen overflow-hidden bg-background text-foreground'>
      <StaffSidebar activeItem='weeklySchedule' />
      <div className='flex min-w-0 flex-1 flex-col overflow-hidden'>
        <StaffTopNav titleKey='staffSchedule.detail.pageTitle' subtitleKey='staffSchedule.detail.pageSubtitle' />
        <main className='flex-1 overflow-y-auto p-4 md:p-6'>
          <div className='mx-auto flex max-w-5xl flex-col gap-6'>
            <section className='flex flex-col gap-4 border-b border-border pb-6 md:flex-row md:items-center md:justify-between'>
              <div>
                <h1 className='font-display text-2xl font-bold text-card-foreground md:text-3xl'>
                  {t('staffSchedule.detail.title')}
                </h1>
                <p className='mt-2 text-muted-foreground'>{t('staffSchedule.detail.subtitle')}</p>
              </div>
              <Button type='button' variant='outline' onClick={() => void navigate('/staff/weekly-schedule')}>
                <MaterialIcon name='arrow_back' className='text-lg' />
                {t('staffSchedule.actions.backToSchedule')}
              </Button>
            </section>

            {message && (
              <div
                className={cn(
                  'rounded-xl border px-4 py-3 text-sm font-medium',
                  message.type === 'success'
                    ? 'border-success/30 bg-success/10 text-success'
                    : 'border-destructive/30 bg-destructive/10 text-destructive'
                )}
              >
                {message.text}
              </div>
            )}

            {isLoading ? (
              <section className='rounded-xl border border-border bg-card p-8 shadow-sm'>
                <div className='grid gap-3 md:grid-cols-2'>
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div key={index} className='h-20 animate-pulse rounded-lg bg-muted' />
                  ))}
                </div>
              </section>
            ) : schedule ? (
              <div className='grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]'>
                <section className='rounded-xl border border-border bg-card p-5 shadow-sm'>
                  <div
                    className={cn(
                      'mb-5 rounded-lg border p-5',
                      getStaffScheduleShiftClassName(schedule.shiftType)
                    )}
                  >
                    <div className='flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
                      <div>
                        <h2 className='font-display text-3xl font-bold'>
                          {t(`staffSchedule.shiftTypes.${schedule.shiftType}`)}
                        </h2>
                        <div className='mt-3 flex flex-wrap gap-2 text-sm font-semibold'>
                          <span className='rounded-full border border-current/20 bg-background/40 px-3 py-1'>
                            {t('staffSchedule.detail.startTime')}: {schedule.startTime}
                          </span>
                          <span className='rounded-full border border-current/20 bg-background/40 px-3 py-1'>
                            {t('staffSchedule.detail.endTime')}: {schedule.endTime}
                          </span>
                        </div>
                      </div>
                      <span
                        className={cn(
                          'w-fit rounded-full border px-3 py-1 text-xs font-bold',
                          getStaffScheduleStatusClassName(schedule.scheduleStatus)
                        )}
                      >
                        {t(`staffSchedule.statuses.${schedule.scheduleStatus}`)}
                      </span>
                    </div>
                  </div>

                  <div className='grid gap-3 md:grid-cols-2'>
                    <DetailItem
                      icon='event'
                      label={t('staffSchedule.detail.date')}
                      value={formatStaffScheduleDate(schedule.workDate)}
                    />
                    <DetailItem
                      icon='login'
                      label={t('staffSchedule.detail.startTime')}
                      value={schedule.startTime}
                    />
                    <DetailItem
                      icon='logout'
                      label={t('staffSchedule.detail.endTime')}
                      value={schedule.endTime}
                    />
                    <DetailItem
                      icon='login'
                      label={t('staffSchedule.detail.checkInAt')}
                      value={formatStaffScheduleDateTime(schedule.checkInAt)}
                    />
                    <DetailItem
                      icon='logout'
                      label={t('staffSchedule.detail.checkOutAt')}
                      value={formatStaffScheduleDateTime(schedule.checkOutAt)}
                    />
                    <DetailItem
                      icon='update'
                      label={t('staffSchedule.detail.updatedAt')}
                      value={formatStaffScheduleDateTime(schedule.updatedAt)}
                    />
                  </div>

                  <div className='mt-5 rounded-lg border border-border bg-background p-4'>
                    <p className='text-xs font-bold uppercase text-muted-foreground'>
                      {t('staffSchedule.detail.note')}
                    </p>
                    <p className='mt-2 whitespace-pre-wrap text-sm text-card-foreground'>
                      {schedule.note || t('staffSchedule.detail.noNote')}
                    </p>
                  </div>
                </section>

                <aside className='rounded-xl border border-border bg-card p-5 shadow-sm'>
                  <div className='flex items-start justify-between gap-4'>
                    <div>
                      <h2 className='font-display text-lg font-bold text-card-foreground'>
                        {t('staffSchedule.detail.actionsTitle')}
                      </h2>
                      <p className='mt-1 text-sm text-muted-foreground'>{t('staffSchedule.detail.actionHint')}</p>
                    </div>
                    <span className='flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary'>
                      <MaterialIcon name='fact_check' className='text-2xl' />
                    </span>
                  </div>

                  <div className='mt-5 grid gap-3'>
                    <Button type='button' disabled={isSubmitting} onClick={() => void handleCheckIn()}>
                      <MaterialIcon name='login' className='text-lg' />
                      {t('staffSchedule.actions.checkIn')}
                    </Button>
                    <Button
                      type='button'
                      variant='outline'
                      disabled={isSubmitting}
                      onClick={() => void handleCheckOut()}
                    >
                      <MaterialIcon name='logout' className='text-lg' />
                      {t('staffSchedule.actions.checkOut')}
                    </Button>
                  </div>
                </aside>
              </div>
            ) : (
              <section className='rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground shadow-sm'>
                {t('staffSchedule.errors.notFound')}
              </section>
            )}
          </div>
        </main>
      </div>
    </div>
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
        <p className='mt-1 truncate font-semibold text-foreground'>{value}</p>
      </div>
    </div>
  )
}
