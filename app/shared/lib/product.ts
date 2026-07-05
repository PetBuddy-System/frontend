/**
 * Product types — chỉ chứa types/interfaces, không có API functions.
 * API functions nằm trong features/services/.
 */

// ✅ Định nghĩa enum ProductUnit
export type ProductUnit =
  | 'PIECE'      // Cái
  | 'KG'         // Kilogram
  | 'GRAM'       // Gram
  | 'LITER'      // Lít
  | 'MILLILITER' // Milliliter
  | 'BAG'        // Túi
  | 'BOX'        // Hộp
  | 'PACK'       // Gói
  | 'BOTTLE'     // Chai
  | 'CAN'        // Lon
  | 'TUBE'       // Tuýp
  | 'SET'        // Bộ

// ✅ Helper để lấy label tiếng Việt
export const ProductUnitLabels: Record<ProductUnit, string> = {
  'PIECE': 'Cái',
  'KG': 'Kilogram',
  'GRAM': 'Gram',
  'LITER': 'Lít',
  'MILLILITER': 'Milliliter',
  'BAG': 'Túi',
  'BOX': 'Hộp',
  'PACK': 'Gói',
  'BOTTLE': 'Chai',
  'CAN': 'Lon',
  'TUBE': 'Tuýp',
  'SET': 'Bộ'
}

export interface ProductResponse {
  productId: string
  name: string
  price: number
  salePrice: number
  brandName: string
  thumbnail?: string
  thumbnailUrl?: string
  imageUrls?: string[] | null
  totalStock: number
  discountAmount?: number
  discountValue?: number
  hasActivePromotion?: boolean
  promotionName?: string
  promotionType?: 'PERCENTAGE' | 'FIXED_AMOUNT' | string
  unit?: ProductUnit  // ✅ Sử dụng ProductUnit
  promotionPrice?: number
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

// shared/lib/product/types.ts

export interface ProductDetailData {
  productId: string
  name: string
  description: string
  salePrice: number
  brandName: string
  categoryId: number
  categoryName: string
  totalStock: number
  discountAmount?: number | null
  discountValue?: number | null
  hasActivePromotion?: boolean
  promotionName?: string | null
  promotionPrice?: number
  promotionType?: 'PERCENTAGE' | 'FIXED_AMOUNT' | string
  unit?: ProductUnit
  ingredients?: string
  usageInstructions?: string
  // Các field có thể không có
  price?: number
  productCode?: string
  status?: string
  thumbnailUrl?: string
  thumbnailMediaId?: number
  batchCount?: number
  promotionDescription?: string | null
  promotionEndDate?: string | null
  createdAt?: string
  updatedAt?: string
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
  salePrice?: number
  brandName: string
  status: 'ACTIVE' | 'INACTIVE' | 'DELETED'
  thumbnailUrl?: string
  thumbnailMediaId?: number
  totalStock: number
  batchCount: number
  createdAt: string
  updatedAt: string
  unit?: ProductUnit
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
  nearExpiredDays?: number
}

export interface UpdateProductPayload {
  name: string
  salePrice: number  // 👈 Đổi từ price thành salePrice
  brandName: string
  status: 'ACTIVE' | 'INACTIVE' | 'DELETED'
  categoryId?: number
  description?: string
  ingredients?: string
  usageInstructions?: string
  unit?: ProductUnit
  thumbnailMediaId?: number
}

export interface UpdateProductResponse {
  code: number
  message: string
  success: boolean
  data: ProductManagementItem
  timestamp: string
}

// ✅ CẬP NHẬT: CreateProductPayload
export interface CreateProductPayload {
  name: string
  salePrice: number
  brandName: string
  categoryId: number
  description?: string
  ingredients?: string
  usageInstructions?: string
  unit?: ProductUnit  // ✅ Sử dụng ProductUnit
}

export interface CreateProductResponse {
  code: number
  message: string
  success: boolean
  data: ProductManagementItem
  timestamp: string
}

export type ProductImportErrorKey =
  | 'PRODUCT_NAME_REQUIRED'
  | 'PRODUCT_NAME_TOO_LONG'
  | 'PRODUCT_PRICE_INVALID'
  | 'PRODUCT_PRICE_TOO_HIGH'
  | 'CATEGORY_NAME_REQUIRED'
  | 'CATEGORY_NAME_TOO_LONG'
  | 'CATEGORY_NOT_FOUND'
  | 'STOCK_QUANTITY_INVALID'
  | 'STOCK_QUANTITY_TOO_HIGH'
  | 'PRODUCT_UNIT_REQUIRED'
  | 'PRODUCT_UNIT_INVALID'
  | 'DESCRIPTION_TOO_LONG'
  | 'BRAND_NAME_TOO_LONG'
  | 'INGREDIENTS_TOO_LONG'
  | 'USAGE_INSTRUCTIONS_TOO_LONG'
  | 'EXPIRY_DATE_INVALID'
  | 'BASE_PRICE_INVALID'
  | 'BASE_PRICE_MUST_BE_LESS_THAN_SALE_PRICE'
  | 'PRODUCT_INACTIVE'
  | 'INVALID_EXCEL_TEMPLATE'

export interface ImportProductsResult {
  success: boolean
  createdProducts: number
  createdBatches: number
  errors: Array<{
    row: number
    errorKey: ProductImportErrorKey
  }>
}

export interface ImportProductsResponse {
  code: number
  message: string
  success: boolean
  data: ImportProductsResult
  timestamp: string
}

export interface ProductVideoResponse {
  code: number
  message: string
  success: boolean
  data: {
    fileType: string
    fileUrl: string
    mediaFileId: number
  }
  timestamp: string
}

export interface ProductImageItem {
  mediaFileId: number
  fileUrl: string
  fileType: 'IMAGE' | 'VIDEO'
}

export interface ProductImagesResponse {
  code: number
  message: string
  success: boolean
  data: ProductImageItem[]
  timestamp: string
}
export interface UpdateProductImagesPayload {
  images?: File[]  // Danh sách ảnh mới (null: giữ nguyên, []: xóa hết)
  keepImageIds?: number[]  // Danh sách ID ảnh cũ muốn giữ lại
}

export interface UpdateProductImagesResponse {
  code: number
  message: string
  success: boolean
  timestamp: string
}

// ─── Update Video ──────────────────────────────────────────────────────────
export interface UpdateProductVideoPayload {
  video?: File | null  // video = null: giữ nguyên, video = empty: xóa
}

export interface UpdateProductVideoResponse {
  code: number
  message: string
  success: boolean
  timestamp: string
}