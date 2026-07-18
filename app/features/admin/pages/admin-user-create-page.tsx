import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'

import { Button, MaterialIcon } from '~/shared/ui'

import { AdminSidebar } from '../components/layout/admin-sidebar'
import { AdminTopNav } from '../components/layout/admin-top-nav'
import { AdminEmployeeForm } from '../components/users/admin-employee-form'
import { adminUsersApi, type AdminEmployeeCreatePayload, type AdminEmployeeUpdatePayload } from '../services/users'

export function AdminUserCreatePage() {
  const { t } = useTranslation('admin')
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'error'; text: string } | null>(null)

  async function handleSubmit(payload: AdminEmployeeCreatePayload | AdminEmployeeUpdatePayload, avatar: File | null) {
    setIsSubmitting(true)
    setMessage(null)

    try {
      await adminUsersApi.createEmployee(payload as AdminEmployeeCreatePayload, avatar)
      void navigate('/admin/users', { state: { employeeCreated: true } })
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : t('users.messages.createFailed')
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className='flex h-screen overflow-hidden bg-background text-foreground'>
      <AdminSidebar activeItem='users' />
      <div className='flex min-w-0 flex-1 flex-col overflow-hidden'>
        <AdminTopNav titleKey='users.create.pageTitle' subtitleKey='users.create.pageSubtitle' />
        <main className='flex-1 overflow-y-auto p-4 md:p-6'>
          <div className='mx-auto flex max-w-4xl flex-col gap-6'>
            <section className='flex flex-col gap-4 border-b border-border pb-6 md:flex-row md:items-center md:justify-between'>
              <div>
                <h1 className='font-display text-2xl font-bold text-card-foreground md:text-3xl'>
                  {t('users.create.title')}
                </h1>
                <p className='mt-2 text-muted-foreground'>{t('users.create.subtitle')}</p>
              </div>
              <Button type='button' variant='outline' onClick={() => void navigate('/admin/users')}>
                <MaterialIcon name='arrow_back' className='text-lg' />
                {t('users.actions.backToList')}
              </Button>
            </section>

            {message ? (
              <div className='rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-semibold text-destructive'>
                {message.text}
              </div>
            ) : null}

            <section className='rounded-xl border border-border bg-card p-5 shadow-sm'>
              <AdminEmployeeForm
                mode='create'
                isSubmitting={isSubmitting}
                onCancel={() => void navigate('/admin/users')}
                onSubmit={handleSubmit}
              />
            </section>
          </div>
        </main>
      </div>
    </div>
  )
}
