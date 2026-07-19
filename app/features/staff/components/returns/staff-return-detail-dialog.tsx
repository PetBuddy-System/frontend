import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { MaterialIcon } from '~/shared/ui'
import { cn } from '~/shared/lib/cn'
import type { ManagementReturnResponse, ReturnShipperResponse } from '~/shared/lib/returns'
import {
  updateCoordinatorReturnStatusApi,
  updateShipperReturnStatusApi,
  fetchAvailableShippersApi,
  assignShipperApi
} from '../../services/returns/returns-api'
import { useAuth } from '~/providers/auth-provider'
import { ReturnTimeline } from '~/shared/components/return-timeline'

export interface StaffReturnDetailDialogProps {
  returnRequest: ManagementReturnResponse
  onClose: () => void
  onSuccess: () => void
}

export function StaffReturnDetailDialog({
  returnRequest,
  onClose,
  onSuccess
}: StaffReturnDetailDialogProps) {
  const { t } = useTranslation('staff')
  const { user } = useAuth()
  const staffTask = user?.staffTask

  const [staffNote, setStaffNote] = useState(returnRequest.staffNote || '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const [isAssigning, setIsAssigning] = useState(false)
  const [availableShippers, setAvailableShippers] = useState<ReturnShipperResponse[]>([])
  const [isLoadingShippers, setIsLoadingShippers] = useState(false)
  const [selectedShipperId, setSelectedShipperId] = useState<string>('')

  function getStatusBadgeClassName(status: string) {
    switch (status) {
      case 'PENDING':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
      case 'APPROVED':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
      case 'PICKING_UP':
      case 'READY_TO_DELIVER':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400'
      case 'PICKED_UP':
      case 'DELIVERING':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
      case 'RETURNED_TO_STORE':
        return 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400'
      case 'REJECTED':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400'
      case 'CANCELLED':
        return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400'
      case 'COMPLETED':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
      default:
        return 'bg-muted text-muted-foreground'
    }
  }

  function getStatusLabel(status: string) {
    switch (status) {
      case 'PENDING':
        return t('returns.stats.pending')
      case 'APPROVED':
        return t('returns.stats.approved')
      case 'PICKING_UP':
        return t('returns.stats.pickingUp')
      case 'PICKED_UP':
        return t('returns.stats.pickedUp')
      case 'RETURNED_TO_STORE':
        return t('returns.stats.returnedToStore')
      case 'READY_TO_DELIVER':
        return t('returns.stats.readyToDeliver')
      case 'DELIVERING':
        return t('returns.stats.delivering')
      case 'REJECTED':
        return t('returns.stats.rejected')
      case 'CANCELLED':
        return t('returns.stats.cancelled')
      case 'COMPLETED':
        return t('returns.stats.completed')
      default:
        return status
    }
  }

  function getTypeLabel(type: string) {
    return t(`returns.type.${type}`, type)
  }

  function getRefundStatusLabel(status: string | undefined | null) {
    if (!status) return '—'
    return t(`returns.refundStatus.${status}`, status)
  }

  function getRefundMethodLabel(method: string) {
    return t(`returns.refundMethod.${method}`, method)
  }

  function getReasonLabel(reason: string) {
    return t(`returns.reason.${reason}`, reason)
  }

  function formatPrice(value: number) {
    return `${new Intl.NumberFormat('vi-VN').format(value)}đ`
  }

  function formatDate(dateString?: string | null) {
    if (!dateString) return '—'
    const d = new Date(dateString)
    if (isNaN(d.getTime())) return dateString
    const dd = String(d.getDate()).padStart(2, '0')
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const yyyy = d.getFullYear()
    const hh = String(d.getHours()).padStart(2, '0')
    const min = String(d.getMinutes()).padStart(2, '0')
    return `${hh}:${min} ${dd}/${mm}/${yyyy}`
  }

  async function handleAssignShipper() {
    if (!selectedShipperId) return
    setIsSubmitting(true)
    setErrorMessage(null)
    try {
      const res = await assignShipperApi(returnRequest.returnRequestId, selectedShipperId)
      if (res.success) {
        setIsAssigning(false)
        onSuccess()
      } else {
        setErrorMessage(res.message || t('returns.detail.errorAssign'))
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : t('returns.detail.errorAssign'))
    } finally {
      setIsSubmitting(false)
    }
  }

  async function loadShippers() {
    setIsAssigning(true)
    setIsLoadingShippers(true)
    setErrorMessage(null)
    try {
      const res = await fetchAvailableShippersApi()
      if (res.success) {
        setAvailableShippers(res.data)
      } else {
        setErrorMessage(res.message || t('returns.detail.errorLoadShippers'))
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : t('returns.detail.errorLoadShippers'))
    } finally {
      setIsLoadingShippers(false)
    }
  }

  async function handleUpdateStatus(
    nextStatus: string
  ) {
    if (nextStatus === 'ASSIGN_SHIPPER') {
      loadShippers()
      return
    }

    if (nextStatus === 'REJECTED' && !staffNote.trim()) {
      setErrorMessage(t('returns.detail.requiredNote'))
      return
    }

    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      const task = staffTask as string | undefined
      const isCoordinator = task === 'COORDINATOR' || task === 'MANAGER' || task === 'ADMIN' || user?.role === 'ADMIN'
      const updateApi = isCoordinator ? updateCoordinatorReturnStatusApi : updateShipperReturnStatusApi
      const res = await updateApi(returnRequest.returnRequestId, nextStatus, staffNote)
      if (res.success) {
        onSuccess()
      } else {
        setErrorMessage(res.message || t('returns.detail.errorUpdate'))
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : t('returns.detail.errorUpdate'))
    } finally {
      setIsSubmitting(false)
    }
  }

  function getAvailableActions() {
    if (!staffTask) return []

    const { type, status, shipper } = returnRequest
    const actions: Array<{
      value: string
      label: string
      variant: string
    }> = []

    // COORDINATOR
    const task = staffTask as string | undefined
    if (task === 'COORDINATOR' || task === 'MANAGER' || task === 'ADMIN' || user?.role === 'ADMIN') {
      if (status === 'PENDING') {
        actions.push(
          { value: 'APPROVED', label: t('returns.detail.btnApprove'), variant: 'primary' },
          { value: 'REJECTED', label: t('returns.detail.btnReject'), variant: 'danger' }
        )
      }

      if (status === 'APPROVED' && !shipper) {
        actions.push(
          { value: 'ASSIGN_SHIPPER', label: t('returns.detail.assignShipper'), variant: 'primary' }
        )
      }

      if (status === 'RETURNED_TO_STORE') {
        actions.push(
          { value: 'COMPLETED', label: t('returns.stats.completed'), variant: 'success' }
        )
      }

      return actions
    }

    // SHIPPER
    if (staffTask === 'SHIPPER') {
      if (type === 'RETURN') {
        if (status === 'APPROVED') {
          actions.push({ value: 'PICKING_UP', label: t('returns.detail.btnPickingUp'), variant: 'primary' })
        }
        if (status === 'PICKING_UP') {
          actions.push({ value: 'PICKED_UP', label: t('returns.detail.btnPickedUp'), variant: 'primary' })
        }
        if (status === 'PICKED_UP') {
          actions.push({ value: 'RETURNED_TO_STORE', label: t('returns.detail.btnReturnedToStore'), variant: 'primary' })
        }
      }

      if (type === 'EXCHANGE') {
        if (status === 'APPROVED') {
          actions.push({ value: 'READY_TO_DELIVER', label: t('returns.detail.btnReadyToDeliver'), variant: 'primary' })
        }
        if (status === 'READY_TO_DELIVER') {
          actions.push({ value: 'DELIVERING', label: t('returns.detail.btnDelivering'), variant: 'primary' })
        }
        if (status === 'DELIVERING') {
          actions.push({ value: 'COMPLETED', label: t('returns.detail.btnDelivered'), variant: 'success' })
        }
      }
      return actions
    }

    return []
  }

  const availableActions = getAvailableActions()

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200'>
      <div className='flex h-full max-h-[90vh] w-full max-w-4xl flex-col rounded-2xl border border-border bg-card shadow-2xl animate-in zoom-in-95 duration-200'>
        {/* Header */}
        <div className='flex items-center justify-between border-b border-border px-6 py-4'>
          <div className='flex items-center gap-3'>
            <span className='rounded-lg bg-primary/10 p-2 text-primary'>
              <MaterialIcon name='assignment_return' className='text-xl' />
            </span>
            <div>
              <h3 className='font-display text-lg font-bold text-card-foreground'>
                {t('returns.detail.title')} #{returnRequest.returnCode}
              </h3>
              <p className='text-xs text-muted-foreground'>
                {t('returns.detail.orderCode')}: #{returnRequest.orderCode}
              </p>
            </div>
          </div>
          <button
            type='button'
            onClick={onClose}
            className='rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors'
            aria-label='Close Dialog'
          >
            <MaterialIcon name='close' className='text-xl' />
          </button>
        </div>

        {/* Content */}
        <div className='flex-1 overflow-y-auto p-6 space-y-6'>
          {errorMessage && (
            <div className='rounded-xl bg-destructive/10 p-4 text-sm font-semibold text-destructive flex items-center gap-2'>
              <MaterialIcon name='error' className='text-lg' />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            {/* Column 1: Info & Request details */}
            <div className='md:col-span-2 space-y-6'>
              {/* Customer & Status Summary */}
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-xl border border-border bg-muted/20 p-4'>
                <div>
                  <h4 className='text-xs font-bold uppercase text-muted-foreground tracking-wider mb-2'>
                    {t('returns.detail.customerInfo')}
                  </h4>
                  <p className='font-bold text-card-foreground'>
                    {returnRequest.requestedBy.fullName}
                  </p>
                  <p className='text-sm text-muted-foreground'>
                    {returnRequest.requestedBy.email}
                  </p>
                  {returnRequest.recipientName && (
                    <p className='text-sm text-muted-foreground mt-1'>
                      <span className='font-medium text-foreground'>{t('returns.detail.recipientName')}:</span>{' '}
                      {returnRequest.recipientName}
                    </p>
                  )}
                  {returnRequest.phoneNumber && (
                    <p className='text-sm text-muted-foreground'>
                      <span className='font-medium text-foreground'>{t('returns.detail.phoneNumber')}:</span>{' '}
                      {returnRequest.phoneNumber}
                    </p>
                  )}
                </div>
                <div>
                  <h4 className='text-xs font-bold uppercase text-muted-foreground tracking-wider mb-2'>
                    {t('returns.detail.status')}
                  </h4>
                  <div className='flex items-center gap-2'>
                    <span
                      className={cn(
                        'rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider',
                        getStatusBadgeClassName(returnRequest.status)
                      )}
                    >
                      {getStatusLabel(returnRequest.status)}
                    </span>
                  </div>
                  <p className='mt-1.5 text-xs text-muted-foreground'>
                    {t('returns.detail.createdAt')}: {formatDate(returnRequest.createdAt)}
                  </p>
                </div>
              </div>

              {/* Timeline */}
              <div className='rounded-xl border border-border bg-card p-4 sm:px-6'>
                <h4 className='text-sm font-bold border-b border-border pb-3 mb-2'>{t('returns.detail.requestStatus')}</h4>
                <ReturnTimeline 
                  type={returnRequest.type} 
                  status={returnRequest.status} 
                  createdAt={returnRequest.createdAt} 
                  approvedAt={returnRequest.approvedAt} 
                  pickedUpAt={returnRequest.pickedUpAt} 
                  returnedToStoreAt={returnRequest.returnedToStoreAt} 
                  completedAt={returnRequest.completedAt} 
                />
              </div>

              {/* Address */}
              {returnRequest.address ? (
                <div className='rounded-xl border border-border bg-card p-4'>
                  <h4 className='text-sm font-bold text-card-foreground border-b border-border pb-1.5 mb-2'>
                    {t('returns.detail.address')}
                  </h4>
                  <p className='text-sm text-foreground flex items-start gap-2 bg-muted/20 p-3 rounded-lg border border-border/60'>
                    <MaterialIcon name='location_on' className='text-primary mt-0.5' />
                    {returnRequest.address}
                  </p>
                </div>
              ) : null}

              {/* Reason and Description */}
              <div className='space-y-3'>
                <h4 className='text-sm font-bold text-card-foreground border-b border-border pb-1.5'>
                  {t('returns.detail.reason')}
                </h4>
                <div className='rounded-xl border border-border bg-card p-4 space-y-2.5'>
                  <div>
                    <span className='text-xs text-muted-foreground block'>{t('returns.detail.type')}:</span>
                    <strong className='text-foreground'>{getTypeLabel(returnRequest.type)}</strong>
                  </div>
                  <div>
                    <span className='text-xs text-muted-foreground block'>{t('returns.detail.specificReason')}</span>
                    <strong className='text-foreground'>{getReasonLabel(returnRequest.reason)}</strong>
                  </div>
                  {returnRequest.description && (
                    <div>
                      <span className='text-xs text-muted-foreground block'>{t('returns.detail.description')}:</span>
                      <p className='text-sm text-foreground whitespace-pre-line mt-1 bg-muted/30 p-3 rounded-lg border border-border/60'>
                        {returnRequest.description}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Items List */}
              <div className='space-y-3'>
                <h4 className='text-sm font-bold text-card-foreground border-b border-border pb-1.5'>
                  {t('returns.detail.items')} ({returnRequest.returnItems.length})
                </h4>
                <div className='divide-y divide-border rounded-xl border border-border bg-card overflow-hidden'>
                  {returnRequest.returnItems.map((item) => (
                    <div
                      key={item.returnItemId}
                      className='flex items-center justify-between gap-4 p-4 hover:bg-muted/10 transition-colors'
                    >
                      <div>
                        <p className='font-semibold text-card-foreground'>{item.productName}</p>
                        <p className='text-xs text-muted-foreground'>SKU/ID: #{item.orderDetailId}</p>
                      </div>
                      <div className='flex items-center gap-6 text-sm shrink-0'>
                        <div>
                          <span className='text-muted-foreground'>{t('returns.detail.quantity')}</span>{' '}
                          <strong className='text-foreground'>{item.quantity}</strong>
                        </div>
                        {returnRequest.type === 'RETURN' && (
                          <div>
                            <span className='text-muted-foreground'>{t('returns.detail.refundBack')}</span>{' '}
                            <strong className='text-primary font-bold'>{formatPrice(item.refundAmount)}</strong>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Media attachments */}
              <div className='space-y-3'>
                <h4 className='text-sm font-bold text-card-foreground border-b border-border pb-1.5'>
                  {t('returns.detail.media')}
                </h4>
                {returnRequest.mediaFiles && returnRequest.mediaFiles.length > 0 ? (
                  <div className='flex flex-wrap gap-4'>
                    {returnRequest.mediaFiles.map((media) => {
                      const url = typeof media === 'string' ? media : media.fileUrl
                      return (
                        <a
                          key={typeof media === 'string' ? media : media.mediaFileId}
                          href={url}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='group relative h-20 w-20 overflow-hidden rounded-xl border border-border shadow-sm hover:border-primary transition-all active:scale-95'
                        >
                          <img
                            src={url}
                            alt='Proof document'
                            className='h-full w-full object-cover transition-transform group-hover:scale-105'
                          />
                          <span className='absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs'>
                            <MaterialIcon name='open_in_new' className='text-lg' />
                          </span>
                        </a>
                      )
                    })}
                  </div>
                ) : (
                  <p className='text-sm text-muted-foreground italic'>{t('returns.detail.mediaEmpty')}</p>
                )}
              </div>
            </div>

            {/* Column 2: Financials & Actions */}
            <div className='space-y-6'>
              {/* Financials details — chỉ hiện khi Trả hàng */}
              {returnRequest.type === 'RETURN' && (
                <div className='rounded-xl border border-border bg-card p-4 space-y-3'>
                  <h4 className='text-xs font-bold uppercase text-muted-foreground tracking-wider border-b border-border pb-2'>
                    {t('returns.detail.refundInfo')}
                  </h4>
                  <div className='space-y-2 text-sm'>
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>{t('returns.detail.refundMethod')}:</span>
                      <strong className='text-foreground'>
                        {getRefundMethodLabel(returnRequest.refundMethod)}
                      </strong>
                    </div>
                    {returnRequest.refundStatus && (
                      <div className='flex justify-between'>
                        <span className='text-muted-foreground'>{t('returns.detail.refundStatus')}:</span>
                        <span className='font-semibold text-primary'>{getRefundStatusLabel(returnRequest.refundStatus)}</span>
                      </div>
                    )}
                    <div className='flex justify-between border-t border-border pt-2 text-base'>
                      <span className='font-semibold text-card-foreground'>{t('returns.detail.refundAmount')}:</span>
                      <strong className='text-primary font-extrabold'>{formatPrice(returnRequest.refundAmount)}</strong>
                    </div>
                  </div>

                  {returnRequest.refundMethod === 'BANK_TRANSFER' && (returnRequest.bankName || returnRequest.bankAccountNumber) && (
                    <div className='rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground space-y-1.5 border border-border/50'>
                      <div>
                        {t('returns.detail.bankName')}: <strong className='text-foreground'>{returnRequest.bankName || '—'}</strong>
                      </div>
                      <div>
                        {t('returns.detail.bankAccountNumber')}: <strong className='text-foreground'>{returnRequest.bankAccountNumber || '—'}</strong>
                      </div>
                      <div>
                        {t('returns.detail.bankAccountHolder')}: <strong className='text-foreground'>{returnRequest.bankAccountHolder || '—'}</strong>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Additional Info */}
              <div className='rounded-xl border border-border bg-card p-4 space-y-3'>
                <h4 className='text-xs font-bold uppercase text-muted-foreground tracking-wider border-b border-border pb-2'>
                  {t('returns.detail.additionalInfo')}
                </h4>
                <div className='space-y-2 text-sm'>
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground'>{t('returns.detail.createdAt')}:</span>
                    <span className='text-foreground'>{formatDate(returnRequest.createdAt)}</span>
                  </div>
                  {returnRequest.updatedAt && returnRequest.updatedAt !== returnRequest.createdAt && (
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>{t('returns.detail.updatedAt')}:</span>
                      <span className='text-foreground'>{formatDate(returnRequest.updatedAt)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Processing Info (if resolved) */}
              {(returnRequest.coordinator || returnRequest.shipper || returnRequest.processedBy) && (
                <div className='rounded-xl border border-border bg-muted/10 p-4 space-y-2 text-xs'>
                  <h4 className='font-bold text-card-foreground border-b border-border/60 pb-1.5 mb-2'>
                    {t('returns.detail.processInfo')}
                  </h4>
                  {returnRequest.coordinator && (
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>{t('returns.detail.coordinator')}:</span>
                      <span className='font-semibold text-foreground'>{returnRequest.coordinator.fullName}</span>
                    </div>
                  )}
                  {returnRequest.shipper && (
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>{t('returns.detail.shipper')}:</span>
                      <span className='font-semibold text-foreground'>{returnRequest.shipper.fullName}</span>
                    </div>
                  )}
                  {returnRequest.processedBy && !returnRequest.coordinator && !returnRequest.shipper && (
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>{t('returns.detail.processedBy')}:</span>
                      <span className='font-semibold text-foreground'>{returnRequest.processedBy.fullName}</span>
                    </div>
                  )}
                  
                  {returnRequest.processedAt && (
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>{t('returns.detail.processedAt')}:</span>
                      <span className='text-foreground'>{formatDate(returnRequest.processedAt)}</span>
                    </div>
                  )}
                  {returnRequest.approvedAt && (
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>{t('returns.detail.approvedAt')}:</span>
                      <span className='text-foreground'>{formatDate(returnRequest.approvedAt)}</span>
                    </div>
                  )}
                  {returnRequest.pickedUpAt && (
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>{t('returns.detail.pickedUpAt')}:</span>
                      <span className='text-foreground'>{formatDate(returnRequest.pickedUpAt)}</span>
                    </div>
                  )}
                  {returnRequest.returnedToStoreAt && (
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>{t('returns.detail.returnedToStoreAt')}:</span>
                      <span className='text-foreground'>{formatDate(returnRequest.returnedToStoreAt)}</span>
                    </div>
                  )}
                  {returnRequest.restockedAt && (
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>{t('returns.detail.restockedAt')}:</span>
                      <span className='text-foreground'>{formatDate(returnRequest.restockedAt)}</span>
                    </div>
                  )}
                  {returnRequest.completedAt && (
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>{t('returns.detail.completedAt')}:</span>
                      <span className='text-foreground'>{formatDate(returnRequest.completedAt)}</span>
                    </div>
                  )}

                  {returnRequest.staffNote && (
                    <div className='mt-2 border-t border-border/60 pt-2'>
                      <span className='text-muted-foreground block mb-1'>{t('returns.detail.staffNoteLabel')}</span>
                      <p className='bg-card p-2 rounded border border-border text-foreground font-medium whitespace-pre-line'>
                        {returnRequest.staffNote}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons (For Staff to resolve) */}
              {availableActions.length > 0 && (
                <div className='rounded-xl border border-border bg-card p-4 space-y-4'>
                  <h4 className='text-xs font-bold uppercase text-muted-foreground tracking-wider border-b border-border pb-2'>
                    {t('returns.detail.actionTitle')}
                  </h4>

                  <div className='space-y-2'>
                    <label htmlFor='staff-note' className='text-xs font-semibold text-muted-foreground block'>
                      {t('returns.detail.staffNote')}{' '}
                      {(returnRequest.status === 'PENDING' || returnRequest.status === 'PICKED_UP') && (
                        <span className='text-rose-500'>{t('returns.detail.noteRequired')}</span>
                      )}
                    </label>
                    <textarea
                      id='staff-note'
                      value={staffNote}
                      onChange={(e) => setStaffNote(e.target.value)}
                      placeholder={t('returns.detail.notePlaceholder')}
                      className='w-full min-h-[80px] rounded-lg border border-border p-2.5 text-sm bg-card text-foreground focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all'
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className='flex flex-col gap-2'>
                    {availableActions.map((action) => {
                      let className = 'inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold shadow-sm hover:opacity-90 active:scale-98 disabled:opacity-50 transition-all'

                      if (action.variant === 'primary') {
                        className += ' bg-primary text-white'
                      } else if (action.variant === 'danger') {
                        className += ' bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/20 dark:border-rose-900/50 dark:text-rose-400 dark:hover:bg-rose-950/40'
                      } else if (action.variant === 'success') {
                        className += ' bg-emerald-600 text-white dark:bg-emerald-700'
                      } else {
                        className += ' bg-primary text-white'
                      }

                      return (
                        <button
                          key={action.value}
                          type='button'
                          onClick={() => handleUpdateStatus(action.value)}
                          disabled={isSubmitting}
                          className={className}
                        >
                          {action.value === 'APPROVED' && <MaterialIcon name='check' className='text-lg' />}
                          {action.value === 'REJECTED' && <MaterialIcon name='close' className='text-lg' />}
                          {action.value === 'ASSIGN_SHIPPER' && <MaterialIcon name='person_add' className='text-lg' />}
                          {action.value === 'PICKING_UP' && <MaterialIcon name='directions_car' className='text-lg' />}
                          {action.value === 'PICKED_UP' && <MaterialIcon name='local_shipping' className='text-lg' />}
                          {action.value === 'RETURNED_TO_STORE' && <MaterialIcon name='store' className='text-lg' />}
                          {action.value === 'READY_TO_DELIVER' && <MaterialIcon name='inventory_2' className='text-lg' />}
                          {action.value === 'DELIVERING' && <MaterialIcon name='local_shipping' className='text-lg' />}
                          {action.value === 'COMPLETED' && <MaterialIcon name='done_all' className='text-lg' />}
                          {action.value === 'DELIVERY_FAILED' && <MaterialIcon name='error' className='text-lg' />}
                          {action.label}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className='flex items-center justify-end gap-3 border-t border-border px-6 py-4 bg-muted/10'>
          <button
            type='button'
            onClick={onClose}
            className='rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-bold text-card-foreground hover:bg-muted transition-colors active:scale-95'
          >
            {t('returns.detail.close')}
          </button>
        </div>
      </div>

      {/* Assign Shipper Dialog Overlay */}
      {isAssigning && (
        <div className='fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in'>
          <div className='w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl p-6'>
            <div className='flex items-center justify-between mb-4'>
              <h3 className='font-bold text-lg text-card-foreground'>{t('returns.detail.assignShipperTitle')}</h3>
              <button onClick={() => setIsAssigning(false)} className='text-muted-foreground hover:text-foreground'>
                <MaterialIcon name='close' className='text-xl' />
              </button>
            </div>
            
            {isLoadingShippers ? (
              <div className='py-8 text-center text-muted-foreground'>{t('returns.detail.loadingShippers')}</div>
            ) : availableShippers.length === 0 ? (
              <div className='py-8 text-center text-muted-foreground'>{t('returns.detail.noShippers')}</div>
            ) : (
              <div className='space-y-4 max-h-[60vh] overflow-y-auto'>
                {availableShippers.map(shipper => (
                  <label
                    key={shipper.staffId}
                    className={cn(
                      'flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-colors hover:bg-muted/50',
                      selectedShipperId === shipper.staffId ? 'border-primary bg-primary/5' : 'border-border'
                    )}
                  >
                    <input
                      type='radio'
                      name='shipper'
                      value={shipper.staffId}
                      checked={selectedShipperId === shipper.staffId}
                      onChange={(e) => setSelectedShipperId(e.target.value)}
                      className='text-primary focus:ring-primary h-4 w-4'
                    />
                    <div>
                      <div className='font-semibold text-card-foreground'>{shipper.staffName}</div>
                      <div className='text-xs text-muted-foreground'>{shipper.staffEmail}</div>
                      <div className='text-xs font-medium mt-1 text-amber-600 dark:text-amber-400'>
                        {t('returns.detail.activeOrders', { count: shipper.activeReturnCount })}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            )}

            <div className='mt-6 flex justify-end gap-3 pt-4 border-t border-border'>
              <button
                onClick={() => setIsAssigning(false)}
                className='px-4 py-2 rounded-xl text-sm font-semibold hover:bg-muted'
                disabled={isSubmitting}
              >
                {t('returns.detail.cancelBtn')}
              </button>
              <button
                onClick={handleAssignShipper}
                disabled={!selectedShipperId || isSubmitting}
                className='px-4 py-2 rounded-xl text-sm font-semibold bg-primary text-white disabled:opacity-50 hover:bg-primary/90'
              >
                {isSubmitting ? t('returns.detail.saving') : t('returns.detail.confirmAssign')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}