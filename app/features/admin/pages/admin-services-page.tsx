import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { Button, MaterialIcon } from '~/shared/ui'

import { AdminSidebar } from '../components/layout/admin-sidebar'
import { AdminTopNav } from '../components/layout/admin-top-nav'
import { AdminFooter } from '../components/layout/admin-footer'
import { AdminCreateServiceModal } from '../components/services/admin-create-service-modal'
import { AdminServicesStatsGrid } from '../components/services/admin-services-stats-grid'
import { AdminServicesTable } from '../components/services/admin-services-table'
import {
  createCatalogApi,
  createTimeSlotApi,
  fetchCatalogsApi,
  fetchTimeSlotsByCatalogApi,
  updateCatalogApi,
  updateCatalogStatusApi,
  toggleTimeSlotActiveApi,
  updateTimeSlotApi
} from '../services/catalog'
import {
  mapAdminCatalogToCatalogRequest,
  mapCatalogResponseToAdminCatalog,
  mapTimeSlotResponseToAdminTimeSlot,
  type AdminCatalog,
  type AdminTimeSlot,
  type CatalogStatus,
  type CatalogRequest,
  type TimeSlotRequest,
  type TimeSlotUpdateRequest
} from '../lib/catalog-management'

export interface AdminServicesPageProps {
  sidebar?: ReactNode
  topNav?: ReactNode
}

