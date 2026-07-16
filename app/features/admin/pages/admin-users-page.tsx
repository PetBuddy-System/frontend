import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router'

import { Button, MaterialIcon } from '~/shared/ui'

import { AdminSidebar } from '../components/layout/admin-sidebar'
import { AdminTopNav } from '../components/layout/admin-top-nav'
import { AdminUserStatusModal } from '../components/users/admin-user-status-modal'
import { AdminUsersStatsGrid, type AdminUsersStats } from '../components/users/admin-users-stats-grid'
import { AdminUsersTable } from '../components/users/admin-users-table'
import { AdminUsersToolbar } from '../components/users/admin-users-toolbar'
import { sortUsersByCreatedAtDesc } from '../lib/admin-users-format'
import {
  adminUsersApi,
  type AdminEmployeeRole,
  type AdminStaffTask,
  type AdminUserResponse,
  type AdminUserStatus,
  type PageUserResponse
} from '../services/users'

const DEFAULT_STATS: AdminUsersStats = {
  active: 0,
  coordinator: 0,
  groomer: 0,
  managers: 0,
  shipper: 0,
  staff: 0,
  suspended: 0,
  total: 0
}

const STATS_PAGE_SIZE = 100

function buildStats(users: AdminUserResponse[]): AdminUsersStats {
  return users.reduce<AdminUsersStats>(
    (stats, user) => {
      if (user.role !== 'MANAGER' && user.role !== 'STAFF') return stats

      stats.total += 1

      if (user.role === 'MANAGER') stats.managers += 1
      if (user.role === 'STAFF') stats.staff += 1
      if (user.staffTask === 'GROOMER') stats.groomer += 1
      if (user.staffTask === 'SHIPPER') stats.shipper += 1
      if (user.staffTask === 'COORDINATOR') stats.coordinator += 1
      if (user.status === 'ACTIVE') stats.active += 1
      if (user.status === 'SUSPENDED') stats.suspended += 1

      return stats
    },
    { ...DEFAULT_STATS }
  )
}

export function AdminUsersPage() {
  const { t } = useTranslation('admin')
  const location = useLocation()
  const navigate = useNavigate()
  const [role, setRole] = useState<AdminEmployeeRole | 'ALL'>('ALL')
  const [staffTask, setStaffTask] = useState<AdminStaffTask | 'ALL'>('ALL')
  const [page, setPage] = useState(0)
  const [pageData, setPageData] = useState<PageUserResponse | null>(null)
  const [stats, setStats] = useState<AdminUsersStats>(DEFAULT_STATS)
  const [isLoading, setIsLoading] = useState(false)
  const [isStatsLoading, setIsStatsLoading] = useState(false)
  const [isStatusSubmitting, setIsStatusSubmitting] = useState(false)
  const [selectedUser, setSelectedUser] = useState<AdminUserResponse | null>(null)
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(() => {
    const state = location.state

    if (state && typeof state === 'object' && 'employeeCreated' in state && state.employeeCreated === true) {
      return { type: 'success', text: t('users.messages.createSuccess') }
    }

    return null
  })

  const users = useMemo(() => sortUsersByCreatedAtDesc(pageData?.content ?? []), [pageData])

  const loadEmployees = useCallback(async () => {
    setIsLoading(true)

    try {
      const response = await adminUsersApi.getEmployees({ page, role, size: 10, staffTask })
      setPageData(response.data)
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : t('users.messages.loadFailed')
      })
    } finally {
      setIsLoading(false)
    }
  }, [page, role, staffTask, t])

  const loadStats = useCallback(async () => {
    setIsStatsLoading(true)

    try {
      const firstResponse = await adminUsersApi.getEmployees({ page: 0, size: STATS_PAGE_SIZE })
      const allUsers = [...firstResponse.data.content]

      for (let nextPage = 1; nextPage < firstResponse.data.totalPages; nextPage += 1) {
        const response = await adminUsersApi.getEmployees({ page: nextPage, size: STATS_PAGE_SIZE })
        allUsers.push(...response.data.content)
      }

      setStats(buildStats(allUsers))
    } catch {
      setStats(DEFAULT_STATS)
    } finally {
      setIsStatsLoading(false)
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Employee list is loaded from the API after filter/page changes.
    void loadEmployees()
  }, [loadEmployees])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Stats are loaded once from the API after mount.
    void loadStats()
  }, [loadStats])

  async function handleStatusSubmit(status: AdminUserStatus) {
    if (!selectedUser) return

    setIsStatusSubmitting(true)
    setMessage(null)

    try {
      await adminUsersApi.updateUserStatus(selectedUser.userId, status)
      setSelectedUser(null)
      setMessage({ type: 'success', text: t('users.messages.statusSuccess') })
      await Promise.all([loadEmployees(), loadStats()])
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : t('users.messages.statusFailed')
      })
    } finally {
      setIsStatusSubmitting(false)
    }
  }

  return (
    <div className='flex h-screen overflow-hidden bg-background text-foreground'>
      <AdminSidebar activeItem='users' />
      <div className='flex min-w-0 flex-1 flex-col overflow-hidden'>
        <AdminTopNav titleKey='users.title' subtitleKey='users.subtitle' />
        <main className='flex-1 overflow-y-auto p-4 md:p-6'>
          <div className='mx-auto flex max-w-7xl flex-col gap-6'>
            <section className='flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between'>
              <div>
                <h1 className='mb-2 font-display text-2xl font-bold text-primary md:text-3xl'>{t('users.title')}</h1>
                <p className='max-w-3xl text-muted-foreground'>{t('users.subtitle')}</p>
              </div>
              <Button type='button' size='lg' onClick={() => void navigate('/admin/users/new')}>
                <MaterialIcon name='person_add' className='text-lg' />
                <span>{t('users.actions.addEmployee')}</span>
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

            <AdminUsersStatsGrid isLoading={isStatsLoading} stats={stats} />
            <AdminUsersToolbar
              role={role}
              staffTask={staffTask}
              onRoleChange={(nextRole) => {
                setRole(nextRole)
                setPage(0)
              }}
              onStaffTaskChange={(nextStaffTask) => {
                setStaffTask(nextStaffTask)
                setPage(0)
              }}
              onClear={() => {
                setRole('ALL')
                setStaffTask('ALL')
                setPage(0)
              }}
            />
            <AdminUsersTable
              isLoading={isLoading}
              pageData={pageData}
              users={users}
              onPageChange={setPage}
              onView={(user) => void navigate(`/admin/users/${user.userId}`)}
              onEdit={(user) => void navigate(`/admin/users/${user.userId}/edit`)}
              onStatusChange={setSelectedUser}
            />
          </div>
        </main>
      </div>

      <AdminUserStatusModal
        key={selectedUser?.userId ?? 'empty'}
        isSubmitting={isStatusSubmitting}
        user={selectedUser}
        onClose={() => setSelectedUser(null)}
        onSubmit={(status) => void handleStatusSubmit(status)}
      />
    </div>
  )
}
