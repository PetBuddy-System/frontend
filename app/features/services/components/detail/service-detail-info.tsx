import { useTranslation } from 'react-i18next'

import { MaterialIcon } from '~/shared/ui'
import { cn } from '~/shared/lib/cn'

const SIZES = ['s', 'm', 'l', 'xl'] as const

export function ServiceDetailInfo() {
  const { t } = useTranslation('services')

  return (
    <section className='flex flex-col gap-6'>
      <div>
        <h1 className='mb-2 font-display text-3xl font-bold text-foreground md:text-4xl'>{t('detail.title')}</h1>

        <div className='mb-4 flex items-center gap-4'>
          <div className='flex items-center text-secondary' aria-label={t('detail.ratingLabel')}>
            {Array.from({ length: 5 }).map((_, index) => (
              <MaterialIcon key={index} name='star' filled className='text-[20px]' />
            ))}
          </div>
          <span className='text-base text-muted-foreground'>{t('detail.reviewCount')}</span>
        </div>

        <div className='mb-4 font-display text-2xl font-bold text-primary'>{t('detail.startingPrice')}</div>

        <p className='text-base leading-7 text-muted-foreground'>{t('detail.summary')}</p>
      </div>

      <div className='flex flex-col gap-4 border-y border-border py-6'>
        <div className='flex flex-col gap-2'>
          <span className='text-sm font-semibold text-foreground'>{t('detail.sizeSelector.label')}</span>
          <div className='flex flex-wrap gap-3'>
            {SIZES.map((size, index) => (
              <button
                key={size}
                type='button'
                className={cn(
                  'rounded-xl px-4 py-2 text-sm font-semibold transition-colors',
                  index === 0
                    ? 'border-2 border-primary bg-muted text-primary'
                    : 'border border-border text-muted-foreground hover:border-primary hover:text-primary'
                )}
              >
                {t(`detail.sizeSelector.options.${size}`)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className='flex flex-col gap-4 pt-2 sm:flex-row'>
        <a
          href='/services/bath/book'
          className='flex flex-1 items-center justify-center gap-2 rounded-xl bg-secondary px-6 py-4 text-sm font-semibold text-secondary-foreground shadow-sm transition-colors hover:opacity-90'
        >
          <MaterialIcon name='calendar_month' className='text-[20px]' />
          {t('detail.actions.book')}
        </a>
        <button
          type='button'
          className='flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-6 py-4 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:opacity-90'
        >
          <MaterialIcon name='chat' className='text-[20px]' />
          {t('detail.actions.zalo')}
        </button>
      </div>

      <div className='mt-2 flex items-center gap-2 text-sm text-muted-foreground'>
        <MaterialIcon name='verified' className='text-[16px]' />
        <span>{t('detail.certifiedNote')}</span>
      </div>
    </section>
  )
}
