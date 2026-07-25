export type ReturnType = 'RETURN' | 'EXCHANGE'

export type ReturnReason = 'DAMAGED' | 'WRONG_PRODUCT' | 'MISSING_ITEM' | 'EXPIRED' | 'CUSTOMER_CHANGED_MIND' | 'OTHER'

export type RefundMethod = 'STRIPE_PAYMENT' | 'BANK_TRANSFER'

/** Trạng thái hoàn tiền — chỉ áp dụng khi type = RETURN */
export type RefundStatus = 'NOT_REQUIRED' | 'PENDING' | 'SUCCESS' | 'FAILED'

export interface CalculateRefundItemRequest {
  orderDetailId: number
  quantity: number
}

export interface CalculateRefundRequest {
  orderId: number
  reason: ReturnReason
  items: CalculateRefundItemRequest[]
}

export interface CalculateRefundItemResponse {
  orderDetailId: number
  productName: string
  quantity: number
  refundAmount: number
}

export interface CalculateRefundResponse {
  totalRefundAmount: number
  items: CalculateRefundItemResponse[]
}

export interface CreateReturnItemRequest {
  orderDetailId: number
  quantity: number
}

export interface CreateReturnRequest {
  orderId: number
  type: ReturnType
  reason: ReturnReason
  description: string
  /** Bắt buộc khi type = RETURN; bỏ qua khi type = EXCHANGE */
  refundMethod?: RefundMethod
  bankName?: string
  bankAccountNumber?: string
  bankAccountHolder?: string
  items: CreateReturnItemRequest[]
}

export interface ReturnItemResponse {
  returnItemId: number
  productName: string
  quantity: number
  refundAmount: number
}

export interface ReturnRequestResponse {
  returnRequestId: number
  returnCode: string
  orderCode: string
  type: ReturnType
  reason: ReturnReason
  description?: string
  status: string
  refundMethod: RefundMethod
  refundStatus?: string
  refundAmount: number
  bankName?: string | null
  bankAccountNumber?: string | null
  bankAccountHolder?: string | null
  createdAt: string
  returnItems: ReturnItemResponse[]
  mediaFiles: string[] | ReturnMediaFile[]
  processedBy?: ReturnProcessedStaff | null
  coordinator?: ReturnProcessedStaff | null
  shipper?: ReturnProcessedStaff | null
  processedAt?: string | null
  approvedAt?: string | null
  pickedUpAt?: string | null
  returnedToStoreAt?: string | null
  completedAt?: string | null
  restockedAt?: string | null
  staffNote?: string | null
  address?: string | null
  latitude?: number | null
  longitude?: number | null
  updatedAt?: string
}

export interface ReturnUser {
  userId: string
  fullName: string
  email: string
  role?: string
  status?: string
}

export interface ReturnProcessedStaff {
  userId: string
  fullName: string
  email: string
  role?: string
  staffTask?: string
  status?: string
}

export interface ReturnMediaFile {
  mediaFileId: number
  fileUrl: string
  fileType: 'IMAGE' | 'VIDEO'
}

export interface ReturnItemDetailResponse {
  returnItemId: number
  orderDetailId: number
  productName: string
  productImage?: string | null
  quantity: number
  refundAmount: number
}

export interface ManagementReturnResponse {
  returnRequestId: number
  returnCode: string
  orderId: number
  orderCode: string
  requestedBy: ReturnUser
  processedBy: ReturnProcessedStaff | null
  coordinator?: ReturnProcessedStaff | null
  shipper?: ReturnProcessedStaff | null
  type: ReturnType
  reason: ReturnReason
  description?: string | null
  status: string
  refundMethod: RefundMethod
  refundStatus?: string | null
  refundAmount: number
  staffNote?: string | null
  bankName?: string | null
  bankAccountNumber?: string | null
  bankAccountHolder?: string | null
  createdAt: string
  processedAt?: string | null
  approvedAt?: string | null
  pickedUpAt?: string | null
  returnedToStoreAt?: string | null
  completedAt?: string | null
  restockedAt?: string | null
  address?: string | null
  recipientName?: string | null
  phoneNumber?: string | null
  latitude?: number | null
  longitude?: number | null
  updatedAt: string
  returnItems: ReturnItemDetailResponse[]
  mediaFiles: ReturnMediaFile[]
}

export interface ReturnShipperResponse {
  staffId: string
  staffName: string
  staffEmail: string
  activeReturnCount: number
}
