import { useTranslation } from 'react-i18next'

import { cn } from '~/shared/lib/cn'
import { MaterialIcon } from '~/shared/ui'

type RequestStatus = 'pending' | 'approved' | 'rejected'

interface RecentRequest {
  key: string
  status: RequestStatus
  date: string
  titleKey: string
  shiftKey: string
}

const STATUS_CONFIG: Record<
  RequestStatus,
  { stripClass: string; badgeBg: string; badgeText: string; labelKey: string }
> = {
  pending: {
    stripClass: 'bg-secondary',
    badgeBg: 'bg-secondary/20',
    badgeText: 'text-secondary-foreground',
    labelKey: 'shiftRequest.recent.status.pending'
  },
  approved: {
    stripClass: 'bg-primary',
    badgeBg: 'bg-primary/10',
    badgeText: 'text-primary',
    labelKey: 'shiftRequest.recent.status.approved'
  },
  rejected: {
    stripClass: 'bg-destructive',
    badgeBg: 'bg-destructive/10',
    badgeText: 'text-destructive',
    labelKey: 'shiftRequest.recent.status.rejected'
  }
}

const RECENT_REQUESTS: RecentRequest[] = [
  {
    key: 'req1',
    status: 'pending',
    date: '20/10/2023',
    titleKey: 'shiftRequest.recent.items.req1.title',
    shiftKey: 'shiftRequest.recent.items.req1.shift'
  },
  {
    key: 'req2',
    status: 'approved',
    date: '15/10/2023',
    titleKey: 'shiftRequest.recent.items.req2.title',
    shiftKey: 'shiftRequest.recent.items.req2.shift'
  },
  {
    key: 'req3',
    status: 'rejected',
    date: '05/10/2023',
    titleKey: 'shiftRequest.recent.items.req3.title',
    shiftKey: 'shiftRequest.recent.items.req3.shift'
  }
]

export function ShiftRequestRecentList() {
  const { t } = useTranslation('staff')

  return (
    <div className='h-full rounded-xl border border-border bg-muted p-6'>
      <h2 className='mb-6 flex items-center gap-2 font-display text-xl font-bold'>
        <MaterialIcon name='history' className='text-secondary-foreground' />
        {t('shiftRequest.recent.title')}
      </h2>

      <div className='space-y-4'>
        {RECENT_REQUESTS.map((request) => {
          const config = STATUS_CONFIG[request.status]
          const isRejected = request.status === 'rejected'

          return (
            <div
              key={request.key}
              className={cn(
                'relative overflow-hidden rounded-lg border border-border/50 bg-card p-4 shadow-sm',
                isRejected && 'opacity-75'
              )}
            >
              {/* Left color strip */}
              <div className={cn('absolute left-0 top-0 h-full w-1', config.stripClass)} />

              <div className='mb-2 flex items-start justify-between'>
                <span
                  className={cn(
                    'inline-block rounded px-2 py-1 text-xs font-semibold',
                    config.badgeBg,
                    config.badgeText
                  )}
                >
                  {t(config.labelKey)}
                </span>
                <span className='text-xs text-muted-foreground'>{request.date}</span>
              </div>
              <p className='mb-1 text-base font-semibold'>{t(request.titleKey)}</p>
              <p className='text-sm text-muted-foreground'>{t(request.shiftKey)}</p>
            </div>
          )
        })}
      </div>

      <button
        type='button'
        className='mt-6 w-full rounded-lg py-2 text-center text-sm font-semibold text-primary transition-colors hover:bg-card'
      >
        {t('shiftRequest.recent.viewAll')}
      </button>
    </div>
  )
}
