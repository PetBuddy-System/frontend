import { env } from '~/shared/config/env'
import { customFetch } from '~/api/mutator/custom-fetch'

export interface StatCard {
  value: number
  changePercent: number | null
}

export interface TrendPoint {
  date: string
  label: string
  revenue: number
}

export interface CompositionItem {
  label: string
  amount: number
  percent: number
}

export interface DashboardResponse {
  totalRevenue: StatCard
  profit: StatCard
  avgOrderValue: StatCard
  revenueTrend: TrendPoint[]
  revenueComposition: CompositionItem[]
}

const DASHBOARD_BASE_URL = `${env.API_URL}/api/dashboard`

export async function fetchRevenueDashboardApi(
  periodType?: 'DAY' | 'WEEK' | 'YEAR',
  referenceDate?: string
): Promise<DashboardResponse> {
  const params = new URLSearchParams()
  if (periodType) params.append('periodType', periodType)
  if (referenceDate) params.append('referenceDate', referenceDate)

  const url = params.toString() ? `${DASHBOARD_BASE_URL}/revenue?${params}` : `${DASHBOARD_BASE_URL}/revenue`
  return customFetch<DashboardResponse>({
    url,
    method: 'GET'
  })
}
