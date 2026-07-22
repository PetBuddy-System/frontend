import { useEffect, useMemo, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { CartItemsList, type CartItem } from '../components/cart/cart-items-list'
import { CartOrderSummary } from '../components/cart/cart-order-summary'
import { AdjustedQuantityModal } from '../components/checkout/adjusted-quantity-modal'
import { SiteBottomNav, SiteFab, SiteFooter, SiteHeader } from '~/shared/components'
import { useCart } from '~/providers/cart-provider'
import { MaterialIcon } from '~/shared/ui'
import { getCartApi, updateCartItemApi, removeCartItemApi } from '../services'
import type { CartItemResponse } from '~/shared/lib/cart'
import { guestCart } from '~/shared/lib/cart'
import { isLoggedIn } from '~/features/products/services/cart/cart-api'

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

  const [adjustedItem, setAdjustedItem] = useState<CartItemResponse | null>(null)

  const fetchCart = useCallback(async () => {
    try {
      setError(null)
      if (isLoggedIn()) {
        const cart = await getCartApi()
        setCartItems(cart.cartItems ?? [])
      } else {
        const guestItems = guestCart.getAll()
        setCartItems(
          guestItems.map((i) => ({
            cartItemId: i.cartItemId,
            productId: i.productId,
            productName: i.productName,
            description: undefined,
            price: i.price,
            salePrice: i.salePrice ?? null,
            quantity: i.quantity,
            imageUrl: i.imageUrl,
            subtotal: i.subtotal
          }))
        )
      }
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
      description: item.description,
      category: '',
      image: item.imageUrl || CART_PLACEHOLDER_IMAGE,
      price: item.price,
      salePrice: item.salePrice,
      quantity: item.quantity,
      subtotal: item.subtotal
    }))
  }, [cartItems])

  const subtotal = useMemo(() => {
    return cartItems.reduce((total, item) => {
      const effectivePrice = item.salePrice != null && item.salePrice < item.price ? item.salePrice : item.price
      return total + effectivePrice * item.quantity
    }, 0)
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
      const updated = await updateCartItemApi(item.cartItemId, { quantity: item.quantity + 1 })
      await fetchCart()

      // Server đã tự giới hạn số lượng do không đủ tồn kho → hỏi lại người dùng
      if (updated?.adjusted) {
        setAdjustedItem(updated)
      }
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

  /** User đồng ý giữ sản phẩm với số lượng đã bị giảm */
  function handleAdjustedConfirm() {
    setAdjustedItem(null)
  }

  /** User từ chối → xóa sản phẩm khỏi giỏ hàng */
  async function handleAdjustedDecline() {
    if (!adjustedItem) return
    setIsMutating(true)

    try {
      await removeCartItemApi(adjustedItem.cartItemId)
      await fetchCart()
    } catch {
      setError('Không thể xoá sản phẩm.')
    } finally {
      setIsMutating(false)
      setAdjustedItem(null)
    }
  }

  if (isLoading) {
    return (
      <div className='flex min-h-screen flex-col bg-background text-foreground'>
        <SiteHeader />
        <main className='mx-auto flex w-full max-w-6xl flex-1 items-center justify-center px-4 py-10 pb-24 md:px-6 md:py-12'>
          <p className='text-sm text-muted-foreground'>{t('cart.loading', 'Đang tải giỏ hàng...')}</p>
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
        <h1 className='mb-10 font-display text-3xl font-bold text-primary md:text-5xl'>{t('cart.title')}</h1>

        <a className='inline-flex items-center text-primary font-semibold hover:underline gap-2 mt-4' href='/products'>
          <MaterialIcon name='arrow_back' className='text-[18px]' />
          {t('cart.continueShopping', 'Tiếp tục mua sắm')}
        </a>
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
              />
            </div>
          </div>
        )}
      </main>

      <SiteFooter />
      <SiteBottomNav />
      <SiteFab />

      {adjustedItem && (
        <AdjustedQuantityModal
          productName={adjustedItem.productName}
          newQuantity={adjustedItem.quantity}
          onConfirm={handleAdjustedConfirm}
          onDecline={handleAdjustedDecline}
        />
      )}
    </div>
  )
}
