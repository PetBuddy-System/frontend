import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'

import { fetchManagerAuditLogByIdApi } from '../services/audit/manager-audit-api'
import type { AuditLog, AuditChange } from '~/shared/lib/audit'
import { MaterialIcon } from '~/shared/ui'
import { cn } from '~/shared/lib/cn'
import { ManagerSidebar } from '../components/layout/manager-sidebar'
import { ManagerTopNav } from '../components/layout/manager-top-nav'

function formatDateDisplay(dateStr: string) {
  if (!dateStr) return ''
  try {
    let clean = dateStr.replace('T', ' ')
    if (clean.includes('.')) clean = clean.substring(0, clean.indexOf('.'))
    const date = new Date(clean)
    if (isNaN(date.getTime())) return dateStr
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return dateStr
  }
}

function getActionColor(action: string) {
  switch (action) {
    case 'CREATE': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
    case 'UPDATE': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
    case 'DELETE': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
    case 'PAY': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
    case 'REFUND': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
    case 'USE': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
    default: return 'bg-muted text-muted-foreground'
  }
}

function getEntityColor(entityType: string) {
  switch (entityType) {
    case 'PAYMENT': return 'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-400'
    case 'VOUCHER': return 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-400'
    case 'VOUCHER_USAGE': return 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400'
    default: return 'bg-muted text-muted-foreground'
  }
}

interface ChangeItemProps {
  change: AuditChange
  t: any
}

function ChangeItem({ change, t }: ChangeItemProps) {
  const isCreate = change.oldValue === null || change.oldValue === 'null'
  const fieldLabel = t(`auditLogs.fields.${change.field}`, change.field)

  let oldDisplay = change.oldValue
  let newDisplay = change.newValue

  const DATE_FIELDS = new Set(['startAt', 'expiredAt', 'usedAt', 'performedAt'])
  if (DATE_FIELDS.has(change.field) && change.newValue) {
    newDisplay = formatDateDisplay(change.newValue)
  }
  if (DATE_FIELDS.has(change.field) && change.oldValue) {
    oldDisplay = formatDateDisplay(change.oldValue)
  }

  return (
    <div className='flex items-start gap-3 rounded-lg bg-muted/30 p-3'>
      <span className='min-w-[140px] text-sm font-medium text-muted-foreground'>{fieldLabel}</span>
      <div className='flex flex-col gap-1'>
        {isCreate ? (
          <span className='text-sm font-medium text-green-600 dark:text-green-400'>
            {newDisplay || 'null'}
          </span>
        ) : (
          <>
            <span className='text-sm text-muted-foreground line-through'>{oldDisplay || 'null'}</span>
            <span className='text-sm text-muted-foreground'>↓</span>
            <span className='text-sm font-medium text-primary'>{newDisplay || 'null'}</span>
          </>
        )}
      </div>
    </div>
  )
}

