import { useState } from 'react'
import type { FormEvent } from 'react'
import { useTranslation } from 'react-i18next'

import { signupApi } from '~/shared/lib/auth'
import { MaterialIcon } from '~/shared/ui'

import logo from '../assets/cho-signup.jpg'

export function RegisterPage() {
  const { t } = useTranslation('auth')

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [gender, setGender] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage('')

    // Validate mật khẩu khớp
    if (password !== confirmPassword) {
      setErrorMessage(t('register.passwordMismatch'))
      return
    }

    // Validate mật khẩu ít nhất 8 ký tự
    if (password.length < 8) {
      setErrorMessage(t('register.passwordTooShort'))
      return
    }

    setIsSubmitting(true)

    try {
      // HTML input type="date" trả về yyyy-MM-dd, API yêu cầu dd-MM-yyyy
      const [year, month, day] = dateOfBirth.split('-')
      const formattedDob = `${day}-${month}-${year}`

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

          <form className='space-y-6' onSubmit={handleSubmit}>
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
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={t('fields.fullName.placeholder')}
                  className='w-full rounded-xl border border-border bg-muted py-3 pl-12 pr-4 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring'
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              <div className='space-y-2'>
                <label htmlFor='email' className='text-sm font-semibold text-foreground'>
                  {t('fields.email.label')}
                </label>
                <div className='relative'>
                  <MaterialIcon
                    name='mail'
                    className='absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground'
                  />
                  <input
                    id='email'
                    type='email'
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('fields.email.placeholder')}
                    className='w-full rounded-xl border border-border bg-muted py-3 pl-12 pr-4 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring'
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </div>

            {/* Gender + Date of Birth */}
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              <div className='space-y-2'>
                <label htmlFor='gender' className='text-sm font-semibold text-foreground'>
                  {t('fields.gender.label')}
                </label>
                <div className='relative'>
                  <MaterialIcon
                    name='wc'
                    className='absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground'
                  />
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

            <div className='space-y-2'>
              <label htmlFor='password' className='text-sm font-semibold text-foreground'>
                {t('fields.password.label')}
              </label>
              <div className='relative'>
                <MaterialIcon name='lock' className='absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground' />
                <input
                  id='password'
                  type='password'
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('fields.password.placeholder')}
                  className='w-full rounded-xl border border-border bg-muted py-3 pl-12 pr-4 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring'
                  disabled={isSubmitting}
                />
              </div>
            </div>

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
                  type='password'
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t('fields.confirmPassword.placeholder')}
                  className='w-full rounded-xl border border-border bg-muted py-3 pl-12 pr-4 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring'
                  disabled={isSubmitting}
                />
              </div>
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
