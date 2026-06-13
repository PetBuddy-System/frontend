import { useTranslation } from 'react-i18next'

import { cn } from '~/shared/lib/cn'
import { MaterialIcon } from '~/shared/ui'

export interface AdminCreateServiceModalProps {
  isOpen: boolean
  onClose: () => void
}

const WEIGHT_TIERS = ['under5', 'from5To10', 'from10To20', 'over20'] as const

export function AdminCreateServiceModal({ isOpen, onClose }: AdminCreateServiceModalProps) {
  const { t } = useTranslation('admin')

  if (!isOpen) {
    return null
  }

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
      <button
        type='button'
        aria-label={t('serviceManagement.create.close')}
        className='absolute inset-0 bg-foreground/40 backdrop-blur-sm'
        onClick={onClose}
      />

      <section className='relative flex max-h-[calc(100vh-2rem)] w-full max-w-6xl flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-2xl'>
        <header className='flex flex-col gap-4 border-b border-border px-5 py-5 lg:flex-row lg:items-end lg:justify-between'>
          <div>
            <p className='text-xs font-bold uppercase tracking-[0.25em] text-primary'>PetBuddy Ops</p>
            <h2 className='mt-2 font-display text-2xl font-extrabold text-card-foreground md:text-3xl'>
              {t('serviceManagement.create.title')}
            </h2>
            <p className='mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground'>
              {t('serviceManagement.create.subtitle')}
            </p>
          </div>

          <div className='flex flex-wrap gap-3'>
            <button
              type='button'
              onClick={onClose}
              className='inline-flex h-11 items-center justify-center rounded-full border border-border bg-card px-5 text-sm font-bold text-card-foreground transition-colors hover:bg-muted'
            >
              {t('serviceManagement.create.cancel')}
            </button>
            <button
              type='submit'
              form='new-service-form'
              className='inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-ring'
            >
              <MaterialIcon name='save' className='text-lg' />
              {t('serviceManagement.create.save')}
            </button>
          </div>
        </header>

        <div className='min-h-0 flex-1 overflow-y-auto px-5 py-6'>
          <div className='grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_0.9fr]'>
            <article className='rounded-3xl border border-border bg-muted/40 p-6 shadow-sm'>
              <form id='new-service-form' className='space-y-6' onSubmit={(event) => event.preventDefault()}>
                <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                  <label className='space-y-2'>
                    <span className='text-sm font-semibold text-card-foreground'>
                      {t('serviceManagement.create.fields.name')}
                    </span>
                    <input
                      type='text'
                      placeholder={t('serviceManagement.create.placeholders.name')}
                      className='h-12 w-full rounded-2xl border border-border bg-card px-4 text-sm text-card-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-ring'
                    />
                  </label>

                  <label className='space-y-2'>
                    <span className='text-sm font-semibold text-card-foreground'>
                      {t('serviceManagement.create.fields.category')}
                    </span>
                    <select className='h-12 w-full rounded-2xl border border-border bg-card px-4 text-sm text-card-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-ring'>
                      <option>{t('serviceManagement.create.categories.grooming')}</option>
                      <option>{t('serviceManagement.create.categories.hotel')}</option>
                      <option>{t('serviceManagement.create.categories.vet')}</option>
                    </select>
                  </label>
                </div>

                <label className='space-y-2'>
                  <span className='text-sm font-semibold text-card-foreground'>
                    {t('serviceManagement.create.fields.description')}
                  </span>
                  <textarea
                    rows={4}
                    placeholder={t('serviceManagement.create.placeholders.description')}
                    className='w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm text-card-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-ring'
                  />
                </label>

                <section className='rounded-3xl border border-border bg-card p-5'>
                  <div className='mb-4 flex items-center justify-between'>
                    <div>
                      <h3 className='text-lg font-extrabold text-card-foreground'>
                        {t('serviceManagement.create.pricing.title')}
                      </h3>
                      <p className='text-sm text-muted-foreground'>{t('serviceManagement.create.pricing.subtitle')}</p>
                    </div>
                    <span className='rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-primary'>
                      {t('serviceManagement.create.pricing.badge')}
                    </span>
                  </div>

                  <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                    {WEIGHT_TIERS.map((tier, index) => (
                      <label key={tier} className='rounded-2xl border border-border bg-muted/50 p-4'>
                        <span className='mb-2 block text-xs font-bold uppercase tracking-wide text-muted-foreground'>
                          {t(`serviceManagement.create.pricing.tiers.${tier}`)}
                        </span>
                        <span className='relative block'>
                          <input
                            type='number'
                            defaultValue={index === 0 ? 250000 : 350000 + index * 50000}
                            className='h-12 w-full rounded-xl border border-border bg-card px-4 pr-14 text-base font-semibold text-card-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring'
                          />
                          <span className='absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground'>
                            {t('serviceManagement.create.pricing.currency')}
                          </span>
                        </span>
                      </label>
                    ))}
                  </div>
                </section>

                <label className='flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4'>
                  <span className='text-sm font-semibold text-card-foreground'>
                    {t('serviceManagement.create.fields.status')}
                  </span>
                  <input
                    type='checkbox'
                    defaultChecked
                    className='h-5 w-5 rounded border-border text-primary focus:ring-primary'
                  />
                </label>
              </form>
            </article>

            <aside className='space-y-6'>
              <section className='rounded-3xl border border-border bg-card p-6 shadow-sm'>
                <h3 className='text-base font-extrabold text-card-foreground'>
                  {t('serviceManagement.create.media.title')}
                </h3>
                <p className='mt-1 text-sm text-muted-foreground'>{t('serviceManagement.create.media.subtitle')}</p>
                <button
                  type='button'
                  className='mt-5 flex aspect-square w-full flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-muted/70 text-center transition hover:border-primary hover:bg-primary/5'
                >
                  <MaterialIcon name='add_photo_alternate' className='text-4xl text-primary' />
                  <span className='mt-3 text-sm font-semibold text-card-foreground'>
                    {t('serviceManagement.create.media.uploadLabel')}
                  </span>
                  <span className='mt-1 text-xs uppercase tracking-[0.2em] text-muted-foreground'>
                    {t('serviceManagement.create.media.hint')}
                  </span>
                </button>
              </section>

              <section className='rounded-3xl bg-primary p-6 text-primary-foreground shadow-sm'>
                <MaterialIcon name='lightbulb' className='text-2xl' />
                <h3 className='mt-3 text-base font-extrabold'>{t('serviceManagement.create.tip.title')}</h3>
                <p className='mt-2 text-sm leading-relaxed text-primary-foreground/90'>
                  {t('serviceManagement.create.tip.text')}
                </p>
              </section>

              <section className='rounded-3xl border border-border bg-card p-6 shadow-sm'>
                <div className='flex items-center gap-3'>
                  <div
                    className={cn(
                      'flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground'
                    )}
                  >
                    <MaterialIcon name='pets' className='text-2xl' />
                  </div>
                  <div>
                    <p className='text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground'>
                      {t('serviceManagement.create.accent.label')}
                    </p>
                    <h3 className='text-lg font-extrabold text-card-foreground'>
                      {t('serviceManagement.create.accent.title')}
                    </h3>
                  </div>
                </div>
                <p className='mt-4 text-sm text-muted-foreground'>{t('serviceManagement.create.accent.text')}</p>
              </section>
            </aside>
          </div>
        </div>
      </section>
    </div>
  )
}
