import { useState, useEffect } from 'react'
import type { FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'

import { resetPasswordApi } from '~/features/auth/services/password'
import { validatePassword, validateConfirmPassword } from '~/shared/lib/validation'
import { MaterialIcon } from '~/shared/ui'

const RESET_TOKEN_KEY = 'reset-password:token'
const RESET_EMAIL_KEY = 'reset-password:email'

/**
 * ResetPasswordPage — bước cuối của luồng "quên mật khẩu".
 *
 * Flow (sau khi BE thêm `/verify-reset-otp`):
 *   1. `/forgot-password` → nhập email → gọi `POST /api/auth/forgot-password`
 *      → BE gửi OTP qua email
 *   2. `/verify-email?email=...&purpose=reset-password` → nhập OTP
 *      → gọi `POST /api/auth/verify-reset-otp` → BE trả về `resetToken`
 *      → lưu `resetToken` vào sessionStorage
 *   3. `/reset-password` (trang này) → nhập MK mới + confirm
 *      → gọi `POST /api/auth/reset-password` với body
 *        { resetToken, newPassword, confirmNewPassword }
 *
 * Nếu user vào trực tiếp (không qua verify-reset-otp) → redirect `/forgot-password`.
 */
export function ResetPasswordPage() {
  const { t } = useTranslation('auth')
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [resetToken, setResetToken] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)
  const [isReady, setIsReady] = useState(false)

  const [fieldErrors, setFieldErrors] = useState<{
    newPassword?: string
    confirmNewPassword?: string
  }>({})
  const [touched, setTouched] = useState<{
    newPassword?: boolean
    confirmNewPassword?: boolean
  }>({})

  // Đọc resetToken + email từ sessionStorage.
  // Nếu thiếu → đá về forgot-password (không cho truy cập trực tiếp).
  // eslint-disable-next-line react-hooks/set-state-in-effect -- Đọc sessionStorage chỉ trên client
  useEffect(() => {
    const storedToken = sessionStorage.getItem(RESET_TOKEN_KEY)
    const storedEmail = sessionStorage.getItem(RESET_EMAIL_KEY)

    if (!storedToken) {
      void navigate('/forgot-password', { replace: true })
      return
    }

    setTimeout(() => {
      setResetToken(storedToken)
      setEmail(storedEmail ?? '')
      setIsReady(true)
    }, 0)
  }, [navigate])

  function handlePasswordChange(value: string) {
    setNewPassword(value)
    if (touched.newPassword) {
      const result = validatePassword(value)
      setFieldErrors((prev) => ({
        ...prev,
        newPassword: result.valid ? undefined : result.message
      }))
    }
    if (touched.confirmNewPassword) {
      const result = validateConfirmPassword(value, confirmNewPassword)
      setFieldErrors((prev) => ({
        ...prev,
        confirmNewPassword: result.valid ? undefined : result.message
      }))
    }
  }

  function handleConfirmChange(value: string) {
    setConfirmNewPassword(value)
    if (touched.confirmNewPassword) {
      const result = validateConfirmPassword(newPassword, value)
      setFieldErrors((prev) => ({
        ...prev,
        confirmNewPassword: result.valid ? undefined : result.message
      }))
    }
  }

  function handleBlur(field: 'newPassword' | 'confirmNewPassword') {
    setTouched((prev) => ({ ...prev, [field]: true }))

    if (field === 'newPassword') {
      const result = validatePassword(newPassword)
      setFieldErrors((prev) => ({
        ...prev,
        newPassword: result.valid ? undefined : result.message
      }))
    } else {
      const result = validateConfirmPassword(newPassword, confirmNewPassword)
      setFieldErrors((prev) => ({
        ...prev,
        confirmNewPassword: result.valid ? undefined : result.message
      }))
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    // Validate toàn bộ trước khi submit
    const newPasswordResult = validatePassword(newPassword)
    const confirmPasswordResult = validateConfirmPassword(newPassword, confirmNewPassword)

    setFieldErrors({
      newPassword: newPasswordResult.valid ? undefined : newPasswordResult.message,
      confirmNewPassword: confirmPasswordResult.valid ? undefined : confirmPasswordResult.message
    })
    setTouched({ newPassword: true, confirmNewPassword: true })

    if (!newPasswordResult.valid || !confirmPasswordResult.valid) {
      return
    }

    setErrorMessage('')
    setIsSubmitting(true)

    try {
      await resetPasswordApi({ resetToken, newPassword, confirmNewPassword })
      setIsSuccess(true)

      // Cleanup sessionStorage sau khi dùng xong
      sessionStorage.removeItem(RESET_TOKEN_KEY)
      sessionStorage.removeItem(RESET_EMAIL_KEY)

      setTimeout(() => {
        window.location.href = '/login'
      }, 2000)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : t('resetPassword.error')
      setErrorMessage(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const hasFieldError = (field: 'newPassword' | 'confirmNewPassword') => touched[field] && fieldErrors[field]

  return (
    <main className='flex min-h-screen flex-col items-center justify-center bg-background p-6'>
      {/* Nút quay lại */}
      <nav className='fixed left-8 top-8'>
        <a
          href='/login'
          className='group flex items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-primary'
        >
          <MaterialIcon name='arrow_back' className='text-[20px]' />
          {t('backHome')}
        </a>
      </nav>

      <div className='w-full max-w-[480px]'>
        <div className='relative overflow-hidden rounded-2xl border border-border/60 bg-card p-10 shadow-lg md:p-12'>
          {/* Gradient accent bar */}
          <div className='absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-primary to-warning' />

          {/* Icon */}
          <div className='mb-8 flex justify-center'>
            <div className='relative flex h-20 w-20 items-center justify-center rounded-full bg-accent'>
              <MaterialIcon name='password' filled className='text-[40px] text-accent-foreground' />
              <div className='absolute -bottom-1 -right-2 rounded-full border border-border bg-card p-2'>
                <MaterialIcon name='pets' className='text-[16px] text-primary' />
              </div>
            </div>
          </div>

          {/* Heading */}
          <div className='mb-10 text-center'>
            <h1 className='font-display text-2xl font-bold text-primary md:text-3xl'>{t('resetPassword.title')}</h1>
            <p className='mt-3 text-sm leading-relaxed text-muted-foreground md:text-base'>
              {t('resetPassword.subtitle')}
            </p>
            {isReady && email && <p className='mt-2 text-sm font-semibold text-foreground'>{email}</p>}
          </div>

          {/* Error */}
          {errorMessage && (
            <div className='mb-6 flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive'>
              <MaterialIcon name='error' className='shrink-0 text-[20px]' />
              <p>{errorMessage}</p>
            </div>
          )}

          {/* Success */}
          {isSuccess && (
            <div className='mb-6 flex items-center gap-3 rounded-xl border border-success/30 bg-success/10 px-4 py-3 text-sm text-success'>
              <MaterialIcon name='check_circle' className='shrink-0 text-[20px]' />
              <p>{t('resetPassword.success')}</p>
            </div>
          )}

          {!isReady ? (
            <div className='flex justify-center py-12'>
              <MaterialIcon name='progress_activity' className='animate-spin text-[32px] text-primary' />
            </div>
          ) : (
            <form className='space-y-8' onSubmit={handleSubmit}>
              {/* Mật khẩu mới */}
              <div className='space-y-2'>
                <label htmlFor='new_password' className='text-sm font-semibold text-foreground'>
                  {t('resetPassword.newPassword')}
                </label>
                <div className='relative'>
                  <MaterialIcon
                    name='lock'
                    className='absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground'
                  />
                  <input
                    id='new_password'
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    value={newPassword}
                    onChange={(e) => handlePasswordChange(e.target.value)}
                    onBlur={() => handleBlur('newPassword')}
                    placeholder={t('fields.password.placeholder')}
                    className={`w-full rounded-xl border bg-muted py-4 pl-12 pr-12 text-sm text-foreground focus:outline-none focus:ring-2 ${
                      hasFieldError('newPassword')
                        ? 'border-destructive focus:border-destructive focus:ring-destructive/30'
                        : 'border-border focus:border-primary focus:ring-ring'
                    }`}
                    disabled={isSubmitting || isSuccess}
                  />
                  <button
                    type='button'
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className='absolute inset-y-0 right-0 flex items-center justify-center px-4 text-muted-foreground transition-colors hover:text-foreground'
                    aria-label={showNewPassword ? t('hidePassword') : t('showPassword')}
                  >
                    <MaterialIcon name={showNewPassword ? 'visibility_off' : 'visibility'} className='text-xl' />
                  </button>
                </div>
                {hasFieldError('newPassword') && (
                  <p className='mt-1 text-xs text-destructive flex items-center gap-1'>
                    <MaterialIcon name='error' className='text-[14px]' />
                    {fieldErrors.newPassword}
                  </p>
                )}
              </div>

              {/* Xác nhận mật khẩu mới */}
              <div className='space-y-2'>
                <label htmlFor='confirm_new_password' className='text-sm font-semibold text-foreground'>
                  {t('resetPassword.confirmNewPassword')}
                </label>
                <div className='relative'>
                  <MaterialIcon
                    name='verified_user'
                    className='absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground'
                  />
                  <input
                    id='confirm_new_password'
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    value={confirmNewPassword}
                    onChange={(e) => handleConfirmChange(e.target.value)}
                    onBlur={() => handleBlur('confirmNewPassword')}
                    placeholder={t('fields.confirmPassword.placeholder')}
                    className={`w-full rounded-xl border bg-muted py-4 pl-12 pr-12 text-sm text-foreground focus:outline-none focus:ring-2 ${
                      hasFieldError('confirmNewPassword')
                        ? 'border-destructive focus:border-destructive focus:ring-destructive/30'
                        : 'border-border focus:border-primary focus:ring-ring'
                    }`}
                    disabled={isSubmitting || isSuccess}
                  />
                  <button
                    type='button'
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className='absolute inset-y-0 right-0 flex items-center justify-center px-4 text-muted-foreground transition-colors hover:text-foreground'
                    aria-label={showConfirmPassword ? t('hidePassword') : t('showPassword')}
                  >
                    <MaterialIcon name={showConfirmPassword ? 'visibility_off' : 'visibility'} className='text-xl' />
                  </button>
                </div>
                {hasFieldError('confirmNewPassword') && (
                  <p className='mt-1 text-xs text-destructive flex items-center gap-1'>
                    <MaterialIcon name='error' className='text-[14px]' />
                    {fieldErrors.confirmNewPassword}
                  </p>
                )}
              </div>

              {/* Submit */}
              <button
                type='submit'
                disabled={isSubmitting || isSuccess}
                className='w-full rounded-xl bg-secondary px-4 py-4 text-base font-bold uppercase tracking-widest text-secondary-foreground shadow-md transition-all hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60'
              >
                {isSubmitting ? (
                  <span className='flex items-center justify-center gap-2'>
                    <MaterialIcon name='progress_activity' className='animate-spin text-[20px]' />
                    {t('resetPassword.processing')}
                  </span>
                ) : isSuccess ? (
                  <span className='flex items-center justify-center gap-2'>
                    <MaterialIcon name='check_circle' className='text-[20px]' />
                    {t('resetPassword.successButton')}
                  </span>
                ) : (
                  t('resetPassword.submit')
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  )
}
