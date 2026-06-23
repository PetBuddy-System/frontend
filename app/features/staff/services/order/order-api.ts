/**
 * Staff feature — order API service.
 * Chứa tất cả order-related API functions cho staff pages.
 */

import { env } from '~/shared/config/env'
import { customFetch } from '~/api/mutator/custom-fetch'
import type {
  OrderStatus,
  PickingItemResponse,
  ApiResponse,
  PageResponse,
  PageableParams,
  StaffOrderResponse
} from '~/shared/lib/order'

const ORDER_BASE_URL = `${env.API_URL}${env.API_ORDERS_PATH}`

export async function fetchAllOrdersApi(
  params: PageableParams = {}
): Promise<ApiResponse<PageResponse<StaffOrderResponse>>> {
  const { page, size, sort } = params

  return customFetch<ApiResponse<PageResponse<StaffOrderResponse>>>({
    url: `${ORDER_BASE_URL}/all`,
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

export async function fetchPickingListApi(orderId: number): Promise<ApiResponse<PickingItemResponse[]>> {
  return customFetch<ApiResponse<PickingItemResponse[]>>({
    url: `${ORDER_BASE_URL}/${orderId}/picking-list`,
    method: 'GET'
  })
}
