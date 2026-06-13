import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { cn } from '~/shared/lib/cn'
import { MaterialIcon } from '~/shared/ui'

const FAQ_ITEMS = ['booking', 'delivery', 'returns', 'loyalty', 'vet'] as const

export function ContactFaqSection() {
  const { t } = useTranslation('landing')
  const [openItem, setOpenItem] = useState<(typeof FAQ_ITEMS)[number] | null>('booking')

  return (
    <section className='mt-12 mx-auto w-full max-w-4xl'>
      <h2 className='text-center text-3xl font-bold tracking-tight text-primary md:text-4xl'>
        {t('contact.faq.title')}
      </h2>

      <div className='mt-8 space-y-4'>
        {FAQ_ITEMS.map((itemKey) => {
          const isOpen = openItem === itemKey

          return (
            <article key={itemKey} className='overflow-hidden rounded-xl border border-border bg-card shadow-sm'>
              <button
                type='button'
                onClick={() => setOpenItem(isOpen ? null : itemKey)}
                className='flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition-colors hover:bg-muted/60'
                aria-expanded={isOpen}
              >
                <span className='text-lg font-semibold text-primary md:text-xl'>
                  {t(`contact.faq.items.${itemKey}.question`)}
                </span>
                <MaterialIcon
                  name='keyboard_arrow_down'
                  className={cn('shrink-0 text-primary transition-transform duration-300', isOpen && 'rotate-180')}
                />
              </button>

              <div
                className={cn(
                  'grid transition-[grid-template-rows] duration-300 ease-out',
                  isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                )}
              >
                <div className='overflow-hidden'>
                  <div className='border-t border-border bg-muted/50 px-6 py-5 text-base leading-7 text-muted-foreground'>
                    {t(`contact.faq.items.${itemKey}.answer`)}
                  </div>
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
