import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'

import { addToCartApi } from '../../services/cart'
import { MaterialIcon } from '~/shared/ui'
import { cn } from '~/shared/lib/cn'

export interface ProductDetailInfoProps {
  productId: string
  name: string
  price: number
  salePrice?: number
  brandName: string
  totalStock: number
  discountAmount?: number | null
  discountType?: 'PERCENTAGE' | 'FIXED' | string | null
  discountValue?: number | null
  hasActivePromotion?: boolean
  promotionName?: string | null
  promotionDescription?: string | null
  promotionEndDate?: string | null
  promotionDiscountType?: 'PERCENTAGE' | 'FIXED' | string | null
  promotionDiscountValue?: number | null
  imageUrl?: string
}

export function ProductDetailInfo({
  productId,
  name,
  price,
  salePrice,
  brandName,
  totalStock,
  discountAmount,
  discountType,
  discountValue,
  hasActivePromotion,
  promotionName,
  promotionDescription,
  promotionEndDate,
  promotionDiscountType,
  promotionDiscountValue,
  imageUrl
}: ProductDetailInfoProps) {
  const { t } = useTranslation('products')
  const navigate = useNavigate()
  const [quantity, setQuantity] = useState(1)
  const [isAdding, setIsAdding] = useState(false)
  const [showSuccessToast, setShowSuccessToast] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)

  const safePrice = price || 0
  const safeSalePrice = salePrice ?? safePrice
  const safeTotalStock = totalStock || 0
  const safeBrandName = brandName || 'N/A'
  const isPromoted = Boolean(
    hasActivePromotion ||
      safeSalePrice < safePrice ||
      promotionName ||
      promotionDescription ||
      promotionEndDate ||
      promotionDiscountValue != null ||
      discountValue != null
  )

  const formatPrice = (value: number) => `${value.toLocaleString('vi-VN')}đ`

  const formatDate = (value?: string | null) => {
    if (!value) return null

    const parsedDate = new Date(value)
    if (Number.isNaN(parsedDate.getTime())) return value

    return parsedDate.toLocaleDateString('vi-VN')
  }

  const formatDiscountBadge = () => {
    const effectiveType = promotionDiscountType ?? discountType
    const effectiveValue = promotionDiscountValue ?? discountValue ?? discountAmount

    if (effectiveValue == null) return null

    if (effectiveType === 'PERCENTAGE') {
      return `-${effectiveValue}%`
    }

    return `-${formatPrice(effectiveValue)}`
  }

  const renderPromotionSummary = () => {
    if (!isPromoted) return null

    const discountText = formatDiscountBadge()
    const effectiveDiscountValue = promotionDiscountValue ?? discountValue
    const savingsText =
      effectiveDiscountValue != null
        ? promotionDiscountType === 'FIXED' || discountType === 'FIXED'
          ? `Tiết kiệm ${formatPrice(effectiveDiscountValue)}`
          : promotionDiscountType === 'PERCENTAGE' || discountType === 'PERCENTAGE'
            ? `Giảm ${effectiveDiscountValue}%`
            : null
        : null

    return (
      <div className='mt-4 overflow-hidden rounded-[1.5rem] border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-accent/15 shadow-[0_14px_35px_-20px_rgba(37,99,235,0.35)]'>
        <div className='flex items-center justify-between gap-3 border-b border-border/60 px-4 py-3 sm:px-5'>
          <div className='flex items-center gap-2'>
            <span className='inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm'>
              <MaterialIcon name='local_fire_department' className='text-[18px]' />
            </span>
            <div>
              <p className='text-sm font-semibold text-foreground'>Ưu đãi đang áp dụng</p>
              <p className='text-xs text-muted-foreground'>Giá đã được tự động cập nhật</p>
            </div>
          </div>
          {discountText && (
            <span className='inline-flex items-center rounded-full bg-destructive px-3 py-1 text-xs font-bold text-destructive-foreground shadow-sm'>
              {discountText}
            </span>
          )}
        </div>

        <div className='space-y-4 px-4 py-4 sm:px-5'>
          <div className='flex flex-wrap items-end gap-3'>
            <div className='text-4xl font-black tracking-tight text-primary md:text-5xl'>
              {formatPrice(safeSalePrice)}
            </div>
            {safeSalePrice < safePrice && (
              <div className='pb-1 text-lg text-muted-foreground line-through'>
                {formatPrice(safePrice)}
              </div>
            )}
          </div>

          <div className='flex flex-wrap items-center gap-2'>
            {promotionName && (
              <span className='inline-flex items-center rounded-full bg-foreground/5 px-3 py-1 text-sm font-semibold text-foreground'>
                {promotionName}
              </span>
            )}
            {savingsText && (
              <span className='inline-flex items-center rounded-full bg-success/10 px-3 py-1 text-sm font-semibold text-success'>
                {savingsText}
              </span>
            )}
          </div>

          {promotionDescription && (
            <p className='max-w-2xl text-sm leading-6 text-muted-foreground'>
              {promotionDescription}
            </p>
          )}

          <div className='grid gap-3 md:grid-cols-2'>
            {promotionEndDate && (
              <div className='rounded-2xl border border-border/70 bg-card/80 px-4 py-3 shadow-sm'>
                <p className='text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground'>
                  Hạn chót
                </p>
                <p className='mt-1 text-base font-semibold text-foreground'>
                  {formatDate(promotionEndDate)}
                </p>
              </div>
            )}
            <div className='rounded-2xl border border-border/70 bg-card/80 px-4 py-3 shadow-sm'>
              <p className='text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground'>
                Tiết kiệm
              </p>
              <p className='mt-1 text-base font-semibold text-foreground'>
                {discountAmount != null
                  ? formatPrice(discountAmount)
                  : safeSalePrice < safePrice
                    ? formatPrice(safePrice - safeSalePrice)
                    : '0đ'}
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const handleDecrease = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1)
    }
  }

  const handleIncrease = () => {
    if (quantity < safeTotalStock) {
      setQuantity(quantity + 1)
    }
  }

  const handleAddToCart = async () => {
    if (isAdding) return
    setIsAdding(true)
    setAddError(null)
    setShowSuccessToast(false)

    try {
      await addToCartApi({ productId, quantity, productName: name, price: safePrice, imageUrl })
      setShowSuccessToast(true)
      setTimeout(() => setShowSuccessToast(false), 3000)
    } catch (err: unknown) {
      setAddError(err instanceof Error ? err.message : 'Lỗi khi thêm vào giỏ hàng')
    } finally {
      setIsAdding(false)
    }
  }

  const handleBuyNow = async () => {
    if (isAdding) return
    setIsAdding(true)
    setAddError(null)

    try {
      await addToCartApi({ productId, quantity, productName: name, price: safePrice, imageUrl })
      navigate('/checkout')
    } catch (err: unknown) {
      setAddError(err instanceof Error ? err.message : 'Lỗi xử lý mua ngay')
      setIsAdding(false)
    }
  }

  return (
    <section className='relative flex flex-col justify-start'>
      <h1 className='font-display text-3xl font-black tracking-tight text-foreground md:text-5xl'>
        {name}
      </h1>

      <div className='mt-4 flex flex-wrap items-center gap-3'>
        <div className='flex items-center gap-1 text-warning' aria-label={t('detail.product.ratingLabel')}>
          {['star', 'star', 'star', 'star', 'star_half'].map((icon, index) => (
            <MaterialIcon key={`${icon}-${index}`} name={icon} filled className='text-[24px]' />
          ))}
        </div>
        <span className='rounded-full bg-muted px-3 py-1 text-sm font-semibold text-muted-foreground'>
          {t('detail.product.reviews')}
        </span>
      </div>

      {renderPromotionSummary()}

      <div className='mt-5 space-y-3'>
        <div>
          <p className='text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground'>Thương hiệu</p>
          <p className='mt-1 text-base font-semibold text-foreground'>{safeBrandName}</p>
        </div>
        <div>
          <p className={cn('text-base font-semibold', safeTotalStock > 0 ? 'text-success' : 'text-destructive')}>
            {safeTotalStock > 0 ? 'Còn hàng:' : 'Hết hàng'}
          </p>
          {safeTotalStock > 0 && (
            <p className='mt-1 text-sm font-medium text-muted-foreground'>{`${safeTotalStock} sản phẩm`}</p>
          )}
        </div>
      </div>

      {addError && (
        <div className='mt-4 flex items-center gap-2 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive'>
          <MaterialIcon name='error' className='shrink-0 text-[20px] text-destructive' />
          <span>{addError}</span>
        </div>
      )}

      <div className='mt-8 flex flex-col gap-3'>
        <label className='text-sm font-semibold text-foreground' htmlFor='quantity'>
          {t('detail.quantity.label')}
        </label>
        <div className='flex w-fit items-center overflow-hidden rounded-2xl border border-border bg-card p-1 shadow-sm'>
          <button
            type='button'
            onClick={handleDecrease}
            className='inline-flex h-12 w-12 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50'
            aria-label={t('detail.quantity.decrease')}
            disabled={isAdding}
          >
            <MaterialIcon name='remove' className='text-[22px]' />
          </button>
          <input
            id='quantity'
            type='number'
            value={quantity}
            readOnly
            className='h-12 w-16 border-0 bg-transparent text-center text-lg font-bold text-foreground focus:ring-0'
          />
          <button
            type='button'
            onClick={handleIncrease}
            className='inline-flex h-12 w-12 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50'
            aria-label={t('detail.quantity.increase')}
            disabled={quantity >= safeTotalStock || isAdding}
          >
            <MaterialIcon name='add' className='text-[22px]' />
          </button>
        </div>
      </div>

      <div className='mt-10 grid gap-4 sm:grid-cols-2'>
        <button
          type='button'
          disabled={safeTotalStock <= 0 || isAdding}
          onClick={handleAddToCart}
          className='group flex items-center justify-center gap-3 rounded-2xl bg-primary px-8 py-4 text-base font-bold text-primary-foreground shadow-[0_18px_35px_-18px_rgba(37,99,235,0.75)] transition-all hover:-translate-y-0.5 hover:brightness-110 disabled:pointer-events-none disabled:translate-y-0 disabled:opacity-50'
        >
          {isAdding ? (
            <MaterialIcon name='progress_activity' className='animate-spin text-[22px]' />
          ) : (
            <MaterialIcon name='shopping_cart' className='text-[22px] transition-transform group-hover:scale-110' />
          )}
          {t('detail.actions.addToCart')}
        </button>
        <button
          type='button'
          disabled={safeTotalStock <= 0 || isAdding}
          onClick={handleBuyNow}
          className='rounded-2xl border-2 border-primary bg-card px-8 py-4 text-base font-bold text-primary shadow-sm transition-all hover:-translate-y-0.5 hover:bg-primary hover:text-primary-foreground disabled:pointer-events-none disabled:opacity-50'
        >
          {t('detail.actions.buyNow')}
        </button>
      </div>

      {showSuccessToast && (
        <div className='fixed bottom-4 right-4 z-50 flex items-center gap-3 rounded-2xl bg-success px-4 py-3 text-success-foreground shadow-lg animate-in fade-in slide-in-from-bottom-4'>
          <MaterialIcon name='check_circle' className='text-[20px]' />
          <div className='text-left'>
            <p className='text-sm font-bold'>{t('cart.addedToCart', 'Đã thêm sản phẩm vào giỏ hàng!')}</p>
          </div>
        </div>
      )}
    </section>
  )
}
