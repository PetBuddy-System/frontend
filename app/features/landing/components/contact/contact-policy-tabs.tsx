import { useState } from 'react'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { cn } from '~/shared/lib/cn'
import { MaterialIcon } from '~/shared/ui'

const SHIPPING_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCpsddTwLFtkPe8ybOK0jF_2QSMloRzZG8jO4I9ba4SUWxmChBZ46TulfvI_pUF32shaVBjGG6krAmwRoRNhE-oOND5RygGh6EY03uL1-U9cTIqpegNxrhXT_xEdV1FmqphuT0gm5JljB5lSFbyp-rIqwHI_gguwWEMG2LylTuOa4jYguGB9q9d5Tf72fdoK2aU_6lIMgSJ1q0AdM3s9kQpb66WUgrxxf8YpQtg3sHCU9hxj9UlYw7kRd-mmpxLK0IsH09h0vzMBok'

const PURCHASE_CARDS = [
  { key: 'verified', icon: 'verified', tone: 'primary' },
  { key: 'quality', icon: 'star_rate', tone: 'secondary' },
  { key: 'support', icon: 'support_agent', tone: 'primary' }
] as const

const SHIPPING_ITEMS = [
  { key: 'fast', icon: 'local_shipping' },
  { key: 'safe', icon: 'inventory_2' },
  { key: 'schedule', icon: 'schedule' }
] as const

type PolicyTab = 'purchase' | 'shipping'

export function ContactPolicyTabs() {
  const { t } = useTranslation('landing')
  const [activeTab, setActiveTab] = useState<PolicyTab>('purchase')

  return (
    <section className='overflow-hidden rounded-lg border border-border bg-card shadow-sm'>
      <div className='flex border-b border-border bg-muted'>
        <PolicyTabButton active={activeTab === 'purchase'} onClick={() => setActiveTab('purchase')}>
          {t('contact.policies.purchaseTab')}
        </PolicyTabButton>
        <PolicyTabButton active={activeTab === 'shipping'} onClick={() => setActiveTab('shipping')}>
          {t('contact.policies.shippingTab')}
        </PolicyTabButton>
      </div>

      <div className='p-6 md:p-8'>{activeTab === 'purchase' ? <PurchasePolicy /> : <ShippingPolicy />}</div>
    </section>
  )
}

interface PolicyTabButtonProps {
  active: boolean
  children: ReactNode
  onClick: () => void
}

function PolicyTabButton({ active, children, onClick }: PolicyTabButtonProps) {
  return (
    <button
      type='button'
      onClick={onClick}
      className={cn(
        'border-b-2 px-5 py-4 text-left text-lg font-semibold transition-colors md:px-8',
        active
          ? 'border-primary text-primary'
          : 'border-transparent text-muted-foreground hover:bg-background hover:text-foreground'
      )}
    >
      {children}
    </button>
  )
}

function PurchasePolicy() {
  const { t } = useTranslation('landing')

  return (
    <div className='space-y-8'>
      <div className='grid gap-6 md:grid-cols-3'>
        {PURCHASE_CARDS.map((card) => (
          <article key={card.key} className='rounded-lg border border-border bg-background p-6 text-center'>
            <MaterialIcon
              name={card.icon}
              className={cn('mb-4 text-[48px]', card.tone === 'secondary' ? 'text-secondary' : 'text-primary')}
              filled
            />
            <h3 className='mb-2 text-xl font-semibold text-foreground'>
              {t(`contact.policies.purchaseCards.${card.key}.title`)}
            </h3>
            <p className='text-sm leading-6 text-muted-foreground'>
              {t(`contact.policies.purchaseCards.${card.key}.description`)}
            </p>
          </article>
        ))}
      </div>

      <p className='text-lg leading-8 text-muted-foreground'>{t('contact.policies.purchaseDescription')}</p>
    </div>
  )
}

function ShippingPolicy() {
  const { t } = useTranslation('landing')

  return (
    <div className='grid gap-8 md:grid-cols-2'>
      <div className='group relative aspect-video overflow-hidden rounded-lg bg-muted'>
        <img
          src={SHIPPING_IMAGE}
          alt={t('contact.policies.shippingHero.imageAlt')}
          className='h-full w-full object-cover transition-transform duration-500 group-hover:scale-105'
        />
        <div className='absolute inset-0 flex flex-col justify-end bg-primary/75 p-6'>
          <h3 className='text-2xl font-semibold text-primary-foreground'>{t('contact.policies.shippingHero.title')}</h3>
          <p className='mt-2 text-sm leading-6 text-primary-foreground/85'>
            {t('contact.policies.shippingHero.description')}
          </p>
        </div>
      </div>

      <div className='space-y-4'>
        {SHIPPING_ITEMS.map((item) => (
          <article key={item.key} className='flex gap-4 rounded-lg bg-background p-4'>
            <MaterialIcon name={item.icon} className='text-[32px] text-primary' />
            <div>
              <h4 className='mb-1 text-xl font-semibold text-foreground'>
                {t(`contact.policies.shippingItems.${item.key}.title`)}
              </h4>
              <p className='text-sm leading-6 text-muted-foreground'>
                {t(`contact.policies.shippingItems.${item.key}.description`)}
              </p>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
