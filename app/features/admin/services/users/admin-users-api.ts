import { isAxiosError } from 'axios'

import { axiosInstance } from '~/api/mutator/custom-fetch'

export type AdminEmployeeRole = 'MANAGER' | 'STAFF'
export type AdminStaffTask = 'GROOMER' | 'SHIPPER' | 'COORDINATOR'
export type AdminUserStatus = 'PENDING' | 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'DELETED'

export interface AdminMediaFileResponse {
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

export interface AdminUserResponse {
  userId: string
  email: string
  fullName: string
  gender: string
  dateOfBirth: string
  role: string
  staffTask?: AdminStaffTask
  status: AdminUserStatus
  paymentFailStreak?: number
  createdAt: string
  updatedAt: string
  mediaFiles?: AdminMediaFileResponse[]
}

export interface AdminEmployeeCreatePayload {
  email: string
  password: string
  fullName: string
  gender: string
  dateOfBirth: string
  role: AdminEmployeeRole
  staffTask?: AdminStaffTask
}

export interface AdminEmployeeUpdatePayload {
  fullName: string
  gender: string
  dateOfBirth: string
  role: AdminEmployeeRole
  staffTask?: AdminStaffTask
}

export interface AdminCustomerCreatePayload {
  email: string
  password: string
  fullName: string
  gender: string
  dateOfBirth: string
  role: 'CUSTOMER'
}

export interface AdminCustomerUpdatePayload {
  fullName: string
  gender: string
  dateOfBirth: string
}

export interface AdminEmployeeFilters {
  page?: number
  role?: AdminEmployeeRole | 'ALL'
  size?: number
  staffTask?: AdminStaffTask | 'ALL'
}

export interface AdminCustomerFilters {
  page?: number
  size?: number
}

export interface PageUserResponse {
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean
  size: number
  content: AdminUserResponse[]
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

const USERS_BASE_URL = '/api/users'

function buildUserFormData(
  payload:
    | AdminEmployeeCreatePayload
    | AdminEmployeeUpdatePayload
    | AdminCustomerCreatePayload
    | AdminCustomerUpdatePayload,
  avatar: File | null = null
) {
  const formData = new FormData()
  formData.append('data', JSON.stringify(payload))
  if (avatar) formData.append('images', avatar)

  return formData
}

function cleanEmployeeFilters(filters: AdminEmployeeFilters = {}) {
  return {
    role: filters.role && filters.role !== 'ALL' ? filters.role : undefined,
    staffTask: filters.staffTask && filters.staffTask !== 'ALL' ? filters.staffTask : undefined,
    page: filters.page ?? 0,
    size: filters.size ?? 10
  }
}

function cleanCustomerFilters(filters: AdminCustomerFilters = {}) {
  return {
    role: 'CUSTOMER',
    page: filters.page ?? 0,
    size: filters.size ?? 10
  }
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

export const adminUsersApi = {
  async getEmployees(filters: AdminEmployeeFilters = {}) {
    try {
      const response = await axiosInstance.get<ApiResponse<PageUserResponse>>(USERS_BASE_URL, {
        params: cleanEmployeeFilters(filters)
      })

      return response.data
    } catch (error) {
      throwFriendlyError(error)
    }
  },

  async createEmployee(payload: AdminEmployeeCreatePayload, avatar: File | null = null) {
    try {
      const response = await axiosInstance.post<ApiResponse<AdminUserResponse>>(
        `${USERS_BASE_URL}/employee`,
        buildUserFormData(payload, avatar)
      )

      return response.data
    } catch (error) {
      throwFriendlyError(error)
    }
  },

  async getCustomers(filters: AdminCustomerFilters = {}) {
    try {
      const response = await axiosInstance.get<ApiResponse<PageUserResponse>>(USERS_BASE_URL, {
        params: cleanCustomerFilters(filters)
      })

      return response.data
    } catch (error) {
      throwFriendlyError(error)
    }
  },

  async createCustomer(payload: AdminCustomerCreatePayload, avatar: File | null = null) {
    try {
      const response = await axiosInstance.post<ApiResponse<AdminUserResponse>>(
        `${USERS_BASE_URL}/customer`,
        buildUserFormData(payload, avatar)
      )

      return response.data
    } catch (error) {
      throwFriendlyError(error)
    }
  },

  async getUser(userId: string) {
    try {
      const response = await axiosInstance.get<ApiResponse<AdminUserResponse>>(`${USERS_BASE_URL}/${userId}`)

      return response.data
    } catch (error) {
      throwFriendlyError(error)
    }
  },

  async updateUser(
    userId: string,
    payload: AdminEmployeeUpdatePayload | AdminCustomerUpdatePayload,
    avatar: File | null = null
  ) {
    try {
      const response = await axiosInstance.put<ApiResponse<AdminUserResponse>>(
        `${USERS_BASE_URL}/${userId}`,
        buildUserFormData(payload, avatar)
      )

      return response.data
    } catch (error) {
      throwFriendlyError(error)
    }
  },

  async updateUserStatus(userId: string, status: AdminUserStatus) {
    try {
      const response = await axiosInstance.put<ApiResponse<AdminUserResponse>>(`${USERS_BASE_URL}/status/${userId}`, {
        status
      })

      return response.data
    } catch (error) {
      throwFriendlyError(error)
    }
  }
}
