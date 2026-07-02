import { env } from '~/shared/config/env'
import { customFetch } from '~/api/mutator/custom-fetch'
import type { PaymentResponse, ApiResponse } from '~/shared/lib/payment'

const PAYMENT_BASE_URL = `${env.API_URL}${env.API_PAYMENTS_PATH}`

export async function getPaymentByOrderIdApi(orderId: number): Promise<ApiResponse<PaymentResponse>> {
  return customFetch<ApiResponse<PaymentResponse>>({
    url: `${PAYMENT_BASE_URL}/${orderId}`,
    method: 'GET'
  })
}
