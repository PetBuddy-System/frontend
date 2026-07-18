import { useEffect, useState } from 'react'
import { useAuth } from '~/providers/auth-provider'
import { useNavigate } from 'react-router'
import { useCart } from '~/providers/cart-provider'

import { OrderSuccessBanner } from '../components/order-success/order-success-banner'
import { OrderSuccessConfetti } from '../components/order-success/order-success-confetti'
import { OrderSuccessDetails } from '../components/order-success/order-success-details'
import { OrderSuccessInfoCards } from '../components/order-success/order-success-info-cards'
import { OrderSuccessSidebar } from '../components/order-success/order-success-sidebar'
import { SiteBottomNav, SiteFab, SiteFooter, SiteHeader } from '~/shared/components'
import { MaterialIcon } from '~/shared/ui'

interface StoredOrderDetails {
  orderCode: string
  recipientName: string
  phoneNumber: string
  address: string
  note?: string
  paymentMethod: string
  shippingFee: number
  isFreeShipping: boolean
  voucherDiscount: number
  subtotal: number
  finalAmount: number
  items: {
    productId: string
    name: string
    price: number
    salePrice?: number | null
    quantity: number
    imageUrl: string
  }[]
}

function formatPrice(value: number) {
  return `${new Intl.NumberFormat('vi-VN').format(value)}đ`
}

export function OrderSuccessPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { refetchCart } = useCart()
  const [order, setOrder] = useState<StoredOrderDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Giỏ hàng đã được xoá ở backend sau khi đặt hàng thành công,
    // cần refetch để badge số lượng trên header cập nhật lại (về 0).
    refetchCart()

    const raw = sessionStorage.getItem('petbuddy_last_order')
    if (raw) {
      try {
        setOrder(JSON.parse(raw) as StoredOrderDetails)
      } catch (err) {
        console.error('Error parsing stored order details', err)
      }
    }
    setIsLoading(false)

    // Clear checkout form sessionStorage variables
    const keysToRemove = [
      'petbuddy_checkout_address',
      'petbuddy_checkout_lat',
      'petbuddy_checkout_lng',
      'petbuddy_checkout_shipping_fee',
      'petbuddy_checkout_is_free',
      'petbuddy_checkout_voucher_code',
      'petbuddy_checkout_voucher_name',
      'petbuddy_checkout_voucher_discount',
      'petbuddy_checkout_payment_method',
      'petbuddy_checkout_name',
      'petbuddy_checkout_phone',
      'petbuddy_checkout_subtotal',
      'petbuddy_checkout_distance',
      'petbuddy_checkout_note',
      'petbuddy_checkout_pending_order_id',
    ]
    keysToRemove.forEach((k) => sessionStorage.removeItem(k))
  }, [])


  const userEmail = user?.email || 'customer@example.com'

  if (isLoading) {
    return (
      <div className='flex min-h-screen flex-col overflow-x-hidden bg-background text-foreground animate-pulse'>
        <SiteHeader />
        <main className='mx-auto flex w-full max-w-6xl flex-1 items-center justify-center px-4 py-10 pb-24 md:px-6 md:py-16'>
          <div className='text-center text-muted-foreground'>
            <MaterialIcon name='autorenew' className='animate-spin text-4xl mb-2' />
            <p>Đang tải thông tin đơn hàng...</p>
          </div>
        </main>
        <SiteFooter />
        <SiteBottomNav />
        <SiteFab />
      </div>
    )
  }

  if (!order) {
    return (
      <div className='flex min-h-screen flex-col overflow-x-hidden bg-[#f8f9fa] dark:bg-[#0b1220] text-foreground'>
        <SiteHeader />
        <main className='mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center p-6 text-center md:py-16'>
          <div className='mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-warning/10 text-warning'>
            <MaterialIcon name='receipt_long' className='text-[48px]' />
          </div>
          <h1 className='font-display text-2xl font-black text-foreground md:text-3xl mb-3'>
            Không tìm thấy đơn hàng
          </h1>
          <p className='text-sm text-muted-foreground mb-8'>
            Không tìm thấy thông tin đơn hàng vừa đặt của bạn. Có thể phiên làm việc của bạn đã hết hạn hoặc chưa có đơn hàng nào được tạo gần đây.
          </p>
          <div className='flex w-full flex-col gap-3'>
            <button
              onClick={() => navigate('/products')}
              className='flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 font-display font-semibold text-primary-foreground shadow transition hover:opacity-90 active:scale-[0.98]'
            >
              <MaterialIcon name='shopping_bag' className='text-[20px]' />
              Tiếp tục mua sắm
            </button>
            <button
              onClick={() => navigate('/profile/orders')}
              className='flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card py-3.5 font-display font-semibold text-foreground hover:bg-muted transition active:scale-[0.98]'
            >
              <MaterialIcon name='history' className='text-[20px]' />
              Lịch sử đơn hàng
            </button>
          </div>
        </main>
        <SiteFooter />
        <SiteBottomNav />
        <SiteFab />
      </div>
    )
  }

  return (
    <div className='flex min-h-screen flex-col overflow-x-hidden bg-background text-foreground animate-in fade-in duration-300'>
      <SiteHeader />
      <main className='mx-auto w-full max-w-6xl flex-1 px-4 py-10 pb-24 md:px-6 md:py-16'>
        <div className='grid grid-cols-1 gap-8 lg:grid-cols-12'>
          <div className='space-y-8 lg:col-span-8'>
            <OrderSuccessBanner orderCode={order.orderCode} email={userEmail} />
            <OrderSuccessDetails items={order.items} formatPrice={formatPrice} />
            <OrderSuccessInfoCards
              userName={order.recipientName}
              phoneNumber={order.phoneNumber}
              address={order.address}
              paymentMethod={order.paymentMethod}
            />
          </div>
          <div className='lg:col-span-4'>
            <OrderSuccessSidebar
              subtotal={order.subtotal}
              shippingFee={order.shippingFee}
              isFreeShipping={order.isFreeShipping}
              discount={order.voucherDiscount}
              finalAmount={order.finalAmount}
              formatPrice={formatPrice}
            />
          </div>
        </div>
      </main>
      <SiteFooter />
      <SiteBottomNav />
      <SiteFab />
      <OrderSuccessConfetti />
    </div>
  )
}