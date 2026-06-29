import { useTranslation } from 'react-i18next'

import { cn } from '~/shared/lib/cn'
import { MaterialIcon } from '~/shared/ui'

export interface AdminServicePricingModalProps {
  isOpen: boolean
  onClose: () => void
  serviceKey: AdminServicePricingKey | null
}

export type AdminServicePricingKey = 'bathTrimCombo' | 'vaccination' | 'vipHotel'

const SERVICE_PRICE_GROUP_BY_KEY: Record<
  AdminServicePricingKey,
  { icon: string; serviceId: string; toneClass: string; prices: string[] }
> = {
  bathTrimCombo: {
    icon: 'content_cut',
    serviceId: '001',
    toneClass: 'bg-primary/10 text-primary',
    prices: ['250.000', '350.000', '450.000', '600.000']
  },
  vaccination: {
    icon: 'vaccines',
    serviceId: '003',
    toneClass: 'bg-success/10 text-success',
    prices: ['550.000', '720.000', '900.000', '1.100.000']
  },
  vipHotel: {
    icon: 'hotel',
    serviceId: '002',
    toneClass: 'bg-secondary text-secondary-foreground',
    prices: ['300.000', '420.000', '550.000', '700.000']
  }
}

const WEIGHT_TIERS = ['under5', 'from5To10', 'from10To20', 'over20'] as const

export function AdminServicePricingModal({ isOpen, onClose, serviceKey }: AdminServicePricingModalProps) {
  const { t } = useTranslation('admin')

  if (!isOpen || !serviceKey) {
    return null
  }

  const serviceGroup = SERVICE_PRICE_GROUP_BY_KEY[serviceKey]

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
      <button
        type='button'
        aria-label={t('serviceManagement.pricing.close')}
        className='absolute inset-0 bg-foreground/40 backdrop-blur-sm'
        onClick={onClose}
      />

      <section className='relative flex h-[calc(100vh-2rem)] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-xl'>
        <header className='flex flex-col gap-4 border-b border-border px-5 py-5 lg:flex-row lg:items-end lg:justify-between'>
          <div>
            <h2 className='font-display text-2xl font-extrabold text-card-foreground md:text-3xl'>
              {t('serviceManagement.pricing.title')}
            </h2>
            <p className='mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground'>
              {t('serviceManagement.pricing.subtitle')}
            </p>
          </div>
          <div className='flex flex-col gap-3 sm:flex-row'>
            <button
              type='button'
              onClick={onClose}
              className='inline-flex h-11 items-center justify-center rounded-full border border-border bg-card px-5 text-sm font-bold text-card-foreground transition-colors hover:bg-muted'
            >
              {t('serviceManagement.pricing.cancel')}
            </button>
            <button
              type='button'
              className='inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-ring'
            >
              <MaterialIcon name='save' className='text-lg' />
              {t('serviceManagement.pricing.save')}
            </button>
          </div>
        </header>

        <div className='min-h-0 flex-1 overflow-y-auto px-5 py-6'>
          <section className='grid grid-cols-1 gap-5 lg:grid-cols-12'>
            <div className='lg:col-span-4'>
              <div className='mb-4 flex items-center gap-4'>
                <div className={cn('flex h-14 w-14 items-center justify-center rounded-2xl', serviceGroup.toneClass)}>
                  <MaterialIcon name={serviceGroup.icon} className='text-3xl' />
                </div>
                <span className='text-xs font-bold uppercase tracking-wide text-muted-foreground'>
                  {t('serviceManagement.pricing.serviceId', { id: serviceGroup.serviceId })}
                </span>
              </div>
              <h3 className='font-display text-2xl font-extrabold text-card-foreground'>
                {t(`serviceManagement.table.rows.${serviceKey}.name`)}
              </h3>
              <p className='mt-3 leading-relaxed text-muted-foreground'>
                {t(`serviceManagement.table.rows.${serviceKey}.description`)}
              </p>
              <button
                type='button'
                className='mt-4 inline-flex items-center gap-2 text-sm font-bold text-primary transition-transform hover:translate-x-1'
              >
                <MaterialIcon name='edit' className='text-lg' />
                {t('serviceManagement.pricing.editDetails')}
              </button>
            </div>

            <div className='rounded-2xl border border-border bg-muted p-5 lg:col-span-8'>
              <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                {WEIGHT_TIERS.map((tier, tierIndex) => (
                  <label key={tier} className='space-y-2'>
                    <span className='block text-xs font-bold uppercase tracking-wide text-muted-foreground'>
                      {t(`serviceManagement.pricing.weightTiers.${tier}`)}
                    </span>
                    <span className='relative block'>
                      <input
                        type='text'
                        defaultValue={serviceGroup.prices[tierIndex]}
                        className='h-12 w-full rounded-xl border border-input bg-card px-4 pr-10 font-mono text-lg font-bold text-card-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring'
                      />
                      <span className='absolute right-4 top-1/2 -translate-y-1/2 font-mono text-muted-foreground'>
                        {t('serviceManagement.pricing.currency')}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </section>
        </div>
      </section>
    </div>
  )
}
