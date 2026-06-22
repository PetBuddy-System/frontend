import { useEffect, useRef, useState } from 'react'
import { MaterialIcon } from '~/shared/ui'

export interface CheckoutMapProps {
  onLocationSelect: (lat: number, lng: number) => void
  defaultLat?: number
  defaultLng?: number
}

// Store coordinates as fallback center
const STORE_LAT = 10.776889
const STORE_LON = 106.700806

export function CheckoutMap({
  onLocationSelect,
  defaultLat = STORE_LAT,
  defaultLng = STORE_LON
}: CheckoutMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markerRef = useRef<any>(null)
  
  const [isLeafletLoaded, setIsLeafletLoaded] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState('')
  
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number }>({
    lat: defaultLat,
    lng: defaultLng
  })

  // Load Leaflet dynamically
  useEffect(() => {
    if (typeof window === 'undefined') return

    // Check if Leaflet is already loaded
    if ((window as any).L) {
      setIsLeafletLoaded(true)
      return
    }

    // Load Leaflet CSS
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
    link.crossOrigin = ''
    document.head.appendChild(link)

    // Load Leaflet JS
    const script = document.createElement('script')
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
    script.crossOrigin = ''
    script.onload = () => {
      setIsLeafletLoaded(true)
    }
    document.head.appendChild(script)

    return () => {
      // Clean up scripts/stylesheets if needed, but usually fine to keep
    }
  }, [])

  // Initialize Map
  useEffect(() => {
    if (!isLeafletLoaded || !mapContainerRef.current || typeof window === 'undefined') return

    const L = (window as any).L
    if (!L) return

    // If map already initialized, just update marker or view
    if (mapInstanceRef.current) {
      return
    }

    // Create Leaflet map instance
    const map = L.map(mapContainerRef.current, {
      center: [currentCoords.lat, currentCoords.lng],
      zoom: 13,
      scrollWheelZoom: false // disable scrolling inside checkout page unless active
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map)

    // Create marker icon customization if desired, or use default
    // Default Leaflet icon has shadow alignment issues sometimes when dynamically loaded, fix it:
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

    // Event: marker drag
    marker.on('dragend', () => {
      const position = marker.getLatLng()
      updateLocation(position.lat, position.lng)
    })

    // Event: map click to relocate pin
    map.on('click', (e: any) => {
      const position = e.latlng
      updateLocation(position.lat, position.lng)
    })

    mapInstanceRef.current = map
    markerRef.current = marker

    // Initial notify of selected location
    onLocationSelect(currentCoords.lat, currentCoords.lng)

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [isLeafletLoaded])

  function updateLocation(lat: number, lng: number) {
    setCurrentCoords({ lat, lng })
    onLocationSelect(lat, lng)

    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng])
    }
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([lat, lng], mapInstanceRef.current.getZoom())
    }
  }

  // Get User's Geolocation
  function handleGetMyLocation() {
    if (!navigator.geolocation) {
      setSearchError('Trình duyệt của bạn không hỗ trợ định vị GPS.')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        updateLocation(latitude, longitude)
        setSearchError('')
      },
      (error) => {
        setSearchError('Không thể lấy vị trí hiện tại. Hãy kiểm tra quyền truy cập vị trí của trình duyệt.')
      }
    )
  }

  // Geocode Search address via Nominatim (OpenStreetMap)
  async function handleSearchAddress(e: React.FormEvent) {
    e.preventDefault()
    if (!searchQuery.trim()) return

    setIsSearching(true)
    setSearchError('')
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`
      )
      const data = await res.json()

      if (data && data.length > 0) {
        const firstResult = data[0]
        const lat = parseFloat(firstResult.lat)
        const lng = parseFloat(firstResult.lon)
        updateLocation(lat, lng)
      } else {
        setSearchError('Không tìm thấy địa chỉ này trên bản đồ. Hãy thử nhập chi tiết hơn.')
      }
    } catch {
      setSearchError('Lỗi kết nối khi tìm kiếm địa chỉ.')
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <div className='mt-6 rounded-xl border border-border/80 bg-muted/20 p-4 shadow-inner'>
      <div className='mb-3 flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between'>
        <span className='text-sm font-semibold text-foreground flex items-center gap-1.5'>
          <MaterialIcon name='pin_drop' className='text-primary text-[18px]' />
          Xác định vị trí giao hàng để tính phí ship
        </span>
        <button
          type='button'
          onClick={handleGetMyLocation}
          className='flex items-center justify-center gap-1.5 rounded-lg border border-primary/30 bg-primary/5 px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground'
        >
          <MaterialIcon name='my_location' className='text-[16px]' />
          Lấy vị trí của tôi
        </button>
      </div>

      {/* Address Geocode Search Form */}
      <form onSubmit={handleSearchAddress} className='mb-4 flex gap-2'>
        <input
          type='text'
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className='min-w-0 flex-1 rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary'
          placeholder='Nhập địa chỉ, tên đường để tìm trên bản đồ...'
        />
        <button
          type='submit'
          disabled={isSearching}
          className='flex items-center justify-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90 active:scale-95 disabled:opacity-50'
        >
          {isSearching ? (
            <div className='h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent' />
          ) : (
            'Tìm kiếm'
          )}
        </button>
      </form>

      {/* Error alert */}
      {searchError && (
        <p className='mb-3 text-xs text-destructive flex items-center gap-1'>
          <MaterialIcon name='warning' className='text-[14px]' />
          {searchError}
        </p>
      )}

      {/* Map Container */}
      <div className='relative h-64 w-full overflow-hidden rounded-xl border border-border bg-card'>
        {!isLeafletLoaded && (
          <div className='absolute inset-0 flex flex-col items-center justify-center gap-2 bg-card text-muted-foreground animate-pulse'>
            <MaterialIcon name='map' className='text-[36px] animate-bounce' />
            <span className='text-xs'>Đang tải bản đồ...</span>
          </div>
        )}
        <div ref={mapContainerRef} className='h-full w-full' />
      </div>

      <div className='mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground'>
        {/* <span>Tọa độ đã chọn:</span>
        <span className='font-semibold text-foreground'>{currentCoords.lat.toFixed(6)}, {currentCoords.lng.toFixed(6)}</span>
        <span className='hidden sm:inline'>|</span> */}
        <span>(Nhấn đúp hoặc kéo thả ghim đỏ để chọn vị trí chính xác)</span>
      </div>
    </div>
  )
}
