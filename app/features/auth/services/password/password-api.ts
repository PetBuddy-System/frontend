/**
 * Auth feature — password API service.
 */

import { env } from '~/shared/config/env'
import { customFetch } from '~/api/mutator/custom-fetch'
import type { ApiResponse, OtpRequest, PasswordUpdateRequest, ResetPasswordRequest } from '~/shared/lib/auth'

const AUTH_BASE_URL = `${env.API_URL}${env.API_AUTH_PATH}`

export async function forgotPasswordApi(email: string): Promise<ApiResponse<void>> {
  return customFetch<ApiResponse<void>>({
    url: `${AUTH_BASE_URL}/forgot-password`,
    method: 'POST',
    data: { email } satisfies OtpRequest
  })
}

export async function resetPasswordApi(data: ResetPasswordRequest): Promise<ApiResponse<void>> {
  return customFetch<ApiResponse<void>>({
    url: `${AUTH_BASE_URL}/reset-password`,
    method: 'POST',
    data
  })
}

/**
 * Đổi mật khẩu cho user đã đăng nhập (Bearer token tự inject qua interceptor).
 * BE yêu cầu 3 trường: oldPassword, newPassword, confirmNewPassword.
 */
export async function changePasswordApi(data: PasswordUpdateRequest): Promise<ApiResponse<void>> {
  return customFetch<ApiResponse<void>>({
    url: `${AUTH_BASE_URL}/change-password`,
    method: 'POST',
    data
  })
}
