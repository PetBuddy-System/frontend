/**
 * Auth feature — auth API service.
 */

import { env } from '~/shared/config/env'
import { customFetch } from '~/api/mutator/custom-fetch'
import type {
  ApiResponse,
  AuthenticationRequest,
  AuthenticationResponse,
  LogoutRequest,
  RefreshTokenRequest,
  UserCreationRequest,
  UserResponse
} from '~/shared/lib/auth'

const AUTH_BASE_URL = `${env.API_AUTH_PATH}`

export async function loginApi(
  data: AuthenticationRequest
): Promise<ApiResponse<AuthenticationResponse>> {
  return customFetch<ApiResponse<AuthenticationResponse>>({
    url: `${AUTH_BASE_URL}/login`,
    method: 'POST',
    data
  })
}

export async function logoutApi(token: string): Promise<void> {
  return customFetch<void>({
    url: `${AUTH_BASE_URL}/logout`,
    method: 'POST',
    data: { token } satisfies LogoutRequest
  })
}

export async function refreshTokenApi(
  refreshToken: string
): Promise<ApiResponse<AuthenticationResponse>> {
  return customFetch<ApiResponse<AuthenticationResponse>>({
    url: `${AUTH_BASE_URL}/refresh`,
    method: 'POST',
    data: { refreshToken } satisfies RefreshTokenRequest
  })
}

export async function getProfileApi(): Promise<ApiResponse<UserResponse>> {
  return customFetch<ApiResponse<UserResponse>>({
    url: `${AUTH_BASE_URL}/profile`,
    method: 'GET'
  })
}

export async function signupApi(
  data: UserCreationRequest
): Promise<ApiResponse<void>> {
  return customFetch<ApiResponse<void>>({
    url: `${AUTH_BASE_URL}/signup`,
    method: 'POST',
    data
  })
}

// ─── Role Dashboard Mapping ──────────────────────────────────────────────────

export const ROLE_REDIRECT_MAP: Record<string, string> = {
  ADMIN: '/admin/dashboard',
  STAFF: '/staff/dashboard',
  MANAGER: '/manager/dashboard'
} as const

export function getDashboardPathByRole(role?: string): string {
  if (!role) return '/profile'
  const normalizedRole = role.toUpperCase()
  return ROLE_REDIRECT_MAP[normalizedRole] ?? '/profile'
}
