import { axiosInstance } from '~/api/mutator/custom-fetch'
import type { UserResponse } from '~/shared/lib/auth'

export type WorkScheduleShiftType = 'MORNING' | 'AFTERNOON' | 'EVENING' | 'FULL_DAY' | 'CUSTOM'

export type StaffScheduleStatus = 'SCHEDULED' | 'WORKING' | 'COMPLETED' | 'CANCELLED'

export type StaffAttendanceStatus = 'ON_TIME' | 'LATE' | 'ABSENT' | 'LEAVE'

export interface StaffAssignedResponse {
  staffScheduleId: string
  staffId: string
  staffEmail?: string
  staffName: string
  scheduleStatus: StaffScheduleStatus
  attendanceStatus?: StaffAttendanceStatus
  checkInAt?: string
  checkOutAt?: string
  assignedAt?: string
  note?: string
}

export interface WorkScheduleResponse {
  workScheduleId: string
  workDate: string
  startTime: string
  endTime: string
  note?: string
  shiftType: WorkScheduleShiftType
  createdAt?: string
  updatedAt?: string
  assignedStaffs?: StaffAssignedResponse[]
}

export interface StaffScheduleResponse {
  staffScheduleId: string
  staffId: string
  staffName: string
  workScheduleId: string
  workDate: string
  startTime: string
  endTime: string
  shiftType: WorkScheduleShiftType
  scheduleStatus: StaffScheduleStatus
  attendanceStatus?: StaffAttendanceStatus
  assignedAt?: string
  checkInAt?: string
  checkOutAt?: string
  note?: string
  createdAt?: string
  updatedAt?: string
}

export interface WorkScheduleCreationRequest {
  workDate?: string
  startTime?: string
  endTime?: string
  note?: string
  shiftType?: WorkScheduleShiftType
  staffIds?: string[]
}

export interface WorkScheduleUpdateRequest {
  workDate?: string
  startTime?: string
  endTime?: string
  note?: string
  shiftType?: WorkScheduleShiftType
}

export interface StaffsAssignRequest {
  staffIds?: string[]
}

export interface StaffReassignRequest {
  newStaff?: string
  reason?: string
}

export interface GetWorkSchedulesParams {
  fromDate?: string
  toDate?: string
  shiftType?: WorkScheduleShiftType | 'ALL'
  page?: number
  size?: number
}

export interface PageWorkScheduleResponse {
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean
  size: number
  content: WorkScheduleResponse[]
  number: number
  numberOfElements: number
  empty: boolean
}

interface ApiResponse<T> {
  code: number
  message: string
  success: boolean
  data: T
  timestamp: string
}

const WORK_SCHEDULES_BASE_URL = '/api/work-schedules'

function cleanParams(params: GetWorkSchedulesParams) {
  return {
    fromDate: params.fromDate || undefined,
    toDate: params.toDate || undefined,
    shiftType: params.shiftType && params.shiftType !== 'ALL' ? params.shiftType : undefined,
    page: params.page ?? 0,
    size: params.size ?? 10
  }
}

export const workScheduleApi = {
  async getWorkSchedules(params: GetWorkSchedulesParams = {}) {
    const response = await axiosInstance.get<ApiResponse<PageWorkScheduleResponse>>(WORK_SCHEDULES_BASE_URL, {
      params: cleanParams(params)
    })

    return response.data
  },

  async createWorkSchedule(payload: WorkScheduleCreationRequest) {
    const response = await axiosInstance.post<ApiResponse<WorkScheduleResponse>>(WORK_SCHEDULES_BASE_URL, payload)

    return response.data
  },

  async getWorkScheduleById(workScheduleId: string) {
    const response = await axiosInstance.get<ApiResponse<WorkScheduleResponse>>(
      `${WORK_SCHEDULES_BASE_URL}/${workScheduleId}`
    )

    return response.data
  },

  async updateWorkSchedule(workScheduleId: string, payload: WorkScheduleUpdateRequest) {
    const response = await axiosInstance.put<ApiResponse<WorkScheduleResponse>>(
      `${WORK_SCHEDULES_BASE_URL}/${workScheduleId}`,
      payload
    )

    return response.data
  },

  async assignStaffsToWorkSchedule(workScheduleId: string, payload: StaffsAssignRequest) {
    const response = await axiosInstance.post<ApiResponse<WorkScheduleResponse>>(
      `${WORK_SCHEDULES_BASE_URL}/${workScheduleId}/staff`,
      payload
    )

    return response.data
  },

  async removeStaffFromWorkSchedule(staffScheduleId: string) {
    const response = await axiosInstance.patch<ApiResponse<void>>(
      `${WORK_SCHEDULES_BASE_URL}/staff-schedules/${staffScheduleId}/remove`
    )

    return response.data
  },

  async reassignStaffToWorkSchedule(staffScheduleId: string, payload: StaffReassignRequest) {
    const response = await axiosInstance.patch<ApiResponse<StaffScheduleResponse>>(
      `${WORK_SCHEDULES_BASE_URL}/staff-schedules/${staffScheduleId}/reassign`,
      payload
    )

    return response.data
  },

  async getStaffs() {
    const response = await axiosInstance.get<ApiResponse<UserResponse[]>>('/api/users/staff')

    return response.data
  }
}
