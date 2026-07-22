/**
 * Auth feature — OTP API service.
 */

import { env } from '~/shared/config/env'
import { customFetch } from '~/api/mutator/custom-fetch'
import type { ApiResponse, OtpRequest, ResetOtpResponse, VerifyEmailRequest } from '~/shared/lib/auth'

const AUTH_BASE_URL = `${env.API_URL}${env.API_AUTH_PATH}`

export async function verifyEmailApi(data: VerifyEmailRequest): Promise<ApiResponse<void>> {
  return customFetch<ApiResponse<void>>({
    url: `${AUTH_BASE_URL}/verify-email`,
    method: 'POST',
    data
  })
}

/**
 * Verify OTP cho luồng quên mật khẩu. Trả về `resetToken` dùng để gọi
 * `/reset-password` (chỉ dùng 1 lần, có TTL ngắn).
 */
export async function verifyResetOtpApi(data: VerifyEmailRequest): Promise<ApiResponse<ResetOtpResponse>> {
  return customFetch<ApiResponse<ResetOtpResponse>>({
    url: `${AUTH_BASE_URL}/verify-reset-otp`,
    method: 'POST',
    data
  })
}

export async function resendOtpApi(email: string): Promise<ApiResponse<void>> {
  return customFetch<ApiResponse<void>>({
    url: `${AUTH_BASE_URL}/resend-otp`,
    method: 'POST',
    data: { email } satisfies OtpRequest
  })
}
