import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router'

import { cn } from '~/shared/lib/cn'
import { Button, MaterialIcon } from '~/shared/ui'

import { ManagerSidebar } from '../components/layout/manager-sidebar'
import { ManagerTopNav } from '../components/layout/manager-top-nav'
import {
  workScheduleApi,
  type StaffAttendanceStatus,
  type StaffAssignedResponse,
  type WorkScheduleResponse
} from '../services'
import { formatWorkScheduleDateTime } from '../lib/work-schedule-format'
import { getWorkScheduleErrorMessage } from '../lib/work-schedule-error'

export function ManagerStaffScheduleStaffPage() {
  const { t } = useTranslation('manager')
  const navigate = useNavigate()
  const { workScheduleId } = useParams()
  const [schedule, setSchedule] = useState<WorkScheduleResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const loadSchedule = useCallback(async () => {
    if (!workScheduleId) return

    setIsLoading(true)
    setMessage(null)

    try {
      const response = await workScheduleApi.getWorkScheduleById(workScheduleId)
      setSchedule(response.data)
    } catch (error) {
      setMessage({
        type: 'error',
        text: getWorkScheduleErrorMessage(
          error,
          t,
          'staffSchedule.workSchedules.messages.loadDetailFailed',
          'detail'
        )
      })
    } finally {
      setIsLoading(false)
    }
  }, [t, workScheduleId])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Data is loaded from route params.
    void loadSchedule()
  }, [loadSchedule])

  async function handleRemoveStaff(staffScheduleId: string) {
    setIsSubmitting(true)
    setMessage(null)

    try {
      await workScheduleApi.removeStaffFromWorkSchedule(staffScheduleId)
      await loadSchedule()
      setMessage({ type: 'success', text: t('staffSchedule.workSchedules.messages.removed') })
    } catch (error) {
      setMessage({
        type: 'error',
        text: getWorkScheduleErrorMessage(
          error,
          t,
          'staffSchedule.workSchedules.messages.removeFailed',
          'remove'
        )
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const assignedStaffs = schedule?.assignedStaffs ?? []

  return (
    <div className='flex h-screen overflow-hidden bg-background text-foreground'>
      <ManagerSidebar activeItem='staff' />
      <div className='flex min-w-0 flex-1 flex-col overflow-hidden'>
        <ManagerTopNav titleKey='staffSchedule.staffPage.title' subtitleKey='staffSchedule.staffPage.subtitle' />
        <main className='flex-1 overflow-y-auto p-4 md:p-6'>
          <div className='mx-auto flex max-w-5xl flex-col gap-6'>
            <div className='flex flex-col gap-3 border-b border-border pb-6 md:flex-row md:items-center md:justify-between'>
              <div>
                <h1 className='font-display text-2xl font-bold text-card-foreground md:text-3xl'>
                  {t('staffSchedule.staffPage.title')}
                </h1>
                <p className='mt-2 text-muted-foreground'>{t('staffSchedule.staffPage.subtitle')}</p>
              </div>
              <Button
                type='button'
                variant='outline'
                onClick={() => void navigate(`/manager/staff-schedule/${workScheduleId}`)}
              >
                <MaterialIcon name='arrow_back' className='text-lg' />
                {t('staffSchedule.workSchedules.actions.backToDetail')}
              </Button>
            </div>

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

            <section className='rounded-xl border border-border bg-card p-5 shadow-sm'>
              <div className='mb-5 flex items-center justify-between gap-4'>
                <div>
                  <h2 className='font-display text-lg font-bold text-card-foreground'>
                    {t('staffSchedule.workSchedules.detail.assignedStaffs')}
                  </h2>
                  <p className='text-sm text-muted-foreground'>
                    {t('staffSchedule.workSchedules.detail.staffCountText', {
                      count: assignedStaffs.length
                    })}
                  </p>
                </div>
                <span className='flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary'>
                  <MaterialIcon name='groups' className='text-2xl' />
                </span>
              </div>

              {isLoading ? (
                <div className='grid gap-3 md:grid-cols-2'>
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className='h-32 animate-pulse rounded-lg bg-muted' />
                  ))}
                </div>
              ) : assignedStaffs.length > 0 ? (
                <div className='grid gap-3 md:grid-cols-2'>
                  {assignedStaffs.map((staff) => (
                    <AssignedStaffCard
                      key={staff.staffScheduleId}
                      staff={staff}
                      disabled={isSubmitting}
                      onRemove={handleRemoveStaff}
                    />
                  ))}
                </div>
              ) : (
                <p className='rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground'>
                  {t('staffSchedule.workSchedules.detail.noStaffs')}
                </p>
              )}
            </section>
          </div>
        </main>
      </div>
    </div>
  )
}

