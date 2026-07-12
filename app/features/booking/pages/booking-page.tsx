import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import {
  CardCvcElement,
  CardExpiryElement,
  CardNumberElement,
  Elements,
  useElements,
  useStripe
} from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'

import { SiteBottomNav, SiteFooter, SiteHeader } from '~/shared/components'
import { env } from '~/shared/config/env'
import { cn } from '~/shared/lib/cn'
import { Button, MaterialIcon } from '~/shared/ui'

import {
  createBooking,
  getAvailableCatalogTimeSlots,
  getCatalogs,
  getMyBookings,
  getPets,
  retryBookingPayment,
  type BookingCreationRequest,
  type BookingResponse,
  type CatalogResponse,
  type PaymentResponse,
  type PetProfileResponse,
  type TimeSlotResponse
} from '../services'

type BookingStep = 1 | 2 | 3 | 4
type BookingType = 'AT_STORE' | 'AT_HOME'
type CheckoutPhase = 'summary' | 'payment' | 'success' | 'failed'
type ToastState = { type: 'success' | 'error'; message: string } | null

const MAX_PETS_PER_SLOT = 5
const DEPOSIT_RATE = 0.2
const STEPS: BookingStep[] = [1, 2, 3, 4]
const BOOKING_TYPES: BookingType[] = ['AT_STORE', 'AT_HOME']
const stripePromise = loadStripe(env.STRIPE_PK)

const stripeElementStyle = {
  base: {
    fontSize: '15px',
    color: '#191c1d',
    '::placeholder': { color: '#aab7c4' },
    fontFamily: 'inherit'
  },
  invalid: { color: '#ba1a1a' }
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0
  }).format(value)
}

function getTodayInputValue(): string {
  const today = new Date()
  const offsetDate = new Date(today.getTime() - today.getTimezoneOffset() * 60_000)
  return offsetDate.toISOString().slice(0, 10)
}

function formatSlotTime(value: string): string {
  return value.slice(0, 5)
}

function isCatalogBookable(catalog: CatalogResponse): boolean {
  return !catalog.status || catalog.status === 'AVAILABLE'
}

function getFirstPaymentWithClientSecret(booking: BookingResponse): PaymentResponse | null {
  if (booking.payments && Array.isArray(booking.payments)) {
    return booking.payments.find((payment) => Boolean(payment.stripeClientSecret)) ?? null
  }
  
  if ((booking as any).stripeClientSecret) {
    return {
      paymentId: 0,
      amount: booking.depositAmount,
      paymentMethod: 'STRIPE',
      status: 'PENDING',
      stripeClientSecret: (booking as any).stripeClientSecret
    }
  }
  
  return null
}

