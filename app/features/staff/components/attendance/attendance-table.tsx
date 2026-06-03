import { useTranslation } from 'react-i18next'

import { cn } from '~/shared/lib/cn'
import { MaterialIcon } from '~/shared/ui'

export type AttendanceStatus = 'onTime' | 'late' | 'earlyLeave' | 'dayOff'

export interface AttendanceRecord {
  key: string
  dayLabel: string
  checkIn: string
  checkOut: string
  totalHours: string
  status: AttendanceStatus
  note?: string
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
  earlyLeave: {
    dotClass: 'bg-warning',
    bgClass: 'bg-warning/10',
    textClass: 'text-warning',
    labelKey: 'attendance.status.earlyLeave'
  },
  dayOff: {
    dotClass: 'bg-destructive',
    bgClass: 'bg-destructive/10',
    textClass: 'text-destructive',
    labelKey: 'attendance.status.dayOff'
  }
}

const ATTENDANCE_DATA: AttendanceRecord[] = [
  {
    key: 'day1',
    dayLabel: 'attendance.records.day1.dayLabel',
    checkIn: '08:00',
    checkOut: '17:00',
    totalHours: '8.0h',
    status: 'onTime'
  },
  {
    key: 'day2',
    dayLabel: 'attendance.records.day2.dayLabel',
    checkIn: '08:15',
    checkOut: '17:00',
    totalHours: '7.75h',
    status: 'late',
    note: 'attendance.records.day2.note'
  },
  {
    key: 'day3',
    dayLabel: 'attendance.records.day3.dayLabel',
    checkIn: '07:55',
    checkOut: '17:05',
    totalHours: '8.0h',
    status: 'onTime'
  },
  {
    key: 'day4',
    dayLabel: 'attendance.records.day4.dayLabel',
    checkIn: '--:--',
    checkOut: '--:--',
    totalHours: '0.0h',
    status: 'dayOff',
    note: 'attendance.records.day4.note'
  },
  {
    key: 'day5',
    dayLabel: 'attendance.records.day5.dayLabel',
    checkIn: '07:58',
    checkOut: '17:02',
    totalHours: '8.0h',
    status: 'onTime'
  }
]

export function AttendanceTable() {
  const { t } = useTranslation('staff')

  return (
    <div className='overflow-hidden rounded-xl border border-border bg-card shadow-sm'>
      {/* Table Header */}
      <div className='flex items-center justify-between border-b border-border bg-card p-6'>
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
        <table className='w-full border-collapse text-left'>
          <thead>
            <tr className='border-b border-border bg-muted text-muted-foreground'>
              <th className='whitespace-nowrap p-4 text-sm font-bold'>{t('attendance.table.columns.date')}</th>
              <th className='whitespace-nowrap p-4 text-sm font-bold'>{t('attendance.table.columns.checkIn')}</th>
              <th className='whitespace-nowrap p-4 text-sm font-bold'>{t('attendance.table.columns.checkOut')}</th>
              <th className='whitespace-nowrap p-4 text-sm font-bold'>{t('attendance.table.columns.totalHours')}</th>
              <th className='whitespace-nowrap p-4 text-sm font-bold'>{t('attendance.table.columns.status')}</th>
              <th className='w-full p-4 text-sm font-bold'>{t('attendance.table.columns.note')}</th>
            </tr>
          </thead>
          <tbody className='divide-y divide-border'>
            {ATTENDANCE_DATA.map((record) => {
              const statusConfig = STATUS_CONFIG[record.status]
              const isDayOff = record.status === 'dayOff'
              const isLate = record.status === 'late'

              return (
                <tr
                  key={record.key}
                  className={cn(
                    'transition-colors hover:bg-muted/50',
                    isDayOff && 'bg-muted/20'
                  )}
                >
                  <td
                    className={cn(
                      'whitespace-nowrap p-4 text-base font-medium',
                      isDayOff ? 'text-muted-foreground' : 'text-foreground'
                    )}
                  >
                    {t(record.dayLabel)}
                  </td>
                  <td
                    className={cn(
                      'whitespace-nowrap p-4 text-base',
                      isLate ? 'font-medium text-destructive' : 'text-muted-foreground'
                    )}
                  >
                    {record.checkIn}
                  </td>
                  <td className='whitespace-nowrap p-4 text-base text-muted-foreground'>
                    {record.checkOut}
                  </td>
                  <td
                    className={cn(
                      'whitespace-nowrap p-4 text-base',
                      isDayOff ? 'text-muted-foreground' : 'font-bold text-foreground'
                    )}
                  >
                    {record.totalHours}
                  </td>
                  <td className='whitespace-nowrap p-4'>
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
                  <td className='max-w-xs truncate p-4 text-base text-muted-foreground'>
                    {record.note ? (
                      <span className={isDayOff ? 'italic' : undefined}>{t(record.note)}</span>
                    ) : (
                      '--'
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className='flex items-center justify-between border-t border-border bg-card p-4 text-muted-foreground'>
        <span className='text-sm'>{t('attendance.table.showing', { from: 1, to: 5, total: 22 })}</span>
        <div className='flex gap-1'>
          <button
            type='button'
            disabled
            className='rounded p-1 disabled:opacity-40'
            aria-label={t('attendance.previousMonth')}
          >
            <MaterialIcon name='chevron_left' />
          </button>
          <button type='button' className='rounded bg-primary px-3 py-1 text-sm font-bold text-primary-foreground'>
            1
          </button>
          <button type='button' className='rounded px-3 py-1 text-sm transition-colors hover:bg-muted'>
            2
          </button>
          <button type='button' className='rounded px-3 py-1 text-sm transition-colors hover:bg-muted'>
            3
          </button>
          <span className='px-2 py-1'>...</span>
          <button
            type='button'
            className='rounded p-1 transition-colors hover:bg-muted'
            aria-label={t('attendance.nextMonth')}
          >
            <MaterialIcon name='chevron_right' />
          </button>
        </div>
      </div>
    </div>
  )
}
