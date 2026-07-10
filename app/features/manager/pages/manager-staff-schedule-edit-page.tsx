import { useCallback, useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router'

import { cn } from '~/shared/lib/cn'
import { Button, MaterialIcon } from '~/shared/ui'
import type { UserResponse } from '~/shared/lib/auth'

import { WorkScheduleStaffSelect } from '../components/staff-schedule/work-schedule-staff-select'
import { ManagerSidebar } from '../components/layout/manager-sidebar'
import { ManagerTopNav } from '../components/layout/manager-top-nav'
import {
  workScheduleApi,
  type WorkScheduleResponse,
  type WorkScheduleShiftType
} from '../services'
import { formatWorkScheduleDateTime } from '../lib/work-schedule-format'
import { getWorkScheduleErrorMessage } from '../lib/work-schedule-error'

const SHIFT_TYPES: WorkScheduleShiftType[] = ['MORNING', 'AFTERNOON', 'EVENING', 'FULL_DAY', 'CUSTOM']

interface ScheduleFormState {
  workDate: string
  startTime: string
  endTime: string
  shiftType: WorkScheduleShiftType
  note: string
}

interface ReassignFormState {
  staffScheduleId: string
  newStaff: string
  reason: string
}

function toForm(schedule: WorkScheduleResponse): ScheduleFormState {
  return {
    workDate: schedule.workDate ?? '',
    startTime: schedule.startTime ?? '',
    endTime: schedule.endTime ?? '',
    shiftType: schedule.shiftType ?? 'MORNING',
    note: schedule.note ?? ''
  }
}

export function ManagerStaffScheduleEditPage() {
  const { t } = useTranslation('manager')
  const navigate = useNavigate()
  const { workScheduleId } = useParams()
  const [schedule, setSchedule] = useState<WorkScheduleResponse | null>(null)
  const [staffs, setStaffs] = useState<UserResponse[]>([])
  const [form, setForm] = useState<ScheduleFormState | null>(null)
  const [assignStaffIds, setAssignStaffIds] = useState<string[]>([])
  const [reassignForm, setReassignForm] = useState<ReassignFormState>({
    staffScheduleId: '',
    newStaff: '',
    reason: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const loadDetail = useCallback(async () => {
    if (!workScheduleId) return

    setIsLoading(true)
    setMessage(null)

    try {
      const [scheduleResponse, staffResponse] = await Promise.all([
        workScheduleApi.getWorkScheduleById(workScheduleId),
        workScheduleApi.getStaffs()
      ])

      setSchedule(scheduleResponse.data)
      setForm(toForm(scheduleResponse.data))
      setStaffs(staffResponse.data)
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
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Detail data is loaded from route params.
    void loadDetail()
  }, [loadDetail])

  async function handleUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!workScheduleId || !form) return

    setIsSubmitting(true)
    setMessage(null)

    try {
      const response = await workScheduleApi.updateWorkSchedule(workScheduleId, {
        workDate: form.workDate,
        startTime: form.startTime,
        endTime: form.endTime,
        shiftType: form.shiftType,
        note: form.note || undefined
      })

      setSchedule(response.data)
      setForm(toForm(response.data))
      setMessage({ type: 'success', text: t('staffSchedule.workSchedules.messages.updated') })
    } catch (error) {
      setMessage({
        type: 'error',
        text: getWorkScheduleErrorMessage(
          error,
          t,
          'staffSchedule.workSchedules.messages.updateFailed',
          'update'
        )
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleAssignStaffs() {
    if (!workScheduleId || assignStaffIds.length === 0) {
      setMessage({ type: 'error', text: t('staffSchedule.workSchedules.messages.staffIdsRequired') })
      return
    }

    setIsSubmitting(true)
    setMessage(null)

    try {
      const response = await workScheduleApi.assignStaffsToWorkSchedule(workScheduleId, {
        staffIds: assignStaffIds
      })

      setSchedule(response.data)
      setAssignStaffIds([])
      setMessage({ type: 'success', text: t('staffSchedule.workSchedules.messages.assigned') })
    } catch (error) {
      setMessage({
        type: 'error',
        text: getWorkScheduleErrorMessage(
          error,
          t,
          'staffSchedule.workSchedules.messages.assignFailed',
          'assign'
        )
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleReassignStaff(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!workScheduleId || !reassignForm.staffScheduleId || !reassignForm.newStaff) {
      setMessage({ type: 'error', text: t('staffSchedule.workSchedules.messages.reassignRequired') })
      return
    }

    setIsSubmitting(true)
    setMessage(null)

    try {
      await workScheduleApi.reassignStaffToWorkSchedule(reassignForm.staffScheduleId, {
        newStaff: reassignForm.newStaff,
        reason: reassignForm.reason || undefined
      })
      const response = await workScheduleApi.getWorkScheduleById(workScheduleId)
      setSchedule(response.data)
      setReassignForm({ staffScheduleId: '', newStaff: '', reason: '' })
      setMessage({ type: 'success', text: t('staffSchedule.workSchedules.messages.reassigned') })
    } catch (error) {
      setMessage({
        type: 'error',
        text: getWorkScheduleErrorMessage(
          error,
          t,
          'staffSchedule.workSchedules.messages.reassignFailed',
          'reassign'
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
        <ManagerTopNav titleKey='staffSchedule.editPage.title' subtitleKey='staffSchedule.editPage.subtitle' />
        <main className='flex-1 overflow-y-auto p-4 md:p-6'>
          <div className='mx-auto flex max-w-6xl flex-col gap-6'>
            <div className='flex flex-col gap-3 border-b border-border pb-6 md:flex-row md:items-center md:justify-between'>
              <div>
                <h1 className='font-display text-2xl font-bold text-card-foreground md:text-3xl'>
                  {t('staffSchedule.editPage.title')}
                </h1>
                <p className='mt-2 text-muted-foreground'>{t('staffSchedule.editPage.subtitle')}</p>
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

            {isLoading ? (
              <section className='rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground shadow-sm'>
                {t('staffSchedule.workSchedules.detail.loading')}
              </section>
            ) : !schedule || !form ? (
              <section className='rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground shadow-sm'>
                {t('staffSchedule.workSchedules.errors.notFound')}
              </section>
            ) : (
              <div className='grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]'>
                <section className='rounded-xl border border-border bg-card p-5 shadow-sm'>
                  <div className='mb-5 rounded-lg bg-muted/60 p-4'>
                    <div className='grid gap-3 text-sm md:grid-cols-3'>
                      <DetailItem
                        label={t('staffSchedule.workSchedules.detail.createdAt')}
                        value={formatWorkScheduleDateTime(schedule.createdAt)}
                      />
                      <DetailItem
                        label={t('staffSchedule.workSchedules.detail.updatedAt')}
                        value={formatWorkScheduleDateTime(schedule.updatedAt)}
                      />
                      <DetailItem
                        label={t('staffSchedule.workSchedules.detail.staffCount')}
                        value={String(assignedStaffs.length)}
                      />
                    </div>
                  </div>

                  <form className='grid gap-4' onSubmit={(event) => void handleUpdate(event)}>
                    <Field label={t('staffSchedule.workSchedules.form.workDate')}>
                      <input
                        required
                        type='date'
                        value={form.workDate}
                        onChange={(event) =>
                          setForm((current) => current && { ...current, workDate: event.target.value })
                        }
                        className='h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring'
                      />
                    </Field>
                    <div className='grid gap-4 md:grid-cols-2'>
                      <Field label={t('staffSchedule.workSchedules.form.startTime')}>
                        <input
                          required
                          type='time'
                          value={form.startTime}
                          onChange={(event) =>
                            setForm((current) => current && { ...current, startTime: event.target.value })
                          }
                          className='h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring'
                        />
                      </Field>
                      <Field label={t('staffSchedule.workSchedules.form.endTime')}>
                        <input
                          required
                          type='time'
                          value={form.endTime}
                          onChange={(event) =>
                            setForm((current) => current && { ...current, endTime: event.target.value })
                          }
                          className='h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring'
                        />
                      </Field>
                    </div>
                    <Field label={t('staffSchedule.workSchedules.form.shiftType')}>
                      <select
                        value={form.shiftType}
                        onChange={(event) =>
                          setForm((current) =>
                            current
                              ? { ...current, shiftType: event.target.value as WorkScheduleShiftType }
                              : current
                          )
                        }
                        className='h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring'
                      >
                        {SHIFT_TYPES.map((type) => (
                          <option key={type} value={type}>
                            {t(`staffSchedule.workSchedules.shiftTypes.${type}`)}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label={t('staffSchedule.workSchedules.form.note')}>
                      <textarea
                        value={form.note}
                        onChange={(event) =>
                          setForm((current) => current && { ...current, note: event.target.value })
                        }
                        rows={4}
                        className='w-full resize-none rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring'
                      />
                    </Field>
                    <div className='flex justify-end'>
                      <Button type='submit' disabled={isSubmitting}>
                        <MaterialIcon name='save' className='text-lg' />
                        {t('staffSchedule.workSchedules.actions.update')}
                      </Button>
                    </div>
                  </form>
                </section>

                <aside className='flex flex-col gap-6'>
                  <section className='rounded-xl border border-border bg-card p-5 shadow-sm'>
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
                    <Button
                      type='button'
                      variant='outline'
                      className='mt-4 w-full'
                      onClick={() => void navigate(`/manager/staff-schedule/${workScheduleId}/staff`)}
                    >
                      <MaterialIcon name='groups' className='text-lg' />
                      {t('staffSchedule.workSchedules.actions.viewStaffs')}
                    </Button>
                  </section>

                  <section className='rounded-xl border border-border bg-card p-5 shadow-sm'>
                    <h2 className='font-display text-lg font-bold text-card-foreground'>
                      {t('staffSchedule.workSchedules.assign.title')}
                    </h2>
                    <div className='mt-4 flex flex-col gap-3'>
                      <WorkScheduleStaffSelect
                        staffs={staffs}
                        selectedStaffIds={assignStaffIds}
                        onChange={setAssignStaffIds}
                        disabled={isSubmitting}
                      />
                      <Button type='button' disabled={isSubmitting} onClick={() => void handleAssignStaffs()}>
                        <MaterialIcon name='person_add' className='text-lg' />
                        {t('staffSchedule.workSchedules.actions.assign')}
                      </Button>
                    </div>
                  </section>

                  <section className='rounded-xl border border-border bg-card p-5 shadow-sm'>
                    <form className='flex flex-col gap-3' onSubmit={(event) => void handleReassignStaff(event)}>
                      <h2 className='font-display text-lg font-bold text-card-foreground'>
                        {t('staffSchedule.workSchedules.reassign.title')}
                      </h2>
                      <Field label={t('staffSchedule.workSchedules.reassign.currentStaff')}>
                        <select
                          value={reassignForm.staffScheduleId}
                          onChange={(event) =>
                            setReassignForm((current) => ({
                              ...current,
                              staffScheduleId: event.target.value
                            }))
                          }
                          className='h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring'
                        >
                          <option value=''>{t('staffSchedule.workSchedules.reassign.chooseCurrent')}</option>
                          {assignedStaffs.map((staff) => (
                            <option key={staff.staffScheduleId} value={staff.staffScheduleId}>
                              {staff.staffName}
                            </option>
                          ))}
                        </select>
                      </Field>
                      <Field label={t('staffSchedule.workSchedules.reassign.newStaff')}>
                        <select
                          value={reassignForm.newStaff}
                          onChange={(event) =>
                            setReassignForm((current) => ({ ...current, newStaff: event.target.value }))
                          }
                          className='h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring'
                        >
                          <option value=''>{t('staffSchedule.workSchedules.reassign.chooseNew')}</option>
                          {staffs.map((staff) => (
                            <option key={staff.userId} value={staff.userId}>
                              {staff.fullName} - {staff.email}
                            </option>
                          ))}
                        </select>
                      </Field>
                      <Field label={t('staffSchedule.workSchedules.reassign.reason')}>
                        <input
                          type='text'
                          value={reassignForm.reason}
                          onChange={(event) =>
                            setReassignForm((current) => ({ ...current, reason: event.target.value }))
                          }
                          className='h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring'
                        />
                      </Field>
                      <Button type='submit' disabled={isSubmitting || assignedStaffs.length === 0}>
                        <MaterialIcon name='swap_horiz' className='text-lg' />
                        {t('staffSchedule.workSchedules.actions.reassign')}
                      </Button>
                    </form>
                  </section>
                </aside>
              </div>
            )}
          </div>
        </main>
      </div>
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

interface DetailItemProps {
  label: string
  value: string
}

function DetailItem({ label, value }: DetailItemProps) {
  return (
    <div>
      <p className='text-xs font-bold uppercase text-muted-foreground'>{label}</p>
      <p className='mt-1 font-semibold text-foreground'>{value}</p>
    </div>
  )
}
