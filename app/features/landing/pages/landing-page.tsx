import { LandingHero } from '../components/home/landing-hero'
import { LandingProducts } from '../components/home/landing-products'
import { LandingServices } from '../components/home/landing-services'
import { LandingTrust } from '../components/home/landing-trust'
import { SiteBottomNav, SiteFab, SiteFooter, SiteHeader } from '~/shared/components'

export function LandingPage() {
  return (
    <div className='min-h-screen bg-background text-foreground'>
      <SiteHeader />
      <main className='flex flex-col pb-24 md:pb-0'>
        <LandingHero />
        <LandingServices />
        <LandingProducts />
        <LandingTrust />
      </main>
      <SiteFooter />
      <SiteBottomNav />
      <SiteFab />
    </div>
  )
}
