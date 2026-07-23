import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { MaterialIcon } from '~/shared/ui'
import type { UserResponse } from '~/shared/lib/auth'
import { getCurrentUserApi } from '../../services/user'
import { ProfileEditModal } from './profile-edit-modal'

const GENDER_LABEL_MAP: Record<string, string> = {
  MALE: 'Nam',
  FEMALE: 'Nữ',
  OTHER: 'Khác'
}

const DEFAULT_AVATAR = 'https://i.pravatar.cc/150?img=1'

export function ProfileInfoCard() {
  const { t, i18n } = useTranslation(['profile', 'auth'])

  const [user, setUser] = useState<UserResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  // Fetch user data on mount
  useEffect(() => {
    async function fetchUser() {
      try {
        setIsLoading(true)
        setLoadError('')
        const response = await getCurrentUserApi()
        if (response.success && response.data) {
          setUser(response.data)
        } else {
          setLoadError(t('profile.editProfile.loadError'))
        }
      } catch {
        setLoadError(t('profile.editProfile.loadError'))
      } finally {
        setIsLoading(false)
      }
    }
    fetchUser()
  }, [t])

  function handleEditSuccess(updatedUser: UserResponse) {
    setUser(updatedUser)
  }

  // Derive avatar URL
  const avatarUrl = user?.mediaFiles?.find((m) => m.mediaPurpose === 'USER_PROFILE')?.fileUrl ?? DEFAULT_AVATAR

  // Derive display fields
  const displayFullName = user?.fullName ?? t('user.name')
  const displayEmail = user?.email ?? ''
  const displayGender = user?.gender ? (GENDER_LABEL_MAP[user.gender] ?? user.gender) : 'Nam'
  const displayBirthday = user?.dateOfBirth
    ? new Date(user.dateOfBirth).toLocaleDateString(i18n.language === 'vi' ? 'vi-VN' : 'en-US', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    : ''

  return (
    <>
      <section className='rounded-2xl border border-border/60 bg-card p-5 shadow-sm transition-transform hover:-translate-y-0.5 md:p-6'>
        {/* Loading state */}
        {isLoading && (
          <div className='flex flex-col items-center gap-6 md:flex-row'>
            <div className='h-28 w-28 animate-pulse rounded-3xl border-4 border-border bg-muted md:h-32 md:w-32' />
            <div className='flex-1 space-y-3 text-center md:text-left'>
              <div className='h-6 w-48 animate-pulse rounded-lg bg-muted' />
              <div className='h-4 w-64 animate-pulse rounded-lg bg-muted' />
            </div>
            <div className='h-10 w-32 animate-pulse rounded-xl bg-muted' />
          </div>
        )}

        {/* Error state */}
        {!isLoading && loadError && (
          <div className='flex flex-col items-center gap-4 py-6 text-center'>
            <MaterialIcon name='error' className='text-5xl text-destructive' />
            <p className='text-sm text-muted-foreground'>{loadError}</p>
          </div>
        )}

        {/* Content */}
        {!isLoading && !loadError && (
          <>
            <div className='flex flex-col items-center gap-6 md:flex-row'>
              {/* Avatar */}
              <div className='relative'>
                <img
                  src={avatarUrl}
                  alt={t('profile.avatarAlt')}
                  className='h-28 w-28 rounded-3xl border-4 border-background object-cover shadow-lg md:h-32 md:w-32'
                />
              </div>

              {/* Name + Badge */}
              <div className='flex-1 text-center md:text-left'>
                <div className='mb-2 flex flex-col items-center gap-3 md:flex-row'>
                  <h2 className='font-display text-xl font-semibold text-foreground md:text-2xl'>{displayFullName}</h2>
                  <span className='mx-auto flex w-fit items-center gap-1 rounded-full bg-secondary px-3 py-1 text-xs font-bold uppercase tracking-wider text-secondary-foreground md:mx-0'>
                    <MaterialIcon name='star' filled className='text-[14px]' />
                    {t('profile.goldMember')}
                  </span>
                </div>
                <p className='text-sm text-muted-foreground md:text-base'>
                  {user?.createdAt
                    ? `${t('profile.memberSince').split('•')[0].trim()} ${new Date(user.createdAt).toLocaleDateString(i18n.language === 'vi' ? 'vi-VN' : 'en-US', { month: 'long', year: 'numeric' })}`
                    : t('profile.memberSince')}
                </p>
              </div>

              {/* Edit button */}
              <button
                type='button'
                onClick={() => setIsEditModalOpen(true)}
                className='flex items-center gap-2 rounded-xl bg-primary px-5 py-2 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90 md:text-base'
              >
                <MaterialIcon name='edit' className='text-[20px]' />
                {t('profile.edit')}
              </button>
            </div>

            <hr className='my-6 border-border md:my-8' />

            {/* Fields grid */}
            <div className='grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2'>
              {/* Full Name */}
              <div className='space-y-1'>
                <p className='text-sm font-semibold text-muted-foreground'>{t('profile.fields.fullName.label')}</p>
                <p className='rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground md:py-3 md:text-base'>
                  {displayFullName}
                </p>
              </div>

              {/* Email */}
              <div className='space-y-1'>
                <p className='text-sm font-semibold text-muted-foreground'>{t('profile.fields.email.label')}</p>
                <p className='rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground md:py-3 md:text-base'>
                  {displayEmail}
                </p>
              </div>

              {/* Phone (không có trong API, hiển thị placeholder) */}
              <div className='space-y-1'>
                <p className='text-sm font-semibold text-muted-foreground'>{t('profile.fields.phone.label')}</p>
                <p className='rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-muted-foreground md:py-3 md:text-base'>
                  —
                </p>
              </div>

              {/* Birthday */}
              <div className='space-y-1'>
                <p className='text-sm font-semibold text-muted-foreground'>{t('profile.fields.birthday.label')}</p>
                <p className='rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground md:py-3 md:text-base'>
                  {displayBirthday || '—'}
                </p>
              </div>

              {/* Gender + Change password */}
              <div className='space-y-1'>
                <p className='text-sm font-semibold text-muted-foreground'>{t('profile.fields.gender.label')}</p>
                <div className='flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between'>
                  <p className='flex-1 rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground md:py-3 md:text-base'>
                    {displayGender}
                  </p>
                  <Link
                    to='/change-password'
                    className='inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-bold text-foreground transition-colors hover:border-primary hover:text-primary md:py-3'
                  >
                    <MaterialIcon name='key' className='text-[18px]' />
                    {t('auth:changePassword.title')}
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}
      </section>

      {/* Edit Modal */}
      <ProfileEditModal
        user={user}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={handleEditSuccess}
      />
    </>
  )
}
