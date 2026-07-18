import { env } from '~/shared/config/env'
import { customFetch } from '~/api/mutator/custom-fetch'
import type {
  ShippingRule,
  ShippingFeeResponse,
  ApiResponse
} from '~/shared/lib/shipping'

const SHIPPING_BASE_URL = `${env.API_URL}${env.API_SHIPPING_PATH}`

export async function calculateShippingFeeApi(latitude: number, longitude: number): Promise<ApiResponse<ShippingFeeResponse>> {
  return customFetch<ApiResponse<ShippingFeeResponse>>({
    url: `${SHIPPING_BASE_URL}/fee`,
    method: 'GET',
    params: { latitude, longitude }
  })
}

export async function fetchShippingRulesApi(): Promise<ApiResponse<ShippingRule[]>> {
  return customFetch<ApiResponse<ShippingRule[]>>({
    url: SHIPPING_BASE_URL,
    method: 'GET'
  })
}
