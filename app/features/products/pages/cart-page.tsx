/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { CartItemsList, type CartItem } from '../components/cart/cart-items-list'
import { CartOrderSummary } from '../components/cart/cart-order-summary'
import { SiteBottomNav, SiteFab, SiteFooter, SiteHeader } from '~/shared/components'
import { useCart } from '~/providers/cart-provider'
import { MaterialIcon } from '~/shared/ui'
import {
  getCartApi,
  updateCartItemApi,
  removeCartItemApi,
  clearCartApi,
} from '../services'
import type { CartItemResponse } from '~/shared/lib/cart'


const CART_PLACEHOLDER_IMAGE = 'https://placehold.co/300x300?text=PetBuddy'


function formatPrice(value: number) {
  return `${new Intl.NumberFormat('vi-VN').format(value)}đ`
}


export function CartPage() {
  const { t } = useTranslation('products')
  const { refetchCart } = useCart()

  const [cartItems, setCartItems] = useState<CartItemResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isMutating, setIsMutating] = useState(false)
  const [error, setError] = useState<string | null>(null)


  const fetchCart = useCallback(async () => {
    try {
      setError(null)
      const cart = await getCartApi()
      setCartItems(cart.cartItems ?? [])
      await refetchCart()
    } catch {
      setError('Không thể tải giỏ hàng. Vui lòng thử lại.')
    } finally {
      setIsLoading(false)
    }
  }, [refetchCart])

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
      await removeCartItemApi(item.cartItemId)
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
      await refetchCart()
    } catch {
      setError('Không thể xoá giỏ hàng.')
    } finally {
      setIsMutating(false)
    }
  }

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

        <div className='mb-6'>
          <a
            className='inline-flex items-center gap-2 font-bold text-primary transition-transform hover:-translate-x-1'
            href='/products'
          >
            <MaterialIcon name='arrow_back' className='text-[20px]' />
            {t('cart.continueShopping')}
          </a>
        </div>

        {error && (
          <div className='mb-6 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive'>
            {error}
          </div>
        )}

        {cartItems.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-20 text-center rounded-2xl border border-border/60 bg-card p-8 shadow-sm'>
            <div className='mb-4 rounded-full bg-primary/10 p-5 text-primary'>
              <MaterialIcon name='shopping_cart_checkout' className='text-[48px]' />
            </div>
            <h2 className='text-lg font-bold mb-2 text-foreground'>Giỏ hàng trống</h2>
            <p className='mb-6 text-sm text-muted-foreground max-w-sm'>
              Không có sản phẩm nào trong giỏ hàng. Bấm quay lại để mua sắm
            </p>
            <a
              href='/products'
              className='inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground shadow transition hover:opacity-90 active:scale-95'
            >
              <MaterialIcon name='arrow_back' className='text-[18px]' />
              <span>Quay lại mua sắm</span>
            </a>
          </div>
        ) : (
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
        )}

      </main>

      <SiteFooter />
      <SiteBottomNav />
      <SiteFab />
    </div>
  )
}