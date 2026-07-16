import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'

import { STORAGE_KEYS } from '~/shared/config/site'
import { loginApi, logoutApi } from '~/features/auth/services/auth'
import type { UserResponse } from '~/shared/lib/auth'
import { readStorage, writeStorage, removeStorage } from '~/shared/lib/storage'
import { mergeCartApi } from '~/features/products/services/cart/cart-api'
import { getCurrentUserApi } from '~/features/profile/services/user/user-api'

export const AUTH_QUERY_KEYS = {
  currentUser: ['currentUser'] as const,
}

interface AuthContextValue {
  user: UserResponse | null
  accessToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refetchUser: () => Promise<void>
  setSession: (session: { accessToken: string; user: UserResponse | null }) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [isMounted, setIsMounted] = useState(false)
  const queryClient = useQueryClient()

  useEffect(() => {
    const storedToken = readStorage(STORAGE_KEYS.accessToken)
    if (storedToken) {
      setAccessToken(storedToken)
    }
    setIsMounted(true)
  }, [])

  const {
    data: userQueryData,
    isLoading: isUserLoading,
  } = useQuery({
    queryKey: AUTH_QUERY_KEYS.currentUser,
    queryFn: async () => {
      const response = await getCurrentUserApi()
      if (response.success && response.data) {
        return response.data
      }
      return null
    },
    enabled: isMounted && accessToken !== null,
    throwOnError: false,
  })

  const user = userQueryData ?? null

  const isLoading = !isMounted || (accessToken !== null && isUserLoading && user === null)

  const isAuthenticated = accessToken !== null && user !== null

  const refetchUser = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.currentUser })
  }, [queryClient])

  const login = useCallback(async (email: string, password: string) => {
    const response = await loginApi({ email, password })
    const { userResponse, accessToken: token, refreshToken } = response.data

    writeStorage(STORAGE_KEYS.accessToken, token)
    writeStorage(STORAGE_KEYS.refreshToken, refreshToken)

    setAccessToken(token)
    queryClient.setQueryData(AUTH_QUERY_KEYS.currentUser, userResponse)

    try {
      await mergeCartApi()
    } catch (err) {
      console.error('Merge cart failed:', err)
    }
  }, [queryClient])

  const logout = useCallback(async () => {
    const token = readStorage(STORAGE_KEYS.accessToken)

    if (token) {
      await logoutApi(token).catch(() => {
      })
    }

    removeStorage(STORAGE_KEYS.accessToken)
    removeStorage(STORAGE_KEYS.refreshToken)
    removeStorage(STORAGE_KEYS.user)
    queryClient.removeQueries({ queryKey: AUTH_QUERY_KEYS.currentUser })
    setAccessToken(null)
  }, [queryClient])

  useEffect(() => {
    if (userQueryData && userQueryData.status !== 'ACTIVE') {
      console.warn('User account is no longer ACTIVE:', userQueryData.status)
      void logout().then(() => {
        if (typeof window !== 'undefined') {
          const errMsg = 'Tài khoản của bạn đã bị khóa hoặc ngừng hoạt động.'
          window.location.href = `/login?error=${encodeURIComponent(errMsg)}`
        }
      })
    }
  }, [userQueryData, logout])

  const setSession = useCallback((session: { accessToken: string; user: UserResponse | null }) => {
    setAccessToken(session.accessToken)
    if (session.user) {
      queryClient.setQueryData(AUTH_QUERY_KEYS.currentUser, session.user)
    } else {
      void queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.currentUser })
    }
  }, [queryClient])

  return (
    <AuthContext value={{ user, accessToken, isAuthenticated, isLoading, login, logout, setSession, refetchUser }}>
      {children}
    </AuthContext>
  )
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
