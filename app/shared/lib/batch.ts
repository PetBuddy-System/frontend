// app/shared/lib/batch.ts
import { customFetch } from '~/api/mutator/custom-fetch'

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
    | 'date_desc'    // Mặc định - sắp xếp theo ngày tạo mới nhất
    | 'date_asc'     // Sắp xếp theo ngày tạo cũ nhất
    | 'stock_asc'    // Sắp xếp theo tồn kho tăng dần
    | 'stock_desc'   // Sắp xếp theo tồn kho giảm dần
    | 'expiry_asc'   // Sắp xếp theo ngày hết hạn gần nhất (sắp hết hạn)
    | 'expiry_desc'  // Sắp xếp theo ngày hết hạn xa nhất

export interface FetchProductBatchesParams {
    keyword?: string
    status?: 'ACTIVE' | 'INACTIVE' | 'DELETED'
    page?: number
    size?: number
    sortBy?: BatchSortBy
}

// ============================================================
// API FUNCTION
// ============================================================

/**
 * Lấy danh sách lô hàng của sản phẩm
 * GET /api/products/{productId}/batches
 * 
 * @param productId - ID của sản phẩm
 * @param params - Các tham số filter, phân trang
 * @returns Danh sách lô hàng có phân trang
 */
export async function fetchProductBatchesApi(
    productId: string,
    params: FetchProductBatchesParams = {}
): Promise<PagedProductBatchResponse> {
    const {
        keyword,
        status,
        page = 0,
        size = 10,
        sortBy = 'date_desc'
    } = params

    return customFetch<PagedProductBatchResponse>({
        url: `/api/products/${productId}/batches`,
        method: 'GET',
        params: {
            keyword: keyword || undefined,
            status: status || undefined,
            page,
            size,
            sortBy
        }
    })
}

// ============================================================
// CREATE BATCH (TẠO LÔ HÀNG MỚI)
// ============================================================

export interface CreateBatchPayload {
  stockQuantity: number
  expiryDate: string  // format: YYYY-MM-DD
}

export interface CreateBatchResponse {
  code: number
  message: string
  success: boolean
  data: ProductBatchItem  // Dữ liệu trả về giống ProductBatchItem
  timestamp: string
}

/**
 * Tạo một hoặc nhiều lô hàng cho sản phẩm
 * POST /api/products/{productId}/batches
 * Giới hạn tối đa 10 batch/lần tạo
 * 
 * @param productId - ID của sản phẩm
 * @param payload - Mảng các lô hàng cần tạo
 * @returns Danh sách lô hàng đã tạo
 */
export async function createBatchesApi(
  productId: string,
  payload: CreateBatchPayload[]
): Promise<CreateBatchResponse> {
  return customFetch<CreateBatchResponse>({
    url: `/api/products/${productId}/batches`,
    method: 'POST',
    data: payload  // payload là mảng các batch
  })
}