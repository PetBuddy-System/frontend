import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import booleanPointInPolygon from '@turf/boolean-point-in-polygon'
import { point } from '@turf/helpers'

import { ManagerSidebar } from '../components/layout/manager-sidebar'
import { ManagerTopNav } from '../components/layout/manager-top-nav'
import {
  createStoreLocationApi,
  getAllStoreLocationsApi,
  getCurrentStoreLocationApi
} from '../services/store-location/store-location-api'
import type { StoreLocationResponse } from '~/shared/lib/store-location'

import { StoreLocationInfo } from '../components/store-locations/store-location-info'
import { StoreLocationMap } from '../components/store-locations/store-location-map'
import { StoreLocationEditForm } from '../components/store-locations/store-location-edit-form'
import { StoreLocationHistory } from '../components/store-locations/store-location-history'

const DEFAULT_LAT = 10.776889
const DEFAULT_LON = 106.700806

async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=vi`
    )
    const data = await res.json()
    return data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`
  } catch (e) {
    console.error(e)
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`
  }
}

type LocationMode = 'view' | 'edit' | 'create'

export function ManagerStoreLocationsPage() {
  const { t } = useTranslation('manager')

  const [mode, setMode] = useState<LocationMode>('view')
  const [isSaving, setIsSaving] = useState(false)
  const [selectedAddress, setSelectedAddress] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const [currentLocation, setCurrentLocation] = useState<StoreLocationResponse | null>(null)
  const [historyLocations, setHistoryLocations] = useState<StoreLocationResponse[]>([])
  const [hcmBoundary, setHcmBoundary] = useState<any>(null)

  const [coords, setCoords] = useState<{ lat: number; lng: number }>({
    lat: DEFAULT_LAT,
    lng: DEFAULT_LON
  })

  async function loadData() {
    try {
      const curRes = await getCurrentStoreLocationApi()
      if (curRes.success && curRes.data) {
        setCurrentLocation(curRes.data)
      }
    } catch (err) {
      console.error('Failed to load current store location', err)
    }

    try {
      const allRes = await getAllStoreLocationsApi()
      if (allRes.success && allRes.data) {
        setHistoryLocations(allRes.data)
      }
    } catch (err) {
      console.error('Failed to load store locations history', err)
    }
  }

  useEffect(() => {
    void loadData()
  }, [])

  // Load HCM Boundary GeoJSON
  useEffect(() => {
    fetch('/hcm_boundary.geojson')
      .then((res) => res.json())
      .then((data) => {
        setHcmBoundary(data)
      })
      .catch((err) => {
        console.error('Load boundary failed', err)
      })
  }, [])

  async function updateLocation(lat: number, lng: number, reverseGeocode_: boolean) {
    setCoords({ lat, lng })
    if (reverseGeocode_) {
      const addr = await reverseGeocode(lat, lng)
      setSelectedAddress(addr)
    }
  }

  function isInHoChiMinhCity(lat: number, lng: number): boolean {
    if (!hcmBoundary) {
      return false
    }
    const p = point([lng, lat])
    return hcmBoundary.features.some((feature: any) => booleanPointInPolygon(p, feature))
  }

  function handleStartUpdate() {
    if (currentLocation) {
      setCoords({ lat: currentLocation.latitude, lng: currentLocation.longitude })
      setSelectedAddress(currentLocation.address)
    }
    setErrorMsg('')
    setSuccessMsg('')
    setMode('edit')
  }

  function handleStartCreate() {
    setCoords({ lat: DEFAULT_LAT, lng: DEFAULT_LON })
    setSelectedAddress('')
    setErrorMsg('')
    setSuccessMsg('')
    setMode('create')
  }

  function handleCancel() {
    setErrorMsg('')
    setSuccessMsg('')
    setMode('view')
  }

  async function handleSave() {
    setErrorMsg('')
    setSuccessMsg('')

    if (!selectedAddress.trim()) {
      setErrorMsg(t('storeLocations.errors.emptyAddress', 'Địa chỉ không được để trống.'))
      return
    }

    if (!hcmBoundary) {
      setErrorMsg(t('storeLocations.errors.boundaryLoading', 'Đang tải bản đồ ranh giới...'))
      return
    }

    const inHCMC = isInHoChiMinhCity(coords.lat, coords.lng)
    if (!inHCMC) {
      setErrorMsg(t('storeLocations.errors.outsideHcmc', 'Vị trí phải nằm trong địa phận TP. Hồ Chí Minh.'))
      return
    }

    setIsSaving(true)
    try {
      const res = await createStoreLocationApi({
        latitude: coords.lat,
        longitude: coords.lng,
        address: selectedAddress
      })

      if (res.success && res.data) {
        setSuccessMsg(t('storeLocations.success', 'Đã lưu cấu hình vị trí thành công.'))
        setMode('view')
        void loadData()
      } else {
        setErrorMsg(res.message || t('storeLocations.error', 'Có lỗi xảy ra khi lưu.'))
      }
    } catch (err: any) {
      setErrorMsg(err?.message || t('storeLocations.error', 'Có lỗi xảy ra khi lưu.'))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className='flex h-screen overflow-hidden bg-background text-foreground font-body-md'>
      <ManagerSidebar activeItem='storeLocations' />
      <div className='flex min-w-0 flex-1 flex-col overflow-hidden'>
        <ManagerTopNav titleKey='storeLocations.title' subtitleKey='storeLocations.subtitle' />
        <main className='flex-1 overflow-y-auto bg-background p-4 md:p-6 pb-24'>
          <div className='mx-auto flex max-w-6xl flex-col gap-8'>
            {/* Title Section */}
            <div className='text-center'>
              <h1 className='font-display text-2xl font-bold text-foreground md:text-3xl mb-2'>
                {t('storeLocations.title', 'Chọn vị trí trên bản đồ')}
              </h1>
              <p className='text-sm text-muted-foreground'>
                {t(
                  'storeLocations.subtitle',
                  'Xác định chính xác vị trí cửa hàng của bạn để khách hàng dễ dàng tìm kiếm'
                )}
              </p>
            </div>

            {/* Current location card + action buttons (always visible) */}
            <StoreLocationInfo
              currentLocation={currentLocation}
              mode={mode}
              onStartUpdate={handleStartUpdate}
              onStartCreate={handleStartCreate}
            />

            {/* Map + edit form - only visible when updating/creating */}
            {mode !== 'view' && (
              <>
                <StoreLocationMap coords={coords} updateLocation={updateLocation} />
                <StoreLocationEditForm
                  mode={mode}
                  selectedAddress={selectedAddress}
                  setSelectedAddress={setSelectedAddress}
                  coords={coords}
                  isSaving={isSaving}
                  errorMsg={errorMsg}
                  successMsg={successMsg}
                  onSave={handleSave}
                  onCancel={handleCancel}
                />
              </>
            )}

            {/* History locations */}
            <StoreLocationHistory historyLocations={historyLocations} />
          </div>
        </main>
      </div>
    </div>
  )
}
