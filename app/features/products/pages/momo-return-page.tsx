import { useEffect } from 'react'
import { useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { usePollPaymentStatus } from '../hooks/use-poll-payment-status'

export function MomoReturnPage() {
  const { t } = useTranslation('products')
  const navigate = useNavigate()

  const storedOrderId = sessionStorage.getItem('pendingMomoOrderId')
  const orderId = storedOrderId ? Number(storedOrderId) : null
  const isMomoRetry = sessionStorage.getItem('isMomoRetry') === 'true'

  const status = usePollPaymentStatus(orderId)

  useEffect(() => {
    if (status === 'paid' || status === 'failed' || status === 'timeout') {
      sessionStorage.removeItem('pendingMomoOrderId')
      sessionStorage.removeItem('isMomoRetry')
    }
    if (status === 'paid') {
      navigate('/order-success', { state: { orderId }, replace: true })
    } else if (status === 'failed' || status === 'timeout') {
      if (isMomoRetry) {
        navigate('/profile/orders', { replace: true })
      } else {
        navigate('/checkout', {
          state: { paymentError: t('momoReturn.paymentNotCompleted') },
          replace: true
        })
      }
    }
  }, [status, orderId, isMomoRetry, navigate, t])

  useEffect(() => {
    if (!orderId) {
      if (isMomoRetry) {
        navigate('/profile/orders', { replace: true })
      } else {
        navigate('/checkout', { replace: true })
      }
    }
  }, [orderId, isMomoRetry, navigate])

  return (
    <div className='flex min-h-screen flex-col items-center justify-center gap-4 bg-background'>
      <div className='h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent' />
      <p className='text-sm font-semibold text-muted-foreground'>{t('momoReturn.confirming')}</p>
    </div>
  )
}
