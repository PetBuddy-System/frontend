import type { CartItemResponse, AddToCartRequest, UpdateCartItemRequest } from './cart'

const GUEST_CART_KEY = 'petbuddy_guest_cart'

function readRaw(): CartItemResponse[] {
  try {
    const raw = localStorage.getItem(GUEST_CART_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function writeRaw(items: CartItemResponse[]) {
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items))
}

function buildSubtotal(price: number, quantity: number) {
  return price * quantity
}

export const guestCart = {
  getAll(): CartItemResponse[] {
    return readRaw()
  },

  add(request: AddToCartRequest & {
  productName: string
  price: number
  salePrice?: number | null
  imageUrl: string
  description?: string
}) {
  const items = readRaw()
  const existing = items.find((i) => i.productId === request.productId)

  if (existing) {
    existing.quantity += request.quantity
    existing.price = request.price
    existing.salePrice = request.salePrice ?? null
    existing.imageUrl = request.imageUrl
    existing.productName = request.productName
    existing.description = request.description
    existing.subtotal = buildSubtotal(
      request.salePrice != null && request.salePrice < request.price ? request.salePrice : request.price,
      existing.quantity
    )
  } else {
    const effectivePrice = request.salePrice != null && request.salePrice < request.price ? request.salePrice : request.price
    items.push({
      cartItemId: request.productId,
      productId: request.productId,
      productName: request.productName,
      description: request.description,
      price: request.price,
      salePrice: request.salePrice ?? null,
      quantity: request.quantity,
      imageUrl: request.imageUrl,
      subtotal: buildSubtotal(effectivePrice, request.quantity),
    })
  }

  writeRaw(items)
  return items
},

  update(cartItemId: string, request: UpdateCartItemRequest) {
    const items = readRaw().map((item) =>
      item.cartItemId === cartItemId
        ? { ...item, quantity: request.quantity, subtotal: buildSubtotal(item.price, request.quantity) }
        : item
    )
    writeRaw(items)
    return items
  },

  remove(productId: string) {
    const items = readRaw().filter((item) => item.productId !== productId)
    writeRaw(items)
    return items
  },

  clear() {
    localStorage.removeItem(GUEST_CART_KEY)
  },

  isEmpty(): boolean {
    return readRaw().length === 0
  },
}