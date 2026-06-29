/**
 * Manager feature — batch API service.
 */

import { env } from '~/shared/config/env'
import { customFetch } from '~/api/mutator/custom-fetch'
import type {
  ProductBatchItem,
  PagedProductBatchResponse,
  BatchSortBy,
  FetchProductBatchesParams,
  CreateBatchPayload,
  CreateBatchResponse,
  UpdateBatchPayload,
  UpdateBatchResponse
} from '~/shared/lib/batch'

const PRODUCTS_BASE_URL = `${env.API_URL}${env.API_PRODUCTS_PATH}`
const BATCHES_BASE_URL = `${env.API_URL}${env.API_BATCHES_PATH}`

export async function fetchProductBatchesApi(
  productId: string,
  params: FetchProductBatchesParams = {}
): Promise<PagedProductBatchResponse> {
  const {
    keyword,
    status,
    page = 0,
    size = 10,
    sortBy = 'date_desc'
  } = params

  return customFetch<PagedProductBatchResponse>({
    url: `${PRODUCTS_BASE_URL}/${productId}/batches`,
    method: 'GET',
    params: {
      keyword: keyword || undefined,
      status: status || undefined,
      page,
      size,
      sortBy
    }
  })
}

export async function createBatchesApi(
  productId: string,
  payload: CreateBatchPayload[]
): Promise<CreateBatchResponse> {
  return customFetch<CreateBatchResponse>({
    url: `${PRODUCTS_BASE_URL}/${productId}/batches`,
    method: 'POST',
    data: payload
  })
}

export async function updateBatchApi(
  batchId: string,
  payload: UpdateBatchPayload
): Promise<UpdateBatchResponse> {
  return customFetch<UpdateBatchResponse>({
    url: `${BATCHES_BASE_URL}/${batchId}`,
    method: 'PATCH',
    data: payload
  })
}
