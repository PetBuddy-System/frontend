import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { SiteHeader, SiteBottomNav, SiteFooter, SiteFab } from '~/shared/components'
import { MaterialIcon } from '~/shared/ui'
import { fetchOrderDetailApi, requestRefundCancelApi } from '../services/order/order-api'
import type { OrderDetailFull } from '~/shared/lib/order'

interface ProfileOrderCancelPageProps {
  orderId: number
}

function formatPrice(value: number) {
  return `${new Intl.NumberFormat('vi-VN').format(value)}đ`
}

export function ProfileOrderCancelPage({ orderId }: ProfileOrderCancelPageProps) {
  const navigate = useNavigate()
  const { t } = useTranslation('profile')

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
    loadOrder()
  }, [orderId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!order) return

    const finalReason = cancelReason === 'Khác' ? customReason.trim() : cancelReason
    if (!finalReason) {
      alert(t('orderCancel.validationError', 'Vui lòng chọn hoặc nhập lý do hủy đơn hàng'))
      return
    }

    const isPaidByCard = order.payment?.paymentMethod === 'CARD'

    setIsSubmitting(true)
    try {
      const res = await requestRefundCancelApi(orderId, finalReason)

      if (res.success) {
        if (isPaidByCard) {
          alert(
            t('orderCancel.successMessagePaid', 'Yêu cầu hủy & hoàn tiền đã được ghi nhận! Nhân viên sẽ xem xét và xác nhận hoàn tiền sớm nhất có thể.')
          )
        } else {
          alert(t('orderCancel.successMessageCOD', 'Đơn hàng đã được hủy thành công.'))
        }
        navigate(`/profile/orders/${orderId}`)
      } else {
        alert(res.message || t('orderCancel.submitError', 'Không thể gửi yêu cầu hủy đơn.'))
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : t('orderCancel.unexpectedError', 'Có lỗi xảy ra khi hủy đơn.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-background text-foreground">
        <SiteHeader />
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">{t('orderCancel.loading', 'Đang tải thông tin đơn hàng...')}</p>
          </div>
        </main>
        <SiteFooter />
        <SiteBottomNav />
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="flex min-h-screen flex-col bg-background text-foreground">
        <SiteHeader />
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="flex flex-col items-center gap-3 text-center">
            <MaterialIcon name="error" className="text-[48px] text-destructive" />
            <p className="text-sm text-muted-foreground">{error || t('orderCancel.notFound', 'Không tìm thấy đơn hàng.')}</p>
            <button
              onClick={() => navigate('/profile/orders')}
              className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-bold text-sm"
            >
              {t('orderCancel.backToOrders', 'Quay lại danh sách đơn hàng')}
            </button>
          </div>
        </main>
        <SiteFooter />
        <SiteBottomNav />
      </div>
    )
  }

  const isCardPayment = order.payment?.paymentMethod === 'CARD'

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <SiteHeader />

      {/* Main Content Canvas */}
      <main className="min-h-screen bg-muted/40 dark:bg-background/20 flex flex-col items-center">
        <div className="w-full max-w-5xl p-6 md:p-10 flex flex-col gap-8">

          {/* Page Header */}
          <div className="flex items-center justify-between">
            <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-2 md:text-3xl">
              <MaterialIcon name="cancel" className="text-destructive text-[28px]" />
              {t('orderCancel.title', 'Yêu cầu hủy đơn')}
            </h1>
            <div className="bg-card px-4 py-1.5 rounded-full text-muted-foreground font-semibold text-xs border border-border">
              {t('orderCancel.orderCode', { code: order.orderCode, defaultValue: `Mã đơn: #${order.orderCode}` })}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

            {/* Left Column: Product Info & Reasons */}
            <div className="lg:col-span-7 flex flex-col gap-6">

              {/* Order Item Summary Card */}
              <section className="bg-card border border-border/60 rounded-xl p-6 shadow-sm">
                <h2 className="text-foreground font-semibold text-lg mb-4 flex items-center gap-2">
                  <MaterialIcon name="inventory_2" className="text-primary text-[20px]" />
                  {t('orderCancel.productInfo', 'Thông tin sản phẩm')}
                </h2>

                <div className="flex flex-col gap-4">
                  {order.orderDetails?.map((item) => (
                    <div key={item.orderDetailId} className="flex gap-4 p-4 bg-muted/50 rounded-lg border border-border/40">
                      <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted shrink-0 border border-border/20">
                        {item.productImage ? (
                          <img className="w-full h-full object-cover" src={item.productImage} alt={item.productName} />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
                            <MaterialIcon name="image" className="text-[28px]" />
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col justify-between py-1 flex-grow min-w-0">
                        <div>
                          <h3 className="text-foreground font-semibold text-sm md:text-base truncate" title={item.productName}>
                            {item.productName}
                          </h3>
                          <div className="flex items-center gap-3 mt-1 text-muted-foreground text-xs font-medium">
                            <span>{t('orderCancel.quantity', { count: item.quantity, defaultValue: `Số lượng: x${item.quantity}` })}</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-end mt-2">
                          <div className="text-primary font-bold text-xs bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20">
                            {t('orderCancel.statusPending', 'Chờ xử lý')}
                          </div>
                          <div className="text-right font-semibold text-sm md:text-base text-foreground">
                            {formatPrice(item.totalPrice)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="bg-card border border-border/60 rounded-xl overflow-hidden shadow-sm">
                <div className="p-6 border-b border-border/50 flex flex-col gap-3">
                  <label htmlFor="select-reason" className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                    {t('orderCancel.cancelReasonLabel', 'Lý do hủy đơn')} <span className="text-destructive">*</span>
                  </label>
                  <select
                    id="select-reason"
                    required
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background p-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    <option value="">{t('orderCancel.selectReasonPlaceholder', '-- Vui lòng chọn lý do hủy đơn --')}</option>
                    <option value="Tôi không có nhu cầu mua nữa">{t('orderCancel.reasonNoNeed', 'Tôi không có nhu cầu mua nữa')}</option>
                    <option value="Tôi muốn thay đổi địa chỉ nhận hàng">{t('orderCancel.reasonChangeAddress', 'Tôi muốn thay đổi địa chỉ nhận hàng')}</option>
                    <option value="Tôi muốn đổi phương thức thanh toán">{t('orderCancel.reasonChangePayment', 'Tôi muốn đổi phương thức thanh toán')}</option>
                    <option value="Tìm thấy giá rẻ hơn ở nơi khác">{t('orderCancel.reasonCheaperPrice', 'Tìm thấy giá rẻ hơn ở nơi khác')}</option>
                    <option value="Khác">{t('orderCancel.reasonOther', 'Lý do khác')}</option>
                  </select>

                  {cancelReason === 'Khác' && (
                    <div className="mt-2">
                      <textarea
                        required
                        placeholder={t('orderCancel.customReasonPlaceholder', 'Vui lòng nhập lý do cụ thể...')}
                        value={customReason}
                        onChange={(e) => setCustomReason(e.target.value)}
                        className="w-full rounded-xl border border-border bg-background p-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                        rows={3}
                      />
                    </div>
                  )}
                </div>
              </section>
            </div>

            <div className="lg:col-span-5 flex flex-col gap-6">
              <section className="bg-card border border-border/60 rounded-xl p-6 shadow-sm flex flex-col">
                <div className="flex items-center justify-between w-full mb-6">
                  <h2 className="text-muted-foreground font-semibold text-xs uppercase tracking-wider">{t('orderCancel.refundAmountLabel', 'Số tiền hoàn lại')}</h2>
                  <div className="text-foreground font-bold text-lg md:text-xl">
                    {isCardPayment ? formatPrice(order.finalAmount) : t('orderCancel.noRefund', 'Không hoàn tiền')}
                  </div>
                </div>

                <div className="bg-muted border-l-4 border-primary rounded-r-lg p-4 mb-6">
                  <div className="flex gap-3">
                    <MaterialIcon name="info" className="text-primary mt-0.5 shrink-0" />
                    <p className="text-muted-foreground text-xs leading-relaxed">
                      {isCardPayment
                        ? t('orderCancel.refundNotePaid', 'Yêu cầu hủy & hoàn tiền của bạn sẽ được chuyển đến nhân viên. Sau khi nhân viên xác nhận, tiền sẽ được hoàn về thẻ theo chính sách.')
                        : t('orderCancel.refundNoteCOD', 'Bạn đã chọn thanh toán khi nhận hàng (COD). Chúng tôi sẽ tiến hành hủy đơn hàng và không phát sinh giao dịch hoàn tiền trực tiếp.')}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="flex gap-3 items-start p-3 bg-destructive/5 border border-destructive/10 rounded-lg">
                    <MaterialIcon name="warning" className="text-destructive shrink-0 text-[18px]" />
                    <p className="text-muted-foreground text-[11px] leading-snug italic font-medium">
                      {t('orderCancel.warningNotice', 'Sau khi nhấn "Gửi yêu cầu", Shop sẽ liên hệ đơn vị vận chuyển yêu cầu dừng giao đơn hàng này.')}
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-primary hover:bg-primary/95 disabled:opacity-70 text-primary-foreground font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                        <span>{t('orderCancel.processing', 'Đang xử lý...')}</span>
                      </>
                    ) : (
                      <>
                        <span>{t('orderCancel.submitBtn', 'Gửi yêu cầu')}</span>
                        <MaterialIcon name="send" />
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="w-full border border-border text-muted-foreground hover:bg-muted font-bold py-3 rounded-xl transition-all text-sm"
                  >
                    {t('orderCancel.backBtn', 'Quay lại')}
                  </button>
                </div>
              </section>
            </div>

          </form>

        </div>
      </main>

      <SiteFooter />
      <SiteBottomNav />
      <SiteFab />
    </div>
  )
}