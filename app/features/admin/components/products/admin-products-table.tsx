import { useTranslation } from 'react-i18next'

import { cn } from '~/shared/lib/cn'
import { MaterialIcon } from '~/shared/ui'

const PRODUCTS = [
  {
    key: 'royalCaninPoodle',
    category: 'food',
    price: '450.000đ',
    stock: 25,
    updatedAt: '14/03/2024',
    active: true,
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDKW2p3CS9TUCDaxf5Cc1vHJQeoewqz6dnx7m1em2gq8LC8w-XHPYE3cXj27sZSlBamq6GwP2dgZW82Wm9pbyFI7Lyr18Dg2IznpsrvVu4UlgSFO9MnpWGNbSMwWotc7lzBDptbJlhgIxI2e3XK9dvcO6Q7NRSEqBeBva-1zU5thB7RMjeT-EjyUu9LMhShxzHH-85Xq7x0RE-YQY309uQ4JcOdhkfOy9ltAalnUXGbQgU4IckufGmosLTi6OiA_ovwYzRS6C4Mu1Y'
  },
  {
    key: 'transportCrate',
    category: 'accessories',
    price: '450.000đ',
    stock: 8,
    updatedAt: '12/03/2024',
    active: true,
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDAVh2UR8BTr1YAkc2LGOEmDysvlkio1tAh9Gbv3NbgsvM7MnAjbVFB7tvkSBPeTAOLZdxjWvMhtUkjwbBU4_nQhsobEMQokrBLLfjoq_Gg_lrklxt_lYJ_RFM8Mhe8aU4w2GXFRL6E7TPuaj83hCb0koH08I0OQZqC-ZB7jG80hU6Ik2YzLlrAIgdt2xJGoIMVublUPBDFjkG4SIb5qiKK9gUPYiA-J8TgLc9x715NJjjeUIim1WoqwjGx5E-Xt_rj6vVwBR-sOnM'
  },
  {
    key: 'helloShampoo',
    category: 'accessories',
    price: '120.000đ',
    stock: 50,
    updatedAt: '10/03/2024',
    active: true,
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuD0fgqqc7QFsI5slkMgB4qB3hqPjKi54XNayQZZstMeXVrkHTPsG9yBTesb3s-6B6QRba75hl_YSr5gZfYorzezwg_98F1BVvfTEMLUwxVYMiRDwKp_3vDfcCTDuF5J0bRy6n0Ro5RWQTntVc405vT0TqHI9rSR5Uf1X4tC1D5knwFnOAR-CPt92AtejSzkmnmdV8fucMQDgyIZUX-te6VsOtQ7luFfjLL2qbyXqxnggw71bv0rN5T54JTaskJoIF03dremqG8HSxs'
  }
] as const

const CATEGORY_CLASS_BY_CATEGORY = {
  accessories: 'bg-secondary text-secondary-foreground',
  food: 'bg-primary/10 text-primary'
} as const

