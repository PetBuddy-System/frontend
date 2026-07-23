// app/features/profile/services/review/review-api.ts

import axios from 'axios'
import { axiosInstance } from '~/api/mutator/custom-fetch'
import { STORAGE_KEYS } from '~/shared/config/site'
import { readStorage } from '~/shared/lib/storage'
import type {
  OrderReviewRequest,
  OrderReviewResponse,
  ProductReviewCreationRequest,
  ProductReviewResponse,
  ProductReviewUpdateRequest,
  ProductReviewManagerResponse,
  ReviewStatusUpdateRequest,
  ReviewStatus
} from '~/shared/lib/review'

// ============ HELPER FUNCTIONS ============

interface ApiResponse<T> {
  success?: boolean
  code?: number
  message?: string
  data?: T
}

interface Page<T> {
  content: T[]
  pageable: {
    pageNumber: number
    pageSize: number
    sort: {
      sorted: boolean
      unsorted: boolean
      empty: boolean
    }
    offset: number
    paged: boolean
    unpaged: boolean
  }
  totalPages: number
  totalElements: number
  last: boolean
  size: number
  number: number
  sort: {
    sorted: boolean
    unsorted: boolean
    empty: boolean
  }
  numberOfElements: number
  first: boolean
  empty: boolean
}

function getAuthHeaders() {
  const token = readStorage(STORAGE_KEYS.accessToken)
  return token
    ? {
        Authorization: `Bearer ${token}`
      }
    : undefined
}

function unwrapResponse<T>(payload: ApiResponse<T> | T): T {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return (payload as ApiResponse<T>).data as T
  }
  return payload as T
}

function toReviewError(error: unknown, fallbackMessage: string): Error {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string; errors?: unknown } | undefined
    const message =
      data?.message ||
      (Array.isArray(data?.errors) ? String(data.errors[0]) : undefined) ||
      error.message ||
      fallbackMessage

    return Object.assign(new Error(message), {
      status: error.response?.status,
      data
    })
  }

  if (error instanceof Error) {
    return error
  }

  return new Error(fallbackMessage)
}

// ============ ORDER REVIEWS ============

/**
 * POST /api/orders/{orderId}/reviews
 * Tạo đánh giá đơn hàng
 */
export async function createOrderReviewApi(orderId: number, data: OrderReviewRequest): Promise<OrderReviewResponse> {
  try {
    const response = await axiosInstance.post<ApiResponse<OrderReviewResponse> | OrderReviewResponse>(
      `/api/orders/${orderId}/reviews`,
      data,
      {
        headers: getAuthHeaders()
      }
    )
    return unwrapResponse(response.data)
  } catch (error: unknown) {
    throw toReviewError(error, 'Unable to create order review.')
  }
}

/**
 * GET /api/orders/{orderId}/reviews
 * Lấy đánh giá của đơn hàng
 */
export async function getOrderReviewApi(orderId: number): Promise<OrderReviewResponse | null> {
  try {
    const response = await axiosInstance.get<ApiResponse<OrderReviewResponse> | OrderReviewResponse>(
      `/api/orders/${orderId}/reviews`,
      {
        headers: getAuthHeaders()
      }
    )
    return unwrapResponse(response.data) ?? null
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null
    }
    throw toReviewError(error, 'Unable to load order review.')
  }
}

// ============ PRODUCT REVIEWS ============

/**
 * POST /api/products/{productId}/reviews
 * Tạo đánh giá sản phẩm
 */
export async function createProductReviewApi(
  productId: string,
  data: ProductReviewCreationRequest
): Promise<ProductReviewResponse> {
  try {
    const response = await axiosInstance.post<ApiResponse<ProductReviewResponse> | ProductReviewResponse>(
      `/api/products/${productId}/reviews`,
      data,
      {
        headers: getAuthHeaders()
      }
    )
    return unwrapResponse(response.data)
  } catch (error: unknown) {
    throw toReviewError(error, 'Unable to create product review.')
  }
}

/**
 * GET /api/products/{productId}/reviews
 * Lấy danh sách đánh giá sản phẩm
 */
export async function getProductReviewsApi(
  productId: string,
  params?: {
    rating?: number
    page?: number
    size?: number
    sortBy?: string
    sortDirection?: 'asc' | 'desc'
  }
): Promise<Page<ProductReviewResponse>> {
  try {
    const searchParams = new URLSearchParams()
    if (params?.rating) searchParams.set('rating', String(params.rating))
    if (params?.page !== undefined) searchParams.set('page', String(params.page))
    if (params?.size) searchParams.set('size', String(params.size))
    if (params?.sortBy) searchParams.set('sortBy', params.sortBy)
    if (params?.sortDirection) searchParams.set('sortDirection', params.sortDirection)

    const queryString = searchParams.toString()
    const url = queryString ? `/api/products/${productId}/reviews?${queryString}` : `/api/products/${productId}/reviews`

    const response = await axiosInstance.get<ApiResponse<Page<ProductReviewResponse>> | Page<ProductReviewResponse>>(
      url,
      {
        headers: getAuthHeaders()
      }
    )
    return unwrapResponse(response.data)
  } catch (error: unknown) {
    throw toReviewError(error, 'Unable to load product reviews.')
  }
}

