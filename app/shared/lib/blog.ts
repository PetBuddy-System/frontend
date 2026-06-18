/**
 * Blog API types & service functions using customFetch (Axios).
 *
 * Automatic 401 retries and refresh token flow are handled globally in the
 * customFetch response interceptors.
 */

import { customFetch } from '~/api/mutator/custom-fetch'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface BlogResponse {
  blogId: string
  userId?: string
  title: string
  content: string
  snippet: string
  label: string
  imageUrls: string[]
  createdAt: string
}

export interface ApiResponse<T> {
  code: number
  message: string
  success: boolean
  data: T
  timestamp: string
}

export interface PageMeta {
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export interface PagedBlogResponse {
  code: number
  message: string
  success: boolean
  data: {
    content: BlogResponse[]
    page: PageMeta
  }
  timestamp: string
}

export interface FetchBlogsParams {
  keyword?: string
  page?: number
  size?: number
}

export interface BlogDetailResponse {
  code: number
  message: string
  success: boolean
  data: BlogResponse
  timestamp: string
}

// ─── API Functions ──────────────────────────────────────────────────────────

export async function fetchBlogsApi(
  params: FetchBlogsParams = {}
): Promise<PagedBlogResponse> {
  const { keyword = '', page = 0, size = 9 } = params

  return customFetch<PagedBlogResponse>({
    url: '/api/blogs',
    method: 'GET',
    params: {
      keyword: keyword || undefined,
      page,
      size
    }
  })
}

export async function fetchBlogByIdApi(blogId: string): Promise<BlogDetailResponse> {
  return customFetch<BlogDetailResponse>({
    url: `/api/blogs/${blogId}`,
    method: 'GET'
  })
}

export async function createBlogApi(blogData: {
  title: string
  content: string
  label: string
  snippet: string
}, images?: File[]): Promise<ApiResponse<BlogResponse>> {
  const formData = new FormData()
  formData.append('data', JSON.stringify(blogData))

  if (images) {
    for (const file of images) {
      formData.append('images', file)
    }
  }

  return customFetch<ApiResponse<BlogResponse>>({
    url: '/api/blogs',
    method: 'POST',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

export async function updateBlogApi(
  blogId: string,
  blogData: {
    title: string
    content: string
    label: string
    snippet: string
  },
  images?: File[]
): Promise<ApiResponse<BlogResponse>> {
  const formData = new FormData()
  formData.append('data', JSON.stringify(blogData))

  if (images) {
    for (const file of images) {
      formData.append('images', file)
    }
  }

  return customFetch<ApiResponse<BlogResponse>>({
    url: `/api/blogs/${blogId}`,
    method: 'PUT',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

