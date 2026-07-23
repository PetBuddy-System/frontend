import { useMemo, useState, type FormEvent, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'

import { Button, MaterialIcon } from '~/shared/ui'

import { ManagerSidebar } from '../components/layout/manager-sidebar'
import { ManagerTopNav } from '../components/layout/manager-top-nav'
import { getShiftRegistrationErrorMessage } from '../lib/shift-registration-error'
import { shiftRegistrationApi, type RegistrationPeriodCreationRequest } from '../services'

interface RegistrationPeriodFormState {
  registerCloseAt: string
  registerOpenAt: string
  workFromDate: string
  workToDate: string
}

const INITIAL_FORM: RegistrationPeriodFormState = {
  registerCloseAt: '',
  registerOpenAt: '',
  workFromDate: '',
  workToDate: ''
}

export function ManagerShiftRegistrationPeriodCreatePage() {
  const { t } = useTranslation('manager')
  const navigate = useNavigate()
  const [form, setForm] = useState<RegistrationPeriodFormState>(INITIAL_FORM)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'error'; text: string } | null>(null)
  const canSubmit = useMemo(
    () => Boolean(form.workFromDate && form.workToDate && form.registerOpenAt && form.registerCloseAt),
    [form]
  )

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage(null)

    if (!canSubmit) {
      setMessage({ type: 'error', text: t('shiftRegistration.messages.required') })
      return
    }

    if (form.workToDate < form.workFromDate) {
      setMessage({ type: 'error', text: t('shiftRegistration.errors.invalidDateRange') })
      return
    }

    if (form.registerCloseAt <= form.registerOpenAt) {
      setMessage({ type: 'error', text: t('shiftRegistration.errors.invalidRegistrationTime') })
      return
    }

    if (form.registerCloseAt.slice(0, 10) > form.workFromDate) {
      setMessage({ type: 'error', text: t('shiftRegistration.errors.invalidRegisterCloseTime') })
      return
    }

    const payload: RegistrationPeriodCreationRequest = {
      workFromDate: form.workFromDate,
      workToDate: form.workToDate,
      registerOpenAt: form.registerOpenAt,
      registerCloseAt: form.registerCloseAt
    }

    setIsSubmitting(true)

    try {
      await shiftRegistrationApi.createRegistrationPeriod(payload)
      void navigate('/manager/shift-registration-periods', {
        state: { successMessage: t('shiftRegistration.messages.created') }
      })
    } catch (error) {
      setMessage({
        type: 'error',
        text: getShiftRegistrationErrorMessage(error, t, 'shiftRegistration.messages.createFailed')
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className='flex h-screen overflow-hidden bg-background text-foreground'>
      <ManagerSidebar activeItem='shiftRegistrations' />
      <div className='flex min-w-0 flex-1 flex-col overflow-hidden'>
        <ManagerTopNav
          titleKey='shiftRegistration.createPage.title'
          subtitleKey='shiftRegistration.createPage.subtitle'
        />
        <main className='flex-1 overflow-y-auto p-4 md:p-6'>
          <div className='mx-auto flex max-w-4xl flex-col gap-6'>
            <section className='flex flex-col gap-4 border-b border-border pb-6 md:flex-row md:items-center md:justify-between'>
              <div>
                <h1 className='font-display text-2xl font-bold text-card-foreground md:text-3xl'>
                  {t('shiftRegistration.createPage.title')}
                </h1>
                <p className='mt-2 text-muted-foreground'>{t('shiftRegistration.createPage.subtitle')}</p>
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
              <div className='rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-semibold text-destructive'>
                {message.text}
              </div>
            ) : null}

            <section className='rounded-xl border border-border bg-card p-5 shadow-sm'>
              <form onSubmit={(event) => void handleSubmit(event)} className='grid gap-5'>
                <div className='grid gap-4 md:grid-cols-2'>
                  <Field label={t('shiftRegistration.form.workFromDate')} required>
                    <input
                      type='date'
                      value={form.workFromDate}
                      onChange={(event) => setForm((current) => ({ ...current, workFromDate: event.target.value }))}
                      className='h-11 rounded-lg border border-input bg-muted px-4 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring'
                    />
                  </Field>
                  <Field label={t('shiftRegistration.form.workToDate')} required>
                    <input
                      type='date'
                      value={form.workToDate}
                      onChange={(event) => setForm((current) => ({ ...current, workToDate: event.target.value }))}
                      className='h-11 rounded-lg border border-input bg-muted px-4 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring'
                    />
                  </Field>
                  <Field label={t('shiftRegistration.form.registerOpenAt')} required>
                    <input
                      type='datetime-local'
                      value={form.registerOpenAt}
                      onChange={(event) => setForm((current) => ({ ...current, registerOpenAt: event.target.value }))}
                      className='h-11 rounded-lg border border-input bg-muted px-4 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring'
                    />
                  </Field>
                  <Field label={t('shiftRegistration.form.registerCloseAt')} required>
                    <input
                      type='datetime-local'
                      value={form.registerCloseAt}
                      onChange={(event) => setForm((current) => ({ ...current, registerCloseAt: event.target.value }))}
                      className='h-11 rounded-lg border border-input bg-muted px-4 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring'
                    />
                  </Field>
                </div>

                <div className='rounded-xl border border-border bg-muted p-4 text-sm text-muted-foreground'>
                  {t('shiftRegistration.form.helper')}
                </div>

                <div className='flex flex-col-reverse gap-3 sm:flex-row sm:justify-end'>
                  <Button
                    type='button'
                    variant='outline'
                    disabled={isSubmitting}
                    onClick={() => void navigate('/manager/shift-registration-periods')}
                  >
                    {t('shiftRegistration.actions.cancel')}
                  </Button>
                  <Button type='submit' disabled={isSubmitting || !canSubmit}>
                    <MaterialIcon name='event_available' className='text-lg' />
                    {isSubmitting ? t('shiftRegistration.actions.saving') : t('shiftRegistration.actions.create')}
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
  children: ReactNode
  label: string
  required?: boolean
}

function Field({ children, label, required = false }: FieldProps) {
  return (
    <label className='grid gap-2'>
      <span className='text-sm font-bold text-card-foreground'>
        {label}
        {required ? <span className='text-destructive'> *</span> : null}
      </span>
      {children}
    </label>
  )
}
