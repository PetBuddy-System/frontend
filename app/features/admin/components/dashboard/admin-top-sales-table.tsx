import { useTranslation } from 'react-i18next'

import { MaterialIcon } from '~/shared/ui'
import { cn } from '~/shared/lib/cn'

const TOP_SALES_ITEMS = [
  {
    key: 'royalCanin',
    icon: 'inventory_2',
    categoryKey: 'product',
    quantity: '145',
    revenue: '52.200.000 đ',
    badgeClassName: 'bg-primary/10 text-primary'
  },
  {
    key: 'vaccine',
    icon: 'vaccines',
    categoryKey: 'medical',
    quantity: '89',
    revenue: '26.700.000 đ',
    badgeClassName: 'bg-secondary/40 text-secondary-foreground'
  },
  {
    key: 'grooming',
    icon: 'content_cut',
    categoryKey: 'grooming',
    quantity: '64',
    revenue: '16.000.000 đ',
    badgeClassName: 'bg-success/10 text-success'
  }
] as const

export function AdminTopSalesTable() {
  const { t } = useTranslation('admin')

  return (
    <section className='rounded-xl border border-border bg-card p-6 shadow-sm'>
      <h2 className='mb-6 font-display text-2xl font-bold text-card-foreground'>{t('topSales.title')}</h2>
      <div className='overflow-x-auto'>
        <table className='w-full min-w-[720px] border-collapse text-left'>
          <thead>
            <tr className='border-b border-border text-sm font-semibold text-muted-foreground'>
              <th className='px-4 pb-3'>{t('topSales.columns.name')}</th>
              <th className='px-4 pb-3'>{t('topSales.columns.category')}</th>
              <th className='px-4 pb-3 text-right'>{t('topSales.columns.quantity')}</th>
              <th className='px-4 pb-3 text-right'>{t('topSales.columns.revenue')}</th>
            </tr>
          </thead>
          <tbody>
            {TOP_SALES_ITEMS.map((item) => (
              <tr key={item.key} className='border-b border-border last:border-b-0 hover:bg-muted'>
                <td className='px-4 py-4'>
                  <div className='flex items-center gap-3'>
                    <div className='flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-border bg-muted text-primary'>
                      <MaterialIcon name={item.icon} />
                    </div>
                    <span className='font-semibold text-primary'>{t(`topSales.items.${item.key}.name`)}</span>
                  </div>
                </td>
                <td className='px-4 py-4'>
                  <span className={cn('inline-flex rounded-full px-3 py-1 text-sm font-semibold', item.badgeClassName)}>
                    {t(`topSales.categories.${item.categoryKey}`)}
                  </span>
                </td>
                <td className='px-4 py-4 text-right'>{item.quantity}</td>
                <td className='px-4 py-4 text-right font-semibold'>{item.revenue}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
