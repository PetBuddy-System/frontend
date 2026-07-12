import { env } from '~/shared/config/env'
import { customFetch } from '~/api/mutator/custom-fetch'
import type { ApiResponse, PageResponse } from '~/shared/lib/order'
import type {
  CalculateRefundRequest,
  CalculateRefundResponse,
  CreateReturnRequest,
  ReturnRequestResponse
} from '~/shared/lib/returns'

const RETURNS_BASE_URL = `${env.API_URL}/api/returns`

export async function fetchMyReturnsApi(
  params: { page?: number; size?: number } = {}
): Promise<ApiResponse<PageResponse<ReturnRequestResponse>>> {
  const { page = 0, size = 10 } = params

  return customFetch<ApiResponse<PageResponse<ReturnRequestResponse>>>({
    url: `${RETURNS_BASE_URL}/my`,
    method: 'GET',
    params: { page, size }
  })
}

export async function fetchReturnDetailApi(returnId: number): Promise<ApiResponse<ReturnRequestResponse>> {
  return customFetch<ApiResponse<ReturnRequestResponse>>({
    url: `${RETURNS_BASE_URL}/${returnId}`,
    method: 'GET'
  })
}

export async function calculateRefundApi(data: CalculateRefundRequest): Promise<ApiResponse<CalculateRefundResponse>> {
  return customFetch<ApiResponse<CalculateRefundResponse>>({
    url: `${RETURNS_BASE_URL}/calculate-refund`,
    method: 'POST',
    data
  })
}

export async function createReturnRequestApi(data: CreateReturnRequest): Promise<ApiResponse<ReturnRequestResponse>> {
  return customFetch<ApiResponse<ReturnRequestResponse>>({
    url: RETURNS_BASE_URL,
    method: 'POST',
    data
  })
}

export async function uploadReturnMediaApi(returnId: number, files: File[]): Promise<ApiResponse<string[]>> {
  const formData = new FormData()
  files.forEach((file) => {
    formData.append('files', file)
  })

  return customFetch<ApiResponse<string[]>>({
    url: `${RETURNS_BASE_URL}/${returnId}/media`,
    method: 'POST',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

export async function cancelReturnRequestApi(returnId: number): Promise<ApiResponse<ReturnRequestResponse>> {
  return customFetch<ApiResponse<ReturnRequestResponse>>({
    url: `${RETURNS_BASE_URL}/${returnId}/cancel`,
    method: 'PATCH'
  })
}
