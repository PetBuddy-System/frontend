import { useMemo, useState, type FormEvent, type InputHTMLAttributes, type SelectHTMLAttributes } from 'react'
import { useTranslation } from 'react-i18next'

import { cn } from '~/shared/lib/cn'
import { Button, MaterialIcon } from '~/shared/ui'

import {
  CATALOG_STATUSES,
  CATALOG_TYPES,
  PET_SPECIES,
  WEEK_DAYS,
  WEIGHT_RANGES,
  type AdminCatalog,
  type AdminTimeSlot,
  type CatalogRequest,
  type CatalogStatus,
  type CatalogType,
  type TimeSlotRequest
} from '../../lib/catalog-management'

export interface AdminServicesTableProps {
  services: AdminCatalog[]
  timeSlotsByCatalogId: Record<number, AdminTimeSlot[]>
  isLoading?: boolean
  isSaving?: boolean
  onUpdateCatalog: (service: AdminCatalog) => void | Promise<void>
  onToggleCatalogStatus: (service: AdminCatalog) => void | Promise<void>
  onLoadTimeSlots: (catalogId: number) => void | Promise<void>
  onCreateTimeSlot: (payload: TimeSlotRequest) => void | Promise<void>
  onUpdateTimeSlot: (timeSlotId: number, payload: any) => void | Promise<void>
  onToggleTimeSlot: (slot: AdminTimeSlot) => void | Promise<void>
}

const STATUS_CLASS_BY_STATUS: Record<CatalogStatus, string> = {
  AVAILABLE: 'bg-success text-success-foreground',
  UNAVAILABLE: 'bg-warning text-warning-foreground',
  DISCONTINUED: 'bg-destructive text-destructive-foreground'
}

const CATEGORY_CLASS_BY_TYPE: Record<CatalogType, string> = {
  AT_STORE: 'bg-primary/10 text-primary',
  AT_HOME: 'bg-secondary text-secondary-foreground'
}

const formatCurrency = (value: number) => new Intl.NumberFormat('vi-VN').format(value)
const formatTime = (value: string) => value.slice(0, 5)

