// app/features/manager/services/restock/restock-api.ts
import { env } from '~/shared/config/env'
import { customFetch } from '~/api/mutator/custom-fetch'
import type { ApiResponse } from '~/shared/lib/order'

const RESTOCK_URL = `${env.API_URL}/api/return-requests`

// ============ GET /restock-info Response ============
export interface RestockBatch {
    batchId: string
    batchCode: string
    deductedQuantity: number
    availableToRestock: number
    restockQuantity: number
    // ✅ Thêm 2 field mới
    restockedAt?: string | null
    restockedBy?: string | null
}

export interface RestockInfoItem {
    orderDetailId: number
    productName: string
    productImage?: string | null
    requestedQuantity: number
    batches: RestockBatch[]
}

export interface RestockInfoResponse {
    returnRequestId: number
    returnCode: string
    items: RestockInfoItem[]
}

// ============ POST /restock Request ============
export interface RestockBatchRequest {
    batchId: string
    restockQuantity: number
}

export interface RestockItemRequest {
    orderDetailId: number
    batches: RestockBatchRequest[]
}

export interface RestockRequest {
    items: RestockItemRequest[]
}

// ============ GET /management/returns Response ============
export interface RestockReturnItem {
    returnItemId: number
    productName: string
    productImage?: string | null
    quantity: number
    refundAmount: number
}

export interface RestockReturnResponse {
    returnRequestId: number
    returnCode: string
    orderCode: string
    requestedBy: {
        userId: string
        fullName: string
        email: string
    }
    type: string
    status: string
    createdAt: string
    returnItems: RestockReturnItem[]
    restockedAt?: string | null
}

export interface RestockReturnsResponse {
    content: RestockReturnResponse[]
    totalPages: number
    totalElements: number
    pageable: {
        pageNumber: number
        pageSize: number
        sort: {
            sorted: boolean
            unsorted: boolean
            empty: boolean
        }
        offset: number
        paged: boolean
        unpaged: boolean
    }
    last: boolean
    first: boolean
    size: number
    number: number
    sort: {
        sorted: boolean
        unsorted: boolean
        empty: boolean
    }
    numberOfElements: number
    empty: boolean
}

// ============ API Functions ============
export const restockApi = {
    /**
     * GET /api/return-requests/{returnRequestId}/restock-info
     * Lấy thông tin chi tiết sản phẩm và lô hàng để nhập kho
     */
    getRestockInfo: (returnRequestId: number): Promise<RestockInfoResponse> => {
        return customFetch<RestockInfoResponse>({
            url: `${RESTOCK_URL}/${returnRequestId}/restock-info`,
            method: 'GET'
        })
    },

    /**
     * POST /api/return-requests/{returnRequestId}/restock
     * Xác nhận nhập kho với số lượng cho từng lô
     */
    restock: (returnRequestId: number, data: RestockRequest): Promise<ApiResponse<void>> => {
        return customFetch<ApiResponse<void>>({
            url: `${RESTOCK_URL}/${returnRequestId}/restock`,
            method: 'POST',
            data
        }).then(res => {
            if (!res || Object.keys(res).length === 0) {
                return {
                    success: true,
                    code: 1000,
                    message: 'Nhập kho thành công',
                    data: undefined,
                    timestamp: new Date().toISOString()
                }
            }
            return res
        })
    },

    /**
     * GET /api/management/returns
     * Lấy danh sách các yêu cầu RETURN đã COMPLETED để nhập hàng
     */
    getRestockReturns: (
        params: { page?: number; size?: number; status?: string; keyword?: string } = {}
    ): Promise<ApiResponse<RestockReturnsResponse>> => {
        const { page = 0, size = 10, status = 'COMPLETED', keyword } = params
        return customFetch<ApiResponse<RestockReturnsResponse>>({
            url: `${env.API_URL}/api/management/returns`,
            method: 'GET',
            params: {
                page,
                size,
                status,
                type: 'RETURN',
                sort: 'createdAt,desc',
                ...(keyword && { keyword })
            }
        })
    }
}