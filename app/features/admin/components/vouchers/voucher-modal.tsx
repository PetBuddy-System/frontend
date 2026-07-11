import { MaterialIcon } from '~/shared/ui'
import { cn } from '~/shared/lib/cn'
import type { VoucherResponse } from '~/shared/lib/voucher'
import { useVoucherForm } from '../../hooks/use-voucher-form'

export interface VoucherModalProps {
  isOpen: boolean
  editingVoucher: VoucherResponse | null
  onClose: () => void
  onSuccess: (voucher: VoucherResponse) => void
}

export function VoucherModal({ isOpen, editingVoucher, onClose, onSuccess }: VoucherModalProps) {
  const {
    form,
    setForm,
    handleChange,
    handleSubmit,
    isSubmitting,
    error,
    fieldErrors,
    isEditMode,
    isExpired,
    displayStatus,
    isToggleActive,
    t
  } = useVoucherForm({ editingVoucher, onClose, onSuccess })

  if (!isOpen) return null

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm'
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
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
                  fieldErrors.voucherCode ? 'border-destructive focus:border-destructive' : 'border-border focus:border-primary',
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
                  'rounded-xl border bg-background px-4 py-2.5 text-sm text-foreground transition focus:outline-none focus:ring-2 focus:ring-ring',
                  fieldErrors.voucherName ? 'border-destructive focus:border-destructive' : 'border-border focus:border-primary'
                )}
              />
            </div>

            <div className='flex flex-col gap-1.5'>
              <label className='text-sm font-semibold text-foreground' htmlFor='modal-discountType'>
                {t('voucherModal.discountType')} <span className='text-destructive'>*</span>
              </label>
              <select
                id='modal-discountType'
                name='discountType'
                value={form.discountType}
                onChange={handleChange}
                className='rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring'
              >
                <option value='FIXED_AMOUNT'>{t('voucherModal.fixedAmount')}</option>
                <option value='PERCENTAGE'>{t('voucherModal.percentage')}</option>
              </select>
            </div>

            <div className='flex flex-col gap-1.5'>
              <label className='text-sm font-semibold text-foreground' htmlFor='modal-discountValue'>
                {t('voucherModal.discountValue')} <span className='text-destructive'>*</span>
              </label>
              <div className='relative'>
                <input
                  id='modal-discountValue'
                  name='discountValue'
                  type='number'
                  min={form.discountType === 'PERCENTAGE' ? 0 : 0.01}
                  max={form.discountType === 'PERCENTAGE' ? 100 : 999999999.99}
                  step={form.discountType === 'PERCENTAGE' ? 1 : 0.01}
                  required
                  value={form.discountValue ?? ''}
                  onChange={handleChange}
                  className={cn(
                    'w-full rounded-xl border bg-background px-4 py-2.5 pr-14 text-sm text-foreground transition focus:outline-none focus:ring-2 focus:ring-ring',
                    fieldErrors.discountValue ? 'border-destructive focus:border-destructive' : 'border-border focus:border-primary'
                  )}
                />
                <span className='absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground'>
                  {form.discountType === 'PERCENTAGE' ? '%' : 'VND'}
                </span>
              </div>
            </div>

            {form.discountType === 'PERCENTAGE' && (
              <div className='flex flex-col gap-1.5'>
                <label className='text-sm font-semibold text-foreground' htmlFor='modal-maxDiscount'>
                  {t('voucherModal.maxDiscount')}
                </label>
                <input
                  id='modal-maxDiscount'
                  name='maxDiscount'
                  type='number'
                  min={0}
                  max={999999999.99}
                  step={0.01}
                  value={form.maxDiscount ?? ''}
                  onChange={handleChange}
                  placeholder={t('voucherModal.emptyPlaceholder')}
                  className={cn(
                    'rounded-xl border bg-background px-4 py-2.5 text-sm text-foreground transition focus:outline-none focus:ring-2 focus:ring-ring',
                    fieldErrors.maxDiscount ? 'border-destructive focus:border-destructive' : 'border-border focus:border-primary'
                  )}
                />
              </div>
            )}

            <div className='flex flex-col gap-1.5'>
              <label className='text-sm font-semibold text-foreground' htmlFor='modal-minOrderValue'>
                {t('voucherModal.minOrderValue')}
              </label>
              <input
                id='modal-minOrderValue'
                name='minOrderValue'
                type='number'
                min={0}
                max={999999999.99}
                step={0.01}
                value={form.minOrderValue ?? ''}
                onChange={handleChange}
                placeholder={t('voucherModal.emptyOrderPlaceholder')}
                className={cn(
                  'rounded-xl border bg-background px-4 py-2.5 text-sm text-foreground transition focus:outline-none focus:ring-2 focus:ring-ring',
                  fieldErrors.minOrderValue ? 'border-destructive focus:border-destructive' : 'border-border focus:border-primary'
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
                max={999999}
                step={1}
                value={form.usageLimit ?? ''}
                onChange={handleChange}
                placeholder={t('voucherModal.emptyPlaceholder')}
                className={cn(
                  'rounded-xl border bg-background px-4 py-2.5 text-sm text-foreground transition focus:outline-none focus:ring-2 focus:ring-ring',
                  fieldErrors.usageLimit ? 'border-destructive focus:border-destructive' : 'border-border focus:border-primary'
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
                max={1000}
                step={1}
                value={form.perUserLimit ?? ''}
                onChange={handleChange}
                placeholder={t('voucherModal.emptyPlaceholder')}
                className={cn(
                  'rounded-xl border bg-background px-4 py-2.5 text-sm text-foreground transition focus:outline-none focus:ring-2 focus:ring-ring',
                  fieldErrors.perUserLimit ? 'border-destructive focus:border-destructive' : 'border-border focus:border-primary'
                )}
              />
            </div>

            <div className='flex flex-col gap-1.5'>
              <label className='text-sm font-semibold text-foreground' htmlFor='modal-startAt'>
                {t('voucherModal.startAt')} <span className='text-destructive'>*</span>
              </label>
              <input
                id='modal-startAt'
                name='startAt'
                type='datetime-local'
                required
                value={form.startAt}
                onChange={handleChange}
                className='rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring'
              />
            </div>

            <div className='flex flex-col gap-1.5'>
              <label className='text-sm font-semibold text-foreground' htmlFor='modal-expiredAt'>
                {t('voucherModal.expiredAt')} <span className='text-destructive'>*</span>
              </label>
              <input
                id='modal-expiredAt'
                name='expiredAt'
                type='datetime-local'
                required
                value={form.expiredAt}
                onChange={handleChange}
                className='rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring'
              />
            </div>

            <div className='flex flex-col gap-1.5 md:col-span-2'>
              <label className='text-sm font-semibold text-foreground'>{t('voucherModal.status')}</label>
              {isExpired ? (
                <div className='flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/8 px-4 py-3'>
                  <span className='flex h-7 w-7 items-center justify-center rounded-full bg-destructive/15'>
                    <MaterialIcon name='schedule' className='text-destructive text-[16px]' />
                  </span>
                  <div>
                    <p className='text-sm font-bold text-destructive'>{t('voucherModal.expired')}</p>
                    <p className='text-xs text-muted-foreground'>{t('voucherModal.expiredDescription')}</p>
                  </div>
                </div>
              ) : (
                <div className='flex items-center gap-4 rounded-xl border border-border bg-background px-4 py-3'>
                  <button
                    id='modal-status-toggle'
                    type='button'
                    role='switch'
                    aria-checked={isToggleActive}
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        status: prev.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE',
                      }))
                    }
                    className={cn(
                      'relative flex h-7 w-14 shrink-0 cursor-pointer rounded-full p-0.5 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                      isToggleActive ? 'bg-success' : 'bg-muted-foreground/40'
                    )}
                  >
                    <span
                      className={cn(
                        'block h-6 w-6 rounded-full bg-white shadow-md transition-transform duration-200',
                        isToggleActive ? 'translate-x-7' : 'translate-x-0'
                      )}
                    />
                  </button>
                  <div>
                    <p className={cn('text-sm font-bold', isToggleActive ? 'text-success' : 'text-muted-foreground')}>
                      {isToggleActive ? t('voucherModal.statusActive') : t('voucherModal.statusInactive')}
                    </p>
                    <p className='text-xs text-muted-foreground'>
                      {isToggleActive
                        ? t('voucherModal.activeDescription')
                        : displayStatus === 'INACTIVE' && form.startAt && new Date(form.startAt) > new Date()
                          ? t('voucherModal.upcomingDescription')
                          : t('voucherModal.inactiveDescription')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className='mt-6 flex items-center justify-end gap-3 border-t border-border pt-5'>
            <button
              type='button'
              onClick={onClose}
              disabled={isSubmitting}
              className='rounded-xl border border-border px-5 py-2.5 text-sm font-semibold text-muted-foreground transition hover:bg-muted disabled:opacity-50'
            >
              {t('voucherModal.cancel')}
            </button>
            <button
              type='submit'
              disabled={isSubmitting}
              className='flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground shadow transition hover:opacity-90 active:scale-95 disabled:opacity-60'
            >
              {isSubmitting ? (
                <div className='h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent' />
              ) : (
                <MaterialIcon name={isEditMode ? 'save' : 'add_circle'} className='text-[18px]' />
              )}
              {isSubmitting ? t('voucherModal.saving') : isEditMode ? t('voucherModal.save') : t('voucherModal.create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}