/**
 * Products feature — cart API service.
 */

import { env } from '~/shared/config/env'
import { customFetch } from '~/api/mutator/custom-fetch'
import type { CartResponse, AddToCartRequest, UpdateCartItemRequest } from '~/shared/lib/cart'

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

const CART_BASE_URL = `${env.API_URL}${env.API_CART_PATH}`

export async function getCartApi(): Promise<CartResponse> {
  const response = await customFetch<ApiResponse<CartResponse>>({
    url: CART_BASE_URL,
    method: 'GET',
  })
  return response.data
}

export async function addToCartApi(request: AddToCartRequest): Promise<void> {
  await customFetch<ApiResponse<void>>({
    url: `${CART_BASE_URL}/items`,
    method: 'POST',
    data: request,
  })
}

export async function updateCartItemApi(
  cartItemId: string,
  request: UpdateCartItemRequest
): Promise<void> {
  await customFetch<ApiResponse<void>>({
    url: `${CART_BASE_URL}/items/${cartItemId}`,
    method: 'PUT',
    data: request,
  })
}

export async function removeCartItemApi(productId: string): Promise<void> {
  await customFetch<ApiResponse<void>>({
    url: `${CART_BASE_URL}/items/${productId}`,
    method: 'DELETE',
  })
}

export async function clearCartApi(): Promise<void> {
  await customFetch<ApiResponse<void>>({
    url: CART_BASE_URL,
    method: 'DELETE',
  })
}
