import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import booleanPointInPolygon from '@turf/boolean-point-in-polygon'
import { point } from '@turf/helpers'

import { MaterialIcon } from '~/shared/ui'
import { SiteBottomNav, SiteFab, SiteFooter, SiteHeader } from '~/shared/components'
import { calculateShippingFeeApi } from '../services'

const STORE_LAT = 10.776889
const STORE_LON = 106.700806

export const SESSION_KEY_ADDRESS = 'petbuddy_checkout_address'
export const SESSION_KEY_LAT = 'petbuddy_checkout_lat'
export const SESSION_KEY_LNG = 'petbuddy_checkout_lng'
export const SESSION_KEY_SHIPPING_FEE = 'petbuddy_checkout_shipping_fee'
export const SESSION_KEY_IS_FREE_SHIPPING = 'petbuddy_checkout_is_free'
export const SESSION_KEY_DISTANCE_KM = 'petbuddy_checkout_distance'

type ToastVariant = 'success' | 'error'

interface ToastData {
  message: string
  variant: ToastVariant
}

function cleanAddress(addr: string): string {
  if (!addr) return ''
  const cleaned = addr
    .split(',')
    .map((part) => part.trim())
    .filter((part) => part.length > 0 && !/^\d+$/.test(part))
    .join(', ')

  return cleaned
}

