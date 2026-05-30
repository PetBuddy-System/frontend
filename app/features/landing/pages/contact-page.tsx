import { ContactHero } from '../components/contact-hero'
import { ContactInfoSection } from '../components/contact-info-section'
import { ContactNewsletter } from '../components/contact-newsletter'
import { ContactPolicyTabs } from '../components/contact-policy-tabs'
import { LandingBottomNav } from '../components/landing-bottom-nav'
import { LandingFab } from '../components/landing-fab'
import { LandingFooter } from '../components/landing-footer'
import { LandingHeader } from '../components/landing-header'

export function ContactPage() {
  return (
    <div className='min-h-screen bg-background text-foreground'>
      <LandingHeader activeItem='contact' />
      <main className='flex flex-col pb-24 md:pb-12'>
        <ContactHero />
        <div className='mx-auto w-full max-w-6xl px-4 py-10 md:px-6 md:py-12'>
          <ContactInfoSection />
          <ContactPolicyTabs />
          <ContactNewsletter />
        </div>
      </main>
      <LandingFooter />
      <LandingBottomNav />
      <LandingFab />
    </div>
  )
}