export function AdminServicesTable({
  services,
  timeSlotsByCatalogId,
  isLoading = false,
  isSaving = false,
  onUpdateCatalog,
  onToggleCatalogStatus,
  onLoadTimeSlots,
  onCreateTimeSlot,
  onUpdateTimeSlot,
  onToggleTimeSlot
}: AdminServicesTableProps) {
  const { t } = useTranslation('admin')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [detailService, setDetailService] = useState<AdminCatalog | null>(null)
  const [detailMode, setDetailMode] = useState<'view' | 'edit'>('view')
  const [scheduleService, setScheduleService] = useState<AdminCatalog | null>(null)
  const [isCreateSlotOpen, setIsCreateSlotOpen] = useState(false)
  const [editingSlot, setEditingSlot] = useState<AdminTimeSlot | null>(null)

  const filteredServices = useMemo(() => {
    const normalizedSearchTerm = searchTerm.trim().toLowerCase()

    return services.filter((service) => {
      const matchesSearch =
        normalizedSearchTerm.length === 0 ||
        service.catalogName.toLowerCase().includes(normalizedSearchTerm) ||
        String(service.catalogId).includes(normalizedSearchTerm)
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && service.status === 'AVAILABLE') ||
        (statusFilter === 'inactive' && service.status !== 'AVAILABLE')

      return matchesSearch && matchesStatus
    })
  }, [searchTerm, services, statusFilter])

  const scheduleSlots = scheduleService ? (timeSlotsByCatalogId[scheduleService.catalogId] ?? []) : []

  return (
    <>
      <section className='overflow-hidden rounded-xl border border-border bg-card shadow-sm'>
        <div className='flex border-b border-border bg-muted px-5 py-4'>
          <div className='flex flex-col gap-3 sm:flex-row'>
            <div className='relative'>
              <MaterialIcon name='search' className='absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground' />
              <input
                type='search'
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder={t('serviceManagement.searchPlaceholder')}
                className='h-10 w-full rounded-lg border border-input bg-card px-10 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring sm:w-72'
              />
            </div>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}
              className='h-10 rounded-lg border border-input bg-card px-4 text-sm font-semibold text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring'
            >
              <option value='all'>{t('serviceManagement.filters.status.all')}</option>
              <option value='active'>{t('serviceManagement.filters.status.active')}</option>
              <option value='inactive'>{t('serviceManagement.filters.status.inactive')}</option>
            </select>
          </div>
        </div>

        <div className='overflow-x-auto'>
          <table className='w-full min-w-[980px] border-collapse text-left'>
            <thead>
              <tr className='border-b border-border bg-muted/50 text-sm font-bold text-muted-foreground'>
                <th className='px-4 py-3'>{t('serviceManagement.table.columns.name')}</th>
                <th className='px-4 py-3'>{t('serviceManagement.table.columns.category')}</th>
                <th className='px-4 py-3'>{t('serviceManagement.table.columns.price')}</th>
                <th className='px-4 py-3'>{t('serviceManagement.table.columns.duration')}</th>
                <th className='px-4 py-3 text-center'>{t('serviceManagement.table.columns.status')}</th>
                <th className='px-4 py-3'>{t('serviceManagement.table.columns.updatedAt')}</th>
                <th className='px-4 py-3 text-right'>{t('serviceManagement.table.columns.actions')}</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-border'>
              {isLoading ? (
                <tr>
                  <td className='px-4 py-10 text-center text-sm font-semibold text-muted-foreground' colSpan={7}>
                    {t('serviceManagement.feedback.loading')}
                  </td>
                </tr>
              ) : null}
              {!isLoading && filteredServices.length === 0 ? (
                <tr>
                  <td className='px-4 py-10 text-center text-sm font-semibold text-muted-foreground' colSpan={7}>
                    {t('serviceManagement.feedback.empty')}
                  </td>
                </tr>
              ) : null}
              {!isLoading
                ? filteredServices.map((service) => (
                    <tr key={service.catalogId} className='transition-colors hover:bg-muted'>
                      <td className='px-4 py-3'>
                        <div className='flex items-center gap-4'>
                          <div className='flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-muted text-primary shadow-sm'>
                            <MaterialIcon name={service.icon} className='text-2xl' />
                          </div>
                          <div>
                            <p className='font-bold text-card-foreground'>{service.catalogName}</p>
                            <p className='text-xs text-muted-foreground'>
                              #{service.catalogId} - {t(`serviceManagement.weightRanges.${service.weightRange}`)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className='px-4 py-3'>
                        <span
                          className={cn(
                            'inline-flex rounded-full px-3 py-1 text-xs font-bold',
                            CATEGORY_CLASS_BY_TYPE[service.catalogType]
                          )}
                        >
                          {t(`serviceManagement.catalogTypes.${service.catalogType}`)}
                        </span>
                      </td>
                      <td className='px-4 py-3 font-semibold text-card-foreground'>
                        {formatCurrency(service.price)}
                        {t('serviceManagement.pricing.currency')}
                      </td>
                      <td className='px-4 py-3 text-sm text-muted-foreground'>
                        {t('serviceManagement.table.durationValue', {
                          duration: service.durationMinute
                        })}
                      </td>
                      <td className='px-4 py-3 text-center'>
                        <div className='flex flex-col items-center gap-1.5'>
                          <span
                            className={cn(
                              'inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase',
                              STATUS_CLASS_BY_STATUS[service.status]
                            )}
                          >
                            {t(`serviceManagement.catalogStatus.${service.status}`)}
                          </span>
                          <button
                            type='button'
                            onClick={() => void onToggleCatalogStatus(service)}
                            disabled={isSaving}
                            className={cn(
                              'relative h-6 w-11 rounded-full transition-colors disabled:opacity-50 after:absolute after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-card after:transition-all',
                              service.status === 'AVAILABLE'
                                ? 'bg-success after:right-0.5'
                                : 'bg-muted-foreground after:left-0.5'
                            )}
                            aria-label={
                              service.status === 'AVAILABLE'
                                ? t('serviceManagement.actions.deactivate')
                                : t('serviceManagement.actions.activate')
                            }
                          />
                        </div>
                      </td>
                      <td className='px-4 py-3 text-sm text-muted-foreground'>{service.updatedAt}</td>
                      <td className='px-4 py-3'>
                        <div className='flex justify-end gap-2'>
                          <Button
                            type='button'
                            size='icon'
                            variant='ghost'
                            aria-label={t('serviceManagement.actions.view')}
                            onClick={() => {
                              setDetailMode('view')
                              setDetailService(service)
                            }}
                          >
                            <MaterialIcon name='visibility' className='text-lg text-primary' />
                          </Button>
                          <Button
                            type='button'
                            size='icon'
                            variant='ghost'
                            aria-label={t('serviceManagement.actions.edit')}
                            onClick={() => {
                              setDetailMode('edit')
                              setDetailService(service)
                            }}
                          >
                            <MaterialIcon name='edit' className='text-lg text-secondary-foreground' />
                          </Button>
                          <Button
                            type='button'
                            size='icon'
                            variant='ghost'
                            aria-label={t('serviceManagement.actions.schedule')}
                            onClick={() => {
                              setScheduleService(service)
                              void onLoadTimeSlots(service.catalogId)
                            }}
                          >
                            <MaterialIcon name='calendar_month' className='text-lg text-success' />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                : null}
            </tbody>
          </table>
        </div>

        <div className='flex flex-col gap-4 border-t border-border bg-muted px-4 py-3 sm:flex-row sm:items-center sm:justify-between'>
          <p className='text-sm text-muted-foreground'>
            {t('serviceManagement.pagination.showing', {
              shown: filteredServices.length,
              total: services.length
            })}
          </p>
        </div>
      </section>

      <ServiceDetailModal
        service={detailService}
        mode={detailMode}
        isSaving={isSaving}
        onClose={() => setDetailService(null)}
        onSubmit={(updatedService) => {
          void onUpdateCatalog(updatedService)
          setDetailService(null)
        }}
      />
      <WeeklyScheduleModal
        service={scheduleService}
        slots={scheduleSlots}
        isSaving={isSaving}
        onClose={() => setScheduleService(null)}
        onCreateSlot={() => setIsCreateSlotOpen(true)}
        onEditSlot={(slot) => setEditingSlot(slot)}
        onToggleSlot={onToggleTimeSlot}
      />
      <CreateTimeSlotModal
        service={scheduleService}
        isOpen={isCreateSlotOpen}
        isSaving={isSaving}
        onClose={() => setIsCreateSlotOpen(false)}
        onSubmit={(payload) => {
          void onCreateTimeSlot(payload)
          setIsCreateSlotOpen(false)
        }}
      />
      <EditTimeSlotModal
        slot={editingSlot}
        isSaving={isSaving}
        onClose={() => setEditingSlot(null)}
        onSubmit={(timeSlotId, payload) => {
          void onUpdateTimeSlot(timeSlotId, payload)
          setEditingSlot(null)
        }}
      />
    </>
  )
}

