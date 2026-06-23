/**
 * Products feature — order API service.
 * Chứa tất cả order-related API functions cho customer-facing pages.
 */

import { env } from '~/shared/config/env'
import { customFetch } from '~/api/mutator/custom-fetch'
import type {
  CreateOrderRequest,
  OrderResponse,
  ApiResponse,
  PageResponse,
  PageableParams
} from '~/shared/lib/order'

const ORDER_BASE_URL = `${env.API_URL}${env.API_ORDERS_PATH}`

export async function createOrderApi(data: CreateOrderRequest): Promise<ApiResponse<OrderResponse>> {
  return customFetch<ApiResponse<OrderResponse>>({
    url: ORDER_BASE_URL,
    method: 'POST',
    data
  })
}

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

export async function fetchOrderByIdApi(orderId: number): Promise<ApiResponse<OrderResponse>> {
  return customFetch<ApiResponse<OrderResponse>>({
    url: `${ORDER_BASE_URL}/${orderId}`,
    method: 'GET'
  })
}
