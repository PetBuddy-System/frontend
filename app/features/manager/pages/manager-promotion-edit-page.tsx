// app/features/manager/pages/manager-promotion-edit-page.tsx

import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useTranslation } from 'react-i18next'

import { ManagerSidebar } from '../components/layout/manager-sidebar'
import { ManagerTopNav } from '../components/layout/manager-top-nav'
import { fetchProductsManagementApi } from '../services/product/product-api'
import { promotionApi, type UpdatePromotionDTO } from '../services/promotion/promotion-api'
import type { ProductManagementItem } from '~/shared/lib/product'
import { MaterialIcon } from '~/shared/ui'
import { cn } from '~/shared/lib/cn'

// ⭐ Constants
const DEFAULT_DISCOUNT_VALUE = 20

// ⭐ NEAR_EXPIRED_DAY_OPTIONS
const NEAR_EXPIRED_DAY_OPTIONS = [
  { label: 'Tất cả sản phẩm', value: 'all' },
  { label: '1 tháng (30 ngày)', value: '30' },
  { label: '2 tháng (60 ngày)', value: '60' },
  { label: '3 tháng (90 ngày)', value: '90' },
  { label: '4 tháng (120 ngày)', value: '120' },
  { label: '6 tháng (180 ngày)', value: '180' }
] as const

type ProductDiscountState = {
  promotionType: 'PERCENTAGE' | 'FIXED_AMOUNT'
  discountValue: number
}

