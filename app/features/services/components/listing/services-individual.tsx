import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { cn } from '~/shared/lib/cn'
import { MaterialIcon } from '~/shared/ui'

import type { CatalogResponse } from '../../services'

const SWIPE_THRESHOLD = 42
const SERVICE_CARD_ICONS = ['spa', 'content_cut', 'pets', 'cleaning_services', 'auto_awesome'] as const

export interface ServicesIndividualProps {
  catalogs: CatalogResponse[]
  errorMessage?: string | null
  isLoading?: boolean
}

function formatStartingPrice(value: number): string {
  const amount = Number(value ?? 0)

  if (!Number.isFinite(amount) || amount <= 0) {
    return '0đ'
  }

  if (amount >= 1000) {
    return `${Math.round(amount / 1000)}k`
  }

  return `${new Intl.NumberFormat('vi-VN').format(amount)}đ`
}

function getCoverflowOffset(index: number, activeIndex: number, total: number): number {
  let offset = index - activeIndex

  if (Math.abs(offset) > total / 2) {
    offset += offset > 0 ? -total : total
  }

  return offset
}

function getCatalogTypeLabel(type: string, t: (key: string, options?: Record<string, string>) => string): string {
  return t(`catalog.catalogTypes.${type}`, { defaultValue: type })
}

function getPetSpeciesLabel(species: string, t: (key: string, options?: Record<string, string>) => string): string {
  return t(`catalog.petSpeciesLabels.${species}`, { defaultValue: species })
}

