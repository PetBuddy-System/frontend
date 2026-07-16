import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate, useParams } from 'react-router'

import { cn } from '~/shared/lib/cn'
import { Button, MaterialIcon } from '~/shared/ui'

import { AdminSidebar } from '../components/layout/admin-sidebar'
import { AdminTopNav } from '../components/layout/admin-top-nav'
import {
  formatAdminUserDate,
  formatAdminUserDateTime,
  getAdminUserAvatarUrl,
  getUserInitials,
  normalizeAdminGender
} from '../lib/admin-users-format'
import { adminUsersApi, type AdminUserResponse } from '../services/users'

const STATUS_CLASS_BY_STATUS: Record<string, string> = {
  ACTIVE: 'bg-success/10 text-success border-success/30',
  PENDING: 'bg-warning/10 text-warning border-warning/30',
  INACTIVE: 'bg-muted text-muted-foreground border-border',
  SUSPENDED: 'bg-destructive/10 text-destructive border-destructive/30',
  DELETED: 'bg-destructive text-destructive-foreground border-destructive'
}

export function AdminUserDetailPage() {
  const { t } = useTranslation('admin')
  const location = useLocation()
  const navigate = useNavigate()
  const { userId } = useParams()
  const [user, setUser] = useState<AdminUserResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(() => {
    const state = location.state

    if (state && typeof state === 'object' && 'employeeUpdated' in state && state.employeeUpdated === true) {
      return { type: 'success', text: t('users.messages.updateSuccess') }
    }

    return null
  })
  const avatarUrl = getAdminUserAvatarUrl(user)

  const loadUser = useCallback(async () => {
    if (!userId) return

    setIsLoading(true)
    try {
      const response = await adminUsersApi.getUser(userId)
      setUser(response.data)
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : t('users.messages.loadDetailFailed')
      })
    } finally {
      setIsLoading(false)
    }
  }, [t, userId])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- User detail is loaded from route params.
    void loadUser()
  }, [loadUser])

  return (
    <div className='flex h-screen overflow-hidden bg-background text-foreground'>
      <AdminSidebar activeItem='users' />
      <div className='flex min-w-0 flex-1 flex-col overflow-hidden'>
        <AdminTopNav titleKey='users.detail.pageTitle' subtitleKey='users.detail.pageSubtitle' />
        <main className='flex-1 overflow-y-auto p-4 md:p-6'>
          <div className='mx-auto flex max-w-5xl flex-col gap-6'>
            <section className='flex flex-col gap-4 border-b border-border pb-6 md:flex-row md:items-center md:justify-between'>
              <div>
                <h1 className='font-display text-2xl font-bold text-card-foreground md:text-3xl'>
                  {t('users.detail.title')}
                </h1>
                <p className='mt-2 text-muted-foreground'>{t('users.detail.subtitle')}</p>
              </div>
              <div className='flex flex-wrap gap-3'>
                <Button type='button' variant='outline' onClick={() => void navigate('/admin/users')}>
                  <MaterialIcon name='arrow_back' className='text-lg' />
                  {t('users.actions.backToList')}
                </Button>
                {user ? (
                  <Button type='button' onClick={() => void navigate(`/admin/users/${user.userId}/edit`)}>
                    <MaterialIcon name='edit' className='text-lg' />
                    {t('users.actions.edit')}
                  </Button>
                ) : null}
              </div>
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

            {isLoading ? (
              <section className='rounded-xl border border-border bg-card p-8 shadow-sm'>
                <div className='grid gap-3 md:grid-cols-2'>
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div key={index} className='h-20 animate-pulse rounded-lg bg-muted' />
                  ))}
                </div>
              </section>
            ) : user ? (
              <section className='rounded-xl border border-border bg-card p-5 shadow-sm'>
                <div className='flex flex-col gap-5 border-b border-border pb-5 md:flex-row md:items-center md:justify-between'>
                  <div className='flex items-center gap-4'>
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={t('users.detail.avatarAlt')}
                        className='h-16 w-16 rounded-xl object-cover'
                      />
                    ) : (
                      <div className='flex h-16 w-16 items-center justify-center rounded-xl bg-primary font-display text-2xl font-bold text-primary-foreground'>
                        {getUserInitials(user)}
                      </div>
                    )}
                    <div>
                      <h2 className='font-display text-2xl font-bold text-card-foreground'>{user.fullName}</h2>
                      <p className='mt-1 text-sm text-muted-foreground'>{user.email}</p>
                    </div>
                  </div>
                  <span
                    className={cn(
                      'w-fit rounded-full border px-3 py-1 text-xs font-bold',
                      STATUS_CLASS_BY_STATUS[user.status] ?? 'border-border bg-muted text-muted-foreground'
                    )}
                  >
                    {t(`users.status.${user.status}`)}
                  </span>
                </div>

                <div className='mt-5 grid gap-3 md:grid-cols-2'>
                  <DetailItem
                    icon='badge'
                    label={t('users.detail.fields.role')}
                    value={t(`users.roles.${user.role}`)}
                  />
                  <DetailItem
                    icon='work'
                    label={t('users.detail.fields.staffTask')}
                    value={user.staffTask ? t(`users.staffTasks.${user.staffTask}`) : '-'}
                  />
                  <DetailItem
                    icon='wc'
                    label={t('users.detail.fields.gender')}
                    value={t(`users.gender.${normalizeAdminGender(user.gender)}`, { defaultValue: user.gender || '-' })}
                  />
                  <DetailItem
                    icon='cake'
                    label={t('users.detail.fields.dateOfBirth')}
                    value={formatAdminUserDate(user.dateOfBirth)}
                  />
                  <DetailItem
                    icon='event'
                    label={t('users.detail.fields.createdAt')}
                    value={formatAdminUserDateTime(user.createdAt)}
                  />
                  <DetailItem
                    icon='update'
                    label={t('users.detail.fields.updatedAt')}
                    value={formatAdminUserDateTime(user.updatedAt)}
                  />
                </div>
              </section>
            ) : (
              <section className='rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground shadow-sm'>
                {t('users.messages.notFound')}
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
