/**
 * Auth feature — password API service.
 */

import { env } from '~/shared/config/env'
import { customFetch } from '~/api/mutator/custom-fetch'
import type {
  ApiResponse,
  OtpRequest,
  ResetPasswordRequest
} from '~/shared/lib/auth'

const AUTH_BASE_URL = `${env.API_AUTH_PATH}`

export async function forgotPasswordApi(
  email: string
): Promise<ApiResponse<void>> {
  return customFetch<ApiResponse<void>>({
    url: `${AUTH_BASE_URL}/forgot-password`,
    method: 'POST',
    data: { email } satisfies OtpRequest
  })
}

export async function resetPasswordApi(
  data: ResetPasswordRequest
): Promise<ApiResponse<void>> {
  return customFetch<ApiResponse<void>>({
    url: `${AUTH_BASE_URL}/reset-password`,
    method: 'POST',
    data
  })
}
