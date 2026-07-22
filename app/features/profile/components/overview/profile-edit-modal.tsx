import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Button, MaterialIcon } from '~/shared/ui'
import type { UserResponse } from '~/shared/lib/auth'
import { updateCurrentUserApi } from '../../services/user'

interface ProfileEditModalProps {
  user: UserResponse | null
  isOpen: boolean
  onClose: () => void
  onSuccess: (updatedUser: UserResponse) => void
}

interface FormValues {
  fullName: string
  dateOfBirth: string
  gender: string
  avatarUrl: string
}

export function ProfileEditModal({ user, isOpen, onClose, onSuccess }: ProfileEditModalProps) {
  const { t } = useTranslation('profile')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formValues, setFormValues] = useState<FormValues>({
    fullName: '',
    dateOfBirth: '',
    gender: 'MALE',
    avatarUrl: ''
  })
  const [previewUrl, setPreviewUrl] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  // Sync form khi user prop thay đổi
  useEffect(() => {
    if (user && isOpen) {
      const avatarUrl = user.mediaFiles?.find((m) => m.mediaPurpose === 'USER_PROFILE')?.fileUrl ?? ''
      setFormValues({
        fullName: user.fullName ?? '',
        dateOfBirth: user.dateOfBirth ?? '',
        gender: user.gender ?? 'MALE',
        avatarUrl
      })
      setPreviewUrl(avatarUrl)
      setErrorMessage('')
      setSuccessMessage('')
    }
  }, [user, isOpen])

  // Reset khi đóng modal
  useEffect(() => {
    if (!isOpen) {
      setFormValues({ fullName: '', dateOfBirth: '', gender: 'MALE', avatarUrl: '' })
      setPreviewUrl('')
      setErrorMessage('')
      setSuccessMessage('')
      setIsSubmitting(false)
    }
  }, [isOpen])

  function handleAvatarClick() {
    fileInputRef.current?.click()
  }

  function handleAvatarChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (file) {
      const objectUrl = URL.createObjectURL(file)
      setPreviewUrl(objectUrl)
      setFormValues((prev) => ({ ...prev, avatarUrl: objectUrl }))
    }
  }

  function handleFieldChange(field: keyof FormValues, value: string) {
    setFormValues((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit() {
    if (!formValues.fullName.trim()) {
      setErrorMessage(t('profile.editProfile.updateError'))
      return
    }

    setIsSubmitting(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      const payload = {
        fullName: formValues.fullName.trim(),
        dateOfBirth: formValues.dateOfBirth || undefined,
        gender: formValues.gender || undefined,
        mediaFiles:
          previewUrl && previewUrl !== user?.mediaFiles?.[0]?.fileUrl
            ? [
                {
                  fileUrl: previewUrl,
                  fileType: 'IMAGE',
                  mediaPurpose: 'USER_PROFILE'
                }
              ]
            : undefined
      }

      const response = await updateCurrentUserApi(payload)

      if (response.success && response.data) {
        setSuccessMessage(t('profile.editProfile.updateSuccess'))
        onSuccess(response.data)
        setTimeout(() => {
          onClose()
        }, 1500)
      } else {
        setErrorMessage(response.message ?? t('profile.editProfile.updateError'))
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : t('profile.editProfile.updateError')
      setErrorMessage(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'>
      <div
        className='relative w-full max-w-lg rounded-2xl bg-background shadow-2xl animate-in fade-in zoom-in duration-200'
        role='dialog'
        aria-modal='true'
        aria-labelledby='profile-edit-title'
      >
        {/* Header */}
        <div className='flex items-center justify-between border-b border-border px-6 py-4'>
          <div>
            <h2 id='profile-edit-title' className='text-lg font-bold text-foreground'>
              {t('profile.editProfile.title')}
            </h2>
            <p className='mt-0.5 text-sm text-muted-foreground'>{t('profile.editProfile.subtitle')}</p>
          </div>
          <button
            type='button'
            onClick={onClose}
            aria-label={t('profile.editProfile.cancel')}
            className='rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
          >
            <MaterialIcon name='close' className='text-2xl' />
          </button>
        </div>

        {/* Body */}
        <div className='px-6 py-5 space-y-5'>
          {/* Avatar */}
          <div className='flex flex-col items-center gap-3'>
            <div className='relative'>
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt={t('profile.avatarAlt')}
                  className='h-24 w-24 rounded-full border-4 border-border object-cover'
                />
              ) : (
                <div className='flex h-24 w-24 items-center justify-center rounded-full border-4 border-border bg-muted'>
                  <MaterialIcon name='person' className='text-4xl text-muted-foreground' />
                </div>
              )}
              <button
                type='button'
                onClick={handleAvatarClick}
                aria-label={t('profile.changePhoto')}
                className='absolute -bottom-1 -right-1 rounded-xl bg-primary p-2 text-primary-foreground shadow-md transition-transform hover:scale-105'
              >
                <MaterialIcon name='photo_camera' className='text-[18px]' />
              </button>
              <input
                ref={fileInputRef}
                type='file'
                accept='image/*'
                onChange={handleAvatarChange}
                className='hidden'
                aria-hidden='true'
              />
            </div>
            <p className='text-xs text-muted-foreground'>{t('profile.editProfile.avatarHint')}</p>
          </div>

          {/* Full Name */}
          <div className='space-y-2'>
            <label htmlFor='edit-fullName' className='text-sm font-semibold text-foreground'>
              {t('profile.editProfile.fullNameLabel')}
            </label>
            <div className='relative'>
              <MaterialIcon name='badge' className='absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground' />
              <input
                id='edit-fullName'
                type='text'
                value={formValues.fullName}
                onChange={(e) => handleFieldChange('fullName', e.target.value)}
                placeholder={t('profile.editProfile.fullNamePlaceholder')}
                className='w-full rounded-xl border border-border bg-muted py-3 pl-12 pr-4 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring'
              />
            </div>
          </div>

          {/* Email (readonly) */}
          <div className='space-y-2'>
            <label htmlFor='edit-email' className='text-sm font-semibold text-foreground'>
              {t('profile.editProfile.emailLabel')}
            </label>
            <div className='relative'>
              <MaterialIcon name='mail' className='absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground' />
              <input
                id='edit-email'
                type='email'
                value={user?.email ?? ''}
                readOnly
                disabled
                className='w-full cursor-not-allowed rounded-xl border border-border bg-muted/50 py-3 pl-12 pr-4 text-sm text-muted-foreground'
              />
            </div>
            <p className='text-xs text-muted-foreground'>{t('profile.editProfile.emailHint')}</p>
          </div>

          {/* Date of Birth + Gender row */}
          <div className='grid grid-cols-2 gap-4'>
            {/* Date of Birth */}
            <div className='space-y-2'>
              <label htmlFor='edit-dateOfBirth' className='text-sm font-semibold text-foreground'>
                {t('profile.editProfile.dateOfBirthLabel')}
              </label>
              <div className='relative'>
                <MaterialIcon name='cake' className='absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground' />
                <input
                  id='edit-dateOfBirth'
                  type='date'
                  value={formValues.dateOfBirth}
                  onChange={(e) => handleFieldChange('dateOfBirth', e.target.value)}
                  className='w-full rounded-xl border border-border bg-muted py-3 pl-12 pr-4 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring'
                />
              </div>
            </div>

            {/* Gender */}
            <div className='space-y-2'>
              <label htmlFor='edit-gender' className='text-sm font-semibold text-foreground'>
                {t('profile.editProfile.genderLabel')}
              </label>
              <div className='relative'>
                <MaterialIcon name='wc' className='absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground' />
                <select
                  id='edit-gender'
                  value={formValues.gender}
                  onChange={(e) => handleFieldChange('gender', e.target.value)}
                  className='w-full appearance-none rounded-xl border border-border bg-muted py-3 pl-12 pr-10 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring'
                >
                  <option value='MALE'>{t('profile.editProfile.genderOptions.MALE')}</option>
                  <option value='FEMALE'>{t('profile.editProfile.genderOptions.FEMALE')}</option>
                  <option value='OTHER'>{t('profile.editProfile.genderOptions.OTHER')}</option>
                </select>
                <MaterialIcon
                  name='arrow_drop_down'
                  className='pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground'
                />
              </div>
            </div>
          </div>

          {/* Error message */}
          {errorMessage && (
            <div className='flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive'>
              <MaterialIcon name='error' className='shrink-0 text-[20px]' />
              <p>{errorMessage}</p>
            </div>
          )}

          {/* Success message */}
          {successMessage && (
            <div className='flex items-center gap-2 rounded-xl border border-success/30 bg-success/10 px-4 py-3 text-sm text-success'>
              <MaterialIcon name='check_circle' className='shrink-0 text-[20px]' />
              <p>{successMessage}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className='flex items-center justify-end gap-3 border-t border-border px-6 py-4'>
          <Button variant='outline' onClick={onClose} disabled={isSubmitting}>
            {t('profile.editProfile.cancel')}
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <span className='flex items-center gap-2'>
                <MaterialIcon name='progress_activity' className='animate-spin text-[20px]' />
                {t('profile.editProfile.saving')}
              </span>
            ) : (
              <span className='flex items-center gap-2'>
                <MaterialIcon name='save' className='text-[20px]' />
                {t('profile.editProfile.save')}
              </span>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
