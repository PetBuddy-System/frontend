import type { FormEvent } from 'react'
import { useTranslation } from 'react-i18next'

import { Button, MaterialIcon } from '~/shared/ui'

import {
  CATALOG_STATUSES,
  CATALOG_TYPES,
  PET_SPECIES,
  WEIGHT_RANGES,
  type CatalogRequest
} from '../../lib/catalog-management'

export interface AdminCreateServiceModalProps {
  isOpen: boolean
  isSaving?: boolean
  onClose: () => void
  onSubmit: (payload: CatalogRequest) => void | Promise<void>
}

export function AdminCreateServiceModal({ isOpen, isSaving = false, onClose, onSubmit }: AdminCreateServiceModalProps) {
  const { t } = useTranslation('admin')

  if (!isOpen) {
    return null
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)

    void onSubmit({
      catalogName: String(formData.get('catalogName') ?? '').trim(),
      description: String(formData.get('description') ?? '').trim(),
      catalogType: String(formData.get('catalogType') ?? 'SPA') as CatalogRequest['catalogType'],
      petSpecies: String(formData.get('petSpecies') ?? 'ALL') as CatalogRequest['petSpecies'],
      price: Number(formData.get('price') ?? 0),
      weightRange: String(formData.get('weightRange') ?? 'SMALL_0_5KG') as CatalogRequest['weightRange'],
      durationMinute: Number(formData.get('durationMinute') ?? 0),
      bufferTime: Number(formData.get('bufferTime') ?? 0),
      status: String(formData.get('status') ?? 'AVAILABLE') as CatalogRequest['status']
    })
  }

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
      <button
        type='button'
        aria-label={t('serviceManagement.create.close')}
        className='absolute inset-0 bg-foreground/40 backdrop-blur-sm'
        onClick={onClose}
      />

      <section className='relative flex max-h-[calc(100vh-2rem)] w-full max-w-5xl flex-col overflow-hidden rounded-xl border border-border bg-card shadow-xl'>
        <header className='flex flex-col gap-4 border-b border-border px-5 py-5 lg:flex-row lg:items-end lg:justify-between'>
          <div>
            <p className='text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground'>PetBuddy Ops</p>
            <h2 className='mt-2 font-display text-2xl font-bold text-card-foreground md:text-3xl'>
              {t('serviceManagement.create.title')}
            </h2>
            <p className='mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground'>
              {t('serviceManagement.create.subtitle')}
            </p>
          </div>

          <div className='flex flex-wrap gap-3'>
            <Button type='button' variant='outline' onClick={onClose}>
              {t('serviceManagement.create.cancel')}
            </Button>
            <Button type='submit' form='new-service-form' disabled={isSaving}>
              <MaterialIcon name='save' className='text-lg' />
              {isSaving ? t('serviceManagement.feedback.saving') : t('serviceManagement.create.save')}
            </Button>
          </div>
        </header>

        <div className='min-h-0 flex-1 overflow-y-auto px-5 py-6'>
          <div className='grid grid-cols-1 gap-6 lg:grid-cols-[1fr_20rem]'>
            <form
              id='new-service-form'
              className='grid grid-cols-1 gap-5 rounded-xl border border-border bg-muted/40 p-5 md:grid-cols-2'
              onSubmit={handleSubmit}
            >
              <label className='space-y-2 md:col-span-2'>
                <span className='text-sm font-semibold text-card-foreground'>
                  {t('serviceManagement.create.fields.name')}
                </span>
                <input
                  name='catalogName'
                  type='text'
                  placeholder={t('serviceManagement.create.placeholders.name')}
                  required
                  className='h-11 w-full rounded-lg border border-input bg-card px-4 text-sm text-card-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-ring'
                />
              </label>

              <SelectField
                name='catalogType'
                label={t('serviceManagement.create.fields.catalogType')}
                options={[...CATALOG_TYPES]}
              />
              <SelectField
                name='petSpecies'
                label={t('serviceManagement.create.fields.petSpecies')}
                options={[...PET_SPECIES]}
              />
              <SelectField
                name='weightRange'
                label={t('serviceManagement.create.fields.weightRange')}
                options={[...WEIGHT_RANGES]}
                optionLabels={Object.fromEntries(
                  WEIGHT_RANGES.map((wr) => [wr, t(`serviceManagement.weightRanges.${wr}`)])
                )}
              />
              <SelectField
                name='status'
                label={t('serviceManagement.create.fields.status')}
                options={[...CATALOG_STATUSES]}
              />
              <NumberField name='price' label={t('serviceManagement.create.fields.price')} defaultValue={250000} />
              <NumberField
                name='durationMinute'
                label={t('serviceManagement.create.fields.durationMinute')}
                defaultValue={60}
              />
              <NumberField
                name='bufferTime'
                label={t('serviceManagement.create.fields.bufferTime')}
                defaultValue={15}
              />

              <label className='space-y-2 md:col-span-2'>
                <span className='text-sm font-semibold text-card-foreground'>
                  {t('serviceManagement.create.fields.description')}
                </span>
                <textarea
                  name='description'
                  rows={4}
                  placeholder={t('serviceManagement.create.placeholders.description')}
                  className='w-full rounded-lg border border-input bg-card px-4 py-3 text-sm text-card-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-ring'
                />
              </label>
            </form>

            <aside className='space-y-4'>
              <section className='rounded-xl border border-border bg-card p-5 shadow-sm'>
                <div className='flex items-center gap-3'>
                  <div className='flex h-11 w-11 items-center justify-center rounded-xl bg-secondary text-secondary-foreground'>
                    <MaterialIcon name='inventory_2' className='text-2xl' />
                  </div>
                  <div>
                    <p className='text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground'>
                      {t('serviceManagement.create.dto.label')}
                    </p>
                    <h3 className='font-bold text-card-foreground'>{t('serviceManagement.create.dto.title')}</h3>
                  </div>
                </div>
                <p className='mt-4 text-sm leading-relaxed text-muted-foreground'>
                  {t('serviceManagement.create.dto.text')}
                </p>
              </section>

              <section className='rounded-xl bg-primary p-5 text-primary-foreground shadow-sm'>
                <MaterialIcon name='lightbulb' className='text-2xl' />
                <h3 className='mt-3 font-bold'>{t('serviceManagement.create.tip.title')}</h3>
                <p className='mt-2 text-sm leading-relaxed text-primary-foreground/90'>
                  {t('serviceManagement.create.tip.text')}
                </p>
              </section>
            </aside>
          </div>
        </div>
      </section>
    </div>
  )
}

function SelectField({
  label,
  name,
  options,
  optionLabels
}: {
  label: string
  name: string
  options: string[]
  optionLabels?: Record<string, string>
}) {
  return (
    <label className='space-y-2'>
      <span className='text-sm font-semibold text-card-foreground'>{label}</span>
      <select
        name={name}
        className='h-11 w-full rounded-lg border border-input bg-card px-4 text-sm text-card-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-ring'
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

function NumberField({ label, name, defaultValue }: { label: string; name: string; defaultValue: number }) {
  return (
    <label className='space-y-2'>
      <span className='text-sm font-semibold text-card-foreground'>{label}</span>
      <input
        name={name}
        type='number'
        min={0}
        defaultValue={defaultValue}
        required
        className='h-11 w-full rounded-lg border border-input bg-card px-4 text-sm font-semibold text-card-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-ring'
      />
    </label>
  )
}
