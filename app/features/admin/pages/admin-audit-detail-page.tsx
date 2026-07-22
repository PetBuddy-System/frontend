import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'

import { fetchAuditLogByIdApi } from '../services/audit'
import type { AuditLog, AuditChange } from '~/shared/lib/audit'
import { parsePromotionDetail } from '~/shared/lib/audit'
import { MaterialIcon } from '~/shared/ui'
import { cn } from '~/shared/lib/cn'

import { AdminSidebar } from '../components/layout/admin-sidebar'
import { AdminTopNav } from '../components/layout/admin-top-nav'

const formatDateDisplay = (dateStr: string) => {
  if (!dateStr) return ''
  try {
    let clean = dateStr.replace('T', ' ')
    if (clean.includes('.')) {
      clean = clean.substring(0, clean.indexOf('.'))
    }

    const date = new Date(clean)
    if (isNaN(date.getTime())) return dateStr

    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return dateStr
  }
}

const getReasonText = (reason: string | null, t: (key: string) => string): string => {
  if (!reason) return t('audit.reason.default')

  const reasonMap: Record<string, string> = {
    CREATE_PRODUCT: t('audit.reasonMap.CREATE_PRODUCT'),
    CREATE_PRODUCT_IMPORT: t('audit.reasonMap.CREATE_PRODUCT_IMPORT'),
    UPDATE_PRODUCT: t('audit.reasonMap.UPDATE_PRODUCT'),
    CREATE_PROMOTION: t('audit.reasonMap.CREATE_PROMOTION'),
    UPDATE_PROMOTION: t('audit.reasonMap.UPDATE_PROMOTION'),
    CREATE_BATCH: t('audit.reasonMap.CREATE_BATCH'),
    CREATE_BATCH_IMPORT: t('audit.reasonMap.CREATE_BATCH_IMPORT'),
    UPDATE_BATCH: t('audit.reasonMap.UPDATE_BATCH'),
    PAYMENT_SUCCESS: t('audit.reasonMap.PAYMENT_SUCCESS'),
    PAYMENT_BY_MOMO: t('audit.reasonMap.PAYMENT_BY_MOMO'),
    PAYMENT_BY_CARD: t('audit.reasonMap.PAYMENT_BY_CARD'),
    CREATE_VOUCHER: t('audit.reasonMap.CREATE_VOUCHER'),
    VOUCHER_USED: t('audit.reasonMap.VOUCHER_USED'),
    PAYMENT_BY_VNPAY: t('audit.reasonMap.PAYMENT_BY_VNPAY')
  }
  return reasonMap[reason] || reason
}

const getActionLabel = (action: string, t: (key: string) => string) => {
  const map: Record<string, string> = {
    CREATE: t('audit.actions.CREATE'),
    UPDATE: t('audit.actions.UPDATE'),
    DELETE: t('audit.actions.DELETE'),
    PAY: t('audit.actions.PAY'),
    REFUND: t('audit.actions.REFUND'),
    USE: t('audit.actions.USE')
  }
  return map[action] || action
}

const getStatusLabel = (status: string, t: (key: string) => string) => {
  const map: Record<string, string> = {
    DRAFT: t('audit.status.DRAFT'),
    ACTIVE: t('audit.status.ACTIVE'),
    INACTIVE: t('audit.status.INACTIVE'),
    DELETED: t('audit.status.DELETED')
  }
  return map[status] || status
}

const getPromotionTypeLabel = (type: string, t: (key: string) => string) => {
  const map: Record<string, string> = {
    PERCENTAGE: t('audit.promotionType.PERCENTAGE'),
    FIXED_AMOUNT: t('audit.promotionType.FIXED_AMOUNT')
  }
  return map[type] || type
}

const getActionColor = (action: string) => {
  switch (action) {
    case 'CREATE':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
    case 'UPDATE':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
    case 'DELETE':
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
    case 'PAY':
      return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400'
    case 'REFUND':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
    case 'USE':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
  }
}

const getEntityColor = (entityType: string) => {
  switch (entityType) {
    case 'PRODUCT':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
    case 'PROMOTION':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
    case 'BATCH':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
    case 'PAYMENT':
      return 'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-400'
    case 'VOUCHER_USAGE':
      return 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
  }
}

