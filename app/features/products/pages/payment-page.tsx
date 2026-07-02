import { useEffect, useState, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router'
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'

import { env } from '~/shared/config/env'
import { MaterialIcon } from '~/shared/ui'
import { SiteBottomNav, SiteFab, SiteFooter, SiteHeader } from '~/shared/components'

const stripePromise = loadStripe(env.STRIPE_PK)

function formatPrice(value: number) {
  return `${new Intl.NumberFormat('vi-VN').format(value)}đ`
}

const SESSION_KEY_CARDHOLDER = 'petbuddy_payment_cardholder'

const stripeElementStyle = {
  base: {
    fontSize: '15px',
    color: '#191c1d',
    '::placeholder': { color: '#aab7c4' },
    fontFamily: 'inherit',
  },
  invalid: { color: '#ba1a1a' },
}

function CheckoutForm({
  clientSecret,
  orderId,
  amount,
}: {
  clientSecret: string
  orderId: number
  amount: number
}) {
  const stripe = useStripe()
  const elements = useElements()
  const navigate = useNavigate()
  const [isProcessing, setIsProcessing] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [cardHolderName, setCardHolderName] = useState(
    () => sessionStorage.getItem(SESSION_KEY_CARDHOLDER) ?? ''
  )

  function handleCardHolderChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value.toUpperCase()
    setCardHolderName(val)
    sessionStorage.setItem(SESSION_KEY_CARDHOLDER, val)
  }

  async function handlePaySubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!stripe || !elements) return

    const cardNumberElement = elements.getElement(CardNumberElement)
    if (!cardNumberElement) {
      setErrorMessage('Không tải được cổng nhập thẻ.')
      return
    }

    if (!cardHolderName.trim()) {
      setErrorMessage('Vui lòng nhập tên chủ thẻ.')
      return
    }

    setIsProcessing(true)
    setErrorMessage('')

    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardNumberElement,
        billing_details: {
          name: cardHolderName,
        },
      },
    })

    if (error) {
      setErrorMessage(error.message ?? 'Thanh toán thất bại. Vui lòng thử lại.')
      setIsProcessing(false)
      return
    }

    if (paymentIntent?.status === 'succeeded') {
      sessionStorage.removeItem(`petbuddy_payment_start_${orderId}`)
      sessionStorage.removeItem(SESSION_KEY_CARDHOLDER)
      navigate('/order-success')
    } else {
      setErrorMessage('Thanh toán chưa hoàn tất. Vui lòng thử lại.')
      setIsProcessing(false)
    }
  }

  return (
    <form onSubmit={handlePaySubmit} className='space-y-6'>
      <div className='flex flex-col gap-2'>
        <label className='text-sm font-semibold text-foreground' htmlFor='cardholder'>
          Tên chủ thẻ
        </label>
        <input
          id='cardholder'
          type='text'
          className='w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-1 focus:ring-ring'
          placeholder='NGUYEN VAN A'
          required
          value={cardHolderName}
          onChange={handleCardHolderChange}
          disabled={isProcessing}
        />
      </div>

      <div className='flex flex-col gap-2'>
        <label className='text-sm font-semibold text-foreground'>
          Thông tin thẻ tín dụng/ghi nợ
        </label>
        <div className='overflow-hidden rounded-xl border border-border bg-background shadow-inner'>
          <div className='flex items-center gap-2 border-b border-border px-4 py-3'>
            <div className='flex-1'>
              <CardNumberElement
                options={{ style: stripeElementStyle, showIcon: true, placeholder: '1234 1234 1234 1234' }}
              />
            </div>
          </div>

          <div className='grid grid-cols-2 divide-x divide-border'>
            <div className='px-4 py-3'>
              <CardExpiryElement options={{ style: stripeElementStyle, placeholder: 'MM / YY' }} />
            </div>
            <div className='px-4 py-3'>
              <CardCvcElement options={{ style: stripeElementStyle, placeholder: 'CVC' }} />
            </div>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className='flex items-start gap-2 rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-xs text-destructive'>
          <MaterialIcon name='error' className='shrink-0 text-[18px]' />
          <span>{errorMessage}</span>
        </div>
      )}
      <button
        type='submit'
        disabled={isProcessing || !stripe}
        className='flex w-full items-center justify-center gap-2 rounded-xl bg-[#004d99] py-3.5 font-display font-semibold text-white shadow-md transition-all hover:bg-[#003d7a] active:scale-[0.98] disabled:opacity-50'
      >
        {isProcessing ? (
          <>
            <MaterialIcon name='progress_activity' className='animate-spin text-[20px]' />
            Đang xác thực giao dịch...
          </>
        ) : (
          <>
            <MaterialIcon name='lock' className='text-[20px]' />
            Thanh toán {formatPrice(amount)}
          </>
        )}
      </button>
    </form>
  )
}

