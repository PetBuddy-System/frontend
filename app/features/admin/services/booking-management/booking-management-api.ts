import axios, { type AxiosRequestConfig } from 'axios'

import { axiosInstance } from '~/api/mutator/custom-fetch'
import { STORAGE_KEYS } from '~/shared/config/site'
import { readStorage } from '~/shared/lib/storage'

export enum BookingStatus {
  PENDING_PAYMENT = 'PENDING_PAYMENT',
  FAILED = 'FAILED',
  WAITING_STAFF = 'WAITING_STAFF',
  PENDING_ACCEPTANCE = 'PENDING_ACCEPTANCE',
  ACCEPTED = 'ACCEPTED',
  ON_THE_WAY = 'ON_THE_WAY',
  IN_PROGRESS = 'IN_PROGRESS',
  READY_FOR_PICKUP = 'READY_FOR_PICKUP',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export interface BookingManagementFilters {
  status?: BookingStatus
  fromDate?: string
  toDate?: string
}

export interface BookingUpdateRequest {
  status: BookingStatus
  cancelReason?: string
}

export interface BookingResponse {
  bookingId: number
  bookingCode: string
  bookingType: string
  customerName: string
  customerPhone: string
  address?: string
  scheduledAt: string
  estimatedEndAt?: string
  totalAmount: number
  depositAmount: number
  remainingAmount: number
  bookingStatus: BookingStatus | string
  cancelReason: string
  paymentDeadlineAt: string
  staffId: string
  staffName: string
  requestedStaffId?: string
  requestedStaffName?: string
  assignedStaffId?: string
  assignedStaffName?: string
  latitude?: number
  longitude?: number
  addressNote?: string
  distanceKm?: number
  travelFee?: number
  estimatedTravelMinute?: number
  bookingDetails: BookingDetailResponse[]
  payments: PaymentResponse[]
}

export interface BookingDetailResponse {
  bookingDetailId: number
  petId: string
  petName: string
  petSpecies?: string
  petWeight?: number
  petHealthNote?: string
  catalogId: number
  catalogName: string
  catalogType?: string
  timeSlotId: number
  timeSlot: string
  unitPrice: number
  quantity?: number
  durationMinute: number
  totalPrice: number
  note?: string
  mediaFiles: MediaFileResponse[]
}

export interface PaymentResponse {
  paymentId: number
  amount: number
  paymentMethod: string
  status: string
  stripeClientSecret: string
}

export interface MediaFileResponse {
  mediaFileId: number
  fileUrl: string
  fileKey?: string
  fileSize?: number
  fileType: string
  mediaPurpose?: string
  mediaStatus?: string
  bookingMediaType?: 'BEFORE_SERVICE' | 'AFTER_SERVICE'
  createdAt?: string
}

interface ApiResponse<T> {
  code?: number
  message?: string
  success?: boolean
  data: T
  timestamp?: string
}

const BOOKINGS_URL = '/api/bookings'

function getAuthorizationHeaders(): Record<string, string> {
  const token = readStorage(STORAGE_KEYS.accessToken)
  return token ? { Authorization: `Bearer ${token}` } : {}
}

function unwrapResponse<T>(payload: ApiResponse<T> | T): T {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return (payload as ApiResponse<T>).data
  }

  return payload as T
}

function toApiError(error: unknown): Error {
  if (!axios.isAxiosError(error)) {
    return error instanceof Error ? error : new Error('Request failed')
  }

  const responseData = error.response?.data as
    | { message?: string; error?: string; errors?: Record<string, string> }
    | undefined
  const firstFieldError = responseData?.errors ? Object.values(responseData.errors)[0] : undefined
  return new Error(firstFieldError ?? responseData?.message ?? responseData?.error ?? error.message)
}

async function request<T>(config: AxiosRequestConfig): Promise<T> {
  try {
    const response = await axiosInstance.request<ApiResponse<T> | T>({
      ...config,
      headers: {
        ...getAuthorizationHeaders(),
        ...config.headers
      }
    })

    return unwrapResponse(response.data)
  } catch (error) {
    throw toApiError(error)
  }
}

function cleanFilters(filters: BookingManagementFilters): Record<string, string> {
  return Object.entries(filters).reduce<Record<string, string>>((params, [key, value]) => {
    if (value) {
      params[key] = value
    }

    return params
  }, {})
}

export function getBookingManagementList(filters: BookingManagementFilters = {}): Promise<BookingResponse[]> {
  return request<BookingResponse[]>({
    url: BOOKINGS_URL,
    method: 'GET',
    params: cleanFilters(filters)
  })
}

export function getBookingManagementDetail(bookingId: number | string): Promise<BookingResponse> {
  return request<BookingResponse>({
    url: `${BOOKINGS_URL}/${bookingId}`,
    method: 'GET'
  })
}

export function updateBookingManagementStatus(
  bookingId: number | string,
  payload: BookingUpdateRequest
): Promise<BookingResponse> {
  return request<BookingResponse>({
    url: `${BOOKINGS_URL}/${bookingId}/status`,
    method: 'PATCH',
    data: payload
  })
}
