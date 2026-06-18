/**
 * Auth API types & service functions.
 *
 * Types lấy từ OpenAPI spec của backend PetBuddy.
 * Sử dụng customFetch (Axios) để gọi API và tận dụng các interceptors.
 */

import { customFetch } from '~/api/mutator/custom-fetch'

// ─── Types ──────────────────────────────────────────────────────────────────

export type UserStatus = 'PENDING' | 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'DELETED'

export interface UserResponse {
  userId: string
  email: string
  fullName: string
  gender: string
  dateOfBirth: string
  role: string
  status: UserStatus
  createdAt: string
  updatedAt: string
}

export interface AuthenticationRequest {
  email: string
  password: string
}

export interface AuthenticationResponse {
  userResponse: UserResponse
  accessToken: string
  refreshToken: string
  authenticated: boolean
}

export interface ApiResponse<T> {
  code: number
  message: string
  success: boolean
  data: T
  timestamp: string
}

export interface LogoutRequest {
  token: string
}

export interface RefreshTokenRequest {
  refreshToken: string
}

// ─── API Functions ──────────────────────────────────────────────────────────

export async function loginApi(
  data: AuthenticationRequest
): Promise<ApiResponse<AuthenticationResponse>> {
  return customFetch<ApiResponse<AuthenticationResponse>>({
    url: '/api/auth/login',
    method: 'POST',
    data
  })
}

export async function logoutApi(token: string): Promise<void> {
  return customFetch<void>({
    url: '/api/auth/logout',
    method: 'POST',
    data: { token } satisfies LogoutRequest
  })
}

export async function refreshTokenApi(
  refreshToken: string
): Promise<ApiResponse<AuthenticationResponse>> {
  return customFetch<ApiResponse<AuthenticationResponse>>({
    url: '/api/auth/refresh',
    method: 'POST',
    data: { refreshToken } satisfies RefreshTokenRequest
  })
}

// ─── Signup & OTP ───────────────────────────────────────────────────────────

export interface UserCreationRequest {
  email: string
  password: string
  fullName: string
  gender: string
  dateOfBirth: string
}

export interface VerifyEmailRequest {
  email: string
  otp: string
}

export interface OtpRequest {
  email: string
}

export async function signupApi(
  data: UserCreationRequest
): Promise<ApiResponse<void>> {
  return customFetch<ApiResponse<void>>({
    url: '/api/auth/signup',
    method: 'POST',
    data
  })
}

export async function verifyEmailApi(
  data: VerifyEmailRequest
): Promise<ApiResponse<void>> {
  return customFetch<ApiResponse<void>>({
    url: '/api/auth/verify-email',
    method: 'POST',
    data
  })
}

export async function resendOtpApi(
  email: string
): Promise<ApiResponse<void>> {
  return customFetch<ApiResponse<void>>({
    url: '/api/auth/resend-otp',
    method: 'POST',
    data: { email } satisfies OtpRequest
  })
}

// ─── Forgot / Reset Password ────────────────────────────────────────────────

export interface ResetPasswordRequest {
  email: string
  otp: string
  newPassword: string
  confirmNewPassword: string
}

export async function forgotPasswordApi(
  email: string
): Promise<ApiResponse<void>> {
  return customFetch<ApiResponse<void>>({
    url: '/api/auth/forgot-password',
    method: 'POST',
    data: { email } satisfies OtpRequest
  })
}

export async function resetPasswordApi(
  data: ResetPasswordRequest
): Promise<ApiResponse<void>> {
  return customFetch<ApiResponse<void>>({
    url: '/api/auth/reset-password',
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

