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

  /**
   * request cần kèm productName + price vì guest cart không gọi BE để tự tính —
   * FE phải tự truyền vào lúc gọi (lấy từ data sản phẩm đang hiển thị).
   */
  add(request: AddToCartRequest & { productName: string; price: number; imageUrl: string }) {
    const items = readRaw()
    const existing = items.find((i) => i.productId === request.productId)

    if (existing) {
      existing.quantity += request.quantity
      existing.subtotal = buildSubtotal(existing.price, existing.quantity)
    } else {
      items.push({
        cartItemId: request.productId, 
        productId: request.productId,
        productName: request.productName,
        price: request.price,
        quantity: request.quantity,
        imageUrl: request.imageUrl,
        subtotal: buildSubtotal(request.price, request.quantity),
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