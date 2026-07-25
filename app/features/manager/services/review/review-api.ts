// app/features/manager/services/review/review-api.ts

import { env } from '~/shared/config/env'
import { customFetch } from '~/api/mutator/custom-fetch'
import type { PagedManagerReviewResponse, ManagerReviewDetailResponse } from '~/shared/lib/product'

export async function fetchManagementReviewsApi(
  params: {
    keyword?: string
    rating?: number
    status?: string
    reviewType?: 'PRODUCT' | 'ORDER' // ← THÊM
    page?: number
    size?: number
    sortBy?: string
    sortDirection?: 'asc' | 'desc'
  } = {}
): Promise<PagedManagerReviewResponse> {
  return customFetch<PagedManagerReviewResponse>({
    url: `${env.API_URL}/api/management/reviews`,
    method: 'GET',
    params: {
      keyword: params.keyword || undefined,
      rating: params.rating !== undefined ? params.rating : undefined,
      status: params.status || undefined,
      reviewType: params.reviewType || undefined, // ← THÊM
      page: params.page ?? 0,
      size: params.size ?? 10,
      sortBy: params.sortBy ?? 'createdAt',
      sortDirection: params.sortDirection ?? 'desc'
    }
  })
}

export async function fetchManagementReviewByIdApi(reviewId: string): Promise<ManagerReviewDetailResponse> {
  return customFetch<ManagerReviewDetailResponse>({
    url: `${env.API_URL}/api/management/reviews/${reviewId}`,
    method: 'GET'
  })
}

export async function updateManagementReviewStatusApi(reviewId: string, status: 'ACTIVE' | 'HIDDEN'): Promise<any> {
  return customFetch<any>({
    url: `${env.API_URL}/api/management/reviews/${reviewId}/status`,
    method: 'PATCH',
    data: { status }
  })
}

export async function deleteManagementReviewApi(reviewId: string): Promise<any> {
  return customFetch<any>({
    url: `${env.API_URL}/api/reviews/${reviewId}`,
    method: 'DELETE'
  })
}
