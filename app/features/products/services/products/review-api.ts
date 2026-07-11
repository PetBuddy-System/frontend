import { env } from '~/shared/config/env'
import { customFetch } from '~/api/mutator/custom-fetch'
import type {
  PagedProductReviewResponse,
  ProductReviewMeResponse,
  CreateProductReviewPayload
} from '~/shared/lib/product'

export async function fetchProductReviewsApi(
  productId: string,
  params: {
    rating?: number
    page?: number
    size?: number
    sortBy?: string
    sortDirection?: 'asc' | 'desc'
  } = {}
): Promise<PagedProductReviewResponse> {
  return customFetch<PagedProductReviewResponse>({
    url: `${env.API_URL}/api/products/${productId}/reviews`,
    method: 'GET',
    params: {
      rating: params.rating !== undefined ? params.rating : undefined,
      page: params.page ?? 0,
      size: params.size ?? 10,
      sortBy: params.sortBy ?? 'createdAt',
      sortDirection: params.sortDirection ?? 'desc'
    }
  })
}

export async function fetchMyProductReviewApi(productId: string): Promise<ProductReviewMeResponse> {
  return customFetch<ProductReviewMeResponse>({
    url: `${env.API_URL}/api/products/${productId}/reviews/me`,
    method: 'GET'
  })
}

export async function createProductReviewApi(
  productId: string,
  payload: CreateProductReviewPayload
): Promise<any> {
  return customFetch<any>({
    url: `${env.API_URL}/api/products/${productId}/reviews`,
    method: 'POST',
    data: payload
  })
}

export async function updateProductReviewApi(
  reviewId: string,
  payload: CreateProductReviewPayload
): Promise<any> {
  return customFetch<any>({
    url: `${env.API_URL}/api/reviews/${reviewId}`,
    method: 'PUT',
    data: payload
  })
}

export async function deleteProductReviewApi(reviewId: string): Promise<any> {
  return customFetch<any>({
    url: `${env.API_URL}/api/reviews/${reviewId}`,
    method: 'DELETE'
  })
}