export function ServicesIndividual({ catalogs, errorMessage, isLoading = false }: ServicesIndividualProps) {
  const { t } = useTranslation('services')
  const [activeIndex, setActiveIndex] = useState(0)
  const [swipeStartX, setSwipeStartX] = useState<number | null>(null)
  const hasCarousel = catalogs.length > 1

  const coverflowItems = useMemo(
    () =>
      catalogs.map((catalog, index) => ({
        catalog,
        offset: getCoverflowOffset(index, activeIndex, catalogs.length),
        icon: SERVICE_CARD_ICONS[index % SERVICE_CARD_ICONS.length]
      })),
    [activeIndex, catalogs]
  )

  const handlePrevious = () => {
    setActiveIndex((current) => (current - 1 + catalogs.length) % catalogs.length)
  }

  const handleNext = () => {
    setActiveIndex((current) => (current + 1) % catalogs.length)
  }

  const handlePointerUp = (clientX: number) => {
    if (swipeStartX === null || !hasCarousel) {
      setSwipeStartX(null)
      return
    }

    const distance = clientX - swipeStartX

    if (Math.abs(distance) >= SWIPE_THRESHOLD) {
      if (distance > 0) {
        handlePrevious()
      } else {
        handleNext()
      }
    }

    setSwipeStartX(null)
  }

  return (
    <section className='mx-auto w-full max-w-6xl px-4 py-20 md:px-6'>
      <div className='mb-12 text-center'>
        <h2 className='font-display text-3xl font-bold text-primary md:text-4xl'>{t('individual.title')}</h2>
        <p className='mt-2 text-base text-muted-foreground'>{t('individual.subtitle')}</p>
      </div>

      <div className={cn('relative', isLoading && 'h-[35rem] md:h-[37rem]')}>
        {isLoading &&
          Array.from({ length: 3 }).map((_, index) => {
            const offset = index - 1

            return (
              <div
                key={index}
                className={cn(
                  'absolute left-1/2 top-0 flex h-[33rem] w-[82%] -translate-x-1/2 animate-pulse flex-col rounded-2xl border border-border bg-card p-6 shadow-sm sm:w-[58%] lg:w-[38%]',
                  offset !== 0 && 'hidden md:flex'
                )}
                style={{
                  transform: `translateX(calc(-50% + ${offset * 68}%)) scale(${offset === 0 ? 1 : 0.86}) rotateY(${offset * -22}deg)`,
                  zIndex: 10 - Math.abs(offset)
                }}
              >
                <div className='mb-5 h-36 rounded-xl bg-muted' />
                <div className='h-7 w-3/4 rounded-lg bg-muted' />
                <div className='mt-4 h-20 rounded-lg bg-muted' />
                <div className='mt-auto h-7 w-24 rounded-lg bg-muted' />
                <div className='mt-5 grid grid-cols-2 gap-3'>
                  <div className='h-11 rounded-lg bg-muted' />
                  <div className='h-11 rounded-lg bg-muted' />
                </div>
              </div>
            )
          })}

        {!isLoading && errorMessage && (
          <div className='rounded-xl border border-destructive/30 bg-destructive/10 p-6 text-sm text-destructive md:col-span-3'>
            {t('catalog.error', { message: errorMessage })}
          </div>
        )}

        {!isLoading && !errorMessage && catalogs.length === 0 && (
          <div className='rounded-xl border border-border bg-card p-6 text-center text-sm text-muted-foreground md:col-span-3'>
            {t('catalog.empty')}
          </div>
        )}

        {!isLoading && !errorMessage && catalogs.length > 0 && (
          <div
            className='relative h-[35rem] touch-pan-y overflow-hidden md:h-[37rem]'
            onPointerCancel={() => setSwipeStartX(null)}
            onPointerDown={(event) => setSwipeStartX(event.clientX)}
            onPointerLeave={() => setSwipeStartX(null)}
            onPointerUp={(event) => handlePointerUp(event.clientX)}
          >
            <div className='absolute inset-x-0 top-0 h-[33.5rem] [perspective:1400px] md:h-[35.5rem]'>
              {coverflowItems.map(({ catalog, icon, offset }) => {
                const distance = Math.abs(offset)
                const isActive = offset === 0
                const isVisible = distance <= 2

                return (
                  <article
                    key={catalog.catalogId}
                    className={cn(
                      'absolute left-1/2 top-0 flex h-[33rem] w-[82%] -translate-x-1/2 select-none flex-col rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-500 ease-out sm:w-[58%] lg:w-[38%]',
                      isActive && 'shadow-2xl ring-1 ring-primary/25',
                      !isActive && 'bg-card/90 shadow-md',
                      !isVisible && 'pointer-events-none opacity-0'
                    )}
                    style={{
                      transform: `translateX(calc(-50% + ${offset * 68}%)) translateZ(${isActive ? 48 : -90}px) scale(${isActive ? 1 : 0.86}) rotateY(${offset * -24}deg)`,
                      zIndex: 20 - distance
                    }}
                    aria-hidden={!isVisible}
                  >
                    <div className='relative mb-5 h-36 overflow-hidden rounded-xl border border-border bg-muted'>
                      {catalog.imageUrl ? (
                        <img
                          src={catalog.imageUrl}
                          alt={catalog.catalogName}
                          className='h-full w-full object-cover'
                          draggable={false}
                        />
                      ) : (
                        <div className='flex h-full w-full items-center justify-center text-primary'>
                          <MaterialIcon name={icon} filled className='text-[44px]' />
                        </div>
                      )}
                      <span className='absolute left-3 top-3 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-card/90 text-primary shadow-sm backdrop-blur'>
                        <MaterialIcon name={icon} filled className='text-[24px]' />
                      </span>
                      <span className='absolute right-3 top-3 rounded-full bg-card/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground shadow-sm backdrop-blur'>
                        {getCatalogTypeLabel(catalog.catalogType, t)}
                      </span>
                    </div>
                    <h3 className='font-display text-2xl font-semibold leading-tight text-foreground'>
                      {catalog.catalogName}
                    </h3>
                    <p className='mt-4 line-clamp-4 text-sm leading-6 text-muted-foreground'>{catalog.description}</p>
                    <div className='mt-5 grid grid-cols-2 gap-3 text-xs text-muted-foreground'>
                      <span className='rounded-xl bg-muted/70 px-3 py-2'>
                        <span className='block font-semibold text-foreground'>{catalog.durationMinute}</span>
                        {t('catalog.minutes')}
                      </span>
                      <span className='rounded-xl bg-muted/70 px-3 py-2'>
                        <span className='block font-semibold text-foreground'>
                          {getPetSpeciesLabel(catalog.petSpecies, t)}
                        </span>
                        {t('catalog.petSpecies')}
                      </span>
                    </div>
                    <div className='mt-auto flex flex-col gap-3 pt-5'>
                      <span className='font-display text-2xl font-bold text-primary'>
                        {t('catalog.startingPrice', { price: formatStartingPrice(catalog.price) })}
                      </span>
                      <div className='grid grid-cols-1 gap-2'>
                        <a
                          href={`/booking?catalogId=${catalog.catalogId}`}
                          className='flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:opacity-90'
                        >
                          {t('individual.cta')}
                        </a>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>

            {hasCarousel && (
              <div className='pointer-events-none absolute inset-x-0 top-1/2 z-30 flex -translate-y-1/2 justify-between px-1 sm:px-4'>
                <button
                  type='button'
                  className='pointer-events-auto inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card text-primary shadow-lg transition hover:bg-primary hover:text-primary-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring'
                  aria-label={t('catalog.previous')}
                  onClick={handlePrevious}
                >
                  <MaterialIcon name='chevron_left' className='text-[26px]' />
                </button>
                <button
                  type='button'
                  className='pointer-events-auto inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card text-primary shadow-lg transition hover:bg-primary hover:text-primary-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring'
                  aria-label={t('catalog.next')}
                  onClick={handleNext}
                >
                  <MaterialIcon name='chevron_right' className='text-[26px]' />
                </button>
              </div>
            )}

            {hasCarousel && (
              <div className='absolute bottom-0 left-1/2 z-30 flex -translate-x-1/2 gap-2'>
                {catalogs.map((catalog, index) => (
                  <button
                    key={catalog.catalogId}
                    type='button'
                    className={cn(
                      'h-2.5 rounded-full transition-all',
                      index === activeIndex ? 'w-8 bg-primary' : 'w-2.5 bg-muted-foreground/30'
                    )}
                    aria-label={catalog.catalogName}
                    onClick={() => setActiveIndex(index)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
