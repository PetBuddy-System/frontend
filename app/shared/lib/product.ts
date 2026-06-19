import { customFetch } from '~/api/mutator/custom-fetch'

export interface ProductResponse {
  productId: string
  name: string
  price: number
  brandName: string
  thumbnail?: string
  imageUrls?: string[] | null
  totalStock: number
}

export interface PagedProductResponse {
  code: number
  message: string
  success: boolean
  data: {
    totalElements: number
    totalPages: number
    first: boolean
    last: boolean
    size: number
    number: number
    numberOfElements: number
    empty: boolean
    content: ProductResponse[]
  }
  timestamp: string
}

export interface FetchProductsParams {
  keyword?: string
  page?: number
  size?: number
  categoryId?: number
  brandName?: string
  sortBy?: string
}

export async function fetchProductsApi(
  params: FetchProductsParams = {}
): Promise<PagedProductResponse> {
  const { keyword, page = 0, size = 12, categoryId, brandName, sortBy } = params

  return customFetch<PagedProductResponse>({
    url: '/api/products',
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

export interface ProductDetailData {
  productId: string
  productCode: string
  name: string
  description: string
  price: number
  brandName: string
  status: string
  categoryId: number
  categoryName: string
  imageUrls: string[]
  totalStock: number
  batchCount: number
  createdAt: string
  updatedAt: string
}

export interface ProductDetailResponse {
  code: number
  message: string
  success: boolean
  data: ProductDetailData
  timestamp: string
}

export async function fetchProductByIdApi(productId: string): Promise<ProductDetailResponse> {
  return customFetch<ProductDetailResponse>({
    url: `/api/products/${productId}`,
    method: 'GET'
  })
}

export interface CategoryData {
  categoryId: number
  name: string
  description?: string
  status: string
  createdAt?: string
  updatedAt?: string
}

export interface ListCategoryResponse {
  code: number
  message: string
  success: boolean
  data: CategoryData[]
  timestamp: string
}

export async function fetchCategoriesApi(): Promise<ListCategoryResponse> {
  return customFetch<ListCategoryResponse>({
    url: '/api/categories',
    method: 'GET'
  })
}

export interface ProductManagementItem {
  productId: string
  productCode: string
  name: string
  price: number
  brandName: string
  status: 'ACTIVE' | 'INACTIVE' | 'DELETED'
  imageUrls: string[]
  totalStock: number
  batchCount: number
  createdAt: string
  updatedAt: string
}

export interface PagedProductManagementResponse {
  code: number
  message: string
  success: boolean
  data: {
    totalElements: number
    totalPages: number
    first: boolean
    last: boolean
    size: number
    number: number
    numberOfElements: number
    empty: boolean
    content: ProductManagementItem[]
  }
  timestamp: string
}

export interface FetchProductsManagementParams {
  keyword?: string
  categoryId?: number
  brandName?: string
  status?: 'ACTIVE' | 'INACTIVE' | 'DELETED'
  sortBy?: string
  page?: number
  size?: number
}

export async function fetchProductsManagementApi(
  params: FetchProductsManagementParams = {}
): Promise<PagedProductManagementResponse> {
  const { keyword, categoryId, brandName, status, sortBy, page = 0, size = 10 } = params

  return customFetch<PagedProductManagementResponse>({
    url: '/api/products/management',
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

export interface UpdateProductPayload {
  name: string
  price: number
  brandName: string
  status: 'ACTIVE' | 'INACTIVE' | 'DELETED'
  categoryId?: number
  description?: string
}

export interface UpdateProductResponse {
  code: number
  message: string
  success: boolean
  data: ProductManagementItem
  timestamp: string
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
    url: `/api/products/${productId}`,
    method: 'PATCH',
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    data: formData
  })
}


