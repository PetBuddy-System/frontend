import { useState, useRef, useCallback } from 'react'
import type { FormEvent, KeyboardEvent, ClipboardEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router'

import { resetPasswordApi, resendOtpApi } from '~/features/auth/services'
import { MaterialIcon } from '~/shared/ui'

const OTP_LENGTH = 6

export function ResetPasswordPage() {
  const { t } = useTranslation('auth')
  const [searchParams] = useSearchParams()
  const email = searchParams.get('email') ?? ''

  const [otpValues, setOtpValues] = useState<string[]>(Array(OTP_LENGTH).fill(''))
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)
  const [isResending, setIsResending] = useState(false)

  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const focusInput = useCallback((index: number) => {
    inputRefs.current[index]?.focus()
  }, [])

  function handleInputChange(index: number, value: string) {
    const digit = value.replace(/\D/g, '').slice(-1)

    setOtpValues((prev) => {
      const updated = [...prev]
      updated[index] = digit
      return updated
    })

    if (digit && index < OTP_LENGTH - 1) {
      focusInput(index + 1)
    }
  }

  function handleKeyDown(index: number, event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Backspace' && !otpValues[index] && index > 0) {
      focusInput(index - 1)
    }
  }

  function handlePaste(event: ClipboardEvent<HTMLInputElement>) {
    event.preventDefault()
    const pastedData = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH)

    if (pastedData.length === 0) return

    const newValues = [...otpValues]
    pastedData.split('').forEach((char, idx) => {
      newValues[idx] = char
    })
    setOtpValues(newValues)
    focusInput(Math.min(pastedData.length, OTP_LENGTH) - 1)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const otp = otpValues.join('')

    if (otp.length < OTP_LENGTH) {
      setErrorMessage(t('resetPassword.errorIncomplete'))
      return
    }

    if (newPassword.length < 8) {
      setErrorMessage(t('resetPassword.passwordTooShort'))
      return
    }

    if (newPassword !== confirmNewPassword) {
      setErrorMessage(t('resetPassword.passwordMismatch'))
      return
    }

    setErrorMessage('')
    setIsSubmitting(true)

    try {
      await resetPasswordApi({ email, otp, newPassword, confirmNewPassword })
      setIsSuccess(true)

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

  async function handleResendOtp() {
    if (isResending || !email) return
    setIsResending(true)
    setErrorMessage('')

    try {
      await resendOtpApi(email)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : t('otp.errorResend')
      setErrorMessage(message)
    } finally {
      setIsResending(false)
    }
  }

  return (
    <main className='flex min-h-screen flex-col items-center justify-center bg-background p-6'>
      {/* Nút quay lại */}
      <nav className='fixed left-8 top-8'>
        <a
          href='/forgot-password'
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
            <h1 className='font-display text-2xl font-bold text-primary md:text-3xl'>
              {t('resetPassword.title')}
            </h1>
            <p className='mt-3 text-sm leading-relaxed text-muted-foreground md:text-base'>
              {t('resetPassword.subtitle')}
            </p>
            {email && (
              <p className='mt-2 text-sm font-semibold text-foreground'>{email}</p>
            )}
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

          <form className='space-y-8' onSubmit={handleSubmit}>
            {/* OTP inputs */}
            <div>
              <label className='mb-3 block text-sm font-semibold text-foreground'>
                {t('resetPassword.otpLabel')}
              </label>
              <div className='flex justify-between gap-2 md:gap-3'>
                {otpValues.map((value, index) => (
                  <input
                    key={index}
                    ref={(el) => { inputRefs.current[index] = el }}
                    type='text'
                    inputMode='numeric'
                    pattern='\d*'
                    maxLength={1}
                    required
                    value={value}
                    onChange={(e) => handleInputChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={index === 0 ? handlePaste : undefined}
                    disabled={isSubmitting || isSuccess}
                    className='h-14 w-12 rounded-xl border border-border bg-muted text-center text-2xl font-bold text-foreground transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 md:h-16 md:w-14'
                    aria-label={`${t('otp.digitLabel')} ${index + 1}`}
                  />
                ))}
              </div>
              {/* Gửi lại OTP */}
              <div className='mt-3 text-right'>
                <button
                  type='button'
                  disabled={isResending}
                  onClick={handleResendOtp}
                  className='text-xs font-semibold text-primary hover:underline disabled:cursor-not-allowed disabled:opacity-60'
                >
                  {isResending ? t('otp.resending') : t('resetPassword.resendOtp')}
                </button>
              </div>
            </div>

            {/* Mật khẩu mới */}
            <div className='space-y-2'>
              <label htmlFor='new_password' className='text-sm font-semibold text-foreground'>
                {t('resetPassword.newPassword')}
              </label>
              <div className='relative'>
                <MaterialIcon name='lock' className='absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground' />
                <input
                  id='new_password'
                  type='password'
                  required
                  minLength={8}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder={t('fields.password.placeholder')}
                  className='w-full rounded-xl border border-border bg-muted py-4 pl-12 pr-4 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring'
                  disabled={isSubmitting || isSuccess}
                />
              </div>
            </div>

            {/* Xác nhận mật khẩu mới */}
            <div className='space-y-2'>
              <label htmlFor='confirm_new_password' className='text-sm font-semibold text-foreground'>
                {t('resetPassword.confirmNewPassword')}
              </label>
              <div className='relative'>
                <MaterialIcon name='verified_user' className='absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground' />
                <input
                  id='confirm_new_password'
                  type='password'
                  required
                  minLength={8}
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder={t('fields.confirmPassword.placeholder')}
                  className='w-full rounded-xl border border-border bg-muted py-4 pl-12 pr-4 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring'
                  disabled={isSubmitting || isSuccess}
                />
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
        </div>
      </div>
    </main>
  )
}
