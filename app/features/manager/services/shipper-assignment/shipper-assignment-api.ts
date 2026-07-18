/**
 * Manager feature — shipper assignment API service.
 */

import { env } from '~/shared/config/env'
import { customFetch } from '~/api/mutator/custom-fetch'
import type {
  ApiResponse,
  PageResponse,
  PageableParams,
  OrderResponse,
  ShipperSuggestionResponse,
  DeliveryStopResponse
} from '~/shared/lib/order'

const ORDER_BASE_URL = `${env.API_URL}${env.API_ORDERS_PATH}`
const SHIPPER_ASSIGNMENT_BASE_URL = `${env.API_URL}/api/shipper-assignment`

export async function fetchAllOrdersApi(
  params: PageableParams = {}
): Promise<ApiResponse<PageResponse<OrderResponse>>> {
  const { page, size, sort } = params

  return customFetch<ApiResponse<PageResponse<OrderResponse>>>({
    url: `${ORDER_BASE_URL}/all`,
    method: 'GET',
    params: { page, size, sort }
  })
}

export async function getShipperSuggestionsApi(
  orderId: number
): Promise<ApiResponse<ShipperSuggestionResponse[]>> {
  return customFetch<ApiResponse<ShipperSuggestionResponse[]>>({
    url: `${SHIPPER_ASSIGNMENT_BASE_URL}/${orderId}/shipper-suggestions`,
    method: 'GET'
  })
}

export async function assignShipperApi(
  orderId: number,
  staffId: string
): Promise<ApiResponse<void>> {
  return customFetch<ApiResponse<void>>({
    url: `${SHIPPER_ASSIGNMENT_BASE_URL}/${orderId}/assign-shipper`,
    method: 'POST',
    params: { staffId }
  })
}

export async function suggestDeliveryRouteApi(
  staffId: string
): Promise<ApiResponse<DeliveryStopResponse[]>> {
  return customFetch<ApiResponse<DeliveryStopResponse[]>>({
    url: `${SHIPPER_ASSIGNMENT_BASE_URL}/${staffId}/delivery-route`,
    method: 'GET',
    params: { staffId }
  })
}
