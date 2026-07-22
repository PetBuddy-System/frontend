import { useTranslation } from 'react-i18next'

import { formatPrice } from './lib/return-labels'
import type { ReturnRequestResponse } from '~/shared/lib/returns'

export interface ReturnRefundSectionProps {
  detail: ReturnRequestResponse
}

export function ReturnRefundSection({ detail }: ReturnRefundSectionProps) {
  const { t } = useTranslation('returns')

  // Section chỉ render cho RETURN — caller chịu trách nhiệm check.
  const method =
    detail.refundMethod === 'STRIPE_PAYMENT' ? t('list.detail.refund.methodStripe') : t('list.detail.refund.methodBank')

  return (
    <div className='rounded-xl border border-border bg-card p-4 space-y-3'>
      <h5 className='text-xs font-bold uppercase text-muted-foreground tracking-wider border-b border-border pb-1.5'>
        {t('list.detail.refund.title')}
      </h5>
      <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm'>
        <div>
          <span className='text-muted-foreground'>{t('list.detail.refund.method')}</span>{' '}
          <strong className='text-foreground'>{method}</strong>
        </div>
        {detail.refundStatus ? (
          <div>
            <span className='text-muted-foreground'>{t('list.detail.refund.status')}</span>{' '}
            <span className='font-semibold text-primary'>
              {t(`refundStatus.${detail.refundStatus}`, { defaultValue: detail.refundStatus })}
            </span>
          </div>
        ) : null}
        <div>
          <span className='text-muted-foreground'>{t('list.detail.refund.total')}</span>{' '}
          <strong className='text-primary'>{formatPrice(detail.refundAmount)}</strong>
        </div>
      </div>

      {detail.refundMethod === 'BANK_TRANSFER' && (detail.bankName || detail.bankAccountNumber) ? (
        <div className='mt-2 pt-2 border-t border-border/60 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-muted-foreground bg-muted/20 p-2.5 rounded-lg'>
          <div>
            {t('list.detail.refund.bankName')} <strong className='text-foreground'>{detail.bankName || 'N/A'}</strong>
          </div>
          <div>
            {t('list.detail.refund.bankAccount')}{' '}
            <strong className='text-foreground'>{detail.bankAccountNumber || 'N/A'}</strong>
          </div>
          <div>
            {t('list.detail.refund.bankHolder')}{' '}
            <strong className='text-foreground'>{detail.bankAccountHolder || 'N/A'}</strong>
          </div>
        </div>
      ) : null}
    </div>
  )
}
