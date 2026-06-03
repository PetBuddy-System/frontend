import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { cn } from '~/shared/lib/cn'
import { MaterialIcon } from '~/shared/ui'

import { ManagerReturnRequestDetailsModal } from './manager-return-request-details-modal'

type RequestType = 'return' | 'warranty'
type RequestStatus = 'pending' | 'urgent' | 'verified'

interface ReturnRequest {
  key: string
  code: string
  customer: string
  email: string
  productKey: string
  type: RequestType
  status: RequestStatus
}

const RETURN_REQUESTS: ReturnRequest[] = [
  {
    key: 'ret48291',
    code: '#RET-48291',
    customer: 'Alex Nguyen',
    email: 'alex.n@email.com',
    productKey: 'harness',
    type: 'return',
    status: 'pending'
  },
  {
    key: 'war90123',
    code: '#WAR-90123',
    customer: 'Sarah Johnson',
    email: 's.johnson@workmail.com',
    productKey: 'feeder',
    type: 'warranty',
    status: 'urgent'
  },
  {
    key: 'ret48255',
    code: '#RET-48255',
    customer: 'Minh Hoang',
    email: 'mhoang.dev@gmail.com',
    productKey: 'bed',
    type: 'return',
    status: 'verified'
  },
  {
    key: 'ret48102',
    code: '#RET-48102',
    customer: 'Elena Rodriguez',
    email: 'elena_r@icloud.com',
    productKey: 'collar',
    type: 'return',
    status: 'pending'
  }
]

const TYPE_CLASS_BY_TYPE = {
  return: 'bg-secondary/20 text-secondary-foreground',
  warranty: 'bg-primary/10 text-primary'
} as const

const STATUS_CLASS_BY_STATUS = {
  pending: 'bg-secondary text-secondary-foreground',
  urgent: 'bg-destructive text-destructive-foreground',
  verified: 'bg-success text-success-foreground'
} as const

export function ManagerReturnRequestsTable() {
  const { t } = useTranslation('manager')
  const [selectedRequest, setSelectedRequest] = useState<ReturnRequest | null>(null)

  return (
    <>
      <section className='overflow-hidden rounded-xl border border-border bg-card shadow-sm'>
        <div className='overflow-x-auto'>
          <table className='w-full min-w-[1040px] border-collapse text-left'>
            <thead>
              <tr className='border-b border-border bg-muted text-xs font-bold uppercase tracking-wide text-muted-foreground'>
                <th className='px-4 py-3'>{t('returnRequests.table.columns.code')}</th>
                <th className='px-4 py-3'>{t('returnRequests.table.columns.customer')}</th>
                <th className='px-4 py-3'>{t('returnRequests.table.columns.product')}</th>
                <th className='px-4 py-3'>{t('returnRequests.table.columns.type')}</th>
                <th className='px-4 py-3'>{t('returnRequests.table.columns.status')}</th>
                <th className='px-4 py-3 text-right'>{t('returnRequests.table.columns.actions')}</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-border'>
              {RETURN_REQUESTS.map((request) => (
                <tr key={request.code} className='transition-colors hover:bg-muted/60'>
                  <td className='px-4 py-4 font-bold text-primary'>{request.code}</td>
                  <td className='px-4 py-4'>
                    <p className='font-semibold text-card-foreground'>{request.customer}</p>
                    <p className='text-xs text-muted-foreground'>{request.email}</p>
                  </td>
                  <td className='px-4 py-4 text-sm text-muted-foreground'>
                    {t(`returnRequests.products.${request.productKey}`)}
                  </td>
                  <td className='px-4 py-4'>
                    <span
                      className={cn(
                        'inline-flex rounded-full px-3 py-1 text-xs font-bold',
                        TYPE_CLASS_BY_TYPE[request.type]
                      )}
                    >
                      {t(`returnRequests.types.${request.type}`)}
                    </span>
                  </td>
                  <td className='px-4 py-4'>
                    <div className='flex items-center gap-2'>
                      <span className={cn('h-2 w-2 rounded-full', STATUS_CLASS_BY_STATUS[request.status])} />
                      <span
                        className={cn(
                          'text-xs font-bold',
                          request.status === 'pending' && 'text-secondary-foreground',
                          request.status === 'urgent' && 'text-destructive',
                          request.status === 'verified' && 'text-success'
                        )}
                      >
                        {t(`returnRequests.status.${request.status}`)}
                      </span>
                    </div>
                  </td>
                  <td className='px-4 py-4'>
                    <div className='flex justify-end gap-2'>
                      <button
                        type='button'
                        onClick={() => setSelectedRequest(request)}
                        className='inline-flex h-9 items-center justify-center gap-1.5 rounded-full px-3 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-primary'
                      >
                        <MaterialIcon name='visibility' className='text-lg' />
                        {t('returnRequests.actions.view')}
                      </button>
                      <button
                        type='button'
                        className='inline-flex h-9 items-center justify-center gap-1.5 rounded-full bg-primary px-3 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90'
                      >
                        <MaterialIcon name='check' className='text-lg' />
                        {t('returnRequests.actions.approve')}
                      </button>
                      <button
                        type='button'
                        className='inline-flex h-9 items-center justify-center gap-1.5 rounded-full bg-destructive/10 px-3 text-sm font-bold text-destructive transition-colors hover:bg-destructive hover:text-destructive-foreground'
                      >
                        <MaterialIcon name='close' className='text-lg' />
                        {t('returnRequests.actions.reject')}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className='flex flex-col gap-3 border-t border-border bg-muted px-4 py-3 sm:flex-row sm:items-center sm:justify-between'>
          <span className='text-sm text-muted-foreground'>{t('returnRequests.pagination.showing')}</span>
          <div className='flex gap-2'>
            {[1, 2, 3].map((page) => (
              <button
                key={page}
                type='button'
                className={
                  page === 1
                    ? 'flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground'
                    : 'flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-sm font-bold text-muted-foreground hover:text-primary'
                }
              >
                {page}
              </button>
            ))}
          </div>
        </div>
      </section>

      <ManagerReturnRequestDetailsModal request={selectedRequest} onClose={() => setSelectedRequest(null)} />
    </>
  )
}