export function PaymentPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const paymentState = (location.state || {}) as {
    orderId?: number
    clientSecret?: string
    amount?: number
    shippingFee?: number
    isFreeShipping?: boolean
  }
  const orderId = paymentState.orderId ?? 0
  const clientSecret = paymentState.clientSecret ?? ''
  const amount = paymentState.amount ?? 0
  const shippingFee = paymentState.shippingFee ?? 0
  const isFreeShipping = paymentState.isFreeShipping ?? true

  const [timeLeft, setTimeLeft] = useState(300)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!orderId) return

    const sessionKey = `petbuddy_payment_start_${orderId}`
    let startTimeStr = sessionStorage.getItem(sessionKey)
    if (!startTimeStr) {
      startTimeStr = String(Date.now())
      sessionStorage.setItem(sessionKey, startTimeStr)
    }

    const elapsedSeconds = Math.floor((Date.now() - Number(startTimeStr)) / 1000)
    const remaining = Math.max(0, 300 - elapsedSeconds)
    setTimeLeft(remaining)

    if (remaining <= 0) {
      handleTimeout()
      return
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!)
          handleTimeout()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [orderId])

  async function handleTimeout() {
    sessionStorage.removeItem(`petbuddy_payment_start_${orderId}`)
    navigate(`/payment-failed?orderId=${orderId}&reason=timeout`)
  }

  async function handleCancelPayment() {
    if (timerRef.current) clearInterval(timerRef.current)
    sessionStorage.removeItem(`petbuddy_payment_start_${orderId}`)
    navigate('/order')
  }

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`

  const actualShippingFee = isFreeShipping ? 0 : shippingFee
  const subtotal = amount - actualShippingFee

  if (!orderId || !clientSecret) {
    return (
      <div className='flex min-h-screen flex-col bg-background text-foreground'>
        <SiteHeader />
        <main className='mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center p-6 text-center'>
          <MaterialIcon name='error' className='text-[64px] text-destructive mb-4' />
          <h2 className='text-2xl font-bold mb-2'>Lỗi tải trang thanh toán</h2>
          <p className='text-sm text-muted-foreground mb-6'>
            Mã đơn hàng hoặc thông tin thanh toán không hợp lệ.
          </p>
          <button
            onClick={() => navigate('/products')}
            className='rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground shadow transition hover:opacity-90'
          >
            Quay lại trang mua sắm
          </button>
        </main>
        <SiteFooter />
        <SiteBottomNav />
        <SiteFab />
      </div>
    )
  }

  return (
    <div className='flex min-h-screen flex-col bg-[#f8f9fa] dark:bg-[#0b1220] text-foreground'>
      <SiteHeader />
      <main className='mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-4 py-8 md:py-16'>

        <section className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between rounded-2xl bg-white dark:bg-[#111a2e] border border-border/40 p-6 shadow-sm'>
          <div>
            <span className='text-xs font-bold uppercase tracking-wider text-muted-foreground'>
              Thanh toán đơn hàng
            </span>
            <h1 className='font-display text-2xl font-bold text-foreground md:text-3xl mt-1'>
              Mã đơn hàng: #{orderId}
            </h1>
          </div>
          <div className='flex items-center gap-3 self-start md:self-auto rounded-xl bg-warning/10 border border-warning/20 px-4 py-2.5 text-warning'>
            <MaterialIcon
              name='alarm'
              className={`text-[24px] ${timeLeft < 60 ? 'animate-pulse text-destructive' : ''}`}
            />
            <div className='flex flex-col'>
              <span className='text-[10px] font-bold uppercase tracking-wider opacity-85'>
                Thời gian còn lại
              </span>
              <span className={`font-mono text-xl font-bold ${timeLeft < 60 ? 'text-destructive' : ''}`}>
                {formattedTime}
              </span>
            </div>
          </div>
        </section>

        <div className='grid grid-cols-1 gap-6 md:grid-cols-12'>
          <section className='md:col-span-7 flex flex-col gap-6 rounded-2xl bg-white dark:bg-[#111a2e] border border-border/40 p-6 shadow-sm'>
            <div className='flex items-center gap-3 border-b border-border/50 pb-4'>
              <MaterialIcon name='shield' className='text-[24px] text-[#004d99]' />
              <h2 className='font-display text-lg font-bold'>Cổng thanh toán Stripe bảo mật</h2>
            </div>

            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <CheckoutForm
                clientSecret={clientSecret}
                orderId={orderId}
                amount={amount}
              />
            </Elements>

            <button
              onClick={handleCancelPayment}
              className='text-center text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors py-2'
            >
              Hủy thanh toán &amp; Quay lại
            </button>
          </section>

          <section className='md:col-span-5 flex flex-col gap-6 rounded-2xl bg-white dark:bg-[#111a2e] border border-border/40 p-6 shadow-sm h-fit'>
            <h3 className='font-display text-base font-bold border-b border-border/50 pb-3'>
              Chi tiết thanh toán
            </h3>
            <div className='flex flex-col gap-4'>
              <div className='flex items-center justify-between text-sm'>
                <span className='text-muted-foreground'>Số tiền đơn hàng</span>
                <span className='font-semibold'>{formatPrice(subtotal > 0 ? subtotal : amount)}</span>
              </div>
              <div className='flex items-center justify-between text-sm'>
                <span className='text-muted-foreground'>Phí giao hàng</span>
                {isFreeShipping ? (
                  <span className='font-semibold text-success'>Miễn phí</span>
                ) : (
                  <span className='font-semibold'>{formatPrice(shippingFee)}</span>
                )}
              </div>
              <hr className='border-border/50' />
              <div className='flex items-center justify-between'>
                <span className='font-bold'>Tổng cộng</span>
                <span className='font-display text-xl font-bold text-[#004d99]'>
                  {formatPrice(amount)}
                </span>
              </div>
            </div>
          </section>
        </div>
      </main>
      <SiteFooter />
      <SiteBottomNav />
      <SiteFab />
    </div>
  )
}