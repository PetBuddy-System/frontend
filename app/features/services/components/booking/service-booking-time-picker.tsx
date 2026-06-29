import { useTranslation } from 'react-i18next'

import { cn } from '~/shared/lib/cn'

import { MaterialIcon } from '~/shared/ui'

const TIME_SLOTS = [
  { key: '09:00', disabled: false },
  { key: '10:00', disabled: false },
  { key: '11:00', disabled: true },
  { key: '13:30', disabled: false },
  { key: '15:00', disabled: false },
  { key: '16:30', disabled: false }
] as const

export type BookingTimeSlot = (typeof TIME_SLOTS)[number]['key']

export interface ServiceBookingTimePickerProps {
  selectedTime: string
  onSelectTime: (time: BookingTimeSlot) => void
}

export function ServiceBookingTimePicker({ selectedTime, onSelectTime }: ServiceBookingTimePickerProps) {
  const { t } = useTranslation('services')

  return (
    <section className='rounded-xl border border-border bg-card p-6 shadow-sm md:p-8'>
      <h2 className='mb-6 flex items-center gap-2 font-display text-2xl font-semibold text-primary'>
        <MaterialIcon name='calendar_month' className='text-secondary' />
        {t('bookingPage.time.title')}
      </h2>

      <div className='grid grid-cols-1 gap-8 md:grid-cols-2'>
        <div>
          <label className='mb-3 block text-sm font-semibold text-foreground'>{t('bookingPage.time.dateLabel')}</label>
          <input
            className='w-full rounded-lg border border-border bg-card px-4 py-3 text-foreground transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring'
            type='date'
          />
          <div className='mt-4 flex items-start gap-3 rounded-lg border border-secondary/20 bg-cream-variant p-3'>
            <MaterialIcon name='info' className='mt-0.5 text-secondary' />
            <p className='text-sm text-muted-foreground'>{t('bookingPage.time.note')}</p>
          </div>
        </div>

        <div>
          <label className='mb-3 block text-sm font-semibold text-foreground'>{t('bookingPage.time.slotLabel')}</label>
          <div className='grid grid-cols-3 gap-3'>
            {TIME_SLOTS.map((slot) => {
              const isSelected = selectedTime === slot.key

              return (
                <button
                  key={slot.key}
                  type='button'
                  disabled={slot.disabled}
                  onClick={() => onSelectTime(slot.key)}
                  className={cn(
                    'rounded-lg border py-2 text-center text-sm font-semibold transition-colors',
                    slot.disabled
                      ? 'cursor-not-allowed border-border bg-muted text-muted-foreground opacity-50'
                      : isSelected
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border text-foreground hover:border-primary'
                  )}
                >
                  {slot.disabled ? t('bookingPage.time.fullSlot', { time: slot.key }) : slot.key}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
