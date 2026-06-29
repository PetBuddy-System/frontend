// app/features/manager/pages/manager-products-page.tsx
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { MaterialIcon } from '~/shared/ui'

import { ManagerSidebar } from '../components/layout/manager-sidebar'
import { ManagerTopNav } from '../components/layout/manager-top-nav'
import { ManagerProductsStatsGrid } from '../components/products/manager-products-stats-grid'
import { ManagerProductsTable } from '../components/products/manager-products-table'
import { ManagerProductsToolbar } from '../components/products/manager-products-toolbar'
import { ManagerCreateProductModal } from '../components/products/manager-create-product-modal'
import { ManagerEditProductModal } from '../components/products/manager-edit-product-modal'
import { ManagerImportProductsModal } from '../components/products/manager-import-products-modal'
import { ManagerProductDeleteDialog } from '../components/products/manager-product-delete-dialog' // ✅ Import thêm
import {
  fetchProductsManagementApi,
  fetchCategoriesApi,
  fetchProductStatsApi, // ✅ Import thêm
  updateProductApi, // ✅ Import thêm
} from '../services/product'
import type { ProductManagementItem, CategoryData } from '~/shared/lib/product'

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

  // Stats State
  const [stats, setStats] = useState({ inStock: 0, lowStock: 0 })
  const [isStatsLoading, setIsStatsLoading] = useState(true)

  // Edit & Refresh states
  const [editingProductId, setEditingProductId] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  // ✅ Delete Dialog states
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null)
  const [deletingProductName, setDeletingProductName] = useState('')
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
  const [isDeletingProduct, setIsDeletingProduct] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  // Modal states
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

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

  // Fetch PRODUCT STATS
  useEffect(() => {
    let active = true
    async function loadStats() {
      setIsStatsLoading(true)
      try {
        const statsData = await fetchProductStatsApi({
          keyword,
          categoryId: category !== 'all' ? Number(category) : undefined,
          status: status !== 'all' ? (status as 'ACTIVE' | 'INACTIVE' | 'DELETED') : undefined,
        })
        if (active) {
          setStats({
            inStock: statsData.inStock,
            lowStock: statsData.lowStock
          })
        }
      } catch (err) {
        console.error('Failed to load stats:', err)
      } finally {
        if (active) {
          setIsStatsLoading(false)
        }
      }
    }
    void loadStats()
    return () => {
      active = false
    }
  }, [keyword, category, status, refreshKey])

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

  // ✅ Xử lý mở dialog xóa
  const handleDelete = (productId: string) => {
    const product = products.find(p => p.productId === productId)
    if (product) {
      setDeletingProductId(productId)
      setDeletingProductName(product.name)
      setIsDeleteConfirmOpen(true)
      setDeleteError(null)
    }
  }

  // ✅ Xử lý xóa sản phẩm (soft delete)
  const handleDeleteProduct = async () => {
    if (!deletingProductId) return

    setIsDeletingProduct(true)
    setDeleteError(null)

    try {
      const product = products.find(p => p.productId === deletingProductId)
      const response = await updateProductApi(deletingProductId, {
        name: product?.name ?? '',
        price: product?.price ?? 0,
        brandName: product?.brandName ?? '',
        status: 'DELETED'
      })

      if (response.success) {
        setIsDeleteConfirmOpen(false)
        setDeletingProductId(null)
        setRefreshKey(prev => prev + 1) // Refresh lại danh sách
      } else {
        setDeleteError(response.message || 'Không thể xóa sản phẩm')
      }
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi xóa sản phẩm')
    } finally {
      setIsDeletingProduct(false)
    }
  }

  const handleView = (productId: string) => {
    window.location.href = `/manager/products/${productId}`
  }

  const handleCreateSuccess = () => {
    setIsCreateModalOpen(false)
    setRefreshKey((prev) => prev + 1)
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
                  onClick={() => setIsCreateModalOpen(true)}
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

            <ManagerProductsStatsGrid
              totalProducts={totalElements}
              inStock={stats.inStock}
              lowStock={stats.lowStock}
              isLoading={isStatsLoading}
            />

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
              onDeleteClick={handleDelete} // ✅ Đã sửa
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
              <ManagerCreateProductModal
                categories={categories}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={handleCreateSuccess}
              />
            )}

            {/* ✅ Delete Confirm Dialog */}
            <ManagerProductDeleteDialog
              productName={deletingProductName}
              isOpen={isDeleteConfirmOpen}
              isDeleting={isDeletingProduct}
              error={deleteError}
              onClose={() => {
                setIsDeleteConfirmOpen(false)
                setDeletingProductId(null)
                setDeleteError(null)
              }}
              onConfirm={handleDeleteProduct}
            />
          </div>
        </main>
      </div>
    </div>
  )
}