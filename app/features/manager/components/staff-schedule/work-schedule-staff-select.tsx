import { useMemo, type ChangeEvent } from 'react'
import { useTranslation } from 'react-i18next'

import { cn } from '~/shared/lib/cn'
import { MaterialIcon } from '~/shared/ui'
import type { UserResponse } from '~/shared/lib/auth'

interface WorkScheduleStaffSelectProps {
  staffs: UserResponse[]
  selectedStaffIds: string[]
  onChange: (staffIds: string[]) => void
  disabled?: boolean
}

const TASK_ORDER = ['COORDINATOR', 'SHIPPER', 'GROOMER', 'CASHIER'] as const
type StaffTaskGroup = (typeof TASK_ORDER)[number]

function getStaffTaskGroup(staff: UserResponse): StaffTaskGroup | null {
  const task = String(staff.staffTask ?? '').toUpperCase()

  if (TASK_ORDER.includes(task as StaffTaskGroup)) {
    return task as StaffTaskGroup
  }

  return null
}

export function WorkScheduleStaffSelect({
  staffs,
  selectedStaffIds,
  onChange,
  disabled = false
}: WorkScheduleStaffSelectProps) {
  const { t } = useTranslation('manager')
  const selectedSet = useMemo(() => new Set(selectedStaffIds), [selectedStaffIds])
  const groupedStaffs = useMemo(
    () =>
      TASK_ORDER.map((task) => ({
        task,
        staffs: staffs.filter((staff) => getStaffTaskGroup(staff) === task)
      })).filter((group) => group.staffs.length > 0),
    [staffs]
  )

  function handleStaffChange(event: ChangeEvent<HTMLInputElement>) {
    const nextSelected = new Set(selectedStaffIds)

    if (event.target.checked) {
      nextSelected.add(event.target.value)
    } else {
      nextSelected.delete(event.target.value)
    }

    onChange(Array.from(nextSelected))
  }

  return (
    <details className='group rounded-md border border-border bg-background'>
      <summary
        className={cn(
          'flex min-h-10 cursor-pointer list-none items-center justify-between gap-3 px-3 text-sm font-semibold text-foreground',
          disabled && 'pointer-events-none opacity-60'
        )}
      >
        <span>
          {selectedStaffIds.length > 0
            ? t('staffSchedule.workSchedules.staffSelect.selected', { count: selectedStaffIds.length })
            : t('staffSchedule.workSchedules.staffSelect.placeholder')}
        </span>
        <MaterialIcon name='expand_more' className='text-lg text-muted-foreground transition-transform group-open:rotate-180' />
      </summary>

      <div className='max-h-80 overflow-y-auto border-t border-border p-3'>
        {groupedStaffs.length > 0 ? (
          <div className='flex flex-col gap-4'>
            {groupedStaffs.map((group) => (
              <div key={group.task}>
                <p className='mb-2 text-xs font-bold uppercase text-muted-foreground'>
                  {t(`staffSchedule.workSchedules.staffTasks.${group.task}`)}
                </p>
                <div className='flex flex-col gap-2'>
                  {group.staffs.map((staff) => (
                    <label
                      key={staff.userId}
                      className='flex cursor-pointer items-start gap-3 rounded-md border border-border bg-card p-3 transition-colors hover:bg-muted'
                    >
                      <input
                        type='checkbox'
                        value={staff.userId}
                        checked={selectedSet.has(staff.userId)}
                        onChange={handleStaffChange}
                        disabled={disabled}
                        className='mt-1 h-4 w-4 accent-primary'
                      />
                      <span className='min-w-0'>
                        <span className='block truncate text-sm font-semibold text-card-foreground'>
                          {staff.fullName}
                        </span>
                        <span className='block truncate text-xs text-muted-foreground'>{staff.email}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className='py-6 text-center text-sm text-muted-foreground'>
            {t('staffSchedule.workSchedules.staffSelect.empty')}
          </p>
        )}
      </div>
    </details>
  )
}
