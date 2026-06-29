/**
 * Manager feature — product management API service.
 */

import { env } from '~/shared/config/env'
import { customFetch } from '~/api/mutator/custom-fetch'
import type {
  ProductDetailData,
  ProductDetailResponse,
  CategoryData,
  ListCategoryResponse,
  ProductManagementItem,
  PagedProductManagementResponse,
  FetchProductsManagementParams,
  UpdateProductPayload,
  UpdateProductResponse,
  CreateProductPayload,
  CreateProductResponse,
  ImportProductsResponse
} from '~/shared/lib/product'

const PRODUCTS_BASE_URL = `${env.API_URL}${env.API_PRODUCTS_PATH}`
const CATEGORIES_BASE_URL = `${env.API_URL}${env.API_CATEGORIES_PATH}`

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

export async function fetchProductsManagementApi(
  params: FetchProductsManagementParams = {}
): Promise<PagedProductManagementResponse> {
  const { keyword, categoryId, brandName, status, sortBy, page = 0, size = 10 } = params

  return customFetch<PagedProductManagementResponse>({
    url: `${PRODUCTS_BASE_URL}/management`,
    method: 'GET',
    params: {
      keyword: keyword || undefined,
      categoryId: categoryId || undefined,
      brandName: brandName || undefined,
      status: status || undefined,
      sortBy: sortBy || undefined,
      page,
      size
    }
  })
}

export async function updateProductApi(
  productId: string,
  payload: UpdateProductPayload,
  images?: File[]
): Promise<UpdateProductResponse> {
  const formData = new FormData()
  formData.append('data', JSON.stringify(payload))

  if (images && images.length > 0) {
    for (const file of images) {
      formData.append('images', file)
    }
  }

  return customFetch<UpdateProductResponse>({
    url: `${PRODUCTS_BASE_URL}/${productId}`,
    method: 'PATCH',
    data: formData
  })
}

export async function createProductApi(
  payload: CreateProductPayload,
  images?: File[]
): Promise<CreateProductResponse> {
  const formData = new FormData()
  formData.append('data', JSON.stringify(payload))

  if (images && images.length > 0) {
    for (const file of images) {
      formData.append('images', file)
    }
  }

  return customFetch<CreateProductResponse>({
    url: PRODUCTS_BASE_URL,
    method: 'POST',
    data: formData
  })
}

export async function importProductsApi(
  file: File,
  confirm: boolean = false
): Promise<ImportProductsResponse> {
  const formData = new FormData()
  formData.append('file', file)

  return customFetch<ImportProductsResponse>({
    url: `${PRODUCTS_BASE_URL}/import?confirm=${confirm}`,
    method: 'POST',
    data: formData
  })
}

export async function fetchProductStatsApi(
  params: {
    keyword?: string
    categoryId?: number
    status?: 'ACTIVE' | 'INACTIVE' | 'DELETED'
  } = {}
): Promise<{ inStock: number; lowStock: number; total: number }> {
  const firstResponse = await fetchProductsManagementApi({
    keyword: params.keyword,
    categoryId: params.categoryId,
    status: params.status,
    page: 0,
    size: 1,
  })

  if (!firstResponse.success) {
    throw new Error(firstResponse.message || 'Failed to fetch product stats')
  }

  const totalElements = firstResponse.data.totalElements

  const fullResponse = await fetchProductsManagementApi({
    keyword: params.keyword,
    categoryId: params.categoryId,
    status: params.status,
    page: 0,
    size: totalElements,
  })

  if (!fullResponse.success) {
    throw new Error(fullResponse.message || 'Failed to fetch product stats')
  }

  const allProducts = fullResponse.data.content

  const inStock = allProducts.filter(p => p.totalStock > 0).length
  const lowStock = allProducts.filter(p => p.totalStock > 0 && p.totalStock <= 5).length

  return {
    total: totalElements,
    inStock,
    lowStock
  }
}