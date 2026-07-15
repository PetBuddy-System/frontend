// ~/shared/lib/restock.ts

export interface RestockBatch {
    batchId: string
    batchCode: string
    deductedQuantity: number
    availableToRestock: number
    restockQuantity: number
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
    returnItems: Array<{
        returnItemId: number
        productName: string
        productImage?: string | null
        quantity: number
        refundAmount: number
    }>
}