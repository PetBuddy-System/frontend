import { useTranslation } from 'react-i18next'

import { SiteBottomNav } from '~/shared/components'
import { SiteFab } from '~/shared/components'
import { SiteFooter } from '~/shared/components'
import { SiteHeader } from '~/shared/components'

import { MaterialIcon } from '~/shared/ui'
import { ServiceDetailContent } from '../components/detail/service-detail-content'
import { ServiceDetailGallery } from '../components/detail/service-detail-gallery'
import { ServiceDetailInfo } from '../components/detail/service-detail-info'
import { ServiceRelatedServices } from '../components/detail/service-related-services'
import { ServiceReviews } from '../components/detail/service-reviews'

export function ServiceDetailPage() {
  const { t } = useTranslation('services')

  return (
    <div className='flex min-h-screen flex-col bg-background text-foreground'>
      <SiteHeader />
      <main className='flex-1 pb-24 md:pb-0'>
        <div className='mx-auto w-full max-w-6xl px-4 py-6 md:px-6'>
          <nav aria-label={t('detail.breadcrumb.label')} className='text-sm text-muted-foreground'>
            <ol className='flex flex-wrap items-center gap-1 md:gap-2'>
              <li>
                <a className='hover:text-primary' href='/'>
                  {t('detail.breadcrumb.home')}
                </a>
              </li>
              <li className='flex items-center gap-1'>
                <MaterialIcon name='chevron_right' className='text-[16px]' />
                <a className='hover:text-primary' href='/services'>
                  {t('detail.breadcrumb.services')}
                </a>
              </li>
              <li className='flex items-center gap-1' aria-current='page'>
                <MaterialIcon name='chevron_right' className='text-[16px]' />
                <span className='font-medium text-foreground'>{t('detail.breadcrumb.current')}</span>
              </li>
            </ol>
          </nav>
        </div>

        <section className='mx-auto w-full max-w-6xl px-4 pb-20 md:px-6'>
          <div className='grid grid-cols-1 items-start gap-10 md:grid-cols-2'>
            <ServiceDetailGallery />
            <ServiceDetailInfo />
          </div>
        </section>

        <ServiceDetailContent />
        <ServiceRelatedServices />
        <ServiceReviews />
      </main>
      <SiteFooter />
      <SiteBottomNav />
      <SiteFab />
    </div>
  )
}
