import { env } from '~/shared/config/env'
import { customFetch } from '~/api/mutator/custom-fetch'
import type { PaymentResponse, ApiResponse, PaymentMethod } from '~/shared/lib/payment'

const PAYMENT_BASE_URL = `${env.API_URL}${env.API_PAYMENTS_PATH}`

export async function getPaymentByOrderIdApi(orderId: number): Promise<ApiResponse<PaymentResponse>> {
  return customFetch<ApiResponse<PaymentResponse>>({
    url: `${PAYMENT_BASE_URL}/${orderId}`,
    method: 'GET'
  })
}

export async function updatePaymentMethodApi(orderId: number, paymentMethod: PaymentMethod): Promise<ApiResponse<PaymentResponse>> {
  return customFetch<ApiResponse<PaymentResponse>>({
    url: `${PAYMENT_BASE_URL}/method/${orderId}`,
    method: 'PUT',
    params: { paymentMethod }
  })
}

export async function retryMomoPaymentApi(orderId: number): Promise<ApiResponse<PaymentResponse>> {
  return customFetch<ApiResponse<PaymentResponse>>({
    url: `${PAYMENT_BASE_URL}/${orderId}/momo/retry`,
    method: 'POST'
  })
}

export async function retryVnPayPaymentApi(orderId: number): Promise<ApiResponse<PaymentResponse>> {
  return customFetch<ApiResponse<PaymentResponse>>({
    url: `${PAYMENT_BASE_URL}/${orderId}/vnpay/retry`,
    method: 'POST'
  })
}
