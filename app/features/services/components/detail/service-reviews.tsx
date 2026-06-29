import { useTranslation } from 'react-i18next'

import { MaterialIcon } from '~/shared/ui'

const REVIEWS = ['nguyenHuy', 'minhTu'] as const

export function ServiceReviews() {
  const { t } = useTranslation('services')

  return (
    <section className='mx-auto w-full max-w-6xl px-4 py-20 md:px-6'>
      <div className='mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end'>
        <div>
          <h2 className='mb-2 font-display text-3xl font-bold text-foreground md:text-4xl'>
            {t('detail.reviews.title')}
          </h2>
          <div className='flex items-center gap-4'>
            <div className='flex items-center gap-1'>
              <span className='text-3xl font-bold text-foreground'>4.9</span>
              <span className='text-muted-foreground'>/ 5</span>
            </div>
            <div className='flex items-center text-secondary'>
              {Array.from({ length: 5 }).map((_, index) => (
                <MaterialIcon key={index} name='star' filled className='text-[24px]' />
              ))}
            </div>
            <span className='text-muted-foreground'>{t('detail.reviewCount')}</span>
          </div>
        </div>
        <button
          type='button'
          className='self-start rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:opacity-90 md:self-auto'
        >
          {t('detail.reviews.write')}
        </button>
      </div>

      <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
        {REVIEWS.map((review) => (
          <article key={review} className='flex flex-col gap-4 rounded-2xl border border-border/60 bg-card p-6'>
            <div className='flex items-start justify-between gap-3'>
              <div className='flex items-center gap-3'>
                <div className='flex h-10 w-10 items-center justify-center rounded-full bg-muted font-bold text-primary'>
                  {t(`detail.reviews.items.${review}.initials`)}
                </div>
                <div>
                  <span className='block font-bold text-foreground'>{t(`detail.reviews.items.${review}.name`)}</span>
                  <div className='flex items-center gap-2'>
                    <div className='flex text-secondary'>
                      {Array.from({ length: 5 }).map((_, index) => (
                        <MaterialIcon key={index} name='star' filled className='text-[16px]' />
                      ))}
                    </div>
                    <span className='text-xs text-muted-foreground'>{t(`detail.reviews.items.${review}.date`)}</span>
                  </div>
                </div>
              </div>
              <span className='flex items-center gap-1 rounded bg-muted px-2 py-1 text-[10px] font-bold text-primary'>
                <MaterialIcon name='verified' className='text-[12px]' />
                {t('detail.reviews.verified')}
              </span>
            </div>
            <p className='italic text-muted-foreground'>{t(`detail.reviews.items.${review}.content`)}</p>
          </article>
        ))}
      </div>

      <div className='mt-8 flex justify-center'>
        <button type='button' className='flex items-center gap-2 font-semibold text-primary hover:underline'>
          {t('detail.reviews.viewAll')}
          <MaterialIcon name='expand_more' className='text-[20px]' />
        </button>
      </div>
    </section>
  )
}
