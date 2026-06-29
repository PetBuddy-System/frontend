import { useState, useRef, useEffect, useCallback } from 'react'
import type { FormEvent, KeyboardEvent, ClipboardEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router'

import { verifyEmailApi, resendOtpApi } from '~/features/auth/services/otp'
import { MaterialIcon } from '~/shared/ui'

const OTP_LENGTH = 6
const RESEND_COOLDOWN_SECONDS = 59

export function OtpVerificationPage() {
  const { t } = useTranslation('auth')
  const [searchParams] = useSearchParams()
  const email = searchParams.get('email') ?? ''

  const [otpValues, setOtpValues] = useState<string[]>(Array(OTP_LENGTH).fill(''))
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)
  const [timeLeft, setTimeLeft] = useState(RESEND_COOLDOWN_SECONDS)
  const [isResending, setIsResending] = useState(false)

  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Countdown timer cho nút "Gửi lại"
  useEffect(() => {
    if (timeLeft <= 0) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft])

  const focusInput = useCallback((index: number) => {
    inputRefs.current[index]?.focus()
  }, [])

  function handleInputChange(index: number, value: string) {
    // Chỉ nhận số
    const digit = value.replace(/\D/g, '').slice(-1)

    setOtpValues((prev) => {
      const updated = [...prev]
      updated[index] = digit
      return updated
    })

    // Tự nhảy sang ô tiếp theo
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

    // Focus ô cuối cùng đã paste
    focusInput(Math.min(pastedData.length, OTP_LENGTH) - 1)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const otp = otpValues.join('')

    if (otp.length < OTP_LENGTH) {
      setErrorMessage(t('otp.errorIncomplete'))
      return
    }

    setErrorMessage('')
    setIsSubmitting(true)

    try {
      await verifyEmailApi({ email, otp })
      setIsSuccess(true)

      // Redirect về trang login sau 2 giây
      setTimeout(() => {
        window.location.href = '/login'
      }, 2000)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : t('otp.errorVerify')
      setErrorMessage(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleResend() {
    if (timeLeft > 0 || isResending || !email) return

    setIsResending(true)
    setErrorMessage('')

    try {
      await resendOtpApi(email)
      setTimeLeft(RESEND_COOLDOWN_SECONDS)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : t('otp.errorResend')
      setErrorMessage(message)
    } finally {
      setIsResending(false)
    }
  }

  const isResendDisabled = timeLeft > 0 || isResending

  return (
    <main className='flex min-h-screen flex-col items-center justify-center bg-background p-6'>
      {/* Nút quay lại */}
      <nav className='fixed left-8 top-8'>
        <a
          href='/register'
          className='group flex items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-primary'
        >
          <MaterialIcon name='arrow_back' className='text-[20px]' />
          {t('backHome')}
        </a>
      </nav>

      <div className='w-full max-w-[480px]'>
        {/* Card chính */}
        <div className='relative overflow-hidden rounded-2xl border border-border/60 bg-card p-10 shadow-lg md:p-12'>
          {/* Gradient accent bar */}
          <div className='absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-primary to-warning' />

          {/* Icon minh họa */}
          <div className='mb-8 flex justify-center'>
            <div className='relative flex h-20 w-20 items-center justify-center rounded-full bg-accent'>
              <MaterialIcon name='mark_email_unread' filled className='text-[40px] text-accent-foreground' />
              {/* Paw trang trí */}
              <div className='absolute -bottom-1 -right-2 rounded-full border border-border bg-card p-2'>
                <MaterialIcon name='pets' className='text-[16px] text-primary' />
              </div>
            </div>
          </div>

          {/* Heading */}
          <div className='mb-10 text-center'>
            <h1 className='font-display text-2xl font-bold text-primary md:text-3xl'>
              {t('otp.title')}
            </h1>
            <p className='mt-3 text-sm leading-relaxed text-muted-foreground md:text-base'>
              {t('otp.subtitle')}
            </p>
            {email && (
              <p className='mt-2 text-sm font-semibold text-foreground'>{email}</p>
            )}
          </div>

          {/* Error message */}
          {errorMessage && (
            <div className='mb-6 flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive'>
              <MaterialIcon name='error' className='shrink-0 text-[20px]' />
              <p>{errorMessage}</p>
            </div>
          )}

          {/* Success message */}
          {isSuccess && (
            <div className='mb-6 flex items-center gap-3 rounded-xl border border-success/30 bg-success/10 px-4 py-3 text-sm text-success'>
              <MaterialIcon name='check_circle' className='shrink-0 text-[20px]' />
              <p>{t('otp.success')}</p>
            </div>
          )}

          {/* OTP Form */}
          <form className='space-y-10' onSubmit={handleSubmit}>
            {/* 6 ô nhập OTP */}
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

            {/* Nút xác nhận */}
            <button
              type='submit'
              disabled={isSubmitting || isSuccess}
              className='w-full rounded-xl bg-secondary px-4 py-4 text-base font-bold uppercase tracking-widest text-secondary-foreground shadow-md transition-all hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60'
            >
              {isSubmitting ? (
                <span className='flex items-center justify-center gap-2'>
                  <MaterialIcon name='progress_activity' className='animate-spin text-[20px]' />
                  {t('otp.processing')}
                </span>
              ) : isSuccess ? (
                <span className='flex items-center justify-center gap-2'>
                  <MaterialIcon name='check_circle' className='text-[20px]' />
                  {t('otp.successButton')}
                </span>
              ) : (
                t('otp.confirm')
              )}
            </button>
          </form>

          {/* Gửi lại mã */}
          <div className='mt-8 text-center'>
            <p className='text-sm text-muted-foreground'>{t('otp.noCode')}</p>
            <div className='mt-2 flex items-center justify-center gap-1'>
              <button
                type='button'
                disabled={isResendDisabled}
                onClick={handleResend}
                className={
                  isResendDisabled
                    ? 'cursor-not-allowed text-sm font-semibold text-muted-foreground opacity-60'
                    : 'cursor-pointer text-sm font-semibold text-primary hover:underline'
                }
              >
                {isResending ? t('otp.resending') : t('otp.resend')}
              </button>
              {timeLeft > 0 && (
                <span className='text-sm font-semibold text-primary'>({timeLeft}s)</span>
              )}
            </div>
          </div>
        </div>

        {/* Footer text */}
        <p className='mt-8 px-8 text-center text-xs text-muted-foreground opacity-60'>
          {t('otp.footer')}
        </p>
      </div>
    </main>
  )
}
