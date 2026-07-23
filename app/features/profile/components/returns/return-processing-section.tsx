import { useTranslation } from 'react-i18next'
import { MaterialIcon } from '~/shared/ui'

import { formatReturnDateTime } from './lib/return-labels'
import type { ReturnRequestResponse } from '~/shared/lib/returns'

export interface ReturnProcessingSectionProps {
  detail: ReturnRequestResponse
}

export function ReturnProcessingSection({ detail }: ReturnProcessingSectionProps) {
  const { t } = useTranslation('returns')

  // Section chỉ render khi đã có processedBy — caller chịu trách nhiệm check.
  if (!detail.processedBy && !detail.address) return null

  return (
    <div className='rounded-xl border border-border bg-card p-4 space-y-2'>
      <h5 className='text-xs font-bold uppercase text-muted-foreground tracking-wider border-b border-border pb-1.5'>
        {t('list.detail.processing.title')}
      </h5>
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm'>
        {detail.processedBy ? (
          <div>
            <span className='text-muted-foreground'>{t('list.detail.processing.processedBy')}</span>{' '}
            <strong className='text-foreground'>{detail.processedBy.fullName}</strong>
          </div>
        ) : null}
        {detail.processedAt ? (
          <div>
            <span className='text-muted-foreground'>{t('list.detail.processing.processedAt')}</span>{' '}
            <span className='text-foreground'>{formatReturnDateTime(detail.processedAt)}</span>
          </div>
        ) : null}
        {detail.completedAt ? (
          <div>
            <span className='text-muted-foreground'>{t('list.detail.processing.completedAt')}</span>{' '}
            <span className='text-foreground'>{formatReturnDateTime(detail.completedAt)}</span>
          </div>
        ) : null}
      </div>
      {detail.address ? (
        <div className='mt-2 pt-2 border-t border-border/60'>
          <span className='text-muted-foreground block mb-1'>{t('list.detail.processing.addressLabel')}</span>
          <p className='bg-muted/20 p-2 rounded border border-border text-sm text-foreground font-medium flex items-start gap-2'>
            <MaterialIcon name='location_on' className='text-primary mt-0.5' />
            {detail.address}
          </p>
        </div>
      ) : null}
      {detail.staffNote ? (
        <div className='mt-2 pt-2 border-t border-border/60'>
          <span className='text-muted-foreground block mb-1'>{t('list.detail.processing.staffNote')}</span>
          <p className='bg-muted/20 p-2 rounded border border-border text-sm text-foreground'>{detail.staffNote}</p>
        </div>
      ) : null}
    </div>
  )
}