function getAttendanceStatusClassName(status: StaffAttendanceStatus) {
  if (status === 'ON_TIME') return 'bg-success/10 text-success'
  if (status === 'LATE') return 'bg-warning/10 text-warning'
  if (status === 'LEAVE') return 'bg-info/10 text-info'

  return 'bg-destructive/10 text-destructive'
}

interface AssignedStaffCardProps {
  staff: StaffAssignedResponse
  disabled: boolean
  onRemove: (staffScheduleId: string) => Promise<void>
}

function AssignedStaffCard({ staff, disabled, onRemove }: AssignedStaffCardProps) {
  const { t } = useTranslation('manager')

  return (
    <article className='rounded-lg border border-border bg-background p-4'>
      <div className='flex items-start justify-between gap-3'>
        <div className='min-w-0'>
          <p className='truncate font-semibold text-foreground'>{staff.staffName}</p>
          {staff.staffEmail && (
            <p className='truncate text-xs text-muted-foreground'>{staff.staffEmail}</p>
          )}
        </div>
        <div className='flex shrink-0 flex-wrap justify-end gap-1.5'>
          <span
            className={cn(
              'rounded-full px-2 py-1 text-xs font-bold',
              staff.scheduleStatus === 'CANCELLED'
                ? 'bg-destructive/10 text-destructive'
                : 'bg-success/10 text-success'
            )}
          >
            {t(`staffSchedule.workSchedules.statuses.${staff.scheduleStatus}`)}
          </span>
          {staff.attendanceStatus ? (
            <span
              className={cn(
                'rounded-full px-2 py-1 text-xs font-bold',
                getAttendanceStatusClassName(staff.attendanceStatus)
              )}
            >
              {t(`staffSchedule.workSchedules.attendanceStatuses.${staff.attendanceStatus}`)}
            </span>
          ) : null}
        </div>
      </div>
      <div className='mt-4 grid gap-2 text-xs text-muted-foreground sm:grid-cols-3'>
        <span>{t('staffSchedule.workSchedules.detail.assignedAt')}: {formatWorkScheduleDateTime(staff.assignedAt)}</span>
        <span>{t('staffSchedule.workSchedules.detail.checkIn')}: {formatWorkScheduleDateTime(staff.checkInAt)}</span>
        <span>{t('staffSchedule.workSchedules.detail.checkOut')}: {formatWorkScheduleDateTime(staff.checkOutAt)}</span>
      </div>
      <div className='mt-2 text-xs text-muted-foreground'>
        {t('staffSchedule.workSchedules.detail.attendanceStatus')}: {' '}
        <span className='font-semibold text-foreground'>
          {staff.attendanceStatus
            ? t(`staffSchedule.workSchedules.attendanceStatuses.${staff.attendanceStatus}`)
            : '-'}
        </span>
      </div>
      <Button
        type='button'
        variant='destructive'
        size='sm'
        disabled={disabled || staff.scheduleStatus === 'CANCELLED'}
        className='mt-4 w-full'
        onClick={() => void onRemove(staff.staffScheduleId)}
      >
        <MaterialIcon name='person_remove' className='text-lg' />
        {t('staffSchedule.workSchedules.actions.remove')}
      </Button>
    </article>
  )
}
