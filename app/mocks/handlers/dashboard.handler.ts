import { http, HttpResponse } from 'msw'
import { env } from '~/shared/config/env'
import type { DashboardResponse } from '~/features/admin/services/dashboard/dashboard-api'

const BASE = env.API_URL || ''

export const dashboardHandlers = [
  http.get(`${BASE}/api/dashboard/revenue`, ({ request }) => {
    const url = new URL(request.url)
    const periodType = url.searchParams.get('periodType') || 'DAY'

    let orderCountValue = 35
    let orderCountPercent = 12.8
    let trendPoints = [
      { date: '2026-07-15T00:00:00', label: '00:00', revenue: 1200000 },
      { date: '2026-07-15T04:00:00', label: '04:00', revenue: 800000 },
      { date: '2026-07-15T08:00:00', label: '08:00', revenue: 4500000 },
      { date: '2026-07-15T12:00:00', label: '12:00', revenue: 8200000 },
      { date: '2026-07-15T16:00:00', label: '16:00', revenue: 6400000 },
      { date: '2026-07-15T20:00:00', label: '20:00', revenue: 10500000 }
    ]

    if (periodType === 'WEEK') {
      orderCountValue = 245
      orderCountPercent = 5.2
      trendPoints = [
        { date: '2026-07-10', label: 'mon', revenue: 12500000 },
        { date: '2026-07-11', label: 'tue', revenue: 15200000 },
        { date: '2026-07-12', label: 'wed', revenue: 11800000 },
        { date: '2026-07-13', label: 'thu', revenue: 18500000 },
        { date: '2026-07-14', label: 'fri', revenue: 14200000 },
        { date: '2026-07-15', label: 'sat', revenue: 25400000 },
        { date: '2026-07-16', label: 'sun', revenue: 28900000 }
      ]
    } else if (periodType === 'MONTH') {
      orderCountValue = 1120
      orderCountPercent = -2.1
      trendPoints = [
        { date: '2026-07-01', label: 'W1', revenue: 45000000 },
        { date: '2026-07-08', label: 'W2', revenue: 58000000 },
        { date: '2026-07-15', label: 'W3', revenue: 72000000 },
        { date: '2026-07-22', label: 'W4', revenue: 61000000 }
      ]
    }

    const response: DashboardResponse = {
      totalRevenue: {
        value: 124500000,
        changePercent: 12.5
      },
      orderCount: {
        value: orderCountValue,
        changePercent: orderCountPercent
      },
      avgOrderValue: {
        value: 364000,
        changePercent: 8.4
      },
      revenueTrend: trendPoints,
      revenueComposition: [
        { label: 'products', amount: 68475000, percent: 55 },
        { label: 'grooming', amount: 37350000, percent: 30 },
        { label: 'medical', amount: 18675000, percent: 15 }
      ]
    }

    return HttpResponse.json(response)
  })
]
