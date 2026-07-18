/**
 * Auth feature — Google OAuth helper.
 *
 * Flow:
 *   1. FE gọi `redirectToGoogle()` → window.location.href sang Google OAuth
 *   2. User xác thực với Google
 *   3. Google redirect về `redirect_uri` (= BE endpoint)
 *   4. BE xử lý `code`, sinh JWT, redirect về FE kèm query string
 *      `?accessToken=...&refreshToken=...`
 *   5. `AuthProvider` (providers/auth-provider.tsx) xử lý callback khi mount
 *
 * Lưu ý: helper này KHÔNG gọi fetch — toàn bộ flow dùng
 * `window.location.href` (full page redirect), giống pattern Spring Security OAuth2.
 */

import { env } from '~/shared/config/env'

const GOOGLE_OAUTH_BASE = 'https://accounts.google.com/o/oauth2/v2/auth'
const GOOGLE_SCOPES = 'openid profile email'

export function buildGoogleAuthUrl(): string {
  const params = new URLSearchParams({
    client_id: env.GOOGLE_CLIENT_ID,
    redirect_uri: env.GOOGLE_REDIRECT_URI,
    response_type: 'code',
    scope: GOOGLE_SCOPES
  })
  return `${GOOGLE_OAUTH_BASE}?${params.toString()}`
}

export function redirectToGoogle(): void {
  if (typeof window === 'undefined') return
  window.location.href = buildGoogleAuthUrl()
}

/**
 * Đọc query string từ URL hiện tại. Trả về null nếu không phải OAuth callback.
 * An toàn với SSR (return null khi chưa có window).
 */
export function readGoogleOAuthCallback(): { accessToken: string; refreshToken: string } | null {
  if (typeof window === 'undefined') return null

  const params = new URLSearchParams(window.location.search)
  const accessToken = params.get('accessToken')
  const refreshToken = params.get('refreshToken')

  if (!accessToken || !refreshToken) return null
  return { accessToken, refreshToken }
}

/**
 * Xóa `accessToken` & `refreshToken` khỏi URL hiện tại mà KHÔNG reload trang.
 * Dùng sau khi đã consume callback để tránh xử lý lại khi user refresh.
 */
export function clearGoogleOAuthQuery(): void {
  if (typeof window === 'undefined') return

  const url = new URL(window.location.href)
  url.searchParams.delete('accessToken')
  url.searchParams.delete('refreshToken')
  window.history.replaceState({}, '', url.toString())
}
