import type {PaymentResponse} from './payment'
import type {VoucherResponse} from './voucher'

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PICKING'
  | 'PICKED'
  | 'SHIPPING'
  | 'DELIVERED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'EXPIRED'
  | 'CANCEL_REQUESTED'
  | (string & {})

export interface ShipperSuggestionResponse {
  staffId: string
  staffName: string
  currentLoad: number
  maxCapacity: number
  distanceToClusterKm: number | null
}

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
  latitude: number
  longitude: number
  paymentMethod?: 'CASH' | 'CARD'
}

export interface UpdateOrderRequest {
  recipientName?: string
  phoneNumber?: string
  address?: string
  note?: string
  voucherCode?: string
  latitude?: number
  longitude?: number
}

export interface OrderDetailResponse {
  orderDetailId: number
  productId: string
  productName: string
  productImage?: string
  unitPrice: number
  salePrice?: number | null
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
  note?: string
  status: string
  finalAmount: number
  clientSecret?: string
  createdAt: string
  updatedAt?: string
  paymentExpiredAt?: string
  orderDetails: OrderDetailResponse[]
  payment?: PaymentResponse  
  voucherCode?: string
  voucher?: VoucherResponse
  shippingFee?: number
}

export interface OrderResponse {
  orderId: number
  orderCode: string
  recipientName?: string
  phoneNumber?: string
  address?: string
  note?: string
  status: OrderStatus
  finalAmount: number
  clientSecret?: string
  createdAt: string
  updatedAt?: string
  paymentExpiredAt?: string
  orderDetails?: OrderDetailResponse[]
  payment?: PaymentResponse
  voucher?: VoucherResponse
  shippingFee?: number
}

export interface DeliveryStopResponse {
  orderId: number
  orderCode: string
  address: string
  recipientName: string
  phoneNumber: string
  sequence: number
  distanceFromPreviousKm: number
}