import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'

import { MaterialIcon } from '~/shared/ui'
import { SiteBottomNav, SiteFab, SiteFooter, SiteHeader } from '~/shared/components'
import { calculateShippingFeeApi } from '~/shared/lib/shipping'

const STORE_LAT = 10.776889
const STORE_LON = 106.700806

export const SESSION_KEY_ADDRESS = 'petbuddy_checkout_address'
export const SESSION_KEY_LAT = 'petbuddy_checkout_lat'
export const SESSION_KEY_LNG = 'petbuddy_checkout_lng'
export const SESSION_KEY_SHIPPING_FEE = 'petbuddy_checkout_shipping_fee'
export const SESSION_KEY_IS_FREE_SHIPPING = 'petbuddy_checkout_is_free'
export const SESSION_KEY_DISTANCE_KM = 'petbuddy_checkout_distance'

async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=vi`
    )
    const data = await res.json()
    if (data?.display_name) return data.display_name as string
  } catch {
    // fallback below
  }
  return `${lat.toFixed(6)}, ${lng.toFixed(6)}`
}

export function AddressPickerPage() {
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
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number }>({
    lat: STORE_LAT,
    lng: STORE_LON,
  })

  // Restore previous selection
  useEffect(() => {
    const savedAddress = sessionStorage.getItem(SESSION_KEY_ADDRESS) ?? ''
    if (savedAddress) setSelectedAddress(savedAddress)
    const savedLat = sessionStorage.getItem(SESSION_KEY_LAT)
    const savedLng = sessionStorage.getItem(SESSION_KEY_LNG)
    if (savedLat && savedLng) {
      setCurrentCoords({ lat: parseFloat(savedLat), lng: parseFloat(savedLng) })
    }
  }, [])

  // Load Leaflet dynamically
  useEffect(() => {
    if (typeof window === 'undefined') return
    if ((window as any).L) {
      setIsLeafletLoaded(true)
      return
    }

    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
    link.crossOrigin = ''
    document.head.appendChild(link)

    const script = document.createElement('script')
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
    script.crossOrigin = ''
    script.onload = () => setIsLeafletLoaded(true)
    document.head.appendChild(script)
  }, [])

  // Initialize Map
  useEffect(() => {
    if (!isLeafletLoaded || !mapContainerRef.current || typeof window === 'undefined') return

    const L = (window as any).L
    if (!L || mapInstanceRef.current) return

    const map = L.map(mapContainerRef.current, {
      center: [currentCoords.lat, currentCoords.lng],
      zoom: 13,
      scrollWheelZoom: true,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map)

    const DefaultIcon = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    })

    const marker = L.marker([currentCoords.lat, currentCoords.lng], {
      draggable: true,
      icon: DefaultIcon,
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

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLeafletLoaded])

  async function updateLocation(lat: number, lng: number, reverseGeocode_: boolean) {
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
      setSearchError('Trình duyệt của bạn không hỗ trợ định vị GPS.')
      return
    }
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        await updateLocation(latitude, longitude, true)
        setSearchError('')
      },
      () => {
        setSearchError('Không thể lấy vị trí. Hãy kiểm tra quyền truy cập vị trí.')
      }
    )
  }

  async function handleSearchAddress(e: React.FormEvent) {
    e.preventDefault()
    if (!searchQuery.trim()) return

    setIsSearching(true)
    setSearchError('')
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1&accept-language=vi`
      )
      const data = await res.json()
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat)
        const lng = parseFloat(data[0].lon)
        await updateLocation(lat, lng, false)
        setSelectedAddress(data[0].display_name ?? searchQuery)
        setSearchError('')
      } else {
        setSearchError('Không tìm thấy địa chỉ này. Hãy thử nhập chi tiết hơn.')
      }
    } catch {
      setSearchError('Lỗi kết nối khi tìm kiếm địa chỉ.')
    } finally {
      setIsSearching(false)
    }
  }

  async function handleConfirm() {
    setIsConfirming(true)
    const addressToSave =
      selectedAddress || searchQuery || `${currentCoords.lat.toFixed(6)}, ${currentCoords.lng.toFixed(6)}`

    sessionStorage.setItem(SESSION_KEY_ADDRESS, addressToSave)
    sessionStorage.setItem(SESSION_KEY_LAT, String(currentCoords.lat))
    sessionStorage.setItem(SESSION_KEY_LNG, String(currentCoords.lng))

    // Calculate shipping fee
    try {
      const response = await calculateShippingFeeApi(currentCoords.lat, currentCoords.lng)
      if (response?.data) {
        const { shippingFee, freeShipping, distanceKm } = response.data
        sessionStorage.setItem(SESSION_KEY_SHIPPING_FEE, String(shippingFee))
        sessionStorage.setItem(SESSION_KEY_IS_FREE_SHIPPING, String(freeShipping))
        sessionStorage.setItem(SESSION_KEY_DISTANCE_KM, String(distanceKm))
      }
    } catch {
      // Non-blocking: if shipping calc fails, default to free
      sessionStorage.setItem(SESSION_KEY_SHIPPING_FEE, '0')
      sessionStorage.setItem(SESSION_KEY_IS_FREE_SHIPPING, 'true')
      sessionStorage.setItem(SESSION_KEY_DISTANCE_KM, '0')
    } finally {
      setIsConfirming(false)
    }

    navigate('/order')
  }

  return (
    <div className='flex min-h-screen flex-col bg-background text-foreground'>
      <SiteHeader />
      <main className='mx-auto w-full max-w-3xl flex-1 px-4 py-8 pb-24 md:px-6'>
        {/* Back button */}
        <button
          type='button'
          onClick={() => navigate('/order')}
          className='mb-6 flex items-center gap-2 text-sm font-medium text-primary hover:opacity-80 transition-opacity'
        >
          <MaterialIcon name='arrow_back' className='text-[20px]' />
          Quay lại
        </button>

        <h1 className='mb-2 font-display text-2xl font-bold text-foreground md:text-3xl'>
          Chọn địa chỉ giao hàng
        </h1>
        <p className='mb-6 text-sm text-muted-foreground'>
          Nhập địa chỉ vào ô tìm kiếm hoặc nhấn vào bản đồ để chọn vị trí giao hàng.
        </p>

        {/* Search bar */}
        <div className='mb-4 rounded-2xl border border-border/60 bg-card p-4 shadow-sm'>
          <div className='mb-3 flex items-center justify-between'>
            <span className='flex items-center gap-1.5 text-sm font-semibold text-foreground'>
              <MaterialIcon name='search' className='text-primary text-[18px]' />
              Tìm kiếm địa chỉ
            </span>
            <button
              type='button'
              onClick={handleGetMyLocation}
              className='flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/5 px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground'
            >
              <MaterialIcon name='my_location' className='text-[15px]' />
              Vị trí của tôi
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
                placeholder='Nhập địa chỉ, tên đường để tìm trên bản đồ...'
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
                  Tìm kiếm
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
        <div className='relative h-[55vh] w-full overflow-hidden rounded-2xl border border-border shadow-md'>
          {!isLeafletLoaded && (
            <div className='absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-card text-muted-foreground'>
              <MaterialIcon name='map' className='text-[48px] animate-bounce text-primary' />
              <span className='text-sm animate-pulse'>Đang tải bản đồ...</span>
            </div>
          )}
          <div ref={mapContainerRef} className='h-full w-full' />
        </div>

        <p className='mt-2 text-center text-[11px] text-muted-foreground'>
          Nhấn vào bản đồ hoặc kéo thả ghim để chọn vị trí chính xác
        </p>

        {/* Selected address preview */}
        {selectedAddress && (
          <div className='mt-4 flex items-start gap-3 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3'>
            <MaterialIcon name='location_on' className='mt-0.5 shrink-0 text-primary text-[20px]' />
            <div className='flex-1'>
              <p className='text-xs font-semibold text-muted-foreground'>Địa chỉ đã chọn</p>
              <p className='text-sm font-medium text-foreground'>{selectedAddress}</p>
            </div>
          </div>
        )}

        {/* Confirm button */}
        <button
          type='button'
          onClick={handleConfirm}
          disabled={isConfirming}
          className='mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-base font-bold text-primary-foreground shadow-lg transition-all hover:opacity-90 active:scale-95 disabled:opacity-60'
        >
          {isConfirming ? (
            <>
              <div className='h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent' />
              Đang tính phí vận chuyển...
            </>
          ) : (
            <>
              <MaterialIcon name='check_circle' className='text-[20px]' />
              Xác nhận địa chỉ
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
