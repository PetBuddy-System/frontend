import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '~/shared/lib/cn'

export interface ProductDetailDescriptionProps {
  description?: string
  brandName: string
  categoryName: string
  ingredients?: string
  usageInstructions?: string
}

export function ProductDetailDescription({
  description,
  brandName,
  categoryName,
  ingredients,
  usageInstructions
}: ProductDetailDescriptionProps) {
  const { t } = useTranslation('products')
  const [activeTab, setActiveTab] = useState<'description' | 'instructions' | 'ingredients'>('description')

  const hasIngredients = Boolean(ingredients && ingredients.trim())
  const hasInstructions = Boolean(usageInstructions && usageInstructions.trim())

  console.log('🔍 ProductDetailDescription - hasIngredients:', hasIngredients)
  console.log('🔍 ProductDetailDescription - hasInstructions:', hasInstructions)

  return (
    <div className='mt-12'>
      {/* Header with tabs */}
      <div className='flex flex-wrap items-center gap-4 mb-4'>
        <h2 className='text-2xl font-bold text-foreground'>Mô tả sản phẩm</h2>
        <div className='flex gap-2 border-l border-border/60 pl-4'>
          <button
            onClick={() => setActiveTab('description')}
            className={cn(
              'px-4 py-1.5 text-sm font-semibold rounded-full transition-all',
              activeTab === 'description'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            )}
          >
            Mô tả
          </button>
          {hasInstructions && (
            <button
              onClick={() => setActiveTab('instructions')}
              className={cn(
                'px-4 py-1.5 text-sm font-semibold rounded-full transition-all',
                activeTab === 'instructions'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              Hướng dẫn sử dụng
            </button>
          )}
          {hasIngredients && (
            <button
              onClick={() => setActiveTab('ingredients')}
              className={cn(
                'px-4 py-1.5 text-sm font-semibold rounded-full transition-all',
                activeTab === 'ingredients'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              Thành phần
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className='rounded-xl border border-border/60 bg-card p-6 shadow-sm'>
        <div className='prose prose-sm max-w-none text-muted-foreground'>
          {activeTab === 'description' && (
            <p className='whitespace-pre-line'>{description || 'Chưa có mô tả cho sản phẩm này'}</p>
          )}

          {activeTab === 'instructions' && (
            <div className='whitespace-pre-line'>{usageInstructions || 'Chưa có hướng dẫn sử dụng'}</div>
          )}

          {activeTab === 'ingredients' && (
            <div className='whitespace-pre-line'>{ingredients || 'Chưa có thông tin thành phần'}</div>
          )}
        </div>

        {/* Thông tin thương hiệu và danh mục */}
        <div className='mt-6 grid grid-cols-2 gap-4 border-t border-border/60 pt-6'>
          <div>
            <p className='text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground'>Thương hiệu</p>
            <p className='mt-1 text-base font-semibold text-foreground'>{brandName}</p>
          </div>
          <div>
            <p className='text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground'>Danh mục</p>
            <p className='mt-1 text-base font-semibold text-foreground'>{categoryName}</p>
          </div>
        </div>
      </div>
    </div>
  )
}