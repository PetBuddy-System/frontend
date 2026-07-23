import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { useTranslation } from 'react-i18next'
import { usePollPaymentStatus } from '../hooks/use-poll-payment-status'

export function VnPayReturnPage() {
  const { t } = useTranslation('products')
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const vnpResponseCode = searchParams.get('vnp_ResponseCode')
  const vnpTxnRef = searchParams.get('vnp_TxnRef')

  const storedOrderId = sessionStorage.getItem('pendingVnPayOrderId')
  let orderId = storedOrderId ? Number(storedOrderId) : null

  if (!orderId && vnpTxnRef && !isNaN(Number(vnpTxnRef))) {
    orderId = Number(vnpTxnRef)
  }

  const isVnPayRetry = sessionStorage.getItem('isVnPayRetry') === 'true'

  const pollStatus = usePollPaymentStatus(orderId)

  const isVnPaySuccess = vnpResponseCode === '00' || pollStatus === 'paid'
  const isVnPayFailed = (vnpResponseCode && vnpResponseCode !== '00') || pollStatus === 'failed' || pollStatus === 'timeout'

  useEffect(() => {
    if (isVnPaySuccess) {
      sessionStorage.removeItem('pendingVnPayOrderId')
      sessionStorage.removeItem('isVnPayRetry')
      sessionStorage.removeItem('petbuddy_checkout_pending_order_id')
      navigate('/order-success', { state: { orderId }, replace: true })
    } else if (isVnPayFailed) {
      sessionStorage.removeItem('pendingVnPayOrderId')
      sessionStorage.removeItem('isVnPayRetry')
      if (isVnPayRetry) {
        navigate('/profile/orders', { replace: true })
      } else {
        navigate('/checkout', {
          state: { paymentError: t('vnpayReturn.paymentNotCompleted', 'Giao dịch VNPAY không thành công.') },
          replace: true,
        })
      }
    }
  }, [isVnPaySuccess, isVnPayFailed, orderId, isVnPayRetry, navigate, t])

  useEffect(() => {
    if (!orderId && !vnpResponseCode) {
      if (isVnPayRetry) {
        navigate('/profile/orders', { replace: true })
      } else {
        navigate('/checkout', { replace: true })
      }
    }
  }, [orderId, vnpResponseCode, isVnPayRetry, navigate])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      <p className="text-sm font-semibold text-muted-foreground">
        {t('vnpayReturn.confirming', 'Đang xác nhận thanh toán VNPAY...')}
      </p>
    </div>
  )
}