export function ManagerAuditDetailPage() {
  const { t } = useTranslation('manager')
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
        const res = await fetchManagerAuditLogByIdApi(auditLogId)
        if (res.success && res.data) {
          const filteredChanges = res.data.changes?.filter(
            (c) => c.field !== 'deletedAt' && c.field !== 'updatedAt' && c.field !== 'createdAt'
          ) ?? []
          setLog({ ...res.data, changes: filteredChanges })
        } else {
          setErrorMsg(t('auditLogs.detail.notFound', 'Không tìm thấy audit log'))
        }
      } catch (err) {
        setErrorMsg(err instanceof Error ? err.message : t('auditLogs.error.loadFailed', 'Không thể tải dữ liệu'))
      } finally {
        setIsLoading(false)
      }
    }
    void loadLog()
  }, [auditLogId, t])

  if (isLoading) {
    return (
      <div className='flex h-screen overflow-hidden bg-background text-foreground'>
        <ManagerSidebar activeItem='auditLogs' />
        <div className='flex min-w-0 flex-1 flex-col overflow-hidden'>
          <ManagerTopNav titleKey='auditLogs.detail.title' subtitleKey='auditLogs.subtitle' />
          <main className='flex-1 overflow-y-auto p-4 md:p-6'>
            <div className='mx-auto max-w-4xl animate-pulse space-y-4'>
              <div className='h-8 w-1/4 rounded bg-muted' />
              <div className='h-32 rounded bg-muted' />
              <div className='h-20 rounded bg-muted' />
            </div>
          </main>
        </div>
      </div>
    )
  }

  if (errorMsg || !log) {
    return (
      <div className='flex h-screen overflow-hidden bg-background text-foreground'>
        <ManagerSidebar activeItem='auditLogs' />
        <div className='flex min-w-0 flex-1 flex-col overflow-hidden'>
          <ManagerTopNav titleKey='auditLogs.detail.title' subtitleKey='auditLogs.subtitle' />
          <main className='flex-1 overflow-y-auto p-4 md:p-6'>
            <div className='mx-auto max-w-4xl'>
              <div className='rounded-xl border border-destructive/30 bg-destructive/10 p-8 text-center'>
                <MaterialIcon name='error' className='mx-auto mb-4 text-4xl text-destructive' />
                <p className='text-destructive'>{errorMsg || t('auditLogs.detail.notFound')}</p>
                <button
                  type='button'
                  onClick={() => navigate('/manager/audit-logs')}
                  className='mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90'
                >
                  {t('auditLogs.detail.back', 'Quay lại')}
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
      <ManagerSidebar activeItem='auditLogs' />
      <div className='flex min-w-0 flex-1 flex-col overflow-hidden'>
        <ManagerTopNav titleKey='auditLogs.detail.title' subtitleKey='auditLogs.subtitle' />
        <main className='flex-1 overflow-y-auto p-4 md:p-6'>
          <div className='mx-auto max-w-4xl'>
            <button
              type='button'
              onClick={() => navigate('/manager/audit-logs')}
              className='mb-4 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground'
            >
              <MaterialIcon name='arrow_back' className='text-base' />
              {t('auditLogs.detail.back', 'Quay lại danh sách')}
            </button>

            <div className='mb-6 rounded-xl border border-border bg-card p-6'>
              <div className='flex flex-wrap items-start justify-between gap-4'>
                <div>
                  <div className='mb-2 flex flex-wrap items-center gap-2'>
                    <span
                      className={cn(
                        'rounded-full px-2.5 py-0.5 text-xs font-medium',
                        getEntityColor(log.entityType as string)
                      )}
                    >
                      {t(`auditLogs.entityTypes.${log.entityType}`, log.entityType as string)}
                    </span>
                    <span
                      className={cn(
                        'rounded-full px-2.5 py-0.5 text-xs font-medium',
                        getActionColor(log.action as string)
                      )}
                    >
                      {t(`auditLogs.actions.${log.action}`, log.action as string)}
                    </span>
                    {log.entityCode && (
                      <span className='rounded-full bg-muted px-2.5 py-0.5 font-mono text-xs text-muted-foreground'>
                        {log.entityCode}
                      </span>
                    )}
                  </div>
                  <h1 className='text-xl font-bold text-card-foreground'>
                    {t('auditLogs.detail.title', 'Chi tiết Audit Log')}
                  </h1>
                </div>
                <div className='text-right text-sm text-muted-foreground'>
                  <p>{formatDateDisplay(log.performedAt)}</p>
                  <p className='mt-0.5'>{log.performedBy}</p>
                </div>
              </div>

              <div className='mt-4 grid grid-cols-1 gap-2 border-t border-border pt-4 md:grid-cols-2'>
                <div>
                  <span className='text-xs font-medium uppercase text-muted-foreground'>
                    {t('auditLogs.detail.reason', 'Lý do')}
                  </span>
                  <p className='mt-0.5 text-sm'>
                    {t(`auditLogs.reasonMap.${log.reason}`, log.reason || '--')}
                  </p>
                </div>
                {log.note && (
                  <div>
                    <span className='text-xs font-medium uppercase text-muted-foreground'>
                      {t('auditLogs.detail.note', 'Ghi chú')}
                    </span>
                    <p className='mt-0.5 text-sm'>{log.note}</p>
                  </div>
                )}
              </div>
            </div>

            <div className='rounded-xl border border-border bg-card p-6'>
              <h2 className='mb-4 text-lg font-semibold text-card-foreground'>
                {t('auditLogs.detail.changes', 'Các thay đổi')}
              </h2>
              {log.changes && log.changes.length > 0 ? (
                <div className='space-y-2'>
                  {log.changes.map((change, idx) => (
                    <ChangeItem key={idx} change={change} t={t} />
                  ))}
                </div>
              ) : (
                <p className='text-center text-sm text-muted-foreground'>
                  {t('auditLogs.table.empty', 'Không có dữ liệu')}
                </p>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
