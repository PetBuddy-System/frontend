import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { SiteBottomNav } from '~/shared/components'
import { SiteFooter } from '~/shared/components'
import { SiteHeader } from '~/shared/components'

import {
  type BookingServiceKey,
  ServiceBookingServicePicker
} from '../components/booking/service-booking-service-picker'
import { ServiceBookingPetForm } from '../components/booking/service-booking-pet-form'
import { type BookingTimeSlot, ServiceBookingTimePicker } from '../components/booking/service-booking-time-picker'
import { ServiceBookingSummary } from '../components/booking/service-booking-summary'

export function ServiceBookingPage() {
  const { t } = useTranslation('services')
  const [selectedService, setSelectedService] = useState<BookingServiceKey>('bath')
  const [selectedTime, setSelectedTime] = useState<BookingTimeSlot>('10:00')

  return (
    <div className='flex min-h-screen flex-col bg-background text-foreground'>
      <SiteHeader />

      <main className='mx-auto mb-20 w-full max-w-6xl flex-grow px-4 py-8 md:mb-0 md:px-6 md:py-16'>
        <header className='mb-10'>
          <h1 className='mb-2 font-display text-3xl font-bold text-primary md:text-5xl'>{t('bookingPage.title')}</h1>
          <p className='text-base text-muted-foreground md:text-lg'>{t('bookingPage.subtitle')}</p>
        </header>

        <div className='relative grid grid-cols-1 gap-8 lg:grid-cols-12'>
          <div className='space-y-12 lg:col-span-8'>
            <ServiceBookingServicePicker selectedService={selectedService} onSelectService={setSelectedService} />
            <ServiceBookingTimePicker selectedTime={selectedTime} onSelectTime={setSelectedTime} />
            <ServiceBookingPetForm />
          </div>

          <ServiceBookingSummary selectedService={selectedService} selectedTime={selectedTime} />
        </div>
      </main>

      <SiteFooter />
      <SiteBottomNav />
    </div>
  )
}
