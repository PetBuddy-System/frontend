/**
 * Auth feature — OTP API service.
 */

import { env } from '~/shared/config/env'
import { customFetch } from '~/api/mutator/custom-fetch'
import type {
  ApiResponse,
  OtpRequest,
  VerifyEmailRequest
} from '~/shared/lib/auth'

const AUTH_BASE_URL = `${env.API_AUTH_PATH}`

export async function verifyEmailApi(
  data: VerifyEmailRequest
): Promise<ApiResponse<void>> {
  return customFetch<ApiResponse<void>>({
    url: `${AUTH_BASE_URL}/verify-email`,
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
