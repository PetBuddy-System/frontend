import { useTranslation } from 'react-i18next'

import { cn } from '~/shared/lib/cn'

type DisposalRequestStatus = 'pending' | 'approved' | 'rejected'

interface DisposalRecentRequest {
  key: string
  status: DisposalRequestStatus
  timeKey: string
  quantity: string
  code: string
}

const RECENT_REQUESTS: DisposalRecentRequest[] = [
  { key: 'royalCanin', status: 'pending', timeKey: 'today', quantity: '02', code: '#REQ-4921' },
  { key: 'pedigree', status: 'approved', timeKey: 'yesterday', quantity: '05', code: '#REQ-4918' },
  { key: 'whiskas', status: 'rejected', timeKey: 'oct02', quantity: '10', code: '#REQ-4902' },
  { key: 'maneki', status: 'approved', timeKey: 'oct01', quantity: '01', code: '#REQ-4899' }
]

const STATUS_CLASS_BY_STATUS = {
  approved: 'bg-success/10 text-success',
  pending: 'bg-warning/10 text-warning',
  rejected: 'bg-destructive/10 text-destructive'
} as const

export function DisposalRequestRecentList() {
  const { t } = useTranslation('staff')

  return (
    <section className='flex max-h-[38rem] flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm'>
      <div className='flex items-center justify-between border-b border-border p-4'>
        <h2 className='font-display font-bold'>{t('disposalRequest.recent.title')}</h2>
        <button type='button' className='text-sm font-bold text-primary hover:underline'>
          {t('disposalRequest.recent.viewAll')}
        </button>
      </div>
      <div className='min-h-0 flex-1 space-y-3 overflow-y-auto p-4'>
        {RECENT_REQUESTS.map((request) => (
          <article
            key={request.code}
            className={cn(
              'rounded-lg border border-border bg-muted p-4 transition-colors hover:bg-card',
              request.status === 'rejected' && 'opacity-75'
            )}
          >
            <div className='mb-2 flex items-start justify-between gap-3'>
              <span
                className={cn(
                  'rounded px-2 py-1 text-[10px] font-bold uppercase',
                  STATUS_CLASS_BY_STATUS[request.status]
                )}
              >
                {t(`disposalRequest.recent.status.${request.status}`)}
              </span>
              <span className='text-xs text-muted-foreground'>
                {t(`disposalRequest.recent.times.${request.timeKey}`)}
              </span>
            </div>
            <p className='truncate font-bold text-card-foreground'>
              {t(`disposalRequest.recent.items.${request.key}`)}
            </p>
            <div className='mt-2 flex items-center justify-between text-xs text-muted-foreground'>
              <span>{t('disposalRequest.recent.quantity', { value: request.quantity })}</span>
              <span className='italic'>{request.code}</span>
            </div>
          </article>
        ))}
      </div>
      <div className='border-t border-border bg-secondary/20 p-4 text-center'>
        <p className='mb-2 text-xs font-medium text-secondary-foreground'>{t('disposalRequest.recent.supportText')}</p>
        <button
          type='button'
          className='w-full rounded-lg bg-secondary px-4 py-2 text-sm font-bold text-secondary-foreground transition-opacity hover:opacity-90'
        >
          {t('disposalRequest.recent.supportAction')}
        </button>
      </div>
    </section>
  )
}
