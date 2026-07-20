/**
 * Auth types — chỉ chứa types/interfaces, không có API functions.
 * API functions nằm trong features/services/.
 */

export type UserStatus = 'PENDING' | 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'DELETED'

export interface MediaFileResponse {
  mediaFileId: number
  fileUrl: string
  fileKey: string
  fileSize: number
  fileType: string
  mediaPurpose: string
  mediaStatus: string
  bookingMediaType?: string
}

export interface UserResponse {
  userId: string
  email: string
  fullName: string
  gender?: string
  dateOfBirth?: string
  role: string
  staffTask?: 'GROOMER' | 'SHIPPER' | 'COORDINATOR'
  specialization?: string
  introduction?: string
  yearsOfExperience?: number
  status: UserStatus | string
  paymentFailStreak?: number
  createdAt: string
  updatedAt: string
  mediaFiles?: MediaFileResponse[]
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
  code?: number
  message?: string
  success?: boolean
  data: T
  result?: T
  timestamp?: string
}

export interface LogoutRequest {
  token: string
}

export interface RefreshTokenRequest {
  refreshToken: string
}

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

export interface ResetOtpResponse {
  resetToken: string
}

export interface ResetPasswordRequest {
  resetToken: string
  newPassword: string
  confirmNewPassword: string
}

export interface PasswordUpdateRequest {
  oldPassword: string
  newPassword: string
  confirmNewPassword: string
}

/**
 * Query params BE gửi về FE sau khi Google OAuth thành công.
 * Pattern: BE redirect về FE kèm token qua query string.
 * FE đọc và lưu vào localStorage, sau đó cleanup URL.
 */
export interface GoogleOAuthCallback {
  accessToken: string
  refreshToken: string
}
