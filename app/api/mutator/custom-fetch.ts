import axios from 'axios'
import type { AxiosRequestConfig } from 'axios'
import { STORAGE_KEYS } from '~/shared/config/site'
import { env } from '~/shared/config/env'
import { readStorage, writeStorage, removeStorage } from '~/shared/lib/storage'

// ─── Axios Instance ──────────────────────────────────────────────────────────

export const axiosInstance = axios.create({
  baseURL: env.API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json'
  }
})

// ─── Interceptors ────────────────────────────────────────────────────────────

// Request Interceptor: Inject Bearer Token + strip Content-Type for FormData
axiosInstance.interceptors.request.use(
  (config) => {
    const token = readStorage(STORAGE_KEYS.accessToken)
    // Only inject Bearer token if it exists and we're not hitting auth endpoints
    if (token && config.headers && !config.url?.includes('/api/auth/')) {
      config.headers['Authorization'] = `Bearer ${token}`
    }

    // When sending FormData, delete Content-Type so Axios auto-sets
    // 'multipart/form-data; boundary=...' correctly. Without this,
    // the instance-level 'application/json' default wins and causes 415.
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type']
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response Interceptor: Handle 401 & Automatic Token Refresh Queue
let isRefreshing = false
let failedQueue: Array<{
  resolve: (value: unknown) => void
  reject: (reason: unknown) => void
}> = []

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      // Do not try to refresh if it's already an auth endpoint
      if (
        originalRequest.url?.includes('/api/auth/login') ||
        originalRequest.url?.includes('/api/auth/refresh')
      ) {
        return Promise.reject(error)
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers['Authorization'] = `Bearer ${token}`
            }
            return axiosInstance(originalRequest)
          })
          .catch((err) => {
            return Promise.reject(err)
          })
      }

      originalRequest._retry = true
      isRefreshing = true

      const refreshToken = readStorage(STORAGE_KEYS.refreshToken)
      if (!refreshToken) {
        isRefreshing = false
        removeStorage(STORAGE_KEYS.accessToken)
        removeStorage(STORAGE_KEYS.refreshToken)
        removeStorage(STORAGE_KEYS.user)
        return Promise.reject(error)
      }

      try {
        // Use basic axios to prevent interceptor loop on /api/auth/refresh
        const refreshResponse = await axios.post(`${env.API_URL}/api/auth/refresh`, {
          refreshToken
        })

        const resData = refreshResponse.data
        if (resData && resData.success && resData.data) {
          const { accessToken: newAccessToken, refreshToken: newRefreshToken, userResponse } = resData.data

          // Persist the new tokens
          writeStorage(STORAGE_KEYS.accessToken, newAccessToken)
          writeStorage(STORAGE_KEYS.refreshToken, newRefreshToken)
          writeStorage(STORAGE_KEYS.user, JSON.stringify(userResponse))

          processQueue(null, newAccessToken)

          if (originalRequest.headers) {
            originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`
          }
          return axiosInstance(originalRequest)
        }
      } catch (refreshError: unknown) {
        processQueue(
          refreshError instanceof Error ? refreshError : new Error('Refresh token failed'),
          null
        )
        removeStorage(STORAGE_KEYS.accessToken)
        removeStorage(STORAGE_KEYS.refreshToken)
        removeStorage(STORAGE_KEYS.user)
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

// ─── Custom Fetch Mutator (For Orval & Manual Services) ─────────────────────

type RequestOptions = {
  url: string
  method: string
  headers?: Record<string, string>
  params?: Record<string, string | number | boolean | undefined>
  data?: unknown
  signal?: AbortSignal
}

export async function customFetch<T>(options: RequestOptions): Promise<T> {
  const { url, method, headers, params, data, signal } = options

  const config: AxiosRequestConfig = {
    url,
    method,
    headers,
    params,
    data,
    signal
  }

  try {
    const response = await axiosInstance(config)
    return response.data as T
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      throw Object.assign(new Error(error.response.data?.message ?? 'API error'), {
        status: error.response.status,
        data: error.response.data
      })
    }
    throw error
  }
}
