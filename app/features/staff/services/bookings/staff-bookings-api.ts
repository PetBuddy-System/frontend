import axios from 'axios'

import { axiosInstance } from '~/api/mutator/custom-fetch'
import type { UserResponse } from '~/shared/lib/auth'

export type BookingStatus =
  | 'PENDING_PAYMENT'
  | 'FAILED'
  | 'WAITING_STAFF'
  | 'PENDING_ACCEPTANCE'
  | 'ACCEPTED'
  | 'ON_THE_WAY'
  | 'IN_PROGRESS'
  | 'READY_FOR_PICKUP'
  | 'COMPLETED'
  | 'CANCELLED'

export type BookingMediaType = 'BEFORE_SERVICE' | 'AFTER_SERVICE'

export type FileType = 'IMAGE' | 'VIDEO'
export type MediaPurpose =
  | 'PET_PROFILE'
  | 'PRODUCT'
  | 'CATALOG'
  | 'BOOKING'
  | 'BLOG'
  | 'SHIPPING'
  | 'USER_PROFILE'
  | 'RETURN_REQUEST'
export type MediaStatus = 'ACTIVE' | 'DELETED'

export interface BookingUpdateRequest {
  status: BookingStatus
  cancelReason?: string
}

export interface MediaFileResponse {
  mediaFileId: number
  fileUrl: string
  fileKey: string
  fileSize: number
  fileType: FileType
  mediaPurpose: MediaPurpose
  mediaStatus: MediaStatus
  bookingMediaType?: BookingMediaType
}

export interface BookingDetailResponse {
  bookingDetailId: number
  petId: string
  petName: string
  petSpecies: string
  petWeight: number
  petHealthNote?: string
  catalogId: number
  catalogName: string
  catalogType: string
  timeSlotId: number
  timeSlot: string
  durationMinute: number
  unitPrice: number
  quantity: number
  totalPrice: number
  note?: string
  mediaFiles: MediaFileResponse[]
}

export interface BookingResponse {
  bookingId: number
  bookingCode: string
  bookingType: string
  customerName: string
  customerPhone: string
  address?: string
  latitude?: number
  longitude?: number
  addressNote?: string
  distanceKm?: number
  travelFee?: number
  estimatedTravelMinute?: number
  requestedStaffId?: string
  requestedStaffName?: string
  assignedStaffId?: string
  assignedStaffName?: string
  departedAt?: string | null
  actualStartedAt?: string | null
  actualCompletedAt?: string | null
  scheduledAt: string
  estimatedEndAt?: string | null
  bookingStatus: BookingStatus
  totalAmount: number
  depositAmount: number
  remainingAmount: number
  note?: string
  cancelReason?: string
  paymentDeadlineAt?: string
  staffScheduleId?: string
  staffId?: string
  staffName?: string
  stripeClientSecret?: string
  bookingDetails: BookingDetailResponse[]
}

export interface BookingListParams {
  status?: BookingStatus
  fromDate?: string
  toDate?: string
}

interface ApiResponse<T> {
  code: number
  message: string
  success: boolean
  data: T
  timestamp: string
}

function unwrapApiResponse<T>(payload: ApiResponse<T>): T {
  if (!payload.success) {
    throw new Error(payload.message || 'Request failed')
  }

  return payload.data
}

function toStaffBookingError(error: unknown): Error {
  if (!axios.isAxiosError(error)) {
    return error instanceof Error ? error : new Error('Request failed')
  }

  const responseData = error.response?.data as
    | { message?: string; error?: string; errors?: Record<string, string> }
    | undefined
  const firstFieldError = responseData?.errors ? Object.values(responseData.errors)[0] : undefined
  return new Error(firstFieldError ?? responseData?.message ?? responseData?.error ?? error.message)
}

async function request<T>(promise: Promise<{ data: ApiResponse<T> }>): Promise<T> {
  try {
    const response = await promise
    return unwrapApiResponse(response.data)
  } catch (error) {
    throw toStaffBookingError(error)
  }
}

export function fetchStaffBookings(params: BookingListParams = {}): Promise<BookingResponse[]> {
  return request(axiosInstance.get<ApiResponse<BookingResponse[]>>('/api/bookings', { params }))
}

export function fetchStaffBookingDetail(bookingId: number | string): Promise<BookingResponse> {
  return request(axiosInstance.get<ApiResponse<BookingResponse>>(`/api/bookings/${bookingId}`))
}

export function updateStaffBookingStatus(
  bookingId: number | string,
  payload: BookingUpdateRequest
): Promise<BookingResponse> {
  return request(axiosInstance.patch<ApiResponse<BookingResponse>>(`/api/bookings/${bookingId}/status`, payload))
}

export function assignBookingGroomer(bookingId: number | string, groomerId: string): Promise<BookingResponse> {
  return request(
    axiosInstance.patch<ApiResponse<BookingResponse>>(`/api/bookings/${bookingId}/assign-groomer`, undefined, {
      params: { groomerId }
    })
  )
}

export function uploadBookingDetailMedia(
  bookingDetailId: number,
  type: BookingMediaType,
  file: File
): Promise<MediaFileResponse> {
  const formData = new FormData()
  formData.append('file', file)

  return request(
    axiosInstance.post<ApiResponse<MediaFileResponse>>(`/api/bookings/details/${bookingDetailId}/media`, formData, {
      params: { type }
    })
  )
}

export function fetchStaffUsers(): Promise<UserResponse[]> {
  return request(axiosInstance.get<ApiResponse<UserResponse[]>>('/api/users/staff'))
}
