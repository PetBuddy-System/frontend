import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { MaterialIcon } from '~/shared/ui'
import { promotionApi, type CreatePromotionDTO } from '../../services/promotion/promotion-api'

interface ManagerCreatePromotionModalProps {
  onClose: () => void
  onSuccess: () => void
}

export function ManagerCreatePromotionModal({
  onClose,
  onSuccess
}: ManagerCreatePromotionModalProps) {
  const { t } = useTranslation('manager')

  const [form, setForm] = useState<CreatePromotionDTO>({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    status: 'DRAFT',
    promotionDetails: []
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!form.name.trim()) {
      setError('Tên khuyến mãi không được để trống')
      return
    }
    if (!form.description.trim()) {
      setError('Mô tả không được để trống')
      return
    }
    if (!form.startDate) {
      setError('Vui lòng chọn ngày bắt đầu')
      return
    }
    if (!form.endDate) {
      setError('Vui lòng chọn ngày kết thúc')
      return
    }

    const start = new Date(form.startDate)
    const end = new Date(form.endDate)
    if (end < start) {
      setError('Ngày kết thúc phải diễn ra sau ngày bắt đầu')
      return
    }

    setIsSubmitting(true)
    setError(null)

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
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi tạo khuyến mãi')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto'>
      {/* Backdrop */}
      <button
        type='button'
        aria-label='Close'
        className='absolute inset-0 bg-foreground/45 backdrop-blur-sm transition-opacity'
        onClick={onClose}
      />

      <section className='relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl transition-all'>
        {/* Header */}
        <header className='flex items-center justify-between border-b border-border bg-muted/50 px-6 py-4'>
          <div>
            <h2 className='font-display text-lg font-bold text-card-foreground'>
              {t('promotions.editModal.createTitle', 'Thêm khuyến mãi mới')}
            </h2>
            <p className='text-xs text-muted-foreground mt-0.5'>
              Vui lòng điền đầy đủ các thông tin của chương trình khuyến mãi
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
            {error && (
              <div className='flex items-center gap-2 rounded-xl bg-destructive/10 p-4 text-sm font-semibold text-destructive'>
                <MaterialIcon name='error' className='shrink-0 text-xl' />
                <span>{error}</span>
              </div>
            )}

            {/* Name */}
            <div className='flex flex-col gap-1.5'>
              <label htmlFor='promo-name' className='text-xs font-bold uppercase tracking-wider text-muted-foreground'>
                {t('promotions.editModal.name', 'Tên khuyến mãi')} <span className='text-destructive'>*</span>
              </label>
              <input
                id='promo-name'
                type='text'
                required
                placeholder='Ví dụ: Summer Sale, Black Friday...'
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                className='h-11 w-full rounded-xl border border-input bg-card px-4 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring transition-colors'
              />
            </div>

            {/* Dates */}
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
              <div className='flex flex-col gap-1.5'>
                <label htmlFor='promo-start-date' className='text-xs font-bold uppercase tracking-wider text-muted-foreground'>
                  {t('promotions.editModal.startDate', 'Ngày bắt đầu')} <span className='text-destructive'>*</span>
                </label>
                <input
                  id='promo-start-date'
                  type='date'
                  required
                  value={form.startDate}
                  onChange={(e) => setForm((prev) => ({ ...prev, startDate: e.target.value }))}
                  className='h-11 w-full rounded-xl border border-input bg-card px-4 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring transition-colors cursor-pointer'
                />
              </div>

              <div className='flex flex-col gap-1.5'>
                <label htmlFor='promo-end-date' className='text-xs font-bold uppercase tracking-wider text-muted-foreground'>
                  {t('promotions.editModal.endDate', 'Ngày kết thúc')} <span className='text-destructive'>*</span>
                </label>
                <input
                  id='promo-end-date'
                  type='date'
                  required
                  value={form.endDate}
                  onChange={(e) => setForm((prev) => ({ ...prev, endDate: e.target.value }))}
                  className='h-11 w-full rounded-xl border border-input bg-card px-4 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring transition-colors cursor-pointer'
                />
              </div>
            </div>

            {/* Status */}
            <div className='flex flex-col gap-1.5'>
              <label htmlFor='promo-status' className='text-xs font-bold uppercase tracking-wider text-muted-foreground'>
                {t('promotions.editModal.status', 'Trạng thái')} <span className='text-destructive'>*</span>
              </label>
              <div className='relative'>
                <select
                  id='promo-status'
                  value={form.status}
                  onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value as 'DRAFT' | 'ACTIVE' }))}
                  className='h-11 w-full appearance-none rounded-xl border border-input bg-card pl-4 pr-10 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring transition-colors cursor-pointer'
                >
                  <option value='DRAFT'>Bản nháp (DRAFT)</option>
                  <option value='ACTIVE'>Hoạt động (ACTIVE)</option>
                </select>
                <MaterialIcon
                  name='expand_more'
                  className='pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground'
                />
              </div>
            </div>

            {/* Description */}
            <div className='flex flex-col gap-1.5'>
              <label htmlFor='promo-description' className='text-xs font-bold uppercase tracking-wider text-muted-foreground'>
                {t('promotions.editModal.description', 'Mô tả')} <span className='text-destructive'>*</span>
              </label>
              <textarea
                id='promo-description'
                rows={3}
                required
                placeholder='Mô tả chi tiết chương trình khuyến mãi...'
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                className='w-full rounded-xl border border-input bg-card p-4 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring transition-colors resize-none'
              />
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
              {t('promotions.editModal.cancel', 'Hủy')}
            </button>
            <button
              type='submit'
              disabled={isSubmitting}
              className='h-11 inline-flex items-center justify-center gap-2 rounded-xl bg-secondary px-6 text-sm font-bold text-secondary-foreground shadow-sm transition-opacity hover:opacity-90 disabled:opacity-50'
            >
              {isSubmitting && <div className='h-4 w-4 animate-spin rounded-full border-2 border-secondary-foreground border-t-transparent' />}
              <span>{t('promotions.editModal.save', 'Lưu thay đổi')}</span>
            </button>
          </footer>
        </form>
      </section>
    </div>
  )
}
