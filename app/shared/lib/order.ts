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
  imageUrl?: string
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


export interface CreateOrderRequest {
  recipientName: string
  phoneNumber: string
  address: string
  note?: string
  voucherCode?: string
  paymentMethod?: 'CASH' | 'CARD'
}

export interface OrderDetailResponse {
  orderDetailId: number
  productId: string
  productName: string
  productImage?: string
  unitPrice: number
  quantity: number
  totalPrice: number
  createdAt: string
}


export interface OrderDetailFull {
  orderId: number
  orderCode: string
  recipientName?: string
  phoneNumber?: string
  address?: string
  status: string
  finalAmount: number
  clientSecret?: string
  createdAt: string
  updatedAt?: string
  orderDetails: OrderDetailResponse[]
  // extra fields stored in mock (not in Java DTO) for backward compat
  userName?: string
  note?: string
  voucherCode?: string
  paymentMethod?: 'CASH' | 'CARD'
  paymentStatus?: 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED' | 'PROCESSING'
}

export interface OrderResponse {
  orderId: number
  orderCode: string
  recipientName?: string
  phoneNumber?: string
  address?: string
  status: OrderStatus
  finalAmount: number
  clientSecret?: string
  createdAt: string
  updatedAt?: string
  orderDetails?: OrderDetailResponse[]
  paymentMethod?: 'CASH' | 'CARD'
  paymentStatus?: 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED' | 'PROCESSING'
}