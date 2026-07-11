import { useTranslation } from 'react-i18next'
import { MaterialIcon } from '~/shared/ui'
import type { ReturnType, ReturnReason, RefundMethod } from '~/shared/lib/returns'
import { cn } from '~/shared/lib/cn'

export interface ReturnWarrantyStepReasonProps {
  requestType: ReturnType
  reason: ReturnReason
  description: string
  refundMethod: RefundMethod
  bankName: string
  bankAccountNumber: string
  bankAccountHolder: string
  onReasonChange: (value: ReturnReason) => void
  onDescriptionChange: (value: string) => void
  onRefundMethodChange: (value: RefundMethod) => void
  onBankNameChange: (value: string) => void
  onBankAccountNumberChange: (value: string) => void
  onBankAccountHolderChange: (value: string) => void
}

export function ReturnWarrantyStepReason({
  requestType,
  reason,
  description,
  refundMethod,
  bankName,
  bankAccountNumber,
  bankAccountHolder,
  onReasonChange,
  onDescriptionChange,
  onRefundMethodChange,
  onBankNameChange,
  onBankAccountNumberChange,
  onBankAccountHolderChange
}: ReturnWarrantyStepReasonProps) {
  const isReturnType = requestType === 'RETURN'
  const { t } = useTranslation('profile')

  return (
    <div className='space-y-4 rounded-xl border border-border bg-card p-4 shadow-sm'>
      <div className='flex items-center gap-3'>
        <span className='flex h-8 w-8 items-center justify-center rounded-full bg-primary font-display text-sm font-bold text-primary-foreground'>
          3
        </span>
        <h3 className='font-display text-lg font-bold text-foreground'>{t('returnWarranty.step.reason')}</h3>
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
            <div className='flex gap-4'>
              <label
                className={cn(
                  'flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border border-border bg-card p-3 text-sm transition-all hover:bg-muted',
                  refundMethod === 'STRIPE_PAYMENT' && 'border-primary bg-primary/5 text-primary font-semibold'
                )}
              >
                <input
                  type='radio'
                  name='refund_method'
                  checked={refundMethod === 'STRIPE_PAYMENT'}
                  onChange={() => onRefundMethodChange('STRIPE_PAYMENT')}
                  className='sr-only'
                />
                <MaterialIcon name='payment' className='text-lg' />
                <span>Tài khoản gốc thanh toán</span>
              </label>

              <label
                className={cn(
                  'flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border border-border bg-card p-3 text-sm transition-all hover:bg-muted',
                  refundMethod === 'BANK_TRANSFER' && 'border-primary bg-primary/5 text-primary font-semibold'
                )}
              >
                <input
                  type='radio'
                  name='refund_method'
                  checked={refundMethod === 'BANK_TRANSFER'}
                  onChange={() => onRefundMethodChange('BANK_TRANSFER')}
                  className='sr-only'
                />
                <MaterialIcon name='account_balance' className='text-lg' />
                <span>Tài khoản khác</span>
              </label>
            </div>

            {/* Thông tin ngân hàng nếu chọn BANK_TRANSFER */}
            {refundMethod === 'BANK_TRANSFER' && (
              <div className='space-y-3 rounded-xl border border-border bg-muted/40 p-4 animate-in fade-in slide-in-from-top-1 duration-200'>
                <p className='text-xs font-bold text-primary mb-1 uppercase tracking-wider'>Thông tin tài khoản nhận tiền</p>

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
