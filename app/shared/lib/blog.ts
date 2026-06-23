/**
 * Blog types — chỉ chứa types/interfaces, không có API functions.
 * API functions nằm trong features/services/.
 */

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
