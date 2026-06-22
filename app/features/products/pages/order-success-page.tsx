import { useEffect, useState } from 'react'
import { useAuth } from '~/providers/auth-provider'

import { OrderSuccessBanner } from '../components/order-success/order-success-banner'
import { OrderSuccessConfetti } from '../components/order-success/order-success-confetti'
import { OrderSuccessDetails, type OrderSuccessItem } from '../components/order-success/order-success-details'
import { OrderSuccessInfoCards } from '../components/order-success/order-success-info-cards'
import { OrderSuccessSidebar } from '../components/order-success/order-success-sidebar'
import { SiteBottomNav } from '~/shared/components'
import { SiteFab } from '~/shared/components'
import { SiteFooter } from '~/shared/components'
import { SiteHeader } from '~/shared/components'

interface StoredOrderDetails {
  orderCode: string
  userName: string
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
    quantity: number
    imageUrl: string
  }[]
}

function formatPrice(value: number) {
  return `${new Intl.NumberFormat('vi-VN').format(value)}đ`
}

export function OrderSuccessPage() {
  const { user } = useAuth()
  const [order, setOrder] = useState<StoredOrderDetails | null>(null)

  useEffect(() => {
    const raw = sessionStorage.getItem('petbuddy_last_order')
    if (raw) {
      try {
        setOrder(JSON.parse(raw) as StoredOrderDetails)
      } catch (err) {
        console.error('Error parsing stored order details', err)
      }
    }
  }, [])

  const fallbackOrder: StoredOrderDetails = {
    orderCode: '#PS12345',
    userName: 'Nguyễn Văn An',
    phoneNumber: '0901234567',
    address: '123 Đường Lê Lợi, Phường Bến Thành, Quận 1, TP. Hồ Chí Minh',
    paymentMethod: 'Thẻ tín dụng (Visa **** 4455)',
    shippingFee: 0,
    isFreeShipping: true,
    voucherDiscount: 0,
    subtotal: 1130000,
    finalAmount: 1130000,
    items: [
      {
        productId: 'prod-1',
        name: 'Sữa tắm Olive Essence (Lông nâu)',
        price: 250000,
        quantity: 1,
        imageUrl: 'https://lh3.googleusercontent.com/aida/ADBb0uh6WztLsYERJyTaVYarWvnGp7PviF99OFqmiQwLP1f4tKtx45N_yHkRFHRtfl8FMOmuJnU1DAy1qxWM49q2mu6G00N36QX-lk0RNB87VcKiyvkK2b4tJB5o1ldxwKCNdzLWi878nkSVQJ00oROLzqE3EyHH-Q1bBSzi67sW1gVLLsq6gZPdSQoba3UWhihAiRHva6cJTS0vOcsHMVghw205rxK8XAhnMWn25w9LTKA2deXxbwotRK2GUG0'
      },
      {
        productId: 'prod-2',
        name: 'Thức ăn hạt Royal Canin (Medium Adult)',
        price: 440000,
        quantity: 2,
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCjZgGezGzKb8CJs5q-9lrcFr5_7fo7bk8DlMU8iJwhQqmcxRPWnIiMrOxNnewcXbfFu3F2N0YIM3soj0TWqqG3qC2SO6efI_uYWn3VdjmLDx0AS261VBoNGTGhgDyBPuITl_4esVLpatKrtm-msM2dmC98EaeE4Gv7GV4sbYeirdnKFRwp6x-Tr6zaC4K1eGIYCI_CQJduR_GHvqiZrUNiAQANLbxXB9U-gsy1Hf8jM9zJDemFqUmzyYeWdzJQ5eJcndmPd_Bt2f0'
      }
    ]
  }

  const activeOrder = order || fallbackOrder
  const userEmail = user?.email || 'customer@example.com'

  return (
    <div className='flex min-h-screen flex-col overflow-x-hidden bg-background text-foreground'>
      <SiteHeader />
      <main className='mx-auto w-full max-w-6xl flex-1 px-4 py-10 pb-24 md:px-6 md:py-16'>
        <div className='grid grid-cols-1 gap-8 lg:grid-cols-12'>
          <div className='space-y-8 lg:col-span-8'>
            <OrderSuccessBanner orderCode={activeOrder.orderCode} email={userEmail} />
            <OrderSuccessDetails items={activeOrder.items} formatPrice={formatPrice} />
            <OrderSuccessInfoCards
              userName={activeOrder.userName}
              phoneNumber={activeOrder.phoneNumber}
              address={activeOrder.address}
              paymentMethod={activeOrder.paymentMethod}
            />
          </div>
          <div className='lg:col-span-4'>
            <OrderSuccessSidebar
              subtotal={activeOrder.subtotal}
              shippingFee={activeOrder.shippingFee}
              isFreeShipping={activeOrder.isFreeShipping}
              discount={activeOrder.voucherDiscount}
              finalAmount={activeOrder.finalAmount}
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
