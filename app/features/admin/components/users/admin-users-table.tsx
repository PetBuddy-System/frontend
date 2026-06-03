import { useTranslation } from 'react-i18next'

import { cn } from '~/shared/lib/cn'
import { MaterialIcon } from '~/shared/ui'

const USERS = [
  {
    key: 'nguyenVanA',
    initials: 'NA',
    phone: '0901 234 567',
    orders: 12,
    points: 450,
    status: 'active',
    avatarClassName: 'bg-secondary text-secondary-foreground',
    pointsClassName: 'text-secondary-foreground'
  },
  {
    key: 'leThiB',
    initials: 'LB',
    phone: '0987 654 321',
    orders: 5,
    points: 120,
    status: 'active',
    avatarClassName: 'bg-primary text-primary-foreground',
    pointsClassName: 'text-secondary-foreground'
  },
  {
    key: 'tranVanC',
    initials: 'TC',
    phone: '0912 345 678',
    orders: 0,
    points: 0,
    status: 'locked',
    avatarClassName: 'bg-muted text-muted-foreground',
    pointsClassName: 'text-muted-foreground'
  }
] as const

export function AdminUsersTable() {
  const { t } = useTranslation('admin')

  return (
    <section className='overflow-hidden rounded-xl border border-border bg-card shadow-sm'>
      <div className='overflow-x-auto'>
        <table className='w-full min-w-[820px] border-collapse text-left'>
          <thead>
            <tr className='border-b border-border bg-muted text-sm font-semibold text-muted-foreground'>
              <th className='p-4'>{t('users.table.columns.customer')}</th>
              <th className='p-4'>{t('users.table.columns.phone')}</th>
              <th className='p-4 text-center'>{t('users.table.columns.orders')}</th>
              <th className='p-4 text-center'>{t('users.table.columns.points')}</th>
              <th className='p-4'>{t('users.table.columns.status')}</th>
              <th className='p-4 text-right'>{t('users.table.columns.actions')}</th>
            </tr>
          </thead>
          <tbody className='divide-y divide-border'>
            {USERS.map((user) => {
              const isActive = user.status === 'active'

              return (
                <tr key={user.key} className='transition-colors hover:bg-muted'>
                  <td className='p-4'>
                    <div className='flex items-center gap-3'>
                      <div
                        className={cn(
                          'flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-display font-bold',
                          user.avatarClassName
                        )}
                      >
                        {user.initials}
                      </div>
                      <div>
                        <p className='font-semibold text-card-foreground'>{t(`users.table.rows.${user.key}.name`)}</p>
                        <p className='text-xs text-muted-foreground'>{t(`users.table.rows.${user.key}.email`)}</p>
                      </div>
                    </div>
                  </td>
                  <td className='p-4'>{user.phone}</td>
                  <td className='p-4 text-center font-semibold'>
                    {t('users.table.orderCount', { count: user.orders })}
                  </td>
                  <td className='p-4 text-center'>
                    <span className={cn('font-display text-xl font-bold', user.pointsClassName)}>{user.points}</span>
                    <span className='ml-1 text-xs text-muted-foreground'>{t('users.table.pointsUnit')}</span>
                  </td>
                  <td className='p-4'>
                    <span
                      className={
                        isActive
                          ? 'inline-flex rounded-full bg-success px-3 py-1 text-xs font-bold text-success-foreground'
                          : 'inline-flex rounded-full bg-destructive px-3 py-1 text-xs font-bold text-destructive-foreground'
                      }
                    >
                      {t(`users.status.${user.status}`)}
                    </span>
                  </td>
                  <td className='p-4'>
                    <div className='flex justify-end gap-1'>
                      <button
                        type='button'
                        aria-label={t('users.actions.view')}
                        className='flex h-9 w-9 items-center justify-center rounded-full text-primary transition-colors hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring'
                      >
                        <MaterialIcon name='visibility' className='text-lg' />
                      </button>
                      <button
                        type='button'
                        aria-label={t('users.actions.edit')}
                        className='flex h-9 w-9 items-center justify-center rounded-full text-primary transition-colors hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring'
                      >
                        <MaterialIcon name='edit' className='text-lg' />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className='flex flex-col gap-4 border-t border-border bg-muted px-4 py-3 sm:flex-row sm:items-center sm:justify-between'>
        <p className='text-sm text-muted-foreground'>{t('users.pagination.showing', { from: 1, to: 3, total: 45 })}</p>
        <nav aria-label={t('users.pagination.label')} className='flex items-center gap-1'>
          <button className='flex h-9 w-9 items-center justify-center rounded-md border border-border bg-card text-muted-foreground hover:text-primary'>
            <MaterialIcon name='chevron_left' className='text-lg' />
          </button>
          {[1, 2, 3].map((page) => (
            <button
              key={page}
              className={
                page === 1
                  ? 'h-9 min-w-9 rounded-md bg-primary px-3 text-sm font-bold text-primary-foreground'
                  : 'h-9 min-w-9 rounded-md border border-border bg-card px-3 text-sm font-bold text-muted-foreground hover:text-primary'
              }
            >
              {page}
            </button>
          ))}
          <button className='flex h-9 w-9 items-center justify-center rounded-md border border-border bg-card text-muted-foreground hover:text-primary'>
            <MaterialIcon name='chevron_right' className='text-lg' />
          </button>
        </nav>
      </div>
    </section>
  )
}