export function ManagerPromotionEditPage() {
  const { t } = useTranslation('manager')
  const navigate = useNavigate()
  const { promotionId } = useParams<{ promotionId: string }>()

  const [isLoadingPromotion, setIsLoadingPromotion] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const [form, setForm] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    status: 'DRAFT' as 'DRAFT' | 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | 'DELETED',
    reason: '',
    note: ''
  })

  // ✅ State cho lỗi từng field
  const [errors, setErrors] = useState<{
    name?: string
    description?: string
    startDate?: string
    endDate?: string
    products?: string
  }>({})

  // ⭐ State cho filter
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | undefined>(undefined)
  const [nearExpiredDays, setNearExpiredDays] = useState<string>('all')

  const [products, setProducts] = useState<ProductManagementItem[]>([])
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([])
  const [productDiscountById, setProductDiscountById] = useState<Record<string, ProductDiscountState>>({})
  const [isLoadingProducts, setIsLoadingProducts] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [generalError, setGeneralError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [keywordInput, setKeywordInput] = useState('')
  const [keyword, setKeyword] = useState('')

  const formatPrice = (value?: number) => {
    if (value === undefined || value === null || isNaN(value)) {
      return '0'
    }
    return value.toLocaleString('vi-VN')
  }

  // ⭐ Hàm kiểm tra sản phẩm đang có promotion active
  const isProductHasActivePromotion = (product: ProductManagementItem) => {
    return product.hasActivePromotion === true
  }

  // ✅ Validation functions
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

    // ✅ Kiểm tra có sản phẩm được chọn
    if (selectedProductIds.length === 0) {
      newErrors.products = t('promotions.errors.noProductSelected')
      hasError = true
    }

    setErrors(newErrors)
    return !hasError
  }

  // ✅ Form handler với validation inline
  const handleFieldChange = <K extends keyof typeof form>(
    field: K,
    value: typeof form[K]
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    // ✅ Xóa lỗi của field đó khi người dùng thay đổi
    setErrors((prev) => ({ ...prev, [field]: undefined }))
    setGeneralError(null)
  }

  // Load existing promotion data
  useEffect(() => {
    if (!promotionId) return

    async function loadPromotion() {
      setIsLoadingPromotion(true)
      setLoadError(null)

      try {
        const promo = await promotionApi.getPromotion(promotionId!)
        const formatForDateTimeLocal = (dtStr: string) => {
          if (!dtStr) return ''
          try {
            const d = new Date(dtStr)
            if (isNaN(d.getTime())) return ''
            const year = d.getFullYear()
            const month = String(d.getMonth() + 1).padStart(2, '0')
            const day = String(d.getDate()).padStart(2, '0')
            const hours = String(d.getHours()).padStart(2, '0')
            const minutes = String(d.getMinutes()).padStart(2, '0')
            return `${year}-${month}-${day}T${hours}:${minutes}`
          } catch {
            return ''
          }
        }

        setForm({
          name: promo.name,
          description: promo.description,
          startDate: formatForDateTimeLocal(promo.startDate),
          endDate: formatForDateTimeLocal(promo.endDate),
          status: promo.status,
          reason: promo.reason || '',
          note: promo.note || ''
        })

        const details = (
          promo as unknown as {
            promotionDetails?: Array<{
              productId: string
              promotionType: 'PERCENTAGE' | 'FIXED_AMOUNT'
              discountValue: number
            }>
          }
        ).promotionDetails

        if (details && details.length > 0) {
          const validProductIds = details.map((d) => d.productId).filter((id) => id)
          setSelectedProductIds(validProductIds)
          const discountMap: Record<string, ProductDiscountState> = {}
          for (const d of details) {
            discountMap[d.productId] = {
              promotionType: d.promotionType,
              discountValue: d.discountValue
            }
          }
          setProductDiscountById(discountMap)
        }
      } catch (err) {
        setLoadError(err instanceof Error ? err.message : t('promotions.errors.loadFailed'))
      } finally {
        setIsLoadingPromotion(false)
      }
    }

    void loadPromotion()
  }, [promotionId, t])

  // ⭐ Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setKeyword(keywordInput)
      setCurrentPage(0)
    }, 350)

    return () => clearTimeout(timer)
  }, [keywordInput])

  // ⭐ Load products - Thêm category filter
  useEffect(() => {
    async function loadProducts() {
      setIsLoadingProducts(true)
      setGeneralError(null)

      try {
        const params: any = {
          keyword: keyword.trim() || undefined,
          page: currentPage,
          size: 10,
          sortBy: 'date_desc',
          nearExpiredDays: nearExpiredDays === 'all' ? undefined : Number(nearExpiredDays)
        }

        if (selectedCategoryId !== undefined && !isNaN(selectedCategoryId)) {
          params.categoryId = selectedCategoryId
        }

        const response = await fetchProductsManagementApi(params)

        if (!response.success) {
          throw new Error(response.message || t('promotions.errors.loadProductsFailed'))
        }

        setProducts(response.data.content)
        setTotalPages(response.data.totalPages)
        setTotalElements(response.data.totalElements)
      } catch (err) {
        setProducts([])
        setGeneralError(err instanceof Error ? err.message : t('promotions.errors.loadProductsFailed'))
      } finally {
        setIsLoadingProducts(false)
      }
    }

    void loadProducts()
  }, [nearExpiredDays, selectedCategoryId, currentPage, keyword, t])

  const selectedProducts = useMemo(
    () => products.filter((product) => selectedProductIds.includes(product.productId)),
    [products, selectedProductIds]
  )

  const canSubmit = !isSubmitting && !isLoadingPromotion

  function toggleProduct(productId: string) {
    setSelectedProductIds((current) =>
      current.includes(productId) ? current.filter((id) => id !== productId) : [...current, productId]
    )
    setProductDiscountById((currentDiscounts) => {
      if (selectedProductIds.includes(productId)) {
        const nextDiscounts = { ...currentDiscounts }
        delete nextDiscounts[productId]
        return nextDiscounts
      }

      return {
        ...currentDiscounts,
        [productId]: currentDiscounts[productId] ?? {
          promotionType: 'PERCENTAGE',
          discountValue: DEFAULT_DISCOUNT_VALUE
        }
      }
    })
    // ✅ Xóa lỗi products khi có sản phẩm được chọn
    if (selectedProductIds.length === 0) {
      setErrors((prev) => ({ ...prev, products: undefined }))
    }
  }

  function handleSelectAllProducts() {
    const allProductIds = products.map((product) => product.productId)
    setSelectedProductIds(allProductIds)
    setProductDiscountById((current) => {
      const next = { ...current }
      for (const product of products) {
        next[product.productId] = next[product.productId] ?? {
          promotionType: 'PERCENTAGE',
          discountValue: DEFAULT_DISCOUNT_VALUE
        }
      }
      return next
    })
    setErrors((prev) => ({ ...prev, products: undefined }))
  }

  function handleClearSelection() {
    setSelectedProductIds([])
    setProductDiscountById({})
  }

  function updateProductDiscount(
    productId: string,
    field: 'promotionType' | 'discountValue',
    value: 'PERCENTAGE' | 'FIXED_AMOUNT' | number
  ) {
    setProductDiscountById((current) => ({
      ...current,
      [productId]: {
        promotionType: current[productId]?.promotionType ?? 'PERCENTAGE',
        discountValue: current[productId]?.discountValue ?? DEFAULT_DISCOUNT_VALUE,
        [field]: value
      } as ProductDiscountState
    }))
  }

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage)
    }
  }

  const handleCategoryChange = (categoryId: string) => {
    if (categoryId === 'all' || categoryId === '') {
      setSelectedCategoryId(undefined)
    } else {
      const numId = Number(categoryId)
      setSelectedCategoryId(isNaN(numId) ? undefined : numId)
    }
    setCurrentPage(0)
  }

  const handleNearExpiredChange = (value: string) => {
    setNearExpiredDays(value)
    setCurrentPage(0)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!promotionId) return

    // ✅ Validate tất cả trước khi submit
    if (!validateAll()) {
      return
    }

    setIsSubmitting(true)
    setGeneralError(null)

    try {
      const promotionDetails = selectedProductIds
        .filter((id) => id)
        .map((productId) => {
          const discount = productDiscountById[productId]
          return {
            productId: productId,
            promotionType: discount?.promotionType ?? 'PERCENTAGE',
            discountValue: discount?.discountValue ?? DEFAULT_DISCOUNT_VALUE
          }
        })

      const formatToBackendISO = (localDateTimeStr: string) => {
        if (!localDateTimeStr) return ''
        if (localDateTimeStr.length === 16) {
          return `${localDateTimeStr}:00`
        }
        return localDateTimeStr
      }

      const payload: UpdatePromotionDTO = {
        name: form.name.trim(),
        description: form.description.trim(),
        startDate: formatToBackendISO(form.startDate),
        endDate: formatToBackendISO(form.endDate),
        status: form.status,
        promotionDetails: promotionDetails,
        reason: form.reason.trim() || undefined,
        note: form.note.trim() || undefined
      }

      await promotionApi.updatePromotion(promotionId, payload)
      setSuccessMessage(t('promotions.editModal.success'))
      setTimeout(() => {
        void navigate('/manager/promotions')
      }, 700)
    } catch (err) {
      setGeneralError(err instanceof Error ? err.message : t('promotions.editModal.error'))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoadingPromotion) {
    return (
      <div className='flex h-screen overflow-hidden bg-background text-foreground'>
        <ManagerSidebar activeItem='promotions' />
        <div className='flex min-w-0 flex-1 flex-col overflow-hidden'>
          <ManagerTopNav titleKey='promotions.title' subtitleKey={t('promotions.editPage.subtitle')} />
          <main className='flex flex-1 items-center justify-center'>
            <div className='flex flex-col items-center gap-4 text-muted-foreground'>
              <div className='h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent' />
              <p className='text-sm font-semibold'>{t('promotions.editPage.loading')}</p>
            </div>
          </main>
        </div>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className='flex h-screen overflow-hidden bg-background text-foreground'>
        <ManagerSidebar activeItem='promotions' />
        <div className='flex min-w-0 flex-1 flex-col overflow-hidden'>
          <ManagerTopNav titleKey='promotions.title' subtitleKey={t('promotions.editPage.subtitle')} />
          <main className='flex flex-1 items-center justify-center p-6'>
            <div className='flex flex-col items-center gap-4 text-center'>
              <MaterialIcon name='error_outline' className='text-5xl text-destructive' />
              <p className='text-lg font-bold text-destructive'>{loadError}</p>
              <button
                type='button'
                onClick={() => void navigate('/manager/promotions')}
                className='inline-flex h-11 items-center gap-2 rounded-xl border border-border bg-card px-5 text-sm font-bold text-foreground hover:bg-muted transition-colors'
              >
                <MaterialIcon name='arrow_back' className='text-lg' />
                {t('promotions.editPage.backToList')}
              </button>
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className='flex h-screen overflow-hidden bg-background text-foreground'>
      <ManagerSidebar activeItem='promotions' />

      <div className='flex min-w-0 flex-1 flex-col overflow-hidden'>
        <ManagerTopNav titleKey='promotions.title' subtitleKey={t('promotions.editPage.subtitle')} />

        <main className='flex-1 overflow-y-auto p-4 md:p-6'>
          <div className='mx-auto flex max-w-7xl flex-col gap-6'>
            <div className='flex items-center justify-between gap-4'>
              <div>
                <h1 className='font-display text-2xl font-bold text-card-foreground md:text-3xl'>
                  {t('promotions.editModal.title')}
                </h1>
                <p className='mt-1 text-muted-foreground'>
                  {t('promotions.editPage.description')}
                </p>
              </div>

              <button
                type='button'
                onClick={() => void navigate('/manager/promotions')}
                className='inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-border bg-card px-5 text-sm font-bold text-foreground shadow-sm transition-colors hover:bg-muted'
              >
                <MaterialIcon name='arrow_back' className='text-lg' />
                {t('promotions.createPage.back')}
              </button>
            </div>

            {/* ✅ Chỉ hiển thị lỗi chung (từ BE) và success message */}
            {generalError && (
              <div className='flex items-center gap-2 rounded-xl bg-destructive/10 p-4 text-sm font-semibold text-destructive'>
                <MaterialIcon name='error' className='shrink-0 text-xl' />
                <span>{generalError}</span>
              </div>
            )}

            {successMessage && (
              <div className='flex items-center gap-2 rounded-xl bg-success/10 p-4 text-sm font-semibold text-success'>
                <MaterialIcon name='check_circle' className='shrink-0 text-xl' />
                <span>{successMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className='flex flex-col gap-6'>
              {/* Section 1: Thông tin chương trình */}
              <section className='rounded-2xl border border-border bg-card p-6 shadow-sm'>
                <div className='mb-5 flex items-center gap-3'>
                  <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10'>
                    <span className='text-sm font-bold text-primary'>1</span>
                  </div>
                  <div>
                    <h2 className='text-lg font-bold text-foreground'>{t('promotions.createPage.programInfo')}</h2>
                  </div>
                </div>
                <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
                  <label className='flex flex-col gap-1.5 sm:col-span-2 lg:col-span-2'>
                    <span className='text-xs font-bold uppercase tracking-wider text-muted-foreground'>
                      {t('promotions.editModal.name')} <span className='text-destructive'>*</span>
                    </span>
                    <input
                      value={form.name}
                      onChange={(e) => handleFieldChange('name', e.target.value)}
                      className={cn(
                        'h-11 rounded-xl border border-input bg-background px-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring transition-colors',
                        errors.name && 'border-destructive focus:border-destructive focus:ring-destructive/20'
                      )}
                      placeholder={t('promotions.createModal.namePlaceholder')}
                    />
                    {errors.name && (
                      <p className='text-xs text-destructive flex items-center gap-1'>
                        <MaterialIcon name='error' className='text-sm' />
                        {errors.name}
                      </p>
                    )}
                  </label>
                  <label className='flex flex-col gap-1.5'>
                    <span className='text-xs font-bold uppercase tracking-wider text-muted-foreground'>
                      {t('promotions.editModal.startDate')} <span className='text-destructive'>*</span>
                    </span>
                    <input
                      type='datetime-local'
                      value={form.startDate}
                      onChange={(e) => handleFieldChange('startDate', e.target.value)}
                      className={cn(
                        'h-11 rounded-xl border border-input bg-background px-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring transition-colors',
                        errors.startDate && 'border-destructive focus:border-destructive focus:ring-destructive/20'
                      )}
                    />
                    {errors.startDate && (
                      <p className='text-xs text-destructive flex items-center gap-1'>
                        <MaterialIcon name='error' className='text-sm' />
                        {errors.startDate}
                      </p>
                    )}
                  </label>
                  <label className='flex flex-col gap-1.5'>
                    <span className='text-xs font-bold uppercase tracking-wider text-muted-foreground'>
                      {t('promotions.editModal.endDate')} <span className='text-destructive'>*</span>
                    </span>
                    <input
                      type='datetime-local'
                      value={form.endDate}
                      onChange={(e) => handleFieldChange('endDate', e.target.value)}
                      className={cn(
                        'h-11 rounded-xl border border-input bg-background px-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring transition-colors',
                        errors.endDate && 'border-destructive focus:border-destructive focus:ring-destructive/20'
                      )}
                    />
                    {errors.endDate && (
                      <p className='text-xs text-destructive flex items-center gap-1'>
                        <MaterialIcon name='error' className='text-sm' />
                        {errors.endDate}
                      </p>
                    )}
                  </label>
                  <label className='flex flex-col gap-1.5 sm:col-span-2 lg:col-span-4'>
                    <span className='text-xs font-bold uppercase tracking-wider text-muted-foreground'>
                      {t('promotions.editModal.description')} <span className='text-destructive'>*</span>
                    </span>
                    <textarea
                      value={form.description}
                      onChange={(e) => handleFieldChange('description', e.target.value)}
                      rows={3}
                      className={cn(
                        'rounded-xl border border-input bg-background p-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring resize-none transition-colors',
                        errors.description && 'border-destructive focus:border-destructive focus:ring-destructive/20'
                      )}
                      placeholder={t('promotions.createModal.descriptionPlaceholder')}
                    />
                    {errors.description && (
                      <p className='text-xs text-destructive flex items-center gap-1'>
                        <MaterialIcon name='error' className='text-sm' />
                        {errors.description}
                      </p>
                    )}
                  </label>
                  <label className='flex flex-col gap-1.5 sm:col-span-2 lg:col-span-2'>
                    <span className='text-xs font-bold uppercase tracking-wider text-muted-foreground'>
                      {t('promotions.editModal.reason')}
                    </span>
                    <input
                      value={form.reason}
                      onChange={(e) => setForm((prev) => ({ ...prev, reason: e.target.value }))}
                      className='h-11 rounded-xl border border-input bg-background px-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring transition-colors'
                      placeholder={t('promotions.editModal.reasonPlaceholder')}
                    />
                  </label>
                  <label className='flex flex-col gap-1.5 sm:col-span-2 lg:col-span-2'>
                    <span className='text-xs font-bold uppercase tracking-wider text-muted-foreground'>
                      {t('promotions.editModal.note')}
                    </span>
                    <input
                      value={form.note}
                      onChange={(e) => setForm((prev) => ({ ...prev, note: e.target.value }))}
                      className='h-11 rounded-xl border border-input bg-background px-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring transition-colors'
                      placeholder={t('promotions.editModal.notePlaceholder')}
                    />
                  </label>
                  <label className='flex flex-col gap-1.5 sm:col-span-2 lg:col-span-2'>
                    <span className='text-xs font-bold uppercase tracking-wider text-muted-foreground'>
                      {t('promotions.editModal.status')}
                    </span>
                    <div className='relative'>
                      <select
                        value={form.status}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            status: e.target.value as typeof form.status
                          }))
                        }
                        className='h-11 w-full appearance-none rounded-xl border border-input bg-background pl-4 pr-10 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring cursor-pointer'
                      >
                        <option value='ACTIVE'>{t('promotions.status.active')}</option>
                        <option value='DRAFT'>{t('promotions.status.draft')}</option>
                        <option value='EXPIRED'>{t('promotions.status.expired')}</option>
                        <option value='CANCELLED'>{t('promotions.status.cancelled')}</option>
                      </select>
                      <MaterialIcon
                        name='expand_more'
                        className='pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground'
                      />
                    </div>
                  </label>
                  <label className='flex flex-col gap-1.5 sm:col-span-2 lg:col-span-2'>
                    <span className='text-xs font-bold uppercase tracking-wider text-muted-foreground'>
                      {t('promotions.createPage.nearExpired')}
                    </span>
                    <div className='relative'>
                      <select
                        value={nearExpiredDays}
                        onChange={(e) => handleNearExpiredChange(e.target.value)}
                        className='h-11 w-full appearance-none rounded-xl border border-input bg-background pl-4 pr-10 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring cursor-pointer'
                      >
                        {NEAR_EXPIRED_DAY_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <MaterialIcon
                        name='expand_more'
                        className='pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground'
                      />
                    </div>
                  </label>
                  <label className='flex flex-col gap-1.5 sm:col-span-2 lg:col-span-2'>
                    <span className='text-xs font-bold uppercase tracking-wider text-muted-foreground'>
                      {t('promotions.createPage.category')}
                    </span>
                    <div className='relative'>
                      <select
                        value={selectedCategoryId?.toString() || 'all'}
                        onChange={(e) => handleCategoryChange(e.target.value)}
                        className='h-11 w-full appearance-none rounded-xl border border-input bg-background pl-4 pr-10 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring cursor-pointer'
                      >
                        <option value='all'>{t('promotions.createPage.allCategories')}</option>
                        <option value='1'>{t('promotions.categories.dogFood')}</option>
                        <option value='2'>{t('promotions.categories.catFood')}</option>
                        <option value='3'>{t('promotions.categories.petAccessories')}</option>
                        <option value='4'>{t('promotions.categories.nutrition')}</option>
                        <option value='5'>{t('promotions.categories.toys')}</option>
                        <option value='6'>{t('promotions.categories.hygiene')}</option>
                      </select>
                      <MaterialIcon
                        name='expand_more'
                        className='pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground'
                      />
                    </div>
                  </label>
                </div>
              </section>

              {/* Section 2: Sản phẩm áp dụng */}
              <section className='rounded-2xl border border-border bg-card p-6 shadow-sm'>
                <div className='mb-5 flex items-center justify-between gap-4'>
                  <div className='flex items-center gap-3'>
                    <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10'>
                      <span className='text-sm font-bold text-primary'>2</span>
                    </div>
                    <div>
                      <h2 className='text-lg font-bold text-foreground'>
                        {t('promotions.createPage.appliedProducts')}
                      </h2>
                    </div>
                  </div>
                  <div className='flex items-center gap-4'>
                    <span className='rounded-full bg-muted px-3 py-1 text-xs font-semibold text-foreground'>
                      {t('promotions.createPage.selectedCount', {
                        selected: selectedProductIds.length,
                        total: totalElements
                      })}
                    </span>
                    <button
                      type='button'
                      onClick={handleSelectAllProducts}
                      className='text-sm font-semibold text-primary hover:underline'
                    >
                      {t('promotions.createPage.selectAll')}
                    </button>
                    {selectedProductIds.length > 0 && (
                      <button
                        type='button'
                        onClick={handleClearSelection}
                        className='text-sm font-semibold text-destructive hover:underline'
                      >
                        {t('promotions.createPage.deselectAll')}
                      </button>
                    )}
                  </div>
                </div>

                {/* ✅ Hiển thị lỗi products */}
                {errors.products && (
                  <div className='mb-4 flex items-center gap-2 rounded-xl bg-destructive/10 p-3 text-sm text-destructive'>
                    <MaterialIcon name='error' className='text-base shrink-0' />
                    <span>{errors.products}</span>
                  </div>
                )}

                {/* Thanh tìm kiếm */}
                <div className='mb-4 flex items-center gap-4'>
                  <div className='relative flex-1'>
                    <MaterialIcon
                      name='search'
                      className='absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-lg'
                    />
                    <input
                      type='text'
                      placeholder={t('promotions.createPage.searchPlaceholder')}
                      value={keywordInput}
                      onChange={(e) => setKeywordInput(e.target.value)}
                      className='h-11 w-full rounded-xl border border-input bg-background pl-10 pr-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring transition-colors'
                    />
                  </div>
                  {keyword && (
                    <button
                      type='button'
                      onClick={() => {
                        setKeywordInput('')
                        setKeyword('')
                        setCurrentPage(0)
                      }}
                      className='shrink-0 rounded-xl border border-border px-4 py-2 text-sm font-semibold text-muted-foreground hover:bg-muted transition-colors'
                    >
                      {t('promotions.createPage.clearSearch')}
                    </button>
                  )}
                </div>

                <div className='overflow-auto rounded-xl border border-border'>
                  <table className='w-full min-w-[900px] border-collapse text-left'>
                    <thead className='sticky top-0 bg-muted/60 backdrop-blur-sm'>
                      <tr className='border-b border-border text-xs font-bold uppercase tracking-wide text-muted-foreground'>
                        <th className='w-14 px-4 py-3 text-center'>
                          {t('promotions.createPage.select')}
                        </th>
                        <th className='px-4 py-3'>{t('promotions.table.columns.code')}</th>
                        <th className='px-4 py-3'>{t('promotions.table.columns.name')}</th>
                        <th className='px-4 py-3'>{t('promotions.table.columns.brand')}</th>
                        <th className='px-4 py-3'>{t('promotions.table.columns.price')}</th>
                        <th className='px-4 py-3'>{t('promotions.table.columns.stock')}</th>
                        <th className='px-4 py-3'>{t('promotions.createPage.discountType')}</th>
                        <th className='px-4 py-3'>{t('promotions.createPage.discountValue')}</th>
                      </tr>
                    </thead>
                    <tbody className='divide-y divide-border'>
                      {isLoadingProducts ? (
                        <tr>
                          <td colSpan={8} className='px-4 py-10 text-center text-sm text-muted-foreground'>
                            <div className='flex items-center justify-center gap-2'>
                              <div className='h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent' />
                              {t('promotions.createPage.loading')}
                            </div>
                          </td>
                        </tr>
                      ) : products.length === 0 ? (
                        <tr>
                          <td colSpan={8} className='px-4 py-10 text-center text-sm text-muted-foreground'>
                            {keyword ? (
                              t('promotions.createPage.noResultsWithKeyword', { keyword })
                            ) : (
                              t('promotions.createPage.noProducts')
                            )}
                          </td>
                        </tr>
                      ) : (
                        products.map((product) => {
                          const checked = selectedProductIds.includes(product.productId)
                          const hasActivePromotion = isProductHasActivePromotion(product)
                          const isDisabled = hasActivePromotion && !checked

                          return (
                            <tr
                              key={product.productId}
                              className={cn(
                                checked && !hasActivePromotion ? 'bg-primary/5' : undefined,
                                isDisabled && 'opacity-60'
                              )}
                            >
                              <td className='px-4 py-3 text-center'>
                                <div className='flex items-center justify-center gap-1'>
                                  <input
                                    type='checkbox'
                                    checked={checked}
                                    onChange={() => toggleProduct(product.productId)}
                                    disabled={isDisabled}
                                    className={cn(
                                      'h-4 w-4 rounded border-border text-primary focus:ring-ring',
                                      isDisabled && 'opacity-50 cursor-not-allowed'
                                    )}
                                  />
                                  {hasActivePromotion && (
                                    <span className='text-[10px] text-muted-foreground whitespace-nowrap'>
                                      ({t('promotions.createPage.hasPromotion')})
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className='px-4 py-3 font-mono text-sm font-semibold text-primary'>
                                {product.productCode}
                              </td>
                              <td className='px-4 py-3'>
                                <div className='font-semibold text-foreground'>{product.name}</div>
                                <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                                  <span>
                                    {t('promotions.createPage.batchCount', { count: product.batchCount })}
                                  </span>
                                  {hasActivePromotion && (
                                    <span className='rounded-full bg-success/10 px-2 py-0.5 text-xs text-success'>
                                      {t('promotions.createPage.hasPromotion')}
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className='px-4 py-3 text-sm text-muted-foreground'>{product.brandName}</td>
                              <td className='px-4 py-3 text-sm font-semibold text-foreground'>
                                {formatPrice(product.salePrice)} đ
                              </td>
                              <td className='px-4 py-3 text-sm font-semibold text-foreground'>{product.totalStock}</td>
                              <td className='px-4 py-3'>
                                {checked && !hasActivePromotion ? (
                                  <select
                                    value={productDiscountById[product.productId]?.promotionType ?? 'PERCENTAGE'}
                                    onChange={(e) =>
                                      updateProductDiscount(
                                        product.productId,
                                        'promotionType',
                                        e.target.value as 'PERCENTAGE' | 'FIXED_AMOUNT'
                                      )
                                    }
                                    className='h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring'
                                  >
                                    <option value='PERCENTAGE'>{t('promotions.createPage.percentage')}</option>
                                    <option value='FIXED_AMOUNT'>{t('promotions.createPage.fixedAmount')}</option>
                                  </select>
                                ) : (
                                  <span className='text-sm text-muted-foreground'>—</span>
                                )}
                              </td>
                              <td className='px-4 py-3'>
                                {checked && !hasActivePromotion ? (
                                  <input
                                    type='number'
                                    min={0}
                                    value={
                                      productDiscountById[product.productId]?.discountValue ?? DEFAULT_DISCOUNT_VALUE
                                    }
                                    onChange={(e) =>
                                      updateProductDiscount(product.productId, 'discountValue', Number(e.target.value))
                                    }
                                    className='h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring'
                                  />
                                ) : (
                                  <span className='text-sm text-muted-foreground'>—</span>
                                )}
                              </td>
                            </tr>
                          )
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Phân trang */}
                {totalPages > 1 && (
                  <div className='mt-4 flex items-center justify-between'>
                    <div className='text-sm text-muted-foreground'>
                      {keyword ? (
                        t('promotions.createPage.searchResults', { count: totalElements })
                      ) : (
                        t('promotions.createPage.showingProducts', {
                          current: products.length,
                          total: totalElements
                        })
                      )}
                    </div>
                    <div className='flex items-center gap-2'>
                      <button
                        type='button'
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 0}
                        className='rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
                      >
                        <MaterialIcon name='chevron_left' className='text-lg' />
                      </button>
                      <span className='text-sm text-muted-foreground'>
                        {t('promotions.createPage.pageInfo', {
                          current: currentPage + 1,
                          total: totalPages
                        })}
                      </span>
                      <button
                        type='button'
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage >= totalPages - 1}
                        className='rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
                      >
                        <MaterialIcon name='chevron_right' className='text-lg' />
                      </button>
                    </div>
                  </div>
                )}
              </section>

              {/* Action bar */}
              <div className='flex items-center justify-end gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm'>
                <button
                  type='button'
                  onClick={() => void navigate('/manager/promotions')}
                  className='h-11 rounded-xl border border-border bg-card px-5 text-sm font-bold text-foreground hover:bg-muted transition-colors'
                >
                  {t('promotions.editModal.cancel')}
                </button>
                <button
                  type='submit'
                  disabled={!canSubmit}
                  className='inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-secondary px-6 text-sm font-bold text-secondary-foreground shadow-sm transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50'
                >
                  {isSubmitting && (
                    <span className='h-4 w-4 animate-spin rounded-full border-2 border-secondary-foreground border-t-transparent' />
                  )}
                  {t('promotions.editModal.save')}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  )
}