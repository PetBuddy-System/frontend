/**
 * Batch types — chỉ chứa types/interfaces, không có API functions.
 * API functions nằm trong features/services/.
 */

export interface ProductBatchItem {
    batchId: string
    batchCode: string
    productId: string
    productCode: string
    productName: string
    stockQuantity: number
    expiryDate: string
    status: 'ACTIVE' | 'INACTIVE' | 'DELETED'
    deletedAt: string | null
    createdAt: string
    updatedAt: string
}

export interface PagedProductBatchResponse {
    code: number
    message: string
    success: boolean
    data: {
        totalElements: number
        totalPages: number
        first: boolean
        last: boolean
        pageable: {
            paged: boolean
            pageNumber: number
            pageSize: number
            offset: number
            sort: {
                sorted: boolean
                empty: boolean
                unsorted: boolean
            }
            unpaged: boolean
        }
        size: number
        content: ProductBatchItem[]
        number: number
        sort: {
            sorted: boolean
            empty: boolean
            unsorted: boolean
        }
        numberOfElements: number
        empty: boolean
    }
    timestamp: string
}

export type BatchSortBy =
    | 'date_desc'
    | 'date_asc'
    | 'stock_asc'
    | 'stock_desc'
    | 'expiry_asc'
    | 'expiry_desc'

export interface FetchProductBatchesParams {
    keyword?: string
    status?: 'ACTIVE' | 'INACTIVE' | 'DELETED'
    page?: number
    size?: number
    sortBy?: BatchSortBy
}

export interface CreateBatchPayload {
  stockQuantity: number
  expiryDate: string
}

export interface CreateBatchResponse {
  code: number
  message: string
  success: boolean
  data: ProductBatchItem
  timestamp: string
}

export interface UpdateBatchPayload {
    stockQuantity?: number
    expiryDate?: string
    status?: 'ACTIVE' | 'INACTIVE' | 'DELETED'
}

export interface UpdateBatchResponse {
    code: number
    message: string
    success: boolean
    data: ProductBatchItem
    timestamp: string
}
