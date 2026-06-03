import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { CartItemsList, type CartItem } from '../components/cart/cart-items-list'
import { CartOrderSummary } from '../components/cart/cart-order-summary'
import { CartSuggestions, type CartSuggestion } from '../components/cart/cart-suggestions'
import { SiteBottomNav } from '~/shared/components'
import { SiteFab } from '~/shared/components'
import { SiteFooter } from '~/shared/components'
import { SiteHeader } from '~/shared/components'

const CART_ITEMS: CartItem[] = [
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

const SUGGESTIONS: CartSuggestion[] = [
  {
    key: 'treats',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAh0Mt6FVKZtoZIl8hmpDSsxvCx6L1TKQ5qRwm5_xTvWTzzLlj7EtK3CNi6AhdkRuvKbRyHbsNB5dztwxU6jm02uBewG26QLu7OaxUSiIlAJQhPWrynOSWUA-Guyf10N2WqYv6P0vlXRH3ysKcNaOJBqtpA7ps8SkLZ29t0qWni6O08YfwgfbBj6D9iUa_dJVW_LiuRiafZIH6qH5mFE8QScPIBVwX4X7DD3UlqQ7WMB018sLlXjvONm_qgeSyKre1OEWq3cTz_WmA',
    price: 85000
  },
  {
    key: 'ropeToy',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBDBudYeLKEdmwXy5PdXabk8pPTMta8e7woVqNCjuh0usqTa-LdUolvcpn5xIp58m9-fxYDg08HC25OVOyyTm0A2P_U0dRcnxqkxwD_WtCIvzYhi1TVXgsy4mCCR1rsaneVLsb5s-oMVCr_odxoOmtulAccheNytvG_cCo3qodaRqZANN4eWvDe3OlQyuVCcPHDxF_w18oepm-IbIcQbT4ISlc6pN7JkE3-kjBUuMPHrU0Z-vgFVaLNCV4UP6OXv_LPiE3iAP9Z4GQ',
    price: 120000
  },
  {
    key: 'leatherCollar',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuArwBf7UHSiWPAQRs5-02N0HWuz9jmofJ_e9rICLQSIynaGrkRm9_wTgtmtrUBWscRJQBd43haD1tm4ioBGU3qorsnaVx-RU2hrwsR9bExWLMF9T3KAAdNWnO5lb9VCEEjWW2YWulkiJCzGmt2aFEpp8c9b0uZ90TVH1aWMEv8okZogchwFlsgE2NCJchSJwde3eWVXTeXJ4ZCaxtoPSt067ALgjO05337NHrAsSMiLZnRfB742vKPXoFcDPA6JYNGPnNKU9Vg8VFU',
    price: 350000
  },
  {
    key: 'ceramicBowl',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCdf_YqJ2ZfNOBKzXiCy-IHUrXjgLClIzIZjWt5VdZeJxG7bQlU1PbcRbDZ_zQmH3aWpJk4irp1xMUeoZ-pLONJMBYzQU85Cx31mmUHkr-Ur007CEVRPFOeLH0NFcFrzVyac31YUC7kd1mygBsnJN4RgRnDeuKsaVJqQ1fLiJVw0jBLAG1W86sfcWk5SbeJSd3zAC_IOHm2n9qFzekhtpmKkDRD_svrOvkyrva-DYE377-MJDQEghzzAuGlG2rlLxoLZDNvaatDSfM',
    price: 215000
  }
]

function formatPrice(value: number) {
  return `${new Intl.NumberFormat('vi-VN').format(value)}đ`
}

export function CartPage() {
  const { t } = useTranslation('products')
  const [items, setItems] = useState<CartItem[]>(CART_ITEMS)

  const subtotal = useMemo(() => items.reduce((total, item) => total + item.price * item.quantity, 0), [items])
  const itemCount = useMemo(() => items.reduce((total, item) => total + item.quantity, 0), [items])

  function updateQuantity(key: string, direction: 1 | -1) {
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.key === key ? { ...item, quantity: Math.max(1, item.quantity + direction) } : item
      )
    )
  }

  return (
    <div className='flex min-h-screen flex-col bg-background text-foreground'>
      <SiteHeader />
      <main className='mx-auto w-full max-w-6xl flex-1 px-4 py-10 pb-24 md:px-6 md:py-12'>
        <h1 className='mb-10 font-display text-3xl font-bold text-primary md:text-5xl'>{t('cart.title')}</h1>

        <div className='grid grid-cols-1 items-start gap-6 lg:grid-cols-12'>
          <CartItemsList
            items={items}
            formatPrice={formatPrice}
            onDecrease={(key) => updateQuantity(key, -1)}
            onIncrease={(key) => updateQuantity(key, 1)}
          />
          <CartOrderSummary itemCount={itemCount} subtotal={subtotal} formatPrice={formatPrice} />
        </div>

        <CartSuggestions items={SUGGESTIONS} formatPrice={formatPrice} />
      </main>
      <SiteFooter />
      <SiteBottomNav />
      <SiteFab />
    </div>
  )
}
