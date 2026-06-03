import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { MaterialIcon } from '~/shared/ui'

const MEMBERSHIP_TIERS = [
  { key: 'silver', multiplier: 'x1.0' },
  { key: 'gold', multiplier: 'x1.2' },
  { key: 'diamond', multiplier: 'x1.5' }
] as const

export function AdminRewardSettingsCard() {
  const { t } = useTranslation('admin')
  const [isToastVisible, setIsToastVisible] = useState(false)

  function handleSave() {
    setIsToastVisible(true)
    window.setTimeout(() => setIsToastVisible(false), 2500)
  }

  return (
    <aside className='space-y-4'>
      <h2 className='flex items-center gap-2 font-display text-lg font-bold text-card-foreground'>
        <MaterialIcon name='stars' filled className='text-secondary-foreground' />
        {t('voucherManagement.rewards.title')}
      </h2>

      <div className='space-y-5 rounded-2xl border border-border bg-card p-5 shadow-sm'>
        <div className='rounded-xl bg-secondary p-4 text-secondary-foreground'>
          <div className='flex items-center gap-3'>
            <MaterialIcon name='info' />
            <p className='text-xs font-semibold'>{t('voucherManagement.rewards.info')}</p>
          </div>
        </div>

        <div className='space-y-3'>
          <label className='block text-sm font-bold text-card-foreground'>
            {t('voucherManagement.rewards.accumulation')}
          </label>
          <div className='grid grid-cols-[1fr_auto_1fr] items-center gap-2'>
            <div className='relative'>
              <input
                type='number'
                defaultValue='10000'
                className='h-11 w-full rounded-xl border border-input bg-card pl-3 pr-12 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring'
              />
              <span className='absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground'>
                VND
              </span>
            </div>
            <MaterialIcon name='sync_alt' className='text-muted-foreground' />
            <div className='relative'>
              <input
                type='number'
                defaultValue='1'
                className='h-11 w-full rounded-xl border border-input bg-card pl-3 pr-14 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring'
              />
              <span className='absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground'>
                {t('voucherManagement.rewards.pointUnit')}
              </span>
            </div>
          </div>
          <p className='text-xs text-muted-foreground'>{t('voucherManagement.rewards.accumulationHint')}</p>
        </div>

        <div className='space-y-3'>
          <label className='block text-sm font-bold text-card-foreground'>
            {t('voucherManagement.rewards.redemption')}
          </label>
          <div className='grid grid-cols-[1fr_auto_1fr] items-center gap-2'>
            <div className='relative'>
              <input
                type='number'
                defaultValue='1'
                className='h-11 w-full rounded-xl border border-input bg-card pl-3 pr-14 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring'
              />
              <span className='absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground'>
                {t('voucherManagement.rewards.pointUnit')}
              </span>
            </div>
            <MaterialIcon name='sync_alt' className='text-muted-foreground' />
            <div className='relative'>
              <input
                type='number'
                defaultValue='1000'
                className='h-11 w-full rounded-xl border border-input bg-card pl-3 pr-12 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring'
              />
              <span className='absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground'>
                VND
              </span>
            </div>
          </div>
          <p className='text-xs text-muted-foreground'>{t('voucherManagement.rewards.redemptionHint')}</p>
        </div>

        <div className='space-y-3 border-t border-border pt-4'>
          <p className='text-sm font-bold text-card-foreground'>{t('voucherManagement.rewards.tiersTitle')}</p>
          {MEMBERSHIP_TIERS.map((tier) => (
            <div
              key={tier.key}
              className='flex items-center justify-between rounded-lg border border-border bg-muted px-3 py-2'
            >
              <div className='flex items-center gap-2'>
                <MaterialIcon name='workspace_premium' className='text-primary' />
                <span className='text-xs font-semibold text-card-foreground'>
                  {t(`voucherManagement.rewards.tiers.${tier.key}`)}
                </span>
              </div>
              <span className='text-xs font-bold text-card-foreground'>{tier.multiplier}</span>
            </div>
          ))}
        </div>

        <button
          type='button'
          onClick={handleSave}
          className='flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-bold text-primary-foreground shadow-sm transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-ring'
        >
          <MaterialIcon name='save' className='text-lg' />
          {t('voucherManagement.rewards.save')}
        </button>
      </div>

      <div className='relative overflow-hidden rounded-2xl bg-primary p-5 text-primary-foreground'>
        <div className='relative z-10'>
          <h3 className='font-display text-lg font-bold'>{t('voucherManagement.rewards.scaleTitle')}</h3>
          <p className='mt-1 text-xs text-primary-foreground/80'>{t('voucherManagement.rewards.scaleText')}</p>
        </div>
        <MaterialIcon
          name='rocket_launch'
          className='absolute -bottom-5 -right-5 text-8xl text-primary-foreground/10'
        />
      </div>

      {isToastVisible && (
        <div className='fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl bg-success px-5 py-4 text-success-foreground shadow-xl'>
          <MaterialIcon name='check_circle' filled />
          <div>
            <p className='text-sm font-bold'>{t('voucherManagement.toast.title')}</p>
            <p className='text-xs opacity-90'>{t('voucherManagement.toast.description')}</p>
          </div>
        </div>
      )}
    </aside>
  )
}
