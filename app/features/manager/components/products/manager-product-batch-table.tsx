// app/features/manager/components/products/manager-product-batch-table.tsx

import { Fragment } from 'react'
import { useTranslation } from 'react-i18next'
import { MaterialIcon } from '~/shared/ui'
import type { ProductBatchItem } from '~/shared/lib/batch'

export interface ManagerProductBatchTableProps {
    batches: ProductBatchItem[]
    currentPage: number
    expandedBatchIds: string[]
    formatDate: (dateStr: string) => string
    getDaysRemaining: (expiryDate: string) => number
    onToggleExpand: (batchId: string) => void
    onEdit: (batch: ProductBatchItem) => void
    onDelete: (batchId: string, batchCode: string) => void
}

export function ManagerProductBatchTable({
    batches,
    currentPage,
    expandedBatchIds,
    formatDate,
    getDaysRemaining,
    onToggleExpand,
    onEdit,
    onDelete
}: ManagerProductBatchTableProps) {
    const { t } = useTranslation('manager')

    if (batches.length === 0) {
        return (
            <div className='text-center py-12 border border-border border-dashed rounded-xl bg-muted/10'>
                <MaterialIcon name='inbox' className='text-4xl text-muted-foreground/60 mb-2' />
                <p className='text-muted-foreground text-sm font-medium'>{t('productManagement.batch.noBatches')}</p>
            </div>
        )
    }

    return (
        <div className='border border-border rounded-xl overflow-hidden bg-card'>
            <div className='overflow-x-auto'>
                <table className='w-full text-sm border-collapse text-left'>
                    <thead>
                        <tr className='bg-muted/40 border-b border-border'>
                            <th className='w-16 px-4 py-2.5 text-center text-xs font-bold text-muted-foreground uppercase tracking-wider'>
                                {t('productManagement.batch.stt')}
                            </th>
                            <th className='px-4 py-2.5 text-xs font-bold text-muted-foreground uppercase tracking-wider'>
                                {t('productManagement.batch.batchCode')}
                            </th>
                            <th className='px-4 py-2.5 text-xs font-bold text-muted-foreground uppercase tracking-wider'>
                                {t('productManagement.batch.quantity')}
                            </th>
                            <th className='px-4 py-2.5 text-xs font-bold text-muted-foreground uppercase tracking-wider'>
                                {t('productManagement.batch.basePrice')}
                            </th>
                            <th className='px-4 py-2.5 text-xs font-bold text-muted-foreground uppercase tracking-wider'>
                                {t('productManagement.batch.expiryDate')}
                            </th>
                            <th className='px-4 py-2.5 text-xs font-bold text-muted-foreground uppercase tracking-wider'>
                                {t('productManagement.batch.daysRemaining')}
                            </th>
                            <th className='px-4 py-2.5 text-xs font-bold text-muted-foreground uppercase tracking-wider'>
                                {t('productManagement.batch.status')}
                            </th>
                            <th className='w-32 px-4 py-2.5 text-center text-xs font-bold text-muted-foreground uppercase tracking-wider'>
                                {t('productManagement.batch.actions')}
                            </th>
                        </tr>
                    </thead>
                    <tbody className='divide-y divide-border'>
                        {batches.map((batch, index) => {
                            const daysRemaining = getDaysRemaining(batch.expiryDate)
                            const isExpiringSoon = daysRemaining <= 45 && daysRemaining > 0
                            const isExpired = daysRemaining <= 0
                            const isExpanded = expandedBatchIds.includes(batch.batchId)

                            return (
                                <Fragment key={batch.batchId}>
                                    <tr className='hover:bg-muted/10 transition-colors'>
                                        <td className='px-4 py-3.5 text-center text-muted-foreground font-medium'>
                                            {index + 1 + currentPage * 10}
                                        </td>
                                        <td className='px-4 py-3.5 font-bold text-primary font-mono text-sm'>
                                            {batch.batchCode}
                                        </td>
                                        <td className='px-4 py-3.5 font-semibold text-foreground'>
                                            {batch.stockQuantity}
                                        </td>
                                        <td className='px-4 py-3.5 text-foreground font-medium'>
                                            {batch.basePrice != null
                                                ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(batch.basePrice)
                                                : <span className='text-muted-foreground/60 text-xs'>—</span>
                                            }
                                        </td>
                                        <td className='px-4 py-3.5 text-muted-foreground font-medium'>
                                            {formatDate(batch.expiryDate)}
                                        </td>
                                        <td className='px-4 py-3.5'>
                                            {isExpired ? (
                                                <span className='text-destructive font-bold text-sm'>
                                                    {t('productManagement.batch.expired')}
                                                </span>
                                            ) : isExpiringSoon ? (
                                                <span className='text-destructive font-bold text-sm inline-flex items-center gap-1'>
                                                    <MaterialIcon name='warning' className='text-base' />
                                                    ▲ {t('productManagement.batch.daysCount', { count: daysRemaining })}
                                                </span>
                                            ) : (
                                                <span className='text-foreground font-medium text-sm'>
                                                    {t('productManagement.batch.daysCount', { count: daysRemaining })}
                                                </span>
                                            )}
                                        </td>
                                        <td className='px-4 py-3.5'>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${batch.status === 'ACTIVE'
                                                ? 'bg-success/15 text-success'
                                                : batch.status === 'DELETED'
                                                    ? 'bg-destructive/15 text-destructive'
                                                    : 'bg-muted-foreground/15 text-muted-foreground'
                                                }`}>
                                                {batch.status === 'ACTIVE'
                                                    ? t('productManagement.batch.statusActive')
                                                    : batch.status === 'DELETED'
                                                        ? t('productManagement.batch.statusDeleted')
                                                        : t('productManagement.batch.statusInactive')}
                                            </span>
                                        </td>
                                        <td className='px-4 py-3.5 text-center'>
                                            <div className='flex items-center justify-center gap-1.5'>
                                                <button
                                                    onClick={() => onToggleExpand(batch.batchId)}
                                                    className={`p-1.5 rounded-lg transition-colors ${isExpanded ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                                                        }`}
                                                    title={t('productManagement.batch.viewDetail')}
                                                >
                                                    <MaterialIcon name='visibility' className='text-lg' />
                                                </button>
                                                <button
                                                    onClick={() => onEdit(batch)}
                                                    className='p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors'
                                                    title={t('productManagement.batch.edit')}
                                                >
                                                    <MaterialIcon name='edit' className='text-lg' />
                                                </button>
                                                <button
                                                    onClick={() => onDelete(batch.batchId, batch.batchCode)}
                                                    disabled={batch.status === 'DELETED'}
                                                    className='p-1.5 text-destructive hover:bg-destructive/10 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed'
                                                    title={t('productManagement.batch.delete')}
                                                >
                                                    <MaterialIcon name='delete' className='text-lg' />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>

                                    {isExpanded && (
                                        <tr className='bg-muted/20 border-b border-border/50'>
                                            <td colSpan={8} className='px-6 py-3'>
                                                <div className='flex flex-wrap gap-x-8 gap-y-2 text-xs'>
                                                    <div className='flex items-center gap-2 text-muted-foreground'>
                                                        <MaterialIcon name='calendar_month' className='text-sm' />
                                                        <span className='font-bold uppercase tracking-wide'>
                                                            {t('productManagement.batch.createdAt')}:
                                                        </span>
                                                        <span className='font-semibold text-foreground'>{formatDate(batch.createdAt)}</span>
                                                    </div>
                                                    <div className='flex items-center gap-2 text-muted-foreground'>
                                                        <MaterialIcon name='history' className='text-sm' />
                                                        <span className='font-bold uppercase tracking-wide'>
                                                            {t('productManagement.batch.updatedAt')}:
                                                        </span>
                                                        <span className='font-semibold text-foreground'>{formatDate(batch.updatedAt)}</span>
                                                    </div>
                                                    <div className='flex items-center gap-2 text-muted-foreground'>
                                                        <MaterialIcon name='delete_outline' className='text-sm' />
                                                        <span className='font-bold uppercase tracking-wide'>
                                                            {t('productManagement.batch.deletedAt')}:
                                                        </span>
                                                        <span className={`font-semibold ${batch.deletedAt ? 'text-destructive' : 'text-foreground'}`}>
                                                            {batch.deletedAt ? formatDate(batch.deletedAt) : '—'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </Fragment>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    )
}