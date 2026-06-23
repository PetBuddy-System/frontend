/**
 * Shipping types — chỉ chứa types/interfaces, không có API functions.
 * API functions nằm trong features/services/.
 */

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
