import { useTranslation } from 'react-i18next'

import { MaterialIcon } from '~/shared/ui'

const PROFILE_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuASyF5YyGHq5Vpgp-UK1MftgFCn3sOApwssuP50T-npqcGjI167fZz-5k_bJY2mY9bVTmAvtM8zkyxKhoNwC1wwciR6rh7HflaeKIzEOMzeQoHfeSnhFwLChcGe6Gb2AxBNXTkcMcgYppVgZJouWjwzr31ma6f66hoT7fA0DqQm_PtDibmI-rpWQFxvOrjj_8NoBVdUzTbgihAgJcC0UWaYOaGNenVLfPVfA4i-iv7p8Tq0qCvWYTbo6WG5rmpEaxJkfgkLU-MkXFQ'

const PROFILE_FIELDS = ['fullName', 'email', 'phone', 'birthday', 'gender'] as const

export function ProfileInfoCard() {
  const { t } = useTranslation('profile')

  return (
    <section className='rounded-2xl border border-border/60 bg-card p-5 shadow-sm transition-transform hover:-translate-y-0.5 md:p-6'>
      <div className='flex flex-col items-center gap-6 md:flex-row'>
        <div className='relative'>
          <img
            src={PROFILE_IMAGE}
            alt={t('profile.avatarAlt')}
            className='h-28 w-28 rounded-3xl border-4 border-background object-cover shadow-lg md:h-32 md:w-32'
          />
          <button
            type='button'
            aria-label={t('profile.changePhoto')}
            className='absolute -bottom-2 -right-2 rounded-xl bg-primary p-2 text-primary-foreground shadow-md transition-transform hover:scale-105'
          >
            <MaterialIcon name='photo_camera' className='text-[18px]' />
          </button>
        </div>

        <div className='flex-1 text-center md:text-left'>
          <div className='mb-2 flex flex-col items-center gap-3 md:flex-row'>
            <h2 className='font-display text-xl font-semibold text-foreground md:text-2xl'>{t('user.name')}</h2>
            <span className='mx-auto flex w-fit items-center gap-1 rounded-full bg-secondary px-3 py-1 text-xs font-bold uppercase tracking-wider text-secondary-foreground md:mx-0'>
              <MaterialIcon name='star' filled className='text-[14px]' />
              {t('profile.goldMember')}
            </span>
          </div>
          <p className='text-sm text-muted-foreground md:text-base'>{t('profile.memberSince')}</p>
        </div>

        <button
          type='button'
          className='flex items-center gap-2 rounded-xl bg-primary px-5 py-2 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90 md:text-base'
        >
          <MaterialIcon name='edit' className='text-[20px]' />
          {t('profile.edit')}
        </button>
      </div>

      <hr className='my-6 border-border md:my-8' />

      <div className='grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2'>
        {PROFILE_FIELDS.map((field) => (
          <div key={field} className='space-y-1'>
            <p className='text-sm font-semibold text-muted-foreground'>{t(`profile.fields.${field}.label`)}</p>
            <p className='rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground md:py-3 md:text-base'>
              {t(`profile.fields.${field}.value`)}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
