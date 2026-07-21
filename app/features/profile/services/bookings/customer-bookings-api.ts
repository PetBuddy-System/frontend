import axios from 'axios'

import { axiosInstance } from '~/api/mutator/custom-fetch'
import { STORAGE_KEYS } from '~/shared/config/site'
import { readStorage } from '~/shared/lib/storage'

export enum BookingStatus {
  PENDING_PAYMENT = 'PENDING_PAYMENT',
  FAILED = 'FAILED',
  PENDING_ACCEPTANCE = 'PENDING_ACCEPTANCE',
  ACCEPTED = 'ACCEPTED',
  IN_PROGRESS = 'IN_PROGRESS',
  READY_FOR_PICKUP = 'READY_FOR_PICKUP',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  WAITING_STAFF = 'WAITING_STAFF'
}

export interface MediaFileResponse {
  mediaFileId: number
  fileUrl: string
  fileType: string
  fileKey?: string
  bookingMediaType?: 'BEFORE_SERVICE' | 'AFTER_SERVICE'
  createdAt: string
}

export interface PaymentResponse {
  paymentId: number
  amount: number
  paymentMethod: string
  status: string
  stripeClientSecret: string
}

export interface BookingDetailResponse {
  bookingDetailId: number
  petId: string
  petName: string
  petImage?: string
  petSpecies?: string
  petWeight?: number
  petHealthNote?: string
  catalogId: number
  catalogName: string
  catalogImage?: string
  timeSlotId: number
  timeSlot: string
  weightRange?: string
  baseDurationMinute?: number
  additionalDurationMinute?: number
  totalDurationMinute?: number
  basePrice?: number
  additionalPrice?: number
  unitPrice?: number
  durationMinute?: number
  totalPrice: number
  mediaFiles: MediaFileResponse[]
}

export interface BookingResponse {
  bookingId: number
  bookingCode: string
  bookingType: string
  customerName: string
  customerPhone: string
  address: string
  scheduledAt: string
  totalAmount: number
  depositAmount: number
  remainingAmount: number
  bookingStatus: BookingStatus | string
  cancelReason: string
  paymentDeadlineAt: string
  staffId: string
  staffName: string
  bookingDetails: BookingDetailResponse[]
  payments: PaymentResponse[]
}

interface ApiResponse<T> {
  success?: boolean
  code?: number
  message?: string
  data?: T
  result?: T
}

function getAuthHeaders() {
  const token = readStorage(STORAGE_KEYS.accessToken)

  return token
    ? {
        Authorization: `Bearer ${token}`
      }
    : undefined
}

function unwrapResponse<T>(payload: ApiResponse<T> | T): T {
  if (payload && typeof payload === 'object') {
    const apiPayload = payload as ApiResponse<T>
    if (apiPayload.data !== undefined) {
      return apiPayload.data
    }
    if (apiPayload.result !== undefined) {
      return apiPayload.result
    }
  }

  return payload as T
}

function toCustomerBookingError(error: unknown, fallbackMessage: string): Error {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string; errors?: unknown } | undefined
    const message =
      data?.message ||
      (Array.isArray(data?.errors) ? String(data.errors[0]) : undefined) ||
      error.message ||
      fallbackMessage

    return Object.assign(new Error(message), {
      status: error.response?.status,
      data
    })
  }

  if (error instanceof Error) {
    return error
  }

  return new Error(fallbackMessage)
}

export async function getMyCustomerBookings(): Promise<BookingResponse[]> {
  try {
    const response = await axiosInstance.get<ApiResponse<BookingResponse[]> | BookingResponse[]>(
      '/api/bookings/my-bookings',
      {
        headers: getAuthHeaders()
      }
    )

    return unwrapResponse(response.data) ?? []
  } catch (error: unknown) {
    throw toCustomerBookingError(error, 'Unable to load bookings.')
  }
}

export async function getCustomerBookingDetail(bookingId: number): Promise<BookingResponse> {
  try {
    const response = await axiosInstance.get<ApiResponse<BookingResponse> | BookingResponse>(
      `/api/bookings/${bookingId}`,
      {
        headers: getAuthHeaders()
      }
    )

    return unwrapResponse(response.data)
  } catch (error: unknown) {
    throw toCustomerBookingError(error, 'Unable to load booking detail.')
  }
}

export async function retryCustomerBookingPayment(bookingId: number): Promise<PaymentResponse> {
  try {
    const response = await axiosInstance.post<ApiResponse<PaymentResponse> | PaymentResponse>(
      `/api/bookings/${bookingId}/retry-payment`,
      undefined,
      {
        headers: getAuthHeaders()
      }
    )

    return unwrapResponse(response.data)
  } catch (error: unknown) {
    throw toCustomerBookingError(error, 'Unable to create a new payment.')
  }
}
