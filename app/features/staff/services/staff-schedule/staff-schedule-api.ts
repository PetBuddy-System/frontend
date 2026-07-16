import { isAxiosError } from 'axios'

import { axiosInstance } from '~/api/mutator/custom-fetch'

export type StaffScheduleShiftType = 'MORNING' | 'AFTERNOON' | 'EVENING' | 'FULL_DAY' | 'CUSTOM'

export type StaffScheduleStatus = 'SCHEDULED' | 'WORKING' | 'COMPLETED' | 'CANCELLED'

export type StaffAttendanceStatus = 'ON_TIME' | 'LATE' | 'ABSENT' | 'LEAVE'

export interface StaffScheduleResponse {
  staffScheduleId: string
  staffId: string
  staffName: string
  workScheduleId: string
  workDate: string
  startTime: string
  endTime: string
  shiftType: StaffScheduleShiftType
  scheduleStatus: StaffScheduleStatus
  attendanceStatus?: StaffAttendanceStatus
  assignedAt?: string
  checkInAt?: string
  checkOutAt?: string
  note?: string
  createdAt?: string
  updatedAt?: string
}

export interface GetMyStaffSchedulesParams {
  fromDate?: string
  toDate?: string
  scheduleStatus?: StaffScheduleStatus | 'ALL'
}

interface ApiResponse<T> {
  code: number
  message: string
  success: boolean
  data: T
  timestamp: string
}

const STAFF_SCHEDULES_BASE_URL = '/api/staff-schedules'

function cleanParams(params: GetMyStaffSchedulesParams) {
  return {
    fromDate: params.fromDate || undefined,
    toDate: params.toDate || undefined,
    scheduleStatus:
      params.scheduleStatus && params.scheduleStatus !== 'ALL' ? params.scheduleStatus : undefined
  }
}

function extractApiMessage(error: unknown) {
  if (!isAxiosError(error)) return null

  const data = error.response?.data
  if (!data || typeof data !== 'object') return null
  if ('message' in data && typeof data.message === 'string') return data.message

  return null
}

function throwFriendlyError(error: unknown): never {
  const message = extractApiMessage(error)

  if (message) {
    throw Object.assign(new Error(message), {
      status: isAxiosError(error) ? error.response?.status : undefined,
      data: isAxiosError(error) ? error.response?.data : undefined
    })
  }

  throw error
}

export const staffScheduleApi = {
  async getMySchedules(params: GetMyStaffSchedulesParams = {}) {
    try {
      const response = await axiosInstance.get<ApiResponse<StaffScheduleResponse[]>>(
        `${STAFF_SCHEDULES_BASE_URL}/me`,
        { params: cleanParams(params) }
      )

      return response.data
    } catch (error) {
      throwFriendlyError(error)
    }
  },

  async getStaffSchedule(staffScheduleId: string) {
    try {
      const response = await axiosInstance.get<ApiResponse<StaffScheduleResponse>>(
        `${STAFF_SCHEDULES_BASE_URL}/${staffScheduleId}`
      )

      return response.data
    } catch (error) {
      throwFriendlyError(error)
    }
  },

  async checkIn(staffScheduleId: string) {
    try {
      const response = await axiosInstance.patch<ApiResponse<StaffScheduleResponse>>(
        `${STAFF_SCHEDULES_BASE_URL}/${staffScheduleId}/check-in`
      )

      return response.data
    } catch (error) {
      throwFriendlyError(error)
    }
  },

  async checkOut(staffScheduleId: string) {
    try {
      const response = await axiosInstance.patch<ApiResponse<StaffScheduleResponse>>(
        `${STAFF_SCHEDULES_BASE_URL}/${staffScheduleId}/check-out`
      )

      return response.data
    } catch (error) {
      throwFriendlyError(error)
    }
  }
}
