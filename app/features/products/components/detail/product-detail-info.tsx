// app/features/products/components/detail/product-detail-info.tsx

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { addToCartApi } from '../../services/cart'
import { MaterialIcon } from '~/shared/ui'
import { cn } from '~/shared/lib/cn'

export interface ProductDetailInfoProps {
  productId: string
  name: string
  salePrice: number
  brandName: string
  totalStock: number
  unit?: string  // ⭐ Thêm unit
  discountAmount?: number | null
  discountValue?: number | null
  hasActivePromotion?: boolean
  promotionName?: string | null
  promotionPrice?: number
  promotionType?: 'PERCENTAGE' | 'FIXED_AMOUNT' | string
  imageUrl?: string
  price?: number
  promotionDescription?: string | null
  promotionEndDate?: string | null
}

export function ProductDetailInfo({
  productId,
  name,
  salePrice,
  brandName,
  totalStock,
  unit,  // ⭐ Nhận unit
  discountAmount,
  discountValue,
  hasActivePromotion,
  promotionName,
  promotionPrice,
  promotionType,
  imageUrl,
  price,
  promotionDescription,
  promotionEndDate
}: ProductDetailInfoProps) {
  const { t } = useTranslation('products')
  const navigate = useNavigate()
  const [quantity, setQuantity] = useState(1)
  const [isAdding, setIsAdding] = useState(false)
  const [showSuccessToast, setShowSuccessToast] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)

  const originalPrice = salePrice || price || 0
  const displayPrice = promotionPrice || originalPrice
  const safeTotalStock = totalStock || 0
  const isPromoted = Boolean(hasActivePromotion || promotionPrice || promotionName)

  // ⭐ Lấy unit label từ translation
  const unitLabel = unit ? t(`unit.${unit}`, unit.toLowerCase()) : ''

  const formatPrice = (value: number) => `${value.toLocaleString('vi-VN')}đ`

  const formatDate = (value?: string | null) => {
    if (!value) return null
    const d = new Date(value)
    return isNaN(d.getTime()) ? value : d.toLocaleDateString('vi-VN')
  }

  const discountText = () => {
    const val = discountValue ?? discountAmount
    if (val == null) return null
    return promotionType === 'PERCENTAGE' ? `-${val}%` : `-${formatPrice(val)}`
  }

  const handleDecrease = () => quantity > 1 && setQuantity(quantity - 1)
  const handleIncrease = () => quantity < safeTotalStock && setQuantity(quantity + 1)

  const handleAddToCart = async () => {
    if (isAdding) return
    setIsAdding(true)
    setAddError(null)
    try {
      await addToCartApi({ productId, quantity, productName: name, price: displayPrice, imageUrl })
      setShowSuccessToast(true)
      setTimeout(() => setShowSuccessToast(false), 3000)
    } catch (err) {
      setAddError(err instanceof Error ? err.message : 'Lỗi thêm vào giỏ')
    } finally {
      setIsAdding(false)
    }
  }

  const handleBuyNow = async () => {
    if (isAdding) return
    setIsAdding(true)
    try {
      await addToCartApi({ productId, quantity, productName: name, price: displayPrice, imageUrl })
      navigate('/checkout')
    } catch (err) {
      setAddError(err instanceof Error ? err.message : 'Lỗi mua ngay')
      setIsAdding(false)
    }
  }

  return (
    <section className='relative flex flex-col justify-start'>
      <h1 className='font-display text-3xl font-black tracking-tight text-foreground md:text-5xl'>
        {name}
      </h1>

      <div className='mt-4 flex flex-wrap items-center gap-3'>
        <div className='flex items-center gap-1 text-warning'>
          {['star', 'star', 'star', 'star', 'star_half'].map((icon, i) => (
            <MaterialIcon key={i} name={icon} filled className='text-[24px]' />
          ))}
        </div>
        <span className='rounded-full bg-muted px-3 py-1 text-sm font-semibold text-muted-foreground'>
          {t('detail.product.reviews')}
        </span>
      </div>

      {/* Phần hiển thị giá */}
      {isPromoted ? (
        <div className='mt-4 overflow-hidden rounded-[1.5rem] border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-accent/15'>
          <div className='flex items-center justify-between gap-3 border-b border-border/60 px-4 py-3'>
            <div className='flex items-center gap-2'>
              <span className='inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground'>
                <MaterialIcon name='local_fire_department' className='text-[18px]' />
              </span>
              <div>
                <p className='text-sm font-semibold text-foreground'>
                  {promotionName || 'Ưu đãi đang áp dụng'}
                </p>
              </div>
            </div>
            {discountText() && (
              <span className='inline-flex items-center rounded-full bg-destructive px-3 py-1 text-xs font-bold text-destructive-foreground'>
                {discountText()}
              </span>
            )}
          </div>

          <div className='px-4 py-4'>
            <div className='flex flex-wrap items-end gap-3'>
              <span className='text-4xl font-black tracking-tight text-red-500 md:text-5xl'>
                {formatPrice(displayPrice)}
              </span>
              {originalPrice > 0 && originalPrice !== displayPrice && (
                <span className='pb-1 text-lg text-muted-foreground line-through'>
                  {formatPrice(originalPrice)}
                </span>
              )}
              {/* ⭐ Hiển thị unit */}
              {unitLabel && (
                <span className='pb-1 text-lg font-medium text-muted-foreground'>
                  /{unitLabel}
                </span>
              )}
            </div>
            {promotionDescription && <p className='mt-2 text-sm text-muted-foreground'>{promotionDescription}</p>}
            {promotionEndDate && (
              <div className='mt-3 rounded-2xl border border-border/70 bg-card/80 px-4 py-3'>
                <p className='text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground'>Hạn chót</p>
                <p className='mt-1 text-base font-semibold text-foreground'>{formatDate(promotionEndDate)}</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className='mt-4'>
          <div className='flex items-end gap-2'>
            <span className='text-4xl font-black tracking-tight text-primary md:text-5xl'>
              {formatPrice(originalPrice)}
            </span>
            {/* ⭐ Hiển thị unit */}
            {unitLabel && (
              <span className='pb-1 text-lg font-medium text-muted-foreground'>
                /{unitLabel}
              </span>
            )}
          </div>
        </div>
      )}

      <div className='mt-5 space-y-3'>
        <div>
          <p className='text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground'>Thương hiệu</p>
          <p className='mt-1 text-base font-semibold text-foreground'>{brandName || 'N/A'}</p>
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
          <MaterialIcon name='error' className='shrink-0 text-[20px]' />
          <span>{addError}</span>
        </div>
      )}

      <div className='mt-8 flex flex-col gap-3'>
        <label className='text-sm font-semibold text-foreground' htmlFor='quantity'>Số lượng</label>
        <div className='flex w-fit items-center overflow-hidden rounded-2xl border border-border bg-card p-1 shadow-sm'>
          <button
            type='button'
            onClick={handleDecrease}
            className='inline-flex h-12 w-12 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50'
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
            className='inline-flex h-12 w-12 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50'
            disabled={quantity >= safeTotalStock || isAdding}
          >
            <MaterialIcon name='add' className='text-[22px]' />
          </button>
        </div>
        {/* ⭐ Hiển thị đơn vị */}
        {unitLabel && (
          <span className='text-sm text-muted-foreground'>
            Đơn vị: {unitLabel}
          </span>
        )}
      </div>

      <div className='mt-10 grid gap-4 sm:grid-cols-2'>
        <button
          type='button'
          disabled={safeTotalStock <= 0 || isAdding}
          onClick={handleAddToCart}
          className='group flex items-center justify-center gap-3 rounded-2xl bg-primary px-8 py-4 text-base font-bold text-primary-foreground shadow-[0_18px_35px_-18px_rgba(37,99,235,0.75)] transition-all hover:-translate-y-0.5 hover:brightness-110 disabled:opacity-50'
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
          className='rounded-2xl border-2 border-primary bg-card px-8 py-4 text-base font-bold text-primary shadow-sm transition-all hover:-translate-y-0.5 hover:bg-primary hover:text-primary-foreground disabled:opacity-50'
        >
          {t('detail.actions.buyNow')}
        </button>
      </div>

      {showSuccessToast && (
        <div className='fixed bottom-4 right-4 z-50 flex items-center gap-3 rounded-2xl bg-success px-4 py-3 text-success-foreground shadow-lg animate-in fade-in slide-in-from-bottom-4'>
          <MaterialIcon name='check_circle' className='text-[20px]' />
          <p className='text-sm font-bold'>{t('cart.addedToCart', 'Đã thêm vào giỏ hàng!')}</p>
        </div>
      )}
    </section>
  )
}