export function BookingPage() {
  const { t } = useTranslation('services')
  const [currentStep, setCurrentStep] = useState<BookingStep>(1)
  const [bookingType, setBookingType] = useState<BookingType>('AT_STORE')
  const [catalogs, setCatalogs] = useState<CatalogResponse[]>([])
  const [pets, setPets] = useState<PetProfileResponse[]>([])
  const [timeSlots, setTimeSlots] = useState<TimeSlotResponse[]>([])
  const [myBookings, setMyBookings] = useState<BookingResponse[]>([])
  const [selectedCatalogId, setSelectedCatalogId] = useState<number | null>(null)
  const [selectedPetIds, setSelectedPetIds] = useState<string[]>([])
  const [scheduledAt, setScheduledAt] = useState(getTodayInputValue)
  const [selectedTimeSlotId, setSelectedTimeSlotId] = useState<number | null>(null)
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [address, setAddress] = useState('')
  const [note, setNote] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isTimeSlotsLoading, setIsTimeSlotsLoading] = useState(false)
  const [isCreatingBooking, setIsCreatingBooking] = useState(false)
  const [isRetryingPayment, setIsRetryingPayment] = useState(false)
  const [toast, setToast] = useState<ToastState>(null)
  const [checkoutPhase, setCheckoutPhase] = useState<CheckoutPhase>('summary')
  const [activeBooking, setActiveBooking] = useState<BookingResponse | null>(null)
  const [activePayment, setActivePayment] = useState<PaymentResponse | null>(null)
  const [paymentError, setPaymentError] = useState('')
  const [paymentAttemptKey, setPaymentAttemptKey] = useState(0)

  const selectedCatalog = useMemo(
    () => catalogs.find((catalog) => catalog.catalogId === selectedCatalogId) ?? null,
    [catalogs, selectedCatalogId]
  )
  const selectedPets = useMemo(() => pets.filter((pet) => selectedPetIds.includes(pet.petId)), [pets, selectedPetIds])
  const availableTimeSlots = useMemo(
    () =>
      timeSlots
        .filter((slot) => slot.catalogId === selectedCatalogId)
        .filter((slot) => slot.isActive)
        .sort((first, second) => first.startTime.localeCompare(second.startTime)),
    [selectedCatalogId, timeSlots]
  )
  const selectedTimeSlot = useMemo(
    () => availableTimeSlots.find((slot) => slot.timeSlotId === selectedTimeSlotId) ?? null,
    [availableTimeSlots, selectedTimeSlotId]
  )
  const subtotal = Number(selectedCatalog?.price ?? 0) * selectedPetIds.length
  const deposit = subtotal * DEPOSIT_RATE
  const remaining = subtotal - deposit
  const slotFillPercent = Math.min((selectedPetIds.length / MAX_PETS_PER_SLOT) * 100, 100)

  useEffect(() => {
    let isMounted = true

    async function loadBookingData() {
      try {
        setIsLoading(true)
        const [catalogResults, petResults, bookingResults] = await Promise.all([
          getCatalogs(),
          getPets(),
          getMyBookings()
        ])

        if (!isMounted) {
          return
        }

        const bookableCatalogs = catalogResults.filter(isCatalogBookable)
        setCatalogs(bookableCatalogs)
        setPets(petResults)
        setMyBookings(bookingResults)
        setSelectedCatalogId(bookableCatalogs[0]?.catalogId ?? null)
      } catch (error) {
        if (isMounted) {
          setToast({
            type: 'error',
            message: error instanceof Error ? error.message : t('bookingFlow.toast.loadError')
          })
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadBookingData()

    return () => {
      isMounted = false
    }
  }, [t])

  useEffect(() => {
    let isMounted = true

    async function loadAvailableTimeSlots() {
      if (!selectedCatalogId || !scheduledAt) {
        setTimeSlots([])
        setSelectedTimeSlotId(null)
        return
      }

      try {
        setIsTimeSlotsLoading(true)
        setSelectedTimeSlotId(null)
        const availableSlots = await getAvailableCatalogTimeSlots(selectedCatalogId, scheduledAt)

        if (isMounted) {
          setTimeSlots(availableSlots)
        }
      } catch (error) {
        if (isMounted) {
          setTimeSlots([])
          setToast({
            type: 'error',
            message: error instanceof Error ? error.message : t('bookingFlow.toast.timeSlotLoadError')
          })
        }
      } finally {
        if (isMounted) {
          setIsTimeSlotsLoading(false)
        }
      }
    }

    void loadAvailableTimeSlots()

    return () => {
      isMounted = false
    }
  }, [scheduledAt, selectedCatalogId, t])

  useEffect(() => {
    if (!toast) {
      return
    }

    const timerId = window.setTimeout(() => setToast(null), 3800)
    return () => window.clearTimeout(timerId)
  }, [toast])

  function showStepError(message: string) {
    setToast({ type: 'error', message })
  }

  function validateStep(step: BookingStep): boolean {
    if (step === 1) {
      if (!customerName.trim() || !customerPhone.trim()) {
        showStepError(t('bookingFlow.toast.customerMissing'))
        return false
      }

      if (bookingType === 'AT_HOME' && !address.trim()) {
        showStepError(t('bookingFlow.toast.addressMissing'))
        return false
      }
    }

    if (step === 2 && !selectedCatalog) {
      showStepError(t('bookingFlow.toast.selectService'))
      return false
    }

    if (step === 1 && selectedPetIds.length === 0) {
      showStepError(t('bookingFlow.toast.selectPet'))
      return false
    }

    if (step === 3 && (!scheduledAt || !selectedTimeSlot)) {
      showStepError(t('bookingFlow.toast.selectTime'))
      return false
    }

    return true
  }

  function validateAllSteps(): boolean {
    return validateStep(1) && validateStep(2) && validateStep(3)
  }

  function resetCheckoutState() {
    setCheckoutPhase('summary')
    setActiveBooking(null)
    setActivePayment(null)
    setPaymentError('')
  }

  function handleNextStep() {
    if (!validateStep(currentStep)) {
      return
    }

    setCurrentStep((step) => Math.min(step + 1, 4) as BookingStep)
  }

  function handlePreviousStep() {
    setCurrentStep((step) => Math.max(step - 1, 1) as BookingStep)
  }

  function handleCatalogChange(catalogId: number) {
    setSelectedCatalogId(catalogId)
    setSelectedTimeSlotId(null)
    resetCheckoutState()
  }

  function handlePetToggle(petId: string) {
    resetCheckoutState()
    setSelectedPetIds((currentIds) => {
      if (currentIds.includes(petId)) {
        return currentIds.filter((id) => id !== petId)
      }

      if (currentIds.length >= MAX_PETS_PER_SLOT) {
        setToast({ type: 'error', message: t('bookingFlow.toast.slotLimit') })
        return currentIds
      }

      return [...currentIds, petId]
    })
  }

  function handleDateChange(event: ChangeEvent<HTMLInputElement>) {
    setScheduledAt(event.target.value)
    setSelectedTimeSlotId(null)
    resetCheckoutState()
  }

  function buildBookingPayload(): BookingCreationRequest | null {
    if (!validateAllSteps() || !selectedCatalog || !selectedTimeSlot) {
      return null
    }

    return {
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      address: bookingType === 'AT_HOME' ? address.trim() : undefined,
      note: note.trim() || undefined,
      bookingType,
      scheduledAt,
      bookingDetails: selectedPetIds.map((petId) => ({
        petId,
        catalogId: selectedCatalog.catalogId,
        timeSlotId: selectedTimeSlot.timeSlotId,
        note: note.trim() || undefined
      }))
    }
  }

  async function refreshMyBookingsAfterPayment() {
    try {
      setMyBookings(await getMyBookings())
    } catch {
      /* Payment result is already known; failing to refresh recent bookings should not block the screen. */
    }
  }

  async function handleCheckout() {
    const payload = buildBookingPayload()
    if (!payload) {
      return
    }

    try {
      setIsCreatingBooking(true)
      setPaymentError('')
      const booking = await createBooking(payload)
      const payment = getFirstPaymentWithClientSecret(booking)

      if (!payment) {
        throw new Error(t('bookingFlow.toast.paymentSecretMissing'))
      }

      setActiveBooking(booking)
      setActivePayment(payment)
      setCheckoutPhase('payment')
      setPaymentAttemptKey((key) => key + 1)
      setToast({ type: 'success', message: t('bookingFlow.toast.success') })
    } catch (error) {
      setToast({
        type: 'error',
        message: error instanceof Error ? error.message : t('bookingFlow.toast.submitError')
      })
    } finally {
      setIsCreatingBooking(false)
    }
  }

  async function handlePaymentSuccess() {
    setCheckoutPhase('success')
    setToast({ type: 'success', message: t('bookingFlow.toast.paymentSuccess') })
    await refreshMyBookingsAfterPayment()
  }

  function handlePaymentFailure(message: string) {
    setPaymentError(message)
    setCheckoutPhase('failed')
    setToast({ type: 'error', message })
  }

  async function handleRetryPayment() {
    if (!activeBooking) {
      return
    }

    try {
      setIsRetryingPayment(true)
      setPaymentError('')
      const booking = await retryBookingPayment(activeBooking.bookingId)
      const payment = getFirstPaymentWithClientSecret(booking)

      if (!payment) {
        throw new Error(t('bookingFlow.toast.paymentSecretMissing'))
      }

      setActiveBooking(booking)
      setActivePayment(payment)
      setCheckoutPhase('payment')
      setPaymentAttemptKey((key) => key + 1)
    } catch (error) {
      const message = error instanceof Error ? error.message : t('bookingFlow.toast.retryPaymentFailed')
      setPaymentError(message)
      setToast({ type: 'error', message })
    } finally {
      setIsRetryingPayment(false)
    }
  }

  return (
    <div className='flex min-h-screen flex-col bg-background text-foreground'>
      <SiteHeader />

      <main className='mx-auto mb-20 w-full max-w-6xl flex-grow px-4 py-8 md:mb-0 md:px-6 md:py-12'>
        <header className='mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between'>
          <div>
            <p className='mb-2 text-sm font-semibold uppercase tracking-normal text-primary'>
              {t('bookingFlow.eyebrow')}
            </p>
            <h1 className='font-display text-3xl font-bold text-foreground md:text-5xl'>{t('bookingFlow.title')}</h1>
            <p className='mt-3 max-w-2xl text-base text-muted-foreground'>{t('bookingFlow.subtitle')}</p>
          </div>
          <div className='rounded-md border border-border bg-card px-4 py-3 text-sm text-card-foreground shadow-sm'>
            <span className='block font-semibold'>{t('bookingFlow.capacity.title')}</span>
            <span className='text-muted-foreground'>
              {t('bookingFlow.capacity.value', { selected: selectedPetIds.length, max: MAX_PETS_PER_SLOT })}
            </span>
          </div>
        </header>

        <div className='grid gap-6 lg:grid-cols-[1fr_360px]'>
          <section className='space-y-6'>
            <ol className='grid grid-cols-2 gap-3 md:grid-cols-4'>
              {STEPS.map((step) => (
                <li
                  key={step}
                  className={cn(
                    'rounded-md border p-3 transition-colors',
                    currentStep === step
                      ? 'border-primary bg-accent text-accent-foreground'
                      : 'border-border bg-card text-card-foreground'
                  )}
                >
                  <span className='text-xs font-semibold uppercase tracking-normal'>
                    {t('bookingFlow.steps.step', { step })}
                  </span>
                  <p className='mt-1 text-sm font-semibold'>{t(`bookingFlow.steps.items.${step}`)}</p>
                </li>
              ))}
            </ol>

            <div className='rounded-md border border-border bg-card p-5 shadow-sm md:p-6'>
              {isLoading ? (
                <div className='space-y-4 animate-pulse'>
                  <div className='h-8 w-48 rounded bg-muted' />
                  <div className='grid gap-4 md:grid-cols-2'>
                    <div className='h-36 rounded bg-muted' />
                    <div className='h-36 rounded bg-muted' />
                  </div>
                </div>
              ) : (
                <>
                  {currentStep === 1 && (
                    <CustomerInfoStep
                      bookingType={bookingType}
                      onBookingTypeChange={(value) => {
                        setBookingType(value)
                        resetCheckoutState()
                      }}
                      customerName={customerName}
                      onCustomerNameChange={setCustomerName}
                      customerPhone={customerPhone}
                      onCustomerPhoneChange={setCustomerPhone}
                      address={address}
                      onAddressChange={setAddress}
                      note={note}
                      onNoteChange={setNote}
                      pets={pets}
                      selectedPetIds={selectedPetIds}
                      onPetToggle={handlePetToggle}
                      slotFillPercent={slotFillPercent}
                    />
                  )}

                  {currentStep === 2 && (
                    <ServiceStep
                      catalogs={catalogs}
                      selectedCatalogId={selectedCatalogId}
                      onCatalogChange={handleCatalogChange}
                      formatCurrency={formatCurrency}
                    />
                  )}

                  {currentStep === 3 && (
                    <ScheduleStep
                      scheduledAt={scheduledAt}
                      onDateChange={handleDateChange}
                      availableTimeSlots={availableTimeSlots}
                      selectedTimeSlotId={selectedTimeSlotId}
                      onTimeSlotChange={(timeSlotId) => {
                        setSelectedTimeSlotId(timeSlotId)
                        resetCheckoutState()
                      }}
                      isTimeSlotsLoading={isTimeSlotsLoading}
                      selectedCatalog={selectedCatalog}
                      slotFillPercent={slotFillPercent}
                    />
                  )}

                  {currentStep === 4 && (
                    <ReviewPaymentStep
                      bookingType={bookingType}
                      customerName={customerName}
                      customerPhone={customerPhone}
                      address={address}
                      note={note}
                      selectedCatalog={selectedCatalog}
                      selectedPets={selectedPets}
                      scheduledAt={scheduledAt}
                      selectedTimeSlot={selectedTimeSlot}
                      subtotal={subtotal}
                      deposit={deposit}
                      remaining={remaining}
                      checkoutPhase={checkoutPhase}
                      activeBooking={activeBooking}
                      activePayment={activePayment}
                      paymentError={paymentError}
                      paymentAttemptKey={paymentAttemptKey}
                      isCreatingBooking={isCreatingBooking}
                      isRetryingPayment={isRetryingPayment}
                      onCheckout={handleCheckout}
                      onPaymentSuccess={handlePaymentSuccess}
                      onPaymentFailure={handlePaymentFailure}
                      onRetryPayment={handleRetryPayment}
                    />
                  )}
                </>
              )}
            </div>

            <div className='flex flex-col-reverse gap-3 sm:flex-row sm:justify-between'>
              <Button type='button' variant='outline' onClick={handlePreviousStep} disabled={currentStep === 1}>
                <MaterialIcon name='chevron_left' className='text-[20px]' />
                {t('bookingFlow.actions.back')}
              </Button>
              {currentStep < 4 && (
                <Button type='button' onClick={handleNextStep} disabled={isLoading}>
                  {t('bookingFlow.actions.next')}
                  <MaterialIcon name='chevron_right' className='text-[20px]' />
                </Button>
              )}
            </div>
          </section>

          {(currentStep !== 4 || checkoutPhase === 'summary') && (
            <BookingSidebar
              selectedCatalog={selectedCatalog}
              selectedPets={selectedPets}
              selectedTimeSlot={selectedTimeSlot}
              scheduledAt={scheduledAt}
              subtotal={subtotal}
              deposit={deposit}
              remaining={remaining}
              myBookings={myBookings}
            />
          )}
        </div>
      </main>

      {toast && (
        <div
          role='alert'
          className={cn(
            'fixed right-4 top-4 z-50 flex max-w-sm items-start gap-3 rounded-md border px-4 py-3 shadow-lg',
            toast.type === 'success'
              ? 'border-success bg-success text-success-foreground'
              : 'border-destructive bg-destructive text-destructive-foreground'
          )}
        >
          <MaterialIcon name={toast.type === 'success' ? 'check_circle' : 'error'} className='text-[22px]' />
          <p className='text-sm font-medium'>{toast.message}</p>
        </div>
      )}

      <SiteFooter />
      <SiteBottomNav />
    </div>
  )
}

interface CustomerInfoStepProps {
  bookingType: BookingType
  onBookingTypeChange: (value: BookingType) => void
  customerName: string
  onCustomerNameChange: (value: string) => void
  customerPhone: string
  onCustomerPhoneChange: (value: string) => void
  address: string
  onAddressChange: (value: string) => void
  note: string
  onNoteChange: (value: string) => void
  pets: PetProfileResponse[]
  selectedPetIds: string[]
  onPetToggle: (petId: string) => void
  slotFillPercent: number
}

function CustomerInfoStep({
  bookingType,
  onBookingTypeChange,
  customerName,
  onCustomerNameChange,
  customerPhone,
  onCustomerPhoneChange,
  address,
  onAddressChange,
  note,
  onNoteChange,
  pets,
  selectedPetIds,
  onPetToggle,
  slotFillPercent
}: CustomerInfoStepProps) {
  const { t } = useTranslation('services')

  return (
    <div>
      <h2 className='text-xl font-bold'>{t('bookingFlow.customer.title')}</h2>
      <p className='mt-1 text-sm text-muted-foreground'>{t('bookingFlow.customer.subtitle')}</p>

      <div className='mt-5 grid grid-cols-2 gap-2 rounded-md bg-muted p-1'>
        {BOOKING_TYPES.map((type) => (
          <button
            key={type}
            type='button'
            onClick={() => onBookingTypeChange(type)}
            className={cn(
              'flex items-center justify-center gap-2 rounded-sm px-3 py-2 text-sm font-semibold transition-colors',
              bookingType === type ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <MaterialIcon name={type === 'AT_STORE' ? 'storefront' : 'home_pin'} className='text-[18px]' />
            {t(`bookingFlow.bookingTypes.${type}`)}
          </button>
        ))}
      </div>

      <div className='mt-5 grid gap-4 md:grid-cols-2'>
        <Field label={t('bookingFlow.customer.name')} value={customerName} onChange={onCustomerNameChange} required />
        <Field
          label={t('bookingFlow.customer.phone')}
          value={customerPhone}
          onChange={onCustomerPhoneChange}
          required
        />
        {bookingType === 'AT_HOME' && (
          <Field label={t('bookingFlow.customer.address')} value={address} onChange={onAddressChange} required />
        )}
        <label className='md:col-span-2'>
          <span className='text-sm font-medium'>{t('bookingFlow.customer.note')}</span>
          <textarea
            value={note}
            onChange={(event) => onNoteChange(event.target.value)}
            rows={4}
            className='mt-2 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring'
          />
        </label>
      </div>

      <PetSelectionPanel
        pets={pets}
        selectedPetIds={selectedPetIds}
        onPetToggle={onPetToggle}
        slotFillPercent={slotFillPercent}
      />
    </div>
  )
}

interface ServiceStepProps {
  catalogs: CatalogResponse[]
  selectedCatalogId: number | null
  onCatalogChange: (catalogId: number) => void
  formatCurrency: (value: number) => string
}

function ServiceStep({ catalogs, selectedCatalogId, onCatalogChange, formatCurrency }: ServiceStepProps) {
  const { t } = useTranslation('services')

  return (
    <div>
      <h2 className='text-xl font-bold'>{t('bookingFlow.service.title')}</h2>
      <p className='mt-1 text-sm text-muted-foreground'>{t('bookingFlow.service.subtitle')}</p>
      <div className='mt-5 grid gap-4 md:grid-cols-2'>
        {catalogs.map((catalog) => (
          <button
            key={catalog.catalogId}
            type='button'
            onClick={() => onCatalogChange(catalog.catalogId)}
            className={cn(
              'rounded-md border p-4 text-left transition-colors focus:outline-none focus:ring-2 focus:ring-ring',
              selectedCatalogId === catalog.catalogId
                ? 'border-primary bg-accent text-accent-foreground'
                : 'border-border bg-background hover:bg-muted'
            )}
          >
            <div className='flex items-start justify-between gap-3'>
              <div>
                <h3 className='font-semibold'>{catalog.catalogName}</h3>
                <p className='mt-2 line-clamp-3 text-sm text-muted-foreground'>{catalog.description}</p>
              </div>
              <MaterialIcon
                name={selectedCatalogId === catalog.catalogId ? 'check_circle' : 'spa'}
                className='text-[24px] text-primary'
              />
            </div>
            <div className='mt-4 flex flex-wrap items-center gap-2 text-sm'>
              <span className='rounded-sm bg-muted px-2 py-1 text-muted-foreground'>
                {t('bookingFlow.service.duration', { minutes: catalog.durationMinute ?? 0 })}
              </span>
              <span className='font-semibold text-primary'>{formatCurrency(Number(catalog.price ?? 0))}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

interface PetSelectionPanelProps {
  pets: PetProfileResponse[]
  selectedPetIds: string[]
  onPetToggle: (petId: string) => void
  slotFillPercent: number
}

function PetSelectionPanel({ pets, selectedPetIds, onPetToggle, slotFillPercent }: PetSelectionPanelProps) {
  const { t } = useTranslation('services')

  return (
    <div className='mt-6 border-t border-border pt-5'>
      <h3 className='text-sm font-semibold'>{t('bookingFlow.pet.title')}</h3>
      <p className='mt-1 text-sm text-muted-foreground'>{t('bookingFlow.pet.subtitle')}</p>
      <div className='mt-3 grid gap-3 md:grid-cols-2'>
        {pets.map((pet) => {
          const isSelected = selectedPetIds.includes(pet.petId)
          const isDisabled = !isSelected && selectedPetIds.length >= MAX_PETS_PER_SLOT

          return (
            <label
              key={pet.petId}
              className={cn(
                'flex cursor-pointer items-center gap-3 rounded-md border p-4 transition-colors',
                isSelected
                  ? 'border-primary bg-accent text-accent-foreground'
                  : 'border-border bg-background hover:bg-muted',
                isDisabled && 'cursor-not-allowed opacity-60'
              )}
            >
              <input
                type='checkbox'
                className='h-4 w-4 accent-current'
                checked={isSelected}
                disabled={isDisabled}
                onChange={() => onPetToggle(pet.petId)}
              />
              <span className='flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-muted text-primary'>
                <MaterialIcon
                  name={pet.species === 'CAT' ? 'pets' : 'sound_detection_dog_barking'}
                  className='text-[24px]'
                />
              </span>
              <span>
                <span className='block font-semibold'>{pet.petName}</span>
                <span className='text-sm text-muted-foreground'>
                  {t('bookingFlow.pet.profile', { breed: pet.breed, weight: pet.weight })}
                </span>
              </span>
            </label>
          )
        })}
      </div>
      {pets.length === 0 && (
        <p className='mt-3 rounded-md border border-border bg-muted p-4 text-sm text-muted-foreground'>
          {t('bookingFlow.pet.empty')}
        </p>
      )}
      <div className='mt-4 rounded-md border border-border bg-background p-4'>
        <div className='mb-2 flex items-center justify-between text-sm'>
          <span className='font-medium'>{t('bookingFlow.capacity.progress')}</span>
          <span className='text-muted-foreground'>
            {selectedPetIds.length}/{MAX_PETS_PER_SLOT}
          </span>
        </div>
        <div className='h-2 overflow-hidden rounded-full bg-muted'>
          <div className='h-full rounded-full bg-primary transition-all' style={{ width: `${slotFillPercent}%` }} />
        </div>
      </div>
    </div>
  )
}

interface ScheduleStepProps {
  scheduledAt: string
  onDateChange: (event: ChangeEvent<HTMLInputElement>) => void
  availableTimeSlots: TimeSlotResponse[]
  selectedTimeSlotId: number | null
  onTimeSlotChange: (timeSlotId: number) => void
  isTimeSlotsLoading: boolean
  selectedCatalog: CatalogResponse | null
  slotFillPercent: number
}

function ScheduleStep({
  scheduledAt,
  onDateChange,
  availableTimeSlots,
  selectedTimeSlotId,
  onTimeSlotChange,
  isTimeSlotsLoading,
  selectedCatalog
}: ScheduleStepProps) {
  const { t } = useTranslation('services')

  return (
    <div>
      <h2 className='text-xl font-bold'>{t('bookingFlow.schedule.title')}</h2>
      <p className='mt-1 text-sm text-muted-foreground'>{t('bookingFlow.schedule.subtitle')}</p>

      <div className='mt-5 grid gap-5'>
        <div>
          <label className='block text-sm font-medium' htmlFor='booking-date'>
            {t('bookingFlow.time.dateLabel')}
          </label>
          <input
            id='booking-date'
            type='date'
            min={getTodayInputValue()}
            value={scheduledAt}
            onChange={onDateChange}
            className='mt-2 h-11 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring md:max-w-xs'
          />
          <div className='mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
            {isTimeSlotsLoading
              ? Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className='h-24 animate-pulse rounded-md bg-muted' />
                ))
              : availableTimeSlots.map((slot) => (
                  <button
                    key={slot.timeSlotId}
                    type='button'
                    onClick={() => onTimeSlotChange(slot.timeSlotId)}
                    className={cn(
                      'rounded-md border p-4 text-left transition-colors focus:outline-none focus:ring-2 focus:ring-ring',
                      selectedTimeSlotId === slot.timeSlotId
                        ? 'border-primary bg-accent text-accent-foreground'
                        : 'border-border bg-background hover:bg-muted'
                    )}
                  >
                    <span className='flex items-center gap-2 font-semibold'>
                      <MaterialIcon name='schedule' className='text-[20px] text-primary' />
                      {formatSlotTime(slot.startTime)}
                    </span>
                    <span className='mt-2 block text-sm text-muted-foreground'>
                      {t('bookingFlow.time.duration', {
                        minutes: slot.durationMinute ?? selectedCatalog?.durationMinute ?? 0
                      })}
                    </span>
                  </button>
                ))}
          </div>
          {!isTimeSlotsLoading && availableTimeSlots.length === 0 && (
            <p className='mt-5 rounded-md border border-border bg-muted p-4 text-sm text-muted-foreground'>
              {t('bookingFlow.time.empty')}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

interface ReviewPaymentStepProps {
  bookingType: BookingType
  customerName: string
  customerPhone: string
  address: string
  note: string
  selectedCatalog: CatalogResponse | null
  selectedPets: PetProfileResponse[]
  scheduledAt: string
  selectedTimeSlot: TimeSlotResponse | null
  subtotal: number
  deposit: number
  remaining: number
  checkoutPhase: CheckoutPhase
  activeBooking: BookingResponse | null
  activePayment: PaymentResponse | null
  paymentError: string
  paymentAttemptKey: number
  isCreatingBooking: boolean
  isRetryingPayment: boolean
  onCheckout: () => Promise<void>
  onPaymentSuccess: () => Promise<void>
  onPaymentFailure: (message: string) => void
  onRetryPayment: () => Promise<void>
}

function ReviewPaymentStep({
  bookingType,
  customerName,
  customerPhone,
  address,
  note,
  selectedCatalog,
  selectedPets,
  scheduledAt,
  selectedTimeSlot,
  subtotal,
  deposit,
  remaining,
  checkoutPhase,
  activeBooking,
  activePayment,
  paymentError,
  paymentAttemptKey,
  isCreatingBooking,
  isRetryingPayment,
  onCheckout,
  onPaymentSuccess,
  onPaymentFailure,
  onRetryPayment
}: ReviewPaymentStepProps) {
  const { t } = useTranslation('services')

  if (checkoutPhase === 'payment' && activeBooking && activePayment) {
    return (
      <PaymentCardScreen
        key={`${activeBooking.bookingId}-${paymentAttemptKey}`}
        booking={activeBooking}
        payment={activePayment}
        amount={deposit}
        onPaymentSuccess={onPaymentSuccess}
        onPaymentFailure={onPaymentFailure}
      />
    )
  }

  if (checkoutPhase === 'success' && activeBooking) {
    return <PaymentResultScreen type='success' booking={activeBooking} />
  }

  if (checkoutPhase === 'failed' && activeBooking) {
    return (
      <PaymentResultScreen
        type='failed'
        booking={activeBooking}
        message={paymentError}
        isRetrying={isRetryingPayment}
        onRetryPayment={onRetryPayment}
      />
    )
  }

  return (
    <div>
      <h2 className='text-xl font-bold'>{t('bookingFlow.review.title')}</h2>
      <p className='mt-1 text-sm text-muted-foreground'>{t('bookingFlow.review.subtitle')}</p>

      <div className='mt-5 grid gap-4 md:grid-cols-2'>
        <ReviewCard title={t('bookingFlow.review.customerSection')}>
          <SummaryLine
            label={t('bookingFlow.summary.bookingType')}
            value={t(`bookingFlow.bookingTypes.${bookingType}`)}
          />
          <SummaryLine label={t('bookingFlow.customer.name')} value={customerName || t('bookingFlow.summary.empty')} />
          <SummaryLine
            label={t('bookingFlow.customer.phone')}
            value={customerPhone || t('bookingFlow.summary.empty')}
          />
          {bookingType === 'AT_HOME' && (
            <SummaryLine label={t('bookingFlow.customer.address')} value={address || t('bookingFlow.summary.empty')} />
          )}
          {note && <SummaryLine label={t('bookingFlow.customer.note')} value={note} />}
        </ReviewCard>

        <ReviewCard title={t('bookingFlow.review.serviceSection')}>
          <SummaryLine
            label={t('bookingFlow.summary.service')}
            value={selectedCatalog?.catalogName ?? t('bookingFlow.summary.empty')}
          />
          <SummaryLine
            label={t('bookingFlow.summary.pets')}
            value={selectedPets.map((pet) => pet.petName).join(', ') || t('bookingFlow.summary.empty')}
          />
          <SummaryLine
            label={t('bookingFlow.summary.schedule')}
            value={
              selectedTimeSlot
                ? `${scheduledAt} - ${formatSlotTime(selectedTimeSlot.startTime)}`
                : t('bookingFlow.summary.empty')
            }
          />
        </ReviewCard>
      </div>

      <div className='mt-5 rounded-md border border-border bg-background p-4'>
        <SummaryRow label={t('bookingFlow.summary.subtotal')} value={formatCurrency(subtotal)} />
        <SummaryRow label={t('bookingFlow.summary.deposit')} value={formatCurrency(deposit)} strong />
        <SummaryRow label={t('bookingFlow.summary.remaining')} value={formatCurrency(remaining)} />
      </div>

      <Button type='button' className='mt-5 w-full' onClick={onCheckout} disabled={isCreatingBooking || deposit <= 0}>
        <MaterialIcon
          name={isCreatingBooking ? 'progress_activity' : 'lock'}
          className={cn('text-[20px]', isCreatingBooking && 'animate-spin')}
        />
        {isCreatingBooking ? t('bookingFlow.actions.submitting') : t('bookingFlow.actions.checkout')}
      </Button>
    </div>
  )
}

interface PaymentCardScreenProps {
  booking: BookingResponse
  payment: PaymentResponse
  amount: number
  onPaymentSuccess: () => Promise<void>
  onPaymentFailure: (message: string) => void
}

function PaymentCardScreen({ booking, payment, amount, onPaymentSuccess, onPaymentFailure }: PaymentCardScreenProps) {
  const { t } = useTranslation('services')

  return (
    <div>
      <div className='rounded-md border border-border bg-background p-5'>
        <p className='text-sm font-semibold text-primary'>{t('bookingFlow.payment.bookingReady')}</p>
        <h2 className='mt-2 text-2xl font-bold'>{t('bookingFlow.payment.title')}</h2>
        <p className='mt-2 text-sm text-muted-foreground'>
          {t('bookingFlow.review.created', { code: booking.bookingCode })}
        </p>
      </div>
      <div className='mt-5 rounded-md border border-border bg-background p-4'>
        <Elements stripe={stripePromise}>
          <BookingPaymentForm
            clientSecret={payment.stripeClientSecret}
            amount={amount}
            onPaymentSuccess={onPaymentSuccess}
            onPaymentFailure={onPaymentFailure}
          />
        </Elements>
      </div>
    </div>
  )
}

interface BookingPaymentFormProps {
  clientSecret: string
  amount: number
  onPaymentSuccess: () => Promise<void>
  onPaymentFailure: (message: string) => void
}

function BookingPaymentForm({ clientSecret, amount, onPaymentSuccess, onPaymentFailure }: BookingPaymentFormProps) {
  const { t } = useTranslation('services')
  const stripe = useStripe()
  const elements = useElements()
  const [cardholderName, setCardholderName] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!stripe || !elements) {
      return
    }

    const cardNumberElement = elements.getElement(CardNumberElement)
    if (!cardNumberElement) {
      setErrorMessage(t('bookingFlow.toast.cardElementMissing'))
      return
    }

    if (!cardholderName.trim()) {
      setErrorMessage(t('bookingFlow.toast.cardholderMissing'))
      return
    }

    try {
      setIsProcessing(true)
      setErrorMessage('')
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardNumberElement,
          billing_details: {
            name: cardholderName.trim()
          }
        }
      })

      if (error) {
        onPaymentFailure(error.message ?? t('bookingFlow.toast.paymentFailed'))
        return
      }

      if (paymentIntent?.status === 'succeeded') {
        await onPaymentSuccess()
        setCardholderName('')
        return
      }

      onPaymentFailure(t('bookingFlow.toast.paymentIncomplete'))
    } catch (error) {
      onPaymentFailure(error instanceof Error ? error.message : t('bookingFlow.toast.submitError'))
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <form className='space-y-4' onSubmit={handleSubmit}>
      <div>
        <label className='text-sm font-semibold' htmlFor='booking-cardholder'>
          {t('bookingFlow.payment.cardholder')}
        </label>
        <input
          id='booking-cardholder'
          value={cardholderName}
          onChange={(event) => setCardholderName(event.target.value.toUpperCase())}
          className='mt-2 h-11 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring'
          disabled={isProcessing}
        />
      </div>

      <div>
        <p className='text-sm font-semibold'>{t('bookingFlow.payment.cardInfo')}</p>
        <div className='mt-2 overflow-hidden rounded-md border border-border bg-card'>
          <div className='border-b border-border px-3 py-3'>
            <CardNumberElement
              options={{ style: stripeElementStyle, showIcon: true, placeholder: '1234 1234 1234 1234' }}
            />
          </div>
          <div className='grid grid-cols-2 divide-x divide-border'>
            <div className='px-3 py-3'>
              <CardExpiryElement options={{ style: stripeElementStyle, placeholder: 'MM / YY' }} />
            </div>
            <div className='px-3 py-3'>
              <CardCvcElement options={{ style: stripeElementStyle, placeholder: 'CVC' }} />
            </div>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className='flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive'>
          <MaterialIcon name='error' className='text-[18px]' />
          <span>{errorMessage}</span>
        </div>
      )}

      <Button type='submit' className='w-full' disabled={isProcessing || !stripe || amount <= 0}>
        <MaterialIcon
          name={isProcessing ? 'progress_activity' : 'lock'}
          className={cn('text-[20px]', isProcessing && 'animate-spin')}
        />
        {isProcessing
          ? t('bookingFlow.payment.processing')
          : t('bookingFlow.payment.payDeposit', { amount: formatCurrency(amount) })}
      </Button>
    </form>
  )
}

interface PaymentResultScreenProps {
  type: 'success' | 'failed'
  booking: BookingResponse
  message?: string
  isRetrying?: boolean
  onRetryPayment?: () => Promise<void>
}

function PaymentResultScreen({ type, booking, message, isRetrying, onRetryPayment }: PaymentResultScreenProps) {
  const { t } = useTranslation('services')
  const isSuccess = type === 'success'

  return (
    <div className='rounded-md border border-border bg-background p-6 text-center'>
      <div
        className={cn(
          'mx-auto flex h-16 w-16 items-center justify-center rounded-full',
          isSuccess ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
        )}
      >
        <MaterialIcon name={isSuccess ? 'verified' : 'error'} className='text-[34px]' />
      </div>
      <h2 className='mt-5 text-2xl font-bold'>
        {isSuccess ? t('bookingFlow.payment.successTitle') : t('bookingFlow.payment.failedTitle')}
      </h2>
      <p className='mx-auto mt-2 max-w-xl text-sm text-muted-foreground'>
        {isSuccess
          ? t('bookingFlow.payment.successDescription', { code: booking.bookingCode })
          : message || t('bookingFlow.toast.paymentFailed')}
      </p>
      {!isSuccess && onRetryPayment && (
        <Button type='button' className='mt-6' onClick={onRetryPayment} disabled={isRetrying}>
          <MaterialIcon
            name={isRetrying ? 'progress_activity' : 'refresh'}
            className={cn('text-[20px]', isRetrying && 'animate-spin')}
          />
          {isRetrying ? t('bookingFlow.payment.retrying') : t('bookingFlow.payment.retry')}
        </Button>
      )}
    </div>
  )
}

interface BookingSidebarProps {
  selectedCatalog: CatalogResponse | null
  selectedPets: PetProfileResponse[]
  selectedTimeSlot: TimeSlotResponse | null
  scheduledAt: string
  subtotal: number
  deposit: number
  remaining: number
  myBookings: BookingResponse[]
}

function BookingSidebar({
  selectedCatalog,
  selectedPets,
  selectedTimeSlot,
  scheduledAt,
  subtotal,
  deposit,
  remaining,
  myBookings
}: BookingSidebarProps) {
  const { t } = useTranslation('services')

  return (
    <aside className='h-fit rounded-md border border-border bg-card p-5 text-card-foreground shadow-sm lg:sticky lg:top-6'>
      <h2 className='flex items-center gap-2 text-lg font-bold'>
        <MaterialIcon name='receipt_long' className='text-[22px] text-primary' />
        {t('bookingFlow.summary.title')}
      </h2>
      <dl className='mt-5 space-y-4 text-sm'>
        <SummaryRow
          label={t('bookingFlow.summary.service')}
          value={selectedCatalog?.catalogName ?? t('bookingFlow.summary.empty')}
        />
        <SummaryRow
          label={t('bookingFlow.summary.pets')}
          value={selectedPets.map((pet) => pet.petName).join(', ') || t('bookingFlow.summary.empty')}
        />
        <SummaryRow
          label={t('bookingFlow.summary.schedule')}
          value={
            selectedTimeSlot
              ? `${scheduledAt} - ${formatSlotTime(selectedTimeSlot.startTime)}`
              : t('bookingFlow.summary.empty')
          }
        />
        <SummaryRow label={t('bookingFlow.summary.subtotal')} value={formatCurrency(subtotal)} strong />
        <SummaryRow label={t('bookingFlow.summary.deposit')} value={formatCurrency(deposit)} strong />
        <SummaryRow label={t('bookingFlow.summary.remaining')} value={formatCurrency(remaining)} />
      </dl>
      <p className='mt-5 rounded-md bg-muted p-3 text-sm text-muted-foreground'>
        {t('bookingFlow.summary.depositNote')}
      </p>
      <div className='mt-5 border-t border-border pt-5'>
        <h3 className='mb-3 text-sm font-semibold'>{t('bookingFlow.myBookings.title')}</h3>
        <div className='space-y-3'>
          {myBookings.slice(0, 3).map((booking) => (
            <div key={booking.bookingId} className='rounded-md bg-background p-3 text-sm'>
              <div className='flex items-center justify-between gap-3'>
                <span className='font-semibold'>{booking.bookingCode}</span>
                <span className='rounded-sm bg-muted px-2 py-1 text-xs text-muted-foreground'>
                  {booking.bookingStatus}
                </span>
              </div>
              <p className='mt-2 text-muted-foreground'>{booking.scheduledAt.slice(0, 10)}</p>
            </div>
          ))}
          {myBookings.length === 0 && (
            <p className='text-sm text-muted-foreground'>{t('bookingFlow.myBookings.empty')}</p>
          )}
        </div>
      </div>
    </aside>
  )
}

interface FieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  required?: boolean
}

function Field({ label, value, onChange, required }: FieldProps) {
  return (
    <label>
      <span className='text-sm font-medium'>{label}</span>
      <input
        value={value}
        required={required}
        onChange={(event) => onChange(event.target.value)}
        className='mt-2 h-11 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring'
      />
    </label>
  )
}

interface ReviewCardProps {
  title: string
  children: ReactNode
}

function ReviewCard({ title, children }: ReviewCardProps) {
  return (
    <section className='rounded-md border border-border bg-background p-4'>
      <h3 className='mb-3 text-sm font-semibold'>{title}</h3>
      <dl className='space-y-3 text-sm'>{children}</dl>
    </section>
  )
}

interface SummaryLineProps {
  label: string
  value: string
}

function SummaryLine({ label, value }: SummaryLineProps) {
  return (
    <div>
      <dt className='text-muted-foreground'>{label}</dt>
      <dd className='mt-1 font-medium'>{value}</dd>
    </div>
  )
}

interface SummaryRowProps {
  label: string
  value: string
  strong?: boolean
}

function SummaryRow({ label, value, strong }: SummaryRowProps) {
  return (
    <div className='flex items-start justify-between gap-4'>
      <dt className='text-muted-foreground'>{label}</dt>
      <dd className={cn('max-w-44 text-right', strong && 'font-bold text-primary')}>{value}</dd>
    </div>
  )
}
