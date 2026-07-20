import { type ChangeEvent, type FormEvent, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Button, MaterialIcon } from '~/shared/ui'
import { DURATION_CONFIG_WEIGHT_RANGES, serializeDurationConfig } from '~/shared/lib/catalog-pricing'

import { CATALOG_STATUSES, CATALOG_TYPES, PET_SPECIES, type CatalogRequest } from '../../lib/catalog-management'

export interface AdminCreateServiceModalProps {
  isOpen: boolean
  isSaving?: boolean
  onClose: () => void
  onSubmit: (payload: CatalogRequest, imageFile?: File) => void | Promise<void>
}

export function AdminCreateServiceModal({ isOpen, isSaving = false, onClose, onSubmit }: AdminCreateServiceModalProps) {
  const { t } = useTranslation('admin')
  const [imageFile, setImageFile] = useState<File | undefined>()
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null)

  if (!isOpen) {
    return null
  }

  const catalogTypeLabels: Record<string, string> = {
    AT_STORE: t('serviceManagement.catalogTypes.AT_STORE'),
    AT_HOME: t('serviceManagement.catalogTypes.AT_HOME')
  }

  const petSpeciesLabels: Record<string, string> = {
    DOG: 'Chó',
    CAT: 'Mèo',
    ALL: 'Tất cả loài'
  }

  const statusLabels: Record<string, string> = {
    AVAILABLE: t('serviceManagement.catalogStatus.AVAILABLE'),
    UNAVAILABLE: t('serviceManagement.catalogStatus.UNAVAILABLE')
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)

    void onSubmit(
      {
        catalogName: String(formData.get('catalogName') ?? '').trim(),
        description: String(formData.get('description') ?? '').trim(),
        catalogType: String(formData.get('catalogType') ?? 'AT_STORE') as CatalogRequest['catalogType'],
        petSpecies: String(formData.get('petSpecies') ?? 'ALL') as CatalogRequest['petSpecies'],
        price: Number(formData.get('price') ?? 0),
        durationMinute: Number(formData.get('durationMinute') ?? 0),
        bufferTime: Number(formData.get('bufferTime') ?? 0),
        status: String(formData.get('status') ?? 'AVAILABLE') as CatalogRequest['status'],
        additionalPricePerMinute: Number(formData.get('additionalPricePerMinute') ?? 0),
        additionalDurationConfig: serializeDurationConfig({
          MEDIUM: Number(formData.get('durationExtra_MEDIUM') ?? 0),
          LARGE: Number(formData.get('durationExtra_LARGE') ?? 0),
          EXTRA_LARGE: Number(formData.get('durationExtra_EXTRA_LARGE') ?? 0),
          EXTRA_EXTRA_LARGE: Number(formData.get('durationExtra_EXTRA_EXTRA_LARGE') ?? 0)
        })
      },
      imageFile
    )
  }

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    setImageFile(file)
    setImagePreviewUrl(file ? URL.createObjectURL(file) : null)
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
              {/* Tên dịch vụ — full width */}
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

              {/* Hình thức & Loài thú cưng */}
              <SelectField
                name='catalogType'
                label={t('serviceManagement.create.fields.catalogType')}
                options={[...CATALOG_TYPES]}
                optionLabels={catalogTypeLabels}
              />
              <SelectField
                name='petSpecies'
                label={t('serviceManagement.create.fields.petSpecies')}
                options={[...PET_SPECIES]}
                optionLabels={petSpeciesLabels}
              />

              {/* Trạng thái & Giá cơ bản */}
              <SelectField
                name='status'
                label={t('serviceManagement.create.fields.status')}
                options={[...CATALOG_STATUSES]}
                optionLabels={statusLabels}
              />
              <CurrencyField name='price' label={t('serviceManagement.create.fields.price')} defaultValue={250000} />
              <CurrencyField
                name='additionalPricePerMinute'
                label={t('serviceManagement.create.fields.additionalPricePerMinute')}
                defaultValue={0}
                required={false}
              />

              {/* Thời lượng phát sinh theo cân nặng — full width */}
              <DurationConfigFields title={t('serviceManagement.durationConfig.title')} />

              {/* Thời lượng & Thời gian đệm */}
              <NumberField
                name='durationMinute'
                label={t('serviceManagement.create.fields.durationMinute')}
                defaultValue={60}
                unit='phút'
              />
              <NumberField
                name='bufferTime'
                label={t('serviceManagement.create.fields.bufferTime')}
                defaultValue={15}
                unit='phút'
              />

              {/* Mô tả — full width */}
              <label className='space-y-2 md:col-span-2'>
                <span className='text-sm font-semibold text-card-foreground'>
                  {t('serviceManagement.create.fields.image')}
                </span>
                <input
                  name='imageFile'
                  type='file'
                  accept='image/*'
                  onChange={handleImageChange}
                  className='w-full rounded-lg border border-input bg-card px-4 py-3 text-sm text-card-foreground outline-none transition file:mr-4 file:rounded-lg file:border-0 file:bg-primary file:px-3 file:py-2 file:text-sm file:font-bold file:text-primary-foreground focus:border-primary focus:ring-2 focus:ring-ring'
                />
                {imagePreviewUrl ? (
                  <img
                    src={imagePreviewUrl}
                    alt={t('serviceManagement.create.fields.imagePreview')}
                    className='h-32 w-full rounded-lg border border-border object-cover'
                  />
                ) : null}
              </label>

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
              {/* Hướng dẫn cấu hình */}
              <section className='rounded-xl border border-border bg-card p-5 shadow-sm'>
                <div className='flex items-center gap-3'>
                  <div className='flex h-11 w-11 items-center justify-center rounded-xl bg-secondary text-secondary-foreground'>
                    <MaterialIcon name='auto_stories' className='text-2xl' />
                  </div>
                  <div>
                    <p className='text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground'>
                      {t('serviceManagement.create.dto.label')}
                    </p>
                    <h3 className='font-bold text-card-foreground'>{t('serviceManagement.create.dto.title')}</h3>
                  </div>
                </div>
                <div className='mt-4 space-y-2 whitespace-pre-line text-sm leading-relaxed text-muted-foreground'>
                  {t('serviceManagement.create.dto.text')}
                </div>
              </section>

              {/* Gợi ý thu hút khách hàng */}
              <section className='rounded-xl border border-warning/30 bg-warning/5 p-5 shadow-sm'>
                <div className='flex items-center gap-2 text-warning'>
                  <MaterialIcon name='lightbulb' className='text-2xl' />
                  <h3 className='font-bold'>{t('serviceManagement.create.tip.title')}</h3>
                </div>
                <div className='mt-3 space-y-1.5 whitespace-pre-line text-sm leading-relaxed text-card-foreground/90'>
                  {t('serviceManagement.create.tip.text')}
                </div>
              </section>
            </aside>
          </div>
        </div>
      </section>
    </div>
  )
}

