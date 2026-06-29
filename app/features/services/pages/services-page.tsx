import { SiteBottomNav } from '~/shared/components'
import { SiteFab } from '~/shared/components'
import { SiteFooter } from '~/shared/components'
import { SiteHeader } from '~/shared/components'

import { ServicesCombo } from '../components/listing/services-combo'
import { ServicesGallery } from '../components/listing/services-gallery'
import { ServicesHero } from '../components/listing/services-hero'
import { ServicesIndividual } from '../components/listing/services-individual'
import { ServicesPriceBoard } from '../components/listing/services-price-board'

export function ServicesPage() {
  return (
    <div className='flex min-h-screen flex-col bg-background text-foreground'>
      <SiteHeader />
      <main className='flex-1 pb-24 md:pb-0'>
        <ServicesHero />
        <ServicesIndividual />
        <ServicesCombo />
        <ServicesPriceBoard />
        <ServicesGallery />
      </main>
      <SiteFooter />
      <SiteBottomNav />
      <SiteFab />
    </div>
  )
}
