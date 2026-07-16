import axios, { type AxiosRequestConfig } from 'axios'

import { axiosInstance } from '~/api/mutator/custom-fetch'
import { STORAGE_KEYS } from '~/shared/config/site'
import { readStorage } from '~/shared/lib/storage'

export enum BookingStatus {
  PENDING_PAYMENT = 'PENDING_PAYMENT',
  PENDING_ACCEPTANCE = 'PENDING_ACCEPTANCE',
  ACCEPTED = 'ACCEPTED',
  IN_PROGRESS = 'IN_PROGRESS',
  READY_FOR_PICKUP = 'READY_FOR_PICKUP',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  FAILED = 'FAILED'
}

export interface BookingCreationRequest {
  customerName: string
  customerPhone: string
  address?: string
  note?: string
  bookingType: string
  scheduledAt: string
  bookingDetails: BookingDetailCreationRequest[]
}

export interface BookingDetailCreationRequest {
  petId: string
  catalogId: number
  timeSlotId: number
  note?: string
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
  address: string
  scheduledAt: string
  totalAmount: number
  depositAmount: number
  remainingAmount: number
  bookingStatus: string
  cancelReason: string
  paymentDeadlineAt: string
  staffId: string
  staffName: string
  bookingDetails: BookingDetailResponse[]
  payments: PaymentResponse[]
}

export interface BookingDetailResponse {
  bookingDetailId: number
  petId: string
  petName: string
  catalogId: number
  catalogName: string
  timeSlotId: number
  timeSlot: string
  unitPrice: number
  durationMinute: number
  totalPrice: number
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
  fileType: string
  createdAt: string
}

export interface CatalogResponse {
  catalogId: number
  catalogName: string
  description: string
  catalogType: string
  petSpecies: string
  price: number
  weightRange?: string
  durationMinute: number
  bufferTime: number
  status: string
  surchargeConfig?: string | null
  durationConfig?: string | null
}

export interface PetProfileResponse {
  petId: string
  userId: string
  petName: string
  species: string
  breed: string
  gender: string
  dateOfBirth: string
  weight: number
  color: string
  healthNote: string
  allergyNote: string
  behaviorNote: string
  vaccinationStatus: string
  petStatus: string
  mediaFiles: MediaFileResponse[]
}

export interface TimeSlotResponse {
  timeSlotId: number
  catalogId: number
  catalogName: string
  durationMinute: number
  dayOfWeek: string
  startTime: string
  isActive: boolean
  maxPets?: number | null
}

export interface BookingListParams {
  status?: BookingStatus
  fromDate?: string
  toDate?: string
}

interface ApiResponse<T> {
  code?: number | string
  message?: string
  success?: boolean
  data: T
  timestamp?: string
}

const CATALOGS_URL = '/api/catalogs'
const CATALOG_TIME_SLOTS_URL = '/api/catalog-time-slots'
const BOOKINGS_URL = '/api/bookings'
const PETS_URL = '/api/pets'

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
    | { code?: number | string; message?: string; error?: string; errors?: Record<string, string> }
    | undefined
  const firstFieldError = responseData?.errors ? Object.values(responseData.errors)[0] : undefined
  return Object.assign(new Error(firstFieldError ?? responseData?.message ?? responseData?.error ?? error.message), {
    apiCode: responseData?.code,
    status: error.response?.status
  })
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

export function getCatalogs(): Promise<CatalogResponse[]> {
  return request<CatalogResponse[]>({
    url: CATALOGS_URL,
    method: 'GET'
  })
}

export function getPets(): Promise<PetProfileResponse[]> {
  return request<PetProfileResponse[]>({
    url: PETS_URL,
    method: 'GET'
  })
}

export function updateCatalogStatus(catalogId: number, status: string): Promise<CatalogResponse> {
  return request<CatalogResponse>({
    url: `${CATALOGS_URL}/${catalogId}/status`,
    method: 'PUT',
    params: { status }
  })
}

export function getCatalogTimeSlots(): Promise<TimeSlotResponse[]> {
  return request<TimeSlotResponse[]>({
    url: CATALOG_TIME_SLOTS_URL,
    method: 'GET'
  })
}

export function getCatalogTimeSlotsByCatalog(catalogId: number): Promise<TimeSlotResponse[]> {
  return request<TimeSlotResponse[]>({
    url: `${CATALOG_TIME_SLOTS_URL}/catalogs/${catalogId}`,
    method: 'GET'
  })
}

export function getAvailableCatalogTimeSlots(catalogId: number, selectedDate: string): Promise<TimeSlotResponse[]> {
  return request<TimeSlotResponse[]>({
    url: `${CATALOG_TIME_SLOTS_URL}/catalogs/${catalogId}/available`,
    method: 'GET',
    params: { selectedDate }
  })
}

export function toggleCatalogTimeSlot(timeSlotId: number): Promise<TimeSlotResponse> {
  return request<TimeSlotResponse>({
    url: `${CATALOG_TIME_SLOTS_URL}/${timeSlotId}/toggle-active`,
    method: 'PUT'
  })
}

export function createBooking(payload: BookingCreationRequest): Promise<BookingResponse> {
  return request<BookingResponse>({
    url: BOOKINGS_URL,
    method: 'POST',
    data: payload
  })
}

export function getMyBookings(): Promise<BookingResponse[]> {
  return request<BookingResponse[]>({
    url: `${BOOKINGS_URL}/my-bookings`,
    method: 'GET'
  })
}

export function getBookings(params: BookingListParams = {}): Promise<BookingResponse[]> {
  return request<BookingResponse[]>({
    url: BOOKINGS_URL,
    method: 'GET',
    params
  })
}

export function getBookingDetail(bookingId: number | string): Promise<BookingResponse> {
  return request<BookingResponse>({
    url: `${BOOKINGS_URL}/${bookingId}`,
    method: 'GET'
  })
}

export function updateBookingStatus(
  bookingId: number | string,
  payload: BookingUpdateRequest
): Promise<BookingResponse> {
  return request<BookingResponse>({
    url: `${BOOKINGS_URL}/${bookingId}/status`,
    method: 'PUT',
    data: payload
  })
}

export function retryBookingPayment(bookingId: number | string): Promise<BookingResponse> {
  return request<BookingResponse>({
    url: `${BOOKINGS_URL}/${bookingId}/retry-payment`,
    method: 'POST'
  })
}

export function uploadBookingDetailMedia(bookingDetailId: number, file: File): Promise<MediaFileResponse> {
  const formData = new FormData()
  formData.append('file', file)

  return request<MediaFileResponse>({
    url: `${BOOKINGS_URL}/details/${bookingDetailId}/media`,
    method: 'POST',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}
