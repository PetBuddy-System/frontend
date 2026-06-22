import { env } from '~/shared/config/env'
import { customFetch } from '~/api/mutator/custom-fetch'

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PICKING'
  | 'SHIPPING'
  | 'DELIVERED'
  | 'COMPLETED'
  | 'CANCELED'
  | (string & {})

export interface PickingItemResponse {
  productId: string
  name: string
  expiryDate: string
  quantityToPick: number
}

export interface ApiResponse<T> {
  code: number
  message: string
  success: boolean
  data: T
  timestamp: string
}

export interface PageResponse<T> {
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean
  size: number
  number: number
  numberOfElements: number
  empty: boolean
  content: T[]
}

export interface PageableParams {
  page?: number
  size?: number
  sort?: string
}

export interface CreateOrderItemRequest {
  productId: string
  price: number
  quantity: number
}

export interface CreateOrderRequest {
  userName: string
  phoneNumber: string
  address: string
  note?: string
  voucherCode?: string
  items?: CreateOrderItemRequest[]
}

export interface OrderResponse {
  orderId: number
  orderCode: string
  status: string
  finalAmount: number
  createdAt: string
}

export interface StaffOrderResponse {
  orderId: number
  orderCode: string
  recipientName?: string
  phoneNumber?: string
  address?: string
  status: string
  totalAmount: number
  createdAt: string
}

const ORDER_BASE_URL = `${env.API_URL}/api/orders`

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