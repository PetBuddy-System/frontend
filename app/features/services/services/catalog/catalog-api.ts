import axios from 'axios'

import { axiosInstance } from '~/api/mutator/custom-fetch'

export interface CatalogResponse {
  catalogId: number
  catalogName: string
  description?: string | null
  catalogType: string
  petSpecies: string
  price: number
  weightRange?: string | null
  durationMinute: number
  bufferTime: number
  status: string
  surchargeConfig?: string | null
  createdAt?: string
  updatedAt?: string
}

interface ApiResponse<T> {
  data: T
  message?: string
  success?: boolean
}

function unwrapResponse<T>(payload: ApiResponse<T> | T): T {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return (payload as ApiResponse<T>).data
  }

  return payload as T
}

function toCatalogError(error: unknown): Error {
  if (!axios.isAxiosError(error)) {
    return error instanceof Error ? error : new Error('Unable to load service catalog.')
  }

  const responseData = error.response?.data as { message?: string; error?: string } | undefined
  return new Error(responseData?.message ?? responseData?.error ?? error.message)
}

export async function fetchServiceCatalogs(): Promise<CatalogResponse[]> {
  try {
    const response = await axiosInstance.get<ApiResponse<CatalogResponse[]> | CatalogResponse[]>('/api/catalogs')

    return unwrapResponse(response.data)
  } catch (error) {
    throw toCatalogError(error)
  }
}