// ─── Sub-components ──────────────────────────────────────────────────────────

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

function DurationConfigFields({ title }: { title: string }) {
  const { t } = useTranslation('admin')

  return (
    <fieldset className='space-y-3 rounded-lg border border-border bg-card p-4 md:col-span-2'>
      <legend className='px-1 text-sm font-semibold text-card-foreground'>{title}</legend>
      <p className='text-xs leading-relaxed text-muted-foreground'>{t('serviceManagement.durationConfig.help')}</p>
      <div className='grid grid-cols-1 items-end gap-3 sm:grid-cols-2 xl:grid-cols-4'>
        {DURATION_CONFIG_WEIGHT_RANGES.map((range) => (
          <NumberField
            key={range}
            name={`durationExtra_${range}`}
            label={t(`serviceManagement.durationConfig.ranges.${range}`)}
            defaultValue={0}
            required={false}
            unit={t('serviceManagement.durationConfig.unit')}
          />
        ))}
      </div>
    </fieldset>
  )
}

function NumberField({
  label,
  name,
  defaultValue,
  required = true,
  readOnly = false,
  unit
}: {
  label: string
  name: string
  defaultValue: number
  required?: boolean
  readOnly?: boolean
  unit?: string
}) {
  return (
    <div className='flex flex-col gap-2'>
      <span className='text-sm font-semibold text-card-foreground'>{label}</span>
      <div className='grid h-11 grid-cols-[minmax(5.5rem,1fr)_auto] overflow-hidden rounded-lg border border-input bg-card transition focus-within:border-primary focus-within:ring-2 focus-within:ring-ring'>
        <input
          name={name}
          type='number'
          min={0}
          defaultValue={defaultValue}
          required={required}
          readOnly={readOnly}
          className='min-w-0 bg-transparent px-4 text-sm font-semibold text-card-foreground outline-none'
        />
        {unit && (
          <span className='flex shrink-0 items-center border-l border-input bg-muted px-3 text-xs font-semibold text-muted-foreground'>
            {unit}
          </span>
        )}
      </div>
    </div>
  )
}

/**
 * CurrencyField — input tiền tệ có format dấu phẩy (200,000)
 * Dùng controlled text input + hidden number input để form submit đúng số
 */
function CurrencyField({
  label,
  name,
  defaultValue,
  required = true
}: {
  label: string
  name: string
  defaultValue: number
  required?: boolean
}) {
  function format(n: number) {
    return n.toLocaleString('vi-VN')
  }

  const [displayValue, setDisplayValue] = useState(() => format(defaultValue))
  const [rawValue, setRawValue] = useState(defaultValue)

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const stripped = e.target.value.replace(/\D/g, '')
    const numeric = stripped === '' ? 0 : parseInt(stripped, 10)
    setRawValue(numeric)
    setDisplayValue(stripped === '' ? '' : format(numeric))
  }

  function handleBlur() {
    setDisplayValue(format(rawValue))
  }

  return (
    <div className='flex flex-col gap-2'>
      <span className='text-sm font-semibold text-card-foreground'>{label}</span>
      <div className='flex h-11 overflow-hidden rounded-lg border border-input bg-card transition focus-within:border-primary focus-within:ring-2 focus-within:ring-ring'>
        <input
          type='text'
          inputMode='numeric'
          value={displayValue}
          onChange={handleChange}
          onBlur={handleBlur}
          required={required}
          className='min-w-0 flex-1 bg-transparent px-4 text-sm font-semibold text-card-foreground outline-none'
        />
        <input type='hidden' name={name} value={rawValue} />
        <span className='flex shrink-0 items-center border-l border-input bg-muted px-3 text-xs font-semibold text-muted-foreground'>
          VNĐ
        </span>
      </div>
    </div>
  )
}
