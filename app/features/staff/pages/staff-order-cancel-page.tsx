import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { MaterialIcon } from '~/shared/ui'
import { fetchOrderDetailApi, updateOrderStatusApi } from '~/features/profile/services/order/order-api'
import type { OrderDetailFull } from '~/shared/lib/order'
import { StaffSidebar } from '../components/layout/staff-sidebar'
import { StaffTopNav } from '../components/layout/staff-top-nav'

interface StaffOrderCancelPageProps {
  orderId: number
}

function formatPrice(value: number) {
  return `${new Intl.NumberFormat('vi-VN').format(value)}đ`
}

const CANCEL_REASONS = [
  'Khách hàng yêu cầu hủy',
  'Địa chỉ giao hàng không hợp lệ',
  'Không liên lạc được với khách hàng',
  'Sản phẩm hết hàng / lỗi',
  'Đơn hàng trùng lặp',
  'Vi phạm chính sách cửa hàng',
  'Khác',
]

const CANCEL_REASON_MAP: Record<string, string> = {
  'Khách hàng yêu cầu hủy': 'orderCancel.reasons.customerRequest',
  'Địa chỉ giao hàng không hợp lệ': 'orderCancel.reasons.invalidAddress',
  'Không liên lạc được với khách hàng': 'orderCancel.reasons.noContact',
  'Sản phẩm hết hàng / lỗi': 'orderCancel.reasons.outOfStock',
  'Đơn hàng trùng lặp': 'orderCancel.reasons.duplicateOrder',
  'Vi phạm chính sách cửa hàng': 'orderCancel.reasons.policyViolation',
  'Khác': 'orderCancel.reasons.other',
}

