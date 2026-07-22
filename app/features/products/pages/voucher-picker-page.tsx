import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'

import { MaterialIcon } from '~/shared/ui'
import { SiteBottomNav, SiteFooter, SiteHeader } from '~/shared/components'
import { fetchActiveVouchersApi } from '../services'
import {
  isVoucherEligible,
  getIneligibleReason,
  calculateVoucherDiscount,
  type VoucherResponse
} from '~/shared/lib/voucher'
import {
  SESSION_KEY_VOUCHER_CODE,
  SESSION_KEY_VOUCHER_NAME,
  SESSION_KEY_VOUCHER_DISCOUNT,
  SESSION_KEY_SUBTOTAL
} from '../lib/checkout-storage-keys'

function formatPrice(value: number) {
  return `${new Intl.NumberFormat('vi-VN').format(value)}đ`
}

function formatDate(dateString: string) {
  try {
    return new Date(dateString).toLocaleDateString('vi-VN')
  } catch {
    return dateString
  }
}

function getDiscountIcon(discountType: string) {
  if (discountType === 'PERCENTAGE') return 'percent'
  return 'confirmation_number'
}

export function VoucherPickerPage() {
  const navigate = useNavigate()
  const { t } = useTranslation('products')

  const [vouchers, setVouchers] = useState<VoucherResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedCode, setSelectedCode] = useState<string>('')

  const orderSubtotal = parseInt(sessionStorage.getItem(SESSION_KEY_SUBTOTAL) ?? '0', 10)
  const hasPromotionProduct =
    typeof window !== 'undefined' && sessionStorage.getItem('petbuddy_checkout_has_promotion_product') === 'true'

  useEffect(() => {
    const savedCode = sessionStorage.getItem(SESSION_KEY_VOUCHER_CODE) ?? ''
    setSelectedCode(savedCode)
  }, [])

  useEffect(() => {
    async function loadVouchers() {
      try {
        const res = await fetchActiveVouchersApi({ size: 100 })
        if (res?.data?.content) {
          setVouchers(res.data.content)
        }
      } catch {
        setError(t('voucherPicker.loadError', 'Không thể tải danh sách mã giảm giá. Vui lòng thử lại.'))
      } finally {
        setIsLoading(false)
      }
    }
    void loadVouchers()
  }, [t])

  const selectedVoucher = vouchers.find((v) => v.voucherCode === selectedCode)

  function handleConfirm() {
    if (selectedVoucher) {
      const discount = calculateVoucherDiscount(selectedVoucher, orderSubtotal)
      sessionStorage.setItem(SESSION_KEY_VOUCHER_CODE, selectedVoucher.voucherCode)
      sessionStorage.setItem(SESSION_KEY_VOUCHER_NAME, selectedVoucher.voucherName)
      sessionStorage.setItem(SESSION_KEY_VOUCHER_DISCOUNT, String(Math.round(discount)))
    } else {
      sessionStorage.removeItem(SESSION_KEY_VOUCHER_CODE)
      sessionStorage.removeItem(SESSION_KEY_VOUCHER_NAME)
      sessionStorage.removeItem(SESSION_KEY_VOUCHER_DISCOUNT)
    }
    navigate('/order')
  }

  function handleRemoveVoucher() {
    setSelectedCode('')
  }

  function getDiscountBadgeText(voucher: VoucherResponse) {
    if (voucher.discountType === 'PERCENTAGE') {
      return t('voucherPicker.discountBadgePercent', 'Giảm {{percent}}%', { percent: voucher.discountValue })
    }
    return t('voucherPicker.discountBadgeFixed', 'Giảm {{value}}', { value: formatPrice(voucher.discountValue) })
  }

  const visibleVouchers = vouchers.filter((v) => !(v.perUserLimit && (v.usedByCurrentUser ?? 0) >= v.perUserLimit))

  const eligibleVouchers = visibleVouchers.filter((v) => isVoucherEligible(v, orderSubtotal, hasPromotionProduct))
  const ineligibleVouchers = visibleVouchers.filter((v) => !isVoucherEligible(v, orderSubtotal, hasPromotionProduct))

  return (
    <div className='flex min-h-screen flex-col bg-background text-foreground'>
      <SiteHeader />

      <main className='mx-auto w-full max-w-2xl flex-1 px-4 py-8 md:px-6'>
        <button
          type='button'
          onClick={() => navigate('/order')}
          className='mb-6 flex items-center gap-2 text-sm font-medium text-primary hover:opacity-80 transition-opacity'
        >
          <MaterialIcon name='arrow_back' className='text-[20px]' />
          {t('voucherPicker.back', 'Quay lại')}
        </button>

        <div className='mb-6 flex items-center justify-between'>
          <h1 className='font-display text-2xl font-bold text-primary md:text-3xl'>
            {t('voucherPicker.title', 'Chọn mã giảm giá')}
          </h1>
          {!isLoading && (
            <span className='text-sm text-muted-foreground'>
              {t('voucherPicker.eligibleCount', '{{count}} mã có thể dùng', { count: eligibleVouchers.length })}
            </span>
          )}
        </div>

        {error && (
          <div className='mb-4 flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive'>
            <MaterialIcon name='error' className='text-[18px]' />
            {error}
          </div>
        )}

        {isLoading ? (
          <div className='flex flex-col gap-4'>
            {[1, 2, 3].map((i) => (
              <div key={i} className='h-28 animate-pulse rounded-xl border border-border bg-muted' />
            ))}
          </div>
        ) : (
          <div className='flex flex-col gap-3'>
            {eligibleVouchers.map((voucher) => {
              const isSelected = selectedCode === voucher.voucherCode
              const discount = calculateVoucherDiscount(voucher, orderSubtotal)

              return (
                <label key={voucher.voucherId} className='block cursor-pointer'>
                  <input
                    type='radio'
                    name='voucher'
                    className='peer hidden'
                    checked={isSelected}
                    onChange={() => setSelectedCode(voucher.voucherCode)}
                    onClick={() => {
                      if (isSelected) setSelectedCode('')
                    }}
                  />
                  <div
                    className={`flex items-center gap-4 rounded-xl border p-4 transition-all hover:shadow-md md:p-5 ${
                      isSelected ? 'border-primary bg-primary/5 ring-2 ring-primary/10' : 'border-border bg-card'
                    }`}
                  >
                    {/* Radio indicator */}
                    <div
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                        isSelected ? 'border-primary' : 'border-muted-foreground'
                      }`}
                    >
                      {isSelected && <div className='h-2.5 w-2.5 rounded-full bg-primary' />}
                    </div>

                    {/* Icon */}
                    <div
                      className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-xl ${
                        isSelected ? 'bg-primary/10' : 'bg-accent'
                      }`}
                    >
                      <MaterialIcon
                        name={getDiscountIcon(voucher.discountType)}
                        className={`text-[32px] ${isSelected ? 'text-primary' : 'text-accent-foreground'}`}
                      />
                    </div>

                    {/* Info */}
                    <div className='min-w-0 flex-1'>
                      <div className='flex items-start justify-between gap-2'>
                        <h3 className='font-semibold text-foreground leading-snug'>{voucher.voucherName}</h3>
                        <span className='shrink-0 rounded-md bg-secondary/20 px-2 py-0.5 text-xs font-bold text-primary'>
                          {getDiscountBadgeText(voucher)}
                        </span>
                      </div>
                      {voucher.minOrderValue && (
                        <p className='mt-0.5 text-xs text-muted-foreground'>
                          {t('voucherPicker.minOrder', 'Đơn tối thiểu {{min}}', {
                            min: formatPrice(voucher.minOrderValue)
                          })}
                          {voucher.maxDiscount
                            ? ` · ${t('voucherPicker.maxDiscount', 'Giảm tối đa {{max}}', { max: formatPrice(voucher.maxDiscount) })}`
                            : ''}
                        </p>
                      )}
                      <div className='mt-1.5 flex items-center gap-1 text-xs text-muted-foreground'>
                        <MaterialIcon name='schedule' className='text-[14px]' />
                        {t('voucherPicker.expiredAt', 'Hết hạn: {{date}}', { date: formatDate(voucher.expiredAt) })}
                      </div>
                      {orderSubtotal > 0 && discount > 0 && (
                        <p className='mt-1 text-xs font-semibold text-success'>
                          {t('voucherPicker.savings', 'Tiết kiệm: {{savings}}', {
                            savings: formatPrice(Math.round(discount))
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                </label>
              )
            })}

            {ineligibleVouchers.length > 0 && (
              <>
                <p className='mt-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide'>
                  {t('voucherPicker.ineligibleSection', 'Chưa đủ điều kiện')}
                </p>
                {ineligibleVouchers.map((voucher) => (
                  <div
                    key={voucher.voucherId}
                    className='flex cursor-not-allowed items-center gap-4 rounded-xl border border-border bg-muted/40 p-4 opacity-60 md:p-5'
                  >
                    <div className='flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-muted-foreground' />
                    <div className='flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-muted'>
                      <MaterialIcon
                        name={getDiscountIcon(voucher.discountType)}
                        className='text-[32px] text-muted-foreground'
                      />
                    </div>
                    <div className='min-w-0 flex-1'>
                      <h3 className='font-semibold text-foreground leading-snug'>{voucher.voucherName}</h3>
                      {voucher.minOrderValue && (
                        <p className='mt-0.5 text-xs text-muted-foreground'>
                          {t('voucherPicker.minOrder', 'Đơn tối thiểu {{min}}', {
                            min: formatPrice(voucher.minOrderValue)
                          })}
                        </p>
                      )}
                      <div className='mt-1.5 flex items-center gap-1 text-xs text-destructive'>
                        <MaterialIcon name='error' className='text-[14px]' />
                        {getIneligibleReason(voucher, orderSubtotal, hasPromotionProduct, t)}
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}

            {vouchers.length === 0 && (
              <div className='py-16 text-center'>
                <MaterialIcon name='local_offer' className='mx-auto mb-3 text-[48px] text-muted-foreground' />
                <p className='text-sm text-muted-foreground'>
                  {t('voucherPicker.hasNoVouchers', 'Hiện không có mã giảm giá nào')}
                </p>
              </div>
            )}

            <div className='mt-4 flex items-center justify-between gap-4 rounded-xl border border-border bg-card p-4'>
              <div className='min-w-0 flex-1'>
                {selectedVoucher ? (
                  <>
                    <p className='text-xs text-muted-foreground'>{t('voucherPicker.selectedLabel', 'Đang chọn:')}</p>
                    <p className='truncate text-sm font-bold text-primary'>{selectedVoucher.voucherName}</p>
                  </>
                ) : (
                  <p className='text-sm text-muted-foreground'>
                    {t('voucherPicker.noSelectedLabel', 'Chưa chọn mã giảm giá')}
                  </p>
                )}
              </div>
              <div className='flex shrink-0 items-center gap-2'>
                {selectedVoucher && (
                  <button
                    type='button'
                    onClick={handleRemoveVoucher}
                    className='rounded-full border border-border px-4 py-2.5 text-sm font-semibold text-muted-foreground transition hover:bg-muted'
                  >
                    {t('voucherPicker.unselect', 'Bỏ chọn')}
                  </button>
                )}
                <button
                  type='button'
                  onClick={handleConfirm}
                  className='flex items-center gap-2 rounded-full bg-secondary px-8 py-2.5 text-sm font-bold text-secondary-foreground shadow-md transition hover:opacity-90 active:scale-95'
                >
                  {t('voucherPicker.confirm', 'Xác nhận')}
                  <MaterialIcon name='arrow_forward' className='text-[18px]' />
                </button>
              </div>
            </div>

            {/* Divider */}
            <div className='mt-6 border-t border-dashed border-border py-4 text-center'>
              <p className='text-sm italic text-muted-foreground'>
                {t('voucherPicker.noMoreVouchers', 'Không còn mã giảm giá nào khác')}
              </p>
            </div>
          </div>
        )}
      </main>

      <SiteFooter />
      <SiteBottomNav />
    </div>
  )
}
