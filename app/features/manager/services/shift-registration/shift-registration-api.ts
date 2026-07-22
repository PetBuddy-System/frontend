import { axiosInstance } from '~/api/mutator/custom-fetch'

export type RegistrationPeriodStatus = 'OPEN' | 'CLOSED'
export type ShiftRegistrationShiftType = 'MORNING' | 'AFTERNOON' | 'EVENING' | 'FULL_DAY' | 'CUSTOM'

export interface RegistrationPeriodCreationRequest {
  workFromDate?: string
  workToDate?: string
  registerOpenAt?: string
  registerCloseAt?: string
}

export interface RegistrationPeriodResponse {
  registrationPeriodId: string
  workFromDate: string
  workToDate: string
  registerOpenAt: string
  registerCloseAt: string
  status: RegistrationPeriodStatus
}

export interface ShiftRegistrationResponse {
  registrationId: string
  staffId: string
  staffName: string
  staffEmail?: string | null
  workDate: string
  preferredShift: ShiftRegistrationShiftType
  preferredStartTime?: string | null
  preferredEndTime?: string | null
  reason?: string | null
  createdAt?: string
}

export interface GetRegistrationPeriodsParams {
  fromDate?: string
  toDate?: string
  status?: RegistrationPeriodStatus | 'ALL'
  page?: number
  size?: number
}

export interface GetShiftRegistrationsParams {
  staffKeyword?: string
  workDate?: string
  shiftType?: ShiftRegistrationShiftType | 'ALL'
  page?: number
  size?: number
}

export interface PageRegistrationPeriodResponse {
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean
  size: number
  content: RegistrationPeriodResponse[]
  number: number
  numberOfElements: number
  empty: boolean
}

export interface PageShiftRegistrationResponse {
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean
  size: number
  content: ShiftRegistrationResponse[]
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

function cleanPeriodParams(params: GetRegistrationPeriodsParams) {
  return {
    fromDate: params.fromDate || undefined,
    toDate: params.toDate || undefined,
    status: params.status && params.status !== 'ALL' ? params.status : undefined,
    page: params.page ?? 0,
    size: params.size ?? 10
  }
}

function cleanRegistrationParams(params: GetShiftRegistrationsParams) {
  return {
    staffKeyword: params.staffKeyword || undefined,
    workDate: params.workDate || undefined,
    shiftType: params.shiftType && params.shiftType !== 'ALL' ? params.shiftType : undefined,
    page: params.page ?? 0,
    size: params.size ?? 10
  }
}

export const shiftRegistrationApi = {
  async getRegistrationPeriods(params: GetRegistrationPeriodsParams = {}) {
    const response = await axiosInstance.get<ApiResponse<PageRegistrationPeriodResponse>>(REGISTRATION_PERIODS_URL, {
      params: cleanPeriodParams(params)
    })

    return response.data
  },

  async createRegistrationPeriod(payload: RegistrationPeriodCreationRequest) {
    const response = await axiosInstance.post<ApiResponse<RegistrationPeriodResponse>>(
      REGISTRATION_PERIODS_URL,
      payload
    )

    return response.data
  },

  async getRegistrationPeriodById(periodId: string) {
    const response = await axiosInstance.get<ApiResponse<RegistrationPeriodResponse>>(
      `${REGISTRATION_PERIODS_URL}/${periodId}`
    )

    return response.data
  },

  async updateRegistrationPeriodStatus(periodId: string, status: RegistrationPeriodStatus) {
    const response = await axiosInstance.put<ApiResponse<RegistrationPeriodResponse>>(
      `${REGISTRATION_PERIODS_URL}/${periodId}`,
      null,
      { params: { status } }
    )

    return response.data
  },

  async getRegistrationsForManager(registrationPeriodId: string, params: GetShiftRegistrationsParams = {}) {
    const response = await axiosInstance.get<ApiResponse<PageShiftRegistrationResponse>>(
      `${REGISTRATIONS_URL}/period/${registrationPeriodId}`,
      { params: cleanRegistrationParams(params) }
    )

    return response.data
  }
}
