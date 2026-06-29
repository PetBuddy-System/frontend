import { http, HttpResponse } from 'msw'
import { env } from '~/shared/config/env'
import { createCart, createCartItem } from '../factories/cart.factory'
import type { CartResponse, CartItemResponse } from '~/shared/lib/cart'

const BASE = env.API_URL || ''
const CART_PATH = env.API_CART_PATH || '/api/cart'
const CART_URL = `${BASE}${CART_PATH}`

// Giỏ hàng in-memory cho MSW (reset khi reload)
let mockCart: CartResponse = createCart()

function ok<T>(data: T) {
  return HttpResponse.json({ success: true, message: 'OK', data })
}

export const cartHandlers = [
  // GET /api/cart — lấy giỏ hàng hiện tại
  http.get(CART_URL, () => {
    return ok(mockCart)
  }),

  // POST /api/cart/items — thêm sản phẩm vào giỏ hàng
  http.post(`${CART_URL}/items`, async ({ request }) => {
    const body = (await request.json()) as { productId: string; quantity: number }

    const existing = mockCart.cartItems.find((i) => i.productId === body.productId)
    if (existing) {
      existing.quantity += body.quantity
      existing.subtotal = existing.price * existing.quantity
    } else {
      const newItem: CartItemResponse = createCartItem({
        cartItemId: crypto.randomUUID(),
        productId: body.productId,
        quantity: body.quantity,
      })
      mockCart.cartItems.push(newItem)
    }

    return ok<null>(null)
  }),

  // PUT /api/cart/items/:cartItemId — cập nhật số lượng
  http.put(`${CART_URL}/items/:cartItemId`, async ({ params, request }) => {
    const { cartItemId } = params as { cartItemId: string }
    const body = (await request.json()) as { quantity: number }

    const item = mockCart.cartItems.find((i) => i.cartItemId === cartItemId)
    if (!item) {
      return HttpResponse.json(
        { success: false, message: 'Cart item not found', data: null },
        { status: 404 }
      )
    }

    item.quantity = body.quantity
    item.subtotal = item.price * body.quantity

    return ok<null>(null)
  }),

  // DELETE /api/cart/items/:cartItemId — xoá sản phẩm khỏi giỏ hàng
  http.delete(`${CART_URL}/items/:cartItemId`, ({ params }) => {
    const { cartItemId } = params as { cartItemId: string }
    const before = mockCart.cartItems.length
    mockCart.cartItems = mockCart.cartItems.filter((i) => i.cartItemId !== cartItemId)

    if (mockCart.cartItems.length === before) {
      return HttpResponse.json(
        { success: false, message: 'Cart item not found', data: null },
        { status: 404 }
      )
    }

    return ok<null>(null)
  }),

  // DELETE /api/cart — xoá toàn bộ giỏ hàng
  http.delete(CART_URL, () => {
    mockCart.cartItems = []
    return ok<null>(null)
  }),

  // POST /api/cart/merge — gộp guest cart vào cart sau khi đăng nhập
  http.post(`${CART_URL}/merge`, async ({ request }) => {
    const body = (await request.json()) as { items: { productId: string; quantity: number }[] }

    for (const guestItem of body.items) {
      const existing = mockCart.cartItems.find((i) => i.productId === guestItem.productId)
      if (existing) {
        existing.quantity += guestItem.quantity
        existing.subtotal = existing.price * existing.quantity
      } else {
        mockCart.cartItems.push(
          createCartItem({
            cartItemId: crypto.randomUUID(),
            productId: guestItem.productId,
            quantity: guestItem.quantity,
          })
        )
      }
    }

    return ok(mockCart)
  }),
]
