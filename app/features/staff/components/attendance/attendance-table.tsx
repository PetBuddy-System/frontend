import { useTranslation } from 'react-i18next'

import { cn } from '~/shared/lib/cn'
import { MaterialIcon } from '~/shared/ui'

export type AttendanceStatus = 'absent' | 'late' | 'leave' | 'onTime' | 'pending'

export interface AttendanceRecord {
  key: string
  dayLabel: string
  checkIn: string
  checkOut: string
  totalHours: string
  status: AttendanceStatus
  note?: string
}

export interface AttendanceTableProps {
  isLoading: boolean
  records: AttendanceRecord[]
}

const STATUS_CONFIG: Record<
  AttendanceStatus,
  { dotClass: string; bgClass: string; textClass: string; labelKey: string }
> = {
  onTime: {
    dotClass: 'bg-success',
    bgClass: 'bg-success/10',
    textClass: 'text-success',
    labelKey: 'attendance.status.onTime'
  },
  late: {
    dotClass: 'bg-warning',
    bgClass: 'bg-warning/10',
    textClass: 'text-warning',
    labelKey: 'attendance.status.late'
  },
  leave: {
    dotClass: 'bg-info',
    bgClass: 'bg-info/10',
    textClass: 'text-info',
    labelKey: 'attendance.status.leave'
  },
  absent: {
    dotClass: 'bg-destructive',
    bgClass: 'bg-destructive/10',
    textClass: 'text-destructive',
    labelKey: 'attendance.status.absent'
  },
  pending: {
    dotClass: 'bg-muted-foreground',
    bgClass: 'bg-muted',
    textClass: 'text-muted-foreground',
    labelKey: 'attendance.status.pending'
  }
}

export function AttendanceTable({ isLoading, records }: AttendanceTableProps) {
  const { t } = useTranslation('staff')

  return (
    <div className='overflow-hidden rounded-xl border border-border bg-card shadow-sm'>
      {/* Table Header */}
      <div className='flex items-center justify-between border-b border-border bg-card p-5'>
        <h3 className='font-display text-xl font-bold'>{t('attendance.table.title')}</h3>
        <button
          type='button'
          className='flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/10'
        >
          <MaterialIcon name='download' />
          <span>{t('attendance.table.export')}</span>
        </button>
      </div>

      {/* Table */}
      <div className='overflow-x-auto'>
        <table className='w-full min-w-[920px] table-fixed border-collapse text-left'>
          <colgroup>
            <col className='w-[14%]' />
            <col className='w-[9%]' />
            <col className='w-[9%]' />
            <col className='w-[10%]' />
            <col className='w-[14%]' />
            <col className='w-[44%]' />
          </colgroup>
          <thead>
            <tr className='border-b border-border bg-muted text-muted-foreground'>
              <th className='whitespace-nowrap px-6 py-4 text-sm font-bold'>{t('attendance.table.columns.date')}</th>
              <th className='whitespace-nowrap px-4 py-4 text-sm font-bold'>{t('attendance.table.columns.checkIn')}</th>
              <th className='whitespace-nowrap px-4 py-4 text-sm font-bold'>
                {t('attendance.table.columns.checkOut')}
              </th>
              <th className='whitespace-nowrap px-4 py-4 text-sm font-bold'>
                {t('attendance.table.columns.totalHours')}
              </th>
              <th className='whitespace-nowrap px-4 py-4 text-sm font-bold'>{t('attendance.table.columns.status')}</th>
              <th className='px-6 py-4 text-sm font-bold'>{t('attendance.table.columns.note')}</th>
            </tr>
          </thead>
          <tbody className='divide-y divide-border'>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <tr key={index}>
                  <td colSpan={6} className='px-6 py-3'>
                    <div className='h-10 animate-pulse rounded-lg bg-muted' />
                  </td>
                </tr>
              ))
            ) : records.length > 0 ? (
              records.map((record) => {
                const statusConfig = STATUS_CONFIG[record.status]
                const isDayOff = record.status === 'absent' || record.status === 'leave'
                const isLate = record.status === 'late'

                return (
                  <tr key={record.key} className={cn('transition-colors hover:bg-muted/50', isDayOff && 'bg-muted/20')}>
                    <td
                      className={cn(
                        'whitespace-nowrap px-6 py-4 text-base font-medium',
                        isDayOff ? 'text-muted-foreground' : 'text-foreground'
                      )}
                    >
                      {record.dayLabel}
                    </td>
                    <td
                      className={cn(
                        'whitespace-nowrap px-4 py-4 text-base',
                        isLate ? 'font-medium text-destructive' : 'text-muted-foreground'
                      )}
                    >
                      {record.checkIn}
                    </td>
                    <td className='whitespace-nowrap px-4 py-4 text-base text-muted-foreground'>{record.checkOut}</td>
                    <td
                      className={cn(
                        'whitespace-nowrap px-4 py-4 text-base',
                        isDayOff ? 'text-muted-foreground' : 'font-bold text-foreground'
                      )}
                    >
                      {record.totalHours}
                    </td>
                    <td className='whitespace-nowrap px-4 py-4'>
                      <span
                        className={cn(
                          'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold',
                          statusConfig.bgClass,
                          statusConfig.textClass
                        )}
                      >
                        <span className={cn('h-1.5 w-1.5 rounded-full', statusConfig.dotClass)} />
                        {t(statusConfig.labelKey)}
                      </span>
                    </td>
                    <td className='px-6 py-4 text-base text-muted-foreground'>
                      {record.note ? (
                        <span className={cn('block max-w-full truncate', isDayOff && 'italic')}>{record.note}</span>
                      ) : (
                        '--'
                      )}
                    </td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan={6} className='px-6 py-10 text-center text-sm text-muted-foreground'>
                  {t('attendance.table.empty')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className='flex items-center justify-between border-t border-border bg-card p-4 text-muted-foreground'>
        <span className='text-sm'>
          {records.length > 0
            ? t('attendance.table.showing', { from: 1, to: records.length, total: records.length })
            : t('attendance.table.showingEmpty')}
        </span>
        <MaterialIcon name='fact_check' className='text-lg' />
      </div>
    </div>
  )
}
