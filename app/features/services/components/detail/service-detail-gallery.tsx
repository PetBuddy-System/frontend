import { useTranslation } from 'react-i18next'

import { cn } from '~/shared/lib/cn'

const HERO_IMAGE_URL =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDNK_sq44v5FI1SVEftR73mfN1yfg8xzkbS0XUiSitiTkbg7pHcOgurQ45lEnB4JJlbX-XbGNdsGICGSMG-iHad5-cJE6ci-H-JRbOvfXGsTB2Nqu6PVh74fZ-3zFzoWZppRsFxP97ApwosWDgBtBgVjAd1y63ctLqe0K8E_ymYm_Q_zWUNF29aY_ZDZ3dNwNnlPvipFlje-1dCskaVzgTBe01yXvJ1NxklQkGRdjZwa-C586qfRguYwe-DoPzC6GQGpSX659PgLbc'

const THUMBNAILS = [
  {
    key: 'bath',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCOJfJw_UqEltpFSQGjNb2Nz6rlezyYsQY8ttc7uI_XVQeArW2unMej-SLbV7fk5ORgMEG4xSRvZXft-SKFXW8WafuRcgDOcn55nCfX5_iYF6OzNyjSfZ1pWhUCsp1bF--T-iFH_wDviJoAWva7SlMWuHDmhuBb4MgqbZ8qCZPgGEHa_Ijb1-sd0Q0G4LEQ2Fo_xNhLonjn3Esz-aDD30ii6pI_va2Plo938MT4E3P57VFt-H47t2yBFNKam6zno8N9nqMVNHkpC0c'
  },
  {
    key: 'dry',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCxjV1vKID9R7TlqASNULCDY1oAG3LK7Nf-qQ0wCSQBs34WMs_sUDAfjb31EE3D1JndFTV_NmD00N48MANy3ktokIw9-DB34_2YOkzRXTt49sKyiM06Qx91G_D81kf3ekGhnAjkBxRS_ukbOZu69P7v9chlQXjtkNchdusr78KheWwCdOW2DNIOJEkM4sPTgrkAM9JMrFObwzNdc_8XKPBEl4-0ObfvDGIIA2SPeoSKctVlFgdrnVcdUa-8JbHDFWy_CdpPJKdvIhw'
  },
  {
    key: 'finish',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCPBlw3-Xgx3SMxNhPbR45C3pzBdGUeLFbGTLF_B76VYp954LL7Ije_nd3eQgo72OwSZHCxlInP8kxneJEtU2iwW6nTelEi5Sja7cPi8XgGxLTtWFqg1bMgdIUsVVw9YXQEmYY21aUh6jyI54DjmHpiiS2Rk8SufpSvhr_wrVSt0u1jbPwwUyhXpnMiqxPJUp3ACF3406Xban-Wqx8D4YmfpZ3N0mAzMqCPDJ4QUVF_aUX0hjObG622t8iwD-IJ4BwgNuNCDkHNBsw'
  }
] as const

export function ServiceDetailGallery() {
  const { t } = useTranslation('services')

  return (
    <div className='flex flex-col gap-4'>
      <div className='group relative aspect-square overflow-hidden rounded-2xl bg-muted'>
        <img src={HERO_IMAGE_URL} alt={t('detail.gallery.heroAlt')} className='h-full w-full object-cover' />
        <span className='absolute left-4 top-4 rounded-full bg-secondary px-3 py-1 text-sm font-bold text-secondary-foreground'>
          {t('detail.badge')}
        </span>
      </div>

      <div className='grid grid-cols-4 gap-4'>
        {THUMBNAILS.map((thumbnail, index) => (
          <button
            key={thumbnail.key}
            type='button'
            aria-label={t(`detail.gallery.thumbnails.${thumbnail.key}`)}
            className={cn(
              'aspect-square overflow-hidden rounded-lg border bg-muted transition-colors',
              index === 0
                ? 'border-2 border-primary'
                : 'border-border opacity-70 hover:border-primary hover:opacity-100'
            )}
          >
            <img
              src={thumbnail.imageUrl}
              alt={t(`detail.gallery.thumbnails.${thumbnail.key}`)}
              className='h-full w-full object-cover'
            />
          </button>
        ))}
      </div>
    </div>
  )
}
