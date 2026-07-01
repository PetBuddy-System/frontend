import { useState, useMemo } from 'react'
import { MaterialIcon } from '~/shared/ui'
import { cn } from '~/shared/lib/cn'
import { createVoucherApi, updateVoucherApi } from '../../services/voucher'
import type { VoucherResponse, VoucherRequest } from '~/shared/lib/voucher'

export interface VoucherModalProps {
  isOpen: boolean
  editingVoucher: VoucherResponse | null
  onClose: () => void
  onSuccess: (voucher: VoucherResponse) => void
}

function toDateTimeLocal(isoString: string) {
  if (!isoString) return ''
  try {
    // Backend returns ISO without Z (e.g. "2026-06-24T13:15:00")
    // JavaScript parses this as local time, but it's actually UTC.
    // Append "Z" to ensure correct UTC parsing, then convert to local.
    const date = new Date(isoString.endsWith('Z') ? isoString : isoString + 'Z')
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day}T${hours}:${minutes}`
  } catch {
    return ''
  }
}

function toISOString(datetimeLocal: string) {
  if (!datetimeLocal) return ''
  return new Date(datetimeLocal).toISOString()
}

const INITIAL_FORM: VoucherRequest = {
  voucherCode: '',
  voucherName: '',
  discountType: 'FIXED_AMOUNT',
  discountValue: 0,
  maxDiscount: null,
  minOrderValue: null,
  applyScope: 'ALL',
  usageLimit: null,
  perUserLimit: null,
  startAt: '',
  expiredAt: '',
  status: 'ACTIVE',
}

/** Derive status from date range vs current time */
function deriveStatus(
  startAt: string,
  expiredAt: string,
  currentStatus: string
): 'ACTIVE' | 'INACTIVE' | 'EXPIRED' {
  if (!startAt || !expiredAt) return currentStatus as 'ACTIVE' | 'INACTIVE' | 'EXPIRED'
  const now = Date.now()
  const start = new Date(startAt).getTime()
  const end = new Date(expiredAt).getTime()
  if (now > end) return 'EXPIRED'
  if (now < start) return 'INACTIVE'
  return 'ACTIVE'
}

export function VoucherModal({ isOpen, editingVoucher, onClose, onSuccess }: VoucherModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const isEditMode = editingVoucher !== null

  // Derive initial form from editingVoucher (React 19 pattern: compute from props)
  const initialForm = useMemo(() => {
    if (!editingVoucher) return INITIAL_FORM
    return {
      voucherCode: editingVoucher.voucherCode,
      voucherName: editingVoucher.voucherName,
      discountType: editingVoucher.discountType,
      discountValue: editingVoucher.discountValue,
      maxDiscount: editingVoucher.maxDiscount,
      minOrderValue: editingVoucher.minOrderValue,
      applyScope: editingVoucher.applyScope ?? 'ALL',
      usageLimit: editingVoucher.usageLimit,
      perUserLimit: editingVoucher.perUserLimit,
      startAt: toDateTimeLocal(editingVoucher.startAt),
      expiredAt: toDateTimeLocal(editingVoucher.expiredAt),
      status: editingVoucher.status,
    }
  }, [editingVoucher])

  // Initialize form with derived value, sync when editingVoucher changes
  const [form, setForm] = useState(initialForm)

  // Recompute derived status whenever dates change
  const derivedStatus = deriveStatus(form.startAt, form.expiredAt, form.status)
  const isExpired = derivedStatus === 'EXPIRED'
  // When derived is EXPIRED we lock status to EXPIRED; otherwise use form.status (ACTIVE/INACTIVE)
  const displayStatus = isExpired ? 'EXPIRED' : form.status
  const isToggleActive = displayStatus === 'ACTIVE'

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target
    setForm((prev: VoucherRequest) => {
      const updated = {
        ...prev,
        [name]:
          ['discountValue', 'maxDiscount', 'minOrderValue', 'usageLimit', 'perUserLimit'].includes(
            name
          )
            ? value === ''
              ? null
              : Number(value)
            : value,
      }
      // Auto-sync status when dates change
      if (name === 'startAt' || name === 'expiredAt') {
        const newStart = name === 'startAt' ? value : prev.startAt
        const newEnd = name === 'expiredAt' ? value : prev.expiredAt
        if (newStart && newEnd) {
          const derived = deriveStatus(newStart, newEnd, prev.status)
          if (derived === 'EXPIRED') {
            updated.status = 'EXPIRED'
          } else if (derived === 'INACTIVE' && prev.status !== 'INACTIVE') {
            updated.status = 'INACTIVE'
          } else if (derived === 'ACTIVE' && prev.status === 'EXPIRED') {
            updated.status = 'ACTIVE'
          }
        }
      }
      return updated
    })
  }



  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const payload: VoucherRequest = {
        ...form,
        startAt: toISOString(form.startAt),
        expiredAt: toISOString(form.expiredAt),
      }

      let result: VoucherResponse
      if (isEditMode && editingVoucher) {
        const res = await updateVoucherApi(editingVoucher.voucherId, payload)
        result = res.data
      } else {
        const res = await createVoucherApi(payload)
        result = res.data
      }
      onSuccess(result)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra. Vui lòng thử lại.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm'
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className='relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-card shadow-2xl'>
        {/* Header */}
        <div className='sticky top-0 z-10 flex items-center justify-between rounded-t-2xl border-b border-border bg-card px-6 py-4'>
          <div className='flex items-center gap-3'>
            <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10'>
              <MaterialIcon
                name={isEditMode ? 'edit' : 'add_circle'}
                className='text-primary text-[22px]'
              />
            </div>
            <div>
              <h2 className='font-display text-lg font-bold text-foreground'>
                {isEditMode ? 'Chỉnh sửa Voucher' : 'Tạo Voucher mới'}
              </h2>
              <p className='text-xs text-muted-foreground'>
                {isEditMode ? `Đang sửa: ${editingVoucher?.voucherCode}` : 'Điền thông tin để tạo mã giảm giá mới'}
              </p>
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

        {/* Form */}
        <form onSubmit={handleSubmit} className='p-6'>
          {error && (
            <div className='mb-5 flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive'>
              <MaterialIcon name='error' className='shrink-0 text-[18px]' />
              {error}
            </div>
          )}

          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            {/* Voucher Code */}
            <div className='flex flex-col gap-1.5'>
              <label className='text-sm font-semibold text-foreground' htmlFor='modal-voucherCode'>
                Mã Voucher <span className='text-destructive'>*</span>
              </label>
              <input
                id='modal-voucherCode'
                name='voucherCode'
                required
                value={form.voucherCode}
                onChange={handleChange}
                disabled={isEditMode}
                placeholder='VD: SUMMER2025'
                className={cn(
                  'rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-mono font-semibold uppercase text-foreground transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring',
                  isEditMode && 'cursor-not-allowed opacity-60'
                )}
              />
              {isEditMode && (
                <p className='text-xs text-muted-foreground'>Không thể thay đổi mã voucher.</p>
              )}
            </div>

            {/* Voucher Name */}
            <div className='flex flex-col gap-1.5'>
              <label className='text-sm font-semibold text-foreground' htmlFor='modal-voucherName'>
                Tên Voucher <span className='text-destructive'>*</span>
              </label>
              <input
                id='modal-voucherName'
                name='voucherName'
                required
                value={form.voucherName}
                onChange={handleChange}
                placeholder='VD: Giảm 50k đơn hàng từ 500k'
                className='rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring'
              />
            </div>

            {/* Discount Type */}
            <div className='flex flex-col gap-1.5'>
              <label className='text-sm font-semibold text-foreground' htmlFor='modal-discountType'>
                Loại giảm giá <span className='text-destructive'>*</span>
              </label>
              <select
                id='modal-discountType'
                name='discountType'
                value={form.discountType}
                onChange={handleChange}
                className='rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring'
              >
                <option value='FIXED_AMOUNT'>Số tiền cố định (VND)</option>
                <option value='PERCENTAGE'>Phần trăm (%)</option>
              </select>
            </div>

            {/* Discount Value */}
            <div className='flex flex-col gap-1.5'>
              <label className='text-sm font-semibold text-foreground' htmlFor='modal-discountValue'>
                Giá trị giảm <span className='text-destructive'>*</span>
              </label>
              <div className='relative'>
                <input
                  id='modal-discountValue'
                  name='discountValue'
                  type='number'
                  min={0}
                  required
                  value={form.discountValue}
                  onChange={handleChange}
                  className='w-full rounded-xl border border-border bg-background px-4 py-2.5 pr-14 text-sm text-foreground transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring'
                />
                <span className='absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground'>
                  {form.discountType === 'PERCENTAGE' ? '%' : 'VND'}
                </span>
              </div>
            </div>

            {/* Max Discount (only for PERCENTAGE) */}
            {form.discountType === 'PERCENTAGE' && (
              <div className='flex flex-col gap-1.5'>
                <label className='text-sm font-semibold text-foreground' htmlFor='modal-maxDiscount'>
                  Giảm tối đa (VND)
                </label>
                <input
                  id='modal-maxDiscount'
                  name='maxDiscount'
                  type='number'
                  min={0}
                  value={form.maxDiscount ?? ''}
                  onChange={handleChange}
                  placeholder='Để trống = không giới hạn'
                  className='rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring'
                />
              </div>
            )}

            {/* Min Order Value */}
            <div className='flex flex-col gap-1.5'>
              <label className='text-sm font-semibold text-foreground' htmlFor='modal-minOrderValue'>
                Đơn hàng tối thiểu (VND)
              </label>
              <input
                id='modal-minOrderValue'
                name='minOrderValue'
                type='number'
                min={0}
                value={form.minOrderValue ?? ''}
                onChange={handleChange}
                placeholder='Để trống = không yêu cầu'
                className='rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring'
              />
            </div>

            {/* Usage Limit */}
            <div className='flex flex-col gap-1.5'>
              <label className='text-sm font-semibold text-foreground' htmlFor='modal-usageLimit'>
                Tổng lượt sử dụng
              </label>
              <input
                id='modal-usageLimit'
                name='usageLimit'
                type='number'
                min={0}
                value={form.usageLimit ?? ''}
                onChange={handleChange}
                placeholder='Để trống = vô hạn'
                className='rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring'
              />
            </div>

            {/* Per User Limit */}
            <div className='flex flex-col gap-1.5'>
              <label className='text-sm font-semibold text-foreground' htmlFor='modal-perUserLimit'>
                Lượt sử dụng / người
              </label>
              <input
                id='modal-perUserLimit'
                name='perUserLimit'
                type='number'
                min={0}
                value={form.perUserLimit ?? ''}
                onChange={handleChange}
                placeholder='Để trống = vô hạn'
                className='rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring'
              />
            </div>

            {/* Start Date */}
            <div className='flex flex-col gap-1.5'>
              <label className='text-sm font-semibold text-foreground' htmlFor='modal-startAt'>
                Ngày bắt đầu <span className='text-destructive'>*</span>
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

            {/* Expiry Date */}
            <div className='flex flex-col gap-1.5'>
              <label className='text-sm font-semibold text-foreground' htmlFor='modal-expiredAt'>
                Ngày hết hạn <span className='text-destructive'>*</span>
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

            {/* Status — smart toggle / expired badge */}
            <div className='flex flex-col gap-1.5 md:col-span-2'>
              <label className='text-sm font-semibold text-foreground'>Trạng thái</label>

              {isExpired ? (
                /* Expired: show read-only badge only, no toggle */
                <div className='flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/8 px-4 py-3'>
                  <span className='flex h-7 w-7 items-center justify-center rounded-full bg-destructive/15'>
                    <MaterialIcon name='schedule' className='text-destructive text-[16px]' />
                  </span>
                  <div>
                    <p className='text-sm font-bold text-destructive'>Hết hạn</p>
                    <p className='text-xs text-muted-foreground'>Voucher đã quá ngày hết hạn và không thể kích hoạt lại.</p>
                  </div>
                </div>
              ) : (
                /* Not expired: show toggle button */
                <div className='flex items-center gap-4 rounded-xl border border-border bg-background px-4 py-3'>
                  <button
                    id='modal-status-toggle'
                    type='button'
                    role='switch'
                    aria-checked={isToggleActive}
                    onClick={() =>
                      setForm((prev: VoucherRequest) => ({
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
                    <p
                      className={cn(
                        'text-sm font-bold',
                        isToggleActive ? 'text-success' : 'text-muted-foreground'
                      )}
                    >
                      {isToggleActive ? 'Hoạt động' : 'Tạm dừng'}
                    </p>
                    <p className='text-xs text-muted-foreground'>
                      {isToggleActive
                        ? 'Voucher đang được kích hoạt cho khách hàng sử dụng.'
                        : displayStatus === 'INACTIVE' && form.startAt && new Date(form.startAt) > new Date()
                          ? 'Ngày bắt đầu chưa tới — voucher sẽ tự động kích hoạt đúng hẹn.'
                          : 'Voucher đang tạm dừng, khách hàng không thể sử dụng.'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className='mt-6 flex items-center justify-end gap-3 border-t border-border pt-5'>
            <button
              type='button'
              onClick={onClose}
              disabled={isSubmitting}
              className='rounded-xl border border-border px-5 py-2.5 text-sm font-semibold text-muted-foreground transition hover:bg-muted disabled:opacity-50'
            >
              Hủy
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
              {isSubmitting ? 'Đang lưu...' : isEditMode ? 'Lưu thay đổi' : 'Tạo Voucher'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
