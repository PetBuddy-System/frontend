/**
 * User service — đọc và cập nhật thông tin user hiện tại.
 *
 * GET /api/users/me    — lấy thông tin user đang đăng nhập.
 * PUT /api/users/me    — cập nhật thông tin user (avatar, fullName, dateOfBirth, gender).
 *                        Email KHÔNG được phép sửa phía BE.
 */

import { customFetch } from '~/api/mutator/custom-fetch'
import { env } from '~/shared/config/env'
import type { ApiResponse, UserResponse } from '~/shared/lib/auth'

const USERS_BASE_URL = `${env.API_URL}/api/users`

export async function getUserByIdApi(userId: string): Promise<ApiResponse<UserResponse>> {
  return customFetch<ApiResponse<UserResponse>>({
    url: `${USERS_BASE_URL}/${userId}`,
    method: 'GET'
  })
}

export async function getCurrentUserApi(): Promise<ApiResponse<UserResponse>> {
  return customFetch<ApiResponse<UserResponse>>({
    url: `${USERS_BASE_URL}/me`,
    method: 'GET'
  })
}

export interface UpdateUserProfilePayload {
  fullName?: string
  dateOfBirth?: string
  gender?: string
}

export async function updateCurrentUserApi(
  payload: UpdateUserProfilePayload,
  avatarFile: File | null = null
): Promise<ApiResponse<UserResponse>> {
  const formData = new FormData()
  formData.append('data', JSON.stringify(payload))
  if (avatarFile) {
    formData.append('images', avatarFile)
  }

  return customFetch<ApiResponse<UserResponse>>({
    url: `${USERS_BASE_URL}/me`,
    method: 'PUT',
    data: formData
  })
}

export async function updateUserByIdApi(
  userId: string,
  payload: UpdateUserProfilePayload,
  avatarFile: File | null = null
): Promise<ApiResponse<UserResponse>> {
  const formData = new FormData()
  formData.append('data', JSON.stringify(payload))
  if (avatarFile) {
    formData.append('images', avatarFile)
  }

  return customFetch<ApiResponse<UserResponse>>({
    url: `${USERS_BASE_URL}/${userId}`,
    method: 'PUT',
    data: formData
  })
}

