import { http, HttpResponse } from 'msw'
import { env } from '~/shared/config/env'
import type { ShippingRule } from '~/shared/lib/shipping'

const BASE = env.LOCALHOST_API_URL || env.API_URL || ''
const STORE_LAT = 10.776889
const STORE_LON = 106.700806
const FREE_SHIP_RADIUS = 5.0

// In-memory shipping rules list initialized with default values from the admin layout
const mockShippingRules: ShippingRule[] = [
  { id: 1, minDistance: 0, maxDistance: 2, fee: 0 },
  { id: 2, minDistance: 2, maxDistance: 5, fee: 15000 },
  { id: 3, minDistance: 5, maxDistance: 10, fee: 30000 },
  { id: 4, minDistance: 10, maxDistance: 20, fee: 50000 }
]

let nextId = 5

// Haversine distance calculator matching Spring Boot implementation
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return 6371 * c // Earth radius in km
}

function isInsideHCM(lat: number, lon: number): boolean {
  const MIN_LAT = 10.35
  const MIN_LON = 106.30
  const MAX_LAT = 11.20
  const MAX_LON = 107.10
  return lat >= MIN_LAT && lat <= MAX_LAT && lon >= MIN_LON && lon <= MAX_LON
}

export const shippingHandlers = [
  // GET /api/shipping-rules - Get all rules
  http.get(`${BASE}/api/shipping-rules`, () => {
    return HttpResponse.json({
      success: true,
      message: 'Get Shipping Rule Successfully',
      data: mockShippingRules
    })
  }),

  // GET /api/shipping-rules/fee - Calculate shipping fee based on distance
  http.get(`${BASE}/api/shipping-rules/fee`, ({ request }) => {
    const url = new URL(request.url)
    const latParam = url.searchParams.get('latitude')
    const lonParam = url.searchParams.get('longitude')

    if (!latParam || !lonParam) {
      return HttpResponse.json(
        { success: false, message: 'Thiếu tọa độ kinh độ hoặc vĩ độ.' },
        { status: 400 }
      )
    }

    const lat = parseFloat(latParam)
    const lon = parseFloat(lonParam)

    if (isNaN(lat) || lat < -90 || lat > 90 || isNaN(lon) || lon < -180 || lon > 180) {
      return HttpResponse.json(
        { success: false, message: 'Tọa độ kinh độ hoặc vĩ độ không hợp lệ.' },
        { status: 400 }
      )
    }

    if (!isInsideHCM(lat, lon)) {
      return HttpResponse.json(
        { success: false, message: 'Vị trí được chọn nằm ngoài khu vực hỗ trợ Hồ Chí Minh.' },
        { status: 400 }
      )
    }

    const distance = calculateDistance(STORE_LAT, STORE_LON, lat, lon)

    // Match free shipping logic
    if (distance <= FREE_SHIP_RADIUS) {
      return HttpResponse.json({
        success: true,
        data: {
          distanceKm: distance,
          shippingFee: 0,
          freeShipping: true
        }
      })
    }

    // Match rules from DB
    const matchedRule = mockShippingRules.find(
      (rule) => distance >= rule.minDistance && distance <= rule.maxDistance
    )

    if (!matchedRule) {
      // Fallback rule if no overlapping distance matches, e.g. distance is too far
      return HttpResponse.json({
        success: true,
        data: {
          distanceKm: distance,
          shippingFee: 80000,
          freeShipping: false
        }
      })
    }

    return HttpResponse.json({
      success: true,
      data: {
        distanceKm: distance,
        shippingFee: matchedRule.fee,
        freeShipping: false
      }
    })
  }),

  // GET /api/shipping-rules/:id - Get rule by ID
  http.get(`${BASE}/api/shipping-rules/:id`, ({ params }) => {
    const id = parseInt(params.id as string, 10)
    const rule = mockShippingRules.find((r) => r.id === id)

    if (!rule) {
      return HttpResponse.json(
        { success: false, message: 'Không tìm thấy cấu hình phí vận chuyển này.' },
        { status: 404 }
      )
    }

    return HttpResponse.json({
      success: true,
      message: 'Get Shipping Rule Successfully',
      data: rule
    })
  }),

  // POST /api/shipping-rules - Create new rule
  http.post(`${BASE}/api/shipping-rules`, async ({ request }) => {
    const body = (await request.json()) as { minDistance: number; maxDistance: number; fee: number }

    // Check overlap
    const existsOverlap = mockShippingRules.some(
      (r) =>
        (body.minDistance >= r.minDistance && body.minDistance <= r.maxDistance) ||
        (body.maxDistance >= r.minDistance && body.maxDistance <= r.maxDistance)
    )

    if (existsOverlap) {
      return HttpResponse.json(
        { success: false, message: 'Quy tắc vận chuyển bị trùng lặp khoảng cách với quy tắc khác.' },
        { status: 400 }
      )
    }

    if (body.minDistance > body.maxDistance) {
      return HttpResponse.json(
        { success: false, message: 'Khoảng cách tối thiểu không được lớn hơn tối đa.' },
        { status: 400 }
      )
    }

    const newRule: ShippingRule = {
      id: nextId++,
      minDistance: body.minDistance,
      maxDistance: body.maxDistance,
      fee: body.fee
    }

    mockShippingRules.push(newRule)
    // Sort rules by minDistance
    mockShippingRules.sort((a, b) => a.minDistance - b.minDistance)

    return HttpResponse.json({
      success: true,
      message: 'Tạo quy tắc vận chuyển thành công',
      data: newRule
    })
  }),

  // PUT /api/shipping-rules/:id - Update rule
  http.put(`${BASE}/api/shipping-rules/:id`, async ({ params, request }) => {
    const id = parseInt(params.id as string, 10)
    const body = (await request.json()) as { minDistance: number; maxDistance: number; fee: number }
    const index = mockShippingRules.findIndex((r) => r.id === id)

    if (index === -1) {
      return HttpResponse.json(
        { success: false, message: 'Không tìm thấy cấu hình phí vận chuyển này.' },
        { status: 404 }
      )
    }

    // Check overlap excluding current editing ID
    const existsOverlap = mockShippingRules.some(
      (r) =>
        r.id !== id &&
        ((body.minDistance >= r.minDistance && body.minDistance <= r.maxDistance) ||
          (body.maxDistance >= r.minDistance && body.maxDistance <= r.maxDistance))
    )

    if (existsOverlap) {
      return HttpResponse.json(
        { success: false, message: 'Quy tắc vận chuyển bị trùng lặp khoảng cách với quy tắc khác.' },
        { status: 400 }
      )
    }

    const updatedRule = {
      ...mockShippingRules[index],
      minDistance: body.minDistance,
      maxDistance: body.maxDistance,
      fee: body.fee
    }

    mockShippingRules[index] = updatedRule
    mockShippingRules.sort((a, b) => a.minDistance - b.minDistance)

    return HttpResponse.json({
      success: true,
      message: 'Cập nhật quy tắc thành công',
      data: updatedRule
    })
  }),

  // DELETE /api/shipping-rules/:id - Delete rule
  http.delete(`${BASE}/api/shipping-rules/:id`, ({ params }) => {
    const id = parseInt(params.id as string, 10)
    const index = mockShippingRules.findIndex((r) => r.id === id)

    if (index === -1) {
      return HttpResponse.json(
        { success: false, message: 'Không tìm thấy cấu hình phí vận chuyển này.' },
        { status: 404 }
      )
    }

    mockShippingRules.splice(index, 1)

    return HttpResponse.json({
      success: true,
      message: 'Delete Shipping Rule Successfully',
      data: null
    })
  })
]
