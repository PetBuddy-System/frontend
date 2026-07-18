/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { fetchAuditLogsApi } from '../services/audit'
import type { AuditLog, AuditLogFilter, AuditAction, AuditEntityType } from '~/shared/lib/audit'
import { MaterialIcon } from '~/shared/ui'
import { cn } from '~/shared/lib/cn'

import { AdminSidebar } from '../components/layout/admin-sidebar'
import { AdminTopNav } from '../components/layout/admin-top-nav'

// ============================================================
// HELPERS
// ============================================================

const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return ''
    try {
        const date = new Date(dateStr)
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
        'CREATE_PRODUCT': t('audit.reasonMap.CREATE_PRODUCT'),
        'CREATE_PRODUCT_IMPORT': t('audit.reasonMap.CREATE_PRODUCT_IMPORT'),
        'UPDATE_PRODUCT': t('audit.reasonMap.UPDATE_PRODUCT'),
        'CREATE_PROMOTION': t('audit.reasonMap.CREATE_PROMOTION'),
        'UPDATE_PROMOTION': t('audit.reasonMap.UPDATE_PROMOTION'),
        'CREATE_BATCH': t('audit.reasonMap.CREATE_BATCH'),
        'CREATE_BATCH_IMPORT': t('audit.reasonMap.CREATE_BATCH_IMPORT'),
        'UPDATE_BATCH': t('audit.reasonMap.UPDATE_BATCH'),
        'PAYMENT_SUCCESS': t('audit.reasonMap.PAYMENT_SUCCESS'),
        'PAYMENT_BY_MOMO': t('audit.reasonMap.PAYMENT_BY_MOMO'),
        'PAYMENT_BY_CARD': t('audit.reasonMap.PAYMENT_BY_CARD'),
        'CREATE_VOUCHER': t('audit.reasonMap.CREATE_VOUCHER'),
        'VOUCHER_USED': t('audit.reasonMap.VOUCHER_USED'),
    }
    return reasonMap[reason] || reason
}

const getActionLabel = (action: string, t: (key: string) => string) => {
    const map: Record<string, string> = {
        'CREATE': t('audit.actions.CREATE'),
        'UPDATE': t('audit.actions.UPDATE'),
        'DELETE': t('audit.actions.DELETE'),
        'PAY': t('audit.actions.PAY'),
        'REFUND': t('audit.actions.REFUND'),
        'USE': t('audit.actions.USE')
    }
    return map[action] || action
}

const ENTITY_TYPE_OPTIONS = [
    { value: '', labelKey: 'audit.filter.all' },
    { value: 'PRODUCT', labelKey: 'audit.entityTypes.PRODUCT' },
    { value: 'PROMOTION', labelKey: 'audit.entityTypes.PROMOTION' },
    { value: 'BATCH', labelKey: 'audit.entityTypes.BATCH' },
    { value: 'PAYMENT', labelKey: 'audit.entityTypes.PAYMENT' },
    { value: 'VOUCHER_USAGE', labelKey: 'audit.entityTypes.VOUCHER_USAGE' }
]

const ACTION_OPTIONS = [
    { value: '', labelKey: 'audit.filter.all' },
    { value: 'CREATE', labelKey: 'audit.actions.CREATE' },
    { value: 'UPDATE', labelKey: 'audit.actions.UPDATE' },
    { value: 'DELETE', labelKey: 'audit.actions.DELETE' },
    { value: 'PAY', labelKey: 'audit.actions.PAY' },
    { value: 'REFUND', labelKey: 'audit.actions.REFUND' },
    { value: 'USE', labelKey: 'audit.actions.USE' }
]


