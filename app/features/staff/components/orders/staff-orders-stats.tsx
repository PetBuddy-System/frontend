// app/features/staff/components/orders/staff-orders-stats.tsx
import { useTranslation } from 'react-i18next'

import { MaterialIcon } from '~/shared/ui'
import { cn } from '~/shared/lib/cn'

interface StaffOrdersStatsProps {
    stats: {
        pending: number
        confirmed: number
        picking: number
        shipping: number
        completed: number
        cancelled: number
        refundPending: number
        bombed: number
    }
    statusFilter: string
    onStatusFilterChange: (status: string) => void
}

export function StaffOrdersStats({ stats, statusFilter, onStatusFilterChange }: StaffOrdersStatsProps) {
    const { t } = useTranslation('staff')

    return (
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8'>
            {/* Card 1: Pending */}
            <button
                onClick={() => onStatusFilterChange(statusFilter === 'PENDING' ? 'ALL' : 'PENDING')}
                className={cn(
                    'flex flex-col justify-between rounded-2xl border bg-card p-4 text-left transition-all hover:scale-[1.02] hover:border-primary',
                    statusFilter === 'PENDING' ? 'border-primary ring-2 ring-ring' : 'border-border'
                )}
            >
                <div className='flex justify-between items-start w-full mb-4'>
                    <div className='rounded-xl bg-orange-100 p-2 text-orange-600 dark:bg-orange-950/50 dark:text-orange-400'>
                        <MaterialIcon name='pending_actions' className='text-[22px]' />
                    </div>
                    <span className='text-[10px] font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400'>
                        {t('staffOrdersStats.pending.badge')}
                    </span>
                </div>
                <div>
                    <span className='text-3xl font-extrabold text-foreground'>{stats.pending}</span>
                    <span className='block text-xs text-muted-foreground mt-0.5'>{t('staffOrdersStats.pending.label')}</span>
                </div>
            </button>

            {/* Card 2: Confirmed */}
            <button
                onClick={() => onStatusFilterChange(statusFilter === 'CONFIRMED' ? 'ALL' : 'CONFIRMED')}
                className={cn(
                    'flex flex-col justify-between rounded-2xl border bg-card p-4 text-left transition-all hover:scale-[1.02] hover:border-primary',
                    statusFilter === 'CONFIRMED' ? 'border-primary ring-2 ring-ring' : 'border-border'
                )}
            >
                <div className='flex justify-between items-start w-full mb-4'>
                    <div className='rounded-xl bg-blue-100 p-2 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400'>
                        <MaterialIcon name='check_circle' className='text-[22px]' />
                    </div>
                    <span className='text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400'>
                        {t('staffOrdersStats.confirmed.badge')}
                    </span>
                </div>
                <div>
                    <span className='text-3xl font-extrabold text-foreground'>{stats.confirmed}</span>
                    <span className='block text-xs text-muted-foreground mt-0.5'>{t('staffOrdersStats.confirmed.label')}</span>
                </div>
            </button>

            {/* Card 3: Picking */}
            <button
                onClick={() => onStatusFilterChange(statusFilter === 'PICKING' ? 'ALL' : 'PICKING')}
                className={cn(
                    'flex flex-col justify-between rounded-2xl border bg-card p-4 text-left transition-all hover:scale-[1.02] hover:border-primary',
                    statusFilter === 'PICKING' ? 'border-primary ring-2 ring-ring' : 'border-border'
                )}
            >
                <div className='flex justify-between items-start w-full mb-4'>
                    <div className='rounded-xl bg-cyan-100 p-2 text-cyan-600 dark:bg-cyan-950/50 dark:text-cyan-400'>
                        <MaterialIcon name='inventory_2' className='text-[22px]' />
                    </div>
                    <span className='text-[10px] font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400'>
                        {t('staffOrdersStats.picking.badge')}
                    </span>
                </div>
                <div>
                    <span className='text-3xl font-extrabold text-foreground'>{stats.picking}</span>
                    <span className='block text-xs text-muted-foreground mt-0.5'>{t('staffOrdersStats.picking.label')}</span>
                </div>
            </button>

            {/* Card 4: Shipping/Delivered */}
            <button
                onClick={() => onStatusFilterChange(statusFilter === 'SHIPPING_DELIVERED' ? 'ALL' : 'SHIPPING_DELIVERED')}
                className={cn(
                    'flex flex-col justify-between rounded-2xl border bg-card p-4 text-left transition-all hover:scale-[1.02] hover:border-primary',
                    statusFilter === 'SHIPPING_DELIVERED' ? 'border-primary ring-2 ring-ring' : 'border-border'
                )}
            >
                <div className='flex justify-between items-start w-full mb-4'>
                    <div className='rounded-xl bg-teal-100 p-2 text-teal-600 dark:bg-teal-950/50 dark:text-teal-400'>
                        <MaterialIcon name='local_shipping' className='text-[22px]' />
                    </div>
                    <span className='text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400'>
                        {t('staffOrdersStats.shippingDelivered.badge')}
                    </span>
                </div>
                <div>
                    <span className='text-3xl font-extrabold text-foreground'>{stats.shipping}</span>
                    <span className='block text-xs text-muted-foreground mt-0.5'>{t('staffOrdersStats.shippingDelivered.label')}</span>
                </div>
            </button>

            {/* Card 5: Completed */}
            <button
                onClick={() => onStatusFilterChange(statusFilter === 'COMPLETED' ? 'ALL' : 'COMPLETED')}
                className={cn(
                    'flex flex-col justify-between rounded-2xl border bg-card p-4 text-left transition-all hover:scale-[1.02] hover:border-primary',
                    statusFilter === 'COMPLETED' ? 'border-primary ring-2 ring-ring' : 'border-border'
                )}
            >
                <div className='flex justify-between items-start w-full mb-4'>
                    <div className='rounded-xl bg-green-100 p-2 text-green-600 dark:bg-green-950/50 dark:text-green-400'>
                        <MaterialIcon name='task_alt' className='text-[22px]' />
                    </div>
                    <span className='text-[10px] font-bold uppercase tracking-wider text-green-600 dark:text-green-400'>
                        {t('staffOrdersStats.completed.badge')}
                    </span>
                </div>
                <div>
                    <span className='text-3xl font-extrabold text-foreground'>{stats.completed}</span>
                    <span className='block text-xs text-muted-foreground mt-0.5'>{t('staffOrdersStats.completed.label')}</span>
                </div>
            </button>

            {/* Card 6: Cancelled */}
            <button
                onClick={() => onStatusFilterChange(statusFilter === 'CANCELLED' ? 'ALL' : 'CANCELLED')}
                className={cn(
                    'flex flex-col justify-between rounded-2xl border bg-card p-4 text-left transition-all hover:scale-[1.02] hover:border-primary',
                    statusFilter === 'CANCELLED' ? 'border-primary ring-2 ring-ring' : 'border-border'
                )}
            >
                <div className='flex justify-between items-start w-full mb-4'>
                    <div className='rounded-xl bg-red-100 p-2 text-red-600 dark:bg-red-950/50 dark:text-red-400'>
                        <MaterialIcon name='cancel' className='text-[22px]' />
                    </div>
                    <span className='text-[10px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400'>
                        {t('staffOrdersStats.cancelled.badge')}
                    </span>
                </div>
                <div>
                    <span className='text-3xl font-extrabold text-foreground'>{stats.cancelled}</span>
                    <span className='block text-xs text-muted-foreground mt-0.5'>{t('staffOrdersStats.cancelled.label')}</span>
                </div>
            </button>

            {/* Card 7: Refund pending */}
            <button
                onClick={() => onStatusFilterChange(statusFilter === 'CANCEL_REQUESTED' ? 'ALL' : 'CANCEL_REQUESTED')}
                className={cn(
                    'flex flex-col justify-between rounded-2xl border bg-card p-4 text-left transition-all hover:scale-[1.02] hover:border-primary',
                    statusFilter === 'CANCEL_REQUESTED' ? 'border-primary ring-2 ring-ring' : 'border-border'
                )}
            >
                <div className='flex justify-between items-start w-full mb-4'>
                    <div className='rounded-xl bg-amber-100 p-2 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400'>
                        <MaterialIcon name='currency_exchange' className='text-[22px]' />
                    </div>
                    <span className='text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 animate-pulse'>
                        {t('staffOrdersStats.refundPending.badge')}
                    </span>
                </div>
                <div>
                    <span className='text-3xl font-extrabold text-foreground'>{stats.refundPending}</span>
                    <span className='block text-xs text-muted-foreground mt-0.5'>{t('staffOrdersStats.refundPending.label')}</span>
                </div>
            </button>

            {/* Card 8: Bombed */}
            <button
                onClick={() => onStatusFilterChange(statusFilter === 'BOMBED' ? 'ALL' : 'BOMBED')}
                className={cn(
                    'flex flex-col justify-between rounded-2xl border bg-card p-4 text-left transition-all hover:scale-[1.02] hover:border-primary',
                    statusFilter === 'BOMBED' ? 'border-primary ring-2 ring-ring' : 'border-border'
                )}
            >
                <div className='flex justify-between items-start w-full mb-4'>
                    <div className='rounded-xl bg-rose-100 p-2 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400'>
                        <MaterialIcon name='block' className='text-[22px]' />
                    </div>
                    <span className='text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 animate-pulse'>
                        {t('staffOrdersStats.bombed.badge')}
                    </span>
                </div>
                <div>
                    <span className='text-3xl font-extrabold text-foreground'>{stats.bombed}</span>
                    <span className='block text-xs text-muted-foreground mt-0.5'>{t('staffOrdersStats.bombed.label')}</span>
                </div>
            </button>
        </div>
    )
}