import { useState } from 'react'
import type { FormEvent } from 'react'
import { useTranslation } from 'react-i18next'

import { forgotPasswordApi } from '~/shared/lib/auth'
import { MaterialIcon } from '~/shared/ui'

export function ForgotPasswordPage() {
  const { t } = useTranslation('auth')

  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [isSent, setIsSent] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage('')
    setIsSubmitting(true)

    try {
      await forgotPasswordApi(email)
      setIsSent(true)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : t('forgot.error')
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
          href='/login'
          className='group flex items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-primary'
        >
          <MaterialIcon name='arrow_back' className='text-[20px]' />
          {t('forgot.backLogin')}
        </a>
      </nav>

      <div className='w-full max-w-[480px]'>
        <div className='relative overflow-hidden rounded-2xl border border-border/60 bg-card p-10 shadow-lg md:p-12'>
          {/* Gradient accent bar */}
          <div className='absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-primary to-warning' />

          {/* Icon */}
          <div className='mb-8 flex justify-center'>
            <div className='relative flex h-20 w-20 items-center justify-center rounded-full bg-accent'>
              <MaterialIcon name='lock_reset' filled className='text-[40px] text-accent-foreground' />
              <div className='absolute -bottom-1 -right-2 rounded-full border border-border bg-card p-2'>
                <MaterialIcon name='pets' className='text-[16px] text-primary' />
              </div>
            </div>
          </div>

          {/* Heading */}
          <div className='mb-10 text-center'>
            <h1 className='font-display text-2xl font-bold text-primary md:text-3xl'>
              {t('forgot.title')}
            </h1>
            <p className='mt-3 text-sm leading-relaxed text-muted-foreground md:text-base'>
              {t('forgot.subtitle')}
            </p>
          </div>

          {/* Error */}
          {errorMessage && (
            <div className='mb-6 flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive'>
              <MaterialIcon name='error' className='shrink-0 text-[20px]' />
              <p>{errorMessage}</p>
            </div>
          )}

          {/* Success → chuyển sang nhập OTP + mật khẩu mới */}
          {isSent ? (
            <div className='space-y-6'>
              <div className='flex items-center gap-3 rounded-xl border border-success/30 bg-success/10 px-4 py-3 text-sm text-success'>
                <MaterialIcon name='check_circle' className='shrink-0 text-[20px]' />
                <p>{t('forgot.sent')}</p>
              </div>
              <a
                href={`/reset-password?email=${encodeURIComponent(email)}`}
                className='flex w-full items-center justify-center rounded-xl bg-secondary px-4 py-4 text-base font-bold uppercase tracking-widest text-secondary-foreground shadow-md transition-all hover:opacity-90'
              >
                {t('forgot.continue')}
              </a>
            </div>
          ) : (
            <form className='space-y-8' onSubmit={handleSubmit}>
              <div className='space-y-2'>
                <label htmlFor='forgot_email' className='text-sm font-semibold text-foreground'>
                  {t('fields.email.label')}
                </label>
                <div className='relative'>
                  <MaterialIcon
                    name='mail'
                    className='absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground'
                  />
                  <input
                    id='forgot_email'
                    type='email'
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('fields.email.placeholder')}
                    className='w-full rounded-xl border border-border bg-muted py-4 pl-12 pr-4 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring'
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <button
                type='submit'
                disabled={isSubmitting}
                className='w-full rounded-xl bg-secondary px-4 py-4 text-base font-bold uppercase tracking-widest text-secondary-foreground shadow-md transition-all hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60'
              >
                {isSubmitting ? (
                  <span className='flex items-center justify-center gap-2'>
                    <MaterialIcon name='progress_activity' className='animate-spin text-[20px]' />
                    {t('forgot.sending')}
                  </span>
                ) : (
                  t('forgot.submit')
                )}
              </button>
            </form>
          )}

          {/* Link quay về login */}
          <div className='mt-8 text-center'>
            <a href='/login' className='text-sm font-semibold text-primary hover:underline'>
              {t('forgot.backLogin')}
            </a>
          </div>
        </div>
      </div>
    </main>
  )
}
