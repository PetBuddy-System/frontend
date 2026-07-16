import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { MaterialIcon } from '~/shared/ui'

export interface StoreLocationMapProps {
  coords: { lat: number; lng: number }
  updateLocation: (lat: number, lng: number, reverseGeocode_: boolean) => Promise<void>
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

export function StoreLocationMap({ coords, updateLocation }: StoreLocationMapProps) {
  const { t } = useTranslation('manager')

  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markerRef = useRef<any>(null)

  const [isLeafletLoaded, setIsLeafletLoaded] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState('')

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

  // Move marker when coords change externally
  useEffect(() => {
    if (markerRef.current && mapInstanceRef.current) {
      const currentMarkerLatLng = markerRef.current.getLatLng()
      if (currentMarkerLatLng.lat !== coords.lat || currentMarkerLatLng.lng !== coords.lng) {
        markerRef.current.setLatLng([coords.lat, coords.lng])
        mapInstanceRef.current.setView([coords.lat, coords.lng], mapInstanceRef.current.getZoom())
      }
    }
  }, [coords])

  function handleGetMyLocation() {
    if (!navigator.geolocation) {
      setSearchError(t('storeLocations.errors.invalidLocation', 'Trình duyệt không hỗ trợ định vị.'))
      return
    }
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        await updateLocation(latitude, longitude, true)
        setSearchError('')
      },
      () => {
        setSearchError(t('storeLocations.errors.invalidLocation', 'Không thể định vị vị trí của bạn.'))
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
        setSearchError(t('storeLocations.errors.invalidLocation', 'Không tìm thấy vị trí yêu cầu.'))
      }
    } catch {
      setSearchError(t('storeLocations.errors.invalidLocation', 'Lỗi kết nối khi tìm kiếm.'))
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <div className='flex flex-col gap-4 w-full'>
      {/* HTML Styled Search and Control Cluster */}
      <div className='bg-card rounded-xl p-4 shadow-sm border border-border flex flex-col md:flex-row gap-3 items-center'>
        <form onSubmit={handleSearchAddress} className='relative flex-grow w-full'>
          <MaterialIcon name='search' className='absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground' />
          <input
            type='text'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className='w-full pl-12 pr-4 py-3 rounded-xl border border-border bg-background focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring transition-all text-sm font-medium'
            placeholder={t('storeLocations.searchPlaceholder', 'Tìm kiếm địa điểm...')}
          />
        </form>
        <div className='flex gap-3 w-full md:w-auto shrink-0'>
          <button
            type='button'
            onClick={handleGetMyLocation}
            className='flex items-center justify-center gap-2 px-5 py-3 border border-primary text-primary font-semibold text-sm rounded-xl hover:bg-primary/5 active:scale-95 transition-all flex-1 md:flex-initial whitespace-nowrap'
          >
            <MaterialIcon name='my_location' className='text-[18px]' />
            {t('storeLocations.myLocation', 'Vị trí của tôi')}
          </button>
          <button
            type='button'
            onClick={(e) => void handleSearchAddress(e)}
            disabled={isSearching}
            className='flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-semibold text-sm rounded-xl shadow hover:opacity-95 active:scale-95 transition-all flex-1 md:flex-initial whitespace-nowrap disabled:opacity-50'
          >
            {isSearching ? (
              <div className='h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent' />
            ) : (
              <>
                <MaterialIcon name='search' className='text-[18px]' />
                {t('storeLocations.searchButton', 'Tìm kiếm')}
              </>
            )}
          </button>
        </div>
      </div>

      {searchError && (
        <p className='text-xs text-destructive font-semibold flex items-center gap-1 bg-destructive/5 p-3 rounded-lg border border-destructive/10'>
          <MaterialIcon name='warning' className='text-[16px]' />
          {searchError}
        </p>
      )}

      {/* Leaflet Map Picker */}
      <style>{LEAFLET_OVERRIDE_STYLES}</style>
      <div className='pb-map-wrapper relative h-[450px] w-full overflow-hidden rounded-2xl border border-border shadow-inner bg-muted/10'>
        {!isLeafletLoaded && (
          <div className='absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-card text-muted-foreground'>
            <MaterialIcon name='map' className='text-[36px] animate-bounce text-primary' />
            <span className='text-xs animate-pulse'>{t('storeLocations.mapLoading', 'Đang tải bản đồ...')}</span>
          </div>
        )}
        <div ref={mapContainerRef} className='h-full w-full' />
      </div>

      {/* Instructional Hint */}
      <p className='text-center text-xs text-muted-foreground font-semibold tracking-wide flex items-center justify-center gap-2 uppercase'>
        <MaterialIcon name='touch_app' className='text-[16px]' />
        {t('storeLocations.mapHint', 'Click on map or drag marker to choose location')}
      </p>
    </div>
  )
}
