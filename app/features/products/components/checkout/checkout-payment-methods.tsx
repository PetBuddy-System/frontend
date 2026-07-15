import { useState } from 'react'
import { MaterialIcon } from '~/shared/ui'
import { useAuth } from '~/providers/auth-provider'

export type SelectedPaymentMethod = 'CASH' | 'CARD'

export interface CheckoutPaymentMethodsProps {
  selectedMethod: SelectedPaymentMethod
  onMethodChange: (method: SelectedPaymentMethod) => void
}

const PAYMENT_METHODS = [
  {
    key: 'CASH' as const,
    label: 'Tiền mặt (COD)',
    description: 'Thanh toán khi nhận hàng',
    icon: 'payments',
  },
  {
    key: 'CARD' as const,
    label: 'Thẻ ngân hàng / Tín dụng',
    description: 'Visa, Mastercard, JCB — thanh toán qua Stripe',
    icon: 'credit_card',
  },
] as const

export function CheckoutPaymentMethods({ selectedMethod, onMethodChange }: CheckoutPaymentMethodsProps) {
  const { user } = useAuth()

  return (
    <section className='rounded-xl border border-border/60 bg-card p-6 shadow-sm md:p-8'>
      <div className='mb-6 flex items-center gap-3'>
        <MaterialIcon name='account_balance_wallet' className='text-[24px] text-primary' />
        <h2 className='font-display text-2xl font-semibold text-primary'>Phương thức thanh toán</h2>
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

      {selectedMethod === 'CARD' && user && user.paymentFailStreak !== undefined && user.paymentFailStreak >= 3 && (
        <div className='mt-4 flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive dark:border-destructive/30 dark:bg-destructive/10 animate-fade-in'>
          <MaterialIcon name='warning' className='mt-0.5 shrink-0 text-[20px] text-destructive' />
          <div className='flex flex-col gap-1'>
            <span className='font-semibold'>Cảnh báo thanh toán quá hạn</span>
            <p className='text-muted-foreground text-xs leading-relaxed'>
              Tài khoản của bạn đã có {user.paymentFailStreak} lần thanh toán quá hạn.
              Vui lòng hoàn thành giao dịch trước khi hết thời gian chờ để tránh ảnh hưởng đến tài khoản hoặc bị hủy dịch vụ.
            </p>
          </div>
        </div>
      )}
    </section>
  )
}
