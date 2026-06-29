import { useTranslation } from 'react-i18next'

import { MaterialIcon } from '~/shared/ui'

export interface OrderSuccessSidebarProps {
  subtotal: number
  shippingFee: number
  isFreeShipping: boolean
  discount: number
  finalAmount: number
  formatPrice: (value: number) => string
}

export function OrderSuccessSidebar({
  subtotal,
  shippingFee,
  isFreeShipping,
  discount,
  finalAmount,
  formatPrice
}: OrderSuccessSidebarProps) {
  const { t } = useTranslation('products')

  return (
    <aside className='space-y-6'>
      <section className='rounded-3xl border border-accent bg-card p-6 shadow-sm md:p-8'>
        <h2 className='mb-6 font-display text-lg font-semibold text-foreground'>{t('orderSuccess.payment.title', 'Tổng cộng')}</h2>
        <div className='mb-6 space-y-4'>
          <div className='flex justify-between gap-4 text-muted-foreground'>
            <span>{t('orderSuccess.payment.subtotal', 'Tạm tính')}</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          {discount > 0 && (
            <div className='flex justify-between gap-4 text-muted-foreground'>
              <span>Giảm giá</span>
              <span className='font-bold text-success'>-{formatPrice(discount)}</span>
            </div>
          )}
          <div className='flex justify-between gap-4 text-muted-foreground'>
            <span>{t('orderSuccess.payment.shipping', 'Phí vận chuyển')}</span>
            {isFreeShipping ? (
              <span className='font-bold text-success'>{t('orderSuccess.payment.freeShipping', 'Miễn phí')}</span>
            ) : (
              <span>{formatPrice(shippingFee)}</span>
            )}
          </div>
          <div className='flex items-center justify-between gap-4 border-t border-border pt-4'>
            <span className='font-bold text-foreground'>{t('orderSuccess.payment.total', 'Tổng tiền')}</span>
            <span className='font-display text-3xl font-bold text-primary'>{formatPrice(finalAmount)}</span>
          </div>
        </div>

        <div className='space-y-3'>
          <a
            href='/profile/orders'
            className='flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-4 font-display font-semibold text-primary-foreground transition-transform active:scale-95'
          >
            <MaterialIcon name='track_changes' className='text-[22px]' />
            {t('orderSuccess.payment.trackOrder', 'Theo dõi đơn hàng')}
          </a>
          <a
            href='/products'
            className='flex w-full items-center justify-center rounded-xl border-2 border-primary bg-background px-6 py-4 font-display font-semibold text-primary transition-colors hover:bg-accent'
          >
            {t('orderSuccess.payment.continueShopping', 'Tiếp tục mua sắm')}
          </a>
        </div>
      </section>

      <section className='flex items-start gap-4 rounded-3xl bg-secondary p-6 text-secondary-foreground md:p-8'>
        <div className='rounded-2xl bg-secondary-foreground p-3 text-secondary'>
          <MaterialIcon name='support_agent' className='text-[24px]' />
        </div>
        <div>
          <h3 className='mb-1 font-display text-lg font-semibold'>{t('orderSuccess.support.title')}</h3>
          <p className='mb-3 text-sm text-secondary-foreground/80'>{t('orderSuccess.support.description')}</p>
          <div className='flex flex-col gap-2'>
            <a className='flex items-center gap-2 font-bold' href='tel:19001234'>
              <MaterialIcon name='call' className='text-[18px]' />
              {t('orderSuccess.support.phone')}
            </a>
            <a className='flex items-center gap-2 font-bold' href='#'>
              <MaterialIcon name='chat' className='text-[18px]' />
              {t('orderSuccess.support.chat')}
            </a>
          </div>
        </div>
      </section>

      <section className='flex items-center gap-4 rounded-3xl bg-primary p-6 text-primary-foreground'>
        <MaterialIcon name='pets' className='text-4xl' />
        <p className='font-semibold italic'>{t('orderSuccess.trustQuote')}</p>
      </section>
    </aside>
  )
}
