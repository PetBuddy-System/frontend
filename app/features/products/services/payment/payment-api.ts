/**
 * Products feature — payment API service.
 * Chứa tất cả payment-related API functions cho customer-facing pages.
 */

import { env } from '~/shared/config/env'
import { customFetch } from '~/api/mutator/custom-fetch'
import type { PaymentResponse, ApiResponse } from '~/shared/lib/payment'

const PAYMENT_BASE_URL = `${env.API_URL}${env.API_PAYMENTS_PATH}`

/**
 * GET /api/payments/{orderId}
 * Lấy thông tin payment (gồm clientSecret nếu là CARD) theo orderId.
 */
export async function getPaymentByOrderIdApi(orderId: number): Promise<ApiResponse<PaymentResponse>> {
  return customFetch<ApiResponse<PaymentResponse>>({
    url: `${PAYMENT_BASE_URL}/${orderId}`,
    method: 'GET'
  })
}
