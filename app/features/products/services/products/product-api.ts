/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * Products feature — products API service.
 * Chứa tất cả product-related API functions cho customer-facing pages.
 */

import { env } from '~/shared/config/env'
import { customFetch } from '~/api/mutator/custom-fetch'
import type {
  ProductResponse,
  PagedProductResponse,
  FetchProductsParams,
  ProductDetailData,
  ProductDetailResponse,
  CategoryData,
  ListCategoryResponse
} from '~/shared/lib/product'

const PRODUCTS_BASE_URL = `${env.API_URL}${env.API_PRODUCTS_PATH}`
const CATEGORIES_BASE_URL = `${env.API_URL}${env.API_CATEGORIES_PATH}`

export async function fetchProductsApi(
  params: FetchProductsParams = {}
): Promise<PagedProductResponse> {
  const { keyword, page = 0, size = 12, categoryId, brandName, sortBy } = params

  return customFetch<PagedProductResponse>({
    url: PRODUCTS_BASE_URL,
    method: 'GET',
    params: {
      keyword: keyword || undefined,
      page,
      size,
      categoryId: categoryId || undefined,
      brandName: brandName || undefined,
      sortBy: sortBy || undefined
    }
  })
}

export async function fetchProductByIdApi(productId: string): Promise<ProductDetailResponse> {
  return customFetch<ProductDetailResponse>({
    url: `${PRODUCTS_BASE_URL}/${productId}`,
    method: 'GET'
  })
}

export async function fetchCategoriesApi(): Promise<ListCategoryResponse> {
  return customFetch<ListCategoryResponse>({
    url: CATEGORIES_BASE_URL,
    method: 'GET'
  })
}
