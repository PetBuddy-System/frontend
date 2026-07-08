// ============
// TYPES
// ============

export enum AuditEntityType {
    PRODUCT = 'PRODUCT',
    PROMOTION = 'PROMOTION',
    BATCH = 'BATCH',
}

export enum AuditAction {
    CREATE = 'CREATE',
    UPDATE = 'UPDATE',
    DELETE = 'DELETE'
}

export interface AuditChange {
    field: string
    oldValue: string | null
    newValue: string | null
}

export interface AuditLog {
    id: string
    entityType: AuditEntityType
    entityId: string
    action: AuditAction
    changes: AuditChange[] | null
    reason: string | null
    note: string | null
    performedBy: string
    performedAt: string
}

export interface AuditLogFilter {
    entityType?: AuditEntityType
    entityCode?: string
    action?: AuditAction
    fromDate?: string
    toDate?: string
    performedBy?: string
    page?: number
    size?: number
}

export interface ApiResponse<T> {
    code: number
    message: string
    success: boolean
    data: T
    timestamp: string
}

export interface PagedAuditResponse {
    code: number
    message: string
    success: boolean
    data: {
        content: AuditLog[]
        pageable: {
            pageNumber: number
            pageSize: number
            sort: {
                empty: boolean
                sorted: boolean
                unsorted: boolean
            }
            offset: number
            paged: boolean
            unpaged: boolean
        }
        totalPages: number
        totalElements: number
        last: boolean
        first: boolean
        size: number
        number: number
        numberOfElements: number
        empty: boolean
    }
    timestamp: string
}

export interface AuditDetailResponse {
    code: number
    message: string
    success: boolean
    data: AuditLog
    timestamp: string
}

// ============================================================
// HELPERS
// ============================================================

export function parsePromotionDetail(text: string | null): {
    code: string
    name: string
    type: string
    value: string
} | null {
    if (!text) return null
    const parts = text.split('|')
    if (parts.length < 4) return null
    return {
        code: parts[0],
        name: parts[1],
        type: parts[2],
        value: parts[3]
    }
}

export function parsePromotionDetails(text: string | null): Array<{
    code: string
    type: string
    value: string
}> {
    if (!text) return []
    try {
        const cleaned = text.replace(/[\[\]]/g, '')
        if (!cleaned) return []
        return cleaned.split(', ').map((item) => {
            const parts = item.split(':')
            return {
                code: parts[0] || '',
                type: parts[1] || '',
                value: parts[2] || ''
            }
        })
    } catch {
        return []
    }
}