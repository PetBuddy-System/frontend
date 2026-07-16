import { isAxiosError } from 'axios'

import { axiosInstance } from '~/api/mutator/custom-fetch'

export type PetVaccinationStatus =
  | 'UNKNOWN'
  | 'NOT_VACCINATED'
  | 'PARTIALLY_VACCINATED'
  | 'FULLY_VACCINATED'
  | 'EXPIRED'

export type PetStatus = 'ACTIVE' | 'DECEASED'

export interface PetMediaFileResponse {
  mediaFileId: number
  fileUrl: string
  fileKey: string
  fileSize: number
  fileType: 'IMAGE' | 'VIDEO' | 'PDF'
  mediaPurpose:
    | 'PET_PROFILE'
    | 'PRODUCT'
    | 'CATALOG'
    | 'BOOKING'
    | 'BLOG'
    | 'SHIPPING'
    | 'USER_PROFILE'
    | 'RETURN_REQUEST'
  mediaStatus: 'ACTIVE' | 'DELETED'
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
  vaccinationStatus: PetVaccinationStatus
  petStatus: PetStatus
  createdAt: string
  mediaFiles?: PetMediaFileResponse[]
}

export interface PetProfilePayload {
  petName: string
  species: string
  breed?: string
  gender?: string
  dateOfBirth?: string
  weight?: number
  color?: string
  healthNote?: string
  allergyNote?: string
  behaviorNote?: string
  vaccinationStatus?: PetVaccinationStatus
}

export type PetProfileImages = File[] | null

interface ApiResponse<T> {
  code: number
  message: string
  success: boolean
  data: T
  timestamp: string
}

const PETS_BASE_URL = '/api/pets'

function buildPetFormData(payload: PetProfilePayload, images: PetProfileImages = null) {
  const formData = new FormData()
  formData.append('data', JSON.stringify(payload))
  images?.forEach((image) => formData.append('images', image))

  return formData
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

export const petProfileApi = {
  async getPetProfiles() {
    try {
      const response = await axiosInstance.get<ApiResponse<PetProfileResponse[]>>(PETS_BASE_URL)

      return response.data
    } catch (error) {
      throwFriendlyError(error)
    }
  },

  async getPetById(petId: string) {
    try {
      const response = await axiosInstance.get<ApiResponse<PetProfileResponse>>(`${PETS_BASE_URL}/${petId}`)

      return response.data
    } catch (error) {
      throwFriendlyError(error)
    }
  },

  async createPet(payload: PetProfilePayload, images: PetProfileImages = null) {
    try {
      const response = await axiosInstance.post<ApiResponse<PetProfileResponse>>(
        PETS_BASE_URL,
        buildPetFormData(payload, images)
      )

      return response.data
    } catch (error) {
      throwFriendlyError(error)
    }
  },

  async updatePet(petId: string, payload: PetProfilePayload, images: PetProfileImages = null) {
    try {
      const response = await axiosInstance.put<ApiResponse<PetProfileResponse>>(
        `${PETS_BASE_URL}/${petId}`,
        buildPetFormData(payload, images)
      )

      return response.data
    } catch (error) {
      throwFriendlyError(error)
    }
  }
}
