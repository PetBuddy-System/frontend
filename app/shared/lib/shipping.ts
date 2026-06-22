import { env } from '~/shared/config/env'
import { customFetch } from '~/api/mutator/custom-fetch'

const SHIPPING_BASE_URL = `${env.LOCALHOST_API_URL || env.API_URL}/api/shipping-rules`

export interface ShippingRule {
  id: number
  minDistance: number
  maxDistance: number
  fee: number
}

export interface ShippingRuleRequest {
  minDistance: number
  maxDistance: number
  fee: number
}

export interface ShippingRuleResponse {
  id: number
  minDistance: number
  maxDistance: number
  fee: number
}

export interface ShippingFeeResponse {
  distanceKm: number
  shippingFee: number
  freeShipping: boolean
}

export interface ApiResponse<T> {
  code?: number
  message?: string
  success?: boolean
  data: T
  timestamp?: string
}

export async function fetchAllShippingRulesApi(): Promise<ApiResponse<ShippingRule[]>> {
  return customFetch<ApiResponse<ShippingRule[]>>({
    url: SHIPPING_BASE_URL,
    method: 'GET'
  })
}

export async function fetchShippingRuleByIdApi(id: number): Promise<ApiResponse<ShippingRule>> {
  return customFetch<ApiResponse<ShippingRule>>({
    url: `${SHIPPING_BASE_URL}/${id}`,
    method: 'GET'
  })
}

export async function calculateShippingFeeApi(latitude: number, longitude: number): Promise<ApiResponse<ShippingFeeResponse>> {
  return customFetch<ApiResponse<ShippingFeeResponse>>({
    url: `${SHIPPING_BASE_URL}/fee`,
    method: 'GET',
    params: { latitude, longitude }
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
