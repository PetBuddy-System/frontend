import { createContext, useContext, useState, useEffect, useCallback } from 'react'

import { STORAGE_KEYS } from '~/shared/config/site'
import { loginApi, logoutApi } from '~/features/auth/services/auth'
import type { UserResponse } from '~/shared/lib/auth'
import { readStorage, writeStorage, removeStorage } from '~/shared/lib/storage'

// ─── Types ──────────────────────────────────────────────────────────────────

interface AuthContextValue {
  user: UserResponse | null
  accessToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

// ─── Context ────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null)

// ─── Provider ───────────────────────────────────────────────────────────────

/**
 * AuthProvider — quản lý trạng thái xác thực cấp app.
 *
 * Pattern "mount-then-read" giống ThemeProvider / I18nProvider:
 * - Render đầu (SSR + trước hydrate): user = null, isLoading = true
 * - Sau mount (client): đọc localStorage → set state
 * → Tránh hydration mismatch vì localStorage không có trên server.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Đọc auth state từ localStorage sau khi mount (client only)
  // eslint-disable-next-line react-hooks/set-state-in-effect -- Hydration gate: phải đọc localStorage trong useEffect để tránh SSR mismatch
  useEffect(() => {
    const storedToken = readStorage(STORAGE_KEYS.accessToken)
    const storedUser = readStorage(STORAGE_KEYS.user)

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser) as UserResponse
        setAccessToken(storedToken)
        setUser(parsedUser)
      } catch {
        // JSON parse fail → xóa data hỏng
        removeStorage(STORAGE_KEYS.accessToken)
        removeStorage(STORAGE_KEYS.refreshToken)
        removeStorage(STORAGE_KEYS.user)
      }
    }

    setIsLoading(false)
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const response = await loginApi({ email, password })
    const { userResponse, accessToken: token, refreshToken } = response.data

    // Persist vào localStorage
    writeStorage(STORAGE_KEYS.accessToken, token)
    writeStorage(STORAGE_KEYS.refreshToken, refreshToken)
    writeStorage(STORAGE_KEYS.user, JSON.stringify(userResponse))

    // Cập nhật state
    setAccessToken(token)
    setUser(userResponse)
  }, [])

  const logout = useCallback(async () => {
    const token = readStorage(STORAGE_KEYS.accessToken)

    // Gọi API logout (best-effort)
    if (token) {
      await logoutApi(token).catch(() => {
        /* ignore — vẫn clear local state */
      })
    }

    // Xóa localStorage
    removeStorage(STORAGE_KEYS.accessToken)
    removeStorage(STORAGE_KEYS.refreshToken)
    removeStorage(STORAGE_KEYS.user)

    // Reset state
    setAccessToken(null)
    setUser(null)
  }, [])

  const isAuthenticated = accessToken !== null && user !== null

  return (
    <AuthContext value={{ user, accessToken, isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext>
  )
}

// ─── Hook ───────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
