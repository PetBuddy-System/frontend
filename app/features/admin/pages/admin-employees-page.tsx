import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router'

import { cn } from '~/shared/lib/cn'
import { Button, MaterialIcon } from '~/shared/ui'

import { AdminSidebar } from '../components/layout/admin-sidebar'
import { AdminTopNav } from '../components/layout/admin-top-nav'
import { AdminCustomersTable } from '../components/users/admin-customers-table'
import { AdminUserStatusModal } from '../components/users/admin-user-status-modal'
import { sortUsersByCreatedAtDesc } from '../lib/admin-users-format'
import { adminUsersApi, type AdminUserResponse, type AdminUserStatus } from '../services/users'

type CustomerStatusFilter = AdminUserStatus | 'ALL'

interface CustomerStats {
  active: number
  suspended: number
  total: number
}

const DEFAULT_STATS: CustomerStats = {
  active: 0,
  suspended: 0,
  total: 0
}

const CUSTOMER_PAGE_SIZE = 10
const CUSTOMER_FETCH_SIZE = 100
const CUSTOMER_STATUS_FILTERS: CustomerStatusFilter[] = ['ALL', 'ACTIVE', 'INACTIVE', 'SUSPENDED', 'DELETED']

function buildCustomerStats(users: AdminUserResponse[]): CustomerStats {
  return users.reduce<CustomerStats>(
    (stats, user) => {
      if (user.role !== 'CUSTOMER') return stats

      stats.total += 1
      if (user.status === 'ACTIVE') stats.active += 1
      if (user.status === 'SUSPENDED') stats.suspended += 1

      return stats
    },
    { ...DEFAULT_STATS }
  )
}

