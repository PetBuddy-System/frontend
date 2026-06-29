import { useEffect, useMemo, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { CartItemsList, type CartItem } from '../components/cart/cart-items-list'
import { CartOrderSummary } from '../components/cart/cart-order-summary'
import { CartSuggestions, type CartSuggestion } from '../components/cart/cart-suggestions'
import { SiteBottomNav, SiteFab, SiteFooter, SiteHeader } from '~/shared/components'
import {
  getCartApi,
  updateCartItemApi,
  removeCartItemApi,
  clearCartApi,
} from '../services/cart'
import type { CartItemResponse } from '~/shared/lib/cart'

// ─── Constants ───────────────────────────────────────────────────────────────

// const SUGGESTIONS: CartSuggestion[] = [
//   {
//     key: 'treats',
//     image:
//       'https://lh3.googleusercontent.com/aida-public/AB6AXuAh0Mt6FVKZtoZIl8hmpDSsxvCx6L1TKQ5qRwm5_xTvWTzzLlj7EtK3CNi6AhdkRuvKbRyHbsNB5dztwxU6jm02uBewG26QLu7OaxUSiIlAJQhPWrynOSWUA-Guyf10N2WqYv6P0vlXRH3ysKcNaOJBqtpA7ps8SkLZ29t0qWni6O08YfwgfbBj6D9iUa_dJVW_LiuRiafZIH6qH5mFE8QScPIBVwX4X7DD3UlqQ7WMB018sLlXjvONm_qgeSyKre1OEWq3cTz_WmA',
//     price: 85000,
//   },
//   {
//     key: 'ropeToy',
//     image:
//       'https://lh3.googleusercontent.com/aida-public/AB6AXuBDBudYeLKEdmwXy5PdXabk8pPTMta8e7woVqNCjuh0usqTa-LdUolvcpn5xIp58m9-fxYDg08HC25OVOyyTm0A2P_U0dRcnxqkxwD_WtCIvzYhi1TVXgsy4mCCR1rsaneVLsb5s-oMVCr_odxoOmtulAccheNytvG_cCo3qodaRqZANN4eWvDe3OlQyuVCcPHDxF_w18oepm-IbIcQbT4ISlc6pN7JkE3-kjBUuMPHrU0Z-vgFVaLNCV4UP6OXv_LPiE3iAP9Z4GQ',
//     price: 120000,
//   },
//   {
//     key: 'leatherCollar',
//     image:
//       'https://lh3.googleusercontent.com/aida-public/AB6AXuArwBf7UHSiWPAQRs5-02N0HWuz9jmofJ_e9rICLQSIynaGrkRm9_wTgtmtrUBWscRJQBd43haD1tm4ioBGU3qorsnaVx-RU2hrwsR9bExWLMF9T3KAAdNWnO5lb9VCEEjWW2YWulkiJCzGmt2aFEpp8c9b0uZ90TVH1aWMEv8okZogchwFlsgE2NCJchSJwde3eWVXTeXJ4ZCaxtoPSt067ALgjO05337NHrAsSMiLZnRfB742vKPXoFcDPA6JYNGPnNKU9Vg8VFU',
//     price: 350000,
//   },
//   {
//     key: 'ceramicBowl',
//     image:
//       'https://lh3.googleusercontent.com/aida-public/AB6AXuCdf_YqJ2ZfNOBKzXiCy-IHUrXjgLClIzIZjWt5VdZeJxG7bQlU1PbcRbDZ_zQmH3aWpJk4irp1xMUeoZ-pLONJMBYzQU85Cx31mmUHkr-Ur007CEVRPFOeLH0NFcFrzVyac31YUC7kd1mygBsnJN4RgRnDeuKsaVJqQ1fLiJVw0jBLAG1W86sfcWk5SbeJSd3zAC_IOHm2n9qFzekhtpmKkDRD_svrOvkyrva-DYE377-MJDQEghzzAuGlG2rlLxoLZDNvaatDSfM',
//     price: 215000,
//   },
// ]

const CART_PLACEHOLDER_IMAGE = 'https://placehold.co/300x300?text=PetBuddy'


function formatPrice(value: number) {
  return `${new Intl.NumberFormat('vi-VN').format(value)}đ`
}


export function CartPage() {
  const { t } = useTranslation('products')

  const [cartItems, setCartItems] = useState<CartItemResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isMutating, setIsMutating] = useState(false)
  const [error, setError] = useState<string | null>(null)


  const fetchCart = useCallback(async () => {
    try {
      setError(null)
      const cart = await getCartApi()
      setCartItems(cart.items ?? [])
    } catch {
      setError('Không thể tải giỏ hàng. Vui lòng thử lại.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCart()
  }, [fetchCart])

  const items = useMemo<CartItem[]>(() => {
    return cartItems.map((item) => ({
      key: item.cartItemId,
      cartItemId: item.cartItemId,
      productId: item.productId,
      title: item.productName,
      category: '',
      image: item.imageUrl || CART_PLACEHOLDER_IMAGE,
      price: item.price,
      quantity: item.quantity,
    }))
  }, [cartItems])

  const subtotal = useMemo(() => {
    return cartItems.reduce((total, item) => total + item.subtotal, 0)
  }, [cartItems])

  const itemCount = useMemo(() => {
    return cartItems.reduce((total, item) => total + item.quantity, 0)
  }, [cartItems])


  async function handleDecrease(item: CartItem) {
    if (item.quantity <= 1 || isMutating) return
    setIsMutating(true)

    try {
      await updateCartItemApi(item.cartItemId, { quantity: item.quantity - 1 })
      await fetchCart()
    } catch {
      setError('Không thể cập nhật số lượng.')
    } finally {
      setIsMutating(false)
    }
  }

  async function handleIncrease(item: CartItem) {
    if (isMutating) return
    setIsMutating(true)

    try {
      await updateCartItemApi(item.cartItemId, { quantity: item.quantity + 1 })
      await fetchCart()
    } catch {
      setError('Không thể cập nhật số lượng.')
    } finally {
      setIsMutating(false)
    }
  }

  async function handleRemove(item: CartItem) {
    if (isMutating) return
    setIsMutating(true)

    try {
      await removeCartItemApi(item.productId)
      await fetchCart()
    } catch {
      setError('Không thể xoá sản phẩm.')
    } finally {
      setIsMutating(false)
    }
  }

  async function handleClearCart() {
    if (isMutating) return
    setIsMutating(true)

    try {
      await clearCartApi()
      setCartItems([])
    } catch {
      setError('Không thể xoá giỏ hàng.')
    } finally {
      setIsMutating(false)
    }
  }

  // ─── Render ─────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className='flex min-h-screen flex-col bg-background text-foreground'>
        <SiteHeader />
        <main className='mx-auto flex w-full max-w-6xl flex-1 items-center justify-center px-4 py-10 pb-24 md:px-6 md:py-12'>
          <p className='text-sm text-muted-foreground'>
            {t('cart.loading', 'Đang tải giỏ hàng...')}
          </p>
        </main>
        <SiteFooter />
        <SiteBottomNav />
        <SiteFab />
      </div>
    )
  }

  return (
    <div className='flex min-h-screen flex-col bg-background text-foreground'>
      <SiteHeader />

      <main className='mx-auto w-full max-w-6xl flex-1 px-4 py-10 pb-24 md:px-6 md:py-12'>
        <h1 className='mb-10 font-display text-3xl font-bold text-primary md:text-5xl'>
          {t('cart.title')}
        </h1>

        {/* Error banner */}
        {error && (
          <div className='mb-6 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive'>
            {error}
          </div>
        )}

        <div className='grid grid-cols-1 items-start gap-6 lg:grid-cols-12'>
          <CartItemsList
            items={items}
            formatPrice={formatPrice}
            isMutating={isMutating}
            onDecrease={async (key) => {
              const target = items.find((i) => i.key === key)
              if (!target) return
              await handleDecrease(target)
            }}
            onIncrease={async (key) => {
              const target = items.find((i) => i.key === key)
              if (!target) return
              await handleIncrease(target)
            }}
            onRemove={async (item) => {
              await handleRemove(item)
            }}
          />

          <div className='space-y-4 lg:col-span-4'>
            <CartOrderSummary
              itemCount={itemCount}
              subtotal={subtotal}
              formatPrice={formatPrice}
              isMutating={isMutating}
              onClearCart={handleClearCart}
            />
          </div>
        </div>

        {/* <CartSuggestions items={SUGGESTIONS} formatPrice={formatPrice} /> */}
      </main>

      <SiteFooter />
      <SiteBottomNav />
      <SiteFab />
    </div>
  )
}