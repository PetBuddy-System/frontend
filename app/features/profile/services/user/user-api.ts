/**
 * User service — đọc thông tin user theo id.
 *
 * Lưu ý: BE không có endpoint `/api/auth/profile`. Để lấy UserResponse
 * cho user hiện tại, FE decode JWT (claim `sub`) để lấy userId rồi gọi
 * `GET /api/users/{userId}`.
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
