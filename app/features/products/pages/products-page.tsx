/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { SiteBottomNav, SiteFab, SiteFooter, SiteHeader } from '~/shared/components'
import { MaterialIcon } from '~/shared/ui'
import { ProductsGrid } from '../components/listing/products-grid'
import { ProductsHero } from '../components/listing/products-hero'
import { ProductsGallery } from '../components/listing/products-gallery'
import { ProductsSidebarFilters } from '../components/listing/products-sidebar-filters'
import { ProductsPagination } from '../components/listing/products-pagination'
import { fetchProductsApi, fetchCategoriesApi } from '../services/products'
import type { ProductResponse, CategoryData } from '~/shared/lib/product'
import { cn } from '~/shared/lib/cn'

const SORT_OPTIONS = ['popular', 'priceLow', 'priceHigh', 'newest'] as const

const SORT_MAP: Record<string, string> = {
  popular: 'date_desc',
  priceLow: 'price_asc',
  priceHigh: 'price_desc',
  newest: 'date_desc'
}

const BRAND_MAP: Record<string, string> = {
  royalCanin: 'Royal Canin',
  ganador: 'Ganador',
  pedigree: 'Pedigree',
  zenith: 'Zenith'
}

export function ProductsPage() {
  const { t } = useTranslation('products')

  // Search, filter and page state variables
  const [searchInput, setSearchInput] = useState('')
  const [keyword, setKeyword] = useState('')
  const [category, setCategory] = useState<string | number>('all')
  const [brandName, setBrandName] = useState('')
  const [sort, setSort] = useState('popular')
  const [page, setPage] = useState(0)

  // API data states
  const [products, setProducts] = useState<ProductResponse[]>([])
  const [categories, setCategories] = useState<CategoryData[]>([])
  const [totalElements, setTotalElements] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch categories on mount
  useEffect(() => {
    let active = true
    async function loadCategories() {
      try {
        const response = await fetchCategoriesApi()
        if (active && response.success) {
          setCategories(response.data)
        }
      } catch (err) {
        console.error('Failed to load categories', err)
      }
    }
    void loadCategories()
    return () => {
      active = false
    }
  }, [])

  // Search input debouncer
  useEffect(() => {
    const handler = setTimeout(() => {
      setKeyword(searchInput)
      setPage(0)
    }, 400)
    return () => clearTimeout(handler)
  }, [searchInput])

  // Fetch products upon filter changes
  useEffect(() => {
    let active = true

    async function loadProducts() {
      setIsLoading(true)
      try {
        const response = await fetchProductsApi({
          keyword,
          page,
          size: 12,
          categoryId: category !== 'all' ? Number(category) : undefined,
          brandName: BRAND_MAP[brandName] || undefined,
          sortBy: SORT_MAP[sort]
        })
        if (active && response.success) {
          setProducts(response.data.content)
          setTotalElements(response.data.totalElements)
          setTotalPages(response.data.totalPages)
          setError(null)
        }
      } catch (err: any) {
        if (active) {
          setError(err.message || 'Lỗi tải danh sách sản phẩm')
        }
      } finally {
        if (active) {
          setIsLoading(false)
        }
      }
    }

    void loadProducts()

    return () => {
      active = false
    }
  }, [keyword, category, brandName, sort, page])

  const resultsFrom = totalElements > 0 ? page * 12 + 1 : 0
  const resultsTo = Math.min((page + 1) * 12, totalElements)

  return (
    <div className='flex min-h-screen flex-col bg-background text-foreground'>
      <SiteHeader />
      <main className='flex-1'>
        <ProductsHero />

        <div className='mx-auto max-w-6xl px-4 py-16 md:px-6'>
          <div className='flex flex-col gap-6 md:flex-row'>
            <aside className='hidden w-1/4 pr-4 md:block'>
              <ProductsSidebarFilters
                category={category}
                brandName={brandName}
                categories={categories}
                onCategoryChange={setCategory}
                onBrandChange={setBrandName}
              />
            </aside>

            <section className='w-full md:w-3/4'>
              <div className='mb-6 flex items-center justify-between rounded-xl border border-border/60 bg-card p-3 shadow-sm md:hidden'>
                <button
                  type='button'
                  className='flex items-center gap-2 text-sm font-semibold text-foreground'
                >
                  <MaterialIcon name='filter_list' className='text-[20px]' />
                  {t('mobile.filterSort')}
                </button>
                <span className='text-sm text-muted-foreground'>
                  {t('mobile.count', { count: totalElements })}
                </span>
              </div>

              <div className='mb-6 hidden md:flex'>
                <div className='relative w-full'>
                  <MaterialIcon
                    name='search'
                    className='absolute left-4 top-1/2 -translate-y-1/2 text-[20px] text-muted-foreground'
                  />
                  <input
                    type='text'
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder={t('search.categoryPlaceholder')}
                    className='w-full rounded-xl border border-border bg-card py-3 pl-12 pr-4 text-sm text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring'
                  />
                </div>
              </div>

              <div className='mb-6 hidden items-center justify-between border-b border-border/60 pb-4 md:flex'>
                <span className='text-sm text-muted-foreground'>
                  {t('sort.results', { from: resultsFrom, to: resultsTo, total: totalElements })}
                </span>
                <div className='flex items-center gap-3'>
                  <label className='text-sm font-semibold text-muted-foreground'>{t('sort.label')}</label>
                  <select
                    value={sort}
                    onChange={(e) => {
                      setSort(e.target.value)
                      setPage(0)
                    }}
                    className='rounded-lg bg-muted px-3 py-2 text-sm text-foreground focus:outline-none cursor-pointer'
                  >
                    {SORT_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {t(`sort.options.${option}`)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className='mb-4 flex gap-3 overflow-x-auto pb-4'>
                <button
                  type='button'
                  onClick={() => {
                    setCategory('all')
                    setPage(0)
                  }}
                  className={cn(
                    'whitespace-nowrap rounded-xl px-4 py-2 text-sm font-semibold transition-all active:scale-[0.98]',
                    category === 'all'
                      ? 'bg-secondary text-secondary-foreground shadow-sm'
                      : 'border border-border bg-card text-muted-foreground hover:bg-muted hover:text-primary'
                  )}
                >
                  {t('chips.all')}
                </button>

                {categories.map((cat) => {
                  const isSelected = category === cat.categoryId
                  return (
                    <button
                      key={cat.categoryId}
                      type='button'
                      onClick={() => {
                        setCategory(cat.categoryId)
                        setPage(0)
                      }}
                      className={cn(
                        'whitespace-nowrap rounded-xl px-4 py-2 text-sm font-semibold transition-all active:scale-[0.98]',
                        isSelected
                          ? 'bg-secondary text-secondary-foreground shadow-sm'
                          : 'border border-border bg-card text-muted-foreground hover:bg-muted hover:text-primary'
                      )}
                    >
                      {cat.name}
                    </button>
                  )
                })}
              </div>

              {error && (
                <div className='mb-6 flex items-center gap-2 rounded-xl bg-destructive/10 p-4 text-sm font-semibold text-destructive'>
                  <MaterialIcon name='error' className='shrink-0 text-xl' />
                  <span>{error}</span>
                </div>
              )}

              <ProductsGrid products={products} isLoading={isLoading} />

              <ProductsPagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />

              <ProductsGallery />
            </section>
          </div>
        </div>
      </main>
      <SiteFooter />
      <SiteBottomNav />
      <SiteFab />
    </div>
  )
}
