import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Button, MaterialIcon } from '~/shared/ui'

import type { AdminUserResponse, AdminUserStatus } from '../../services/users'

const STATUS_OPTIONS: AdminUserStatus[] = ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'DELETED']

export interface AdminUserStatusModalProps {
  isSubmitting: boolean
  user: AdminUserResponse | null
  onClose: () => void
  onSubmit: (status: AdminUserStatus) => void
}

export function AdminUserStatusModal({ isSubmitting, user, onClose, onSubmit }: AdminUserStatusModalProps) {
  const { t } = useTranslation('admin')
  const [status, setStatus] = useState<AdminUserStatus>(user?.status ?? 'ACTIVE')

  if (!user) return null

  const isSameStatus = status === user.status

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-background/70 p-4 backdrop-blur-sm'>
      <section
        role='dialog'
        aria-modal='true'
        aria-label={t('users.statusModal.title')}
        className='w-full max-w-md rounded-xl border border-border bg-card p-5 shadow-xl'
      >
        <div className='flex items-start justify-between gap-4'>
          <div>
            <h2 className='font-display text-xl font-bold text-card-foreground'>{t('users.statusModal.title')}</h2>
            <p className='mt-1 text-sm text-muted-foreground'>
              {t('users.statusModal.description', { name: user.fullName })}
            </p>
          </div>
          <button
            type='button'
            onClick={onClose}
            className='flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring'
            aria-label={t('users.statusModal.close')}
          >
            <MaterialIcon name='close' className='text-lg' />
          </button>
        </div>

        <label className='mt-5 grid gap-2'>
          <span className='text-sm font-bold text-card-foreground'>{t('users.statusModal.statusLabel')}</span>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as AdminUserStatus)}
            className='h-11 rounded-lg border border-input bg-muted px-4 text-sm font-semibold text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring'
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {t(`users.status.${option}`)}
              </option>
            ))}
          </select>
        </label>

        <div className='mt-6 flex justify-end gap-3'>
          <Button type='button' variant='outline' onClick={onClose} disabled={isSubmitting}>
            {t('users.statusModal.cancel')}
          </Button>
          <Button type='button' onClick={() => onSubmit(status)} disabled={isSubmitting || isSameStatus}>
            {isSubmitting ? t('users.statusModal.saving') : t('users.statusModal.save')}
          </Button>
        </div>
      </section>
    </div>
  )
}
