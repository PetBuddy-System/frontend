import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { MaterialIcon } from '~/shared/ui'

import { ManagerSidebar } from '../components/layout/manager-sidebar'
import { ManagerTopNav } from '../components/layout/manager-top-nav'
import { ManagerProductsStatsGrid } from '../components/products/manager-products-stats-grid'
import { ManagerProductsTable } from '../components/products/manager-products-table'
import { ManagerProductsToolbar } from '../components/products/manager-products-toolbar'
import { ManagerEditProductModal } from '../components/products/manager-edit-product-modal'
import { ManagerImportProductsModal } from '../components/products/manager-import-products-modal'
import {
  fetchProductsManagementApi,
  fetchCategoriesApi,
  createProductApi,
  type ProductManagementItem,
  type CategoryData
} from '~/shared/lib/product'

export function ManagerProductsPage() {
  const { t } = useTranslation('manager')

  // Filters & Page States
  const [searchInput, setSearchInput] = useState('')
  const [keyword, setKeyword] = useState('')
  const [category, setCategory] = useState<string | number>('all')
  const [status, setStatus] = useState<string>('all')
  const [page, setPage] = useState(0)

  // API Data States
  const [products, setProducts] = useState<ProductManagementItem[]>([])
  const [categories, setCategories] = useState<CategoryData[]>([])
  const [totalElements, setTotalElements] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Edit & Refresh states
  const [editingProductId, setEditingProductId] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  // Import Excel states
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)

  // Create states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [createForm, setCreateForm] = useState<{
    name: string
    price: number
    brandName: string
    categoryId: number | undefined
    status: 'ACTIVE' | 'INACTIVE'
    description: string
    totalStock: number
  }>({
    name: '',
    price: 0,
    brandName: '',
    categoryId: undefined,
    status: 'ACTIVE',
    description: '',
    totalStock: 0
  })
  const [createImages, setCreateImages] = useState<File[]>([])
  const [createImagePreviews, setCreateImagePreviews] = useState<string[]>([])
  const [isCreating, setIsCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  // Cleanup create image previews on unmount
  useEffect(() => {
    return () => {
      createImagePreviews.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [createImagePreviews])

  const handleCreateProduct = () => {
    setCreateForm({
      name: '',
      price: 0,
      brandName: '',
      categoryId: undefined,
      status: 'ACTIVE',
      description: '',
      totalStock: 0
    })
    setCreateImages([])
    createImagePreviews.forEach((url) => URL.revokeObjectURL(url))
    setCreateImagePreviews([])
    setCreateError(null)
    setIsCreateModalOpen(true)
  }

  const handleCreateImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files)
      setCreateImages((prev) => [...prev, ...filesArray])
      const newPreviews = filesArray.map((file) => URL.createObjectURL(file))
      setCreateImagePreviews((prev) => [...prev, ...newPreviews])
    }
  }

  const removeCreateImage = (index: number) => {
    if (createImagePreviews[index]) {
      URL.revokeObjectURL(createImagePreviews[index])
    }
    setCreateImages((prev) => prev.filter((_, idx) => idx !== index))
    setCreateImagePreviews((prev) => prev.filter((_, idx) => idx !== index))
  }

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!createForm.name.trim()) {
      setCreateError('Tên sản phẩm không được để trống')
      return
    }
    if (createForm.price < 0) {
      setCreateError('Đơn giá không được âm')
      return
    }
    if (!createForm.brandName.trim()) {
      setCreateError('Thương hiệu không được để trống')
      return
    }
    if (!createForm.categoryId) {
      setCreateError('Vui lòng chọn danh mục')
      return
    }

    setIsCreating(true)
    setCreateError(null)

    try {
      const response = await createProductApi(
        {
          name: createForm.name.trim(),
          price: Number(createForm.price),
          brandName: createForm.brandName.trim(),
          categoryId: Number(createForm.categoryId),
          description: createForm.description.trim()
        },
        createImages
      )

      if (response.success) {
        setIsCreateModalOpen(false)
        setRefreshKey((prev) => prev + 1)
        // Reset form
        setCreateForm({
          name: '',
          price: 0,
          brandName: '',
          categoryId: undefined,
          status: 'ACTIVE',
          description: '',
          totalStock: 0
        })
        setCreateImages([])
        createImagePreviews.forEach((url) => URL.revokeObjectURL(url))
        setCreateImagePreviews([])
      } else {
        setCreateError(response.message || 'Lỗi khi tạo sản phẩm')
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Lỗi khi tạo sản phẩm'
      setCreateError(errorMessage)
    } finally {
      setIsCreating(false)
    }
  }

  // Load categories on mount
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

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setKeyword(searchInput)
      setPage(0)
    }, 400)
    return () => clearTimeout(handler)
  }, [searchInput])

  // Fetch management products list
  useEffect(() => {
    let active = true
    async function loadManagementProducts() {
      setIsLoading(true)
      try {
        const response = await fetchProductsManagementApi({
          keyword,
          categoryId: category !== 'all' ? Number(category) : undefined,
          status: status !== 'all' ? (status as 'ACTIVE' | 'INACTIVE' | 'DELETED') : undefined,
          page,
          size: 10
        })
        if (active && response.success) {
          setProducts(response.data.content)
          setTotalElements(response.data.totalElements)
          setTotalPages(response.data.totalPages)
          setError(null)
        }
      } catch (err: unknown) {
        if (active) {
          const errorMessage = err instanceof Error ? err.message : 'Lỗi tải danh sách sản phẩm quản trị'
          setError(errorMessage)
        }
      } finally {
        if (active) {
          setIsLoading(false)
        }
      }
    }
    void loadManagementProducts()
    return () => {
      active = false
    }
  }, [keyword, category, status, page, refreshKey])

  const handleEdit = (productId: string) => {
    setEditingProductId(productId)
  }

  const handleDelete = (productId: string) => {
    console.log('Delete product:', productId)
  }

  const handleView = (productId: string) => {
    window.location.href = `/manager/products/${productId}`
  }

  return (
    <div className='flex h-screen overflow-hidden bg-background text-foreground'>
      <ManagerSidebar activeItem='products' />
      <div className='flex min-w-0 flex-1 flex-col overflow-hidden'>
        <ManagerTopNav titleKey='productManagement.title' subtitleKey='productManagement.subtitle' />
        <main className='flex-1 overflow-y-auto p-4 md:p-6'>
          <div className='mx-auto flex max-w-7xl flex-col gap-6'>
            <section className='flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between'>
              <div>
                <h1 className='font-display text-2xl font-bold text-primary md:text-3xl'>
                  {t('productManagement.title')}
                </h1>
                <p className='mt-2 max-w-3xl text-muted-foreground'>{t('productManagement.subtitle')}</p>
              </div>
              <div className='flex flex-col gap-3 sm:flex-row sm:items-center w-full lg:w-auto lg:max-w-xl shrink-0'>
                <div className='relative flex-1 lg:w-80'>
                  <MaterialIcon
                    name='search'
                    className='absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground'
                  />
                  <input
                    type='search'
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder={t('productManagement.searchPlaceholder')}
                    className='h-11 w-full rounded-full border border-input bg-card pl-10 pr-4 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-ring'
                  />
                </div>
                <button
                  type='button'
                  onClick={() => setIsImportModalOpen(true)}
                  className='inline-flex h-11 shrink-0 whitespace-nowrap items-center justify-center gap-2 rounded-xl border border-border bg-card px-5 text-sm font-bold text-card-foreground shadow-sm transition-all hover:border-primary hover:text-primary focus:outline-none focus:ring-2 focus:ring-ring'
                >
                  <MaterialIcon name='upload_file' className='text-lg' />
                  <span>Import Excel</span>
                </button>
                <button
                  type='button'
                  onClick={handleCreateProduct}
                  className='inline-flex h-11 shrink-0 whitespace-nowrap items-center justify-center gap-2 rounded-xl bg-secondary px-5 text-sm font-bold text-secondary-foreground shadow-sm transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-ring'
                >
                  <MaterialIcon name='add' className='text-lg' />
                  <span>{t('productManagement.actions.add')}</span>
                </button>
              </div>
            </section>

            {error && (
              <div className='flex items-center gap-2 rounded-xl bg-destructive/10 p-4 text-sm font-semibold text-destructive'>
                <MaterialIcon name='error' className='shrink-0 text-xl' />
                <span>{error}</span>
              </div>
            )}

            <ManagerProductsStatsGrid />
            <ManagerProductsToolbar
              categories={categories}
              selectedCategory={category}
              onCategorySelect={(cat) => {
                setCategory(cat)
                setPage(0)
              }}
              selectedStatus={status}
              onStatusSelect={(stat) => {
                setStatus(stat)
                setPage(0)
              }}
            />
            <ManagerProductsTable
              products={products}
              isLoading={isLoading}
              currentPage={page}
              totalPages={totalPages}
              totalElements={totalElements}
              onPageChange={setPage}
              onEditClick={handleEdit}
              onDeleteClick={handleDelete}
              onViewClick={handleView}
            />

            <ManagerEditProductModal
              productId={editingProductId}
              categories={categories}
              onClose={() => setEditingProductId(null)}
              onSaveSuccess={() => setRefreshKey((prev) => prev + 1)}
            />

            {isImportModalOpen && (
              <ManagerImportProductsModal
                onClose={() => setIsImportModalOpen(false)}
                onImportSuccess={() => {
                  setIsImportModalOpen(false)
                  setRefreshKey((prev) => prev + 1)
                }}
              />
            )}

            {isCreateModalOpen && (
              <div className='fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto'>
                <button
                  type='button'
                  aria-label='Close'
                  className='absolute inset-0 bg-foreground/45 backdrop-blur-sm transition-opacity'
                  onClick={() => setIsCreateModalOpen(false)}
                />

                <section className='relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl transition-all'>
                  <header className='flex items-center justify-between border-b border-border bg-muted/50 px-6 py-4'>
                    <div>
                      <h2 className='font-display text-lg font-bold text-card-foreground'>
                        Thêm sản phẩm mới
                      </h2>
                      <p className='text-xs text-muted-foreground mt-0.5'>
                        Vui lòng điền thông tin sản phẩm mới bên dưới
                      </p>
                    </div>
                    <button
                      type='button'
                      onClick={() => setIsCreateModalOpen(false)}
                      className='flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-primary transition-colors'
                    >
                      <MaterialIcon name='close' className='text-xl' />
                    </button>
                  </header>

                  <form onSubmit={handleCreateSubmit} className='flex flex-col min-h-0 flex-1'>
                    <div className='min-h-0 flex-1 overflow-y-auto p-6 space-y-4'>
                      {createError && (
                        <div className='flex items-center gap-2 rounded-xl bg-destructive/10 p-4 text-sm font-semibold text-destructive'>
                          <MaterialIcon name='error' className='shrink-0 text-xl' />
                          <span>{createError}</span>
                        </div>
                      )}

                      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                        <div className='flex flex-col gap-1.5'>
                          <label htmlFor='create-name' className='text-xs font-bold uppercase tracking-wider text-muted-foreground'>
                            Tên sản phẩm <span className='text-destructive'>*</span>
                          </label>
                          <input
                            id='create-name'
                            type='text'
                            required
                            placeholder='Nhập tên sản phẩm'
                            value={createForm.name}
                            onChange={(e) => setCreateForm((prev) => ({ ...prev, name: e.target.value }))}
                            className='h-11 w-full rounded-xl border border-input bg-card px-4 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring transition-colors'
                          />
                        </div>

                        <div className='flex flex-col gap-1.5'>
                          <label htmlFor='create-price' className='text-xs font-bold uppercase tracking-wider text-muted-foreground'>
                            Đơn giá (VNĐ) <span className='text-destructive'>*</span>
                          </label>
                          <input
                            id='create-price'
                            type='number'
                            required
                            min='0'
                            value={createForm.price}
                            onChange={(e) => setCreateForm((prev) => ({ ...prev, price: Number(e.target.value) }))}
                            className='h-11 w-full rounded-xl border border-input bg-card px-4 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring transition-colors'
                          />
                        </div>
                      </div>

                      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                        <div className='flex flex-col gap-1.5'>
                          <label htmlFor='create-brand' className='text-xs font-bold uppercase tracking-wider text-muted-foreground'>
                            Thương hiệu <span className='text-destructive'>*</span>
                          </label>
                          <input
                            id='create-brand'
                            type='text'
                            required
                            placeholder='Whiskas, Pedigree, etc.'
                            value={createForm.brandName}
                            onChange={(e) => setCreateForm((prev) => ({ ...prev, brandName: e.target.value }))}
                            className='h-11 w-full rounded-xl border border-input bg-card px-4 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring transition-colors'
                          />
                        </div>

                        <div className='flex flex-col gap-1.5'>
                          <label htmlFor='create-category' className='text-xs font-bold uppercase tracking-wider text-muted-foreground'>
                            Danh mục
                          </label>
                          <div className='relative'>
                            <select
                              id='create-category'
                              value={createForm.categoryId || ''}
                              onChange={(e) => setCreateForm((prev) => ({ ...prev, categoryId: e.target.value ? Number(e.target.value) : undefined }))}
                              className='h-11 w-full appearance-none rounded-xl border border-input bg-card pl-4 pr-10 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring transition-colors cursor-pointer'
                            >
                              <option value=''>-- Chọn danh mục --</option>
                              {categories.map((cat) => (
                                <option key={cat.categoryId} value={cat.categoryId}>
                                  {cat.name}
                                </option>
                              ))}
                            </select>
                            <MaterialIcon
                              name='expand_more'
                              className='pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground'
                            />
                          </div>
                        </div>
                      </div>

                      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                        <div className='flex flex-col gap-1.5'>
                          <label htmlFor='create-stock' className='text-xs font-bold uppercase tracking-wider text-muted-foreground'>
                            Tồn kho
                          </label>
                          <input
                            id='create-stock'
                            type='number'
                            min='0'
                            value={createForm.totalStock}
                            onChange={(e) => setCreateForm((prev) => ({ ...prev, totalStock: Number(e.target.value) }))}
                            className='h-11 w-full rounded-xl border border-input bg-card px-4 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring transition-colors'
                          />
                        </div>

                        <div className='flex flex-col gap-1.5'>
                          <label htmlFor='create-status' className='text-xs font-bold uppercase tracking-wider text-muted-foreground'>
                            Trạng thái <span className='text-destructive'>*</span>
                          </label>
                          <div className='relative'>
                            <select
                              id='create-status'
                              required
                              value={createForm.status}
                              onChange={(e) => setCreateForm((prev) => ({ ...prev, status: e.target.value as 'ACTIVE' | 'INACTIVE' }))}
                              className='h-11 w-full appearance-none rounded-xl border border-input bg-card pl-4 pr-10 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring transition-colors cursor-pointer'
                            >
                              <option value='ACTIVE'>ACTIVE (Đang kinh doanh)</option>
                              <option value='INACTIVE'>INACTIVE (Ngừng kinh doanh)</option>
                            </select>
                            <MaterialIcon
                              name='expand_more'
                              className='pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground'
                            />
                          </div>
                        </div>
                      </div>

                      {/* Upload Image Section */}
                      <div className='flex flex-col gap-3.5 border-t border-border pt-4'>
                        <h3 className='text-xs font-bold uppercase tracking-wider text-primary'>
                          Hình ảnh sản phẩm
                        </h3>

                        {/* Previews with remove functionality */}
                        {createImagePreviews.length > 0 && (
                          <div className='flex flex-col gap-1.5'>
                            <span className='text-xs font-bold text-muted-foreground'>
                              Hình ảnh đã chọn
                            </span>
                            <div className='flex flex-wrap gap-2'>
                              {createImagePreviews.map((url, idx) => (
                                <div key={idx} className='relative group h-16 w-16 rounded-xl border border-border bg-muted overflow-hidden shadow-sm'>
                                  <img
                                    src={url}
                                    alt='preview'
                                    className='h-full w-full object-cover'
                                  />
                                  <button
                                    type='button'
                                    onClick={() => removeCreateImage(idx)}
                                    className='absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity text-white rounded-xl'
                                  >
                                    <MaterialIcon name='delete' className='text-lg' />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className='flex flex-col gap-1.5'>
                          <span className='text-xs font-bold text-muted-foreground'>
                            Tải lên hình ảnh mới
                          </span>
                          <label className='flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/20 transition-all hover:bg-muted/50 hover:border-primary/50'>
                            <div className='flex flex-col items-center justify-center pb-2 pt-2 text-center px-4'>
                              <MaterialIcon name='cloud_upload' className='text-3xl text-muted-foreground' />
                              <p className='text-xs text-muted-foreground mt-2 font-semibold'>Chọn tệp hình ảnh để tải lên</p>
                              <p className='text-[10px] text-muted-foreground/80 mt-1'>Định dạng JPG, PNG tối đa 5MB</p>
                            </div>
                            <input
                              type='file'
                              multiple
                              accept='image/*'
                              className='hidden'
                              onChange={handleCreateImageChange}
                            />
                          </label>
                        </div>
                      </div>

                      <div className='flex flex-col gap-1.5 border-t border-border pt-4'>
                        <label htmlFor='create-desc' className='text-xs font-bold uppercase tracking-wider text-muted-foreground'>
                          Mô tả sản phẩm
                        </label>
                        <textarea
                          id='create-desc'
                          rows={4}
                          placeholder='Mô tả thông tin chi tiết về sản phẩm...'
                          value={createForm.description}
                          onChange={(e) => setCreateForm((prev) => ({ ...prev, description: e.target.value }))}
                          className='w-full rounded-xl border border-input bg-card p-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring transition-colors resize-y'
                        />
                      </div>
                    </div>

                    <footer className='flex justify-end gap-3 border-t border-border bg-muted/40 px-6 py-4 shrink-0'>
                      <button
                        type='button'
                        disabled={isCreating}
                        onClick={() => setIsCreateModalOpen(false)}
                        className='h-11 rounded-full border border-border bg-card px-6 text-sm font-bold text-card-foreground hover:bg-muted transition-colors disabled:opacity-50'
                      >
                        Hủy
                      </button>
                      <button
                        type='submit'
                        disabled={isCreating}
                        className='h-11 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-bold text-primary-foreground shadow-sm hover:opacity-90 transition-all disabled:opacity-50'
                      >
                        {isCreating ? (
                          <div className='h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent' />
                        ) : (
                          <MaterialIcon name='save' className='text-lg' />
                        )}
                        <span>Lưu sản phẩm</span>
                      </button>
                    </footer>
                  </form>
                </section>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
