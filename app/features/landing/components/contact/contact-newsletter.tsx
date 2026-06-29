import { useState } from 'react'
import { useTranslation } from 'react-i18next'

const NEWSLETTER_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAmvOxtQZya0Y3W8G1PudpXKRo1BQeasT8BLi0l7OWdjd90iuRfulkKNAVqVqjyHFdg5hbl7z0yxBXAmcsUI_fWzBpYaZhVWtmhnMdBOY-Th7PNs0D5C44vtFV30HCJ9c29idXxFk-J44_XwUTBhK-E_Q8-XkeSyw0mZONZJUnh1ga0b8iLr5IR6CNxnJr4NwYNCGIzRB1mellqjmyMFRH2u78fmotXfeg2UtR2fmod9wQGWz8647oAcXXOh2g3bscmmRfHrpQS4VA'

export function ContactNewsletter() {
  const { t } = useTranslation('landing')
  const [submitted, setSubmitted] = useState(false)

  return (
    <section className='mt-12 grid items-center gap-8 overflow-hidden rounded-lg bg-secondary/10 p-8 md:grid-cols-12 md:p-12'>
      <div className='md:col-span-7'>
        <h2 className='text-3xl font-bold tracking-normal text-primary md:text-4xl'>{t('contact.newsletter.title')}</h2>
        <p className='mt-4 max-w-2xl text-lg leading-8 text-muted-foreground'>{t('contact.newsletter.description')}</p>
        <form
          className='mt-8 flex max-w-xl flex-col gap-4 sm:flex-row'
          onSubmit={(event) => {
            event.preventDefault()
            setSubmitted(true)
          }}
        >
          <input
            className='flex-1 rounded-full border border-border bg-background px-6 py-4 text-foreground outline-none transition-shadow focus:ring-2 focus:ring-ring'
            placeholder={t('contact.newsletter.placeholder')}
            type='email'
            required
          />
          <button className='rounded-full bg-primary px-8 py-4 font-semibold text-primary-foreground transition-opacity hover:opacity-90'>
            {submitted ? t('contact.newsletter.submitted') : t('contact.newsletter.submit')}
          </button>
        </form>
      </div>

      <div className='relative md:col-span-5'>
        <div className='aspect-square overflow-hidden rounded-full border-8 border-card shadow-xl'>
          <img src={NEWSLETTER_IMAGE} alt={t('contact.newsletter.imageAlt')} className='h-full w-full object-cover' />
        </div>
      </div>
    </section>
  )
}
