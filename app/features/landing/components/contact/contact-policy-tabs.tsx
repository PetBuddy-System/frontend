import { useState } from 'react'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { cn } from '~/shared/lib/cn'
import { MaterialIcon } from '~/shared/ui'

type PolicyTab = 'purchase' | 'shipping' | 'return'

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
        <PolicyTabButton active={activeTab === 'return'} onClick={() => setActiveTab('return')}>
          {t('contact.policies.returnTab')}
        </PolicyTabButton>
      </div>

      <div className='p-6 md:p-8'>
        {activeTab === 'purchase' && <PurchasePolicy />}
        {activeTab === 'shipping' && <ShippingPolicy />}
        {activeTab === 'return' && <ReturnPolicy />}
      </div>
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
        <article className='rounded-lg border border-border bg-background p-6 text-center'>
          <MaterialIcon name='verified' className='mb-4 text-[48px] text-primary' filled />
          <h3 className='mb-2 text-xl font-semibold text-foreground'>
            {t('contact.policies.purchaseCards.verified.title')}
          </h3>
          <p className='text-sm leading-6 text-muted-foreground'>
            {t('contact.policies.purchaseCards.verified.description')}
          </p>
        </article>
        <article className='rounded-lg border border-border bg-background p-6 text-center'>
          <MaterialIcon name='star_rate' className='mb-4 text-[48px] text-secondary' filled />
          <h3 className='mb-2 text-xl font-semibold text-foreground'>
            {t('contact.policies.purchaseCards.quality.title')}
          </h3>
          <p className='text-sm leading-6 text-muted-foreground'>
            {t('contact.policies.purchaseCards.quality.description')}
          </p>
        </article>
        <article className='rounded-lg border border-border bg-background p-6 text-center'>
          <MaterialIcon name='support_agent' className='mb-4 text-[48px] text-primary' filled />
          <h3 className='mb-2 text-xl font-semibold text-foreground'>
            {t('contact.policies.purchaseCards.support.title')}
          </h3>
          <p className='text-sm leading-6 text-muted-foreground'>
            {t('contact.policies.purchaseCards.support.description')}
          </p>
        </article>
      </div>

      <p className='text-lg leading-8 text-muted-foreground'>{t('contact.policies.purchaseDescription')}</p>

      <div className='rounded-lg border border-border bg-background p-6'>
        <h4 className='mb-4 text-lg font-semibold text-foreground'>{t('contact.policies.purchaseConditions.title')}</h4>
        <ul className='space-y-2 text-sm text-muted-foreground'>
          {(t('contact.policies.purchaseConditions.items', { returnObjects: true }) as string[]).map((item, idx) => (
            <li key={idx} className='flex items-start gap-2'>
              <MaterialIcon name='check_circle' className='mt-0.5 shrink-0 text-success' />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function ShippingPolicy() {
  const { t } = useTranslation('landing')

  return (
    <div className='space-y-8'>
      <div className='rounded-lg border border-border bg-background p-6'>
        <h3 className='mb-2 text-xl font-semibold text-foreground'>
          {t('contact.policies.shippingHero.title')}
        </h3>
        <p className='text-muted-foreground'>{t('contact.policies.shippingHero.description')}</p>
      </div>

      <div className='grid gap-4 md:grid-cols-3'>
        <article className='flex gap-4 rounded-lg bg-background p-4'>
          <MaterialIcon name='local_shipping' className='text-[32px] text-primary' />
          <div>
            <h4 className='mb-1 text-lg font-semibold text-foreground'>
              {t('contact.policies.shippingItems.fast.title')}
            </h4>
            <p className='text-sm text-muted-foreground'>{t('contact.policies.shippingItems.fast.description')}</p>
          </div>
        </article>
        <article className='flex gap-4 rounded-lg bg-background p-4'>
          <MaterialIcon name='inventory_2' className='text-[32px] text-primary' />
          <div>
            <h4 className='mb-1 text-lg font-semibold text-foreground'>
              {t('contact.policies.shippingItems.safe.title')}
            </h4>
            <p className='text-sm text-muted-foreground'>{t('contact.policies.shippingItems.safe.description')}</p>
          </div>
        </article>
        <article className='flex gap-4 rounded-lg bg-background p-4'>
          <MaterialIcon name='schedule' className='text-[32px] text-primary' />
          <div>
            <h4 className='mb-1 text-lg font-semibold text-foreground'>
              {t('contact.policies.shippingItems.schedule.title')}
            </h4>
            <p className='text-sm text-muted-foreground'>{t('contact.policies.shippingItems.schedule.description')}</p>
          </div>
        </article>
      </div>
    </div>
  )
}

function ReturnPolicy() {
  const { t } = useTranslation('landing')

  return (
    <div className='space-y-6'>
      <p className='text-muted-foreground'>{t('contact.policies.return.intro')}</p>

      <div className='grid gap-6 md:grid-cols-2'>
        <div className='rounded-lg border border-border bg-background p-5'>
          <div className='mb-3 flex items-center gap-2'>
            <MaterialIcon name='check_circle' className='text-[24px] text-success' />
            <h4 className='font-semibold text-foreground'>{t('contact.policies.return.applicable.title')}</h4>
          </div>
          <ul className='space-y-1.5 text-sm text-muted-foreground'>
            {(t('contact.policies.return.applicable.items', { returnObjects: true }) as string[]).map((item, idx) => (
              <li key={idx} className='flex items-start gap-2'>
                <span className='mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground' />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className='rounded-lg border border-destructive/30 bg-destructive/5 p-5'>
          <div className='mb-3 flex items-center gap-2'>
            <MaterialIcon name='cancel' className='text-[24px] text-destructive' />
            <h4 className='font-semibold text-foreground'>{t('contact.policies.return.notApplicable.title')}</h4>
          </div>
          <ul className='space-y-1.5 text-sm text-muted-foreground'>
            {(t('contact.policies.return.notApplicable.items', { returnObjects: true }) as string[]).map((item, idx) => (
              <li key={idx} className='flex items-start gap-2'>
                <span className='mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground' />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className='rounded-lg border border-border bg-background p-5'>
        <h4 className='mb-3 font-semibold text-foreground'>{t('contact.policies.return.fees.title')}</h4>
        <div className='grid gap-4 md:grid-cols-2'>
          <div>
            <p className='mb-2 text-sm font-medium text-foreground'>{t('contact.policies.return.fees.petbuddyFault.title')}</p>
            <p className='text-sm text-muted-foreground'>{t('contact.policies.return.fees.petbuddyFault.description')}</p>
          </div>
          <div>
            <p className='mb-2 text-sm font-medium text-foreground'>{t('contact.policies.return.fees.customerFault.title')}</p>
            <p className='text-sm text-muted-foreground'>{t('contact.policies.return.fees.customerFault.description')}</p>
          </div>
        </div>
      </div>

      <div className='rounded-lg border border-border bg-background p-5'>
        <h4 className='mb-3 font-semibold text-foreground'>{t('contact.policies.return.process.title')}</h4>
        <div className='space-y-3'>
          {(t('contact.policies.return.process.steps', { returnObjects: true }) as { title: string; description: string }[]).map(
            (step, idx) => (
              <div key={idx} className='flex gap-3'>
                <div className='flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground'>
                  {idx + 1}
                </div>
                <div>
                  <p className='text-sm font-medium text-foreground'>{step.title}</p>
                  <p className='text-sm text-muted-foreground'>{step.description}</p>
                </div>
              </div>
            )
          )}
        </div>
      </div>

      <div className='flex items-center gap-2 rounded-lg bg-muted p-4 text-sm text-muted-foreground'>
        <MaterialIcon name='info' className='text-[20px] text-primary' />
        <span>{t('contact.policies.return.note')}</span>
      </div>
    </div>
  )
}
