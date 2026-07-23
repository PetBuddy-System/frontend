// manager/services/product/product-api.ts

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
  ImportProductsResponse,
  ProductVideoResponse,
  ProductImagesResponse,
  UpdateProductImagesResponse,
  UpdateProductVideoResponse
} from '~/shared/lib/product'

const PRODUCTS_BASE_URL = `${env.API_URL}${env.API_PRODUCTS_PATH}`
const CATEGORIES_BASE_URL = `${env.API_URL}${env.API_CATEGORIES_PATH}`

// ─── User API ──────────────────────────────────────────────────────────────

export async function fetchProductByIdApi(productId: string): Promise<ProductDetailResponse> {
  return customFetch<ProductDetailResponse>({
    url: `${PRODUCTS_BASE_URL}/${productId}`,
    method: 'GET'
  })
}

// ─── Management API ────────────────────────────────────────────────────────

export async function fetchProductsManagementApi(
  params: FetchProductsManagementParams = {}
): Promise<PagedProductManagementResponse> {
  const { keyword, categoryId, brandName, status, sortBy, page = 0, size = 10, nearExpiredDays } = params

  const queryParams: Record<string, string | number> = {
    page,
    size
  }

  if (keyword && keyword.trim()) {
    queryParams.keyword = keyword.trim()
  }
  if (categoryId !== undefined && categoryId !== null) {
    queryParams.categoryId = categoryId
  }
  if (brandName && brandName.trim()) {
    queryParams.brandName = brandName.trim()
  }
  if (status) {
    queryParams.status = status
  }
  if (sortBy) {
    queryParams.sortBy = sortBy
  }
  if (nearExpiredDays) {
    queryParams.nearExpiredDays = nearExpiredDays
  }

  console.log('📤 Product API - Query Params:', queryParams)

  return customFetch<PagedProductManagementResponse>({
    url: `${PRODUCTS_BASE_URL}/management`,
    method: 'GET',
    params: queryParams
  })
}

export async function fetchProductManagementByIdApi(productId: string): Promise<ProductDetailResponse> {
  return customFetch<ProductDetailResponse>({
    url: `${PRODUCTS_BASE_URL}/management/${productId}`,
    method: 'GET'
  })
}

// ─── Product Video API ────────────────────────────────────────────────────
export async function fetchProductVideoApi(productId: string): Promise<ProductVideoResponse> {
  return customFetch<ProductVideoResponse>({
    url: `${PRODUCTS_BASE_URL}/${productId}/video`,
    method: 'GET'
  })
}

// ─── Product Images API ───────────────────────────────────────────────────
export async function fetchProductImagesApi(productId: string): Promise<ProductImagesResponse> {
  return customFetch<ProductImagesResponse>({
    url: `${PRODUCTS_BASE_URL}/${productId}/images`,
    method: 'GET'
  })
}

export async function updateProductImagesApi(
  productId: string,
  images?: File[],
  keepImageIds?: number[]
): Promise<UpdateProductImagesResponse> {
  const formData = new FormData()

  if (images !== undefined) {
    if (images.length === 0) {
      // Xóa hết ảnh - gửi file rỗng
      formData.append('images', new Blob([]), '')
    } else {
      for (const file of images) {
        formData.append('images', file)
      }
    }
  }

  // Thêm keepImageIds nếu có
  if (keepImageIds && keepImageIds.length > 0) {
    for (const id of keepImageIds) {
      formData.append('keepImageIds', id.toString())
    }
  }

  return customFetch<UpdateProductImagesResponse>({
    url: `${PRODUCTS_BASE_URL}/${productId}/images`,
    method: 'PUT',
    data: formData
  })
}

export async function updateProductVideoApi(
  productId: string,
  video?: File | null
): Promise<UpdateProductVideoResponse> {
  const formData = new FormData()

  if (video === null) {
    // Xóa video - gửi file rỗng
    formData.append('video', new Blob([]), '')
  } else if (video !== undefined) {
    // Thay thế video mới
    formData.append('video', video)
  }

  return customFetch<UpdateProductVideoResponse>({
    url: `${PRODUCTS_BASE_URL}/${productId}/video`,
    method: 'PUT',
    data: formData
  })
}

// ─── Categories ────────────────────────────────────────────────────────────

export async function fetchCategoriesApi(): Promise<ListCategoryResponse> {
  return customFetch<ListCategoryResponse>({
    url: CATEGORIES_BASE_URL,
    method: 'GET'
  })
}

// ─── Create / Update / Import ─────────────────────────────────────────────

export async function createProductApi(payload: CreateProductPayload): Promise<CreateProductResponse> {
  return customFetch<CreateProductResponse>({
    url: PRODUCTS_BASE_URL,
    method: 'POST',
    data: payload
  })
}

export async function updateProductApi(
  productId: string,
  payload: UpdateProductPayload,
  images?: File[]
): Promise<UpdateProductResponse> {
  // Nếu có images, gửi dạng FormData
  if (images && images.length > 0) {
    const formData = new FormData()
    // ✅ Đảm bảo payload được stringify đúng
    formData.append('data', JSON.stringify(payload))

    for (const file of images) {
      formData.append('images', file)
    }

    return customFetch<UpdateProductResponse>({
      url: `${PRODUCTS_BASE_URL}/${productId}`,
      method: 'PATCH',
      data: formData
    })
  }

  // ✅ Luôn gửi payload (bao gồm cả weight, unit, categoryId, ...)
  return customFetch<UpdateProductResponse>({
    url: `${PRODUCTS_BASE_URL}/${productId}`,
    method: 'PATCH',
    data: payload
  })
}

export async function importProductsApi(file: File, confirm: boolean = false): Promise<ImportProductsResponse> {
  const formData = new FormData()
  formData.append('file', file)

  return customFetch<ImportProductsResponse>({
    url: `${PRODUCTS_BASE_URL}/import?confirm=${confirm}`,
    method: 'POST',
    data: formData
  })
}

// ─── Stats ─────────────────────────────────────────────────────────────────

export async function fetchProductStatsApi(
  params: {
    keyword?: string
    categoryId?: number
    status?: 'ACTIVE' | 'INACTIVE' | 'DELETED'
    nearExpiredDays?: number
  } = {}
): Promise<{ inStock: number; lowStock: number }> {
  const response = await fetchProductsManagementApi({
    keyword: params.keyword,
    categoryId: params.categoryId,
    status: params.status,
    nearExpiredDays: params.nearExpiredDays,
    page: 0,
    size: 1
  })

  if (!response.success) {
    throw new Error(response.message || 'Failed to fetch product stats')
  }

  return {
    inStock: 0,
    lowStock: 0
  }
}