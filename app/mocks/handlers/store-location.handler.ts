// mocks/handlers/store-location.handler.ts
import { http, HttpResponse } from 'msw'
import { env } from '~/shared/config/env'
import type { StoreLocationResponse } from '~/shared/lib/store-location'

const BASE = env.API_URL || ''

let mockStoreLocations: StoreLocationResponse[] = [
  {
    id: 1,
    latitude: 10.776889,
    longitude: 106.700806,
    address: 'PetBuddy Store Quận 1, Thành phố Hồ Chí Minh, Việt Nam',
    active: true,
    createdAt: new Date().toISOString(),
    deactivatedAt: null
  }
]

export const storeLocationHandlers = [
  // GET /api/store-locations
  http.get(`${BASE}/api/store-locations`, () => {
    return HttpResponse.json({
      success: true,
      message: 'All store locations retrieved successfully',
      data: mockStoreLocations
    })
  }),

  // GET /api/store-locations/current
  http.get(`${BASE}/api/store-locations/current`, () => {
    const current = mockStoreLocations.find((loc) => loc.active) || mockStoreLocations[0]
    return HttpResponse.json({
      success: true,
      message: 'Current store location retrieved successfully',
      data: current
    })
  }),

  // GET /api/store-locations/:id
  http.get(`${BASE}/api/store-locations/:id`, ({ params }) => {
    const id = parseInt(params.id as string, 10)
    const loc = mockStoreLocations.find((l) => l.id === id)
    if (!loc) {
      return HttpResponse.json(
        { success: false, message: 'Store location not found' },
        { status: 404 }
      )
    }
    return HttpResponse.json({
      success: true,
      message: 'Store location retrieved successfully',
      data: loc
    })
  }),

  // POST /api/store-locations
  http.post(`${BASE}/api/store-locations`, async ({ request }) => {
    const body = (await request.json()) as { latitude: number; longitude: number; address: string }
    
    // Deactivate previous active location
    mockStoreLocations = mockStoreLocations.map((loc) => ({
      ...loc,
      active: false,
      deactivatedAt: loc.active ? new Date().toISOString() : loc.deactivatedAt
    }))

    const newLoc: StoreLocationResponse = {
      id: Date.now(),
      latitude: body.latitude,
      longitude: body.longitude,
      address: body.address,
      active: true,
      createdAt: new Date().toISOString(),
      deactivatedAt: null
    }

    mockStoreLocations.push(newLoc)
    return HttpResponse.json({
      success: true,
      message: 'Store location created successfully',
      data: newLoc
    })
  }),

  // PUT /api/store-locations/:id
  http.put(`${BASE}/api/store-locations/:id`, async ({ params, request }) => {
    const id = parseInt(params.id as string, 10)
    const body = (await request.json()) as { latitude: number; longitude: number; address: string }
    
    const index = mockStoreLocations.findIndex((l) => l.id === id)
    if (index === -1) {
      return HttpResponse.json(
        { success: false, message: 'Store location not found' },
        { status: 404 }
      )
    }

    mockStoreLocations[index] = {
      ...mockStoreLocations[index],
      latitude: body.latitude,
      longitude: body.longitude,
      address: body.address
    }

    return HttpResponse.json({
      success: true,
      message: 'Store location updated successfully',
      data: mockStoreLocations[index]
    })
  })
]
