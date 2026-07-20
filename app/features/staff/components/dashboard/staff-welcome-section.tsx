import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { useAuth } from '~/providers/auth-provider'
import { MaterialIcon } from '~/shared/ui'

export function StaffWelcomeSection() {
  const { t } = useTranslation('staff')
  const { user } = useAuth()
  const navigate = useNavigate()

  const isShipper = user?.role === 'STAFF' && user?.staffTask === 'SHIPPER'

  return (
    <section className='overflow-hidden rounded-2xl bg-primary text-primary-foreground shadow-lg'>
      <div className='relative p-5 md:p-6'>
        <div className='absolute right-6 top-4 hidden opacity-15 md:block'>
          <MaterialIcon name='pets' filled className='text-9xl' />
        </div>
        <div className='relative max-w-2xl'>
          <p className='mb-2 text-sm font-semibold uppercase tracking-wide text-primary-foreground/80'>
            {t('welcome.kicker')}
          </p>
          <h1 className='font-display text-2xl font-bold md:text-3xl'>
            {user?.fullName ? t('welcome.titleDynamic', 'Chào buổi sáng, {{name}}', { name: user.fullName }) : t('welcome.title')}
          </h1>
          <p className='mt-3 text-lg text-primary-foreground/85'>{t('welcome.subtitle')}</p>
          <div className='mt-6 flex flex-wrap gap-3'>
            <button className='inline-flex items-center gap-2 rounded-full bg-secondary px-5 py-3 font-display font-bold text-secondary-foreground shadow-md transition-transform active:scale-95'>
              <MaterialIcon name='fingerprint' />
              {t('welcome.checkIn')}
            </button>
            {isShipper && (
              <button
                type='button'
                onClick={() => navigate('/staff/orders?view=history')}
                className='inline-flex items-center gap-2 rounded-full bg-primary-foreground/15 hover:bg-primary-foreground/25 border border-primary-foreground/30 px-5 py-3 font-display font-bold text-primary-foreground shadow-md transition-transform active:scale-95'
              >
                <MaterialIcon name='history' />
                {t('welcome.deliveryHistory', 'Xem lịch sử giao')}
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
