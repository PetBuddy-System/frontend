/**
 * Product types — chỉ chứa types/interfaces, không có API functions.
 * API functions nằm trong features/services/.
 */

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

export interface CreateProductPayload {
  name: string
  price: number
  brandName: string
  categoryId: number
  description?: string
}

export interface CreateProductResponse {
  code: number
  message: string
  success: boolean
  data: ProductManagementItem
  timestamp: string
}

export interface ImportProductsResult {
  canImport: boolean
  createdProducts: number
  createdBatches: number
  warnings: string[]
  errors: string[]
}

export interface ImportProductsResponse {
  code: number
  message: string
  success: boolean
  data: ImportProductsResult
  timestamp: string
}
