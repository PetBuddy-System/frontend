export interface CartItemResponse {
  cartItemId: string
  productId: string
  productName: string
  imageUrl: string
  price: number
  salePrice?: number | null
  description?: string
  quantity: number
  subtotal: number
  adjusted?: boolean
}

export interface CartResponse {
  userId: string
  cartItems: CartItemResponse[]
}

export interface AddToCartRequest {
  productId: string
  quantity: number
}

export interface UpdateCartItemRequest {
  quantity: number
  acceptPriceChange?: boolean
}

export interface MergeCartRequest {
  items: AddToCartRequest[]
}

// ─── Guest Cart (localStorage, unauthenticated users) ──────────────────────────

const GUEST_CART_KEY = 'petbuddy_guest_cart'

function _readGuestCart(): CartItemResponse[] {
  try {
    if (typeof window === 'undefined') return []
    const raw = localStorage.getItem(GUEST_CART_KEY)
    return raw ? (JSON.parse(raw) as CartItemResponse[]) : []
  } catch {
    return []
  }
}

function _writeGuestCart(items: CartItemResponse[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items))
}

export const guestCart = {
  getAll(): CartItemResponse[] {
    return _readGuestCart()
  },

  add(
    request: AddToCartRequest & { productName: string; price: number; imageUrl: string }
  ): CartItemResponse[] {
    const items = _readGuestCart()
    const existing = items.find((i) => i.productId === request.productId)

    if (existing) {
      existing.quantity += request.quantity
      existing.price = request.price
      existing.imageUrl = request.imageUrl
      existing.productName = request.productName
      existing.subtotal = existing.price * existing.quantity
    } else {
      items.push({
        cartItemId: request.productId,
        productId: request.productId,
        productName: request.productName,
        price: request.price,
        quantity: request.quantity,
        imageUrl: request.imageUrl,
        subtotal: request.price * request.quantity,
      })
    }

    _writeGuestCart(items)
    return items
  },

  update(cartItemId: string, request: UpdateCartItemRequest): CartItemResponse[] {
    const items = _readGuestCart().map((item) =>
      item.cartItemId === cartItemId
        ? { ...item, quantity: request.quantity, subtotal: item.price * request.quantity }
        : item
    )
    _writeGuestCart(items)
    return items
  },

  remove(productId: string): CartItemResponse[] {
    const items = _readGuestCart().filter((item) => item.productId !== productId)
    _writeGuestCart(items)
    return items
  },

  clear(): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem(GUEST_CART_KEY)
  },

  isEmpty(): boolean {
    return _readGuestCart().length === 0
  },
}
