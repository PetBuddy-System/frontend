import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import booleanPointInPolygon from '@turf/boolean-point-in-polygon'
import { point } from '@turf/helpers'

import { MaterialIcon } from '~/shared/ui'
import { ManagerSidebar } from '../components/layout/manager-sidebar'
import { ManagerTopNav } from '../components/layout/manager-top-nav'
import {
  createStoreLocationApi,
  getAllStoreLocationsApi,
  getCurrentStoreLocationApi
} from '../services/store-location/store-location-api'
import type { StoreLocationResponse } from '~/shared/lib/store-location'

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

const LEAFLET_OVERRIDE_STYLES = `
  .pb-map-wrapper {
    position: relative !important;
    overflow: hidden !important;
  }
  .pb-map-wrapper .leaflet-container {
    position: relative !important;
    width: 100% !important;
    height: 100% !important;
    max-width: 100% !important;
    border-radius: inherit;
  }
`

export function ManagerStoreLocationsPage() {
  const { t } = useTranslation('manager')

  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markerRef = useRef<any>(null)

  const [isLeafletLoaded, setIsLeafletLoaded] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [searchError, setSearchError] = useState('')
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

  // Load current location & history
  async function loadData() {
    try {
      const curRes = await getCurrentStoreLocationApi()
      if (curRes.success && curRes.data) {
        setCurrentLocation(curRes.data)
        setCoords({ lat: curRes.data.latitude, lng: curRes.data.longitude })
        setSelectedAddress(curRes.data.address)
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

  // Dynamic Leaflet Injection
  useEffect(() => {
    if (typeof window === 'undefined') return

    if ((window as any).L) {
      setIsLeafletLoaded(true)
      return
    }

    let cssLoaded = false
    let jsLoaded = false

    const checkBothLoaded = () => {
      if (cssLoaded && jsLoaded) setIsLeafletLoaded(true)
    }
    let link = document.querySelector<HTMLLinkElement>('link[data-leaflet]')
    if (!link) {
      link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      link.crossOrigin = ''
      link.setAttribute('data-leaflet', 'true')
      link.onload = () => {
        cssLoaded = true
        checkBothLoaded()
      }
      document.head.appendChild(link)
    } else {
      cssLoaded = true
    }

    let script = document.querySelector<HTMLScriptElement>('script[data-leaflet]')
    if (!script) {
      script = document.createElement('script')
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
      script.crossOrigin = ''
      script.setAttribute('data-leaflet', 'true')
      script.onload = () => {
        jsLoaded = true
        checkBothLoaded()
      }
      document.head.appendChild(script)
    } else if ((window as any).L) {
      jsLoaded = true
    }

    checkBothLoaded()
  }, [])

  // Initialize Map
  useEffect(() => {
    if (!isLeafletLoaded || !mapContainerRef.current || typeof window === 'undefined') return

    const L = (window as any).L
    if (!L || mapInstanceRef.current) return
    const container: any = mapContainerRef.current
    if (container._leaflet_id) {
      container._leaflet_id = null
    }

    const map = L.map(mapContainerRef.current, {
      center: [coords.lat, coords.lng],
      zoom: 13,
      scrollWheelZoom: true
    })
    const leafletEl = map.getContainer()
    const forcedStyles: Record<string, string> = {
      position: 'relative',
      top: 'auto',
      left: 'auto',
      right: 'auto',
      bottom: 'auto',
      inset: 'auto',
      width: '100%',
      height: '100%',
      'max-width': '100%',
      'max-height': '100%',
      'z-index': '0'
    }
    Object.entries(forcedStyles).forEach(([prop, value]) => {
      leafletEl.style.setProperty(prop, value, 'important')
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map)

    const DefaultIcon = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    })

    const marker = L.marker([coords.lat, coords.lng], {
      draggable: true,
      icon: DefaultIcon
    }).addTo(map)

    marker.on('dragend', async () => {
      const pos = marker.getLatLng()
      await updateLocation(pos.lat, pos.lng, true)
    })

    map.on('click', async (e: any) => {
      await updateLocation(e.latlng.lat, e.latlng.lng, true)
    })

    mapInstanceRef.current = map
    markerRef.current = marker

    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize()
    })
    resizeObserver.observe(mapContainerRef.current)

    return () => {
      resizeObserver.disconnect()
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [isLeafletLoaded])

  async function updateLocation(lat: number, lng: number, reverseGeocode_: boolean) {
    setCoords({ lat, lng })
    if (markerRef.current) markerRef.current.setLatLng([lat, lng])
    if (mapInstanceRef.current)
      mapInstanceRef.current.setView([lat, lng], mapInstanceRef.current.getZoom())

    if (reverseGeocode_) {
      const addr = await reverseGeocode(lat, lng)
      setSelectedAddress(addr)
    }
  }

  function handleGetMyLocation() {
    if (!navigator.geolocation) {
      setSearchError(t('storeLocations.errors.invalidLocation'))
      return
    }
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        await updateLocation(latitude, longitude, true)
        setSearchError('')
      },
      () => {
        setSearchError(t('storeLocations.errors.invalidLocation'))
      }
    )
  }

  async function handleSearchAddress(e: React.FormEvent) {
    e.preventDefault()
    if (!searchQuery.trim()) return
    setIsSearching(true)
    setSearchError('')

    try {
      const query = `${searchQuery}, Thành phố Hồ Chí Minh, Việt Nam`
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&accept-language=vi`
      )
      const data = await res.json()

      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat)
        const lng = parseFloat(data[0].lon)
        await updateLocation(lat, lng, true)
        setSearchError('')
      } else {
        setSearchError(t('storeLocations.errors.invalidLocation'))
      }
    } catch {
      setSearchError(t('storeLocations.errors.invalidLocation'))
    } finally {
      setIsSearching(false)
    }
  }

  function isInHoChiMinhCity(lat: number, lng: number): boolean {
    if (!hcmBoundary) {
      return false
    }
    const p = point([lng, lat])
    return hcmBoundary.features.some((feature: any) => booleanPointInPolygon(p, feature))
  }

  async function handleSave() {
    setErrorMsg('')
    setSuccessMsg('')

    if (!selectedAddress.trim()) {
      setErrorMsg(t('storeLocations.errors.emptyAddress'))
      return
    }

    if (!hcmBoundary) {
      setErrorMsg(t('storeLocations.errors.boundaryLoading'))
      return
    }

    const inHCMC = isInHoChiMinhCity(coords.lat, coords.lng)
    if (!inHCMC) {
      setErrorMsg(t('storeLocations.errors.outsideHcmc'))
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
        setSuccessMsg(t('storeLocations.success'))
        void loadData()
      } else {
        setErrorMsg(res.message || t('storeLocations.error'))
      }
    } catch (err: any) {
      setErrorMsg(err?.message || t('storeLocations.error'))
    } finally {
      setIsSaving(false)
    }
  }

  function formatDate(dateStr: string) {
    if (!dateStr) return '—'
    const normalized = dateStr.includes('Z') || dateStr.includes('+') ? dateStr : dateStr + 'Z'
    const d = new Date(normalized)
    if (isNaN(d.getTime())) return dateStr
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1)
      .toString()
      .padStart(2, '0')}/${d.getFullYear()} ${d.getHours().toString().padStart(2, '0')}:${d
      .getMinutes()
      .toString()
      .padStart(2, '0')}`
  }

  return (
    <div className='flex h-screen overflow-hidden bg-background text-foreground font-body-md'>
      <ManagerSidebar activeItem='storeLocations' />
      <div className='flex min-w-0 flex-1 flex-col overflow-hidden'>
        <ManagerTopNav titleKey='storeLocations.title' subtitleKey='storeLocations.subtitle' />
        <main className='flex-1 overflow-y-auto bg-background p-4 md:p-6'>
          <div className='mx-auto flex max-w-7xl flex-col gap-6'>
            
            {/* Header section */}
            <div>
              <h1 className='font-display text-2xl font-bold text-primary md:text-3xl'>
                {t('storeLocations.title')}
              </h1>
              <p className='mt-1 text-sm text-muted-foreground'>{t('storeLocations.subtitle')}</p>
            </div>

            {/* Main Content Grid */}
            <div className='grid grid-cols-1 lg:grid-cols-12 gap-6'>
              
              {/* Left Form: Edit/Details */}
              <div className='lg:col-span-5 flex flex-col gap-4'>
                
                {/* Active Location Info Card */}
                {currentLocation && (
                  <div className='rounded-2xl border border-primary/20 bg-primary/5 p-4 flex items-start gap-3 shadow-sm'>
                    <MaterialIcon name='storefront' className='text-primary text-[24px] shrink-0 mt-0.5' />
                    <div>
                      <h3 className='text-xs font-bold text-primary uppercase tracking-wider'>{t('storeLocations.currentLocation')}</h3>
                      <p className='text-sm font-semibold text-foreground mt-1'>{currentLocation.address}</p>
                      <p className='text-xs text-muted-foreground mt-1'>
                        Lat: {currentLocation.latitude.toFixed(6)}, Lng: {currentLocation.longitude.toFixed(6)}
                      </p>
                    </div>
                  </div>
                )}

                {/* Form Input fields */}
                <div className='rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4'>
                  <div>
                    <label className='block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5'>
                      {t('storeLocations.address')}
                    </label>
                    <textarea
                      value={selectedAddress}
                      onChange={(e) => setSelectedAddress(e.target.value)}
                      rows={3}
                      className='w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring'
                    />
                  </div>

                  {errorMsg && (
                    <div className='flex items-center gap-1.5 text-xs text-destructive font-semibold'>
                      <MaterialIcon name='error' className='text-[16px]' />
                      {errorMsg}
                    </div>
                  )}

                  {successMsg && (
                    <div className='flex items-center gap-1.5 text-xs text-success font-semibold'>
                      <MaterialIcon name='check_circle' className='text-[16px]' />
                      {successMsg}
                    </div>
                  )}

                  <button
                    type='button'
                    onClick={handleSave}
                    disabled={isSaving}
                    className='w-full flex items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground shadow-md transition-all hover:opacity-95 disabled:opacity-60'
                  >
                    {isSaving ? (
                      <>
                        <div className='h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent' />
                        {t('storeLocations.saving')}
                      </>
                    ) : (
                      <>
                        <MaterialIcon name='save' className='text-[18px]' />
                        {t('storeLocations.save')}
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Right Map Picker */}
              <div className='lg:col-span-7 flex flex-col gap-4'>
                <div className='rounded-2xl border border-border bg-card p-4 shadow-sm flex flex-col gap-3'>
                  <div className='flex items-center justify-between gap-4 flex-wrap'>
                    <span className='flex items-center gap-1.5 text-sm font-semibold text-foreground'>
                      <MaterialIcon name='pin_drop' className='text-primary text-[18px]' />
                      Chọn vị trí trên bản đồ
                    </span>
                    <button
                      type='button'
                      onClick={handleGetMyLocation}
                      className='flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/5 px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground'
                    >
                      <MaterialIcon name='my_location' className='text-[15px]' />
                      {t('storeLocations.myLocation')}
                    </button>
                  </div>

                  <form onSubmit={handleSearchAddress} className='flex gap-2'>
                    <input
                      type='text'
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={t('storeLocations.searchPlaceholder')}
                      className='flex-1 rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring'
                    />
                    <button
                      type='submit'
                      disabled={isSearching}
                      className='rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50 flex items-center gap-1 shrink-0'
                    >
                      {isSearching ? (
                        <div className='h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent' />
                      ) : (
                        <>
                          <MaterialIcon name='search' className='text-[16px]' />
                          {t('storeLocations.searchButton')}
                        </>
                      )}
                    </button>
                  </form>

                  {searchError && (
                    <p className='text-xs text-destructive flex items-center gap-1'>
                      <MaterialIcon name='warning' className='text-[14px]' />
                      {searchError}
                    </p>
                  )}

                  {/* Leaflet Container */}
                  <style>{LEAFLET_OVERRIDE_STYLES}</style>
                  <div className='pb-map-wrapper relative h-[450px] w-full overflow-hidden rounded-xl border border-border shadow-inner bg-muted/20'>
                    {!isLeafletLoaded && (
                      <div className='absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-card text-muted-foreground'>
                        <MaterialIcon name='map' className='text-[36px] animate-bounce text-primary' />
                        <span className='text-xs animate-pulse'>{t('storeLocations.mapLoading')}</span>
                      </div>
                    )}
                    <div ref={mapContainerRef} className='h-full w-full' />
                  </div>
                  <p className='text-center text-[10px] text-muted-foreground'>{t('storeLocations.mapHint')}</p>
                </div>
              </div>
            </div>

            {/* History Table */}
            <div className='rounded-2xl border border-border bg-card shadow-sm overflow-hidden mt-2'>
              <div className='px-6 py-4 border-b border-border bg-muted/10'>
                <h2 className='font-display text-lg font-bold text-foreground'>{t('storeLocations.history')}</h2>
              </div>
              <div className='overflow-x-auto'>
                <table className='w-full text-left text-sm border-collapse'>
                  <thead>
                    <tr className='border-b border-border bg-muted/5 text-xs font-bold text-muted-foreground uppercase tracking-wider'>
                      <th className='px-6 py-3'>{t('storeLocations.address')}</th>
                      <th className='px-6 py-3'>Tọa độ</th>
                      <th className='px-6 py-3'>{t('storeLocations.createdAt')}</th>
                      <th className='px-6 py-3'>{t('storeLocations.status')}</th>
                    </tr>
                  </thead>
                  <tbody className='divide-y divide-border'>
                    {historyLocations.length === 0 ? (
                      <tr>
                        <td colSpan={4} className='px-6 py-10 text-center text-muted-foreground'>
                          Không có dữ liệu lịch sử chi nhánh.
                        </td>
                      </tr>
                    ) : (
                      historyLocations.map((loc) => (
                        <tr key={loc.id} className='hover:bg-muted/5 transition-colors'>
                          <td className='px-6 py-4 font-medium text-foreground max-w-md truncate'>{loc.address}</td>
                          <td className='px-6 py-4 text-xs font-semibold text-muted-foreground'>
                            {loc.latitude.toFixed(6)}, {loc.longitude.toFixed(6)}
                          </td>
                          <td className='px-6 py-4 text-xs text-muted-foreground'>{formatDate(loc.createdAt)}</td>
                          <td className='px-6 py-4'>
                            {loc.active ? (
                              <span className='inline-flex items-center gap-1.5 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-bold text-green-700 dark:bg-green-950/40 dark:text-green-400'>
                                <span className='h-1.5 w-1.5 rounded-full bg-green-700 dark:bg-green-400' />
                                {t('storeLocations.active')}
                              </span>
                            ) : (
                              <span className='inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-bold text-gray-700 dark:bg-gray-800 dark:text-gray-400'>
                                <span className='h-1.5 w-1.5 rounded-full bg-gray-700 dark:bg-gray-400' />
                                {t('storeLocations.inactive')}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  )
}
