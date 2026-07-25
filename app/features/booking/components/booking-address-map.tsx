import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'

import { MaterialIcon } from '~/shared/ui'

const DEFAULT_LATITUDE = 10.776889
const DEFAULT_LONGITUDE = 106.700806
const DEFAULT_ZOOM = 15
const HCMC_BOUNDS: [[number, number], [number, number]] = [
  [10.34, 106.35],
  [11.18, 107.05]
]

const LEAFLET_OVERRIDE_STYLES = `
  .pb-booking-map-wrapper {
    position: relative !important;
    overflow: hidden !important;
  }
  .pb-booking-map-wrapper .leaflet-container {
    position: relative !important;
    width: 100% !important;
    height: 100% !important;
    max-width: 100% !important;
    border-radius: inherit;
  }
`

type LeafletCoordinate = { lat: number; lng: number }

type LeafletMarker = {
  addTo: (map: LeafletMap) => LeafletMarker
  getLatLng: () => LeafletCoordinate
  on: (event: string, handler: () => void) => void
  setLatLng: (coords: [number, number]) => void
}

type LeafletMap = {
  getContainer: () => HTMLElement
  getZoom: () => number
  invalidateSize: () => void
  on: (event: string, handler: (event: { latlng: LeafletCoordinate }) => void) => void
  remove: () => void
  setView: (coords: [number, number], zoom: number) => void
}

type LeafletApi = {
  icon: (options: Record<string, unknown>) => unknown
  map: (element: HTMLElement, options: Record<string, unknown>) => LeafletMap
  marker: (coords: [number, number], options: Record<string, unknown>) => LeafletMarker
  tileLayer: (url: string, options: Record<string, unknown>) => { addTo: (map: LeafletMap) => void }
}

type WindowWithLeaflet = Window & { L?: LeafletApi }

type AddressSuggestion = {
  displayName: string
  latitude: number
  longitude: number
}

export interface BookingAddressMapProps {
  address: string
  latitude: string
  longitude: string
  onAddressChange: (value: string) => void
  onLatitudeChange: (value: string) => void
  onLongitudeChange: (value: string) => void
}

function formatCoordinate(value: number): string {
  return value.toFixed(6)
}

function isInsideHoChiMinhCityBounds(latitude: number, longitude: number): boolean {
  const [[southLatitude, westLongitude], [northLatitude, eastLongitude]] = HCMC_BOUNDS

  return (
    latitude >= southLatitude && latitude <= northLatitude && longitude >= westLongitude && longitude <= eastLongitude
  )
}

function cleanAddress(address: string): string {
  const cleanedParts = address
    .split(',')
    .map((part) => part.trim())
    .filter((part) => part.length > 0 && !/^\d+$/.test(part) && !/^unnamed road$/i.test(part))

  return Array.from(new Set(cleanedParts)).join(', ')
}

function normalizeVietnameseAddressPart(value?: string): string {
  if (!value) return ''

  return value
    .replace(/^Ho Chi Minh City$/i, 'Thành phố Hồ Chí Minh')
    .replace(/^Thanh pho Ho Chi Minh$/i, 'Thành phố Hồ Chí Minh')
    .replace(/^Viet Nam$/i, 'Việt Nam')
    .trim()
}

function getDisplayAddressFromNominatim(data: {
  display_name?: string
  address?: {
    house_number?: string
    road?: string
    neighbourhood?: string
    suburb?: string
    city_district?: string
    quarter?: string
    borough?: string
    municipality?: string
    county?: string
    city?: string
    state?: string
    country?: string
  }
}): string {
  const detail = data.address

  if (!detail) {
    return cleanAddress(data.display_name ?? '')
  }

  const parts: string[] = []
  const road = normalizeVietnameseAddressPart(detail.road)
  const houseNumber = normalizeVietnameseAddressPart(detail.house_number)
  if (houseNumber && road) {
    parts.push(`${houseNumber} ${road}`)
  } else if (road) {
    parts.push(road)
  }

  const ward =
    normalizeVietnameseAddressPart(detail.suburb) ||
    normalizeVietnameseAddressPart(detail.quarter) ||
    normalizeVietnameseAddressPart(detail.neighbourhood)
  const district =
    normalizeVietnameseAddressPart(detail.city_district) ||
    normalizeVietnameseAddressPart(detail.borough) ||
    normalizeVietnameseAddressPart(detail.municipality) ||
    normalizeVietnameseAddressPart(detail.county)
  const city = normalizeVietnameseAddressPart(detail.city)
  const state = normalizeVietnameseAddressPart(detail.state)
  const country = normalizeVietnameseAddressPart(detail.country) || 'Việt Nam'

  if (ward && ward !== road) {
    parts.push(ward)
  }

  if (district && district !== ward) {
    parts.push(district)
  } else if (city && city !== ward && city !== district) {
    parts.push(city)
  }

  const province = state || (city === 'Thành phố Hồ Chí Minh' ? city : 'Thành phố Hồ Chí Minh')
  if (province && !parts.includes(province)) {
    parts.push(province)
  }

  if (country && !parts.includes(country)) {
    parts.push(country)
  }

  const formattedAddress = cleanAddress(parts.join(', '))

  return formattedAddress || cleanAddress(data.display_name ?? '')
}

