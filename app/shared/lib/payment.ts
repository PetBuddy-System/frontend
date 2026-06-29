/**
 * Payment types — chỉ chứa types/interfaces, không có API functions.
 * API functions nằm trong features/products/services/payment/.
 */

export type PaymentMethod = 'CASH' | 'CARD'

export type PaymentStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'PAID'
  | 'FAILED'
  | 'CANCELLED'
  | 'REFUNDED'
  | (string & {})

export interface PaymentResponse {
  paymentId: number
  orderId: number
  orderCode: string
  paymentMethod: PaymentMethod
  status: PaymentStatus
  amount: number
  paidAt?: string
  stripeClientSecret?: string
  clientSecret?: string
  createdAt: string
  updatedAt: string
}

export interface ApiResponse<T> {
  code: number
  message: string
  success: boolean
  data: T
  timestamp: string
}
