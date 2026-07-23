import { useTranslation } from 'react-i18next'
import { MaterialIcon } from '~/shared/ui'
import { useAuth } from '~/providers/auth-provider'

export type SelectedPaymentMethod = 'CASH' | 'CARD' | 'MOMO' | 'VNPAY'

export interface CheckoutPaymentMethodsProps {
  selectedMethod: SelectedPaymentMethod
  onMethodChange: (method: SelectedPaymentMethod) => void
}

export function CheckoutPaymentMethods({ selectedMethod, onMethodChange }: CheckoutPaymentMethodsProps) {
  const { user } = useAuth()
  const { t } = useTranslation('products')

  const PAYMENT_METHODS = [
    {
      key: 'CASH' as const,
      label: t('checkout.payment.methods.cod'),
      description: t('checkout.payment.methods.codDesc'),
      icon: 'payments',
    },
    {
      key: 'CARD' as const,
      label: t('checkout.payment.methods.card'),
      description: t('checkout.payment.methods.cardDesc'),
      icon: 'credit_card',
    },
    {
      key: 'MOMO' as const,
      label: t('checkout.payment.methods.momo'),
      description: t('checkout.payment.methods.momoDesc'),
      icon: 'qr_code_2',
    },
    {
      key: 'VNPAY' as const,
      label: t('checkout.payment.methods.vnpay'),
      description: t('checkout.payment.methods.vnpayDesc'),
      icon: 'account_balance',
    },
  ] as const

  return (
    <section className='rounded-xl border border-border/60 bg-card p-6 shadow-sm md:p-8'>
      <div className='mb-6 flex items-center gap-3'>
        <MaterialIcon name='account_balance_wallet' className='text-[24px] text-primary' />
        <h2 className='font-display text-2xl font-semibold text-primary'>
          {t('checkout.payment.title')}
        </h2>
      </div>

      <div className='grid grid-cols-1 gap-3'>
        {PAYMENT_METHODS.map((method) => {
          const isSelected = selectedMethod === method.key
          return (
            <label
              key={method.key}
              htmlFor={`payment-${method.key}`}
              className={`flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition-all ${
                isSelected
                  ? 'border-primary bg-primary/5 ring-2 ring-primary/30'
                  : 'border-border hover:bg-muted'
              }`}
            >
              <input
                id={`payment-${method.key}`}
                className='h-5 w-5 accent-primary'
                name='payment'
                type='radio'
                value={method.key}
                checked={isSelected}
                onChange={() => onMethodChange(method.key)}
              />
              <div className='flex flex-1 flex-col'>
                <span className={`font-semibold ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                  {method.label}
                </span>
                <span className='text-xs text-muted-foreground'>{method.description}</span>
              </div>
              <MaterialIcon
                name={method.icon}
                className={`text-[28px] transition-colors ${isSelected ? 'text-primary' : 'text-muted-foreground'}`}
              />
            </label>
          )
        })}
      </div>

      {(selectedMethod === 'CARD' || selectedMethod === 'MOMO' || selectedMethod === 'VNPAY') && user && user.paymentFailStreak !== undefined && user.paymentFailStreak >= 3 && (
        <div className='mt-4 flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive dark:border-destructive/30 dark:bg-destructive/10 animate-fade-in'>
          <MaterialIcon name='warning' className='mt-0.5 shrink-0 text-[20px] text-destructive' />
          <div className='flex flex-col gap-1'>
            <span className='font-semibold'>
              {t('checkout.payment.warning.title')}
            </span>
            <p className='text-muted-foreground text-xs leading-relaxed'>
              {t('checkout.payment.warning.description', {
                streak: user.paymentFailStreak
              })}
            </p>
          </div>
        </div>
      )}
    </section>
  )
}