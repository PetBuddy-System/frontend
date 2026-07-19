import { env } from '~/shared/config/env'
import { customFetch } from '~/api/mutator/custom-fetch'
import type { ApiResponse, OrderStatus } from '~/shared/lib/order'

export interface DeliveryStop {
  orderId: number
  orderCode: string
  address: string
  recipientName: string
  phoneNumber: string
  sequence: number
  distanceFromPreviousKm: number
  status: OrderStatus
  finalAmount: number
  paymentMethod: 'CASH' | 'CARD' | 'MOMO' | null
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | (string & {}) | null
  estimatedDeliveryAt?: string
}

export async function fetchDeliveryRouteApi(
  staffId: number | string
): Promise<ApiResponse<DeliveryStop[]>> {
  return customFetch<ApiResponse<DeliveryStop[]>>({
    url: `${env.API_URL}/api/shipper-assignment/${staffId}/delivery-route`,
    method: 'GET'
  })
}