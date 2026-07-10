/**
 * Store Location types — chỉ chứa types/interfaces, không có API functions.
 * API functions nằm trong features/manager/services/.
 */

export interface StoreLocationRequest {
  latitude: number
  longitude: number
  address: string
}

export interface StoreLocationResponse {
  id: number
  latitude: number
  longitude: number
  address: string
  active: boolean
  createdAt: string
  deactivatedAt?: string | null
}

export interface ApiResponse<T> {
  code?: number
  message?: string
  success?: boolean
  data: T
  timestamp?: string
}
