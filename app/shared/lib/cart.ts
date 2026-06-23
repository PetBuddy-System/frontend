import { env } from '~/shared/config/env'
import { customFetch } from '~/api/mutator/custom-fetch'

export interface CartItemResponse {
  cartItemId: string
  productId: string
  productName: string
  price: number
  quantity: number
  subtotal: number
}

export interface CartResponse {
  userId: string
  items: CartItemResponse[]
}

export interface AddToCartRequest {
  productId: string
  quantity: number
}

export interface UpdateCartItemRequest {
  quantity: number
  acceptPriceChange?: boolean
}

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

const CART_BASE_URL = `${env.API_URL}/api/cart`

export async function getCartApi(): Promise<CartResponse> {
  const response = await customFetch<ApiResponse<CartResponse>>({
    url: CART_BASE_URL,
    method: 'GET',
  })

  return response.data
}

export async function addToCartApi(
  request: AddToCartRequest,
): Promise<void> {
  await customFetch<ApiResponse<void>>({
    url: `${CART_BASE_URL}/items`,
    method: 'POST',
    data: request,
  })
}

export async function updateCartItemApi(
  cartItemId: string,
  request: UpdateCartItemRequest,
): Promise<void> {
  await customFetch<ApiResponse<void>>({
    url: `${CART_BASE_URL}/items/${cartItemId}`,
    method: 'PUT',
    data: request,
  })
}

export async function removeCartItemApi(cartItemId: string): Promise<void> {
  await customFetch<ApiResponse<void>>({
    url: `${CART_BASE_URL}/items/${cartItemId}`,
    method: 'DELETE',
  })
}

export async function clearCartApi(): Promise<void> {
  await customFetch<ApiResponse<void>>({
    url: CART_BASE_URL,
    method: 'DELETE',
  })
}