// manager/services/promotion/promotion-api.ts
import { env } from '~/shared/config/env'
import { customFetch } from '~/api/mutator/custom-fetch'

// Request params
export interface GetPromotionsParams {
  keyword?: string
  status?: 'DRAFT' | 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | 'DELETED'
  page?: number
  size?: number
  sortBy?: 'createdAt_asc' | 'createdAt_desc' | 'endDate_asc' | 'endDate_desc' | 'startDate_asc' | 'startDate_desc'
}

// Response - promotion detail item (sản phẩm trong chương trình)
export interface PromotionDetail {
  promotionDetailId: string
  productId: string
  productName: string
  productCode: string
  price: number
  discountType: 'PERCENTAGE' | 'FIXED'
  discountValue: number
  salePrice: number
  discountAmount: number
}

// Response - Single Promotion
export interface Promotion {
  promotionId: string
  name: string
  description: string
  startDate: string
  endDate: string
  status: 'DRAFT' | 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | 'DELETED'
  createdAt?: string
  updatedAt?: string
  promotionDetails?: PromotionDetail[]
}

// Response - Pagination
export interface PromotionResponse {
  code: number
  message: string
  success: boolean
  data: {
    totalPages: number
    totalElements: number
    size: number
    content: Promotion[]
    number: number
    sort: { empty: boolean; sorted: boolean; unsorted: boolean }
    first: boolean
    last: boolean
    numberOfElements: number
    pageable: {
      offset: number
      sort: { empty: boolean; sorted: boolean; unsorted: boolean }
      pageSize: number
      pageNumber: number
      paged: boolean
      unpaged: boolean
    }
    empty: boolean
  }
  timestamp: string
}

// Create DTO
export interface CreatePromotionDTO {
  name: string
  description: string
  startDate: string
  endDate: string
  status: 'DRAFT' | 'ACTIVE'
  promotionDetails: Array<{
    productId: string
    discountType: 'PERCENTAGE' | 'FIXED'
    discountValue: number
  }>
}

export interface UpdatePromotionDTO extends Partial<CreatePromotionDTO> {
  status?: 'DRAFT' | 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | 'DELETED'
}

const PROMOTIONS_BASE_URL = `${env.API_URL}/api/promotions`

export const promotionApi = {
  // GET /api/promotions - Danh sách promotion có phân trang
  getPromotions: async (params: GetPromotionsParams = {}): Promise<PromotionResponse> => {
    const { keyword, status, page = 0, size = 10, sortBy = 'createdAt_desc' } = params

    return customFetch<PromotionResponse>({
      url: PROMOTIONS_BASE_URL,
      method: 'GET',
      params: {
        keyword: keyword || undefined,
        status: status || undefined,
        page,
        size,
        sortBy
      }
    })
  },

  // POST /api/promotions - Tạo promotion
  createPromotion: async (data: CreatePromotionDTO): Promise<Promotion> => {
    const response = await customFetch<{ data: Promotion }>({
      url: PROMOTIONS_BASE_URL,
      method: 'POST',
      data
    })
    return response.data
  },

  // GET /api/promotions/{promotionId} - Chi tiết promotion (có promotionDetails)
  getPromotion: async (promotionId: string): Promise<Promotion> => {
    const response = await customFetch<{ data: Promotion }>({
      url: `${PROMOTIONS_BASE_URL}/${promotionId}`,
      method: 'GET'
    })
    return response.data
  },

  // PATCH /api/promotions/{promotionId} - Cập nhật promotion
  updatePromotion: async (promotionId: string, data: UpdatePromotionDTO): Promise<Promotion> => {
    const response = await customFetch<{ data: Promotion }>({
      url: `${PROMOTIONS_BASE_URL}/${promotionId}`,
      method: 'PATCH',
      data
    })
    return response.data
  },

  // DELETE /api/promotions/{promotionId} - Xóa promotion
  deletePromotion: async (promotionId: string): Promise<void> => {
    await customFetch({
      url: `${PROMOTIONS_BASE_URL}/${promotionId}`,
      method: 'DELETE'
    })
  }
}
