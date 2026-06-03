import { useTranslation } from 'react-i18next'

import { cn } from '~/shared/lib/cn'
import { MaterialIcon } from '~/shared/ui'

const TRANSACTIONS = [
  { key: 'rc99021', type: 'import', movement: '+40', balance: '120', movementTone: 'text-success' },
  { key: 'so45091', type: 'export', movement: '-3', balance: '45', movementTone: 'text-destructive' },
  { key: 'adj0092', type: 'damage', movement: '-1', balance: '18', movementTone: 'text-destructive' },
  { key: 'aud1104', type: 'audit', movement: '+2', balance: '85', movementTone: 'text-success' }
] as const

const TYPE_BADGE_CLASS = {
  audit: 'bg-secondary text-secondary-foreground',
  damage: 'bg-destructive text-destructive-foreground',
  export: 'bg-primary text-primary-foreground',
  import: 'bg-success text-success-foreground'
} as const

export function ManagerTransactionTable() {
  const { t } = useTranslation('manager')

  return (
    <section className='overflow-hidden rounded-xl border border-border bg-card shadow-sm'>
      <div className='overflow-x-auto'>
        <table className='w-full min-w-[1040px] border-collapse text-left'>
          <thead>
            <tr className='border-b border-border bg-muted text-sm font-semibold text-muted-foreground'>
              <th className='px-4 py-4'>{t('table.columns.dateTime')}</th>
              <th className='px-4 py-4'>{t('table.columns.id')}</th>
              <th className='px-4 py-4'>{t('table.columns.product')}</th>
              <th className='px-4 py-4'>{t('table.columns.type')}</th>
              <th className='px-4 py-4 text-right'>{t('table.columns.movement')}</th>
              <th className='px-4 py-4 text-right'>{t('table.columns.balance')}</th>
              <th className='px-4 py-4'>{t('table.columns.staff')}</th>
              <th className='px-4 py-4'>{t('table.columns.note')}</th>
              <th className='px-4 py-4' />
            </tr>
          </thead>
          <tbody className='divide-y divide-border'>
            {TRANSACTIONS.map((transaction) => (
              <tr key={transaction.key} className='transition-colors hover:bg-muted'>
                <td className='whitespace-nowrap px-4 py-3 text-sm text-muted-foreground'>
                  {t(`table.rows.${transaction.key}.dateTime`)}
                </td>
                <td className='px-4 py-3 text-sm font-semibold text-primary'>
                  {t(`table.rows.${transaction.key}.id`)}
                </td>
                <td className='px-4 py-3'>
                  <div className='flex items-center gap-3'>
                    <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded border border-border bg-muted text-muted-foreground'>
                      <MaterialIcon name='inventory_2' className='text-lg' />
                    </div>
                    <div className='min-w-40'>
                      <p className='truncate font-semibold text-card-foreground'>
                        {t(`table.rows.${transaction.key}.product`)}
                      </p>
                      <p className='text-sm text-muted-foreground'>{t(`table.rows.${transaction.key}.sku`)}</p>
                    </div>
                  </div>
                </td>
                <td className='whitespace-nowrap px-4 py-3'>
                  <span
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold',
                      TYPE_BADGE_CLASS[transaction.type]
                    )}
                  >
                    <span className='h-1.5 w-1.5 rounded-full bg-current' />
                    {t(`transactionTypes.${transaction.type}`)}
                  </span>
                </td>
                <td className={cn('px-4 py-3 text-right font-semibold', transaction.movementTone)}>
                  {transaction.movement}
                </td>
                <td className='px-4 py-3 text-right font-medium'>{transaction.balance}</td>
                <td className='whitespace-nowrap px-4 py-3'>{t(`table.rows.${transaction.key}.staff`)}</td>
                <td className='max-w-44 truncate px-4 py-3 text-sm text-muted-foreground'>
                  {t(`table.rows.${transaction.key}.note`)}
                </td>
                <td className='px-4 py-3 text-right'>
                  <button
                    type='button'
                    aria-label={t('table.viewDetails')}
                    className='rounded p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-primary focus:outline-none focus:ring-2 focus:ring-ring'
                  >
                    <MaterialIcon name='visibility' className='text-lg' />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className='flex flex-col gap-3 border-t border-border bg-muted px-4 py-3 sm:flex-row sm:items-center sm:justify-between'>
        <span className='text-sm font-medium text-muted-foreground'>{t('pagination.showing')}</span>
        <div className='flex gap-1'>
          <button
            disabled
            className='flex h-8 w-8 items-center justify-center rounded text-muted-foreground disabled:opacity-50'
          >
            <MaterialIcon name='chevron_left' className='text-lg' />
          </button>
          {[1, 2, 3].map((page) => (
            <button
              key={page}
              className={
                page === 1
                  ? 'flex h-8 w-8 items-center justify-center rounded bg-primary text-sm font-bold text-primary-foreground'
                  : 'flex h-8 w-8 items-center justify-center rounded text-sm font-bold text-foreground hover:bg-card'
              }
            >
              {page}
            </button>
          ))}
          <span className='flex h-8 w-8 items-center justify-center text-muted-foreground'>...</span>
          <button className='flex h-8 w-8 items-center justify-center rounded text-muted-foreground hover:bg-card hover:text-foreground'>
            <MaterialIcon name='chevron_right' className='text-lg' />
          </button>
        </div>
      </div>
    </section>
  )
}
