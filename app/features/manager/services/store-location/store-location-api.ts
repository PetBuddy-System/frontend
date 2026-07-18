import { env } from '~/shared/config/env'
import { customFetch } from '~/api/mutator/custom-fetch'
import type {
  StoreLocationRequest,
  StoreLocationResponse,
  ApiResponse
} from '~/shared/lib/store-location'

const STORE_LOCATIONS_BASE_URL = `${env.API_URL}/api/store-locations`

export async function createStoreLocationApi(
  request: StoreLocationRequest
): Promise<ApiResponse<StoreLocationResponse>> {
  return customFetch<ApiResponse<StoreLocationResponse>>({
    url: STORE_LOCATIONS_BASE_URL,
    method: 'POST',
    data: request
  })
}

export async function getCurrentStoreLocationApi(): Promise<ApiResponse<StoreLocationResponse>> {
  return customFetch<ApiResponse<StoreLocationResponse>>({
    url: `${STORE_LOCATIONS_BASE_URL}/current`,
    method: 'GET'
  })
}

export async function getAllStoreLocationsApi(): Promise<ApiResponse<StoreLocationResponse[]>> {
  return customFetch<ApiResponse<StoreLocationResponse[]>>({
    url: STORE_LOCATIONS_BASE_URL,
    method: 'GET'
  })
}

export async function getStoreLocationByIdApi(
  id: number
): Promise<ApiResponse<StoreLocationResponse>> {
  return customFetch<ApiResponse<StoreLocationResponse>>({
    url: `${STORE_LOCATIONS_BASE_URL}/${id}`,
    method: 'GET'
  })
}

export async function updateStoreLocationApi(
  id: number,
  request: StoreLocationRequest
): Promise<ApiResponse<StoreLocationResponse>> {
  return customFetch<ApiResponse<StoreLocationResponse>>({
    url: `${STORE_LOCATIONS_BASE_URL}/${id}`,
    method: 'PUT',
    data: request
  })
}
