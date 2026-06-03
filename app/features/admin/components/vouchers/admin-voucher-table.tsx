import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { cn } from '~/shared/lib/cn'
import { MaterialIcon } from '~/shared/ui'

interface VoucherRow {
  code: string
  key: 'petSpring' | 'newbie' | 'xmas'
  discount: string
  minimumOrder: string
  expiry?: string
  expiryKey?: 'unlimited'
  usageKey: 'daysLeft' | 'usage' | 'expired'
  initialActive: boolean
}

const VOUCHERS: VoucherRow[] = [
  {
    code: 'PETSPRING24',
    key: 'petSpring',
    discount: '10% / Tối đa 50k',
    minimumOrder: '200.000đ',
    expiry: '31/12/2024',
    usageKey: 'daysLeft',
    initialActive: true
  },
  {
    code: 'NEWBIE50',
    key: 'newbie',
    discount: '50.000 VND',
    minimumOrder: '0đ',
    expiryKey: 'unlimited',
    usageKey: 'usage',
    initialActive: true
  },
  {
    code: 'XMAS2023',
    key: 'xmas',
    discount: '20%',
    minimumOrder: '500.000đ',
    expiry: '25/12/2023',
    usageKey: 'expired',
    initialActive: false
  }
]

export function AdminVoucherTable() {
  const { t } = useTranslation('admin')
  const [activeVoucherCodes, setActiveVoucherCodes] = useState<Set<string>>(
    () => new Set(VOUCHERS.filter((voucher) => voucher.initialActive).map((voucher) => voucher.code))
  )

  function handleToggle(code: string) {
    setActiveVoucherCodes((currentCodes) => {
      const nextCodes = new Set(currentCodes)

      if (nextCodes.has(code)) {
        nextCodes.delete(code)
      } else {
        nextCodes.add(code)
      }

      return nextCodes
    })
  }

  return (
    <section className='space-y-4 xl:col-span-2'>
      <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <h2 className='flex items-center gap-2 font-display text-lg font-bold text-card-foreground'>
          <MaterialIcon name='list_alt' className='text-primary' />
          {t('voucherManagement.table.title')}
        </h2>
        <div className='flex items-center gap-2'>
          <div className='relative min-w-0 flex-1 sm:w-64'>
            <MaterialIcon name='search' className='absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground' />
            <input
              type='search'
              placeholder={t('voucherManagement.table.searchPlaceholder')}
              className='h-10 w-full rounded-lg border border-input bg-card pl-10 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring'
            />
          </div>
          <button
            type='button'
            aria-label={t('voucherManagement.table.filter')}
            className='flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:bg-muted hover:text-primary'
          >
            <MaterialIcon name='filter_list' />
          </button>
        </div>
      </div>

      <div className='overflow-hidden rounded-2xl border border-border bg-card shadow-sm'>
        <div className='overflow-x-auto'>
          <table className='w-full min-w-[780px] border-collapse text-left'>
            <thead>
              <tr className='border-b border-border bg-muted/50 text-xs font-bold uppercase tracking-wide text-muted-foreground'>
                <th className='px-4 py-3'>{t('voucherManagement.table.columns.code')}</th>
                <th className='px-4 py-3'>{t('voucherManagement.table.columns.discount')}</th>
                <th className='px-4 py-3'>{t('voucherManagement.table.columns.expiry')}</th>
                <th className='px-4 py-3'>{t('voucherManagement.table.columns.status')}</th>
                <th className='px-4 py-3 text-right'>{t('voucherManagement.table.columns.actions')}</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-border'>
              {VOUCHERS.map((voucher) => {
                const isActive = activeVoucherCodes.has(voucher.code)

                return (
                  <tr
                    key={voucher.code}
                    className={cn('transition-colors hover:bg-muted/70', !isActive && 'opacity-60')}
                  >
                    <td className='px-4 py-4'>
                      <p className={cn('font-bold', isActive ? 'text-primary' : 'text-muted-foreground')}>
                        {voucher.code}
                      </p>
                      <p className='text-xs text-muted-foreground'>
                        {t(`voucherManagement.table.rows.${voucher.key}.description`)}
                      </p>
                    </td>
                    <td className='px-4 py-4'>
                      <p className='text-sm font-semibold text-card-foreground'>{voucher.discount}</p>
                      <p className='text-xs text-muted-foreground'>
                        {t('voucherManagement.table.minimumOrder', { value: voucher.minimumOrder })}
                      </p>
                    </td>
                    <td className='px-4 py-4'>
                      <p className='text-sm font-medium text-card-foreground'>
                        {voucher.expiryKey ? t(`voucherManagement.table.${voucher.expiryKey}`) : voucher.expiry}
                      </p>
                      <p className={cn('text-xs font-semibold', isActive ? 'text-success' : 'text-muted-foreground')}>
                        {t(`voucherManagement.table.rows.${voucher.key}.${voucher.usageKey}`)}
                      </p>
                    </td>
                    <td className='px-4 py-4'>
                      <button
                        type='button'
                        onClick={() => handleToggle(voucher.code)}
                        aria-pressed={isActive}
                        aria-label={
                          isActive ? t('voucherManagement.status.active') : t('voucherManagement.status.inactive')
                        }
                        className={cn(
                          'flex h-6 w-11 rounded-full p-0.5 transition-colors focus:outline-none focus:ring-2 focus:ring-ring',
                          isActive ? 'justify-end bg-success' : 'justify-start bg-muted-foreground'
                        )}
                      >
                        <span className='h-5 w-5 rounded-full bg-card shadow-sm transition-transform' />
                      </button>
                    </td>
                    <td className='px-4 py-4'>
                      <div className='flex justify-end gap-2'>
                        <button
                          type='button'
                          aria-label={t('voucherManagement.actions.edit')}
                          className='flex h-9 w-9 items-center justify-center rounded-lg text-primary transition-colors hover:bg-primary/10'
                        >
                          <MaterialIcon name='edit' className='text-lg' />
                        </button>
                        <button
                          type='button'
                          aria-label={t('voucherManagement.actions.delete')}
                          className='flex h-9 w-9 items-center justify-center rounded-lg text-destructive transition-colors hover:bg-destructive/10'
                        >
                          <MaterialIcon name='delete' className='text-lg' />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div className='flex flex-col gap-3 border-t border-border bg-muted px-4 py-3 sm:flex-row sm:items-center sm:justify-between'>
          <p className='text-sm text-muted-foreground'>{t('voucherManagement.pagination.showing')}</p>
          <div className='flex gap-2'>
            {[1, 2, 3].map((page) => (
              <button
                key={page}
                type='button'
                className={
                  page === 1
                    ? 'h-8 min-w-8 rounded-lg bg-primary px-3 text-sm font-bold text-primary-foreground'
                    : 'h-8 min-w-8 rounded-lg border border-border bg-card px-3 text-sm font-semibold text-muted-foreground hover:text-primary'
                }
              >
                {page}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
