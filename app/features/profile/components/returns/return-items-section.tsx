import { useTranslation } from 'react-i18next'

import { formatPrice } from './lib/return-labels'
import type { ReturnRequestResponse } from '~/shared/lib/returns'

export interface ReturnItemsSectionProps {
  detail: ReturnRequestResponse
}

export function ReturnItemsSection({ detail }: ReturnItemsSectionProps) {
  const { t } = useTranslation('returns')
  const showRefundColumn = detail.type === 'RETURN'

  return (
    <div className='space-y-2'>
      <h5 className='text-xs font-bold uppercase text-muted-foreground tracking-wider'>
        {t('list.detail.items.title', { count: detail.returnItems.length })}
      </h5>
      <div className='space-y-2'>
        {detail.returnItems.map((item) => (
          <div
            key={item.returnItemId}
            className='flex items-center justify-between gap-4 p-3 rounded-lg border border-border/60 bg-card text-sm'
          >
            <div className='font-semibold text-foreground'>{item.productName}</div>
            <div className='flex items-center gap-6 shrink-0 text-xs'>
              <span className='text-muted-foreground'>
                {t('list.detail.items.quantity')}{' '}
                <strong className='text-foreground'>{item.quantity}</strong>
              </span>
              {showRefundColumn ? (
                <span className='text-muted-foreground'>
                  {t('list.detail.items.refundAmount')}{' '}
                  <strong className='text-primary'>{formatPrice(item.refundAmount)}</strong>
                </span>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
