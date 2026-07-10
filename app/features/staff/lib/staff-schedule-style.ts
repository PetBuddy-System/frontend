import type { StaffScheduleShiftType, StaffScheduleStatus } from '../services'

export function getStaffScheduleStatusClassName(status: StaffScheduleStatus) {
  if (status === 'WORKING') return 'bg-info/10 text-info border-info/20'
  if (status === 'COMPLETED') return 'bg-success/10 text-success border-success/20'
  if (status === 'ABSENT' || status === 'CANCELLED') {
    return 'bg-destructive/10 text-destructive border-destructive/20'
  }
  if (status === 'LEAVE') return 'bg-warning/10 text-warning border-warning/20'

  return 'bg-primary/10 text-primary border-primary/20'
}

export function getStaffScheduleShiftClassName(shiftType: StaffScheduleShiftType) {
  if (shiftType === 'MORNING') return 'border-primary/30 bg-primary/10 text-primary'
  if (shiftType === 'AFTERNOON') return 'border-warning/30 bg-warning/10 text-warning'
  if (shiftType === 'EVENING') return 'border-info/30 bg-info/10 text-info'
  if (shiftType === 'FULL_DAY') return 'border-success/30 bg-success/10 text-success'

  return 'border-accent bg-accent text-accent-foreground'
}
