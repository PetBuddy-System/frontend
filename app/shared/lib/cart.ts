/**
 * Cart types — chỉ chứa types/interfaces, không có API functions.
 * API functions nằm trong features/services/.
 */

export interface CartItemResponse {
  cartItemId: string
  productId: string
  productName: string
  imageUrl: string
  price: number
  quantity: number
  subtotal: number
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
