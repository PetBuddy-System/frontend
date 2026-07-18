import { useMemo, useState, type FormEvent, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { cn } from '~/shared/lib/cn'
import { Button, MaterialIcon } from '~/shared/ui'

import { isValidAdminAccountPassword } from '../../lib/admin-password-validation'
import { getAdminUserAvatarUrl, normalizeAdminGender, toDateInputValue } from '../../lib/admin-users-format'
import type {
  AdminEmployeeCreatePayload,
  AdminEmployeeRole,
  AdminEmployeeUpdatePayload,
  AdminStaffTask,
  AdminUserResponse
} from '../../services/users'

interface EmployeeFormState {
  dateOfBirth: string
  email: string
  fullName: string
  gender: string
  password: string
  role: AdminEmployeeRole
  staffTask: AdminStaffTask | ''
}

export interface AdminEmployeeFormProps {
  initialUser?: AdminUserResponse | null
  isSubmitting: boolean
  mode: 'create' | 'edit'
  onCancel: () => void
  onSubmit: (payload: AdminEmployeeCreatePayload | AdminEmployeeUpdatePayload, avatar: File | null) => Promise<void>
}

function buildInitialState(initialUser?: AdminUserResponse | null): EmployeeFormState {
  return {
    dateOfBirth: toDateInputValue(initialUser?.dateOfBirth),
    email: initialUser?.email ?? '',
    fullName: initialUser?.fullName ?? '',
    gender: normalizeAdminGender(initialUser?.gender),
    password: '',
    role: initialUser?.role === 'STAFF' ? 'STAFF' : 'MANAGER',
    staffTask: initialUser?.staffTask ?? ''
  }
}

export function AdminEmployeeForm({ initialUser, isSubmitting, mode, onCancel, onSubmit }: AdminEmployeeFormProps) {
  const { t } = useTranslation('admin')
  const [form, setForm] = useState<EmployeeFormState>(() => buildInitialState(initialUser))
  const [avatar, setAvatar] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const isStaff = form.role === 'STAFF'
  const currentAvatarUrl = getAdminUserAvatarUrl(initialUser)
  const canSubmit = useMemo(() => {
    const hasBaseFields = Boolean(form.fullName && form.gender && form.dateOfBirth)
    const hasAccountFields = mode === 'edit' || Boolean(form.email && isValidAdminAccountPassword(form.password))
    const hasStaffTask = !isStaff || Boolean(form.staffTask)

    return hasBaseFields && hasAccountFields && hasStaffTask
  }, [form, isStaff, mode])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    if (
      !form.fullName ||
      !form.gender ||
      !form.dateOfBirth ||
      (mode === 'create' && !form.email) ||
      (isStaff && !form.staffTask)
    ) {
      setError(t('users.form.validation.required'))
      return
    }

    if (mode === 'create' && !isValidAdminAccountPassword(form.password)) {
      setError(t('users.form.validation.password'))
      return
    }

    const basePayload: AdminEmployeeUpdatePayload = {
      fullName: form.fullName.trim(),
      gender: form.gender,
      dateOfBirth: form.dateOfBirth,
      role: form.role,
      staffTask: isStaff ? (form.staffTask as AdminStaffTask) : undefined
    }

    if (mode === 'create') {
      await onSubmit(
        {
          ...basePayload,
          email: form.email.trim(),
          password: form.password
        },
        avatar
      )
      return
    }

    await onSubmit(basePayload, avatar)
  }

  return (
    <form onSubmit={(event) => void handleSubmit(event)} className='grid gap-5'>
      {error ? (
        <div className='rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-semibold text-destructive'>
          {error}
        </div>
      ) : null}

      <div className='grid gap-4 md:grid-cols-2'>
        <Field label={t('users.form.fields.fullName')} required>
          <input
            value={form.fullName}
            onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))}
            className='h-11 rounded-lg border border-input bg-muted px-4 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring'
            placeholder={t('users.form.placeholders.fullName')}
          />
        </Field>
        {mode === 'create' ? (
          <>
            <Field label={t('users.form.fields.email')} required>
              <input
                type='email'
                value={form.email}
                onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                className='h-11 rounded-lg border border-input bg-muted px-4 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring'
                placeholder={t('users.form.placeholders.email')}
              />
            </Field>
            <Field label={t('users.form.fields.password')} required>
              <div className='grid gap-2'>
                <input
                  type='password'
                  value={form.password}
                  onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                  className='h-11 rounded-lg border border-input bg-muted px-4 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring'
                  placeholder={t('users.form.placeholders.password')}
                />
                <p
                  className={cn(
                    'text-xs text-muted-foreground',
                    form.password && !isValidAdminAccountPassword(form.password) && 'text-destructive'
                  )}
                >
                  {t('users.form.validation.password')}
                </p>
              </div>
            </Field>
          </>
        ) : null}
        <Field label={t('users.form.fields.gender')} required>
          <select
            value={form.gender}
            onChange={(event) => setForm((current) => ({ ...current, gender: event.target.value }))}
            className='h-11 rounded-lg border border-input bg-muted px-4 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring'
          >
            <option value=''>{t('users.form.placeholders.gender')}</option>
            <option value='MALE'>{t('users.gender.MALE')}</option>
            <option value='FEMALE'>{t('users.gender.FEMALE')}</option>
            <option value='OTHER'>{t('users.gender.OTHER')}</option>
          </select>
        </Field>
        <Field label={t('users.form.fields.dateOfBirth')} required>
          <input
            type='date'
            value={form.dateOfBirth}
            onChange={(event) => setForm((current) => ({ ...current, dateOfBirth: event.target.value }))}
            className='h-11 rounded-lg border border-input bg-muted px-4 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring'
          />
        </Field>
        <Field label={t('users.form.fields.role')} required>
          <select
            value={form.role}
            onChange={(event) => {
              const role = event.target.value as AdminEmployeeRole
              setForm((current) => ({ ...current, role, staffTask: role === 'STAFF' ? current.staffTask : '' }))
            }}
            className='h-11 rounded-lg border border-input bg-muted px-4 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring'
          >
            <option value='MANAGER'>{t('users.roles.MANAGER')}</option>
            <option value='STAFF'>{t('users.roles.STAFF')}</option>
          </select>
        </Field>
        {isStaff ? (
          <Field label={t('users.form.fields.staffTask')} required>
            <select
              value={form.staffTask}
              onChange={(event) =>
                setForm((current) => ({ ...current, staffTask: event.target.value as AdminStaffTask }))
              }
              className='h-11 rounded-lg border border-input bg-muted px-4 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring'
            >
              <option value=''>{t('users.form.placeholders.staffTask')}</option>
              <option value='GROOMER'>{t('users.staffTasks.GROOMER')}</option>
              <option value='SHIPPER'>{t('users.staffTasks.SHIPPER')}</option>
              <option value='COORDINATOR'>{t('users.staffTasks.COORDINATOR')}</option>
            </select>
          </Field>
        ) : null}
        <Field label={t('users.form.fields.avatar')}>
          <div className='grid gap-2'>
            {currentAvatarUrl ? (
              <img
                src={currentAvatarUrl}
                alt={t('users.form.avatar.currentAlt')}
                className='h-20 w-20 rounded-xl object-cover'
              />
            ) : null}
            <input
              type='file'
              accept='image/*'
              onChange={(event) => setAvatar(event.target.files?.[0] ?? null)}
              className='h-11 rounded-lg border border-input bg-muted px-4 py-2 text-sm text-foreground outline-none file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-primary-foreground focus:border-primary focus:ring-2 focus:ring-ring'
            />
            <p className='text-xs text-muted-foreground'>
              {avatar ? t('users.form.avatar.selected', { name: avatar.name }) : t('users.form.avatar.hint')}
            </p>
          </div>
        </Field>
      </div>

      <div className='flex flex-col-reverse gap-3 sm:flex-row sm:justify-end'>
        <Button type='button' variant='outline' onClick={onCancel} disabled={isSubmitting}>
          {t('users.form.actions.cancel')}
        </Button>
        <Button type='submit' disabled={isSubmitting || !canSubmit}>
          <MaterialIcon name={mode === 'create' ? 'person_add' : 'save'} className='text-lg' />
          {isSubmitting ? t('users.form.actions.saving') : t(`users.form.actions.${mode}`)}
        </Button>
      </div>
    </form>
  )
}

interface FieldProps {
  children: ReactNode
  className?: string
  label: string
  required?: boolean
}

function Field({ children, className, label, required = false }: FieldProps) {
  return (
    <label className={cn('flex min-h-[5.25rem] flex-col justify-start gap-2', className)}>
      <span className='block h-5 text-sm font-bold leading-5 text-card-foreground'>
        {label}
        {required ? <span className='text-destructive'> *</span> : null}
      </span>
      {children}
    </label>
  )
}