function ServiceDetailModal({
  service,
  mode,
  isSaving,
  onClose,
  onSubmit
}: {
  service: AdminCatalog | null
  mode: 'view' | 'edit'
  isSaving: boolean
  onClose: () => void
  onSubmit: (service: AdminCatalog) => void
}) {
  const { t } = useTranslation('admin')

  if (!service) {
    return null
  }

  const isReadOnly = mode === 'view'

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!service) {
      return
    }

    const formData = new FormData(event.currentTarget)
    onSubmit({
      ...service,
      catalogName: String(formData.get('catalogName') ?? '').trim(),
      catalogType: String(formData.get('catalogType') ?? service.catalogType) as CatalogRequest['catalogType'],
      petSpecies: String(formData.get('petSpecies') ?? service.petSpecies) as CatalogRequest['petSpecies'],
      weightRange: String(formData.get('weightRange') ?? service.weightRange) as CatalogRequest['weightRange'],
      price: Number(formData.get('price') ?? service.price),
      durationMinute: Number(formData.get('durationMinute') ?? service.durationMinute),
      bufferTime: Number(formData.get('bufferTime') ?? service.bufferTime),
      status: String(formData.get('status') ?? service.status) as CatalogRequest['status'],
      description: String(formData.get('description') ?? '').trim()
    })
  }

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
      <button
        type='button'
        aria-label={t('serviceManagement.detail.close')}
        className='absolute inset-0 bg-foreground/40 backdrop-blur-sm'
        onClick={onClose}
      />
      <section className='relative w-full max-w-4xl overflow-hidden rounded-xl border border-border bg-card shadow-xl'>
        <header className='flex flex-col gap-4 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between'>
          <div className='flex items-center gap-4'>
            <div className='flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-primary'>
              <MaterialIcon name={service.icon} className='text-2xl' />
            </div>
            <div>
              <p className='text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground'>#{service.catalogId}</p>
              <h2 className='font-display text-2xl font-bold text-card-foreground'>
                {mode === 'view' ? t('serviceManagement.detail.viewTitle') : t('serviceManagement.detail.editTitle')}
              </h2>
            </div>
          </div>
          <div className='flex gap-2'>
            <Button type='button' variant='outline' onClick={onClose}>
              {t('serviceManagement.detail.cancel')}
            </Button>
            {!isReadOnly ? (
              <Button type='submit' form='service-detail-form' disabled={isSaving}>
                <MaterialIcon name='save' />
                {isSaving ? t('serviceManagement.feedback.saving') : t('serviceManagement.detail.save')}
              </Button>
            ) : null}
          </div>
        </header>

        <form
          id='service-detail-form'
          className='grid max-h-[calc(100vh-12rem)] gap-4 overflow-y-auto p-5 md:grid-cols-2'
          onSubmit={handleSubmit}
        >
          <Field
            name='catalogName'
            label={t('serviceManagement.detail.fields.catalogName')}
            defaultValue={service.catalogName}
            readOnly={isReadOnly}
            required
          />
          <SelectField
            name='catalogType'
            label={t('serviceManagement.detail.fields.catalogType')}
            defaultValue={service.catalogType}
            disabled={isReadOnly}
            options={[...CATALOG_TYPES]}
          />
          <SelectField
            name='petSpecies'
            label={t('serviceManagement.detail.fields.petSpecies')}
            defaultValue={service.petSpecies}
            disabled={isReadOnly}
            options={[...PET_SPECIES]}
          />
          <SelectField
            name='weightRange'
            label={t('serviceManagement.detail.fields.weightRange')}
            defaultValue={service.weightRange}
            disabled={isReadOnly}
            options={[...WEIGHT_RANGES]}
            optionLabels={Object.fromEntries(
              WEIGHT_RANGES.map((wr) => [wr, t(`serviceManagement.weightRanges.${wr}`)])
            )}
          />
          <Field
            name='price'
            label={t('serviceManagement.detail.fields.price')}
            defaultValue={String(service.price)}
            readOnly={isReadOnly}
            type='number'
            min={0}
            required
          />
          <Field
            name='durationMinute'
            label={t('serviceManagement.detail.fields.durationMinute')}
            defaultValue={String(service.durationMinute)}
            readOnly={isReadOnly}
            type='number'
            min={0}
            required
          />
          <Field
            name='bufferTime'
            label={t('serviceManagement.detail.fields.bufferTime')}
            defaultValue={String(service.bufferTime)}
            readOnly={isReadOnly}
            type='number'
            min={0}
            required
          />
          <SelectField
            name='status'
            label={t('serviceManagement.detail.fields.status')}
            defaultValue={service.status}
            disabled={isReadOnly}
            options={[...CATALOG_STATUSES]}
          />
          <label className='space-y-2 md:col-span-2'>
            <span className='text-sm font-semibold text-card-foreground'>
              {t('serviceManagement.detail.fields.description')}
            </span>
            <textarea
              name='description'
              rows={4}
              defaultValue={service.description}
              readOnly={isReadOnly}
              className='w-full rounded-lg border border-input bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring read-only:bg-muted'
            />
          </label>
        </form>
      </section>
    </div>
  )
}

