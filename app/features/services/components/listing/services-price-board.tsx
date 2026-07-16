import { useTranslation } from 'react-i18next'

import { parseSurchargeConfig } from '~/shared/lib/catalog-pricing'
import { MaterialIcon } from '~/shared/ui'

import type { CatalogResponse } from '../../services'

const ROW_ACCENTS = [
  'bg-primary/10 text-primary',
  'bg-accent text-accent-foreground',
  'bg-success/10 text-success'
] as const

const ROW_ICONS = ['spa', 'content_cut', 'cleaning_services'] as const

export interface ServicesPriceBoardProps {
  catalogs: CatalogResponse[]
  errorMessage?: string | null
  isLoading?: boolean
}

function formatPrice(value: number): string {
  return new Intl.NumberFormat('vi-VN').format(Number(value ?? 0))
}

function getPriceColumns(catalog: CatalogResponse) {
  const basePrice = Number(catalog.price ?? 0)
  const surcharges = parseSurchargeConfig(catalog.surchargeConfig)

  return {
    under5: basePrice,
    fiveTo10: basePrice,
    tenTo20: basePrice + (surcharges.LARGE ?? 0),
    over20: basePrice + (surcharges.EXTRA_EXTRA_LARGE ?? surcharges.EXTRA_LARGE ?? surcharges.LARGE ?? 0)
  }
}

export function ServicesPriceBoard({ catalogs, errorMessage, isLoading = false }: ServicesPriceBoardProps) {
  const { t } = useTranslation('services')

  return (
    <section className='w-full bg-background py-20'>
      <div className='mx-auto max-w-6xl px-4 md:px-6'>
        <div className='mb-8 text-center md:mb-10'>
          <p className='text-sm uppercase tracking-[0.18em] text-primary'>{t('priceBoard.eyebrow')}</p>
          <h2 className='mt-3 font-display text-3xl font-bold text-foreground md:text-4xl'>{t('priceBoard.title')}</h2>
          <p className='mx-auto mt-3 max-w-2xl text-base text-muted-foreground'>{t('priceBoard.subtitle')}</p>
        </div>

        <div className='rounded-3xl border border-border/60 bg-card p-4 shadow-sm md:p-6'>
          <div className='mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-muted/70 p-4'>
            <div>
              <p className='text-sm font-semibold text-foreground'>{t('priceBoard.tableLabel')}</p>
              <p className='text-sm text-muted-foreground'>{t('priceBoard.tableHint')}</p>
            </div>
            <span className='inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary'>
              <MaterialIcon name='payments' className='text-[16px]' />
              {t('priceBoard.badge')}
            </span>
          </div>

          <div className='overflow-x-auto rounded-2xl border border-border/60'>
            <table className='min-w-full border-collapse text-left text-sm text-foreground'>
              <thead className='bg-muted/80 text-xs uppercase tracking-[0.18em] text-muted-foreground'>
                <tr>
                  <th className='px-4 py-3 md:px-5'>{t('priceBoard.columns.service')}</th>
                  <th className='px-4 py-3 md:px-5'>{t('priceBoard.columns.info')}</th>
                  <th className='px-4 py-3 md:px-5'>{t('priceBoard.columns.under5')}</th>
                  <th className='px-4 py-3 md:px-5'>{t('priceBoard.columns.fiveTo10')}</th>
                  <th className='px-4 py-3 md:px-5'>{t('priceBoard.columns.tenTo20')}</th>
                  <th className='px-4 py-3 md:px-5'>{t('priceBoard.columns.over20')}</th>
                </tr>
              </thead>
              <tbody>
                {isLoading &&
                  Array.from({ length: 3 }).map((_, index) => (
                    <tr key={index} className='border-t border-border/60 align-top'>
                      <td className='px-4 py-4 md:px-5'>
                        <div className='flex animate-pulse items-start gap-3'>
                          <span className='mt-0.5 inline-flex h-10 w-10 rounded-xl bg-muted' />
                          <div className='flex-1 space-y-2'>
                            <div className='h-4 w-32 rounded bg-muted' />
                            <div className='h-3 w-20 rounded bg-muted' />
                          </div>
                        </div>
                      </td>
                      <td className='px-4 py-4 md:px-5'>
                        <div className='h-10 animate-pulse rounded bg-muted' />
                      </td>
                      <td className='px-4 py-4 md:px-5'>
                        <div className='h-4 w-16 animate-pulse rounded bg-muted' />
                      </td>
                      <td className='px-4 py-4 md:px-5'>
                        <div className='h-4 w-16 animate-pulse rounded bg-muted' />
                      </td>
                      <td className='px-4 py-4 md:px-5'>
                        <div className='h-4 w-16 animate-pulse rounded bg-muted' />
                      </td>
                      <td className='px-4 py-4 md:px-5'>
                        <div className='h-4 w-16 animate-pulse rounded bg-muted' />
                      </td>
                    </tr>
                  ))}

                {!isLoading && errorMessage && (
                  <tr className='border-t border-border/60'>
                    <td className='px-4 py-6 text-sm text-destructive md:px-5' colSpan={6}>
                      {t('catalog.error', { message: errorMessage })}
                    </td>
                  </tr>
                )}

                {!isLoading && !errorMessage && catalogs.length === 0 && (
                  <tr className='border-t border-border/60'>
                    <td className='px-4 py-6 text-center text-sm text-muted-foreground md:px-5' colSpan={6}>
                      {t('catalog.empty')}
                    </td>
                  </tr>
                )}

                {!isLoading &&
                  !errorMessage &&
                  catalogs.map((catalog, index) => {
                    const prices = getPriceColumns(catalog)

                    return (
                      <tr key={catalog.catalogId} className='border-t border-border/60 align-top'>
                        <td className='px-4 py-4 md:px-5'>
                          <div className='flex items-start gap-3'>
                            <span
                              className={`mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-xl ${ROW_ACCENTS[index % ROW_ACCENTS.length]}`}
                            >
                              <MaterialIcon name={ROW_ICONS[index % ROW_ICONS.length]} className='text-[18px]' />
                            </span>
                            <div>
                              <p className='font-semibold text-foreground'>{catalog.catalogName}</p>
                              <p className='mt-1 text-xs text-muted-foreground'>
                                {t('catalog.startingPrice', { price: formatPrice(catalog.price) })}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className='px-4 py-4 text-muted-foreground md:px-5'>{catalog.description}</td>
                        <td className='px-4 py-4 font-semibold text-foreground md:px-5'>
                          {formatPrice(prices.under5)}
                        </td>
                        <td className='px-4 py-4 font-semibold text-foreground md:px-5'>
                          {formatPrice(prices.fiveTo10)}
                        </td>
                        <td className='px-4 py-4 font-semibold text-foreground md:px-5'>
                          {formatPrice(prices.tenTo20)}
                        </td>
                        <td className='px-4 py-4 font-semibold text-primary md:px-5'>{formatPrice(prices.over20)}</td>
                      </tr>
                    )
                  })}
              </tbody>
            </table>
          </div>

          <div className='mt-4 flex items-start gap-3 rounded-2xl bg-muted/70 p-4 text-sm text-muted-foreground'>
            <MaterialIcon name='info' className='mt-0.5 text-[18px] text-primary' />
            <p>{t('priceBoard.note')}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
