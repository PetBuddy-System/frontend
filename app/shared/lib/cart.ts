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
    request: AddToCartRequest & {
      productName: string
      price: number
      salePrice?: number | null
      imageUrl: string
    }
  ): CartItemResponse[] {
    const items = _readGuestCart()
    const existing = items.find((i) => i.productId === request.productId)

    const effectivePrice =
      request.salePrice != null && request.salePrice < request.price
        ? request.salePrice
        : request.price

    if (existing) {
      existing.quantity += request.quantity
      existing.price = request.price
      existing.salePrice = request.salePrice ?? null
      existing.imageUrl = request.imageUrl
      existing.productName = request.productName
      existing.subtotal = effectivePrice * existing.quantity
    } else {
      items.push({
        cartItemId: request.productId,
        productId: request.productId,
        productName: request.productName,
        price: request.price,
        salePrice: request.salePrice ?? null,
        quantity: request.quantity,
        imageUrl: request.imageUrl,
        subtotal: effectivePrice * request.quantity,
      })
    }

    _writeGuestCart(items)
    return items
  },

  update(cartItemId: string, request: UpdateCartItemRequest): CartItemResponse[] {
    const items = _readGuestCart().map((item) => {
      if (item.cartItemId !== cartItemId) return item
      const effectivePrice =
        item.salePrice != null && item.salePrice < item.price ? item.salePrice : item.price
      return { ...item, quantity: request.quantity, subtotal: effectivePrice * request.quantity }
    })
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
