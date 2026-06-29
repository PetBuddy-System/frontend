import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'

import { MaterialIcon } from '~/shared/ui'
import { SiteBottomNav, SiteFab, SiteFooter, SiteHeader } from '~/shared/components'
import { calculateShippingFeeApi  } from '../services/shipping'
import { fetchAllShippingRulesApi } from '~/features/admin/services/shipping'
import type { ShippingRule } from '~/shared/lib/shipping'

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

// Tính khoảng cách (km) giữa 2 toạ độ theo công thức Haversine
function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (value: number) => (value * Math.PI) / 180
  const R = 6371
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// Tìm rule phù hợp với khoảng cách — null nếu ngoài vùng phủ
function findMatchingRule(rules: ShippingRule[], distanceKm: number): ShippingRule | null {
  return (
    rules.find((r) => distanceKm >= r.minDistance && distanceKm < r.maxDistance) ?? null
  )
}

// Ép .leaflet-container luôn bám 100% kích thước của div bọc ngoài và kế thừa
// border-radius của nó — không để Leaflet tự set width/height/shape riêng,
// đây chính là nguyên nhân khiến map "tràn" ra ngoài khung bo góc.
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
          isSuccess ? 'bg-green-600' : 'bg-destructive'
        }`}
      >
        <MaterialIcon name={isSuccess ? 'check_circle' : 'location_off'} className='text-[20px]' />
        {toast.message}
      </div>
    </div>
  )
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
  const [toast, setToast] = useState<ToastData | null>(null)
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number }>({
    lat: STORE_LAT,
    lng: STORE_LON,
  })
  const [shippingRules, setShippingRules] = useState<ShippingRule[]>([])
  const [isLoadingRules, setIsLoadingRules] = useState(true)

  function showToast(message: string, variant: ToastVariant = 'success') {
    setToast({ message, variant })
  }

  // Restore previous selection
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

  // Fetch shipping rules từ admin config
  useEffect(() => {
    fetchAllShippingRulesApi()
      .then((res) => {
        if (res?.data) setShippingRules(res.data)
      })
      .catch(() => {
        // rules rỗng → handleConfirm sẽ block và hiện lỗi
      })
      .finally(() => setIsLoadingRules(false))
  }, [])

  // Load Leaflet dynamically
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

    // Tránh chèn lại link/script nhiều lần khi component remount (StrictMode/HMR)
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

    // Clean up previous leaflet instance if any (StrictMode/HMR)
    const container: any = mapContainerRef.current
    if (container._leaflet_id) {
      container._leaflet_id = null
    }

    const map = L.map(mapContainerRef.current, {
      center: [currentCoords.lat, currentCoords.lng],
      zoom: 13,
      scrollWheelZoom: true,
    })

    // Ép cứng các thuộc tính box-model quan trọng bằng inline style !important
    // ngay trên node mà Leaflet quản lý (.leaflet-container). Inline !important
    // luôn thắng mọi CSS global khác (ví dụ 1 rule .leaflet-container { position:
    // fixed; width: 100vw } dùng cho trang bản đồ full-screen nào đó trong app
    // mà vô tình áp luôn vào đây) — đây là nguyên nhân khiến map "tràn" khỏi
    // khung bo viền và đè lên header.
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
      'z-index': '0',
    }
    Object.entries(forcedStyles).forEach(([prop, value]) => {
      leafletEl.style.setProperty(prop, value, 'important')
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

    // Luôn đồng bộ kích thước thật của khung chứa với Leaflet, tránh tình
    // trạng map bị "tràn" ra ngoài khung bo góc khi layout cha thay đổi
    // (resize cửa sổ, sidebar bật/tắt, font/scrollbar load xong, v.v.)
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
    const distanceFromStore = getDistanceKm(
      STORE_LAT,
      STORE_LON,
      currentCoords.lat,
      currentCoords.lng
    )

    const matchedRule = findMatchingRule(shippingRules, distanceFromStore)

    if (!matchedRule) {
      showToast('Địa chỉ này nằm ngoài khu vực giao hàng', 'error')
      return
    }

    const inHCMC = await isInHoChiMinhCity(currentCoords.lat, currentCoords.lng)
      if (!inHCMC) {
        showToast('Chỉ giao hàng trong phạm vi TP. Hồ Chí Minh', 'error')
        return
      }

    setIsConfirming(true)
    const addressToSave =
      selectedAddress ||
      searchQuery ||
      `${currentCoords.lat.toFixed(6)}, ${currentCoords.lng.toFixed(6)}`

    sessionStorage.setItem(SESSION_KEY_ADDRESS, addressToSave)
    sessionStorage.setItem(SESSION_KEY_LAT, String(currentCoords.lat))
    sessionStorage.setItem(SESSION_KEY_LNG, String(currentCoords.lng))

    try {
      const response = await calculateShippingFeeApi(currentCoords.lat, currentCoords.lng)
      if (response?.data) {
        const { shippingFee, freeShipping, distanceKm } = response.data
        sessionStorage.setItem(SESSION_KEY_SHIPPING_FEE, String(shippingFee))
        sessionStorage.setItem(SESSION_KEY_IS_FREE_SHIPPING, String(freeShipping))
        sessionStorage.setItem(SESSION_KEY_DISTANCE_KM, String(distanceKm))
      }
    } catch {
      sessionStorage.setItem(SESSION_KEY_SHIPPING_FEE, String(matchedRule.fee))
      sessionStorage.setItem(SESSION_KEY_IS_FREE_SHIPPING, String(matchedRule.fee === 0))
      sessionStorage.setItem(SESSION_KEY_DISTANCE_KM, String(distanceFromStore))
    } finally {
      setIsConfirming(false)
    }

    navigate('/order')
  }

  async function isInHoChiMinhCity(lat: number, lng: number): Promise<boolean> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=vi`
    )
    const data = await res.json()
    const addr = data?.address ?? {}

     const isoCode = addr['ISO3166-2-lvl4'] ?? ''
    if (isoCode === 'VN-SG') return true

    const hcmcKeywords = [
      'hồ chí minh',
      'ho chi minh',
      'thành phố hồ chí minh',
      'tp. hồ chí minh',
      'tp hcm',
    ]

    const stateLevel = [addr.state, addr.province, addr.municipality]
      .filter(Boolean)
      .map((s: string) => s.toLowerCase())

    if (stateLevel.some((f) => hcmcKeywords.some((kw) => f.includes(kw)))) {
      return true
    }

    // Fallback: check city/county nếu state không có
    const cityLevel = [addr.city, addr.county]
      .filter(Boolean)
      .map((s: string) => s.toLowerCase())

    return cityLevel.some((f) => hcmcKeywords.some((kw) => f.includes(kw)))
  } catch {
    return true // fail-open
  }
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
        <style>{LEAFLET_OVERRIDE_STYLES}</style>
        <div className='pb-map-wrapper relative h-[55vh] w-full max-w-full min-w-0 overflow-hidden rounded-2xl border border-border shadow-md'>
          {!isLeafletLoaded && (
            <div className='absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-card text-muted-foreground'>
              <MaterialIcon name='map' className='text-[48px] animate-bounce text-primary' />
              <span className='text-sm animate-pulse'>Đang tải bản đồ...</span>
            </div>
          )}
          <div ref={mapContainerRef} className='h-full w-full max-w-full' />
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
          disabled={isConfirming || isLoadingRules}
          className='mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-base font-bold text-primary-foreground shadow-lg transition-all hover:opacity-90 active:scale-95 disabled:opacity-60'
        >
          {isLoadingRules ? (
            <>
              <div className='h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent' />
              Đang tải cấu hình...
            </>
          ) : isConfirming ? (
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