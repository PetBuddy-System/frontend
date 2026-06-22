/**
 * Profile feature — order API service.
 * Chứa tất cả order-related API functions cho profile pages.
 */

import { env } from '~/shared/config/env'
import { customFetch } from '~/api/mutator/custom-fetch'
import type {
  OrderStatus,
  OrderResponse,
  ApiResponse,
  PageResponse,
  PageableParams
} from '~/shared/lib/order'

const ORDER_BASE_URL = `${env.API_URL}${env.API_ORDERS_PATH}`

export async function fetchMyOrdersApi(
  params: PageableParams = {}
): Promise<ApiResponse<PageResponse<OrderResponse>>> {
  const { page, size, sort } = params

  return customFetch<ApiResponse<PageResponse<OrderResponse>>>({
    url: ORDER_BASE_URL,
    method: 'GET',
    params: { page, size, sort }
  })
}

export async function updateOrderStatusApi(orderId: number, status: OrderStatus): Promise<ApiResponse<null>> {
  return customFetch<ApiResponse<null>>({
    url: `${ORDER_BASE_URL}/${orderId}/status`,
    method: 'PATCH',
    params: { status }
  })
}
