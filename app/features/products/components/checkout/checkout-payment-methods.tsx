import { useState } from 'react'
import { MaterialIcon } from '~/shared/ui'

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

      {selectedMethod === 'CARD' && (
        <div className='mt-4 flex items-start gap-3 rounded-xl border border-info/30 bg-info/5 px-4 py-3 text-sm text-info'>
          <MaterialIcon name='info' className='mt-0.5 shrink-0 text-[18px]' />
          <p>
            Bạn sẽ được chuyển đến trang thanh toán Stripe an toàn sau khi xác nhận đơn hàng.
            Vui lòng hoàn tất thanh toán trong <strong>5 phút</strong>.
          </p>
        </div>
      )}
    </section>
  )
}
