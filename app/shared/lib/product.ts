/**
 * Product types — chỉ chứa types/interfaces, không có API functions.
 * API functions nằm trong features/services/.
 */

export type ProductUnit =
  | 'PIECE'
  | 'BAG'
  | 'BOX'
  | 'PACK'
  | 'BOTTLE'
  | 'CAN'
  | 'TUBE'
  | 'SET'

export const ProductUnitLabels: Record<ProductUnit, string> = {
  'PIECE': 'Cái',
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
  unit?: ProductUnit
  promotionPrice?: number
  weight?: number
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
  weight?: number
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
  hasActivePromotion?: boolean
  weight?: number  // ✅ Thêm weight
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
  salePrice: number
  brandName: string
  status: 'ACTIVE' | 'INACTIVE' | 'DELETED'
  categoryId?: number
  description?: string
  ingredients?: string
  usageInstructions?: string
  unit?: ProductUnit
  thumbnailMediaId?: number
  weight?: number  // ✅ Thêm weight
  reason?: string
  note?: string
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
  unit?: ProductUnit
  weight: number  // ✅ Thêm weight (bắt buộc)
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

// ─── Product Reviews ────────────────────────────────────────────────────────
export interface ProductReview {
  reviewId: string
  productId: string
  productName: string
  userId: string
  fullName: string
  avatar: string | null
  rating: number
  content: string
  anonymous: boolean
  status: 'ACTIVE' | 'INACTIVE' | 'DELETED' | string
  createdAt: string
  updatedAt: string
}

export interface PagedProductReviewResponse {
  code: number
  message: string
  success: boolean
  data: {
    content: ProductReview[]
    pageable: {
      pageNumber: number
      pageSize: number
    }
    totalElements: number
    totalPages: number
    size: number
    number: number
    empty: boolean
  }
  timestamp: string
}

export interface ProductReviewMeResponse {
  code: number
  message: string
  success: boolean
  data: ProductReview | null
  timestamp: string
}

export interface CreateProductReviewPayload {
  rating: number
  content: string
  anonymous: boolean
}

// ─── Manager Reviews ────────────────────────────────────────────────────────
export interface ManagerReviewItem {
  reviewId: string
  rating: number
  content: string
  anonymous: boolean
  status: 'ACTIVE' | 'HIDDEN' | 'DELETED' | string
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  productId: string
  productCode: string
  productName: string
  orderId: number | null
  orderCode: string | null
  userId: string
  userEmail: string
  userFullName: string
  userAvatar: string | null
}

export interface PagedManagerReviewResponse {
  code: number
  message: string
  success: boolean
  data: {
    content: ManagerReviewItem[]
    pageable: {
      pageNumber: number
      pageSize: number
    }
    totalElements: number
    totalPages: number
    size: number
    number: number
    empty: boolean
  }
  timestamp: string
}

export interface ManagerReviewDetailResponse {
  code: number
  message: string
  success: boolean
  data: ManagerReviewItem
  timestamp: string
}