async function reverseGeocode(latitude: number, longitude: number): Promise<string> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&accept-language=vi`
    )
    const data = (await response.json()) as {
      display_name?: string
      address?: {
        house_number?: string
        road?: string
        neighbourhood?: string
        suburb?: string
        city_district?: string
        quarter?: string
        borough?: string
        municipality?: string
        county?: string
        city?: string
        state?: string
        country?: string
      }
    }
    const formattedAddress = getDisplayAddressFromNominatim(data)

    return formattedAddress || `${formatCoordinate(latitude)}, ${formatCoordinate(longitude)}`
  } catch {
    return `${formatCoordinate(latitude)}, ${formatCoordinate(longitude)}`
  }
}

async function searchAddressSuggestions(query: string, limit = 5): Promise<AddressSuggestion[]> {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      `${query}, Thanh pho Ho Chi Minh, Viet Nam`
    )}&limit=${limit}&accept-language=vi&addressdetails=1`
  )
  const data = (await response.json()) as Array<{
    lat: string
    lon: string
    display_name?: string
    address?: Parameters<typeof getDisplayAddressFromNominatim>[0]['address']
  }>

  return data
    .map((item) => ({
      displayName: getDisplayAddressFromNominatim(item),
      latitude: Number(item.lat),
      longitude: Number(item.lon)
    }))
    .filter((item) => item.displayName && Number.isFinite(item.latitude) && Number.isFinite(item.longitude))
}