export function StaffOrderCancelPage({ orderId }: StaffOrderCancelPageProps) {
  const navigate = useNavigate()
  const { t } = useTranslation('staff')
  const [order, setOrder] = useState<OrderDetailFull | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [customReason, setCustomReason] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadOrder() {
      setIsLoading(true)
      try {
        const res = await fetchOrderDetailApi(orderId)
        if (res.success && res.data) {
          setOrder(res.data)
        } else {
          setError(res.message || t('orderCancel.loadError', 'Không thể tải chi tiết đơn hàng.'))
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : t('orderCancel.unexpectedError', 'Có lỗi xảy ra khi hủy đơn.'))
      } finally {
        setIsLoading(false)
      }
    }
    void loadOrder()
  }, [orderId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!order) return

    const finalReason = cancelReason === 'Khác' ? customReason.trim() : cancelReason
    if (!finalReason) {
      alert(t('orderCancel.validationError', 'Vui lòng chọn hoặc nhập lý do hủy đơn hàng'))
      return
    }

    setIsSubmitting(true)
    try {
      const res = await updateOrderStatusApi(orderId, 'CANCELLED')
      if (res.success) {
      alert(
        t(
          'orderCancel.successMessage',
          {
            code: order.orderCode,
            reason: finalReason,
            defaultValue: `Đơn hàng #${order.orderCode} đã được hủy thành công.\nLý do: ${finalReason}`,
          }
        )
      )
      navigate('/staff/orders')
      } else {
        alert(res.message || t('orderCancel.submitError', 'Không thể hủy đơn hàng.'))
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : t('orderCancel.unexpectedError', 'Có lỗi xảy ra khi hủy đơn.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className='flex h-screen overflow-hidden bg-background text-foreground'>
        <StaffSidebar activeItem='orders' />
        <div className='flex min-w-0 flex-1 flex-col overflow-hidden'>
          <StaffTopNav titleKey='orderCancel.title' subtitleKey='orderCancel.subtitle' />
          <main className='flex-1 flex items-center justify-center'>
            <div className='h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent' />
          </main>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className='flex h-screen overflow-hidden bg-background text-foreground'>
        <StaffSidebar activeItem='orders' />
        <div className='flex min-w-0 flex-1 flex-col overflow-hidden'>
          <StaffTopNav titleKey='orderCancel.title' subtitleKey='orderCancel.subtitle' />
          <main className='flex-1 flex items-center justify-center p-6 text-center'>
            <div>
              <MaterialIcon name='error' className='text-[48px] text-destructive mb-3' />
              <p className='text-muted-foreground text-sm'>{error || t('orderCancel.notFound', 'Không tìm thấy đơn hàng.')}</p>
              <button
                onClick={() => navigate('/staff/orders')}
                className='mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-bold text-sm'
              >
                {t('orderCancel.backToOrders', 'Quay lại danh sách đơn hàng')}
              </button>
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className='flex h-screen overflow-hidden bg-background text-foreground'>
      <StaffSidebar activeItem='orders' />
      <div className='flex min-w-0 flex-1 flex-col overflow-hidden'>
        <StaffTopNav titleKey='orderCancel.title' subtitleKey='orderCancel.subtitle' />
        <main className='flex-1 overflow-y-auto'>
          <div className='min-h-full bg-muted/30 flex flex-col items-center p-4 md:p-8'>
            <div className='w-full max-w-4xl flex flex-col gap-6'>

              {/* Header */}
              <div className='flex items-center justify-between'>
                <h1 className='font-display text-2xl font-bold text-foreground flex items-center gap-2'>
                  <MaterialIcon name='cancel' className='text-destructive text-[28px]' />
                  {t('orderCancel.title', 'Hủy đơn hàng')}
                </h1>
                <div className='bg-card px-4 py-1.5 rounded-full text-muted-foreground font-semibold text-xs border border-border'>
                  #{order.orderCode}
                </div>
              </div>

              {/* Warning */}
              <div className='flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-5 py-4 text-destructive'>
                <MaterialIcon name='warning' className='text-[22px] shrink-0 mt-0.5' />
                <div>
                  <p className='font-bold text-sm'>{t('orderCancel.warningTitle', 'Hành động không thể hoàn tác')}</p>
                  <p className='text-sm mt-1 opacity-80'>
                    {t('orderCancel.warningDesc', 'Đơn hàng sẽ được hủy ngay lập tức (không cần chờ xác nhận). Vui lòng chọn đúng lý do.')}
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className='grid grid-cols-1 lg:grid-cols-12 gap-6 items-start'>
                {/* Left: Order info + Reason */}
                <div className='lg:col-span-7 flex flex-col gap-5'>
                  {/* Order items */}
                  <section className='bg-card border border-border/60 rounded-xl p-5 shadow-sm'>
                    <h2 className='text-foreground font-semibold text-base mb-4 flex items-center gap-2'>
                      <MaterialIcon name='inventory_2' className='text-primary text-[20px]' />
                      {t('orderCancel.productInfo', 'Sản phẩm trong đơn')}
                    </h2>
                    <div className='flex flex-col gap-3'>
                      {order.orderDetails?.map((item) => (
                        <div key={item.orderDetailId} className='flex gap-4 p-3 bg-muted/50 rounded-lg border border-border/40'>
                          <div className='w-16 h-16 rounded-lg overflow-hidden bg-muted shrink-0'>
                            {item.productImage
                              ? <img className='w-full h-full object-cover' src={item.productImage} alt={item.productName} />
                              : <div className='w-full h-full flex items-center justify-center'><MaterialIcon name='image' className='text-[24px] text-muted-foreground' /></div>
                            }
                          </div>
                          <div className='flex flex-col justify-center flex-grow min-w-0'>
                            <h3 className='text-foreground font-semibold text-sm truncate'>{item.productName}</h3>
                            <p className='text-muted-foreground text-xs mt-0.5'>x{item.quantity}</p>
                            <p className='text-primary font-bold text-sm'>{formatPrice(item.totalPrice)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Cancel reason */}
                  <section className='bg-card border border-border/60 rounded-xl p-5 shadow-sm'>
                    <label htmlFor='cancel-reason' className='text-sm font-semibold text-foreground block mb-2'>
                      {t('orderCancel.selectReasonLabel', 'Lý do hủy đơn')} <span className='text-destructive'>*</span>
                    </label>
                    <select
                      id='cancel-reason'
                      required
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      className='w-full rounded-xl border border-border bg-background p-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30'
                    >
                      <option value=''>{t('orderCancel.selectReasonPlaceholder', '-- Vui lòng chọn lý do hủy --')}</option>
                      {CANCEL_REASONS.map((r) => (
                        <option key={r} value={r}>
                          {t(CANCEL_REASON_MAP[r] || r, r)}
                        </option>
                      ))}
                    </select>
                    {cancelReason === 'Khác' && (
                      <div className='mt-3'>
                        <textarea
                          required
                          placeholder={t('orderCancel.customReasonPlaceholder', 'Nhập lý do cụ thể...')}
                          value={customReason}
                          onChange={(e) => setCustomReason(e.target.value)}
                          className='w-full rounded-xl border border-border bg-background p-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30'
                          rows={3}
                        />
                      </div>
                    )}
                  </section>
                </div>

                {/* Right: Summary + Submit */}
                <div className='lg:col-span-5 flex flex-col gap-4'>
                  <section className='bg-card border border-border/60 rounded-xl p-5 shadow-sm'>
                    <h2 className='text-muted-foreground font-semibold text-xs uppercase tracking-wider mb-4'>
                      {t('orderCancel.summaryTitle', 'Tóm tắt đơn hàng')}
                    </h2>
                    <div className='flex justify-between text-sm mb-2'>
                      <span className='text-muted-foreground'>{t('orderCancel.totalAmount', 'Tổng tiền')}</span>
                      <span className='font-bold text-foreground'>{formatPrice(order.finalAmount)}</span>
                    </div>
                    <div className='flex justify-between text-sm mb-4'>
                      <span className='text-muted-foreground'>{t('orderCancel.paymentMethod', 'Phương thức TT')}</span>
                      <span className='font-semibold text-foreground'>
                        {order.payment?.paymentMethod === 'CARD' ? t('orderCancel.paymentMethodCard', 'Thẻ ngân hàng') :
                         order.payment?.paymentMethod === 'MOMO' ? t('orderCancel.paymentMethodMomo', 'Ví MoMo') : t('orderCancel.paymentMethodCOD', 'Tiền mặt (COD)')}
                      </span>
                    </div>

                    <div className='flex flex-col gap-3 mt-4 border-t border-border pt-4'>
                      <button
                        type='submit'
                        disabled={isSubmitting}
                        className='w-full bg-destructive hover:bg-destructive/90 disabled:opacity-70 text-destructive-foreground font-bold py-3.5 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 active:scale-[0.98]'
                      >
                        {isSubmitting ? (
                          <>
                            <div className='h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent' />
                            <span>{t('orderCancel.processing', 'Đang hủy...')}</span>
                          </>
                        ) : (
                          <>
                            <MaterialIcon name='cancel' className='text-[18px]' />
                            <span>{t('orderCancel.confirmCancelBtn', 'Xác nhận hủy đơn')}</span>
                          </>
                        )}
                      </button>
                      <button
                        type='button'
                        onClick={() => navigate(-1)}
                        className='w-full border border-border text-muted-foreground hover:bg-muted font-bold py-3 rounded-xl transition-all text-sm'
                      >
                        {t('orderCancel.backBtn', 'Quay lại')}
                      </button>
                    </div>
                  </section>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
