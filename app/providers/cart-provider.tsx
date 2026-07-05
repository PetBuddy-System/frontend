import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { axiosInstance } from '~/api/mutator/custom-fetch'
import { env } from '~/shared/config/env'
import { STORAGE_KEYS } from '~/shared/config/site'
import { readStorage } from '~/shared/lib/storage'
import { guestCart } from '~/shared/lib/guest-cart'
import { useAuth } from './auth-provider'

// ─── Types ──────────────────────────────────────────────────────────────────────

interface CartContextValue {
  cartCount: number
  totalItems: number
  isLoading: boolean
  refreshCart: () => Promise<void>
  refetchCart: () => Promise<void>
}

// ─── Context ────────────────────────────────────────────────────────────────────

const CartContext = createContext<CartContextValue | undefined>(undefined)

// ─── Provider ───────────────────────────────────────────────────────────────────

export function CartProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth()
  const [cartCount, setCartCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  const refreshCart = useCallback(async () => {
    // Check if token exists in localStorage (direct or via STORAGE_KEYS)
    const token = readStorage(STORAGE_KEYS.accessToken) || localStorage.getItem('accessToken')
    const isLoggedIn = isAuthenticated || !!token

    if (!isLoggedIn) {
      // Guest cart: read from localStorage
      const guestItems = guestCart.getAll()
      const count = guestItems.reduce((sum, item) => sum + item.quantity, 0)
      setCartCount(count)
      return
    }

    // Logged-in cart: query from backend using axiosInstance
    setIsLoading(true)
    try {
      const res = await axiosInstance.get(`${env.API_CART_PATH}`)
      const data = res.data?.data ?? res.data
      const items: Array<{ quantity: number }> = data?.cartItems ?? data?.items ?? []
      const count = items.reduce((sum, item) => sum + item.quantity, 0)
      setCartCount(count)
    } catch (err) {
      console.error('Failed to fetch cart count:', err)
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

// ─── Hook ───────────────────────────────────────────────────────────────────────

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
