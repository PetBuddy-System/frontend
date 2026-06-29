import { useState } from 'react'
import type { FormEvent } from 'react'
import { useTranslation } from 'react-i18next'

import { useAuth } from '~/providers/auth-provider'
import { STORAGE_KEYS } from '~/shared/config/site'
import { getDashboardPathByRole } from '~/features/auth/services/auth'
import { readStorage } from '~/shared/lib/storage'
import { MaterialIcon } from '~/shared/ui'
import { validateEmail, validatePassword } from '~/shared/lib/validation'

import logo from '../assets/cho-login.jpg'

function getRedirectPathByRole(): string {
  const storedUser = readStorage(STORAGE_KEYS.user)
  if (storedUser) {
    try {
      const parsed = JSON.parse(storedUser) as { role?: string }
      return getDashboardPathByRole(parsed.role)
    } catch {
      // Fallback nếu parse lỗi
    }
  }
  return '/'
}

export function LoginPage() {
  const { t } = useTranslation('auth')
  const { login } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const [fieldErrors, setFieldErrors] = useState<{
    email?: string
    password?: string
  }>({})

  const [touched, setTouched] = useState<{
    email?: boolean
    password?: boolean
  }>({})

  function handleBlur(field: 'email' | 'password') {
    setTouched((prev) => ({ ...prev, [field]: true }))

    if (field === 'email') {
      const result = validateEmail(email)
      setFieldErrors((prev) => ({
        ...prev,
        email: result.valid ? undefined : result.message,
      }))
    } else if (field === 'password') {
      const result = validatePassword(password)
      setFieldErrors((prev) => ({
        ...prev,
        password: result.valid ? undefined : result.message,
      }))
    }
  }

  function handleEmailChange(value: string) {
    setEmail(value)
    if (touched.email) {
      const result = validateEmail(value)
      setFieldErrors((prev) => ({
        ...prev,
        email: result.valid ? undefined : result.message,
      }))
    }
  }

  function handlePasswordChange(value: string) {
    setPassword(value)
    if (touched.password) {
      const result = validatePassword(value)
      setFieldErrors((prev) => ({
        ...prev,
        password: result.valid ? undefined : result.message,
      }))
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage('')

    // Validate all fields before submit
    const emailResult = validateEmail(email)
    const passwordResult = validatePassword(password)

    setFieldErrors({
      email: emailResult.valid ? undefined : emailResult.message,
      password: passwordResult.valid ? undefined : passwordResult.message,
    })
    setTouched({ email: true, password: true })

    if (!emailResult.valid || !passwordResult.valid) {
      return
    }

    setIsSubmitting(true)

    try {
      await login(email, password)
      // Redirect theo role sau khi login thành công
      window.location.href = getRedirectPathByRole()
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : t('login.error')
      setErrorMessage(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const hasFieldError = (field: 'email' | 'password') =>
    touched[field] && fieldErrors[field]

  return (
    <main className='relative flex min-h-screen items-center justify-center bg-background px-4 py-12 md:px-6'>
      <a
        href='/'
        className='absolute left-6 top-6 flex items-center gap-2 text-sm font-semibold text-primary transition-opacity hover:opacity-80'
      >
        <MaterialIcon name='arrow_back' className='text-[20px]' />
        {t('backHome')}
      </a>

      <div className='flex w-full max-w-6xl flex-col overflow-hidden rounded-3xl border border-border/60 bg-card shadow-lg md:min-h-[700px] md:flex-row'>
        <section className='flex w-full flex-col justify-center p-8 md:w-1/2 md:p-12 lg:p-16'>
          <div className='mb-10'>
            <h1 className='text-3xl font-bold text-primary font-display md:text-4xl'>{t('login.welcomeTitle')}</h1>
            <p className='mt-2 text-sm text-muted-foreground md:text-base'>{t('login.welcomeSubtitle')}</p>
          </div>

          {errorMessage && (
            <div className='mb-6 flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive'>
              <MaterialIcon name='error' className='shrink-0 text-[20px]' />
              <p>{errorMessage}</p>
            </div>
          )}

          <form className='space-y-6' onSubmit={handleSubmit}>
            <div className='space-y-2'>
              <label htmlFor='login_id' className='text-sm font-semibold text-foreground'>
                {t('login.fields.loginId.label')}
              </label>
              <div className='relative'>
                <MaterialIcon
                  name='mail'
                  className='absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground'
                />
                <input
                  id='login_id'
                  type='email'
                  required
                  value={email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  onBlur={() => handleBlur('email')}
                  placeholder={t('login.fields.loginId.placeholder')}
                  className={`w-full rounded-xl border bg-muted py-4 pl-12 pr-4 text-sm text-foreground focus:outline-none focus:ring-2 ${
                    hasFieldError('email')
                      ? 'border-destructive focus:border-destructive focus:ring-destructive/30'
                      : 'border-border focus:border-primary focus:ring-ring'
                  }`}
                  disabled={isSubmitting}
                />
              </div>
              {hasFieldError('email') && (
                <p className='mt-1 text-xs text-destructive flex items-center gap-1'>
                  <MaterialIcon name='error' className='text-[14px]' />
                  {fieldErrors.email}
                </p>
              )}
            </div>

            <div className='space-y-2'>
              <div className='flex items-center justify-between'>
                <label htmlFor='password' className='text-sm font-semibold text-foreground'>
                  {t('fields.password.label')}
                </label>
                <a className='text-sm font-semibold text-primary hover:underline' href='/forgot-password'>
                  {t('login.forgot')}
                </a>
              </div>
              <div className='relative'>
                <MaterialIcon name='lock' className='absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground' />
                <input
                  id='password'
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  onBlur={() => handleBlur('password')}
                  placeholder={t('fields.password.placeholder')}
                  className={`w-full rounded-xl border bg-muted py-4 pl-12 pr-12 text-sm text-foreground focus:outline-none focus:ring-2 ${
                    hasFieldError('password')
                      ? 'border-destructive focus:border-destructive focus:ring-destructive/30'
                      : 'border-border focus:border-primary focus:ring-ring'
                  }`}
                  disabled={isSubmitting}
                />
                <button
                  type='button'
                  onClick={() => setShowPassword(!showPassword)}
                  className='absolute inset-y-0 right-0 flex items-center justify-center px-4 text-muted-foreground transition-colors hover:text-foreground'
                  aria-label={showPassword ? t('hidePassword') : t('showPassword')}
                >
                  <MaterialIcon name={showPassword ? 'visibility_off' : 'visibility'} className='text-xl' />
                </button>
              </div>
              {hasFieldError('password') && (
                <p className='mt-1 text-xs text-destructive flex items-center gap-1'>
                  <MaterialIcon name='error' className='text-[14px]' />
                  {fieldErrors.password}
                </p>
              )}
            </div>

            <label className='flex items-center gap-3 text-sm text-muted-foreground'>
              <input
                id='remember'
                type='checkbox'
                className='h-5 w-5 rounded border-border text-primary focus:ring-ring'
              />
              {t('login.remember')}
            </label>

            <button
              type='submit'
              disabled={isSubmitting}
              className='w-full rounded-xl bg-secondary px-4 py-4 text-base font-semibold text-secondary-foreground shadow-md transition-opacity hover:opacity-90 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60'
            >
              {isSubmitting ? (
                <span className='flex items-center justify-center gap-2'>
                  <MaterialIcon name='progress_activity' className='animate-spin text-[20px]' />
                  {t('login.loading')}
                </span>
              ) : (
                t('login.submit')
              )}
            </button>
          </form>

          <div className='relative my-10 text-center'>
            <div className='absolute inset-0 flex items-center'>
              <div className='w-full border-t border-border' />
            </div>
            <span className='relative bg-card px-4 text-sm font-semibold text-muted-foreground'>{t('login.or')}</span>
          </div>

          <div className='grid grid-cols-1 gap-4'>
            <button
              type='button'
              className='flex w-full items-center justify-center gap-3 rounded-xl border border-border px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted'
            >
              <svg className='h-5 w-5' viewBox='0 0 24 24' aria-hidden='true'>
                <path
                  d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
                  fill='#4285F4'
                />
                <path
                  d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
                  fill='#34A853'
                />
                <path
                  d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
                  fill='#FBBC05'
                />
                <path
                  d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
                  fill='#EA4335'
                />
              </svg>
              {t('login.social.google')}
            </button>
          </div>

          <p className='mt-8 text-center text-sm text-muted-foreground'>
            {t('login.noAccount')}
            <a className='font-semibold text-primary hover:underline' href='/register'>
              {t('login.register')}
            </a>
          </p>
        </section>

        <section className='relative hidden w-1/2 overflow-hidden md:block'>
          <img src={logo} alt={t('login.heroAlt')} className='absolute inset-0 h-full w-full object-cover' />
          <div className='absolute inset-0 bg-gradient-to-t from-primary/70 via-primary/20 to-transparent' />
          <div className='absolute bottom-10 left-10 right-10 text-primary-foreground'>
            <h2 className='text-3xl font-bold font-display'>{t('login.heroTitle')}</h2>
            <p className='mt-4 text-base opacity-90'>{t('login.heroSubtitle')}</p>
          </div>
        </section>
      </div>

      <div className='fixed bottom-6 right-6 z-40'>
        <button
          type='button'
          className='flex h-14 w-14 items-center justify-center rounded-full bg-brand-zalo text-brand-zalo-foreground shadow-lg transition-transform hover:scale-105'
          aria-label={t('login.supportChat')}
        >
          <MaterialIcon name='chat' className='text-[26px]' />
        </button>
      </div>
    </main>
  )
}
