import axios, { type AxiosRequestConfig } from 'axios'

import { axiosInstance } from '~/api/mutator/custom-fetch'

export interface BookingStatsSummaryResponse {
  totalRevenue: number
  totalBookings: number
  completedBookings: number
  cancelledBookings: number
  pendingBookings: number
  averageOrderValue: number
}

export interface BookingStatsByPeriodResponse {
  period: string
  revenue: number
  bookingCount: number
}

export interface BookingStatsByServiceResponse {
  serviceName: string
  bookingCount: number
  revenue: number
  percentage: number
}

export interface BookingStatsDateRange {
  from: string
  to: string
}

interface ApiResponse<T> {
  code?: number | string
  message?: string
  success?: boolean
  data: T
  timestamp?: string
}

const BOOKING_STATISTICS_URL = '/api/statistics/bookings'

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

  const responseData = error.response?.data as { message?: string; error?: string } | undefined
  return new Error(responseData?.message ?? responseData?.error ?? error.message)
}

async function request<T>(config: AxiosRequestConfig): Promise<T> {
  try {
    const response = await axiosInstance.request<ApiResponse<T> | T>(config)
    return unwrapResponse(response.data)
  } catch (error) {
    throw toApiError(error)
  }
}

export function fetchBookingStatsSummary(range: BookingStatsDateRange): Promise<BookingStatsSummaryResponse> {
  return request<BookingStatsSummaryResponse>({
    url: `${BOOKING_STATISTICS_URL}/summary`,
    method: 'GET',
    params: range
  })
}

export function fetchBookingStatsByPeriod(range: BookingStatsDateRange): Promise<BookingStatsByPeriodResponse[]> {
  return request<BookingStatsByPeriodResponse[]>({
    url: `${BOOKING_STATISTICS_URL}/by-period`,
    method: 'GET',
    params: {
      ...range,
      groupBy: 'DAY'
    }
  })
}

export function fetchBookingStatsByService(range: BookingStatsDateRange): Promise<BookingStatsByServiceResponse[]> {
  return request<BookingStatsByServiceResponse[]>({
    url: `${BOOKING_STATISTICS_URL}/by-service`,
    method: 'GET',
    params: range
  })
}
