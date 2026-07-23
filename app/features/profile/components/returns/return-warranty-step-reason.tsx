// app/features/profile/components/returns/return-warranty-step-reason.tsx
import { useTranslation } from 'react-i18next'
import { MaterialIcon } from '~/shared/ui'
import type { ReturnType, ReturnReason, RefundMethod } from '~/shared/lib/returns'
import { cn } from '~/shared/lib/cn'
import { useEffect } from 'react'

export interface ReturnWarrantyStepReasonProps {
  requestType: ReturnType
  reason: ReturnReason
  description: string
  refundMethod: RefundMethod
  bankName: string
  bankAccountNumber: string
  bankAccountHolder: string
  // ✅ Thêm 2 props mới
  orderPaymentMethod?: string
  isLoadingPayment?: boolean
  onReasonChange: (value: ReturnReason) => void
  onDescriptionChange: (value: string) => void
  onRefundMethodChange: (value: RefundMethod) => void
  onBankNameChange: (value: string) => void
  onBankAccountNumberChange: (value: string) => void
  onBankAccountHolderChange: (value: string) => void
  errors?: Record<string, string>
}

export function ReturnWarrantyStepReason({
  requestType,
  reason,
  description,
  refundMethod,
  bankName,
  bankAccountNumber,
  bankAccountHolder,
  orderPaymentMethod = '',
  isLoadingPayment = false,
  onReasonChange,
  onDescriptionChange,
  onRefundMethodChange,
  onBankNameChange,
  onBankAccountNumberChange,
  onBankAccountHolderChange
}: ReturnWarrantyStepReasonProps) {
  const isReturnType = requestType === 'RETURN'
  const { t } = useTranslation('profile')

  // ✅ Tính toán options cho refund method dựa trên payment method
  const getRefundMethodOptions = () => {
    const options: { value: RefundMethod; label: string; icon: string }[] = []

    // Nếu thanh toán bằng CARD (Stripe) -> cho phép hoàn tài khoản gốc
    if (orderPaymentMethod === 'CARD') {
      options.push({
        value: 'STRIPE_PAYMENT',
        label: 'Tài khoản gốc thanh toán',
        icon: 'payment'
      })
    }

    // Tất cả đều có thể hoàn qua chuyển khoản ngân hàng
    options.push({
      value: 'BANK_TRANSFER',
      label: 'Tài khoản ngân hàng khác',
      icon: 'account_balance'
    })

    return options
  }

  const refundOptions = getRefundMethodOptions()

  // ✅ Nếu refund method hiện tại không có trong options, reset về option đầu tiên
  useEffect(() => {
    if (refundOptions.length > 0 && isReturnType) {
      const isValid = refundOptions.some((opt) => opt.value === refundMethod)
      if (!isValid) {
        onRefundMethodChange(refundOptions[0].value)
      }
    }
  }, [orderPaymentMethod, isReturnType])

  // ✅ Hiển thị thông báo dựa trên payment method
  const getPaymentMethodNote = () => {
    if (!orderPaymentMethod || isLoadingPayment) return null

    if (orderPaymentMethod === 'CARD') {
      return {
        icon: '💳',
        text: 'Đơn hàng được thanh toán qua thẻ. Bạn có thể chọn hoàn tiền về tài khoản gốc hoặc tài khoản ngân hàng khác.',
        className: 'bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300'
      }
    }
    if (orderPaymentMethod === 'CASH') {
      return {
        icon: '💰',
        text: 'Đơn hàng được thanh toán bằng tiền mặt. Vui lòng cung cấp thông tin tài khoản ngân hàng để nhận hoàn tiền.',
        className: 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-300'
      }
    }
    return null
  }

  const paymentNote = getPaymentMethodNote()

  return (
    <div className='space-y-4 rounded-xl border border-border bg-card p-4 shadow-sm'>
      <div className='flex items-center gap-3'>
        <span className='flex h-8 w-8 items-center justify-center rounded-full bg-primary font-display text-sm font-bold text-primary-foreground'>
          3
        </span>
        <h3 className='font-display text-lg font-bold text-foreground'>
          {isReturnType ? 'Lý do & Phương thức hoàn tiền' : t('returnWarranty.step.reason')}
        </h3>
        {isLoadingPayment && (
          <div className='ml-auto h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent' />
        )}
      </div>

      <div className='space-y-4'>
        {/* Lý do chính */}
        <div className='space-y-2'>
          <label className='text-xs font-bold text-muted-foreground'>{t('returnWarranty.reason.label')}</label>
          <div className='relative'>
            <select
              value={reason}
              onChange={(e) => onReasonChange(e.target.value as ReturnReason)}
              className='w-full cursor-pointer appearance-none rounded-xl border border-border bg-muted p-3 pr-12 text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary focus:ring-offset-0 focus:outline-none transition-colors'
            >
              <option value='DAMAGED'>Sản phẩm bị hư hỏng nặng khi nhận hàng</option>
              <option value='WRONG_PRODUCT'>Giao sai sản phẩm</option>
              <option value='MISSING_ITEM'>Thiếu sản phẩm</option>
              <option value='EXPIRED'>Sản phẩm hết hạn sử dụng</option>
              <option value='CUSTOMER_CHANGED_MIND'>Thay đổi ý định mua hàng</option>
              <option value='OTHER'>Lý do khác</option>
            </select>
            <MaterialIcon
              name='expand_more'
              className='pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-2xl text-muted-foreground'
            />
          </div>
        </div>

        {/* Mô tả chi tiết */}
        <div className='space-y-2'>
          <label className='text-xs font-bold text-muted-foreground'>
            {t('returnWarranty.reason.descriptionLabel')}
          </label>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder={t('returnWarranty.reason.placeholder')}
            className='w-full rounded-xl border border-border bg-muted p-4 text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary focus:ring-offset-0 focus:outline-none transition-colors'
          />
        </div>

        {/* Phương thức hoàn tiền — chỉ hiển thị khi Trả hàng hoàn tiền */}
        {isReturnType && (
          <div className='space-y-3 pt-2 border-t border-border'>
            <label className='text-xs font-bold text-muted-foreground'>Phương thức hoàn tiền</label>

            {/* ✅ Hiển thị note về payment method */}
            {paymentNote && (
              <div className={cn('rounded-lg p-3 text-sm', paymentNote.className)}>
                <span className='mr-2'>{paymentNote.icon}</span>
                {paymentNote.text}
              </div>
            )}

            {/* ✅ Hiển thị các options refund method */}
            <div className='flex flex-col gap-3'>
              {refundOptions.map((option) => (
                <label
                  key={option.value}
                  className={cn(
                    'flex cursor-pointer items-center gap-3 rounded-xl border p-3 text-sm transition-all hover:bg-muted',
                    refundMethod === option.value
                      ? 'border-primary bg-primary/5 text-primary font-semibold'
                      : 'border-border bg-card'
                  )}
                >
                  <input
                    type='radio'
                    name='refund_method'
                    value={option.value}
                    checked={refundMethod === option.value}
                    onChange={() => onRefundMethodChange(option.value)}
                    className='h-4 w-4 shrink-0 text-primary'
                  />
                  <MaterialIcon name={option.icon as 'payment' | 'account_balance'} className='text-lg' />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>

            {/* Thông tin ngân hàng nếu chọn BANK_TRANSFER */}
            {refundMethod === 'BANK_TRANSFER' && (
              <div className='space-y-3 rounded-xl border border-border bg-muted/40 p-4 animate-in fade-in slide-in-from-top-1 duration-200'>
                <p className='text-xs font-bold text-primary mb-1 uppercase tracking-wider'>
                  Thông tin tài khoản nhận tiền
                </p>

                <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                  <div className='space-y-1.5'>
                    <label className='text-[10px] font-bold text-muted-foreground uppercase'>Tên ngân hàng</label>
                    <input
                      type='text'
                      value={bankName}
                      onChange={(e) => onBankNameChange(e.target.value)}
                      placeholder='Ví dụ: Vietcombank, Techcombank...'
                      className='w-full rounded-lg border border-border bg-card p-2.5 text-xs text-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none'
                    />
                  </div>

                  <div className='space-y-1.5'>
                    <label className='text-[10px] font-bold text-muted-foreground uppercase'>Số tài khoản</label>
                    <input
                      type='text'
                      value={bankAccountNumber}
                      onChange={(e) => onBankAccountNumberChange(e.target.value)}
                      placeholder='Nhập số tài khoản...'
                      className='w-full rounded-lg border border-border bg-card p-2.5 text-xs text-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none'
                    />
                  </div>
                </div>

                <div className='space-y-1.5'>
                  <label className='text-[10px] font-bold text-muted-foreground uppercase'>Chủ tài khoản</label>
                  <input
                    type='text'
                    value={bankAccountHolder}
                    onChange={(e) => onBankAccountHolderChange(e.target.value)}
                    placeholder='Nhập tên chủ tài khoản (KHÔNG DẤU)...'
                    className='w-full rounded-lg border border-border bg-card p-2.5 text-xs text-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none'
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
