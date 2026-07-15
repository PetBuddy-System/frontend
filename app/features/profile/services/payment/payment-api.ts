// app/features/profile/services/payment/payment-api.ts
import { env } from '~/shared/config/env'
import { customFetch } from '~/api/mutator/custom-fetch'
import type { ApiResponse } from '~/shared/lib/payment'
import type { PaymentResponse } from '~/shared/lib/payment'

/**
 * GET /api/payments/{orderId}
 * Lấy thông tin thanh toán của order
 */
export const fetchPaymentByOrderIdApi = (orderId: number): Promise<ApiResponse<PaymentResponse>> => {
    return customFetch<ApiResponse<PaymentResponse>>({
        url: `${env.API_URL}/api/payments/${orderId}`,
        method: 'GET'
    })
}