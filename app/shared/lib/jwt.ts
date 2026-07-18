/**
 * JWT helpers — chỉ đọc (decode), KHÔNG verify chữ ký.
 *
 * Mục đích: OAuth callback cần lấy `userId` (claim `sub`) từ access token
 * để gọi `GET /api/users/{userId}` — vì BE không có endpoint `/api/auth/profile`.
 *
 * KHÔNG dùng cho auth/authz — server là nguồn xác thực duy nhất.
 * Decode này chỉ an toàn cho UI để hiển thị / điều hướng client-side.
 */

export interface JwtPayload {
  /** Subject — thường là userId */
  sub?: string
  /** Issued at (epoch seconds) */
  iat?: number
  /** Expiration (epoch seconds) */
  exp?: number
  /** Scope / roles */
  scope?: string
  /** Issuer */
  iss?: string
  /** JWT ID */
  jti?: string
  [key: string]: unknown
}

/**
 * Decode JWT payload (phần giữa 2 dấu `.`) sang object.
 * Trả về null nếu token không hợp lệ format.
 */
export function decodeJwt(token: string): JwtPayload | null {
  if (typeof token !== 'string' || token.length === 0) return null

  const parts = token.split('.')
  if (parts.length !== 3) return null

  const payloadSegment = parts[1]
  if (!payloadSegment) return null

  try {
    // JWT dùng base64url, cần convert sang base64
    const base64 = payloadSegment.replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4)
    const decoded = typeof atob === 'function' ? atob(padded) : Buffer.from(padded, 'base64').toString('binary')

    const json =
      typeof structuredClone === 'function' ? JSON.parse(decoded) : JSON.parse(decodeURIComponent(escape(decoded)))

    if (typeof json !== 'object' || json === null) return null
    return json as JwtPayload
  } catch {
    return null
  }
}

/** Lấy userId (claim `sub`) từ access token. Trả về null nếu không có/không hợp lệ. */
export function getUserIdFromAccessToken(token: string): string | null {
  const payload = decodeJwt(token)
  const sub = payload?.sub
  return typeof sub === 'string' && sub.length > 0 ? sub : null
}
