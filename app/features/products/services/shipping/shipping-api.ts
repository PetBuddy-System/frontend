/**
 * Products feature — shipping API service (customer-facing).
 * Chứa shipping-related API functions cho customer-facing pages.
 */

import { env } from '~/shared/config/env'
import { customFetch } from '~/api/mutator/custom-fetch'
import type {
  ShippingFeeResponse,
  ApiResponse
} from '~/shared/lib/shipping'

const SHIPPING_BASE_URL = `${env.LOCALHOST_API_URL || env.API_URL}${env.API_SHIPPING_PATH}`

export async function calculateShippingFeeApi(latitude: number, longitude: number): Promise<ApiResponse<ShippingFeeResponse>> {
  return customFetch<ApiResponse<ShippingFeeResponse>>({
    url: `${SHIPPING_BASE_URL}/fee`,
    method: 'GET',
    params: { latitude, longitude }
  })
}
