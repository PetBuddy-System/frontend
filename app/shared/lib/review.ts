// app/shared/lib/review.ts

export enum ReviewStatus {
  ACTIVE = 'ACTIVE',
  HIDDEN = 'HIDDEN',
  DELETED = 'DELETED'
}

export enum ReviewType {
  PRODUCT = 'PRODUCT',
  ORDER = 'ORDER'
}

// ============ PRODUCT REVIEW ============
export interface ProductReviewCreationRequest {
  rating: number
  content: string
  anonymous?: boolean
}

export interface ProductReviewUpdateRequest {
  rating?: number
  content?: string
  anonymous?: boolean
}

export interface ProductReviewResponse {
  reviewId: string
  userId: string
  fullName: string
  avatar: string | null
  productId: string
  productName: string
  rating: number
  content: string
  anonymous: boolean
  status: ReviewStatus
  createdAt: string
  updatedAt: string
}

// ============ ORDER REVIEW ============
export interface OrderReviewRequest {
  rating: number
  content: string
  anonymous?: boolean
}

export interface OrderReviewResponse {
  reviewId: string
  userId: string
  fullName: string
  avatar: string | null
  orderId: number
  orderCode: string
  rating: number
  content: string
  anonymous: boolean
  status: ReviewStatus
  createdAt: string
  updatedAt: string
}

// ============ MANAGEMENT ============
export interface ProductReviewManagerResponse {
  reviewId: string
  userId: string
  userEmail: string
  userFullName: string
  userAvatar: string | null
  productId: string
  productName: string
  productCode: string
  rating: number
  content: string
  anonymous: boolean
  status: ReviewStatus
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export interface ReviewStatusUpdateRequest {
  status: ReviewStatus.ACTIVE | ReviewStatus.HIDDEN
}
