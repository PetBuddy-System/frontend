/**
 * Admin feature — shipping API service.
 * Chỉ export functions thực sự được sử dụng trong feature.
 */

import { env } from '~/shared/config/env'
import { customFetch } from '~/api/mutator/custom-fetch'
import type {
  ShippingRule,
  ShippingRuleRequest,
  ShippingRuleResponse,
  ApiResponse
} from '~/shared/lib/shipping'

const SHIPPING_BASE_URL = `${env.API_URL}${env.API_SHIPPING_PATH}`

export async function fetchAllShippingRulesApi(): Promise<ApiResponse<ShippingRule[]>> {
  return customFetch<ApiResponse<ShippingRule[]>>({
    url: SHIPPING_BASE_URL,
    method: 'GET'
  })
}

export async function createShippingRuleApi(data: ShippingRuleRequest): Promise<ApiResponse<ShippingRuleResponse>> {
  return customFetch<ApiResponse<ShippingRuleResponse>>({
    url: SHIPPING_BASE_URL,
    method: 'POST',
    data
  })
}

export async function updateShippingRuleApi(id: number, data: ShippingRuleRequest): Promise<ApiResponse<ShippingRuleResponse>> {
  return customFetch<ApiResponse<ShippingRuleResponse>>({
    url: `${SHIPPING_BASE_URL}/${id}`,
    method: 'PUT',
    data
  })
}

export async function deleteShippingRuleApi(id: number): Promise<ApiResponse<void>> {
  return customFetch<ApiResponse<void>>({
    url: `${SHIPPING_BASE_URL}/${id}`,
    method: 'DELETE'
  })
}
