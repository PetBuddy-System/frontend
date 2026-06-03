import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { cn } from '~/shared/lib/cn'
import { MaterialIcon } from '~/shared/ui'

const FILTER_KEYS = ['all', 'grooming', 'vet', 'sitter'] as const

const STAFF_OPTIONS = [
  { key: 'hoangNam', status: 'available', match: '9.8' },
  { key: 'minhTu', status: 'available', match: '8.5' },
  { key: 'leThiLan', status: 'busy' },
  { key: 'tranVanNam', status: 'available', match: '7.0' }
] as const

export interface ManagerAssignmentModalProps {
  bookingCode: string
  onClose: () => void
}

export function ManagerAssignmentModal({ bookingCode, onClose }: ManagerAssignmentModalProps) {
  const { t } = useTranslation('manager')
  const [selectedStaffKey, setSelectedStaffKey] = useState<string | null>(null)

  return (
    <div className='fixed inset-0 z-[100] flex items-center justify-center bg-foreground/50 p-4'>
      <div
        role='dialog'
        aria-modal='true'
        aria-labelledby='manager-assignment-modal-title'
        className='flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-card shadow-2xl'
      >
        <div className='flex items-center justify-between border-b border-border px-6 py-4'>
          <h2 id='manager-assignment-modal-title' className='font-display text-xl font-bold text-card-foreground'>
            {t('staffSchedule.assignmentModal.title', { bookingCode })}
          </h2>
          <button
            type='button'
            aria-label={t('staffSchedule.assignmentModal.close')}
            onClick={onClose}
            className='flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-primary focus:outline-none focus:ring-2 focus:ring-ring'
          >
            <MaterialIcon name='close' />
          </button>
        </div>

        <div className='space-y-4 p-6'>
          <div className='relative'>
            <MaterialIcon
              name='search'
              className='absolute left-3 top-1/2 -translate-y-1/2 text-xl text-muted-foreground'
            />
            <input
              type='text'
              className='h-11 w-full rounded-lg border border-input bg-muted px-10 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-ring'
              placeholder={t('staffSchedule.assignmentModal.searchPlaceholder')}
            />
          </div>
          <div className='flex flex-wrap gap-2'>
            {FILTER_KEYS.map((key) => {
              const isActive = key === 'all'

              return (
                <button
                  key={key}
                  type='button'
                  className={
                    isActive
                      ? 'rounded-full bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground'
                      : 'rounded-full bg-muted px-4 py-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:bg-secondary hover:text-secondary-foreground'
                  }
                >
                  {t(`staffSchedule.assignmentModal.filters.${key}`)}
                </button>
              )
            })}
          </div>
        </div>

        <div className='flex-1 space-y-3 overflow-y-auto px-6 pb-6'>
          {STAFF_OPTIONS.map((staff) => {
            const isBusy = staff.status === 'busy'
            const isSelected = selectedStaffKey === staff.key

            return (
              <button
                key={staff.key}
                type='button'
                disabled={isBusy}
                onClick={() => setSelectedStaffKey(staff.key)}
                className={cn(
                  'flex w-full items-center justify-between rounded-xl border p-4 text-left transition-colors',
                  isSelected && 'border-primary bg-primary/5',
                  !isSelected && !isBusy && 'border-border hover:border-primary',
                  isBusy && 'cursor-not-allowed border-border bg-muted opacity-70'
                )}
              >
                <div className='flex items-center gap-4'>
                  <div
                    className={
                      isBusy
                        ? 'flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground'
                        : 'flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-secondary-foreground'
                    }
                  >
                    <MaterialIcon name='person' className='text-3xl' />
                  </div>
                  <div>
                    <p className='font-semibold text-card-foreground'>
                      {t(`staffSchedule.assignmentModal.staff.${staff.key}.name`)}
                    </p>
                    <p className='text-xs text-muted-foreground'>
                      {t(`staffSchedule.assignmentModal.staff.${staff.key}.role`)}
                    </p>
                    <div className='mt-1 flex items-center'>
                      <span
                        className={
                          isBusy
                            ? 'mr-1.5 h-2 w-2 rounded-full bg-destructive'
                            : 'mr-1.5 h-2 w-2 rounded-full bg-success'
                        }
                      />
                      <span
                        className={isBusy ? 'text-xs font-bold text-destructive' : 'text-xs font-bold text-success'}
                      >
                        {isBusy
                          ? t(`staffSchedule.assignmentModal.staff.${staff.key}.status`)
                          : t('staffSchedule.assignmentModal.availableWithMatch', { match: staff.match })}
                      </span>
                    </div>
                  </div>
                </div>
                <span
                  className={
                    isBusy
                      ? 'rounded-lg border border-border px-4 py-1.5 text-sm font-semibold text-muted-foreground'
                      : 'rounded-lg border border-primary px-4 py-1.5 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground'
                  }
                >
                  {isSelected ? t('staffSchedule.assignmentModal.selected') : t('staffSchedule.assignmentModal.choose')}
                </span>
              </button>
            )
          })}
        </div>

        <div className='flex items-center justify-end gap-3 border-t border-border bg-muted p-6'>
          <button
            type='button'
            onClick={onClose}
            className='h-10 rounded-lg border border-border bg-card px-6 text-sm font-semibold text-foreground transition-colors hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring'
          >
            {t('staffSchedule.assignmentModal.cancel')}
          </button>
          <button
            type='button'
            disabled={!selectedStaffKey}
            className='h-10 rounded-lg bg-primary px-6 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50'
          >
            {t('staffSchedule.assignmentModal.confirm')}
          </button>
        </div>
      </div>
    </div>
  )
}
