import { useState } from 'react'
import type { FormEvent } from 'react'
import { useTranslation } from 'react-i18next'

import { useAuth } from '~/providers/auth-provider'
import { changePasswordApi } from '~/features/auth/services/password'
import { MaterialIcon } from '~/shared/ui'

/**
 * ChangePasswordPage — cho user đã đăng nhập đổi mật khẩu.
 * Gọi `POST /api/auth/change-password` (yêu cầu Bearer token, sẽ tự inject
 * nhờ customFetch interceptor — URL `/auth/change-password` không phải endpoint
 * public, chỉ `/auth/login`, `/auth/refresh`, `/auth/outbound/` là public).
 */
export function ChangePasswordPage() {
  const { t } = useTranslation('auth')
  const { user } = useAuth()

  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [showOldPassword, setShowOldPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (newPassword.length < 8) {
      setErrorMessage(t('changePassword.passwordTooShort'))
      return
    }

    if (newPassword === oldPassword) {
      setErrorMessage(t('changePassword.passwordSame'))
      return
    }

    if (newPassword !== confirmNewPassword) {
      setErrorMessage(t('changePassword.passwordMismatch'))
      return
    }

    setErrorMessage('')
    setIsSubmitting(true)

    try {
      await changePasswordApi({ oldPassword, newPassword, confirmNewPassword })
      setIsSuccess(true)
      setOldPassword('')
      setNewPassword('')
      setConfirmNewPassword('')
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : t('changePassword.error')
      setErrorMessage(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className='flex min-h-screen flex-col items-center justify-center bg-background p-6'>
      {/* Nút quay lại */}
      <nav className='fixed left-8 top-8'>
        <a
          href='/profile'
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
              <MaterialIcon name='lock' filled className='text-[40px] text-accent-foreground' />
              <div className='absolute -bottom-1 -right-2 rounded-full border border-border bg-card p-2'>
                <MaterialIcon name='pets' className='text-[16px] text-primary' />
              </div>
            </div>
          </div>

          {/* Heading */}
          <div className='mb-10 text-center'>
            <h1 className='font-display text-2xl font-bold text-primary md:text-3xl'>{t('changePassword.title')}</h1>
            <p className='mt-3 text-sm leading-relaxed text-muted-foreground md:text-base'>
              {t('changePassword.subtitle')}
            </p>
            {user?.email && <p className='mt-2 text-sm font-semibold text-foreground'>{user.email}</p>}
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
              <p>{t('changePassword.success')}</p>
            </div>
          )}

          <form className='space-y-8' onSubmit={handleSubmit}>
            {/* Mật khẩu hiện tại */}
            <div className='space-y-2'>
              <label htmlFor='old_password' className='text-sm font-semibold text-foreground'>
                {t('changePassword.oldPassword')}
              </label>
              <div className='relative'>
                <MaterialIcon
                  name='lock_open'
                  className='absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground'
                />
                <input
                  id='old_password'
                  type={showOldPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder={t('fields.password.placeholder')}
                  className='w-full rounded-xl border border-border bg-muted py-4 pl-12 pr-12 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring'
                  disabled={isSubmitting || isSuccess}
                />
                <button
                  type='button'
                  onClick={() => setShowOldPassword(!showOldPassword)}
                  className='absolute inset-y-0 right-0 flex items-center justify-center px-4 text-muted-foreground transition-colors hover:text-foreground'
                  aria-label={showOldPassword ? t('hidePassword') : t('showPassword')}
                >
                  <MaterialIcon name={showOldPassword ? 'visibility_off' : 'visibility'} className='text-xl' />
                </button>
              </div>
            </div>

            {/* Mật khẩu mới */}
            <div className='space-y-2'>
              <label htmlFor='change_new_password' className='text-sm font-semibold text-foreground'>
                {t('changePassword.newPassword')}
              </label>
              <div className='relative'>
                <MaterialIcon name='lock' className='absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground' />
                <input
                  id='change_new_password'
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder={t('fields.password.placeholder')}
                  className='w-full rounded-xl border border-border bg-muted py-4 pl-12 pr-12 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring'
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
            </div>

            {/* Xác nhận mật khẩu mới */}
            <div className='space-y-2'>
              <label htmlFor='change_confirm_new_password' className='text-sm font-semibold text-foreground'>
                {t('changePassword.confirmNewPassword')}
              </label>
              <div className='relative'>
                <MaterialIcon
                  name='verified_user'
                  className='absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground'
                />
                <input
                  id='change_confirm_new_password'
                  type={showConfirmNewPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder={t('fields.confirmPassword.placeholder')}
                  className='w-full rounded-xl border border-border bg-muted py-4 pl-12 pr-12 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring'
                  disabled={isSubmitting || isSuccess}
                />
                <button
                  type='button'
                  onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                  className='absolute inset-y-0 right-0 flex items-center justify-center px-4 text-muted-foreground transition-colors hover:text-foreground'
                  aria-label={showConfirmNewPassword ? t('hidePassword') : t('showPassword')}
                >
                  <MaterialIcon name={showConfirmNewPassword ? 'visibility_off' : 'visibility'} className='text-xl' />
                </button>
              </div>
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
                  {t('changePassword.processing')}
                </span>
              ) : isSuccess ? (
                <span className='flex items-center justify-center gap-2'>
                  <MaterialIcon name='check_circle' className='text-[20px]' />
                  {t('changePassword.successButton')}
                </span>
              ) : (
                t('changePassword.submit')
              )}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
