import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { cn } from '~/shared/lib/cn'
import { MaterialIcon } from '~/shared/ui'

import { AdminServicePricingModal, type AdminServicePricingKey } from './admin-service-pricing-modal'

const FILTER_KEYS = ['all', 'grooming', 'vet', 'hotel'] as const

const SERVICES = [
  {
    key: 'bathTrimCombo',
    category: 'grooming',
    icon: 'content_cut',
    price: '250.000đ - 450.000đ',
    updatedAt: '12/10/2023',
    active: true
  },
  {
    key: 'vipHotel',
    category: 'hotel',
    icon: 'hotel',
    price: '300.000đ / ngày',
    updatedAt: '05/11/2023',
    active: true
  },
  {
    key: 'vaccination',
    category: 'vet',
    icon: 'vaccines',
    price: '550.000đ',
    updatedAt: '28/10/2023',
    active: false
  }
] as const

const CATEGORY_CLASS_BY_CATEGORY = {
  grooming: 'bg-primary/10 text-primary',
  hotel: 'bg-secondary text-secondary-foreground',
  vet: 'bg-tertiary text-tertiary-foreground'
} as const

export function AdminServicesTable() {
  const { t } = useTranslation('admin')
  const [selectedPricingService, setSelectedPricingService] = useState<AdminServicePricingKey | null>(null)

  return (
    <>
      <section className='overflow-hidden rounded-2xl border border-border bg-card shadow-sm'>
        <div className='flex flex-col gap-4 border-b border-border bg-muted p-5 xl:flex-row xl:items-center xl:justify-between'>
          <div className='flex flex-wrap gap-2'>
            {FILTER_KEYS.map((key) => {
              const isActive = key === 'all'

              return (
                <button
                  key={key}
                  type='button'
                  className={
                    isActive
                      ? 'rounded-full bg-primary px-5 py-2 text-sm font-bold text-primary-foreground'
                      : 'rounded-full bg-card px-5 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-secondary hover:text-secondary-foreground'
                  }
                >
                  {t(`serviceManagement.filters.categories.${key}`)}
                </button>
              )
            })}
          </div>
          <div className='flex flex-col gap-3 sm:flex-row'>
            <select className='h-10 rounded-lg border border-input bg-card px-4 text-sm font-semibold text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring'>
              <option>{t('serviceManagement.filters.status.all')}</option>
              <option>{t('serviceManagement.filters.status.active')}</option>
              <option>{t('serviceManagement.filters.status.inactive')}</option>
            </select>
            <button
              type='button'
              aria-label={t('serviceManagement.filters.advanced')}
              className='flex h-10 w-10 items-center justify-center rounded-lg bg-card text-muted-foreground transition-colors hover:bg-muted hover:text-primary'
            >
              <MaterialIcon name='filter_list' />
            </button>
          </div>
        </div>

        <div className='overflow-x-auto'>
          <table className='w-full min-w-[820px] border-collapse text-left'>
            <thead>
              <tr className='border-b border-border bg-muted/50 text-sm font-bold text-muted-foreground'>
                <th className='px-4 py-3'>{t('serviceManagement.table.columns.name')}</th>
                <th className='px-4 py-3'>{t('serviceManagement.table.columns.category')}</th>
                <th className='px-4 py-3'>{t('serviceManagement.table.columns.price')}</th>
                <th className='px-4 py-3 text-center'>{t('serviceManagement.table.columns.status')}</th>
                <th className='px-4 py-3'>{t('serviceManagement.table.columns.updatedAt')}</th>
                <th className='px-4 py-3 text-right'>{t('serviceManagement.table.columns.actions')}</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-border'>
              {SERVICES.map((service) => (
                <tr key={service.key} className='transition-colors hover:bg-muted'>
                  <td className='px-4 py-3'>
                    <div className='flex items-center gap-4'>
                      <div className='flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-muted text-primary shadow-sm'>
                        <MaterialIcon name={service.icon} className='text-2xl' />
                      </div>
                      <div>
                        <p className='font-bold text-card-foreground'>
                          {t(`serviceManagement.table.rows.${service.key}.name`)}
                        </p>
                        <p className='text-xs text-muted-foreground'>
                          {t(`serviceManagement.table.rows.${service.key}.description`)}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className='px-4 py-3'>
                    <span
                      className={cn(
                        'inline-flex rounded-full px-3 py-1 text-xs font-bold',
                        CATEGORY_CLASS_BY_CATEGORY[service.category]
                      )}
                    >
                      {t(`serviceManagement.categories.${service.category}`)}
                    </span>
                  </td>
                  <td className='px-4 py-3 font-semibold text-card-foreground'>{service.price}</td>
                  <td className='px-4 py-3'>
                    <div className='flex justify-center'>
                      <span
                        className={
                          service.active
                            ? 'relative h-6 w-11 rounded-full bg-success after:absolute after:right-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-success-foreground'
                            : 'relative h-6 w-11 rounded-full bg-muted-foreground after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-card'
                        }
                        aria-label={
                          service.active ? t('serviceManagement.status.active') : t('serviceManagement.status.inactive')
                        }
                      />
                    </div>
                  </td>
                  <td className='px-4 py-3 text-sm text-muted-foreground'>{service.updatedAt}</td>
                  <td className='px-4 py-3'>
                    <div className='flex justify-end gap-2'>
                      <button
                        type='button'
                        aria-label={t('serviceManagement.actions.edit')}
                        onClick={() => setSelectedPricingService(service.key)}
                        className='flex h-9 w-9 items-center justify-center rounded-lg text-secondary-foreground transition-colors hover:bg-secondary'
                      >
                        <MaterialIcon name='edit' className='text-lg' />
                      </button>
                      <button
                        type='button'
                        aria-label={t('serviceManagement.actions.view')}
                        className='flex h-9 w-9 items-center justify-center rounded-lg text-primary transition-colors hover:bg-muted'
                      >
                        <MaterialIcon name='visibility' className='text-lg' />
                      </button>
                      <button
                        type='button'
                        aria-label={t('serviceManagement.actions.delete')}
                        className='flex h-9 w-9 items-center justify-center rounded-lg text-destructive transition-colors hover:bg-muted'
                      >
                        <MaterialIcon name='delete' className='text-lg' />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className='flex flex-col gap-4 border-t border-border bg-muted px-4 py-3 sm:flex-row sm:items-center sm:justify-between'>
          <p className='text-sm text-muted-foreground'>{t('serviceManagement.pagination.showing')}</p>
          <div className='flex gap-2'>
            <button className='flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:text-primary'>
              <MaterialIcon name='chevron_left' className='text-lg' />
            </button>
            {[1, 2, 3].map((page) => (
              <button
                key={page}
                className={
                  page === 1
                    ? 'flex h-10 w-10 items-center justify-center rounded-lg bg-primary font-bold text-primary-foreground'
                    : 'flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card font-bold text-muted-foreground hover:text-primary'
                }
              >
                {page}
              </button>
            ))}
            <button className='flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:text-primary'>
              <MaterialIcon name='chevron_right' className='text-lg' />
            </button>
          </div>
        </div>
      </section>

      <AdminServicePricingModal
        isOpen={selectedPricingService !== null}
        serviceKey={selectedPricingService}
        onClose={() => setSelectedPricingService(null)}
      />
    </>
  )
}
