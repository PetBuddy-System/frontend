/**
 * Order types — chỉ chứa types/interfaces, không có API functions.
 * API functions nằm trong features/services/.
 */

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