function WeeklyScheduleModal({
  service,
  slots,
  isSaving,
  onClose,
  onCreateSlot,
  onEditSlot,
  onToggleSlot
}: {
  service: AdminCatalog | null
  slots: AdminTimeSlot[]
  isSaving: boolean
  onClose: () => void
  onCreateSlot: () => void
  onEditSlot: (slot: AdminTimeSlot) => void
  onToggleSlot: (slot: AdminTimeSlot) => void | Promise<void>
}) {
  const { t } = useTranslation('admin')

  if (!service) {
    return null
  }

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
      <button
        type='button'
        aria-label={t('serviceManagement.schedule.close')}
        className='absolute inset-0 bg-foreground/40 backdrop-blur-sm'
        onClick={onClose}
      />
      <section className='relative flex max-h-[calc(100vh-2rem)] w-full max-w-6xl flex-col overflow-hidden rounded-xl border border-border bg-card shadow-xl'>
        <header className='flex flex-col gap-4 border-b border-border p-5 lg:flex-row lg:items-center lg:justify-between'>
          <div>
            <p className='text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground'>{service.catalogName}</p>
            <h2 className='font-display text-2xl font-bold text-card-foreground'>
              {t('serviceManagement.schedule.title')}
            </h2>
            <p className='mt-1 text-sm text-muted-foreground'>
              {t('serviceManagement.schedule.subtitle', {
                duration: service.durationMinute,
                buffer: service.bufferTime
              })}
            </p>
          </div>
          <div className='flex flex-wrap gap-2'>
            <Button type='button' variant='outline' onClick={onClose}>
              {t('serviceManagement.schedule.closeButton')}
            </Button>
            <Button type='button' onClick={onCreateSlot}>
              <MaterialIcon name='add' />
              {t('serviceManagement.schedule.createSlot')}
            </Button>
          </div>
        </header>

        <div className='min-h-0 flex-1 overflow-y-auto p-5'>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-7'>
            {WEEK_DAYS.map((day) => {
              const daySlots = slots
                .filter((slot) => slot.dayOfWeek === day)
                .sort((a, b) => a.startTime.localeCompare(b.startTime))

              return (
                <article key={day} className='min-h-44 rounded-xl border border-border bg-muted/40 p-3'>
                  <h3 className='mb-3 text-sm font-bold text-card-foreground'>
                    {t(`serviceManagement.weekDays.${day}`)}
                  </h3>
                  <div className='space-y-2'>
                    {daySlots.length > 0 ? (
                      daySlots.map((slot) => (
                        <div
                          key={slot.timeSlotId}
                          className='flex flex-col gap-2 rounded-lg border border-border bg-card p-3 shadow-sm'
                        >
                          <div className='flex items-center justify-between'>
                            <span className='font-mono text-sm font-bold text-card-foreground'>
                              {formatTime(slot.startTime)}
                            </span>
                            <button
                              type='button'
                              onClick={() => void onToggleSlot(slot)}
                              disabled={isSaving}
                              className={cn(
                                'relative h-6 w-11 rounded-full transition-colors disabled:opacity-50 after:absolute after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-card after:transition-all',
                                slot.isActive ? 'bg-success after:right-0.5' : 'bg-muted-foreground after:left-0.5'
                              )}
                              aria-label={
                                slot.isActive
                                  ? t('serviceManagement.schedule.active')
                                  : t('serviceManagement.schedule.inactive')
                              }
                            />
                          </div>
                          <div className='flex justify-end border-t border-border/50 pt-2'>
                            <button
                              type='button'
                              onClick={() => onEditSlot(slot)}
                              className='flex items-center gap-1 text-xs font-semibold text-primary hover:underline'
                            >
                              <MaterialIcon name='edit' className='text-sm' />
                              Sửa giờ
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className='flex min-h-24 items-center justify-center rounded-lg border border-dashed border-border text-center text-xs font-semibold text-muted-foreground'>
                        {t('serviceManagement.schedule.empty')}
                      </div>
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}

function CreateTimeSlotModal({
  service,
  isOpen,
  isSaving,
  onClose,
  onSubmit
}: {
  service: AdminCatalog | null
  isOpen: boolean
  isSaving: boolean
  onClose: () => void
  onSubmit: (payload: TimeSlotRequest) => void
}) {
  const { t } = useTranslation('admin')

  if (!isOpen || !service) {
    return null
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!service) {
      return
    }

    const formData = new FormData(event.currentTarget)
    onSubmit({
      catalogId: service.catalogId,
      dayOfWeek: String(formData.get('dayOfWeek') ?? 'MONDAY') as TimeSlotRequest['dayOfWeek'],
      startTime: `${String(formData.get('startTime') ?? '08:00')}:00`,
      isActive: formData.get('isActive') === 'on'
    })
  }

  return (
    <div className='fixed inset-0 z-[60] flex items-center justify-center p-4'>
      <button
        type='button'
        aria-label={t('serviceManagement.timeSlot.close')}
        className='absolute inset-0 bg-foreground/40 backdrop-blur-sm'
        onClick={onClose}
      />
      <section className='relative w-full max-w-xl overflow-hidden rounded-xl border border-border bg-card shadow-xl'>
        <header className='border-b border-border p-5'>
          <p className='text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground'>#{service.catalogId}</p>
          <h2 className='font-display text-2xl font-bold text-card-foreground'>
            {t('serviceManagement.timeSlot.title')}
          </h2>
        </header>
        <form className='space-y-4 p-5' onSubmit={handleSubmit}>
          <Field label={t('serviceManagement.timeSlot.fields.catalog')} defaultValue={service.catalogName} readOnly />
          <SelectField
            name='dayOfWeek'
            label={t('serviceManagement.timeSlot.fields.dayOfWeek')}
            defaultValue='MONDAY'
            options={[...WEEK_DAYS]}
          />
          <Field
            name='startTime'
            label={t('serviceManagement.timeSlot.fields.startTime')}
            defaultValue='08:00'
            type='time'
            required
          />
          <label className='flex items-center justify-between gap-3 rounded-lg border border-border bg-muted p-4'>
            <span className='font-semibold text-card-foreground'>
              {t('serviceManagement.timeSlot.fields.isActive')}
            </span>
            <input
              name='isActive'
              type='checkbox'
              defaultChecked
              className='h-5 w-5 rounded border-border text-primary focus:ring-ring'
            />
          </label>
          <div className='flex justify-end gap-2 pt-2'>
            <Button type='button' variant='outline' onClick={onClose}>
              {t('serviceManagement.timeSlot.cancel')}
            </Button>
            <Button type='submit' disabled={isSaving}>
              <MaterialIcon name='save' />
              {isSaving ? t('serviceManagement.feedback.saving') : t('serviceManagement.timeSlot.save')}
            </Button>
          </div>
        </form>
      </section>
    </div>
  )
}

function EditTimeSlotModal({
  slot,
  isSaving,
  onClose,
  onSubmit
}: {
  slot: AdminTimeSlot | null
  isSaving: boolean
  onClose: () => void
  onSubmit: (timeSlotId: number, payload: { dayOfWeek: string; startTime: string; isActive: boolean }) => void
}) {
  const { t } = useTranslation('admin')

  if (!slot) {
    return null
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!slot) {
      return
    }

    const formData = new FormData(event.currentTarget)
    const timeVal = String(formData.get('startTime') ?? '08:00')
    const startTimeFormatted = timeVal.length === 5 ? `${timeVal}:00` : timeVal

    onSubmit(slot.timeSlotId, {
      dayOfWeek: String(formData.get('dayOfWeek') ?? slot.dayOfWeek),
      startTime: startTimeFormatted,
      isActive: formData.get('isActive') === 'on'
    })
  }

  const currentStartTime = slot.startTime.slice(0, 5)

  return (
    <div className='fixed inset-0 z-[60] flex items-center justify-center p-4'>
      <button
        type='button'
        aria-label={t('serviceManagement.timeSlot.close')}
        className='absolute inset-0 bg-foreground/40 backdrop-blur-sm'
        onClick={onClose}
      />
      <section className='relative w-full max-w-xl overflow-hidden rounded-xl border border-border bg-card shadow-xl'>
        <header className='border-b border-border p-5'>
          <p className='text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground'>TimeSlot ID: #{slot.timeSlotId}</p>
          <h2 className='font-display text-2xl font-bold text-card-foreground'>
            Chỉnh sửa khung giờ
          </h2>
        </header>
        <form className='space-y-4 p-5' onSubmit={handleSubmit}>
          <SelectField
            name='dayOfWeek'
            label={t('serviceManagement.timeSlot.fields.dayOfWeek')}
            defaultValue={slot.dayOfWeek}
            options={[...WEEK_DAYS]}
          />
          <Field
            name='startTime'
            label={t('serviceManagement.timeSlot.fields.startTime')}
            defaultValue={currentStartTime}
            type='time'
            required
          />
          <label className='flex items-center justify-between gap-3 rounded-lg border border-border bg-muted p-4'>
            <span className='font-semibold text-card-foreground'>
              {t('serviceManagement.timeSlot.fields.isActive')}
            </span>
            <input
              name='isActive'
              type='checkbox'
              defaultChecked={slot.isActive}
              className='h-5 w-5 rounded border-border text-primary focus:ring-ring'
            />
          </label>
          <div className='flex justify-end gap-2 pt-2'>
            <Button type='button' variant='outline' onClick={onClose}>
              {t('serviceManagement.timeSlot.cancel')}
            </Button>
            <Button type='submit' disabled={isSaving}>
              <MaterialIcon name='save' />
              {isSaving ? t('serviceManagement.feedback.saving') : t('serviceManagement.timeSlot.save')}
            </Button>
          </div>
        </form>
      </section>
    </div>
  )
}

function Field({
  label,
  readOnly,
  ...props
}: { label: string; readOnly?: boolean } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className='space-y-2'>
      <span className='text-sm font-semibold text-card-foreground'>{label}</span>
      <input
        {...props}
        readOnly={readOnly}
        className='h-11 w-full rounded-lg border border-input bg-background px-4 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring read-only:bg-muted'
      />
    </label>
  )
}

function SelectField({
  label,
  options,
  optionLabels,
  ...props
}: {
  label: string
  options: string[]
  optionLabels?: Record<string, string>
} & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <label className='space-y-2'>
      <span className='text-sm font-semibold text-card-foreground'>{label}</span>
      <select
        {...props}
        className='h-11 w-full rounded-lg border border-input bg-background px-4 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring disabled:bg-muted'
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {optionLabels?.[option] ?? option}
          </option>
        ))}
      </select>
    </label>
  )
}