export function AdminProductsTable() {
  const { t } = useTranslation('admin')

  return (
    <section className='overflow-hidden rounded-2xl border border-border bg-card shadow-sm'>
      <div className='overflow-x-auto'>
        <table className='w-full min-w-[960px] border-collapse text-left'>
          <thead>
            <tr className='border-b border-border bg-muted/50 text-xs font-bold uppercase tracking-wide text-muted-foreground'>
              <th className='px-4 py-3'>{t('productManagement.table.columns.name')}</th>
              <th className='px-4 py-3'>{t('productManagement.table.columns.category')}</th>
              <th className='px-4 py-3'>{t('productManagement.table.columns.price')}</th>
              <th className='px-4 py-3 text-center'>{t('productManagement.table.columns.stock')}</th>
              <th className='px-4 py-3'>{t('productManagement.table.columns.status')}</th>
              <th className='px-4 py-3'>{t('productManagement.table.columns.updatedAt')}</th>
              <th className='px-4 py-3 text-right'>{t('productManagement.table.columns.actions')}</th>
            </tr>
          </thead>
          <tbody className='divide-y divide-border'>
            {PRODUCTS.map((product) => {
              const isLowStock = product.stock <= 10

              return (
                <tr key={product.key} className='group transition-colors hover:bg-muted/70'>
                  <td className='px-4 py-4'>
                    <div className='flex items-center gap-4'>
                      <img
                        src={product.imageUrl}
                        alt={t(`productManagement.table.rows.${product.key}.imageAlt`)}
                        className='h-14 w-14 shrink-0 rounded-xl border border-border bg-muted object-cover'
                      />
                      <div className='min-w-0'>
                        <p className='font-bold text-card-foreground'>
                          {t(`productManagement.table.rows.${product.key}.name`)}
                        </p>
                        <p className='text-xs text-muted-foreground'>
                          {t(`productManagement.table.rows.${product.key}.sku`)}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className='px-4 py-4'>
                    <span
                      className={cn(
                        'inline-flex rounded-full px-3 py-1 text-xs font-bold',
                        CATEGORY_CLASS_BY_CATEGORY[product.category]
                      )}
                    >
                      {t(`productManagement.categories.${product.category}`)}
                    </span>
                  </td>
                  <td className='px-4 py-4 font-bold text-primary'>{product.price}</td>
                  <td className='px-4 py-4 text-center'>
                    <div className='flex flex-col items-center'>
                      <span className={isLowStock ? 'font-bold text-destructive' : 'font-semibold text-foreground'}>
                        {product.stock}
                      </span>
                      {isLowStock && (
                        <span className='text-[10px] font-bold uppercase tracking-wide text-destructive'>
                          {t('productManagement.stock.low')}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className='px-4 py-4'>
                    <span
                      className={
                        product.active
                          ? 'relative block h-6 w-11 rounded-full bg-success after:absolute after:right-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-success-foreground'
                          : 'relative block h-6 w-11 rounded-full bg-muted-foreground after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-card'
                      }
                      aria-label={
                        product.active ? t('productManagement.status.active') : t('productManagement.status.inactive')
                      }
                    />
                  </td>
                  <td className='px-4 py-4 text-sm text-muted-foreground'>{product.updatedAt}</td>
                  <td className='px-4 py-4'>
                    <div className='flex justify-end gap-2'>
                      <button
                        type='button'
                        aria-label={t('productManagement.actions.view')}
                        className='flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-primary'
                      >
                        <MaterialIcon name='visibility' className='text-lg' />
                      </button>
                      <button
                        type='button'
                        aria-label={t('productManagement.actions.edit')}
                        className='flex h-9 w-9 items-center justify-center rounded-lg text-primary transition-colors hover:bg-primary/10'
                      >
                        <MaterialIcon name='edit' className='text-lg' />
                      </button>
                      <button
                        type='button'
                        aria-label={t('productManagement.actions.delete')}
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

      <div className='flex flex-col gap-4 border-t border-border bg-muted px-4 py-3 sm:flex-row sm:items-center sm:justify-between'>
        <p className='text-sm text-muted-foreground'>
          {t('productManagement.pagination.showing', { shown: 3, total: 156 })}
        </p>
        <div className='flex items-center gap-2'>
          <button className='flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground disabled:opacity-50'>
            <MaterialIcon name='chevron_left' className='text-lg' />
          </button>
          {[1, 2, 3].map((page) => (
            <button
              key={page}
              className={
                page === 1
                  ? 'flex h-9 w-9 items-center justify-center rounded-lg bg-primary font-bold text-primary-foreground'
                  : 'flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card font-bold text-muted-foreground hover:text-primary'
              }
            >
              {page}
            </button>
          ))}
          <button className='flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:text-primary'>
            <MaterialIcon name='chevron_right' className='text-lg' />
          </button>
        </div>
      </div>
    </section>
  )
}
