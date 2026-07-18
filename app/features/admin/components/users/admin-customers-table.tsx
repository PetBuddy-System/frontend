import { useTranslation } from 'react-i18next'

import { cn } from '~/shared/lib/cn'
import { MaterialIcon } from '~/shared/ui'

import {
  formatAdminUserDate,
  formatAdminUserDateTime,
  getAdminUserAvatarUrl,
  getUserInitials
} from '../../lib/admin-users-format'
import type { AdminUserResponse } from '../../services/users'

const STATUS_CLASS_BY_STATUS: Record<string, string> = {
  ACTIVE: 'bg-success/10 text-success border-success/30',
  PENDING: 'bg-warning/10 text-warning border-warning/30',
  INACTIVE: 'bg-muted text-muted-foreground border-border',
  SUSPENDED: 'bg-destructive/10 text-destructive border-destructive/30',
  DELETED: 'bg-destructive text-destructive-foreground border-destructive'
}

export interface AdminCustomersTableProps {
  currentPage: number
  isLoading: boolean
  onEdit: (user: AdminUserResponse) => void
  onPageChange: (page: number) => void
  onStatusChange: (user: AdminUserResponse) => void
  onView: (user: AdminUserResponse) => void
  pageSize: number
  totalElements: number
  users: AdminUserResponse[]
}

export function AdminCustomersTable({
  currentPage,
  isLoading,
  onEdit,
  onPageChange,
  onStatusChange,
  onView,
  pageSize,
  totalElements,
  users
}: AdminCustomersTableProps) {
  const { t } = useTranslation('admin')
  const totalPages = Math.ceil(totalElements / pageSize)
  const from = totalElements === 0 ? 0 : currentPage * pageSize + 1
  const to = Math.min(from + users.length - 1, totalElements)

  return (
    <section className='overflow-hidden rounded-xl border border-border bg-card shadow-sm'>
      <div className='overflow-x-auto'>
        <table className='w-full min-w-[920px] border-collapse text-left'>
          <thead>
            <tr className='border-b border-border bg-muted text-sm font-semibold text-muted-foreground'>
              <th className='p-4'>{t('customers.table.columns.user')}</th>
              <th className='p-4'>{t('customers.table.columns.status')}</th>
              <th className='p-4'>{t('customers.table.columns.dateOfBirth')}</th>
              <th className='p-4'>{t('customers.table.columns.createdAt')}</th>
              <th className='p-4 text-right'>{t('customers.table.columns.actions')}</th>
            </tr>
          </thead>
          <tbody className='divide-y divide-border'>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <tr key={index}>
                  <td colSpan={5} className='p-4'>
                    <div className='h-12 animate-pulse rounded-lg bg-muted' />
                  </td>
                </tr>
              ))
            ) : users.length > 0 ? (
              users.map((user) => {
                const avatarUrl = getAdminUserAvatarUrl(user)

                return (
                  <tr key={user.userId} className='transition-colors hover:bg-muted/60'>
                    <td className='p-4'>
                      <div className='flex items-center gap-3'>
                        {avatarUrl ? (
                          <img
                            src={avatarUrl}
                            alt={t('customers.table.avatarAlt')}
                            className='h-10 w-10 shrink-0 rounded-full object-cover'
                          />
                        ) : (
                          <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-bold text-muted-foreground'>
                            {getUserInitials(user)}
                          </div>
                        )}
                        <div className='min-w-0'>
                          <p className='truncate font-semibold text-card-foreground'>{user.fullName}</p>
                          <p className='truncate text-xs text-muted-foreground'>{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className='p-4'>
                      <span
                        className={cn(
                          'inline-flex rounded-full border px-3 py-1 text-xs font-bold',
                          STATUS_CLASS_BY_STATUS[user.status] ?? 'border-border bg-muted text-muted-foreground'
                        )}
                      >
                        {t(`users.status.${user.status}`)}
                      </span>
                    </td>
                    <td className='p-4 text-muted-foreground'>{formatAdminUserDate(user.dateOfBirth)}</td>
                    <td className='p-4 text-muted-foreground'>{formatAdminUserDateTime(user.createdAt)}</td>
                    <td className='p-4'>
                      <div className='flex justify-end gap-1'>
                        <button
                          type='button'
                          aria-label={t('customers.actions.view')}
                          onClick={() => onView(user)}
                          className='flex h-9 w-9 items-center justify-center rounded-full text-primary transition-colors hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring'
                        >
                          <MaterialIcon name='visibility' className='text-lg' />
                        </button>
                        <button
                          type='button'
                          aria-label={t('customers.actions.edit')}
                          onClick={() => onEdit(user)}
                          className='flex h-9 w-9 items-center justify-center rounded-full text-primary transition-colors hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring'
                        >
                          <MaterialIcon name='edit' className='text-lg' />
                        </button>
                        <button
                          type='button'
                          aria-label={t('customers.actions.changeStatus')}
                          onClick={() => onStatusChange(user)}
                          className='flex h-9 w-9 items-center justify-center rounded-full text-warning transition-colors hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring'
                        >
                          <MaterialIcon name='manage_accounts' className='text-lg' />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan={5} className='p-10 text-center text-sm text-muted-foreground'>
                  {t('customers.table.empty')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className='flex flex-col gap-4 border-t border-border bg-muted px-4 py-3 sm:flex-row sm:items-center sm:justify-between'>
        <p className='text-sm text-muted-foreground'>
          {t('customers.pagination.showing', { from, to, total: totalElements })}
        </p>
        <nav aria-label={t('customers.pagination.label')} className='flex items-center gap-1'>
          <button
            type='button'
            disabled={currentPage <= 0}
            onClick={() => onPageChange(Math.max(currentPage - 1, 0))}
            className='flex h-9 w-9 items-center justify-center rounded-md border border-border bg-card text-muted-foreground hover:text-primary disabled:cursor-not-allowed disabled:opacity-50'
          >
            <MaterialIcon name='chevron_left' className='text-lg' />
          </button>
          <span className='px-3 text-sm font-bold text-card-foreground'>
            {totalPages === 0 ? 0 : currentPage + 1} / {totalPages}
          </span>
          <button
            type='button'
            disabled={currentPage + 1 >= totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            className='flex h-9 w-9 items-center justify-center rounded-md border border-border bg-card text-muted-foreground hover:text-primary disabled:cursor-not-allowed disabled:opacity-50'
          >
            <MaterialIcon name='chevron_right' className='text-lg' />
          </button>
        </nav>
      </div>
    </section>
  )
}
