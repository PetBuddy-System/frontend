import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'

import { MaterialIcon } from '~/shared/ui'

const TRUST_BADGES = [
  { key: 'secure', icon: 'verified_user' },
  { key: 'returns', icon: 'replay' },
  { key: 'authentic', icon: 'verified' },
] as const

export interface CheckoutOrderItem {
  key: string
  image: string
  salePrice: number
  price?: number
  quantity: number
  title?: string
  productId?: string
}

export interface CheckoutOrderSummaryProps {
  items: CheckoutOrderItem[]
  subtotal: number
  shippingFee: number
  isFreeShipping: boolean
  discount: number
  voucherName: string
  formatPrice: (value: number) => string
  isSubmitting?: boolean
  mode?: 'checkout' | 'retry-payment'
  onRetryPayment?: () => void
  paymentMethod?: 'CASH' | 'CARD'
}

export function CheckoutOrderSummary({
  items,
  subtotal,
  shippingFee,
  isFreeShipping,
  discount,
  voucherName,
  formatPrice,
  isSubmitting = false,
  mode = 'checkout',
  onRetryPayment,
  paymentMethod = 'CASH',
}: CheckoutOrderSummaryProps) {
  const { t } = useTranslation('products')
  const navigate = useNavigate()

  const total = subtotal + (isFreeShipping ? 0 : shippingFee) - discount
  const isRetryMode = mode === 'retry-payment'

  return (
    <aside className='flex flex-col gap-6 lg:sticky lg:top-24'>
      <section className='overflow-hidden rounded-xl border border-border/60 bg-card p-6 shadow-sm'>
        <h2 className='mb-4 border-b border-border pb-4 font-display text-2xl font-semibold text-primary'>
          {t('checkout.summary.title')}
        </h2>

        <div className='mb-6 flex max-h-[300px] flex-col gap-4 overflow-y-auto pr-2'>
          {items.map((item) => {
            const hasPromotion =
              item.price != null && item.price > item.salePrice

            return (
              <article key={item.key} className='flex gap-4'>
                <div className='h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-muted'>
                  <img
                    src={item.image}
                    alt={item.title || t(`checkout.summary.items.${item.key}.imageAlt`)}
                    className='h-full w-full object-cover'
                  />
                </div>
                <div className='flex flex-1 flex-col'>
                  <h3 className='line-clamp-1 text-sm font-semibold text-foreground'>
                    {item.title || t(`checkout.summary.items.${item.key}.title`)}
                  </h3>
                  <span className='text-sm text-muted-foreground'>
                    {t('checkout.summary.quantity', { count: item.quantity })}
                  </span>

                  <div className='mt-auto flex flex-col'>
                    {hasPromotion && (
                      <span className='text-xs text-muted-foreground line-through'>
                        {formatPrice(item.price! * item.quantity)}
                      </span>
                    )}
                    <span className='font-display text-sm font-bold text-primary'>
                      {formatPrice(item.salePrice * item.quantity)}
                    </span>
                  </div>
                </div>
              </article>
            )
          })}
        </div>

        <div className='mb-6 flex flex-col gap-3 border-t border-border pt-4'>
          <div className='flex items-center justify-between text-muted-foreground'>
            <span>{t('checkout.summary.subtotal')}</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className='flex items-center justify-between text-muted-foreground'>
            <span>{t('checkout.summary.shipping')}</span>
            <span className={`font-bold ${isFreeShipping ? 'text-success' : 'text-primary'}`}>
              {isFreeShipping ? t('checkout.summary.freeShipping') : formatPrice(shippingFee)}
            </span>
          </div>
          {discount > 0 && (
            <div className='flex items-center justify-between text-muted-foreground'>
              <span>{t('checkout.summary.discount')}</span>
              <span className='font-bold text-success'>-{formatPrice(discount)}</span>
            </div>
          )}
          <div className='mt-2 flex items-center justify-between pt-2'>
            <span className='font-display text-2xl font-semibold text-foreground'>
              {t('checkout.summary.total')}
            </span>
            <span className='font-display text-3xl font-bold text-primary'>
              {formatPrice(Math.max(0, total))}
            </span>
          </div>
        </div>

       <button
        type={isRetryMode ? 'button' : 'submit'}
          onClick={isRetryMode ? onRetryPayment : undefined}
          disabled={isSubmitting || items.length === 0}
          className='flex w-full items-center justify-center gap-3 rounded-full bg-secondary px-6 py-4 font-display font-semibold text-secondary-foreground shadow-md transition-transform active:scale-95 disabled:cursor-not-allowed disabled:opacity-60'
        >
         <MaterialIcon
            name={isSubmitting ? 'progress_activity' : (paymentMethod === 'CARD' ? 'credit_card' : 'lock')}
            filled={!isSubmitting}
            className={isSubmitting ? 'animate-spin text-[20px]' : 'text-[20px]'}
          />
          {!isSubmitting && (paymentMethod === 'CARD' ? 'Thanh toán ngay' : t('checkout.summary.placeOrder', 'Đặt hàng ngay'))}
        </button>
      </section>

      {/* Voucher section */}
      <section className='rounded-xl border border-border/60 bg-card p-6 shadow-sm'>
        <p className='mb-3 text-sm font-semibold text-foreground'>
          {t('checkout.coupon.title')}
        </p>

        {voucherName ? (
          /* Applied voucher display */
          <div className='flex items-center gap-3 rounded-xl border border-success/30 bg-success/5 px-4 py-3'>
            <MaterialIcon name='local_offer' className='shrink-0 text-success text-[20px]' />
            <div className='flex-1 min-w-0'>
              <p className='truncate text-sm font-semibold text-foreground'>{voucherName}</p>
              {discount > 0 && (
                <p className='text-xs text-success'>Giảm {formatPrice(discount)}</p>
              )}
            </div>
            <button
              type='button'
              onClick={() => navigate('/order/voucher')}
              className='shrink-0 text-xs font-semibold text-primary hover:underline'
            >
              Đổi
            </button>
          </div>
        ) : (
          <button
            type='button'
            onClick={() => navigate('/order/voucher')}
            className='flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-muted/30 py-3.5 text-sm font-semibold text-foreground transition hover:border-primary hover:bg-primary/5 hover:text-primary'
          >
            <MaterialIcon name='local_offer' className='text-[20px]' />
            Áp dụng mã giảm giá
          </button>
        )}
      </section>
    </aside>
  )
}