import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { CheckoutDeliveryMethods } from '../components/checkout/checkout-delivery-methods'
import { CheckoutNote } from '../components/checkout/checkout-note'
import { CheckoutOrderSummary, type CheckoutOrderItem } from '../components/checkout/checkout-order-summary'
import { CheckoutPaymentMethods } from '../components/checkout/checkout-payment-methods'
import { CheckoutShippingForm } from '../components/checkout/checkout-shipping-form'
import { SiteBottomNav } from '~/shared/components'
import { SiteFab } from '~/shared/components'
import { SiteFooter } from '~/shared/components'
import { SiteHeader } from '~/shared/components'

const CHECKOUT_ITEMS: CheckoutOrderItem[] = [
  {
    key: 'oliveShampoo',
    image:
      'https://lh3.googleusercontent.com/aida/ADBb0uh6WztLsYERJyTaVYarWvnGp7PviF99OFqmiQwLP1f4tKtx45N_yHkRFHRtfl8FMOmuJnU1DAy1qxWM49q2mu6G00N36QX-lk0RNB87VcKiyvkK2b4tJB5o1ldxwKCNdzLWi878nkSVQJ00oROLzqE3EyHH-Q1bBSzi67sW1gVLLsq6gZPdSQoba3UWhihAiRHva6cJTS0vOcsHMVghw205rxK8XAhnMWn25w9LTKA2deXxbwotRK2GUG0',
    price: 429000,
    quantity: 1
  },
  {
    key: 'royalCaninPoodle',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCjZgGezGzKb8CJs5q-9lrcFr5_7fo7bk8DlMU8iJwhQqmcxRPWnIiMrOxNnewcXbfFu3F2N0YIM3soj0TWqqG3qC2SO6efI_uYWn3VdjmLDx0AS261VBoNGTGhgDyBPuITl_4esVLpatKrtm-msM2dmC98EaeE4Gv7GV4sbYeirdnKFRwp6x-Tr6zaC4K1eGIYCI_CQJduR_GHvqiZrUNiAQANLbxXB9U-gsy1Hf8jM9zJDemFqUmzyYeWdzJQ5eJcndmPd_Bt2f0',
    price: 429000,
    quantity: 2
  }
]

function formatPrice(value: number) {
  return `${new Intl.NumberFormat('vi-VN').format(value)}đ`
}

export function CheckoutPage() {
  const { t } = useTranslation('products')
  const subtotal = useMemo(() => CHECKOUT_ITEMS.reduce((total, item) => total + item.price * item.quantity, 0), [])

  return (
    <div className='flex min-h-screen flex-col bg-background text-foreground'>
      <SiteHeader />
      <main className='mx-auto w-full max-w-6xl flex-1 px-4 py-10 pb-24 md:px-6 md:py-12'>
        <div className='grid grid-cols-1 gap-8 lg:grid-cols-12'>
          <div className='flex flex-col gap-8 lg:col-span-8'>
            <h1 className='font-display text-3xl font-bold text-primary md:text-5xl'>{t('checkout.title')}</h1>
            <CheckoutShippingForm />
            <CheckoutDeliveryMethods formatPrice={formatPrice} />
            <CheckoutPaymentMethods />
            <CheckoutNote />
          </div>

          <div className='lg:col-span-4'>
            <CheckoutOrderSummary items={CHECKOUT_ITEMS} subtotal={subtotal} formatPrice={formatPrice} />
          </div>
        </div>
      </main>
      <SiteFooter />
      <SiteBottomNav />
      <SiteFab />
    </div>
  )
}