// ============================================================
// CHANGE ITEM COMPONENT
// ============================================================
const ChangeItem = ({ change, t }: { change: AuditChange; t: (key: string) => string }) => {
  if (change.field === 'promotionDetail') {
    const oldData = parsePromotionDetail(change.oldValue)
    const newData = parsePromotionDetail(change.newValue)

    if (oldData && !newData) {
      return (
        <div className='rounded-lg bg-red-50 p-3 dark:bg-red-950/20'>
          <p className='text-sm font-medium text-red-700 dark:text-red-400'>❌ {t('audit.actions.REMOVED')}</p>
          <p className='text-sm text-muted-foreground'>
            {oldData.name} ({oldData.code})
          </p>
          <p className='text-sm text-muted-foreground'>
            {t('audit.fields.promotionType')}: {getPromotionTypeLabel(oldData.type, t)} |{' '}
            {t('audit.fields.discountValue')}: {oldData.value}
          </p>
        </div>
      )
    }

    // ⭐ ADDED - chỉ có newData
    if (!oldData && newData) {
      return (
        <div className='rounded-lg bg-green-50 p-3 dark:bg-green-950/20'>
          <p className='text-sm font-medium text-green-700 dark:text-green-400'>✅ {t('audit.actions.ADDED')}</p>
          <p className='text-sm text-muted-foreground'>
            {newData.name} ({newData.code})
          </p>
          <p className='text-sm text-muted-foreground'>
            {t('audit.fields.promotionType')}: {getPromotionTypeLabel(newData.type, t)} |{' '}
            {t('audit.fields.discountValue')}: {newData.value}
          </p>
        </div>
      )
    }

    // ⭐ UPDATED - có cả oldData và newData
    if (oldData && newData) {
      return (
        <div className='rounded-lg bg-blue-50 p-3 dark:bg-blue-950/20'>
          <p className='text-sm font-medium text-blue-700 dark:text-blue-400'>🔄 {t('audit.actions.UPDATED')}</p>
          <p className='text-sm text-muted-foreground'>
            {oldData.name} ({oldData.code})
          </p>
          <p className='text-sm text-muted-foreground'>
            {t('audit.fields.promotionType')}: {getPromotionTypeLabel(oldData.type, t)} →{' '}
            {getPromotionTypeLabel(newData.type, t)} | {t('audit.fields.discountValue')}: {oldData.value} →{' '}
            {newData.value}
          </p>
        </div>
      )
    }
  }
  // ⭐ 2. Status
  if (change.field === 'status') {
    const oldLabel = change.oldValue ? getStatusLabel(change.oldValue, t) : null
    const newLabel = change.newValue ? getStatusLabel(change.newValue, t) : null
    const isCreate = change.oldValue === null || change.oldValue === 'null'

    return (
      <div className='flex items-start gap-3 rounded-lg bg-muted/30 p-3'>
        <span className='min-w-[120px] text-sm font-medium text-muted-foreground'>{t('audit.fields.status')}</span>
        <div className='flex flex-col gap-1'>
          {isCreate ? (
            <span className='text-sm font-medium text-green-600 dark:text-green-400'>{newLabel || 'null'}</span>
          ) : (
            <>
              <span className='text-sm text-muted-foreground line-through'>{oldLabel || 'null'}</span>
              <span className='text-sm text-muted-foreground'>↓</span>
              <span className='text-sm font-medium text-primary'>{newLabel || 'null'}</span>
            </>
          )}
        </div>
      </div>
    )
  }

  // ⭐ 3. Field thông thường
  const isCreate = change.oldValue === null || change.oldValue === 'null'
  const fieldLabel = change.field ? t(`audit.fields.${change.field}`) : ''
  let displayValue = change.newValue

  // ⭐ Nếu là startDate hoặc endDate, format lại
  if (change.field === 'startDate' || change.field === 'endDate') {
    displayValue = change.newValue ? formatDateDisplay(change.newValue) : null
  }

  if (change.field === 'promotionType' && change.newValue) {
    displayValue = getPromotionTypeLabel(change.newValue, t)
  }

  return (
    <div className='flex items-start gap-3 rounded-lg bg-muted/30 p-3'>
      <span className='min-w-[120px] text-sm font-medium text-muted-foreground'>{fieldLabel}</span>
      <div className='flex flex-col gap-1'>
        {isCreate ? (
          <span className='text-sm font-medium text-green-600 dark:text-green-400'>{displayValue || 'null'}</span>
        ) : (
          <>
            <span className='text-sm text-muted-foreground line-through'>
              {change.oldValue
                ? change.field === 'startDate' || change.field === 'endDate'
                  ? formatDateDisplay(change.oldValue)
                  : change.oldValue
                : 'null'}
            </span>
            <span className='text-sm text-muted-foreground'>↓</span>
            <span className='text-sm font-medium text-primary'>{displayValue || 'null'}</span>
          </>
        )}
      </div>
    </div>
  )
}
// ============================================================
// COMPONENT
// ============================================================

