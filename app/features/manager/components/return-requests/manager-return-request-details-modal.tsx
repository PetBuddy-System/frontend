import { useTranslation } from 'react-i18next'

import { MaterialIcon } from '~/shared/ui'

interface ReturnRequestDetails {
  code: string
  customer: string
}

export interface ManagerReturnRequestDetailsModalProps {
  request: ReturnRequestDetails | null
  onClose: () => void
}

const PROOF_IMAGES = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuATYoEfw3SSI3G2bp1Z2HLwYBnf9ssRI8qIUhyM6oBti7-bZRD23CoKxcCheaIbHX3gqKgCdcHPJX1ydaZ6SRkq9buTkRKlkeDdjcZ1X5Ye86r9y0EqaVSEmiC-hA9hAZWnzC-3EpdXmQJJQPnDCb6OvOT8QM9MLQeqxV03peNcpHzwltb6SiG_Fa9PwWigOvryN5fo9Yb5SbbgI4eVSUsMdxbnBItZ7V8FE7HKiD7qAWnqYAxpXJd-ApXSZBF_69kBkcBANABSSzs',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuD7DlDOOZoYANjcIxQ_kqudbLSDrSP4eU5w2U08xuvc4lHjaTnv3g_Hw7o1g3uI8XD-2oQ-mock-Z_JVTukzAlVFPSrt5cXDadczEGtL_Fahc5slU-gIjry65rI7ngyfa7uOmCdTwVsxtRkzHZgOlNopvPe5MyCBecxLnwI55SO4zdFLXd4sBUcis43kaElc9azRHDm4MRxFdqCIhvHH2nwoFdrMfdAoPeyhIAHTjTu0L2k9t1mKBOdJAa0TT8I96GdMMI43PsdpZo'
] as const

export function ManagerReturnRequestDetailsModal({ request, onClose }: ManagerReturnRequestDetailsModalProps) {
  const { t } = useTranslation('manager')

  if (!request) {
    return null
  }

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
      <button
        type='button'
        aria-label={t('returnRequests.details.close')}
        className='absolute inset-0 bg-foreground/40 backdrop-blur-sm'
        onClick={onClose}
      />
      <section className='relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl border border-border bg-card shadow-xl'>
        <header className='flex items-start justify-between gap-4 border-b border-border bg-muted p-5'>
          <div>
            <div className='flex flex-wrap items-center gap-3'>
              <h2 className='font-display text-xl font-bold text-card-foreground'>
                {t('returnRequests.details.title', { code: request.code })}
              </h2>
              <span className='rounded-full bg-secondary px-3 py-1 text-xs font-bold text-secondary-foreground'>
                {t('returnRequests.status.pending')}
              </span>
            </div>
            <p className='mt-1 text-sm text-muted-foreground'>
              {t('returnRequests.details.submittedBy', { customer: request.customer })}
            </p>
          </div>
          <button
            type='button'
            onClick={onClose}
            className='flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-card hover:text-primary'
          >
            <MaterialIcon name='close' />
          </button>
        </header>

        <div className='min-h-0 flex-1 overflow-y-auto p-5'>
          <div className='grid gap-6 md:grid-cols-2'>
            <div className='space-y-6'>
              <section>
                <h3 className='mb-3 text-xs font-bold uppercase tracking-wide text-primary'>
                  {t('returnRequests.details.reasonTitle')}
                </h3>
                <p className='leading-relaxed text-muted-foreground'>{t('returnRequests.details.reasonText')}</p>
              </section>

              <section className='rounded-xl bg-muted p-4'>
                <h3 className='mb-4 font-bold text-card-foreground'>{t('returnRequests.details.orderInfo')}</h3>
                <div className='grid grid-cols-2 gap-4 text-sm'>
                  <div>
                    <p className='text-xs text-muted-foreground'>{t('returnRequests.details.purchaseDate')}</p>
                    <p className='font-semibold text-card-foreground'>02/10/2023</p>
                  </div>
                  <div>
                    <p className='text-xs text-muted-foreground'>{t('returnRequests.details.totalValue')}</p>
                    <p className='font-semibold text-card-foreground'>45.99 USD</p>
                  </div>
                  <div>
                    <p className='text-xs text-muted-foreground'>{t('returnRequests.details.payment')}</p>
                    <p className='font-semibold text-card-foreground'>Visa 4242</p>
                  </div>
                  <div>
                    <p className='text-xs text-muted-foreground'>{t('returnRequests.details.validity')}</p>
                    <p className='font-semibold text-success'>{t('returnRequests.details.validityValue')}</p>
                  </div>
                </div>
              </section>
            </div>

            <div className='space-y-4'>
              <h3 className='text-xs font-bold uppercase tracking-wide text-primary'>
                {t('returnRequests.details.proofTitle')}
              </h3>
              <div className='grid grid-cols-2 gap-3'>
                {PROOF_IMAGES.map((imageUrl, index) => (
                  <img
                    key={imageUrl}
                    src={imageUrl}
                    alt={t('returnRequests.details.proofAlt', { index: index + 1 })}
                    className='aspect-square rounded-xl border border-border object-cover'
                  />
                ))}
              </div>
              <div className='rounded-xl border border-dashed border-border p-4 text-center'>
                <MaterialIcon name='description' className='mb-2 text-muted-foreground' />
                <p className='text-sm text-muted-foreground'>Hoa_don_goc_48291.pdf</p>
                <button type='button' className='mt-2 text-sm font-bold text-primary hover:underline'>
                  {t('returnRequests.details.download')}
                </button>
              </div>
            </div>
          </div>
        </div>

        <footer className='flex flex-col gap-3 border-t border-border bg-muted p-5 sm:flex-row sm:justify-end'>
          <button
            type='button'
            onClick={onClose}
            className='rounded-full border border-border bg-card px-5 py-2.5 text-sm font-bold text-card-foreground transition-colors hover:bg-muted'
          >
            {t('returnRequests.details.cancel')}
          </button>
          <button
            type='button'
            className='rounded-full bg-destructive px-5 py-2.5 text-sm font-bold text-destructive-foreground transition-opacity hover:opacity-90'
          >
            {t('returnRequests.actions.reject')}
          </button>
          <button
            type='button'
            className='rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90'
          >
            {t('returnRequests.details.approveRefund')}
          </button>
        </footer>
      </section>
    </div>
  )
}
