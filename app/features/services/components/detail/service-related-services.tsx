import { useTranslation } from 'react-i18next'

import { MaterialIcon } from '~/shared/ui'

const RELATED_SERVICES = [
  {
    key: 'grooming',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuACD5UCQe2UmjgpeYEpW7VspN2pfKfh565eMb0X0Ov58OroQ588RCbII6AF3iz15b2He2OMVSTk7T1tJ3oIAz_zJ1XCY5GXQLUCkh0wD5zAerj061aOqs1tgougO7jaupSm-1NE6pGhLePYWPQ49flxoGAf9aiRCGh_45nxce6m8m40plHj-DQ7Wr51r1pQ0i1fmL8y2-Z4c7Q13n63YF9WV5ShHX7tT678tcL9uLmxY9_01XiEwWcVhYPb9uUhmoYp2_bbRgNrS-Q'
  },
  {
    key: 'nail',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBZg_03ri5rpj2erWYQRWB6tSXqtEw5eYJoJpuSgLb8erMC0A5wparBbV8TP42pVFnu6tymLhlblvuWBxa6YQAsAnzwSmq2QLzO4E6BNhoDcCWEQr2qFyl5KwSWRfxZEbxjtloyYONHKIV984Bt_JQOFQB700CQFpd6KrUk3ETlXrduSS6SF87q_2PPMw1Jjzn4ZC3RGuucWielBkB7XGMU1O9F6kH4CMTZ13HtICwZ2Cdz6iAdhXQb8nGFQoou9ZRalNjDHSgSal4'
  },
  {
    key: 'combo',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCf17YEvl-4Jf2CoQG2vgXKmOxDO43-248F9TY4HOquaAu0wNKbSfYlBdCAjbY0Sqd6b4e2eNs-dpj1mkDu9K-oPo1ltgS0vcfR0K5PHUxUdgTJoJrZv4x0EW8P94A3Q3yzteE2T1pZWbm29GqboBbAsVid-PBY6xP2nNYCNJL6-gIgLyNxHd83tiobtcvENJcRP_AYA_4P6TbLfbLxfCW0W66mUdEyfhl8putve5bWvPoVG7CaVrLiJJmk5K96juxWH5ErOzDFkuQ'
  }
] as const

export function ServiceRelatedServices() {
  const { t } = useTranslation('services')

  return (
    <section className='mx-auto mb-12 w-full max-w-6xl rounded-3xl bg-muted px-4 py-20 md:px-8'>
      <div className='mb-8 flex items-end justify-between gap-4'>
        <div>
          <h2 className='mb-2 font-display text-3xl font-bold text-foreground md:text-4xl'>
            {t('detail.related.title')}
          </h2>
          <p className='text-base text-muted-foreground'>{t('detail.related.subtitle')}</p>
        </div>
        <a
          className='hidden items-center gap-1 text-sm font-semibold text-primary transition-colors hover:opacity-80 md:flex'
          href='/services'
        >
          {t('detail.related.viewAll')}
          <MaterialIcon name='arrow_forward' className='text-[20px]' />
        </a>
      </div>

      <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
        {RELATED_SERVICES.map((service) => (
          <article
            key={service.key}
            className='group overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm transition-shadow hover:shadow-md'
          >
            <div className='aspect-[4/3] overflow-hidden bg-muted'>
              <img
                src={service.imageUrl}
                alt={t(`detail.related.items.${service.key}.imageAlt`)}
                className='h-full w-full object-cover transition-transform duration-500 group-hover:scale-105'
              />
            </div>
            <div className='p-6'>
              <div className='mb-2 flex items-start justify-between gap-3'>
                <h3 className='font-display text-lg font-semibold text-foreground'>
                  {t(`detail.related.items.${service.key}.title`)}
                </h3>
                {service.key === 'combo' ? (
                  <span className='rounded bg-secondary px-2 py-1 text-[10px] font-bold text-secondary-foreground'>
                    {t('detail.related.hotBadge')}
                  </span>
                ) : null}
              </div>
              <p className='mb-4 line-clamp-2 text-sm text-muted-foreground'>
                {t(`detail.related.items.${service.key}.description`)}
              </p>
              <div className='mt-auto flex items-center justify-between'>
                <span className='font-display text-lg font-bold text-primary'>
                  {t(`detail.related.items.${service.key}.price`)}
                </span>
                <a
                  href={`/services/${service.key}`}
                  className='flex h-10 w-10 items-center justify-center rounded-full bg-muted text-primary transition-colors hover:bg-primary hover:text-primary-foreground'
                  aria-label={t(`detail.related.items.${service.key}.title`)}
                >
                  <MaterialIcon name='arrow_forward' />
                </a>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
