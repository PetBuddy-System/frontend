import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'

import { useAuth } from '~/providers/auth-provider'
import { STORAGE_KEYS } from '~/shared/config/site'
import { getUserByIdApi } from '~/features/profile/services/user'
import { getUserIdFromAccessToken } from '~/shared/lib/jwt'
import { removeStorage, writeStorage } from '~/shared/lib/storage'

/**
 * OAuthCallbackPage — xử lý redirect từ Google OAuth.
 *
 * Flow:
 *   Google redirect về `/oauth2/success?accessToken=...&refreshToken=...`
 *   → Trang này decode JWT để lấy userId, lưu token vào localStorage,
 *     gọi `GET /api/users/{userId}` để lấy UserResponse, navigate về home.
 *
 * Render loading placeholder cho SSR (token chỉ accessible ở client) rồi xử lý trong useEffect.
 *
 * Lưu ý: BE không có endpoint `/api/auth/profile`. Endpoint đúng để lấy
 * UserResponse cho user hiện tại là `/api/users/{userId}` (lấy userId từ claim `sub` của JWT).
 */
export function OAuthCallbackPage() {
  const { t } = useTranslation('auth')
  const navigate = useNavigate()
  const { setSession, logout } = useAuth()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // eslint-disable-next-line react-hooks/set-state-in-effect -- OAuth callback chỉ chạy trên client; render placeholder cho SSR
  useEffect(() => {
    if (typeof window === 'undefined') return

    const params = new URLSearchParams(window.location.search)
    const accessToken = params.get('accessToken')
    const refreshToken = params.get('refreshToken')
    const oauthError = params.get('error')

    // Cleanup query string NGAY để tránh duplicate processing khi refresh
    const cleanedUrl = new URL(window.location.href)
    cleanedUrl.searchParams.delete('accessToken')
    cleanedUrl.searchParams.delete('refreshToken')
    cleanedUrl.searchParams.delete('error')
    window.history.replaceState({}, '', cleanedUrl.toString())

    if (oauthError || !accessToken || !refreshToken) {
      setErrorMessage(t('oauth.error'))
      return
    }

    // Decode JWT để lấy userId từ claim `sub`
    const userId = getUserIdFromAccessToken(accessToken)
    if (!userId) {
      setErrorMessage(t('oauth.error'))
      return
    }

    // Persist token NGAY (kể cả khi profile fail vẫn giữ token)
    writeStorage(STORAGE_KEYS.accessToken, accessToken)
    writeStorage(STORAGE_KEYS.refreshToken, refreshToken)

    // Fetch user info + set state
    getUserByIdApi(userId)
      .then((response) => {
        const userProfile = response?.data
        if (!userProfile) {
          // User rỗng → token không hợp lệ, clear và hiện error
          removeStorage(STORAGE_KEYS.accessToken)
          removeStorage(STORAGE_KEYS.refreshToken)
          removeStorage(STORAGE_KEYS.user)
          setErrorMessage(t('oauth.error'))
          return
        }
        writeStorage(STORAGE_KEYS.user, JSON.stringify(userProfile))
        setSession({ accessToken, user: userProfile })
        void navigate('/', { replace: true })
      })
      .catch(() => {
        // Fetch user fail (network, 401, ...) → clear state, vô hiệu token cũ
        removeStorage(STORAGE_KEYS.accessToken)
        removeStorage(STORAGE_KEYS.refreshToken)
        removeStorage(STORAGE_KEYS.user)
        void logout()
        setErrorMessage(t('oauth.error'))
      })
  }, [navigate, setSession, t, logout])

  if (errorMessage !== null) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-background px-4'>
        <div className='max-w-md space-y-4 text-center'>
          <h1 className='text-2xl font-semibold text-foreground'>{t('oauth.errorTitle')}</h1>
          <p className='text-sm text-muted-foreground'>{errorMessage}</p>
          <button
            type='button'
            onClick={() => void navigate('/login', { replace: true })}
            className='inline-flex items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90'
          >
            {t('oauth.backToLogin')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className='flex min-h-screen items-center justify-center bg-background'>
      <div className='space-y-4 text-center'>
        <div className='mx-auto h-12 w-12 animate-spin rounded-full border-4 border-muted border-t-primary' />
        <p className='text-sm font-medium text-muted-foreground'>{t('oauth.processing')}</p>
      </div>
    </div>
  )
}
