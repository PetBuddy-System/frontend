import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router'

import { Button, MaterialIcon } from '~/shared/ui'

import { AdminSidebar } from '../components/layout/admin-sidebar'
import { AdminTopNav } from '../components/layout/admin-top-nav'
import { AdminCustomerForm } from '../components/users/admin-customer-form'
import {
  adminUsersApi,
  type AdminCustomerCreatePayload,
  type AdminCustomerUpdatePayload,
  type AdminUserResponse
} from '../services/users'

export function AdminCustomerEditPage() {
  const { t } = useTranslation('admin')
  const navigate = useNavigate()
  const { userId } = useParams()
  const [user, setUser] = useState<AdminUserResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'error'; text: string } | null>(null)

  const loadUser = useCallback(async () => {
    if (!userId) return

    setIsLoading(true)
    setMessage(null)

    try {
      const response = await adminUsersApi.getUser(userId)
      setUser(response.data)
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : t('customers.messages.loadDetailFailed')
      })
    } finally {
      setIsLoading(false)
    }
  }, [t, userId])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Customer edit data is loaded from route params.
    void loadUser()
  }, [loadUser])

  async function handleSubmit(payload: AdminCustomerCreatePayload | AdminCustomerUpdatePayload, avatar: File | null) {
    if (!userId) return

    setIsSubmitting(true)
    setMessage(null)

    try {
      await adminUsersApi.updateUser(userId, payload as AdminCustomerUpdatePayload, avatar)
      void navigate(`/admin/employees/${userId}`, { state: { customerUpdated: true } })
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : t('customers.messages.updateFailed')
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className='flex h-screen overflow-hidden bg-background text-foreground'>
      <AdminSidebar activeItem='employees' />
      <div className='flex min-w-0 flex-1 flex-col overflow-hidden'>
        <AdminTopNav titleKey='customers.edit.pageTitle' subtitleKey='customers.edit.pageSubtitle' />
        <main className='flex-1 overflow-y-auto p-4 md:p-6'>
          <div className='mx-auto flex max-w-4xl flex-col gap-6'>
            <section className='flex flex-col gap-4 border-b border-border pb-6 md:flex-row md:items-center md:justify-between'>
              <div>
                <h1 className='font-display text-2xl font-bold text-card-foreground md:text-3xl'>
                  {t('customers.edit.title')}
                </h1>
                <p className='mt-2 text-muted-foreground'>{t('customers.edit.subtitle')}</p>
              </div>
              <Button type='button' variant='outline' onClick={() => void navigate('/admin/employees')}>
                <MaterialIcon name='arrow_back' className='text-lg' />
                {t('customers.actions.backToList')}
              </Button>
            </section>

            {message ? (
              <div className='rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-semibold text-destructive'>
                {message.text}
              </div>
            ) : null}

            <section className='rounded-xl border border-border bg-card p-5 shadow-sm'>
              {isLoading ? (
                <div className='grid gap-3 md:grid-cols-2'>
                  {Array.from({ length: 5 }).map((_, index) => (
                    <div key={index} className='h-20 animate-pulse rounded-lg bg-muted' />
                  ))}
                </div>
              ) : user ? (
                <AdminCustomerForm
                  key={user.userId}
                  mode='edit'
                  initialUser={user}
                  isSubmitting={isSubmitting}
                  onCancel={() => void navigate(`/admin/employees/${user.userId}`)}
                  onSubmit={handleSubmit}
                />
              ) : (
                <div className='py-8 text-center text-sm text-muted-foreground'>{t('customers.messages.notFound')}</div>
              )}
            </section>
          </div>
        </main>
      </div>
    </div>
  )
}