async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=vi`
    )

    const data = await res.json()
    const addr = data.address ?? {}

    const parts: string[] = []

    if (addr.house_number) {
      parts.push(addr.house_number)
    }

    if (addr.road) {
      if (addr.house_number) {
        parts[parts.length - 1] += ` ${addr.road}`
      } else {
        parts.push(addr.road)
      }
    }

    if (addr.suburb) {
      parts.push(addr.suburb)
    } else if (addr.city_district) {
      parts.push(addr.city_district)
    } else if (addr.quarter) {
      parts.push(addr.quarter)
    }

    parts.push('Thành phố Hồ Chí Minh')

    parts.push('Việt Nam')

    return parts.join(', ')
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

function Toast({ toast, onClose }: { toast: ToastData | null; onClose: () => void }) {
  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(onClose, 3000)
    return () => clearTimeout(timer)
  }, [toast, onClose])

  if (!toast) return null

  const isSuccess = toast.variant === 'success'

  return (
    <div className='fixed top-20 left-1/2 z-[100] -translate-x-1/2 px-4'>
      <div
        className={`flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-white shadow-lg ${
          isSuccess ? 'bg-success' : 'bg-destructive'
        }`}
      >
        <MaterialIcon name={isSuccess ? 'check_circle' : 'location_off'} className='text-[20px]' />
        {toast.message}
      </div>
    </div>
  )
}

export function AddressPickerPage() {
  const { t } = useTranslation('products')
  const navigate = useNavigate()

  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markerRef = useRef<any>(null)

  const [isLeafletLoaded, setIsLeafletLoaded] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [isConfirming, setIsConfirming] = useState(false)
  const [searchError, setSearchError] = useState('')
  const [selectedAddress, setSelectedAddress] = useState('')
  const [toast, setToast] = useState<ToastData | null>(null)
  const [isLocationValid, setIsLocationValid] = useState(true)
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number }>({
    lat: STORE_LAT,
    lng: STORE_LON
  })

  function showToast(message: string, variant: ToastVariant = 'success') {
    setToast({ message, variant })
  }

  useEffect(() => {
    const savedAddress = sessionStorage.getItem(SESSION_KEY_ADDRESS) ?? ''
    if (savedAddress) {
      setTimeout(() => {
        setSelectedAddress(savedAddress)
      }, 0)
    }
    const savedLat = sessionStorage.getItem(SESSION_KEY_LAT) ?? ''
    const savedLng = sessionStorage.getItem(SESSION_KEY_LNG) ?? ''
    if (savedLat && savedLng) {
      setTimeout(() => {
        setCurrentCoords({ lat: parseFloat(savedLat), lng: parseFloat(savedLng) })
      }, 0)
    }
  }, [])

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

  useEffect(() => {
    if (!isLeafletLoaded || !mapContainerRef.current || typeof window === 'undefined') return

    const L = (window as any).L
    if (!L || mapInstanceRef.current) return
    const container: any = mapContainerRef.current
    if (container._leaflet_id) {
      container._leaflet_id = null
    }

    const map = L.map(mapContainerRef.current, {
      center: [currentCoords.lat, currentCoords.lng],
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

    const marker = L.marker([currentCoords.lat, currentCoords.lng], {
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
    try {
      await calculateShippingFeeApi(lat, lng)
    } catch (err: any) {
      showToast(err?.message ?? t('addressPicker.errors.invalidLocationDefault'), 'error')
      setIsLocationValid(false)
      return
    }

    setIsLocationValid(true)
    setCurrentCoords({ lat, lng })
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
      setSearchError(t('addressPicker.errors.geoUnsupported'))
      return
    }
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        await updateLocation(latitude, longitude, true)
        setSearchError('')
      },
      () => {
        setSearchError(t('addressPicker.errors.geoFailed'))
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
        setSearchError(t('addressPicker.errors.addressNotFound'))
      }
    } catch {
      setSearchError(t('addressPicker.errors.searchConnectionError'))
    } finally {
      setIsSearching(false)
    }
  }

  const [hcmBoundary, setHcmBoundary] = useState<any>(null)
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

  function isInHoChiMinhCity(lat: number, lng: number): boolean {
    if (!hcmBoundary) {
      return false
    }

    const p = point([lng, lat])

    return hcmBoundary.features.some((feature: any) => booleanPointInPolygon(p, feature))
  }
  async function handleConfirm() {
    if (!hcmBoundary) {
      showToast(t('addressPicker.loadingBoundary'), 'error')
      return
    }

    const inHCMC = isInHoChiMinhCity(currentCoords.lat, currentCoords.lng)
    if (!inHCMC) {
      showToast(t('addressPicker.errors.outsideHcmc'), 'error')
      return
    }

    setIsConfirming(true)

    let shippingData
    try {
      const response = await calculateShippingFeeApi(currentCoords.lat, currentCoords.lng)
      shippingData = response?.data
    } catch (err: any) {
      showToast(err?.message ?? t('addressPicker.errors.invalidLocationDefault'), 'error')
      setIsConfirming(false)
      return
    }

    if (!shippingData) {
      showToast(t('addressPicker.errors.feeCalculationFailed'), 'error')
      setIsConfirming(false)
      return
    }

    const addressToSave =
      selectedAddress ||
      searchQuery ||
      `${currentCoords.lat.toFixed(6)}, ${currentCoords.lng.toFixed(6)}`

    sessionStorage.setItem(SESSION_KEY_ADDRESS, addressToSave)
    sessionStorage.setItem(SESSION_KEY_LAT, String(currentCoords.lat))
    sessionStorage.setItem(SESSION_KEY_LNG, String(currentCoords.lng))
    sessionStorage.setItem(SESSION_KEY_SHIPPING_FEE, String(shippingData.shippingFee))
    sessionStorage.setItem(SESSION_KEY_IS_FREE_SHIPPING, String(shippingData.freeShipping))
    sessionStorage.setItem(SESSION_KEY_DISTANCE_KM, String(shippingData.distanceKm))

    setIsConfirming(false)
    navigate('/order')
  }

  return (
    <div className='flex min-h-screen flex-col bg-background text-foreground'>
      <Toast toast={toast} onClose={() => setToast(null)} />
      <SiteHeader />
      <main className='mx-auto w-full min-w-0 max-w-3xl flex-1 px-4 py-8 pb-24 md:px-6'>
        {/* Back button */}
        <button
          type='button'
          onClick={() => navigate('/order')}
          className='mb-6 flex items-center gap-2 text-sm font-medium text-primary hover:opacity-80 transition-opacity'
        >
          <MaterialIcon name='arrow_back' className='text-[20px]' />
          {t('addressPicker.backButton')}
        </button>

        <h1 className='mb-2 font-display text-2xl font-bold text-foreground md:text-3xl'>
          {t('addressPicker.title')}
        </h1>
        <p className='mb-6 text-sm text-muted-foreground'>{t('addressPicker.subtitle')}</p>

        {/* Search bar */}
        <div className='mb-4 rounded-2xl border border-border/60 bg-card p-4 shadow-sm'>
          <div className='mb-3 flex items-center justify-between'>
            <span className='flex items-center gap-1.5 text-sm font-semibold text-foreground'>
              <MaterialIcon name='search' className='text-primary text-[18px]' />
              {t('addressPicker.searchTitle')}
            </span>
            <button
              type='button'
              onClick={handleGetMyLocation}
              className='flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/5 px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground'
            >
              <MaterialIcon name='my_location' className='text-[15px]' />
              {t('addressPicker.myLocation')}
            </button>
          </div>

          <form onSubmit={handleSearchAddress} className='flex gap-2'>
            <div className='relative flex-1'>
              <MaterialIcon
                name='pin_drop'
                className='absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-[18px]'
              />
              <input
                type='text'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className='w-full rounded-xl border border-border bg-background py-3 pl-9 pr-4 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring'
                placeholder={t('addressPicker.searchPlaceholder')}
              />
            </div>
            <button
              type='submit'
              disabled={isSearching}
              className='flex items-center gap-1.5 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 active:scale-95 disabled:opacity-50'
            >
              {isSearching ? (
                <div className='h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent' />
              ) : (
                <>
                  <MaterialIcon name='search' className='text-[18px]' />
                  {t('addressPicker.searchButton')}
                </>
              )}
            </button>
          </form>

          {searchError && (
            <p className='mt-2 flex items-center gap-1 text-xs text-destructive'>
              <MaterialIcon name='warning' className='text-[14px]' />
              {searchError}
            </p>
          )}
        </div>

        {/* Map */}
        <style>{LEAFLET_OVERRIDE_STYLES}</style>
        <div className='pb-map-wrapper relative h-[55vh] w-full max-w-full min-w-0 overflow-hidden rounded-2xl border border-border shadow-md'>
          {!isLeafletLoaded && (
            <div className='absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-card text-muted-foreground'>
              <MaterialIcon name='map' className='text-[48px] animate-bounce text-primary' />
              <span className='text-sm animate-pulse'>{t('addressPicker.mapLoading')}</span>
            </div>
          )}
          <div ref={mapContainerRef} className='h-full w-full max-w-full' />
        </div>

        <p className='mt-2 text-center text-[11px] text-muted-foreground'>{t('addressPicker.mapHint')}</p>

        {/* Selected address preview */}
        {selectedAddress && (
          <div className='mt-4 flex items-start gap-3 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3'>
            <MaterialIcon name='location_on' className='mt-0.5 shrink-0 text-primary text-[20px]' />
            <div className='flex-1'>
              <p className='text-xs font-semibold text-muted-foreground'>
                {t('addressPicker.selectedAddressLabel')}
              </p>
              <p className='text-sm font-medium text-foreground'>{cleanAddress(selectedAddress)}</p>
            </div>
          </div>
        )}

        {/* Confirm button */}
        <button
          type='button'
          onClick={handleConfirm}
          disabled={isConfirming || !isLocationValid}
          className='mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-base font-bold text-primary-foreground shadow-lg transition-all hover:opacity-90 active:scale-95 disabled:opacity-60'
        >
          {isConfirming ? (
            <>
              <div className='h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent' />
              {t('addressPicker.calculatingFee')}
            </>
          ) : (
            <>
              <MaterialIcon name='check_circle' className='text-[20px]' />
              {t('addressPicker.confirmButton')}
            </>
          )}
        </button>
      </main>
      <SiteFooter />
      <SiteBottomNav />
      <SiteFab />
    </div>
  )
}