import { env } from '~/shared/config/env'
import { customFetch } from '~/api/mutator/custom-fetch'
import { readStorage } from '~/shared/lib/storage'
import { STORAGE_KEYS } from '~/shared/config/site'
import { guestCart } from '~/shared/lib/guest-cart'
import type {CartResponse,AddToCartRequest,UpdateCartItemRequest,MergeCartRequest,} from '~/shared/lib/cart'

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

const CART_BASE_URL = `${env.API_URL}${env.API_CART_PATH}`

function isLoggedIn(): boolean {
  return !!readStorage(STORAGE_KEYS.accessToken)
}

export async function getCartApi(): Promise<CartResponse> {
  if (!isLoggedIn()) {
    return { userId: '', items: guestCart.getAll() }
  }
  const response = await customFetch<ApiResponse<CartResponse>>({
    url: CART_BASE_URL,
    method: 'GET',
  })
  return response.data
}

export async function addToCartApi(
  request: AddToCartRequest & { productName?: string; price?: number }
): Promise<void> {
  if (!isLoggedIn()) {
    if (request.productName === undefined || request.price === undefined) {
      throw new Error('productName và price là bắt buộc khi add to cart lúc chưa đăng nhập')
    }
    guestCart.add({
      productId: request.productId,
      quantity: request.quantity,
      productName: request.productName,
      price: request.price,
    })
    return
  }
  await customFetch<ApiResponse<void>>({
    url: `${CART_BASE_URL}/items`,
    method: 'POST',
    data: { productId: request.productId, quantity: request.quantity },
  })
}

export async function updateCartItemApi(
  cartItemId: string,
  request: UpdateCartItemRequest
): Promise<void> {
  if (!isLoggedIn()) {
    guestCart.update(cartItemId, request)
    return
  }
  await customFetch<ApiResponse<void>>({
    url: `${CART_BASE_URL}/items/${cartItemId}`,
    method: 'PUT',
    data: request,
  })
}

export async function removeCartItemApi(productId: string): Promise<void> {
  if (!isLoggedIn()) {
    guestCart.remove(productId)
    return
  }
  await customFetch<ApiResponse<void>>({
    url: `${CART_BASE_URL}/items/${productId}`,
    method: 'DELETE',
  })
}

export async function clearCartApi(): Promise<void> {
  if (!isLoggedIn()) {
    guestCart.clear()
    return
  }
  await customFetch<ApiResponse<void>>({
    url: CART_BASE_URL,
    method: 'DELETE',
  })
}

/** Gọi ngay sau khi login thành công, để gộp guest cart vào cart của user. */
export async function mergeCartApi(): Promise<CartResponse> {
  const guestItems = guestCart.getAll()
  if (guestItems.length === 0) {
    const response = await customFetch<ApiResponse<CartResponse>>({
      url: CART_BASE_URL,
      method: 'GET',
    })
    return response.data
  }

  const request: MergeCartRequest = {
    items: guestItems.map((item) => ({ productId: item.productId, quantity: item.quantity })),
  }

  const response = await customFetch<ApiResponse<CartResponse>>({
    url: `${CART_BASE_URL}/merge`,
    method: 'POST',
    data: request,
  })

  guestCart.clear()
  return response.data
}