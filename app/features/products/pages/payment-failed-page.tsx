import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { MaterialIcon } from '~/shared/ui'
import { SiteBottomNav, SiteFab, SiteFooter, SiteHeader } from '~/shared/components'
import { getPaymentByOrderIdApi } from '~/features/products/services/payment/payment-api'

export function PaymentFailedPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const orderId = searchParams.get('orderId') ?? ''
  const reason = searchParams.get('reason') ?? 'unknown'
  const customMessage = searchParams.get('message') ?? ''

  const [isRetrying, setIsRetrying] = useState(false)
  const [retryError, setRetryError] = useState('')

  async function handleRetryPayment() {
    if (!orderId) return
    setIsRetrying(true)
    setRetryError('')
    try {
      const res = await getPaymentByOrderIdApi(Number(orderId))
      if (res.success && res.data) {
        const clientSecret = res.data.stripeClientSecret || res.data.clientSecret || ''
        const amount = res.data.amount || 0
        navigate('/payment', {
          state: {
            orderId: Number(orderId),
            clientSecret,
            amount,
          }
        })
      } else {
        setRetryError(res.message || 'Không thể lấy thông tin thanh toán cho đơn hàng này.')
      }
    } catch (err) {
      setRetryError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi lấy thông tin thanh toán.')
    } finally {
      setIsRetrying(false)
    }
  }

  // Phân loại lý do thất bại sang tiếng Việt
  let reasonTitle = 'Thanh toán thất bại'
  let reasonDescription = 'Không thể hoàn tất giao dịch thanh toán trực tuyến.'

  switch (reason) {
    case 'timeout':
      reasonTitle = 'Hết thời gian giao dịch'
      reasonDescription = 'Thời gian dành cho việc thanh toán đơn hàng (5 phút) đã kết thúc.'
      break
    case 'user_cancelled':
      reasonTitle = 'Giao dịch bị hủy'
      reasonDescription = 'Bạn đã chủ động hủy bỏ quá trình thanh toán qua thẻ.'
      break
    case 'card_declined':
      reasonTitle = 'Thẻ bị từ chối'
      reasonDescription = customMessage || 'Thông tin thẻ không chính xác hoặc số dư tài khoản không đủ để thanh toán.'
      break
    default:
      reasonDescription = customMessage || 'Đã có lỗi xảy ra trong quá trình kết nối với Stripe.'
  }

  return (
    <div className='flex min-h-screen flex-col bg-[#f8f9fa] dark:bg-[#0b1220] text-foreground transition-colors duration-300'>
      <SiteHeader />
      <main className='mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center p-6 text-center md:py-16'>
        
        {/* Vòng tròn Icon lỗi màu đỏ */}
        <div className='mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10 text-destructive animate-bounce'>
          <MaterialIcon name='cancel' className='text-[48px]' />
        </div>

        <span className='text-xs font-bold uppercase tracking-wider text-destructive mb-1'>Lỗi giao dịch</span>
        <h1 className='font-display text-2xl font-black text-foreground md:text-3xl mb-4'>
          {reasonTitle}
        </h1>

        <div className='w-full rounded-2xl bg-white dark:bg-[#111a2e] border border-border/40 p-6 shadow-sm mb-8 space-y-4 text-left'>
          {orderId && (
            <div className='flex justify-between items-center text-sm border-b border-border/40 pb-3'>
              <span className='text-muted-foreground'>Mã đơn hàng</span>
              <span className='font-mono font-bold text-foreground'>#{orderId}</span>
            </div>
          )}
          
          <div className='space-y-1'>
            <span className='text-xs font-bold text-muted-foreground uppercase tracking-wide'>Chi tiết lỗi</span>
            <p className='text-sm text-foreground leading-relaxed font-medium'>{reasonDescription}</p>
          </div>

          <div className='rounded-xl bg-destructive/5 border border-destructive/10 p-3 text-xs text-muted-foreground flex gap-2'>
            <MaterialIcon name='info' className='text-[16px] text-destructive shrink-0 mt-0.5' />
            <span>Đơn hàng của bạn vẫn được lưu ở trạng thái chờ. Bạn có thể thanh toán lại hoặc kiểm tra lịch sử đặt hàng.</span>
          </div>
        </div>

        {/* Nút hành động */}
        <div className='flex w-full flex-col gap-3'>
          {orderId && (
            <button
              onClick={handleRetryPayment}
              disabled={isRetrying}
              className='flex w-full items-center justify-center gap-2 rounded-xl bg-[#004d99] hover:bg-[#003d7a] py-3.5 font-display font-semibold text-white shadow-md transition-all active:scale-[0.98] disabled:opacity-50'
            >
              {isRetrying ? (
                <>
                  <MaterialIcon name='progress_activity' className='animate-spin text-[20px]' />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <MaterialIcon name='credit_card' className='text-[20px]' />
                  Thanh toán lại qua thẻ
                </>
              )}
            </button>
          )}

          {retryError && (
            <div className='text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-xl p-3 text-center'>
              {retryError}
            </div>
          )}

          <button
            onClick={() => navigate('/profile/orders')}
            className='flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 font-display font-semibold text-primary-foreground shadow transition hover:opacity-90 active:scale-[0.98]'
          >
            <MaterialIcon name='receipt_long' className='text-[20px]' />
            Kiểm tra đơn hàng của tôi
          </button>
          
          <button
            onClick={() => navigate('/products')}
            className='flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card py-3.5 font-display font-semibold text-foreground hover:bg-muted transition active:scale-[0.98]'
          >
            <MaterialIcon name='shopping_bag' className='text-[20px]' />
            Tiếp tục mua sắm
          </button>
        </div>

      </main>
      <SiteFooter />
      <SiteBottomNav />
      <SiteFab />
    </div>
  )
}
