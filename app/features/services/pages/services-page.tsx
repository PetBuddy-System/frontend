import { useEffect, useMemo, useState } from 'react'

import { SiteBottomNav } from '~/shared/components'
import { SiteFab } from '~/shared/components'
import { SiteFooter } from '~/shared/components'
import { SiteHeader } from '~/shared/components'

import { ServicesCombo } from '../components/listing/services-combo'
import { ServicesGallery } from '../components/listing/services-gallery'
import { ServicesHero } from '../components/listing/services-hero'
import { ServicesIndividual } from '../components/listing/services-individual'
import { ServicesPriceBoard } from '../components/listing/services-price-board'
import { fetchServiceCatalogs, type CatalogResponse } from '../services'

const SERVICE_CATALOG_LIMIT = 5

function isCatalogVisible(catalog: CatalogResponse): boolean {
  return ['AVAILABLE', 'ACTIVE'].includes(catalog.status?.toUpperCase?.() ?? '')
}

export function ServicesPage() {
  const [catalogs, setCatalogs] = useState<CatalogResponse[]>([])
  const [isLoadingCatalogs, setIsLoadingCatalogs] = useState(true)
  const [catalogError, setCatalogError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    async function loadCatalogs() {
      try {
        setIsLoadingCatalogs(true)
        setCatalogError(null)
        const nextCatalogs = await fetchServiceCatalogs()

        if (isMounted) {
          setCatalogs(nextCatalogs)
        }
      } catch (error) {
        if (isMounted) {
          setCatalogError(error instanceof Error ? error.message : 'Unable to load service catalog.')
        }
      } finally {
        if (isMounted) {
          setIsLoadingCatalogs(false)
        }
      }
    }

    void loadCatalogs()

    return () => {
      isMounted = false
    }
  }, [])

  const visibleCatalogs = useMemo(() => {
    const availableCatalogs = catalogs.filter(isCatalogVisible)
    const sourceCatalogs = availableCatalogs.length > 0 ? availableCatalogs : catalogs

    return sourceCatalogs.slice(0, SERVICE_CATALOG_LIMIT)
  }, [catalogs])

  return (
    <div className='flex min-h-screen flex-col bg-background text-foreground'>
      <SiteHeader />
      <main className='flex-1 pb-24 md:pb-0'>
        <ServicesHero />
        <ServicesIndividual catalogs={visibleCatalogs} errorMessage={catalogError} isLoading={isLoadingCatalogs} />
        <ServicesCombo />
        <ServicesPriceBoard catalogs={visibleCatalogs} errorMessage={catalogError} isLoading={isLoadingCatalogs} />
        <ServicesGallery />
      </main>
      <SiteFooter />
      <SiteBottomNav />
      <SiteFab />
    </div>
  )
}
