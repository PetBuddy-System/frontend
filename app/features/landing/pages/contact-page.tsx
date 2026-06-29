import { ContactFaqSection } from '../components/contact/contact-faq-section'
import { ContactHero } from '../components/contact/contact-hero'
import { ContactInfoSection } from '../components/contact/contact-info-section'
import { ContactNewsletter } from '../components/contact/contact-newsletter'
import { ContactPolicyTabs } from '../components/contact/contact-policy-tabs'
import { SiteBottomNav, SiteFab, SiteFooter, SiteHeader } from '~/shared/components'

export function ContactPage() {
  return (
    <div className='min-h-screen bg-background text-foreground'>
      <SiteHeader activeItem='contact' />
      <main className='flex flex-col pb-24 md:pb-12'>
        <ContactHero />
        <div className='mx-auto w-full max-w-6xl px-4 py-10 md:px-6 md:py-12'>
          <ContactInfoSection />
          <ContactPolicyTabs />
          <ContactFaqSection />
          <ContactNewsletter />
        </div>
      </main>
      <SiteFooter />
      <SiteBottomNav />
      <SiteFab />
    </div>
  )
}
