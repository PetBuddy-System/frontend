import { useTranslation } from 'react-i18next'

import { MaterialIcon } from '~/shared/ui'

export interface CartOrderSummaryProps {
  itemCount: number
  subtotal: number
  formatPrice: (value: number) => string
  onClearCart?: () => void | Promise<void>
  isMutating?: boolean
}

export function CartOrderSummary({
  itemCount,
  subtotal,
  formatPrice,
  onClearCart,
  isMutating = false,
}: CartOrderSummaryProps) {
  const { t } = useTranslation('products')
  const isEmpty = itemCount === 0

  return (
    <aside className='space-y-6 lg:col-span-4 lg:sticky lg:top-28'>
      <section className='rounded-xl border border-border/60 bg-card p-6 shadow-sm md:p-8'>
        <div className='mb-6 flex items-start justify-between gap-4'>
          <h2 className='font-display text-2xl font-semibold text-foreground'>
            {t('cart.summary.title')}
          </h2>
        </div>

        <div className='mb-6 space-y-4'>
          <div className='flex justify-between gap-4 text-muted-foreground'>
            <span>{t('cart.summary.products', { count: itemCount })}</span>
            <span className='font-bold'>{formatPrice(subtotal)}</span>
          </div>
        </div>

        <div className='mb-6 border-t border-border pt-6'>
          <div className='flex items-end justify-between gap-4'>
            <span className='text-lg text-foreground'>{t('cart.summary.total')}</span>
            <span className='font-display text-3xl font-bold text-primary'>
              {formatPrice(subtotal)}
            </span>
          </div>
        </div>

        <a
          href={isEmpty ? undefined : '/order'}
          aria-disabled={isEmpty || isMutating}
          className={`flex w-full items-center justify-center gap-3 rounded-xl px-6 py-4 font-display text-xl font-semibold shadow-lg transition-transform ${
            isEmpty || isMutating
              ? 'pointer-events-none bg-muted text-muted-foreground opacity-70'
              : 'bg-secondary text-secondary-foreground hover:scale-[1.02] active:scale-95'
          }`}
        >
          {t('cart.summary.checkout')}
          <MaterialIcon name='arrow_forward' className='text-[22px]' />
        </a>

        <div className='mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground'>
          <MaterialIcon name='verified_user' className='text-[20px] text-success' />
          {t('cart.summary.securePayment')}
        </div>
      </section>

      <section className='relative overflow-hidden rounded-xl bg-primary p-6 text-primary-foreground shadow-lg'>
        <div className='absolute -bottom-4 -right-4 opacity-10 transition-transform group-hover:scale-110'>
          <MaterialIcon name='support_agent' className='text-[120px]' />
        </div>

        <h3 className='mb-2 font-display text-2xl font-semibold'>
          {t('cart.support.title')}
        </h3>

        <p className='mb-4 max-w-xs text-sm text-primary-foreground/80'>
          {t('cart.support.description')}
        </p>

        <a
          className='inline-flex items-center gap-2 rounded-full bg-card px-4 py-2 font-bold text-primary transition-colors hover:bg-secondary hover:text-secondary-foreground'
          href='tel:19001234'
        >
          <MaterialIcon name='phone_in_talk' className='text-[20px]' />
          {t('cart.support.phone')}
        </a>
      </section>
    </aside>
  )
}