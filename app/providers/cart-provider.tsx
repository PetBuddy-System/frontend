import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { axiosInstance } from '~/api/mutator/custom-fetch'
import { env } from '~/shared/config/env'
import { STORAGE_KEYS } from '~/shared/config/site'
import { readStorage, removeStorage } from '~/shared/lib/storage'
import { guestCart } from '~/shared/lib/cart'
import { useAuth } from './auth-provider'

interface CartContextValue {
  cartCount: number
  totalItems: number
  isLoading: boolean
  refreshCart: () => Promise<void>
  refetchCart: () => Promise<void>
}

const CartContext = createContext<CartContextValue | undefined>(undefined)

function getGuestCount() {
  return guestCart.getAll().reduce((sum, item) => sum + item.quantity, 0)
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth()
  const [cartCount, setCartCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  const refreshCart = useCallback(async () => {
    const token = readStorage(STORAGE_KEYS.accessToken)
    const isLoggedIn = isAuthenticated || !!token

    if (!isLoggedIn) {
      setCartCount(getGuestCount())
      return
    }

    setIsLoading(true)
    try {
      const res = await axiosInstance.get(`${env.API_CART_PATH}`)
      const data = res.data?.data ?? res.data
      const items: Array<{ quantity: number }> = data?.cartItems ?? data?.items ?? []
      const count = items.reduce((sum, item) => sum + item.quantity, 0)
      setCartCount(count)
    } catch (err) {
      console.error('Failed to fetch cart count:', err)
      // Token có thể đã hết hạn/không hợp lệ → xoá token rác và fallback về guest cart
      // để tránh badge bị kẹt ở trạng thái sai
      removeStorage(STORAGE_KEYS.accessToken)
      setCartCount(getGuestCount())
    } finally {
      setIsLoading(false)
    }
  }, [isAuthenticated])

  useEffect(() => {
    refreshCart()
  }, [refreshCart])

  return (
    <CartContext.Provider
      value={{
        cartCount,
        totalItems: cartCount,
        isLoading,
        refreshCart,
        refetchCart: refreshCart
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}