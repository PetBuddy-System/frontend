import { useTranslation } from 'react-i18next'

import type { BookingServiceKey } from './service-booking-service-picker'
import { MaterialIcon } from '~/shared/ui'

export interface ServiceBookingSummaryProps {
  selectedService: BookingServiceKey
  selectedTime: string
}

export function ServiceBookingSummary({ selectedService, selectedTime }: ServiceBookingSummaryProps) {
  const { t } = useTranslation('services')

  return (
    <aside className='relative lg:col-span-4'>
      <div className='sticky top-24 overflow-hidden rounded-xl border border-border bg-card shadow-lg'>
        <div className='bg-primary p-6 text-primary-foreground'>
          <h3 className='font-display text-2xl font-semibold'>{t('bookingPage.summary.title')}</h3>
        </div>

        <div className='space-y-6 p-6'>
          <div className='space-y-4 border-b border-border pb-6'>
            <div>
              <span className='mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
                {t('bookingPage.summary.serviceLabel')}
              </span>
              <div className='flex items-start justify-between gap-3'>
                <span className='text-sm font-semibold text-foreground'>
                  {t(`bookingPage.service.items.${selectedService}.title`)}
                </span>
                <span className='text-sm font-semibold text-foreground'>
                  {t(`bookingPage.service.items.${selectedService}.price`)}
                </span>
              </div>
            </div>
            <div>
              <span className='mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
                {t('bookingPage.summary.timeLabel')}
              </span>
              <div className='flex items-center gap-2 text-foreground'>
                <MaterialIcon name='event' className='text-[20px] text-primary' />
                <span>{t('bookingPage.summary.today', { time: selectedTime })}</span>
              </div>
            </div>
            <div>
              <span className='mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
                {t('bookingPage.summary.petLabel')}
              </span>
              <div className='flex items-center gap-2 text-foreground'>
                <MaterialIcon name='sound_detection_dog_barking' className='text-[20px] text-primary' />
                <span>{t('bookingPage.pet.countOptions.one')}</span>
              </div>
            </div>
          </div>

          <div className='flex items-center justify-between'>
            <span className='text-lg text-muted-foreground'>{t('bookingPage.summary.totalLabel')}</span>
            <span className='font-display text-3xl font-bold text-primary'>
              {t(`bookingPage.service.items.${selectedService}.price`)}
            </span>
          </div>

          <button
            type='button'
            className='flex w-full items-center justify-center gap-2 rounded-full bg-secondary px-6 py-4 text-sm font-semibold text-secondary-foreground shadow-sm transition-colors hover:opacity-90'
          >
            <MaterialIcon name='check_circle' />
            {t('bookingPage.actions.confirm')}
          </button>

          <p className='mt-4 text-center text-xs text-muted-foreground'>
            {t('bookingPage.summary.termsPrefix')}{' '}
            <a className='text-primary underline' href='#'>
              {t('bookingPage.summary.termsLink')}
            </a>{' '}
            {t('bookingPage.summary.termsSuffix')}
          </p>
        </div>
      </div>
    </aside>
  )
}
