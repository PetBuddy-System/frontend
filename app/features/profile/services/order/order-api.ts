import { env } from '~/shared/config/env'
import { customFetch } from '~/api/mutator/custom-fetch'
import type {
  OrderStatus,
  OrderResponse,
  OrderDetailFull,
  ApiResponse,
  PageResponse,
  PageableParams,
  UpdateOrderRequest
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

export async function fetchOrderDetailApi(orderId: number): Promise<ApiResponse<OrderDetailFull>> {
  return customFetch<ApiResponse<OrderDetailFull>>({
    url: `${ORDER_BASE_URL}/${orderId}`,
    method: 'GET'
  })
}

export async function updateOrderApi(orderId: number, data: UpdateOrderRequest): Promise<ApiResponse<OrderResponse>> {
  return customFetch<ApiResponse<OrderResponse>>({
    url: `${ORDER_BASE_URL}/${orderId}`,
    method: 'PUT',
    data
  })
}

export async function requestRefundCancelApi(
  orderId: number,
  cancelReason: string
): Promise<ApiResponse<any>> {
  return customFetch<ApiResponse<any>>({
    url: `${ORDER_BASE_URL}/${orderId}/cancel-request`,
    method: 'POST',
    data: { cancelReason }
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
