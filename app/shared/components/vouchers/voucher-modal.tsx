import { MaterialIcon } from '~/shared/ui'
import { cn } from '~/shared/lib/cn'
import type { VoucherResponse } from '~/shared/lib/voucher'
import { useVoucherForm } from './use-voucher-form'

export interface VoucherModalProps {
  isOpen: boolean
  editingVoucher: VoucherResponse | null
  onClose: () => void
  onSuccess: (voucher: VoucherResponse) => void
}

export function VoucherModal({ isOpen, editingVoucher, onClose, onSuccess }: VoucherModalProps) {
  const { form, handleChange, handleSubmit, isSubmitting, error, fieldErrors, isEditMode, t } = useVoucherForm({
    editingVoucher,
    onClose,
    onSuccess
  })

  if (!isOpen) return null

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm'
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className='relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-card shadow-2xl'>
        <div className='sticky top-0 z-10 flex items-center justify-between rounded-t-2xl border-b border-border bg-card px-6 py-4'>
          <div className='flex items-center gap-3'>
            <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10'>
              <MaterialIcon name={isEditMode ? 'edit' : 'add_circle'} className='text-primary text-[22px]' />
            </div>
            <div>
              <h2 className='font-display text-lg font-bold text-foreground'>
                {isEditMode ? t('voucherModal.editTitle') : t('voucherModal.createTitle')}
              </h2>
            </div>
          </div>
          <button
            type='button'
            onClick={onClose}
            className='flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
          >
            <MaterialIcon name='close' className='text-[20px]' />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className='p-6'>
          {error && (
            <div className='mb-5 flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive'>
              <MaterialIcon name='error' className='shrink-0 text-[18px]' />
              <span>{error}</span>
            </div>
          )}

          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <div className='flex flex-col gap-1.5'>
              <label className='text-sm font-semibold text-foreground' htmlFor='modal-voucherCode'>
                {t('voucherModal.code')} <span className='text-destructive'>*</span>
              </label>
              <input
                id='modal-voucherCode'
                name='voucherCode'
                required
                value={form.voucherCode}
                onChange={handleChange}
                disabled={isEditMode}
                placeholder={t('voucherModal.codePlaceholder')}
                maxLength={20}
                className={cn(
                  'rounded-xl border bg-background px-4 py-2.5 text-sm font-mono font-semibold uppercase text-foreground transition focus:outline-none focus:ring-2 focus:ring-ring',
                  fieldErrors.voucherCode
                    ? 'border-destructive focus:border-destructive'
                    : 'border-border focus:border-primary',
                  isEditMode && 'cursor-not-allowed opacity-60'
                )}
              />
              {isEditMode && <p className='text-xs text-muted-foreground'>{t('voucherModal.codeDisabledHint')}</p>}
            </div>

            <div className='flex flex-col gap-1.5'>
              <label className='text-sm font-semibold text-foreground' htmlFor='modal-voucherName'>
                {t('voucherModal.name')} <span className='text-destructive'>*</span>
              </label>
              <input
                id='modal-voucherName'
                name='voucherName'
                required
                value={form.voucherName}
                onChange={handleChange}
                placeholder={t('voucherModal.namePlaceholder')}
                maxLength={100}
                className={cn(
                  'rounded-xl border bg-background px-4 py-2.5 text-sm font-semibold text-foreground transition focus:outline-none focus:ring-2 focus:ring-ring',
                  fieldErrors.voucherName
                    ? 'border-destructive focus:border-destructive'
                    : 'border-border focus:border-primary'
                )}
              />
            </div>

            <div className='flex flex-col gap-1.5'>
              <label className='text-sm font-semibold text-foreground' htmlFor='modal-discountType'>
                {t('voucherModal.discountType')}
              </label>
              <select
                id='modal-discountType'
                name='discountType'
                value={form.discountType}
                onChange={handleChange}
                className='rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground transition focus:outline-none focus:ring-2 focus:ring-ring'
              >
                <option value='FIXED_AMOUNT'>{t('voucherModal.fixedAmount')}</option>
                <option value='PERCENTAGE'>{t('voucherModal.percentage')}</option>
              </select>
            </div>

            <div className='flex flex-col gap-1.5'>
              <label className='text-sm font-semibold text-foreground' htmlFor='modal-discountValue'>
                {t('voucherModal.discountValue')} <span className='text-destructive'>*</span>
              </label>
              <input
                id='modal-discountValue'
                name='discountValue'
                type='number'
                required
                min={0}
                value={form.discountValue ?? ''}
                onChange={handleChange}
                className={cn(
                  'rounded-xl border bg-background px-4 py-2.5 text-sm font-semibold text-foreground transition focus:outline-none focus:ring-2 focus:ring-ring',
                  fieldErrors.discountValue
                    ? 'border-destructive focus:border-destructive'
                    : 'border-border focus:border-primary'
                )}
              />
            </div>

            <div className='flex flex-col gap-1.5'>
              <label className='text-sm font-semibold text-foreground' htmlFor='modal-maxDiscount'>
                {t('voucherModal.maxDiscount')}
              </label>
              <input
                id='modal-maxDiscount'
                name='maxDiscount'
                type='number'
                min={0}
                value={form.maxDiscount ?? ''}
                onChange={handleChange}
                placeholder={t('voucherModal.maxDiscountPlaceholder')}
                className={cn(
                  'rounded-xl border bg-background px-4 py-2.5 text-sm font-semibold text-foreground transition focus:outline-none focus:ring-2 focus:ring-ring',
                  fieldErrors.maxDiscount
                    ? 'border-destructive focus:border-destructive'
                    : 'border-border focus:border-primary'
                )}
              />
            </div>

            <div className='flex flex-col gap-1.5'>
              <label className='text-sm font-semibold text-foreground' htmlFor='modal-minOrderValue'>
                {t('voucherModal.minOrderValue')}
              </label>
              <input
                id='modal-minOrderValue'
                name='minOrderValue'
                type='number'
                min={0}
                value={form.minOrderValue ?? ''}
                onChange={handleChange}
                placeholder={t('voucherModal.minOrderPlaceholder')}
                className={cn(
                  'rounded-xl border bg-background px-4 py-2.5 text-sm font-semibold text-foreground transition focus:outline-none focus:ring-2 focus:ring-ring',
                  fieldErrors.minOrderValue
                    ? 'border-destructive focus:border-destructive'
                    : 'border-border focus:border-primary'
                )}
              />
            </div>

            <div className='flex flex-col gap-1.5'>
              <label className='text-sm font-semibold text-foreground' htmlFor='modal-usageLimit'>
                {t('voucherModal.usageLimit')}
              </label>
              <input
                id='modal-usageLimit'
                name='usageLimit'
                type='number'
                min={1}
                value={form.usageLimit ?? ''}
                onChange={handleChange}
                placeholder={t('voucherModal.usageLimitPlaceholder')}
                className={cn(
                  'rounded-xl border bg-background px-4 py-2.5 text-sm font-semibold text-foreground transition focus:outline-none focus:ring-2 focus:ring-ring',
                  fieldErrors.usageLimit
                    ? 'border-destructive focus:border-destructive'
                    : 'border-border focus:border-primary'
                )}
              />
            </div>

            <div className='flex flex-col gap-1.5'>
              <label className='text-sm font-semibold text-foreground' htmlFor='modal-perUserLimit'>
                {t('voucherModal.perUserLimit')}
              </label>
              <input
                id='modal-perUserLimit'
                name='perUserLimit'
                type='number'
                min={1}
                value={form.perUserLimit ?? ''}
                onChange={handleChange}
                placeholder={t('voucherModal.perUserLimitPlaceholder')}
                className={cn(
                  'rounded-xl border bg-background px-4 py-2.5 text-sm font-semibold text-foreground transition focus:outline-none focus:ring-2 focus:ring-ring',
                  fieldErrors.perUserLimit
                    ? 'border-destructive focus:border-destructive'
                    : 'border-border focus:border-primary'
                )}
              />
            </div>

            <div className='flex flex-col gap-1.5'>
              <label className='text-sm font-semibold text-foreground' htmlFor='modal-startAt'>
                {t('voucherModal.startDate')} <span className='text-destructive'>*</span>
              </label>
              <input
                id='modal-startAt'
                name='startAt'
                type='datetime-local'
                required
                value={form.startAt}
                onChange={handleChange}
                className={cn(
                  'rounded-xl border bg-background px-4 py-2.5 text-sm font-semibold text-foreground transition focus:outline-none focus:ring-2 focus:ring-ring',
                  fieldErrors.startAt
                    ? 'border-destructive focus:border-destructive'
                    : 'border-border focus:border-primary'
                )}
              />
            </div>

            <div className='flex flex-col gap-1.5'>
              <label className='text-sm font-semibold text-foreground' htmlFor='modal-expiredAt'>
                {t('voucherModal.endDate')} <span className='text-destructive'>*</span>
              </label>
              <input
                id='modal-expiredAt'
                name='expiredAt'
                type='datetime-local'
                required
                value={form.expiredAt}
                onChange={handleChange}
                className={cn(
                  'rounded-xl border bg-background px-4 py-2.5 text-sm font-semibold text-foreground transition focus:outline-none focus:ring-2 focus:ring-ring',
                  fieldErrors.expiredAt
                    ? 'border-destructive focus:border-destructive'
                    : 'border-border focus:border-primary'
                )}
              />
            </div>

            <div className='flex flex-col gap-1.5'>
              <label className='text-sm font-semibold text-foreground' htmlFor='modal-applyScope'>
                {t('voucherModal.applyScope')}
              </label>
              <select
                id='modal-applyScope'
                name='applyScope'
                value={form.applyScope}
                onChange={handleChange}
                className='rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground transition focus:outline-none focus:ring-2 focus:ring-ring'
              >
                <option value='ALL'>{t('voucherModal.scopeAll')}</option>
              </select>
            </div>

            <div className='flex flex-col gap-1.5'>
              <label className='text-sm font-semibold text-foreground' htmlFor='modal-status'>
                {t('voucherModal.status')}
              </label>
              <select
                id='modal-status'
                name='status'
                value={form.status}
                onChange={handleChange}
                className='rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground transition focus:outline-none focus:ring-2 focus:ring-ring'
              >
                <option value='ACTIVE'>{t('voucherModal.statusActive')}</option>
                <option value='INACTIVE'>{t('voucherModal.statusInactive')}</option>
              </select>
            </div>
          </div>

          <div className='mt-8 flex justify-end gap-3 border-t border-border pt-5'>
            <button
              type='button'
              onClick={onClose}
              className='h-11 rounded-xl border border-border bg-card px-5 text-sm font-bold text-foreground transition hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring'
            >
              {t('voucherModal.cancel')}
            </button>
            <button
              type='submit'
              disabled={isSubmitting}
              className='inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-bold text-primary-foreground shadow-sm transition hover:opacity-90 active:scale-95 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-ring'
            >
              {isSubmitting ? (
                <div className='h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent' />
              ) : (
                <>
                  <MaterialIcon name='save' className='text-lg' />
                  {t('voucherModal.save')}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
