import { customFetch } from '~/api/mutator/custom-fetch'

import type {
  ApiResponse,
  CatalogRequest,
  CatalogResponse,
  CatalogStatus,
  TimeSlotRequest,
  TimeSlotResponse,
  TimeSlotUpdateRequest,
  WeekDay
} from '../../lib/catalog-management'

const CATALOGS_BASE_URL = '/api/catalogs'
const CATALOG_TIME_SLOTS_BASE_URL = '/api/catalog-time-slots'

export async function fetchCatalogsApi(): Promise<ApiResponse<CatalogResponse[]>> {
  return customFetch<ApiResponse<CatalogResponse[]>>({
    url: CATALOGS_BASE_URL,
    method: 'GET'
  })
}

export async function fetchCatalogByIdApi(catalogId: number): Promise<ApiResponse<CatalogResponse>> {
  return customFetch<ApiResponse<CatalogResponse>>({
    url: `${CATALOGS_BASE_URL}/${catalogId}`,
    method: 'GET'
  })
}

export async function createCatalogApi(data: CatalogRequest): Promise<ApiResponse<CatalogResponse>> {
  return customFetch<ApiResponse<CatalogResponse>>({
    url: `${CATALOGS_BASE_URL}/create`,
    method: 'POST',
    data
  })
}

export async function updateCatalogApi(catalogId: number, data: CatalogRequest): Promise<ApiResponse<CatalogResponse>> {
  return customFetch<ApiResponse<CatalogResponse>>({
    url: `${CATALOGS_BASE_URL}/${catalogId}/update`,
    method: 'PUT',
    data
  })
}

export async function updateCatalogStatusApi(
  catalogId: number,
  status: CatalogStatus
): Promise<ApiResponse<CatalogResponse>> {
  return customFetch<ApiResponse<CatalogResponse>>({
    url: `${CATALOGS_BASE_URL}/${catalogId}/status`,
    method: 'PUT',
    params: { status }
  })
}

export async function uploadCatalogImageApi(catalogId: number, file: File): Promise<ApiResponse<CatalogResponse>> {
  const formData = new FormData()
  formData.append('file', file)

  return customFetch<ApiResponse<CatalogResponse>>({
    url: `${CATALOGS_BASE_URL}/${catalogId}/image`,
    method: 'PUT',
    data: formData
  })
}

export async function deleteCatalogImageApi(catalogId: number): Promise<ApiResponse<CatalogResponse>> {
  return customFetch<ApiResponse<CatalogResponse>>({
    url: `${CATALOGS_BASE_URL}/${catalogId}/image`,
    method: 'DELETE'
  })
}

export async function fetchTimeSlotsByCatalogApi(catalogId: number): Promise<ApiResponse<TimeSlotResponse[]>> {
  return customFetch<ApiResponse<TimeSlotResponse[]>>({
    url: `${CATALOG_TIME_SLOTS_BASE_URL}/catalogs/${catalogId}`,
    method: 'GET'
  })
}

export async function fetchTimeSlotByIdApi(timeSlotId: number): Promise<ApiResponse<TimeSlotResponse>> {
  return customFetch<ApiResponse<TimeSlotResponse>>({
    url: `${CATALOG_TIME_SLOTS_BASE_URL}/${timeSlotId}`,
    method: 'GET'
  })
}

export async function fetchTimeSlotsByCatalogAndDayApi(
  catalogId: number,
  dayOfWeek: WeekDay
): Promise<ApiResponse<TimeSlotResponse[]>> {
  return customFetch<ApiResponse<TimeSlotResponse[]>>({
    url: `${CATALOG_TIME_SLOTS_BASE_URL}/catalogs/${catalogId}/day`,
    method: 'GET',
    params: { dayOfWeek }
  })
}

export async function fetchAvailableTimeSlotsByDateApi(
  catalogId: number,
  selectedDate: string
): Promise<ApiResponse<TimeSlotResponse[]>> {
  return customFetch<ApiResponse<TimeSlotResponse[]>>({
    url: `${CATALOG_TIME_SLOTS_BASE_URL}/catalogs/${catalogId}/available`,
    method: 'GET',
    params: { selectedDate }
  })
}

export async function createTimeSlotApi(data: TimeSlotRequest): Promise<ApiResponse<TimeSlotResponse>> {
  return customFetch<ApiResponse<TimeSlotResponse>>({
    url: CATALOG_TIME_SLOTS_BASE_URL,
    method: 'POST',
    data
  })
}

export async function updateTimeSlotApi(
  timeSlotId: number,
  data: TimeSlotUpdateRequest
): Promise<ApiResponse<TimeSlotResponse>> {
  return customFetch<ApiResponse<TimeSlotResponse>>({
    url: `${CATALOG_TIME_SLOTS_BASE_URL}/${timeSlotId}`,
    method: 'PUT',
    data
  })
}

export async function updateTimeSlotActiveStatusApi(
  timeSlotId: number,
  isActive: boolean
): Promise<ApiResponse<TimeSlotResponse>> {
  return customFetch<ApiResponse<TimeSlotResponse>>({
    url: `${CATALOG_TIME_SLOTS_BASE_URL}/${timeSlotId}/active`,
    method: 'PATCH',
    params: { isActive }
  })
}

export async function toggleTimeSlotActiveApi(timeSlotId: number): Promise<ApiResponse<TimeSlotResponse>> {
  return customFetch<ApiResponse<TimeSlotResponse>>({
    url: `${CATALOG_TIME_SLOTS_BASE_URL}/${timeSlotId}/toggle-active`,
    method: 'PUT'
  })
}
