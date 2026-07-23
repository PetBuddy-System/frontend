import { axiosInstance } from '~/api/mutator/custom-fetch'

export type StaffShiftRegistrationPeriodStatus = 'OPEN' | 'CLOSED'
export type StaffShiftRegistrationShiftType = 'MORNING' | 'AFTERNOON' | 'EVENING' | 'FULL_DAY' | 'CUSTOM'

export interface StaffRegistrationPeriodResponse {
  registrationPeriodId: string
  workFromDate: string
  workToDate: string
  registerOpenAt: string
  registerCloseAt: string
  status: StaffShiftRegistrationPeriodStatus
}

export interface StaffShiftRegistrationItem {
  workDate: string
  preferredShift: StaffShiftRegistrationShiftType
  preferredStartTime?: string | null
  preferredEndTime?: string | null
  reason?: string | null
}

export interface StaffShiftRegistrationCreationRequest {
  registrationPeriodId: string
  registrations: StaffShiftRegistrationItem[]
}

export interface StaffShiftRegistrationUpdateRequest {
  registrations: StaffShiftRegistrationItem[]
}

export interface StaffShiftRegistrationResponse {
  registrationId: string
  staffId: string
  staffName: string
  staffEmail?: string | null
  workDate: string
  preferredShift: StaffShiftRegistrationShiftType
  preferredStartTime?: string | null
  preferredEndTime?: string | null
  reason?: string | null
  createdAt?: string
}

export interface GetStaffRegistrationPeriodsParams {
  fromDate?: string
  toDate?: string
  status?: StaffShiftRegistrationPeriodStatus | 'ALL'
  page?: number
  size?: number
}

export interface PageStaffRegistrationPeriodResponse {
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean
  size: number
  content: StaffRegistrationPeriodResponse[]
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

const SHIFT_BASE_URL = '/api/shift'
const REGISTRATION_PERIODS_URL = `${SHIFT_BASE_URL}/registration-period`
const REGISTRATIONS_URL = `${SHIFT_BASE_URL}/registrations`

function cleanPeriodParams(params: GetStaffRegistrationPeriodsParams) {
  return {
    fromDate: params.fromDate || undefined,
    toDate: params.toDate || undefined,
    status: params.status && params.status !== 'ALL' ? params.status : undefined,
    page: params.page ?? 0,
    size: params.size ?? 10
  }
}

export const staffShiftRegistrationApi = {
  async getRegistrationPeriods(params: GetStaffRegistrationPeriodsParams = {}) {
    const response = await axiosInstance.get<ApiResponse<PageStaffRegistrationPeriodResponse>>(
      REGISTRATION_PERIODS_URL,
      { params: cleanPeriodParams(params) }
    )

    return response.data
  },

  async createMyRegistrations(payload: StaffShiftRegistrationCreationRequest) {
    const response = await axiosInstance.post<ApiResponse<StaffShiftRegistrationResponse[]>>(REGISTRATIONS_URL, payload)

    return response.data
  },

  async getMyRegistrations(registrationPeriodId: string) {
    const response = await axiosInstance.get<ApiResponse<StaffShiftRegistrationResponse[]>>(
      `${REGISTRATIONS_URL}/me/${registrationPeriodId}`
    )

    return response.data
  },

  async updateMyRegistrations(registrationPeriodId: string, payload: StaffShiftRegistrationUpdateRequest) {
    const response = await axiosInstance.put<ApiResponse<StaffShiftRegistrationResponse[]>>(
      `${REGISTRATIONS_URL}/me/${registrationPeriodId}`,
      payload
    )

    return response.data
  }
}
