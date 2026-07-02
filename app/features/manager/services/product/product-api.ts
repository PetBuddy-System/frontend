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
  ImportProductsResponse
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
  const {
    keyword,
    categoryId,
    brandName,
    status,
    sortBy,
    page = 0,
    size = 10,
    nearExpiredDays
  } = params

  // ✅ Build params rõ ràng, loại bỏ undefined
  const queryParams: Record<string, string | number> = {
    page,
    size // ✅ Luôn có size
  }

  // Chỉ thêm các param có giá trị
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

export async function fetchProductManagementByIdApi(
  productId: string
): Promise<ProductDetailResponse> {
  return customFetch<ProductDetailResponse>({
    url: `${PRODUCTS_BASE_URL}/management/${productId}`,
    method: 'GET'
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

// ─── Stats ─────────────────────────────────────────────────────────────────

export async function fetchProductStatsApi(
  params: {
    keyword?: string
    categoryId?: number
    status?: 'ACTIVE' | 'INACTIVE' | 'DELETED'
    nearExpiredDays?: number
  } = {}
): Promise<{ inStock: number; lowStock: number }> {
  // ✅ Chỉ gọi 1 lần với size=1 để lấy total
  const response = await fetchProductsManagementApi({
    keyword: params.keyword,
    categoryId: params.categoryId,
    status: params.status,
    nearExpiredDays: params.nearExpiredDays,
    page: 0,
    size: 1,
  })

  if (!response.success) {
    throw new Error(response.message || 'Failed to fetch product stats')
  }


  return {
    inStock: 0,
    lowStock: 0
  }
}