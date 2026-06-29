import { useTranslation } from 'react-i18next'

import { MaterialIcon } from '~/shared/ui'

export interface OrderSuccessInfoCardsProps {
  userName: string
  phoneNumber: string
  address: string
  paymentMethod: string
}

export function OrderSuccessInfoCards({ userName, phoneNumber, address, paymentMethod }: OrderSuccessInfoCardsProps) {
  const { t } = useTranslation('products')

  return (
    <section className='grid grid-cols-1 gap-6 md:grid-cols-2'>
      <article className='rounded-3xl border border-border/60 bg-card p-6 shadow-sm md:p-8'>
        <div className='mb-6 flex items-center gap-3 text-primary'>
          <MaterialIcon name='local_shipping' className='text-[24px]' />
          <h3 className='font-display text-lg font-semibold text-foreground'>{t('orderSuccess.delivery.title', 'Thông tin nhận hàng')}</h3>
        </div>
        <div className='space-y-3'>
          <p className='font-bold text-foreground'>{userName}</p>
          <p className='text-muted-foreground'>{phoneNumber}</p>
          <p className='text-muted-foreground'>{address}</p>
        </div>
      </article>

      <article className='rounded-3xl border border-border/60 bg-card p-6 shadow-sm md:p-8'>
        <div className='mb-6 flex items-center gap-3 text-primary'>
          <MaterialIcon name='payments' className='text-[24px]' />
          <h3 className='font-display text-lg font-semibold text-foreground'>{t('orderSuccess.method.title', 'Phương thức vận chuyển & Thanh toán')}</h3>
        </div>
        <div className='space-y-4'>
          <div>
            <p className='mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
              {t('orderSuccess.method.shippingLabel', 'Vận chuyển')}
            </p>
            <p className='font-medium text-foreground'>{t('orderSuccess.method.shipping', 'Giao hàng nhanh (2-3 ngày)')}</p>
          </div>
          <div>
            <p className='mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
              {t('orderSuccess.method.paymentLabel', 'Thanh toán')}
            </p>
            <p className='font-medium text-foreground'>{paymentMethod}</p>
          </div>
        </div>
      </article>
    </section>
  )
}
