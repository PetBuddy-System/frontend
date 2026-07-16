import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { fetchManagerAuditLogsApi } from '../services/audit/manager-audit-api'
import type { AuditLog, AuditLogFilter } from '~/shared/lib/audit'
import { MaterialIcon } from '~/shared/ui'
import { cn } from '~/shared/lib/cn'
import { ManagerSidebar } from '../components/layout/manager-sidebar'
import { ManagerTopNav } from '../components/layout/manager-top-nav'

const ALLOWED_ENTITY_TYPES = new Set(['PAYMENT', 'VOUCHER', 'VOUCHER_USAGE'])

const ENTITY_TYPE_OPTIONS = [
  { value: '', labelKey: 'auditLogs.filter.all' },
  { value: 'PAYMENT', labelKey: 'auditLogs.entityTypes.PAYMENT' },
  { value: 'VOUCHER', labelKey: 'auditLogs.entityTypes.VOUCHER' },
  { value: 'VOUCHER_USAGE', labelKey: 'auditLogs.entityTypes.VOUCHER_USAGE' },
] as const

const ACTION_OPTIONS = [
  { value: '', labelKey: 'auditLogs.filter.all' },
  { value: 'CREATE', labelKey: 'auditLogs.actions.CREATE' },
  { value: 'UPDATE', labelKey: 'auditLogs.actions.UPDATE' },
  { value: 'DELETE', labelKey: 'auditLogs.actions.DELETE' },
  { value: 'PAY', labelKey: 'auditLogs.actions.PAY' },
  { value: 'REFUND', labelKey: 'auditLogs.actions.REFUND' },
  { value: 'USE', labelKey: 'auditLogs.actions.USE' },
] as const

