import { useEffect, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'

import { Button, MaterialIcon } from '~/shared/ui'
import type { UserResponse } from '~/shared/lib/auth'

import { ManagerSidebar } from '../components/layout/manager-sidebar'
import { ManagerTopNav } from '../components/layout/manager-top-nav'
import { WorkScheduleStaffSelect } from '../components/staff-schedule/work-schedule-staff-select'
import {
  workScheduleApi,
  type WorkScheduleCreationRequest,
  type WorkScheduleShiftType
} from '../services'
import { getWorkScheduleErrorMessage } from '../lib/work-schedule-error'

const SHIFT_TYPES: WorkScheduleShiftType[] = ['MORNING', 'AFTERNOON', 'EVENING', 'FULL_DAY', 'CUSTOM']

interface ScheduleFormState {
  workDate: string
  startTime: string
  endTime: string
  shiftType: WorkScheduleShiftType
  note: string
  staffIds: string[]
}

const EMPTY_FORM: ScheduleFormState = {
  workDate: '',
  startTime: '',
  endTime: '',
  shiftType: 'MORNING',
  note: '',
  staffIds: []
}

export function ManagerStaffScheduleCreatePage() {
  const { t } = useTranslation('manager')
  const navigate = useNavigate()
  const [form, setForm] = useState<ScheduleFormState>(EMPTY_FORM)
  const [staffs, setStaffs] = useState<UserResponse[]>([])
  const [isLoadingStaffs, setIsLoadingStaffs] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    let ignore = false

    async function loadStaffs() {
      setIsLoadingStaffs(true)

      try {
        const response = await workScheduleApi.getStaffs()
        if (!ignore) {
          setStaffs(response.data)
        }
      } catch (error) {
        if (!ignore) {
          setMessage({
            type: 'error',
            text: getWorkScheduleErrorMessage(
              error,
              t,
              'staffSchedule.workSchedules.messages.loadStaffsFailed',
              'create'
            )
          })
        }
      } finally {
        if (!ignore) {
          setIsLoadingStaffs(false)
        }
      }
    }

    void loadStaffs()

    return () => {
      ignore = true
    }
  }, [t])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)
    setMessage(null)

    const payload: WorkScheduleCreationRequest = {
      workDate: form.workDate,
      startTime: form.startTime,
      endTime: form.endTime,
      shiftType: form.shiftType,
      note: form.note || undefined,
      staffIds: form.staffIds
    }

    try {
      await workScheduleApi.createWorkSchedule(payload)
      void navigate('/manager/staff-schedule', {
        replace: true,
        state: { successMessage: t('staffSchedule.workSchedules.messages.created') }
      })
    } catch (error) {
      setMessage({
        type: 'error',
        text: getWorkScheduleErrorMessage(
          error,
          t,
          'staffSchedule.workSchedules.messages.createFailed',
          'create'
        )
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className='flex h-screen overflow-hidden bg-background text-foreground'>
      <ManagerSidebar activeItem='staff' />
      <div className='flex min-w-0 flex-1 flex-col overflow-hidden'>
        <ManagerTopNav titleKey='staffSchedule.create.title' subtitleKey='staffSchedule.create.subtitle' />
        <main className='flex-1 overflow-y-auto p-4 md:p-6'>
          <div className='mx-auto flex max-w-4xl flex-col gap-6'>
            <div className='flex flex-col gap-3 border-b border-border pb-6 md:flex-row md:items-center md:justify-between'>
              <div>
                <h1 className='font-display text-2xl font-bold text-card-foreground md:text-3xl'>
                  {t('staffSchedule.create.title')}
                </h1>
                <p className='mt-2 text-muted-foreground'>{t('staffSchedule.create.subtitle')}</p>
              </div>
              <Button type='button' variant='outline' onClick={() => void navigate('/manager/staff-schedule')}>
                <MaterialIcon name='arrow_back' className='text-lg' />
                {t('staffSchedule.workSchedules.actions.backToList')}
              </Button>
            </div>

            {message && (
              <div
                className={
                  message.type === 'success'
                    ? 'rounded-xl border border-success/30 bg-success/10 px-4 py-3 text-sm font-medium text-success'
                    : 'rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive'
                }
              >
                {message.text}
              </div>
            )}

            <section className='rounded-xl border border-border bg-card p-5 shadow-sm'>
              <form className='grid gap-4' onSubmit={(event) => void handleSubmit(event)}>
                <Field label={t('staffSchedule.workSchedules.form.workDate')}>
                  <input
                    required
                    type='date'
                    value={form.workDate}
                    onChange={(event) => setForm((current) => ({ ...current, workDate: event.target.value }))}
                    className='h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring'
                  />
                </Field>
                <div className='grid gap-4 md:grid-cols-2'>
                  <Field label={t('staffSchedule.workSchedules.form.startTime')}>
                    <input
                      required
                      type='time'
                      value={form.startTime}
                      onChange={(event) => setForm((current) => ({ ...current, startTime: event.target.value }))}
                      className='h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring'
                    />
                  </Field>
                  <Field label={t('staffSchedule.workSchedules.form.endTime')}>
                    <input
                      required
                      type='time'
                      value={form.endTime}
                      onChange={(event) => setForm((current) => ({ ...current, endTime: event.target.value }))}
                      className='h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring'
                    />
                  </Field>
                </div>
                <Field label={t('staffSchedule.workSchedules.form.shiftType')}>
                  <select
                    value={form.shiftType}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        shiftType: event.target.value as WorkScheduleShiftType
                      }))
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
                <Field label={t('staffSchedule.workSchedules.form.staffs')}>
                  <WorkScheduleStaffSelect
                    staffs={staffs}
                    selectedStaffIds={form.staffIds}
                    onChange={(staffIds) => setForm((current) => ({ ...current, staffIds }))}
                    disabled={isLoadingStaffs || isSubmitting}
                  />
                </Field>
                <Field label={t('staffSchedule.workSchedules.form.note')}>
                  <textarea
                    value={form.note}
                    onChange={(event) => setForm((current) => ({ ...current, note: event.target.value }))}
                    rows={4}
                    className='w-full resize-none rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring'
                  />
                </Field>
                <div className='flex justify-end gap-3'>
                  <Button type='button' variant='outline' onClick={() => void navigate('/manager/staff-schedule')}>
                    {t('staffSchedule.workSchedules.actions.cancel')}
                  </Button>
                  <Button type='submit' disabled={isSubmitting}>
                    <MaterialIcon name='add' className='text-lg' />
                    {t('staffSchedule.workSchedules.actions.create')}
                  </Button>
                </div>
              </form>
            </section>
          </div>
        </main>
      </div>
    </div>
  )
}

interface FieldProps {
  label: string
  children: React.ReactNode
}

function Field({ label, children }: FieldProps) {
  return (
    <label className='flex flex-col gap-1.5'>
      <span className='text-xs font-bold uppercase text-muted-foreground'>{label}</span>
      {children}
    </label>
  )
}
