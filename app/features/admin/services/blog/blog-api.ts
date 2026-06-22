/**
 * Admin feature — blog API service.
 * Chỉ export functions thực sự được sử dụng trong feature.
 */

import { env } from '~/shared/config/env'
import { customFetch } from '~/api/mutator/custom-fetch'
import type {
  BlogResponse,
  ApiResponse,
  PagedBlogResponse,
  FetchBlogsParams,
  BlogDetailResponse
} from '~/shared/lib/blog'

const BLOGS_BASE_URL = `${env.API_URL}${env.API_BLOGS_PATH}`

export async function fetchBlogsApi(
  params: FetchBlogsParams = {}
): Promise<PagedBlogResponse> {
  const { keyword = '', page = 0, size = 9 } = params

  return customFetch<PagedBlogResponse>({
    url: BLOGS_BASE_URL,
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
    url: `${BLOGS_BASE_URL}/${blogId}`,
    method: 'GET'
  })
}

export async function createBlogApi(
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
    url: BLOGS_BASE_URL,
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
    url: `${BLOGS_BASE_URL}/${blogId}`,
    method: 'PUT',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}
