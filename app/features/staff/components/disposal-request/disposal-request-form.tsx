import { type FormEvent, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { MaterialIcon } from '~/shared/ui'

const PRODUCT_IMAGE_URL =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAPf9zW96UHISp14C5BKvwWmaqM6DVzvPCwWAsCaArZCwF_1S1_-hPgRvyG-il-mczzIQ5YOHk424xnMT9_wT36dtFrqnEY_kktTXY70affhFB3qGEV5bT2GnrcnLhe5eh2bNbCw_Yg8dyKAIGOS-KLspuzwcExRtOihkn1EFZTXpClCVAV5yym7EVeBPmEDqRozbxz8CyOM6t3QW1knKs7LMHStsfVXF90mwiR9iG59x6G_kyt6I3_pDZM8HDu1qX2iwgpAH6P0mI'

const EVIDENCE_IMAGE_URL =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBXwoAP17_odQKZJIQr2LnyC7NlJgALsSeCMVStS25uOYzguGmAraxFYlBOzrBb0gZ4EemrBFSsk19NwvxbwWWs1y3zx2YuX9dwCi8befNZ7DcNNtjOv7IqM_JehHGw6H5giUlHkx05N076hAL61zu79EsK3_IBaWsbDMBBVUZbQeWvb61EHHyV8xU5ge71UXuY-CH1KqLJW4Qhk5RRZjcYato5hyrK4x8jay0sVmgbpDHAXc4yjtswXZb1ZPjKchTYpNMx6oErasM'

export function DisposalRequestForm() {
  const { t } = useTranslation('staff')
  const [isToastVisible, setIsToastVisible] = useState(false)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsToastVisible(true)
    window.setTimeout(() => setIsToastVisible(false), 3000)
    event.currentTarget.reset()
  }

  return (
    <>
      <section className='rounded-xl border border-border bg-card p-5 shadow-sm md:p-6'>
        <form className='space-y-6' onSubmit={handleSubmit}>
          <div className='space-y-2'>
            <label className='block text-sm font-bold text-muted-foreground'>
              {t('disposalRequest.form.productLabel')}
            </label>
            <div className='relative'>
              <MaterialIcon name='search' className='absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground' />
              <input
                className='h-11 w-full rounded-lg border border-input bg-card pl-10 pr-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring'
                placeholder={t('disposalRequest.form.productPlaceholder')}
                type='search'
              />
            </div>

            <div className='mt-4 grid gap-4 rounded-lg border border-border bg-muted p-4 sm:grid-cols-2'>
              <div className='flex items-center gap-3'>
                <img
                  src={PRODUCT_IMAGE_URL}
                  alt={t('disposalRequest.form.selectedProduct.imageAlt')}
                  className='h-12 w-12 rounded-lg border border-border bg-card object-cover'
                />
                <div>
                  <p className='font-bold text-card-foreground'>{t('disposalRequest.form.selectedProduct.name')}</p>
                  <p className='text-xs text-muted-foreground'>{t('disposalRequest.form.selectedProduct.sku')}</p>
                </div>
              </div>
              <div className='flex flex-col justify-center sm:text-right'>
                <p className='text-xs text-muted-foreground'>{t('disposalRequest.form.selectedProduct.stockLabel')}</p>
                <p className='font-display text-xl font-bold text-primary'>
                  {t('disposalRequest.form.selectedProduct.stockValue')}
                </p>
              </div>
            </div>
          </div>

          <div className='grid gap-5 md:grid-cols-2'>
            <div className='space-y-2'>
              <label className='block text-sm font-bold text-muted-foreground'>
                {t('disposalRequest.form.reasonLabel')}
              </label>
              <select className='h-11 w-full rounded-lg border border-input bg-card px-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring'>
                <option value=''>{t('disposalRequest.form.reasonPlaceholder')}</option>
                <option value='expired'>{t('disposalRequest.form.reasons.expired')}</option>
                <option value='damaged'>{t('disposalRequest.form.reasons.damaged')}</option>
                <option value='quality'>{t('disposalRequest.form.reasons.quality')}</option>
                <option value='other'>{t('disposalRequest.form.reasons.other')}</option>
              </select>
            </div>
            <div className='space-y-2'>
              <label className='block text-sm font-bold text-muted-foreground'>
                {t('disposalRequest.form.quantityLabel')}
              </label>
              <input
                className='h-11 w-full rounded-lg border border-input bg-card px-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring'
                placeholder='0'
                type='number'
              />
            </div>
          </div>

          <div className='grid gap-5 md:grid-cols-2'>
            <div className='space-y-2'>
              <label className='block text-sm font-bold text-muted-foreground'>
                {t('disposalRequest.form.batchLabel')}
              </label>
              <input
                className='h-11 w-full rounded-lg border border-input bg-card px-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring'
                placeholder={t('disposalRequest.form.batchPlaceholder')}
                type='text'
              />
            </div>
            <div className='space-y-2'>
              <label className='block text-sm font-bold text-muted-foreground'>
                {t('disposalRequest.form.expiryDateLabel')}
              </label>
              <input
                className='h-11 w-full rounded-lg border border-input bg-card px-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring'
                type='date'
              />
            </div>
          </div>

          <div className='space-y-2'>
            <label className='block text-sm font-bold text-muted-foreground'>
              {t('disposalRequest.form.evidenceLabel')}
            </label>
            <button
              type='button'
              className='flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted p-8 text-center transition-colors hover:bg-card'
            >
              <MaterialIcon name='add_a_photo' className='mb-2 text-4xl text-muted-foreground' />
              <span className='font-semibold text-muted-foreground'>{t('disposalRequest.form.uploadTitle')}</span>
              <span className='mt-1 text-xs text-muted-foreground'>{t('disposalRequest.form.uploadHint')}</span>
            </button>
            <div className='mt-3 flex gap-3'>
              <div className='relative h-20 w-20 overflow-hidden rounded-lg border border-border'>
                <img
                  src={EVIDENCE_IMAGE_URL}
                  alt={t('disposalRequest.form.evidenceAlt')}
                  className='h-full w-full object-cover'
                />
                <button
                  type='button'
                  aria-label={t('disposalRequest.form.removeEvidence')}
                  className='absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-sm'
                >
                  <MaterialIcon name='close' className='text-[12px]' />
                </button>
              </div>
            </div>
          </div>

          <div className='space-y-2'>
            <label className='block text-sm font-bold text-muted-foreground'>
              {t('disposalRequest.form.descriptionLabel')}
            </label>
            <textarea
              className='w-full resize-none rounded-lg border border-input bg-card px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring'
              placeholder={t('disposalRequest.form.descriptionPlaceholder')}
              rows={4}
            />
          </div>

          <div className='flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:justify-end'>
            <button
              type='button'
              className='rounded-full px-6 py-2.5 text-sm font-bold text-muted-foreground transition-colors hover:bg-muted'
            >
              {t('disposalRequest.form.cancel')}
            </button>
            <button
              type='submit'
              className='inline-flex items-center justify-center gap-2 rounded-full bg-primary px-7 py-2.5 text-sm font-bold text-primary-foreground shadow-sm transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-ring'
            >
              <MaterialIcon name='send' className='text-lg' />
              {t('disposalRequest.form.submit')}
            </button>
          </div>
        </form>
      </section>

      {isToastVisible && (
        <div className='fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl bg-card px-5 py-4 text-card-foreground shadow-xl ring-1 ring-border'>
          <MaterialIcon name='check_circle' filled className='text-success' />
          <div>
            <p className='text-sm font-bold'>{t('disposalRequest.toast.title')}</p>
            <p className='text-xs text-muted-foreground'>{t('disposalRequest.toast.description')}</p>
          </div>
        </div>
      )}
    </>
  )
}
