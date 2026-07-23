import { useState } from 'react'
import type { FormEvent } from 'react'
import { useTranslation } from 'react-i18next'

import { signupApi } from '~/features/auth/services/auth'
import { redirectToGoogle } from '~/features/auth/services/auth/google-auth'
import { MaterialIcon } from '~/shared/ui'
import {
  validateEmail,
  validateStrongPassword,
  validateConfirmPassword,
  validateFullName
} from '~/shared/lib/validation'

import logo from '../assets/cho-signup.jpg'

const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/
const DISPLAY_DATE_PATTERN = /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/

function normalizeDateOfBirthForApi(value: string) {
  const trimmedValue = value.trim()
  if (!trimmedValue) return trimmedValue
  if (ISO_DATE_PATTERN.test(trimmedValue)) return trimmedValue

  const displayDateMatch = DISPLAY_DATE_PATTERN.exec(trimmedValue)
  if (!displayDateMatch) return trimmedValue

  const [, day, month, year] = displayDateMatch

  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
}

export function RegisterPage() {
  const { t } = useTranslation('auth')

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [gender, setGender] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const [fieldErrors, setFieldErrors] = useState<{
    fullName?: string
    email?: string
    password?: string
    confirmPassword?: string
  }>({})

  const [touched, setTouched] = useState<{
    fullName?: boolean
    email?: boolean
    password?: boolean
    confirmPassword?: boolean
  }>({})

  function handleBlur(field: 'fullName' | 'email' | 'password' | 'confirmPassword') {
    setTouched((prev) => ({ ...prev, [field]: true }))

    switch (field) {
      case 'fullName': {
        const result = validateFullName(fullName)
        setFieldErrors((prev) => ({
          ...prev,
          fullName: result.valid ? undefined : result.message
        }))
        break
      }
      case 'email': {
        const result = validateEmail(email)
        setFieldErrors((prev) => ({
          ...prev,
          email: result.valid ? undefined : result.message
        }))
        break
      }
      case 'password': {
        const result = validateStrongPassword(password)
        setFieldErrors((prev) => ({
          ...prev,
          password: result.valid ? undefined : result.message
        }))
        break
      }
      case 'confirmPassword': {
        const result = validateConfirmPassword(password, confirmPassword)
        setFieldErrors((prev) => ({
          ...prev,
          confirmPassword: result.valid ? undefined : result.message
        }))
        break
      }
    }
  }

  function handleFullNameChange(value: string) {
    setFullName(value)
    if (touched.fullName) {
      const result = validateFullName(value)
      setFieldErrors((prev) => ({
        ...prev,
        fullName: result.valid ? undefined : result.message
      }))
    }
  }

  function handleEmailChange(value: string) {
    setEmail(value)
    if (touched.email) {
      const result = validateEmail(value)
      setFieldErrors((prev) => ({
        ...prev,
        email: result.valid ? undefined : result.message
      }))
    }
  }

  function handlePasswordChange(value: string) {
    setPassword(value)
    if (touched.password) {
      const result = validateStrongPassword(value)
      setFieldErrors((prev) => ({
        ...prev,
        password: result.valid ? undefined : result.message
      }))
    }
    // Also revalidate confirm password if it was touched
    if (touched.confirmPassword && confirmPassword) {
      const result = validateConfirmPassword(value, confirmPassword)
      setFieldErrors((prev) => ({
        ...prev,
        confirmPassword: result.valid ? undefined : result.message
      }))
    }
  }

  function handleConfirmPasswordChange(value: string) {
    setConfirmPassword(value)
    if (touched.confirmPassword) {
      const result = validateConfirmPassword(password, value)
      setFieldErrors((prev) => ({
        ...prev,
        confirmPassword: result.valid ? undefined : result.message
      }))
    }
  }

  function hasFieldError(field: 'fullName' | 'email' | 'password' | 'confirmPassword') {
    return touched[field] && fieldErrors[field]
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage('')

    // Validate all fields before submit
    const fullNameResult = validateFullName(fullName)
    const emailResult = validateEmail(email)
    const passwordResult = validateStrongPassword(password)
    const confirmPasswordResult = validateConfirmPassword(password, confirmPassword)

    setFieldErrors({
      fullName: fullNameResult.valid ? undefined : fullNameResult.message,
      email: emailResult.valid ? undefined : emailResult.message,
      password: passwordResult.valid ? undefined : passwordResult.message,
      confirmPassword: confirmPasswordResult.valid ? undefined : confirmPasswordResult.message
    })
    setTouched({ fullName: true, email: true, password: true, confirmPassword: true })

    if (!fullNameResult.valid || !emailResult.valid || !passwordResult.valid || !confirmPasswordResult.valid) {
      return
    }

    setIsSubmitting(true)

    try {
      const formattedDob = normalizeDateOfBirthForApi(dateOfBirth)

      await signupApi({ email, password, fullName, gender, dateOfBirth: formattedDob })
      // Signup thành công → chuyển sang trang OTP verification
      window.location.href = `/verify-email?email=${encodeURIComponent(email)}`
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : t('register.error')
      setErrorMessage(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className='relative flex min-h-screen items-center justify-center bg-background px-4 py-12 md:px-6'>
      <a
        href='/'
        className='absolute left-6 top-6 flex items-center gap-2 text-sm font-semibold text-primary transition-opacity hover:opacity-80'
      >
        <MaterialIcon name='arrow_back' className='text-[20px]' />
        {t('backHome')}
      </a>

      <div className='grid w-full max-w-6xl grid-cols-1 overflow-hidden rounded-3xl border border-border/60 bg-card shadow-lg md:grid-cols-2'>
        <section className='relative hidden overflow-hidden md:block'>
          <img src={logo} alt={t('heroAlt')} className='absolute inset-0 h-full w-full object-cover' />
          <div className='absolute inset-0 bg-gradient-to-t from-primary/40 to-transparent' />
          <div className='absolute bottom-10 left-10 right-10 text-primary-foreground'>
            <h2 className='text-3xl font-bold font-display'>{t('heroTitle')}</h2>
            <p className='mt-4 text-base opacity-90'>{t('heroSubtitle')}</p>
          </div>
        </section>

        <section className='flex flex-col justify-center p-8 md:p-14'>
          <div className='mb-8'>
            <h1 className='text-3xl font-bold text-primary font-display'>{t('title')}</h1>
            <p className='mt-2 text-sm text-muted-foreground'>{t('subtitle')}</p>
          </div>

          {errorMessage && (
            <div className='mb-6 flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive'>
              <MaterialIcon name='error' className='shrink-0 text-[20px]' />
              <p>{errorMessage}</p>
            </div>
          )}

          <form className='space-y-5' onSubmit={handleSubmit}>
            {/* Full Name */}
            <div className='space-y-2'>
              <label htmlFor='full_name' className='text-sm font-semibold text-foreground'>
                {t('fields.fullName.label')}
              </label>
              <div className='relative'>
                <MaterialIcon
                  name='person'
                  className='absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground'
                />
                <input
                  id='full_name'
                  type='text'
                  required
                  value={fullName}
                  onChange={(e) => handleFullNameChange(e.target.value)}
                  onBlur={() => handleBlur('fullName')}
                  placeholder={t('fields.fullName.placeholder')}
                  className={`w-full rounded-xl border bg-muted py-3 pl-12 pr-4 text-sm text-foreground focus:outline-none focus:ring-2 ${
                    hasFieldError('fullName')
                      ? 'border-destructive focus:border-destructive focus:ring-destructive/30'
                      : 'border-border focus:border-primary focus:ring-ring'
                  }`}
                  disabled={isSubmitting}
                />
              </div>
              {hasFieldError('fullName') && (
                <p className='mt-1 text-xs text-destructive flex items-center gap-1'>
                  <MaterialIcon name='error' className='text-[14px]' />
                  {fieldErrors.fullName}
                </p>
              )}
            </div>

            {/* Email */}
            <div className='space-y-2'>
              <label htmlFor='email' className='text-sm font-semibold text-foreground'>
                {t('fields.email.label')}
              </label>
              <div className='relative'>
                <MaterialIcon name='mail' className='absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground' />
                <input
                  id='email'
                  type='email'
                  required
                  value={email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  onBlur={() => handleBlur('email')}
                  placeholder={t('fields.email.placeholder')}
                  className={`w-full rounded-xl border bg-muted py-3 pl-12 pr-4 text-sm text-foreground focus:outline-none focus:ring-2 ${
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

            {/* Gender + Date of Birth */}
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              <div className='space-y-2'>
                <label htmlFor='gender' className='text-sm font-semibold text-foreground'>
                  {t('fields.gender.label')}
                </label>
                <div className='relative'>
                  <MaterialIcon name='wc' className='absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground' />
                  <select
                    id='gender'
                    required
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className='w-full appearance-none rounded-xl border border-border bg-muted py-3 pl-12 pr-4 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring'
                    disabled={isSubmitting}
                  >
                    <option value=''>{t('fields.gender.placeholder')}</option>
                    <option value='MALE'>{t('fields.gender.male')}</option>
                    <option value='FEMALE'>{t('fields.gender.female')}</option>
                    <option value='OTHER'>{t('fields.gender.other')}</option>
                  </select>
                </div>
              </div>

              <div className='space-y-2'>
                <label htmlFor='date_of_birth' className='text-sm font-semibold text-foreground'>
                  {t('fields.dateOfBirth.label')}
                </label>
                <div className='relative'>
                  <MaterialIcon
                    name='calendar_month'
                    className='absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground'
                  />
                  <input
                    id='date_of_birth'
                    type='date'
                    required
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className='w-full rounded-xl border border-border bg-muted py-3 pl-12 pr-4 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring'
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </div>

            {/* Password */}
            <div className='space-y-2'>
              <label htmlFor='password' className='text-sm font-semibold text-foreground'>
                {t('fields.password.label')}
              </label>
              <div className='relative'>
                <MaterialIcon name='lock' className='absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground' />
                <input
                  id='password'
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  onBlur={() => handleBlur('password')}
                  placeholder={t('fields.password.placeholder')}
                  className={`w-full rounded-xl border bg-muted py-3 pl-12 pr-12 text-sm text-foreground focus:outline-none focus:ring-2 ${
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
              {/* Password strength hint */}
              {!touched.password && !fieldErrors.password && (
                <p className='mt-1 text-xs text-muted-foreground'>
                  Mật khẩu phải có ít nhất 8 ký tự, gồm chữ hoa, chữ thường và số
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div className='space-y-2'>
              <label htmlFor='confirm_password' className='text-sm font-semibold text-foreground'>
                {t('fields.confirmPassword.label')}
              </label>
              <div className='relative'>
                <MaterialIcon
                  name='verified_user'
                  className='absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground'
                />
                <input
                  id='confirm_password'
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                  onBlur={() => handleBlur('confirmPassword')}
                  placeholder={t('fields.confirmPassword.placeholder')}
                  className={`w-full rounded-xl border bg-muted py-3 pl-12 pr-12 text-sm text-foreground focus:outline-none focus:ring-2 ${
                    hasFieldError('confirmPassword')
                      ? 'border-destructive focus:border-destructive focus:ring-destructive/30'
                      : 'border-border focus:border-primary focus:ring-ring'
                  }`}
                  disabled={isSubmitting}
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
              {hasFieldError('confirmPassword') && (
                <p className='mt-1 text-xs text-destructive flex items-center gap-1'>
                  <MaterialIcon name='error' className='text-[14px]' />
                  {fieldErrors.confirmPassword}
                </p>
              )}
            </div>

            <label className='flex items-start gap-3 text-sm text-muted-foreground'>
              <input
                id='terms'
                type='checkbox'
                required
                className='mt-1 h-5 w-5 rounded border-border text-primary focus:ring-ring'
              />
              <span>
                {t('terms.prefix')}
                <a className='text-primary hover:underline' href='#'>
                  {t('terms.service')}
                </a>
                {t('terms.and')}
                <a className='text-primary hover:underline' href='#'>
                  {t('terms.privacy')}
                </a>
                .
              </span>
            </label>

            <button
              type='submit'
              disabled={isSubmitting}
              className='w-full rounded-xl bg-secondary px-4 py-4 text-base font-semibold text-secondary-foreground shadow-sm transition-opacity hover:opacity-90 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60'
            >
              {isSubmitting ? (
                <span className='flex items-center justify-center gap-2'>
                  <MaterialIcon name='progress_activity' className='animate-spin text-[20px]' />
                  {t('register.loading')}
                </span>
              ) : (
                t('submit')
              )}
            </button>
          </form>

          <div className='relative my-8 text-center'>
            <div className='absolute inset-0 flex items-center'>
              <div className='w-full border-t border-border' />
            </div>
            <span className='relative bg-card px-4 text-sm font-semibold text-muted-foreground'>{t('or')}</span>
          </div>

          <div className='grid grid-cols-1 gap-4'>
            <button
              type='button'
              onClick={() => redirectToGoogle()}
              disabled={isSubmitting}
              className='flex w-full items-center justify-center gap-3 rounded-xl border border-border px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60'
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
              {t('social.google')}
            </button>
          </div>

          <div className='mt-8 border-t border-border/60 pt-6 text-center text-sm text-muted-foreground'>
            {t('already.prefix')}
            <a className='font-semibold text-primary hover:underline' href='/login'>
              {t('already.login')}
            </a>
          </div>
        </section>
      </div>
    </main>
  )
}
