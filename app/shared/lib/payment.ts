export type PaymentMethod = 'CASH' | 'CARD' | 'MOMO'

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
  stripeClientSecret?: string
  momoPayUrl?: string
  cancelReason?: string
  paidAt?: string
  createdAt: string
  updatedAt?: string
}

export interface ApiResponse<T> {
  code: number
  message: string
  success: boolean
  data: T
  timestamp: string
}
