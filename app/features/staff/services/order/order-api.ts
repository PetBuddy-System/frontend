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
  OrderResponse
} from '~/shared/lib/order'

const ORDER_BASE_URL = `${env.API_URL}${env.API_ORDERS_PATH}`

export async function fetchAllOrdersApi(
  params: PageableParams = {}
): Promise<ApiResponse<PageResponse<OrderResponse>>> {
  const { page, size, sort } = params

  return customFetch<ApiResponse<PageResponse<OrderResponse>>>({
    url: `${ORDER_BASE_URL}/all`,
    method: 'GET',
    params: { page, size, sort }
  })
}

export async function updateOrderStatusApi(
  orderId: number,
  status: OrderStatus,
  proofImage?: File
): Promise<ApiResponse<null>> {
  const formData = new FormData()
  if (proofImage) {
    formData.append('proofImage', proofImage)
  }

  return customFetch<ApiResponse<null>>({
    url: `${ORDER_BASE_URL}/${orderId}/status`,
    method: 'PATCH',
    params: { status },
    data: formData
  })
}
export async function fetchPickingListApi(orderId: number): Promise<ApiResponse<PickingItemResponse[]>> {
  return customFetch<ApiResponse<PickingItemResponse[]>>({
    url: `${ORDER_BASE_URL}/${orderId}/picking-list`,
    method: 'GET'
  })
}

export async function fetchOrderDetailApi(orderId: number): Promise<ApiResponse<unknown>> {
  return customFetch<ApiResponse<unknown>>({
    url: `${ORDER_BASE_URL}/${orderId}`,
    method: 'GET'
  })
}

export async function confirmRefundApi(
  orderId: number
): Promise<ApiResponse<any>> {
  return customFetch<ApiResponse<any>>({
    url: `${ORDER_BASE_URL}/${orderId}/cancel-confirm`,
    method: 'POST'
  })
}

export async function reportDeliveryFailedApi(
  orderId: number,
  reason: string
): Promise<ApiResponse<any>> {
  return customFetch<ApiResponse<any>>({
    url: `${ORDER_BASE_URL}/${orderId}/delivery-failed`,
    method: 'POST',
    data: { reason }
  })
}

export async function confirmReturnedToWarehouseApi(
  orderId: number
): Promise<ApiResponse<any>> {
  return customFetch<ApiResponse<any>>({
    url: `${ORDER_BASE_URL}/${orderId}/returned-to-warehouse`,
    method: 'POST'
  })
}

export async function coordinatorReportUnreachableApi(
  orderId: number,
  note: string
): Promise<ApiResponse<OrderResponse>> {
  return customFetch<ApiResponse<OrderResponse>>({
    url: `${ORDER_BASE_URL}/${orderId}/coordinator-report-unreachable`,
    method: 'POST',
    params: { note }
  })
}

export async function coordinatorNegotiateRedeliveryApi(
  orderId: number,
  negotiatedDate: string,
  note: string
): Promise<ApiResponse<OrderResponse>> {
  return customFetch<ApiResponse<OrderResponse>>({
    url: `${ORDER_BASE_URL}/${orderId}/coordinator-negotiate-redelivery`,
    method: 'POST',
    params: { negotiatedDate, note }
  })
}