/**
 * GET /api/products/{productId}/reviews/me
 * Lấy đánh giá của tôi cho sản phẩm
 */
export async function getMyProductReviewApi(productId: string): Promise<ProductReviewResponse | null> {
  try {
    const response = await axiosInstance.get<ApiResponse<ProductReviewResponse> | ProductReviewResponse>(
      `/api/products/${productId}/reviews/me`,
      {
        headers: getAuthHeaders()
      }
    )
    return unwrapResponse(response.data) ?? null
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null
    }
    throw toReviewError(error, 'Unable to load your product review.')
  }
}

// ============ SHARED REVIEWS ============

/**
 * PUT /api/reviews/{reviewId}
 * Cập nhật đánh giá
 */
export async function updateReviewApi(
  reviewId: string,
  data: ProductReviewUpdateRequest
): Promise<ProductReviewResponse> {
  try {
    const response = await axiosInstance.put<ApiResponse<ProductReviewResponse> | ProductReviewResponse>(
      `/api/reviews/${reviewId}`,
      data,
      {
        headers: getAuthHeaders()
      }
    )
    return unwrapResponse(response.data)
  } catch (error: unknown) {
    throw toReviewError(error, 'Unable to update review.')
  }
}

/**
 * DELETE /api/reviews/{reviewId}
 * Xóa mềm đánh giá
 */
export async function deleteReviewApi(reviewId: string): Promise<void> {
  try {
    await axiosInstance.delete(`/api/reviews/${reviewId}`, {
      headers: getAuthHeaders()
    })
  } catch (error: unknown) {
    throw toReviewError(error, 'Unable to delete review.')
  }
}

// ============ MANAGEMENT REVIEWS ============

/**
 * GET /api/management/reviews
 * Lấy danh sách đánh giá cho quản lý
 */
export async function getManagementReviewsApi(params?: {
  keyword?: string
  rating?: number
  status?: ReviewStatus
  reviewType?: 'PRODUCT' | 'ORDER'
  page?: number
  size?: number
  sortBy?: string
  sortDirection?: 'asc' | 'desc'
}): Promise<Page<ProductReviewManagerResponse>> {
  try {
    const searchParams = new URLSearchParams()
    if (params?.keyword) searchParams.set('keyword', params.keyword)
    if (params?.rating !== undefined) searchParams.set('rating', String(params.rating))
    if (params?.status) searchParams.set('status', params.status)
    if (params?.reviewType) searchParams.set('reviewType', params.reviewType)
    if (params?.page !== undefined) searchParams.set('page', String(params.page))
    if (params?.size) searchParams.set('size', String(params.size))
    if (params?.sortBy) searchParams.set('sortBy', params.sortBy)
    if (params?.sortDirection) searchParams.set('sortDirection', params.sortDirection)

    const queryString = searchParams.toString()
    const url = queryString ? `/api/management/reviews?${queryString}` : `/api/management/reviews`

    const response = await axiosInstance.get<
      ApiResponse<Page<ProductReviewManagerResponse>> | Page<ProductReviewManagerResponse>
    >(url, {
      headers: getAuthHeaders()
    })
    return unwrapResponse(response.data)
  } catch (error: unknown) {
    throw toReviewError(error, 'Unable to load management reviews.')
  }
}

/**
 * GET /api/management/reviews/{reviewId}
 * Lấy chi tiết đánh giá cho quản lý
 */
export async function getManagementReviewDetailApi(reviewId: string): Promise<ProductReviewManagerResponse> {
  try {
    const response = await axiosInstance.get<ApiResponse<ProductReviewManagerResponse> | ProductReviewManagerResponse>(
      `/api/management/reviews/${reviewId}`,
      {
        headers: getAuthHeaders()
      }
    )
    return unwrapResponse(response.data)
  } catch (error: unknown) {
    throw toReviewError(error, 'Unable to load review detail.')
  }
}

/**
 * PATCH /api/management/reviews/{reviewId}/status
 * Cập nhật trạng thái đánh giá
 */
export async function updateReviewStatusApi(reviewId: string, data: ReviewStatusUpdateRequest): Promise<void> {
  try {
    await axiosInstance.patch(`/api/management/reviews/${reviewId}/status`, data, {
      headers: getAuthHeaders()
    })
  } catch (error: unknown) {
    throw toReviewError(error, 'Unable to update review status.')
  }
}