export function AdminAuditPage() {
    const { t } = useTranslation('admin')
    const [logs, setLogs] = useState<AuditLog[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [errorMsg, setErrorMsg] = useState('')
    const [filter, setFilter] = useState<AuditLogFilter>({
        page: 0,
        size: 20
    })
    const [totalElements, setTotalElements] = useState(0)
    const [totalPages, setTotalPages] = useState(0)

    const loadLogs = useCallback(async () => {
        setIsLoading(true)
        setErrorMsg('')
        try {
            const res = await fetchAuditLogsApi(filter)
            if (res.success && res.data) {
                setLogs(res.data.content)
                setTotalElements(res.data.totalElements)
                setTotalPages(res.data.totalPages)
            } else {
                setLogs([])
            }
        } catch (error: unknown) {
            setErrorMsg(error instanceof Error ? error.message : t('audit.error.loadFailed'))
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

    return (
        <div className='flex h-screen overflow-hidden bg-background text-foreground'>
            <AdminSidebar activeItem='auditLogs' />
            <div className='flex min-w-0 flex-1 flex-col overflow-hidden'>
                <AdminTopNav titleKey='audit.title' subtitleKey='audit.subtitle' />
                <main className='flex-1 overflow-y-auto p-4 md:p-6'>
                    <div className='mx-auto flex max-w-7xl flex-col gap-6'>
                        {/* ===== ERROR ===== */}
                        {errorMsg && (
                            <div className='flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive'>
                                <MaterialIcon name='error' className='shrink-0 text-[20px]' />
                                <p>{errorMsg}</p>
                                <button
                                    type='button'
                                    onClick={() => void loadLogs()}
                                    className='ml-auto shrink-0 text-sm font-semibold underline'
                                >
                                    {t('common.retry', 'Thử lại')}
                                </button>
                            </div>
                        )}

                        {/* ===== FILTER BAR ===== */}
                        <div className='flex flex-wrap items-end gap-3 rounded-xl border border-border bg-card p-3'>
                            {/* Entity Type */}
                            <div className='flex flex-col flex-1 min-w-[120px]'>
                                <label className='text-xs font-medium text-muted-foreground mb-1'>
                                    {t('audit.filter.entityType')}
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

                            {/* Action */}
                            <div className='flex flex-col flex-1 min-w-[100px]'>
                                <label className='text-xs font-medium text-muted-foreground mb-1'>
                                    {t('audit.filter.action')}
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

                            {/* Entity Code */}
                            <div className='flex flex-col flex-1 min-w-[120px]'>
                                <label className='text-xs font-medium text-muted-foreground mb-1'>
                                    {t('audit.filter.entityCode')}
                                </label>
                                <input
                                    type='text'
                                    value={filter.entityCode || ''}
                                    onChange={(e) => handleFilterChange('entityCode', e.target.value || undefined)}
                                    placeholder={t('audit.filter.entityCodePlaceholder')}
                                    className='rounded-lg border border-border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring'
                                />
                            </div>

                            {/* Performed By */}
                            <div className='flex flex-col flex-1 min-w-[140px]'>
                                <label className='text-xs font-medium text-muted-foreground mb-1'>
                                    {t('audit.filter.performedBy')}
                                </label>
                                <input
                                    type='text'
                                    value={filter.performedBy || ''}
                                    onChange={(e) => handleFilterChange('performedBy', e.target.value || undefined)}
                                    placeholder={t('audit.filter.performedByPlaceholder')}
                                    className='rounded-lg border border-border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring'
                                />
                            </div>

                            {/* Reset button */}
                            <button
                                onClick={handleReset}
                                className='flex items-center gap-1.5 rounded-lg bg-muted px-4 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/70 h-[36px] self-end'
                            >
                                <MaterialIcon name='refresh' className='text-base' />
                                {t('audit.filter.reset')}
                            </button>
                        </div>

                        {/* ===== TABLE ===== */}
                        {isLoading ? (
                            <div className='rounded-3xl border border-border bg-card p-8 shadow-sm space-y-4 animate-pulse'>
                                <div className='h-8 bg-muted w-1/4 rounded' />
                                <div className='h-12 bg-muted w-full rounded' />
                                <div className='h-12 bg-muted w-full rounded' />
                                <div className='h-12 bg-muted w-full rounded' />
                            </div>
                        ) : (
                            <div className='overflow-hidden rounded-xl border border-border bg-card'>
                                <div className='overflow-x-auto'>
                                    <table className='w-full'>
                                        <thead className='bg-muted/50'>
                                            <tr>
                                                <th className='px-4 py-3 text-left text-sm font-semibold text-muted-foreground'>
                                                    {t('audit.table.time')}
                                                </th>
                                                <th className='px-4 py-3 text-left text-sm font-semibold text-muted-foreground'>
                                                    {t('audit.table.user')}
                                                </th>
                                                <th className='px-4 py-3 text-left text-sm font-semibold text-muted-foreground'>
                                                    {t('audit.table.action')}
                                                </th>
                                                <th className='px-4 py-3 text-left text-sm font-semibold text-muted-foreground'>
                                                    {t('audit.table.entityType')}
                                                </th>
                                                <th className='px-4 py-3 text-left text-sm font-semibold text-muted-foreground'>
                                                    {t('audit.table.entityCode', 'Mã code')}
                                                </th>
                                                <th className='px-4 py-3 text-left text-sm font-semibold text-muted-foreground'>
                                                    {t('audit.table.reason')}
                                                </th>
                                                <th className='px-4 py-3 text-center text-sm font-semibold text-muted-foreground'>
                                                    {t('audit.table.viewDetail')}
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className='divide-y divide-border'>
                                            {logs.length === 0 ? (
                                                <tr>
                                                    <td colSpan={6} className='px-4 py-8 text-center text-muted-foreground'>
                                                        {t('audit.table.empty')}
                                                    </td>
                                                </tr>
                                            ) : (
                                                logs.map((log) => (
                                                    <tr
                                                        key={log.id}
                                                        className='transition-colors hover:bg-muted/30'
                                                    >
                                                        <td className='px-4 py-3 text-sm whitespace-nowrap'>
                                                            {formatDateDisplay(log.performedAt)}
                                                        </td>
                                                        <td className='px-4 py-3 text-sm whitespace-nowrap'>
                                                            {log.performedBy}
                                                        </td>
                                                        <td className='px-4 py-3 whitespace-nowrap'>
                                                            <span
                                                                className={cn(
                                                                    'inline-block rounded-full px-2.5 py-0.5 text-xs font-medium',
                                                                    getActionColor(log.action)
                                                                )}
                                                            >
                                                                {getActionLabel(log.action, t)}
                                                            </span>
                                                        </td>
                                                        <td className='px-4 py-3 whitespace-nowrap'>
                                                            <span
                                                                className={cn(
                                                                    'inline-block rounded-full px-2.5 py-0.5 text-xs font-medium',
                                                                    getEntityColor(log.entityType)
                                                                )}
                                                            >
                                                                {t(`audit.entityTypes.${log.entityType}`)}
                                                            </span>
                                                        </td>
                                                        <td className='px-4 py-3 text-sm font-mono'>
                                                            {log.entityCode || '--'}
                                                        </td>
                                                        <td className='px-4 py-3 text-sm text-muted-foreground'>
                                                            {getReasonText(log.reason, t)}
                                                        </td>
                                                        <td className='px-4 py-3 text-center whitespace-nowrap'>
                                                            <a
                                                                href={`/admin/audit-logs/${log.id}`}
                                                                className='text-sm font-medium text-primary transition-colors hover:underline'
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

                                {/* ===== PAGINATION ===== */}
                                {totalPages > 0 && (
                                    <div className='flex items-center justify-between border-t border-border px-4 py-3'>
                                        <span className='text-sm text-muted-foreground'>
                                            {t('audit.pagination.showing')}{' '}
                                            {filter.page! * filter.size! + 1} -{' '}
                                            {Math.min((filter.page! + 1) * filter.size!, totalElements)}{' '}
                                            {t('audit.pagination.of')} {totalElements}
                                        </span>
                                        <div className='flex items-center gap-1'>
                                            <button
                                                onClick={() => handlePageChange(filter.page! - 1)}
                                                disabled={filter.page === 0}
                                                className={cn(
                                                    'rounded-lg px-3 py-1 text-sm transition-colors',
                                                    filter.page === 0
                                                        ? 'text-muted-foreground/50 cursor-not-allowed'
                                                        : 'hover:bg-muted'
                                                )}
                                            >
                                                <MaterialIcon name='chevron_left' />
                                            </button>
                                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                                const page = i
                                                const isActive = page === filter.page
                                                return (
                                                    <button
                                                        key={page}
                                                        onClick={() => handlePageChange(page)}
                                                        className={cn(
                                                            'h-8 w-8 rounded-lg text-sm font-medium transition-colors',
                                                            isActive
                                                                ? 'bg-primary text-primary-foreground'
                                                                : 'hover:bg-muted'
                                                        )}
                                                    >
                                                        {page + 1}
                                                    </button>
                                                )
                                            })}
                                            <button
                                                onClick={() => handlePageChange(filter.page! + 1)}
                                                disabled={filter.page === totalPages - 1}
                                                className={cn(
                                                    'rounded-lg px-3 py-1 text-sm transition-colors',
                                                    filter.page === totalPages - 1
                                                        ? 'text-muted-foreground/50 cursor-not-allowed'
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