export function AdminServicesPage({ sidebar, topNav }: AdminServicesPageProps = {}) {
  const { t } = useTranslation('admin')
  const [isCreateServiceOpen, setIsCreateServiceOpen] = useState(false)
  const [catalogs, setCatalogs] = useState<AdminCatalog[]>([])
  const [timeSlotsByCatalogId, setTimeSlotsByCatalogId] = useState<Record<number, AdminTimeSlot[]>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    async function loadCatalogs() {
      try {
        const response = await fetchCatalogsApi()
        const mappedCatalogs = response.data.map(mapCatalogResponseToAdminCatalog)

        if (isMounted) {
          setCatalogs(mappedCatalogs)
          setErrorMessage(null)
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(error instanceof Error ? error.message : t('serviceManagement.feedback.loadFailed'))
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadCatalogs()

    return () => {
      isMounted = false
    }
  }, [t])

  const serviceStats = useMemo(() => {
    const activeCount = catalogs.filter((catalog) => catalog.status === 'AVAILABLE').length
    const pausedCount = catalogs.filter((catalog) => catalog.status === 'UNAVAILABLE').length

    return {
      total: catalogs.length,
      active: activeCount,
      promotions: pausedCount
    }
  }, [catalogs])

  async function handleCreateCatalog(payload: CatalogRequest) {
    setIsSaving(true)
    try {
      const response = await createCatalogApi(payload)
      const createdCatalog = mapCatalogResponseToAdminCatalog(response.data)
      setCatalogs((currentCatalogs) => [createdCatalog, ...currentCatalogs])
      setIsCreateServiceOpen(false)
      setErrorMessage(null)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : t('serviceManagement.feedback.saveFailed'))
    } finally {
      setIsSaving(false)
    }
  }

  async function handleUpdateCatalog(service: AdminCatalog) {
    setIsSaving(true)
    try {
      const response = await updateCatalogApi(service.catalogId, mapAdminCatalogToCatalogRequest(service))
      const updatedCatalog = mapCatalogResponseToAdminCatalog(response.data)
      setCatalogs((currentCatalogs) =>
        currentCatalogs.map((catalog) => (catalog.catalogId === updatedCatalog.catalogId ? updatedCatalog : catalog))
      )
      setErrorMessage(null)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : t('serviceManagement.feedback.saveFailed'))
    } finally {
      setIsSaving(false)
    }
  }

  async function handleToggleCatalogStatus(service: AdminCatalog) {
    const nextStatus: CatalogStatus = service.status === 'AVAILABLE' ? 'UNAVAILABLE' : 'AVAILABLE'

    setIsSaving(true)
    try {
      const response = await updateCatalogStatusApi(service.catalogId, nextStatus)
      const updatedCatalog = mapCatalogResponseToAdminCatalog(response.data)
      setCatalogs((currentCatalogs) =>
        currentCatalogs.map((catalog) => (catalog.catalogId === updatedCatalog.catalogId ? updatedCatalog : catalog))
      )
      setErrorMessage(null)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : t('serviceManagement.feedback.saveFailed'))
    } finally {
      setIsSaving(false)
    }
  }

  async function handleLoadTimeSlots(catalogId: number) {
    if (timeSlotsByCatalogId[catalogId]) {
      return
    }

    try {
      const response = await fetchTimeSlotsByCatalogApi(catalogId)
      setTimeSlotsByCatalogId((currentSlots) => ({
        ...currentSlots,
        [catalogId]: response.data.map(mapTimeSlotResponseToAdminTimeSlot)
      }))
      setErrorMessage(null)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : t('serviceManagement.feedback.loadSlotsFailed'))
    }
  }

  async function handleCreateTimeSlot(payload: TimeSlotRequest) {
    setIsSaving(true)
    try {
      const response = await createTimeSlotApi(payload)
      const createdSlot = mapTimeSlotResponseToAdminTimeSlot(response.data)
      setTimeSlotsByCatalogId((currentSlots) => ({
        ...currentSlots,
        [createdSlot.catalogId]: [...(currentSlots[createdSlot.catalogId] ?? []), createdSlot]
      }))
      setErrorMessage(null)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : t('serviceManagement.feedback.saveFailed'))
    } finally {
      setIsSaving(false)
    }
  }

  async function handleUpdateTimeSlot(timeSlotId: number, payload: TimeSlotUpdateRequest) {
    setIsSaving(true)
    try {
      const response = await updateTimeSlotApi(timeSlotId, payload)
      const updatedSlot = mapTimeSlotResponseToAdminTimeSlot(response.data)
      setTimeSlotsByCatalogId((currentSlots) => ({
        ...currentSlots,
        [updatedSlot.catalogId]: (currentSlots[updatedSlot.catalogId] ?? []).map((currentSlot) =>
          currentSlot.timeSlotId === updatedSlot.timeSlotId ? updatedSlot : currentSlot
        )
      }))
      setErrorMessage(null)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : t('serviceManagement.feedback.saveFailed'))
    } finally {
      setIsSaving(false)
    }
  }

  async function handleToggleTimeSlot(slot: AdminTimeSlot) {
    setIsSaving(true)
    try {
      const response = await toggleTimeSlotActiveApi(slot.timeSlotId)
      const updatedSlot = mapTimeSlotResponseToAdminTimeSlot(response.data)
      setTimeSlotsByCatalogId((currentSlots) => ({
        ...currentSlots,
        [updatedSlot.catalogId]: (currentSlots[updatedSlot.catalogId] ?? []).map((currentSlot) =>
          currentSlot.timeSlotId === updatedSlot.timeSlotId ? updatedSlot : currentSlot
        )
      }))
      setErrorMessage(null)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : t('serviceManagement.feedback.saveFailed'))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className='flex h-screen overflow-hidden bg-background text-foreground'>
      {sidebar ?? <AdminSidebar />}
      <div className='flex min-w-0 flex-1 flex-col overflow-hidden'>
        {topNav ?? <AdminTopNav titleKey='serviceManagement.title' subtitleKey='serviceManagement.subtitle' />}
        <main className='flex-1 overflow-y-auto p-4 md:p-6'>
          <div className='mx-auto flex max-w-7xl flex-col gap-6'>
            <section className='flex flex-col justify-between gap-4 md:flex-row md:items-end'>
              <div>
                <h1 className='font-display text-2xl font-bold text-card-foreground md:text-3xl'>
                  {t('serviceManagement.title')}
                </h1>
                <p className='mt-2 text-muted-foreground'>{t('serviceManagement.subtitle')}</p>
              </div>
              <Button
                type='button'
                variant='secondary'
                size='lg'
                onClick={() => setIsCreateServiceOpen(true)}
                className='rounded-xl font-bold shadow-sm hover:shadow-md'
              >
                <MaterialIcon name='add' className='text-lg' />
                <span>{t('serviceManagement.actions.add')}</span>
              </Button>
            </section>

            {errorMessage ? (
              <div className='rounded-xl border border-destructive bg-destructive/10 px-4 py-3 text-sm font-semibold text-destructive'>
                {errorMessage}
              </div>
            ) : null}
            <AdminServicesStatsGrid stats={serviceStats} />
            <AdminServicesTable
              services={catalogs}
              timeSlotsByCatalogId={timeSlotsByCatalogId}
              isLoading={isLoading}
              isSaving={isSaving}
              onUpdateCatalog={handleUpdateCatalog}
              onToggleCatalogStatus={handleToggleCatalogStatus}
              onLoadTimeSlots={handleLoadTimeSlots}
              onCreateTimeSlot={handleCreateTimeSlot}
              onUpdateTimeSlot={handleUpdateTimeSlot}
              onToggleTimeSlot={handleToggleTimeSlot}
            />
            <AdminFooter />
          </div>
        </main>
      </div>

      <AdminCreateServiceModal
        isOpen={isCreateServiceOpen}
        isSaving={isSaving}
        onClose={() => setIsCreateServiceOpen(false)}
        onSubmit={handleCreateCatalog}
      />
    </div>
  )
}