function formatDateDisplay(dateStr: string) {
  if (!dateStr) return ''
  try {
    return new Date(dateStr).toLocaleString('vi-VN', {
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

export function ManagerAuditLogsPage() {
  const { t } = useTranslation('manager')

  const [logs, setLogs] = useState<AuditLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')
  const [filter, setFilter] = useState<AuditLogFilter>({ page: 0, size: 20 })
  const [totalElements, setTotalElements] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  const loadLogs = useCallback(async () => {
    setIsLoading(true)
    setErrorMsg('')
    try {
      const res = await fetchManagerAuditLogsApi(filter)
      if (res.success && res.data) {
        const filtered = res.data.content.filter((log) =>
          ALLOWED_ENTITY_TYPES.has(log.entityType as string)
        )
        setLogs(filtered)
        setTotalElements(res.data.totalElements)
        setTotalPages(res.data.totalPages)
      } else {
        setLogs([])
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : t('auditLogs.error.loadFailed'))
    } finally {
      setIsLoading(false)
    }
  }, [filter, t])

  useEffect(() => {
    void loadLogs()
  }, [loadLogs])

  const handleFilterChange = (key: keyof AuditLogFilter, value: string | number | undefined) => {
    setFilter((prev) => ({ ...prev, [key]: value, page: 0 }))
  }

  const handlePageChange = (page: number) => {
    setFilter((prev) => ({ ...prev, page }))
  }

  const handleReset = () => {
    setFilter({ page: 0, size: 20 })
  }

  return (
    <div className='flex h-screen overflow-hidden bg-background text-foreground'>
      <ManagerSidebar activeItem='auditLogs' />
      <div className='flex min-w-0 flex-1 flex-col overflow-hidden'>
        <ManagerTopNav titleKey='auditLogs.title' subtitleKey='auditLogs.subtitle' />
        <main className='flex-1 overflow-y-auto p-4 md:p-6'>
          <div className='mx-auto flex max-w-7xl flex-col gap-6'>

            {errorMsg && (
              <div className='flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive'>
                <MaterialIcon name='error' className='shrink-0 text-[20px]' />
                <p>{errorMsg}</p>
                <button
                  type='button'
                  onClick={() => void loadLogs()}
                  className='ml-auto shrink-0 text-sm font-semibold underline'
                >
                  {t('auditLogs.retry', 'Thử lại')}
                </button>
              </div>
            )}

            <div className='flex flex-wrap items-end gap-3 rounded-xl border border-border bg-card p-3'>
              <div className='flex min-w-[130px] flex-1 flex-col'>
                <label className='mb-1 text-xs font-medium text-muted-foreground'>
                  {t('auditLogs.filter.entityType', 'Loại đối tượng')}
                </label>
                <select
                  value={filter.entityType || ''}
                  onChange={(e) => handleFilterChange('entityType', e.target.value || undefined)}
                  className='rounded-lg border border-border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring'
                >
                  {ENTITY_TYPE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {t(opt.labelKey)}
                    </option>
                  ))}
                </select>
              </div>

              <div className='flex min-w-[110px] flex-1 flex-col'>
                <label className='mb-1 text-xs font-medium text-muted-foreground'>
                  {t('auditLogs.filter.action', 'Hành động')}
                </label>
                <select
                  value={filter.action || ''}
                  onChange={(e) => handleFilterChange('action', e.target.value || undefined)}
                  className='rounded-lg border border-border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring'
                >
                  {ACTION_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {t(opt.labelKey)}
                    </option>
                  ))}
                </select>
              </div>

              <div className='flex min-w-[130px] flex-1 flex-col'>
                <label className='mb-1 text-xs font-medium text-muted-foreground'>
                  {t('auditLogs.filter.entityCode', 'Mã đối tượng')}
                </label>
                <input
                  type='text'
                  value={filter.entityCode || ''}
                  onChange={(e) => handleFilterChange('entityCode', e.target.value || undefined)}
                  placeholder={t('auditLogs.filter.entityCodePlaceholder', 'VD: ORD-0001...')}
                  className='rounded-lg border border-border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring'
                />
              </div>

              <div className='flex min-w-[150px] flex-1 flex-col'>
                <label className='mb-1 text-xs font-medium text-muted-foreground'>
                  {t('auditLogs.filter.performedBy', 'Người thực hiện')}
                </label>
                <input
                  type='text'
                  value={filter.performedBy || ''}
                  onChange={(e) => handleFilterChange('performedBy', e.target.value || undefined)}
                  placeholder={t('auditLogs.filter.performedByPlaceholder', 'Email...')}
                  className='rounded-lg border border-border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring'
                />
              </div>

              <button
                type='button'
                onClick={handleReset}
                className='flex h-[34px] items-center gap-1.5 self-end rounded-lg bg-muted px-4 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/70'
              >
                <MaterialIcon name='refresh' className='text-base' />
                {t('auditLogs.filter.reset', 'Đặt lại')}
              </button>
            </div>

            {isLoading ? (
              <div className='animate-pulse space-y-4 rounded-3xl border border-border bg-card p-8 shadow-sm'>
                <div className='h-8 w-1/4 rounded bg-muted' />
                <div className='h-12 w-full rounded bg-muted' />
                <div className='h-12 w-full rounded bg-muted' />
                <div className='h-12 w-full rounded bg-muted' />
              </div>
            ) : (
              <div className='overflow-hidden rounded-xl border border-border bg-card'>
                <div className='overflow-x-auto'>
                  <table className='w-full'>
                    <thead className='bg-muted/50'>
                      <tr>
                        <th className='px-4 py-3 text-left text-sm font-semibold text-muted-foreground'>
                          {t('auditLogs.table.time', 'Thời gian')}
                        </th>
                        <th className='px-4 py-3 text-left text-sm font-semibold text-muted-foreground'>
                          {t('auditLogs.table.user', 'Người thực hiện')}
                        </th>
                        <th className='px-4 py-3 text-left text-sm font-semibold text-muted-foreground'>
                          {t('auditLogs.table.action', 'Hành động')}
                        </th>
                        <th className='px-4 py-3 text-left text-sm font-semibold text-muted-foreground'>
                          {t('auditLogs.table.entityType', 'Loại')}
                        </th>
                        <th className='px-4 py-3 text-left text-sm font-semibold text-muted-foreground'>
                          {t('auditLogs.table.entityCode', 'Mã code')}
                        </th>
                        <th className='px-4 py-3 text-left text-sm font-semibold text-muted-foreground'>
                          {t('auditLogs.table.reason', 'Lý do')}
                        </th>
                        <th className='px-4 py-3 text-center text-sm font-semibold text-muted-foreground'>
                          {t('auditLogs.table.viewDetail', 'Chi tiết')}
                        </th>
                      </tr>
                    </thead>
                    <tbody className='divide-y divide-border'>
                      {logs.length === 0 ? (
                        <tr>
                          <td colSpan={7} className='px-4 py-12 text-center text-muted-foreground'>
                            <MaterialIcon name='receipt_long' className='mx-auto mb-2 text-[40px] opacity-40' />
                            <p className='text-sm'>{t('auditLogs.table.empty', 'Không có dữ liệu')}</p>
                          </td>
                        </tr>
                      ) : (
                        logs.map((log) => (
                          <tr
                            key={log.id}
                            className='transition-colors hover:bg-muted/30'
                          >
                            <td className='whitespace-nowrap px-4 py-3 text-sm'>
                              {formatDateDisplay(log.performedAt)}
                            </td>
                            <td className='whitespace-nowrap px-4 py-3 text-sm'>
                              {log.performedBy}
                            </td>
                            <td className='whitespace-nowrap px-4 py-3'>
                              <span
                                className={cn(
                                  'inline-block rounded-full px-2.5 py-0.5 text-xs font-medium',
                                  getActionColor(log.action as string)
                                )}
                              >
                                {t(`auditLogs.actions.${log.action}`, log.action as string)}
                              </span>
                            </td>
                            <td className='whitespace-nowrap px-4 py-3'>
                              <span
                                className={cn(
                                  'inline-block rounded-full px-2.5 py-0.5 text-xs font-medium',
                                  getEntityColor(log.entityType as string)
                                )}
                              >
                                {t(`auditLogs.entityTypes.${log.entityType}`, log.entityType as string)}
                              </span>
                            </td>
                            <td className='px-4 py-3 font-mono text-sm'>
                              {log.entityCode || '--'}
                            </td>
                            <td className='px-4 py-3 text-sm text-muted-foreground'>
                              {t(`auditLogs.reasonMap.${log.reason}`, log.reason || '--')}
                            </td>
                            <td className='whitespace-nowrap px-4 py-3 text-center'>
                              <a
                                href={`/manager/audit-logs/${log.id}`}
                                className='inline-flex items-center justify-center text-primary transition-colors hover:opacity-70'
                                title={t('auditLogs.table.viewDetail', 'Chi tiết')}
                              >
                                <MaterialIcon name='visibility' className='text-base' />
                              </a>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {totalPages > 1 && (
                  <div className='flex items-center justify-between border-t border-border px-4 py-3'>
                    <span className='text-sm text-muted-foreground'>
                      {t('auditLogs.pagination.showing', 'Hiển thị')}{' '}
                      {filter.page! * filter.size! + 1} -{' '}
                      {Math.min((filter.page! + 1) * filter.size!, totalElements)}{' '}
                      {t('auditLogs.pagination.of', 'trong')} {totalElements}
                    </span>
                    <div className='flex items-center gap-1'>
                      <button
                        type='button'
                        onClick={() => handlePageChange(filter.page! - 1)}
                        disabled={filter.page === 0}
                        className={cn(
                          'rounded-lg px-3 py-1 text-sm transition-colors',
                          filter.page === 0
                            ? 'cursor-not-allowed text-muted-foreground/50'
                            : 'hover:bg-muted'
                        )}
                      >
                        <MaterialIcon name='chevron_left' />
                      </button>
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const isActive = i === filter.page
                        return (
                          <button
                            key={i}
                            type='button'
                            onClick={() => handlePageChange(i)}
                            className={cn(
                              'h-8 w-8 rounded-lg text-sm font-medium transition-colors',
                              isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                            )}
                          >
                            {i + 1}
                          </button>
                        )
                      })}
                      <button
                        type='button'
                        onClick={() => handlePageChange(filter.page! + 1)}
                        disabled={filter.page === totalPages - 1}
                        className={cn(
                          'rounded-lg px-3 py-1 text-sm transition-colors',
                          filter.page === totalPages - 1
                            ? 'cursor-not-allowed text-muted-foreground/50'
                            : 'hover:bg-muted'
                        )}
                      >
                        <MaterialIcon name='chevron_right' />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