export function AdminAuditDetailPage() {
  const { t } = useTranslation('admin')
  const navigate = useNavigate()
  const { auditLogId } = useParams()
  const [log, setLog] = useState<AuditLog | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    const loadLog = async () => {
      if (!auditLogId) return
      setIsLoading(true)
      setErrorMsg('')
      try {
        const res = await fetchAuditLogByIdApi(auditLogId)
        if (res.success && res.data) {
          const HIDDEN_FIELDS = ['deletedAt', 'updatedAt', 'createdAt', 'totalRefundedAmount', 'stripeRefundId']
          const filteredChanges = res.data.changes?.filter((change) => !HIDDEN_FIELDS.includes(change.field)) || []

          setLog({
            ...res.data,
            changes: filteredChanges
          })
        } else {
          setErrorMsg('Không tìm thấy audit log')
        }
      } catch (error) {
        setErrorMsg(error instanceof Error ? error.message : 'Không thể tải dữ liệu')
      } finally {
        setIsLoading(false)
      }
    }
    void loadLog()
  }, [auditLogId])

  if (isLoading) {
    return (
      <div className='flex h-screen overflow-hidden bg-background text-foreground'>
        <AdminSidebar activeItem='auditLogs' />
        <div className='flex min-w-0 flex-1 flex-col overflow-hidden'>
          <AdminTopNav titleKey='audit.detail.title' subtitleKey='audit.subtitle' />
          <main className='flex-1 overflow-y-auto p-4 md:p-6'>
            <div className='mx-auto max-w-4xl'>
              <div className='animate-pulse space-y-4'>
                <div className='h-8 w-1/4 rounded bg-muted' />
                <div className='h-32 rounded bg-muted' />
                <div className='h-20 rounded bg-muted' />
              </div>
            </div>
          </main>
        </div>
      </div>
    )
  }

  if (errorMsg || !log) {
    return (
      <div className='flex h-screen overflow-hidden bg-background text-foreground'>
        <AdminSidebar activeItem='auditLogs' />
        <div className='flex min-w-0 flex-1 flex-col overflow-hidden'>
          <AdminTopNav titleKey='audit.detail.title' subtitleKey='audit.subtitle' />
          <main className='flex-1 overflow-y-auto p-4 md:p-6'>
            <div className='mx-auto max-w-4xl'>
              <div className='rounded-xl border border-destructive/30 bg-destructive/10 p-8 text-center'>
                <MaterialIcon name='error' className='mx-auto mb-4 text-4xl text-destructive' />
                <p className='text-destructive'>{errorMsg || 'Không tìm thấy audit log'}</p>
                <button
                  onClick={() => navigate('/admin/audit-logs')}
                  className='mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90'
                >
                  {t('audit.detail.back')}
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className='flex h-screen overflow-hidden bg-background text-foreground'>
      <AdminSidebar activeItem='auditLogs' />
      <div className='flex min-w-0 flex-1 flex-col overflow-hidden'>
        <AdminTopNav titleKey='audit.detail.title' subtitleKey='audit.subtitle' />
        <main className='flex-1 overflow-y-auto p-4 md:p-6'>
          <div className='mx-auto max-w-4xl'>
            {/* BACK BUTTON */}
            <button
              onClick={() => navigate('/admin/audit-logs')}
              className='mb-4 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground'
            >
              <MaterialIcon name='arrow_back' className='text-base' />
              {t('audit.detail.back')}
            </button>

            {/* HEADER */}
            <div className='mb-6 rounded-xl border border-border bg-card p-6'>
              <div className='flex flex-wrap items-start justify-between gap-4'>
                <div>
                  <div className='mb-2 flex items-center gap-2'>
                    <span
                      className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium', getEntityColor(log.entityType))}
                    >
                      {t(`audit.entityTypes.${log.entityType}`)}
                    </span>
                    <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium', getActionColor(log.action))}>
                      {getActionLabel(log.action, t)}
                    </span>
                    {log.entityCode && (
                      <span className='rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-mono text-gray-600 dark:bg-gray-800 dark:text-gray-400'>
                        {log.entityCode}
                      </span>
                    )}
                  </div>
                  <h1 className='text-xl font-bold text-card-foreground'>{t('audit.detail.title')}</h1>
                </div>
                <div className='text-right text-sm text-muted-foreground'>
                  <p>{formatDateDisplay(log.performedAt)}</p>
                  <p>{log.performedBy}</p>
                </div>
              </div>

              {/* Reason & Note */}
              <div className='mt-4 grid grid-cols-1 gap-2 border-t border-border pt-4 md:grid-cols-2'>
                <div>
                  <span className='text-xs font-medium uppercase text-muted-foreground'>
                    {t('audit.detail.reason')}
                  </span>
                  <p className='text-sm'>{getReasonText(log.reason, t)}</p>
                </div>
                {log.note && (
                  <div>
                    <span className='text-xs font-medium uppercase text-muted-foreground'>
                      {t('audit.detail.note')}
                    </span>
                    <p className='text-sm'>{log.note}</p>
                  </div>
                )}
              </div>
            </div>

            {/* CHANGES */}
            <div className='rounded-xl border border-border bg-card p-6'>
              <h2 className='mb-4 text-lg font-semibold text-card-foreground'>{t('audit.detail.changes')}</h2>
              {log.changes && log.changes.length > 0 ? (
                <div className='space-y-2'>
                  {log.changes.map((change, index) => (
                    <ChangeItem key={index} change={change} t={t} />
                  ))}
                </div>
              ) : (
                <p className='text-center text-muted-foreground'>{t('audit.table.empty')}</p>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}