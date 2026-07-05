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