export function BookingAddressMap({
  address,
  latitude,
  longitude,
  onAddressChange,
  onLatitudeChange,
  onLongitudeChange
}: BookingAddressMapProps) {
  const { t } = useTranslation('services')
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<LeafletMap | null>(null)
  const markerRef = useRef<LeafletMarker | null>(null)
  const [isLeafletLoaded, setIsLeafletLoaded] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [isSuggesting, setIsSuggesting] = useState(false)
  const [searchError, setSearchError] = useState('')
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([])
  const [isSuggestionOpen, setIsSuggestionOpen] = useState(false)

  const parsedLatitude = Number(latitude)
  const parsedLongitude = Number(longitude)
  const hasValidSavedCoords =
    Number.isFinite(parsedLatitude) &&
    Number.isFinite(parsedLongitude) &&
    isInsideHoChiMinhCityBounds(parsedLatitude, parsedLongitude)
  const initialLatitude = hasValidSavedCoords ? parsedLatitude : DEFAULT_LATITUDE
  const initialLongitude = hasValidSavedCoords ? parsedLongitude : DEFAULT_LONGITUDE

  useEffect(() => {
    if (typeof window === 'undefined') return

    if ((window as WindowWithLeaflet).L) {
      window.setTimeout(() => setIsLeafletLoaded(true), 0)
      return
    }

    let cssLoaded = false
    let jsLoaded = false

    function checkLoaded() {
      if (cssLoaded && jsLoaded) {
        setIsLeafletLoaded(true)
      }
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
        checkLoaded()
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
        checkLoaded()
      }
      document.head.appendChild(script)
    } else if ((window as WindowWithLeaflet).L) {
      jsLoaded = true
    }

    checkLoaded()
  }, [])

  const updateLocation = useCallback(
    async (nextLatitude: number, nextLongitude: number, shouldReverseGeocode: boolean) => {
      onLatitudeChange(formatCoordinate(nextLatitude))
      onLongitudeChange(formatCoordinate(nextLongitude))

      if (markerRef.current) {
        markerRef.current.setLatLng([nextLatitude, nextLongitude])
      }

      if (mapInstanceRef.current) {
        mapInstanceRef.current.setView([nextLatitude, nextLongitude], mapInstanceRef.current.getZoom())
      }

      if (shouldReverseGeocode) {
        const nextAddress = await reverseGeocode(nextLatitude, nextLongitude)
        onAddressChange(nextAddress)
      }
    },
    [onAddressChange, onLatitudeChange, onLongitudeChange]
  )

  useEffect(() => {
    const trimmedQuery = searchQuery.trim()

    if (trimmedQuery.length < 3) {
      return
    }

    let isMounted = true
    const timeoutId = window.setTimeout(() => {
      setIsSuggesting(true)
      searchAddressSuggestions(trimmedQuery)
        .then((nextSuggestions) => {
          if (!isMounted) return
          setSuggestions(nextSuggestions)
          setIsSuggestionOpen(true)
        })
        .catch(() => {
          if (!isMounted) return
          setSuggestions([])
          setIsSuggestionOpen(false)
        })
        .finally(() => {
          if (!isMounted) return
          setIsSuggesting(false)
        })
    }, 450)

    return () => {
      isMounted = false
      window.clearTimeout(timeoutId)
    }
  }, [searchQuery])

  useEffect(() => {
    if (!isLeafletLoaded || !mapContainerRef.current || typeof window === 'undefined') return

    const L = (window as WindowWithLeaflet).L
    if (!L || mapInstanceRef.current) return

    const container = mapContainerRef.current as HTMLDivElement & { _leaflet_id?: number | null }
    if (container._leaflet_id) {
      container._leaflet_id = null
    }

    const map = L.map(mapContainerRef.current, {
      center: [initialLatitude, initialLongitude],
      zoom: DEFAULT_ZOOM,
      minZoom: 11,
      maxBounds: HCMC_BOUNDS,
      maxBoundsViscosity: 0.8,
      scrollWheelZoom: true
    })

    const leafletElement = map.getContainer()
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
    Object.entries(forcedStyles).forEach(([property, value]) => {
      leafletElement.style.setProperty(property, value, 'important')
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map)

    const markerIcon = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    })

    const marker = L.marker([initialLatitude, initialLongitude], {
      draggable: true,
      icon: markerIcon
    }).addTo(map)

    marker.on('dragend', async () => {
      const position = marker.getLatLng()
      await updateLocation(position.lat, position.lng, true)
    })

    map.on('click', async (event) => {
      await updateLocation(event.latlng.lat, event.latlng.lng, true)
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
  }, [initialLatitude, initialLongitude, isLeafletLoaded, updateLocation])

  function handleGetMyLocation() {
    if (!navigator.geolocation) {
      setSearchError(t('bookingFlow.addressMap.geoUnsupported'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude: currentLatitude, longitude: currentLongitude } = position.coords
        await updateLocation(currentLatitude, currentLongitude, true)
        setSearchError('')
      },
      () => {
        setSearchError(t('bookingFlow.addressMap.geoFailed'))
      }
    )
  }

  async function handleSelectSuggestion(suggestion: AddressSuggestion) {
    setSearchQuery(suggestion.displayName)
    setSuggestions([])
    setIsSuggestionOpen(false)
    onAddressChange(suggestion.displayName)
    await updateLocation(suggestion.latitude, suggestion.longitude, false)
    setSearchError('')
  }

  async function handleSearchAddress(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!searchQuery.trim()) return

    setIsSearching(true)
    setSearchError('')

    try {
      const data = await searchAddressSuggestions(searchQuery, 1)

      if (!data.length) {
        setSearchError(t('bookingFlow.addressMap.addressNotFound'))
        return
      }

      await handleSelectSuggestion(data[0])
      setSearchError('')
    } catch {
      setSearchError(t('bookingFlow.addressMap.searchFailed'))
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <section className='md:col-span-2 rounded-md border border-border bg-muted/30 p-4'>
      <style>{LEAFLET_OVERRIDE_STYLES}</style>
      <div className='flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
        <div>
          <p className='flex items-center gap-2 text-sm font-semibold text-foreground'>
            <MaterialIcon name='pin_drop' className='text-[18px] text-primary' />
            {t('bookingFlow.addressMap.title')}
          </p>
          <p className='mt-1 text-xs text-muted-foreground'>{t('bookingFlow.addressMap.subtitle')}</p>
        </div>
        <button
          type='button'
          onClick={handleGetMyLocation}
          className='inline-flex items-center justify-center gap-2 rounded-md border border-primary/30 bg-primary/5 px-3 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground'
        >
          <MaterialIcon name='my_location' className='text-[17px]' />
          {t('bookingFlow.addressMap.myLocation')}
        </button>
      </div>

      <form className='mt-4 flex flex-col gap-2 sm:flex-row' onSubmit={handleSearchAddress}>
        <div className='relative min-w-0 flex-1'>
          <MaterialIcon
            name='search'
            className='absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-muted-foreground'
          />
          <input
            type='text'
            value={searchQuery}
            onChange={(event) => {
              const nextQuery = event.target.value
              setSearchQuery(nextQuery)

              if (nextQuery.trim().length < 3) {
                setSuggestions([])
                setIsSuggestionOpen(false)
                setIsSuggesting(false)
                return
              }

              setIsSuggestionOpen(true)
            }}
            onFocus={() => {
              if (suggestions.length > 0) {
                setIsSuggestionOpen(true)
              }
            }}
            onBlur={() => {
              window.setTimeout(() => setIsSuggestionOpen(false), 150)
            }}
            className='h-11 w-full rounded-md border border-border bg-background pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring'
            placeholder={t('bookingFlow.addressMap.searchPlaceholder')}
          />
          {isSuggesting && (
            <span className='absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin rounded-full border-2 border-primary border-t-transparent' />
          )}
          {isSuggestionOpen && suggestions.length > 0 && (
            <div className='absolute left-0 right-0 top-[calc(100%+0.35rem)] z-[1200] max-h-64 overflow-y-auto rounded-md border border-border bg-card py-1 shadow-xl'>
              {suggestions.map((suggestion) => (
                <button
                  key={`${suggestion.latitude}-${suggestion.longitude}-${suggestion.displayName}`}
                  type='button'
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => void handleSelectSuggestion(suggestion)}
                  className='flex w-full items-start gap-2 px-3 py-2 text-left text-sm text-card-foreground transition-colors hover:bg-muted'
                >
                  <MaterialIcon name='location_on' className='mt-0.5 shrink-0 text-[18px] text-primary' />
                  <span className='line-clamp-2'>{suggestion.displayName}</span>
                </button>
              ))}
            </div>
          )}
          {isSuggestionOpen && !isSuggesting && searchQuery.trim().length >= 3 && suggestions.length === 0 && (
            <div className='absolute left-0 right-0 top-[calc(100%+0.35rem)] z-[1200] rounded-md border border-border bg-card px-3 py-2 text-sm text-muted-foreground shadow-xl'>
              {t('bookingFlow.addressMap.suggestionsEmpty')}
            </div>
          )}
        </div>
        <button
          type='submit'
          disabled={isSearching}
          className='inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60'
        >
          {isSearching ? (
            <span className='h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent' />
          ) : (
            <>
              <MaterialIcon name='search' className='text-[18px]' />
              {t('bookingFlow.addressMap.searchButton')}
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

      <div className='pb-booking-map-wrapper mt-4 h-72 w-full overflow-hidden rounded-md border border-border bg-card'>
        {!isLeafletLoaded && (
          <div className='absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-card text-muted-foreground'>
            <MaterialIcon name='map' className='animate-bounce text-[36px] text-primary' />
            <span className='text-xs'>{t('bookingFlow.addressMap.mapLoading')}</span>
          </div>
        )}
        <div ref={mapContainerRef} className='h-full w-full' />
      </div>

      <p className='mt-2 text-center text-[11px] text-muted-foreground'>{t('bookingFlow.addressMap.mapHint')}</p>

      {address && (
        <div className='mt-4 flex items-start gap-3 rounded-md border border-primary/30 bg-primary/5 px-4 py-3'>
          <MaterialIcon name='location_on' className='mt-0.5 shrink-0 text-[20px] text-primary' />
          <div className='min-w-0 flex-1'>
            <p className='text-xs font-semibold text-muted-foreground'>{t('bookingFlow.addressMap.selectedAddress')}</p>
            <p className='mt-1 text-sm font-medium text-foreground'>{cleanAddress(address)}</p>
          </div>
        </div>
      )}
    </section>
  )
}
