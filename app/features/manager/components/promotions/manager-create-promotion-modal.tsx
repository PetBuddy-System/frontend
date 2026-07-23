import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { MaterialIcon } from '~/shared/ui'
import { cn } from '~/shared/lib/cn'
import { promotionApi, type CreatePromotionDTO } from '../../services/promotion/promotion-api'

interface ManagerCreatePromotionModalProps {
  onClose: () => void
  onSuccess: () => void
}

export function ManagerCreatePromotionModal({ onClose, onSuccess }: ManagerCreatePromotionModalProps) {
  const { t } = useTranslation('manager')

  const [form, setForm] = useState<CreatePromotionDTO>({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    status: 'DRAFT',
    promotionDetails: []
  })

  // ✅ State cho lỗi từng field
  const [errors, setErrors] = useState<{
    name?: string
    description?: string
    startDate?: string
    endDate?: string
  }>({})

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [generalError, setGeneralError] = useState<string | null>(null)

  // ── Validation functions ──────────────────────────────────────────────────

  const validateField = (field: keyof typeof errors): string | undefined => {
    switch (field) {
      case 'name':
        if (!form.name.trim()) return t('promotions.errors.nameRequired')
        return undefined
      case 'description':
        if (!form.description.trim()) return t('promotions.errors.descriptionRequired')
        return undefined
      case 'startDate':
        if (!form.startDate) return t('promotions.errors.startDateRequired')
        return undefined
      case 'endDate':
        if (!form.endDate) return t('promotions.errors.endDateRequired')
        return undefined
      default:
        return undefined
    }
  }

  const validateAll = (): boolean => {
    const newErrors: typeof errors = {}
    let hasError = false

    const fields: (keyof typeof errors)[] = ['name', 'description', 'startDate', 'endDate']
    for (const field of fields) {
      const error = validateField(field)
      if (error) {
        newErrors[field] = error
        hasError = true
      }
    }

    // ✅ Kiểm tra ngày kết thúc phải sau ngày bắt đầu
    if (form.startDate && form.endDate) {
      const start = new Date(form.startDate)
      const end = new Date(form.endDate)
      if (end < start) {
        newErrors.endDate = t('promotions.errors.endDateInvalid')
        hasError = true
      }
    }

    setErrors(newErrors)
    return !hasError
  }

  // ── Form handlers ──────────────────────────────────────────────────────────

  const handleFieldChange = <K extends keyof CreatePromotionDTO>(
    field: K,
    value: CreatePromotionDTO[K]
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    // ✅ Xóa lỗi của field đó khi người dùng thay đổi
    setErrors((prev) => ({ ...prev, [field]: undefined }))
    setGeneralError(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    // ✅ Validate tất cả trước khi submit
    if (!validateAll()) {
      return
    }

    setIsSubmitting(true)
    setGeneralError(null)

    try {
      await promotionApi.createPromotion({
        name: form.name.trim(),
        description: form.description.trim(),
        startDate: form.startDate ? `${form.startDate}T00:00:00` : '',
        endDate: form.endDate ? `${form.endDate}T23:59:59` : '',
        status: form.status,
        promotionDetails: []
      })
      onSuccess()
    } catch (err: unknown) {
      setGeneralError(err instanceof Error ? err.message : t('promotions.errors.createFailed'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto'>
      {/* Backdrop */}
      <button
        type='button'
        aria-label={t('promotions.createModal.close')}
        className='absolute inset-0 bg-foreground/45 backdrop-blur-sm transition-opacity'
        onClick={onClose}
      />

      <section className='relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl transition-all'>
        {/* Header */}
        <header className='flex items-center justify-between border-b border-border bg-muted/50 px-6 py-4'>
          <div>
            <h2 className='font-display text-lg font-bold text-card-foreground'>
              {t('promotions.createModal.title')}
            </h2>
            <p className='text-xs text-muted-foreground mt-0.5'>
              {t('promotions.createModal.subtitle')}
            </p>
          </div>
          <button
            type='button'
            onClick={onClose}
            className='flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-primary transition-colors'
          >
            <MaterialIcon name='close' className='text-xl' />
          </button>
        </header>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className='flex flex-col min-h-0 flex-1'>
          <div className='min-h-0 flex-1 overflow-y-auto p-6 space-y-4'>
            {/* ✅ Chỉ hiển thị lỗi chung (từ BE) */}
            {generalError && (
              <div className='flex items-center gap-2 rounded-xl bg-destructive/10 p-4 text-sm font-semibold text-destructive'>
                <MaterialIcon name='error' className='shrink-0 text-xl' />
                <span>{generalError}</span>
              </div>
            )}

            {/* Name */}
            <div className='flex flex-col gap-1.5'>
              <label htmlFor='promo-name' className='text-xs font-bold uppercase tracking-wider text-muted-foreground'>
                {t('promotions.createModal.name')} <span className='text-destructive'>*</span>
              </label>
              <input
                id='promo-name'
                type='text'
                required
                placeholder={t('promotions.createModal.namePlaceholder')}
                value={form.name}
                onChange={(e) => handleFieldChange('name', e.target.value)}
                className={cn(
                  'h-11 w-full rounded-xl border border-input bg-card px-4 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring transition-colors',
                  errors.name && 'border-destructive focus:border-destructive focus:ring-destructive/20'
                )}
              />
              {errors.name && (
                <p className='text-xs text-destructive flex items-center gap-1'>
                  <MaterialIcon name='error' className='text-sm' />
                  {errors.name}
                </p>
              )}
            </div>

            {/* Dates */}
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
              <div className='flex flex-col gap-1.5'>
                <label
                  htmlFor='promo-start-date'
                  className='text-xs font-bold uppercase tracking-wider text-muted-foreground'
                >
                  {t('promotions.createModal.startDate')} <span className='text-destructive'>*</span>
                </label>
                <input
                  id='promo-start-date'
                  type='date'
                  required
                  value={form.startDate}
                  onChange={(e) => handleFieldChange('startDate', e.target.value)}
                  className={cn(
                    'h-11 w-full rounded-xl border border-input bg-card px-4 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring transition-colors cursor-pointer',
                    errors.startDate && 'border-destructive focus:border-destructive focus:ring-destructive/20'
                  )}
                />
                {errors.startDate && (
                  <p className='text-xs text-destructive flex items-center gap-1'>
                    <MaterialIcon name='error' className='text-sm' />
                    {errors.startDate}
                  </p>
                )}
              </div>

              <div className='flex flex-col gap-1.5'>
                <label
                  htmlFor='promo-end-date'
                  className='text-xs font-bold uppercase tracking-wider text-muted-foreground'
                >
                  {t('promotions.createModal.endDate')} <span className='text-destructive'>*</span>
                </label>
                <input
                  id='promo-end-date'
                  type='date'
                  required
                  value={form.endDate}
                  onChange={(e) => handleFieldChange('endDate', e.target.value)}
                  className={cn(
                    'h-11 w-full rounded-xl border border-input bg-card px-4 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring transition-colors cursor-pointer',
                    errors.endDate && 'border-destructive focus:border-destructive focus:ring-destructive/20'
                  )}
                />
                {errors.endDate && (
                  <p className='text-xs text-destructive flex items-center gap-1'>
                    <MaterialIcon name='error' className='text-sm' />
                    {errors.endDate}
                  </p>
                )}
              </div>
            </div>

            {/* Status */}
            <div className='flex flex-col gap-1.5'>
              <label
                htmlFor='promo-status'
                className='text-xs font-bold uppercase tracking-wider text-muted-foreground'
              >
                {t('promotions.createModal.status')} <span className='text-destructive'>*</span>
              </label>
              <div className='relative'>
                <select
                  id='promo-status'
                  value={form.status}
                  onChange={(e) => handleFieldChange('status', e.target.value as 'DRAFT' | 'ACTIVE')}
                  className='h-11 w-full appearance-none rounded-xl border border-input bg-card pl-4 pr-10 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring transition-colors cursor-pointer'
                >
                  <option value='DRAFT'>{t('promotions.status.draft')}</option>
                  <option value='ACTIVE'>{t('promotions.status.active')}</option>
                </select>
                <MaterialIcon
                  name='expand_more'
                  className='pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground'
                />
              </div>
            </div>

            {/* Description */}
            <div className='flex flex-col gap-1.5'>
              <label
                htmlFor='promo-description'
                className='text-xs font-bold uppercase tracking-wider text-muted-foreground'
              >
                {t('promotions.createModal.description')} <span className='text-destructive'>*</span>
              </label>
              <textarea
                id='promo-description'
                rows={3}
                required
                placeholder={t('promotions.createModal.descriptionPlaceholder')}
                value={form.description}
                onChange={(e) => handleFieldChange('description', e.target.value)}
                className={cn(
                  'w-full rounded-xl border border-input bg-card p-4 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring transition-colors resize-none',
                  errors.description && 'border-destructive focus:border-destructive focus:ring-destructive/20'
                )}
              />
              {errors.description && (
                <p className='text-xs text-destructive flex items-center gap-1'>
                  <MaterialIcon name='error' className='text-sm' />
                  {errors.description}
                </p>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <footer className='flex items-center justify-end gap-3 border-t border-border bg-muted/30 px-6 py-4'>
            <button
              type='button'
              onClick={onClose}
              disabled={isSubmitting}
              className='h-11 rounded-xl border border-border bg-card px-5 text-sm font-bold text-foreground hover:bg-muted transition-colors disabled:opacity-50'
            >
              {t('promotions.createModal.cancel')}
            </button>
            <button
              type='submit'
              disabled={isSubmitting}
              className='h-11 inline-flex items-center justify-center gap-2 rounded-xl bg-secondary px-6 text-sm font-bold text-secondary-foreground shadow-sm transition-opacity hover:opacity-90 disabled:opacity-50'
            >
              {isSubmitting && (
                <div className='h-4 w-4 animate-spin rounded-full border-2 border-secondary-foreground border-t-transparent' />
              )}
              <span>{t('promotions.createModal.save')}</span>
            </button>
          </footer>
        </form>
      </section>
    </div>
  )
}