export function AdminEmployeesPage() {
  const { t } = useTranslation('admin')
  const location = useLocation()
  const navigate = useNavigate()
  const [users, setUsers] = useState<AdminUserResponse[]>([])
  const [status, setStatus] = useState<CustomerStatusFilter>('ALL')
  const [page, setPage] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [isStatusSubmitting, setIsStatusSubmitting] = useState(false)
  const [selectedUser, setSelectedUser] = useState<AdminUserResponse | null>(null)
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(() => {
    const state = location.state

    if (state && typeof state === 'object' && 'customerCreated' in state && state.customerCreated === true) {
      return { type: 'success', text: t('customers.messages.createSuccess') }
    }

    return null
  })

  const sortedUsers = useMemo(() => sortUsersByCreatedAtDesc(users), [users])
  const filteredUsers = useMemo(() => {
    if (status === 'ALL') return sortedUsers

    return sortedUsers.filter((user) => user.status === status)
  }, [sortedUsers, status])
  const visibleUsers = useMemo(
    () => filteredUsers.slice(page * CUSTOMER_PAGE_SIZE, page * CUSTOMER_PAGE_SIZE + CUSTOMER_PAGE_SIZE),
    [filteredUsers, page]
  )
  const stats = useMemo(() => buildCustomerStats(sortedUsers), [sortedUsers])

  const loadCustomers = useCallback(async () => {
    setIsLoading(true)

    try {
      const firstResponse = await adminUsersApi.getCustomers({ page: 0, size: CUSTOMER_FETCH_SIZE })
      const allUsers = [...firstResponse.data.content]

      for (let nextPage = 1; nextPage < firstResponse.data.totalPages; nextPage += 1) {
        const response = await adminUsersApi.getCustomers({ page: nextPage, size: CUSTOMER_FETCH_SIZE })
        allUsers.push(...response.data.content)
      }

      setUsers(allUsers.filter((user) => user.role === 'CUSTOMER'))
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : t('customers.messages.loadFailed')
      })
    } finally {
      setIsLoading(false)
    }
  }, [t])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Customer list is loaded from the API after mount.
    void loadCustomers()
  }, [loadCustomers])

  useEffect(() => {
    const maxPage = Math.max(Math.ceil(filteredUsers.length / CUSTOMER_PAGE_SIZE) - 1, 0)

    if (page > maxPage) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Keep local pagination valid after filter/data changes.
      setPage(maxPage)
    }
  }, [filteredUsers.length, page])

  async function handleStatusSubmit(nextStatus: AdminUserStatus) {
    if (!selectedUser) return

    setIsStatusSubmitting(true)
    setMessage(null)

    try {
      await adminUsersApi.updateUserStatus(selectedUser.userId, nextStatus)
      setSelectedUser(null)
      setMessage({ type: 'success', text: t('customers.messages.statusSuccess') })
      await loadCustomers()
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : t('customers.messages.statusFailed')
      })
    } finally {
      setIsStatusSubmitting(false)
    }
  }

  return (
    <div className='flex h-screen overflow-hidden bg-background text-foreground'>
      <AdminSidebar activeItem='employees' />
      <div className='flex min-w-0 flex-1 flex-col overflow-hidden'>
        <AdminTopNav titleKey='customers.title' subtitleKey='customers.subtitle' />
        <main className='flex-1 overflow-y-auto p-4 md:p-6'>
          <div className='mx-auto flex max-w-7xl flex-col gap-6'>
            <section className='flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between'>
              <div>
                <h1 className='mb-2 font-display text-2xl font-bold text-primary md:text-3xl'>
                  {t('customers.title')}
                </h1>
                <p className='max-w-3xl text-muted-foreground'>{t('customers.subtitle')}</p>
              </div>
              <Button type='button' size='lg' onClick={() => void navigate('/admin/employees/new')}>
                <MaterialIcon name='person_add' className='text-lg' />
                <span>{t('customers.actions.add')}</span>
              </Button>
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

            <CustomerStatsGrid isLoading={isLoading} stats={stats} />

            <section className='rounded-xl border border-border bg-card p-5 shadow-sm'>
              <div className='flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between'>
                <div>
                  <h2 className='font-display text-xl font-bold text-card-foreground md:text-2xl'>
                    {t('customers.toolbar.title')}
                  </h2>
                  <p className='mt-2 max-w-3xl text-sm text-muted-foreground'>{t('customers.toolbar.intro')}</p>
                </div>
                <div className='flex flex-col gap-2 sm:flex-row sm:items-end'>
                  <label className='grid gap-2'>
                    <span className='text-sm font-bold text-card-foreground'>{t('customers.toolbar.statusLabel')}</span>
                    <select
                      value={status}
                      onChange={(event) => {
                        setStatus(event.target.value as CustomerStatusFilter)
                        setPage(0)
                      }}
                      className='h-11 min-w-52 rounded-lg border border-input bg-muted px-4 text-sm font-semibold text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring'
                    >
                      {CUSTOMER_STATUS_FILTERS.map((option) => (
                        <option key={option} value={option}>
                          {option === 'ALL' ? t('customers.status.ALL') : t(`users.status.${option}`)}
                        </option>
                      ))}
                    </select>
                  </label>
                  <Button
                    type='button'
                    variant='outline'
                    disabled={status === 'ALL'}
                    onClick={() => {
                      setStatus('ALL')
                      setPage(0)
                    }}
                  >
                    <MaterialIcon name='filter_alt_off' className='text-lg' />
                    {t('customers.toolbar.clear')}
                  </Button>
                </div>
              </div>
            </section>

            <AdminCustomersTable
              currentPage={page}
              isLoading={isLoading}
              onEdit={(user) => void navigate(`/admin/employees/${user.userId}/edit`)}
              onPageChange={setPage}
              onStatusChange={setSelectedUser}
              onView={(user) => void navigate(`/admin/employees/${user.userId}`)}
              pageSize={CUSTOMER_PAGE_SIZE}
              totalElements={filteredUsers.length}
              users={visibleUsers}
            />
          </div>
        </main>
      </div>

      <AdminUserStatusModal
        key={selectedUser?.userId ?? 'empty'}
        isSubmitting={isStatusSubmitting}
        user={selectedUser}
        onClose={() => setSelectedUser(null)}
        onSubmit={(nextStatus) => void handleStatusSubmit(nextStatus)}
      />
    </div>
  )
}

interface CustomerStatsGridProps {
  isLoading: boolean
  stats: CustomerStats
}

function CustomerStatsGrid({ isLoading, stats }: CustomerStatsGridProps) {
  const { t } = useTranslation('admin')
  const cards = [
    {
      icon: 'groups',
      label: t('customers.stats.total.label'),
      note: t('customers.stats.total.note'),
      value: stats.total
    },
    {
      icon: 'verified_user',
      label: t('customers.stats.active.label'),
      note: t('customers.stats.active.note'),
      value: stats.active
    },
    {
      icon: 'block',
      label: t('customers.stats.suspended.label'),
      note: t('customers.stats.suspended.note'),
      value: stats.suspended
    }
  ]

  return (
    <section className='grid gap-4 md:grid-cols-3'>
      {cards.map((card) => (
        <article key={card.label} className='rounded-xl border border-border bg-card p-5 shadow-sm'>
          <div className='flex items-start justify-between gap-4'>
            <div>
              <p className='text-sm font-semibold text-muted-foreground'>{card.label}</p>
              <p className='mt-3 font-display text-3xl font-bold text-card-foreground'>
                {isLoading ? <span className='inline-block h-8 w-16 animate-pulse rounded-md bg-muted' /> : card.value}
              </p>
            </div>
            <span
              className={cn(
                'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border bg-muted text-primary'
              )}
            >
              <MaterialIcon name={card.icon} className='text-xl' />
            </span>
          </div>
          <p className='mt-3 text-sm text-muted-foreground'>{card.note}</p>
        </article>
      ))}
    </section>
  )
}
