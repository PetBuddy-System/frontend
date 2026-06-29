/**
 * Landing feature — blog API service.
 */

import { env } from '~/shared/config/env'
import { customFetch } from '~/api/mutator/custom-fetch'
import type {
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
