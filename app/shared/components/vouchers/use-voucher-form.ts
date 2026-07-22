import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { createVoucherApi, updateVoucherApi, toDateTimeLocal, toISOString, deriveStatus } from '~/shared/lib/voucher'
import type { VoucherResponse, VoucherRequest } from '~/shared/lib/voucher'

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
  status: 'ACTIVE'
}

function validateForm(form: VoucherRequest, t: (key: string) => string): Record<string, string> {
  const errors: Record<string, string> = {}

  if (form.voucherCode.length > 20) {
    errors.voucherCode = t('voucherModal.codeRequired')
  }

  if (form.voucherName.length > 100) {
    errors.voucherName = t('voucherModal.nameRequired')
  }

  const val = form.discountValue
  if (form.discountType === 'PERCENTAGE') {
    if (val === null || val < 0 || val > 100) {
      errors.discountValue = t('voucherModal.discountPercentRange')
    }
  } else {
    if (val === null || val < 0.01 || val > 999999999.99) {
      errors.discountValue = t('voucherModal.discountAmountRange')
    }
  }

  if (form.maxDiscount !== null && form.maxDiscount !== undefined) {
    if (form.maxDiscount < 0 || form.maxDiscount > 999999999.99) {
      errors.maxDiscount = t('voucherModal.maxDiscountRange')
    }
  }

  if (form.minOrderValue !== null && form.minOrderValue !== undefined) {
    if (form.minOrderValue < 0 || form.minOrderValue > 999999999.99) {
      errors.minOrderValue = t('voucherModal.minOrderValueRange')
    }
  }

  if (form.usageLimit !== null && form.usageLimit !== undefined) {
    if (form.usageLimit < 1 || form.usageLimit > 999999) {
      errors.usageLimit = t('voucherModal.usageLimitRange')
    }
  }

  if (form.perUserLimit !== null && form.perUserLimit !== undefined) {
    if (form.perUserLimit < 1 || form.perUserLimit > 1000) {
      errors.perUserLimit = t('voucherModal.perUserLimitRange')
    }
  }

  if (
    form.usageLimit !== null &&
    form.usageLimit !== undefined &&
    form.perUserLimit !== null &&
    form.perUserLimit !== undefined &&
    form.usageLimit < form.perUserLimit
  ) {
    errors.usageLimit = t('voucherModal.usageLimitRelation')
    errors.perUserLimit = t('voucherModal.perUserLimitRelation')
  }

  return errors
}

interface UseVoucherFormProps {
  editingVoucher: VoucherResponse | null
  onClose: () => void
  onSuccess: (voucher: VoucherResponse) => void
}

export function useVoucherForm({ editingVoucher, onClose, onSuccess }: UseVoucherFormProps) {
  const { t } = useTranslation('admin')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const isEditMode = editingVoucher !== null

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
      status: editingVoucher.status
    }
  }, [editingVoucher])

  const [form, setForm] = useState(initialForm)

  const derivedStatusVal = deriveStatus(form.startAt, form.expiredAt, form.status)
  const isExpired = derivedStatusVal === 'EXPIRED'
  const displayStatus = isExpired ? 'EXPIRED' : form.status
  const isToggleActive = displayStatus === 'ACTIVE'

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target

    setForm((prev: VoucherRequest) => {
      const updated = {
        ...prev,
        [name]: ['discountValue', 'maxDiscount', 'minOrderValue', 'usageLimit', 'perUserLimit'].includes(name)
          ? value === ''
            ? null
            : Number(value)
          : value
      }
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

    const validationErrors = validateForm(form, t)
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors)
      setError(Object.values(validationErrors).join(' '))
      return
    }

    setFieldErrors({})
    setIsSubmitting(true)
    try {
      const payload: VoucherRequest = {
        ...form,
        startAt: toISOString(form.startAt),
        expiredAt: toISOString(form.expiredAt)
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
      setError(err instanceof Error ? err.message : t('voucherModal.unexpectedError'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
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
  }
}
