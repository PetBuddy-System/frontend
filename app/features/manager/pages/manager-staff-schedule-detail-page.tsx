import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router'

import { Button, MaterialIcon } from '~/shared/ui'

import { ManagerSidebar } from '../components/layout/manager-sidebar'
import { ManagerTopNav } from '../components/layout/manager-top-nav'
import { workScheduleApi, type WorkScheduleResponse } from '../services'
import { formatWorkScheduleDate, formatWorkScheduleDateTime } from '../lib/work-schedule-format'
import { getWorkScheduleErrorMessage } from '../lib/work-schedule-error'

export function ManagerStaffScheduleDetailPage() {
  const { t } = useTranslation('manager')
  const navigate = useNavigate()
  const { workScheduleId } = useParams()
  const [schedule, setSchedule] = useState<WorkScheduleResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'error'; text: string } | null>(null)

  const loadDetail = useCallback(async () => {
    if (!workScheduleId) return

    setIsLoading(true)
    setMessage(null)

    try {
      const response = await workScheduleApi.getWorkScheduleById(workScheduleId)
      setSchedule(response.data)
    } catch (error) {
      setMessage({
        type: 'error',
        text: getWorkScheduleErrorMessage(error, t, 'staffSchedule.workSchedules.messages.loadDetailFailed', 'detail')
      })
    } finally {
      setIsLoading(false)
    }
  }, [t, workScheduleId])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Detail data is loaded from route params.
    void loadDetail()
  }, [loadDetail])

  const assignedStaffs = schedule?.assignedStaffs ?? []

  return (
    <div className='flex h-screen overflow-hidden bg-background text-foreground'>
      <ManagerSidebar activeItem='staff' />
      <div className='flex min-w-0 flex-1 flex-col overflow-hidden'>
        <ManagerTopNav titleKey='staffSchedule.detailPage.title' subtitleKey='staffSchedule.detailPage.subtitle' />
        <main className='flex-1 overflow-y-auto p-4 md:p-6'>
          <div className='mx-auto flex max-w-5xl flex-col gap-6'>
            <div className='flex flex-col gap-3 border-b border-border pb-6 md:flex-row md:items-center md:justify-between'>
              <div>
                <h1 className='font-display text-2xl font-bold text-card-foreground md:text-3xl'>
                  {t('staffSchedule.detailPage.title')}
                </h1>
                <p className='mt-2 text-muted-foreground'>{t('staffSchedule.detailPage.subtitle')}</p>
              </div>
              <div className='flex flex-wrap gap-2'>
                <Button type='button' variant='outline' onClick={() => void navigate('/manager/staff-schedule')}>
                  <MaterialIcon name='arrow_back' className='text-lg' />
                  {t('staffSchedule.workSchedules.actions.backToList')}
                </Button>
                <Button type='button' onClick={() => void navigate(`/manager/staff-schedule/${workScheduleId}/edit`)}>
                  <MaterialIcon name='edit' className='text-lg' />
                  {t('staffSchedule.workSchedules.actions.edit')}
                </Button>
              </div>
            </div>

            {message && (
              <div className='rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive'>
                {message.text}
              </div>
            )}

            {isLoading ? (
              <section className='rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground shadow-sm'>
                {t('staffSchedule.workSchedules.detail.loading')}
              </section>
            ) : !schedule ? (
              <section className='rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground shadow-sm'>
                {t('staffSchedule.workSchedules.errors.notFound')}
              </section>
            ) : (
              <div className='grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]'>
                <section className='rounded-xl border border-border bg-card p-5 shadow-sm'>
                  <h2 className='font-display text-lg font-bold text-card-foreground'>
                    {t('staffSchedule.workSchedules.detail.title')}
                  </h2>
                  <div className='mt-5 grid gap-4 md:grid-cols-2'>
                    <DetailItem
                      icon='event'
                      label={t('staffSchedule.workSchedules.detail.date')}
                      value={formatWorkScheduleDate(schedule.workDate)}
                    />
                    <DetailItem
                      icon='schedule'
                      label={t('staffSchedule.workSchedules.detail.time')}
                      value={`${schedule.startTime} - ${schedule.endTime}`}
                    />
                    <DetailItem
                      icon='work_history'
                      label={t('staffSchedule.workSchedules.detail.shift')}
                      value={t(`staffSchedule.workSchedules.shiftTypes.${schedule.shiftType}`)}
                    />
                    <DetailItem
                      icon='groups'
                      label={t('staffSchedule.workSchedules.detail.staffCount')}
                      value={String(assignedStaffs.length)}
                    />
                    <DetailItem
                      icon='calendar_add_on'
                      label={t('staffSchedule.workSchedules.detail.createdAt')}
                      value={formatWorkScheduleDateTime(schedule.createdAt)}
                    />
                    <DetailItem
                      icon='update'
                      label={t('staffSchedule.workSchedules.detail.updatedAt')}
                      value={formatWorkScheduleDateTime(schedule.updatedAt)}
                    />
                  </div>

                  <div className='mt-5 rounded-lg border border-border bg-background p-4'>
                    <p className='text-xs font-bold uppercase text-muted-foreground'>
                      {t('staffSchedule.workSchedules.detail.note')}
                    </p>
                    <p className='mt-2 whitespace-pre-wrap text-sm text-card-foreground'>
                      {schedule.note || t('staffSchedule.workSchedules.detail.noNote')}
                    </p>
                  </div>
                </section>

                <aside className='rounded-xl border border-border bg-card p-5 shadow-sm'>
                  <div className='flex items-start justify-between gap-4'>
                    <div>
                      <h2 className='font-display text-lg font-bold text-card-foreground'>
                        {t('staffSchedule.workSchedules.detail.assignedStaffs')}
                      </h2>
                      <p className='mt-1 text-sm text-muted-foreground'>
                        {t('staffSchedule.workSchedules.detail.staffCountText', {
                          count: assignedStaffs.length
                        })}
                      </p>
                    </div>
                    <span className='flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary'>
                      <MaterialIcon name='groups' className='text-2xl' />
                    </span>
                  </div>
                  <div className='mt-4 flex flex-col gap-2'>
                    <Button
                      type='button'
                      variant='outline'
                      className='w-full'
                      onClick={() => void navigate(`/manager/staff-schedule/${workScheduleId}/staff`)}
                    >
                      <MaterialIcon name='groups' className='text-lg' />
                      {t('staffSchedule.workSchedules.actions.viewStaffs')}
                    </Button>
                    <Button
                      type='button'
                      className='w-full'
                      onClick={() => void navigate(`/manager/staff-schedule/${workScheduleId}/edit`)}
                    >
                      <MaterialIcon name='edit' className='text-lg' />
                      {t('staffSchedule.workSchedules.actions.edit')}
                    </Button>
                  </div>
                </aside>
              </div>
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
    <div className='rounded-lg border border-border bg-background p-4'>
      <div className='flex items-center gap-2 text-xs font-bold uppercase text-muted-foreground'>
        <MaterialIcon name={icon} className='text-base text-primary' />
        <span>{label}</span>
      </div>
      <p className='mt-2 font-semibold text-foreground'>{value}</p>
    </div>
  )
}
