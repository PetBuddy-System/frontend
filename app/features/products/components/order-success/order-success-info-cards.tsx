import { useTranslation } from 'react-i18next'

import { MaterialIcon } from '~/shared/ui'

export function OrderSuccessInfoCards() {
  const { t } = useTranslation('products')

  return (
    <section className='grid grid-cols-1 gap-6 md:grid-cols-2'>
      <article className='rounded-3xl border border-border/60 bg-card p-6 shadow-sm md:p-8'>
        <div className='mb-6 flex items-center gap-3 text-primary'>
          <MaterialIcon name='local_shipping' className='text-[24px]' />
          <h3 className='font-display text-lg font-semibold text-foreground'>{t('orderSuccess.delivery.title')}</h3>
        </div>
        <div className='space-y-3'>
          <p className='font-bold text-foreground'>{t('orderSuccess.delivery.name')}</p>
          <p className='text-muted-foreground'>{t('orderSuccess.delivery.phone')}</p>
          <p className='text-muted-foreground'>{t('orderSuccess.delivery.address')}</p>
        </div>
      </article>

      <article className='rounded-3xl border border-border/60 bg-card p-6 shadow-sm md:p-8'>
        <div className='mb-6 flex items-center gap-3 text-primary'>
          <MaterialIcon name='payments' className='text-[24px]' />
          <h3 className='font-display text-lg font-semibold text-foreground'>{t('orderSuccess.method.title')}</h3>
        </div>
        <div className='space-y-4'>
          <div>
            <p className='mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
              {t('orderSuccess.method.shippingLabel')}
            </p>
            <p className='font-medium text-foreground'>{t('orderSuccess.method.shipping')}</p>
          </div>
          <div>
            <p className='mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
              {t('orderSuccess.method.paymentLabel')}
            </p>
            <p className='font-medium text-foreground'>{t('orderSuccess.method.payment')}</p>
          </div>
        </div>
      </article>
    </section>
  )
}
