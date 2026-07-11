// app/features/staff/pages/staff-returns-page.tsx
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { StaffSidebar } from '../components/layout/staff-sidebar'
import { StaffTopNav } from '../components/layout/staff-top-nav'
import { MaterialIcon } from '~/shared/ui'
import { cn } from '~/shared/lib/cn'
import { fetchReturnsApi, fetchReturnDetailApi } from '../services/returns/returns-api'
import type { ManagementReturnResponse } from '~/shared/lib/returns'
import { StaffReturnDetailDialog } from '../components/returns/staff-return-detail-dialog'

export function StaffReturnsPage() {
  const { t } = useTranslation('staff')
  const [returnRequests, setReturnRequests] = useState<ManagementReturnResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [totalElements, setTotalElements] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [currentPage, setCurrentPage] = useState(0)

  // Filter States
  const [keyword, setKeyword] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [typeFilter, setTypeFilter] = useState('ALL')
  const [refundMethodFilter, setRefundMethodFilter] = useState('ALL')

  // Statistics counters
  const [stats, setStats] = useState({
    all: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    completed: 0,
    cancelled: 0
  })

  // Selected item for details modal
  const [selectedReturn, setSelectedReturn] = useState<ManagementReturnResponse | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  async function loadData() {
    setIsLoading(true)
    try {
      const res = await fetchReturnsApi({
        page: currentPage,
        size: 10,
        sort: 'createdAt,desc',
        status: statusFilter === 'ALL' ? undefined : statusFilter,
        type: typeFilter === 'ALL' ? undefined : typeFilter,
        refundMethod: refundMethodFilter === 'ALL' ? undefined : refundMethodFilter,
        keyword: keyword || undefined
      })

      if (res.success && res.data) {
        setReturnRequests(res.data.content)
        setTotalElements(res.data.totalElements)
        setTotalPages(res.data.totalPages)
      }

      // Fetch all to update counters
      const allRes = await fetchReturnsApi({ page: 0, size: 1000 })
      if (allRes.success && allRes.data) {
        const allItems = allRes.data.content
        setStats({
          all: allItems.length,
          pending: allItems.filter((r) => r.status === 'PENDING').length,
          approved: allItems.filter((r) => r.status === 'APPROVED').length,
          rejected: allItems.filter((r) => r.status === 'REJECTED').length,
          completed: allItems.filter((r) => r.status === 'COMPLETED').length,
          cancelled: allItems.filter((r) => r.status === 'CANCELLED').length
        })
      }
    } catch (err) {
      console.error('Failed to load return requests data', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, statusFilter, typeFilter, refundMethodFilter])

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault()
    setCurrentPage(0)
    void loadData()
  }

  function handleClearFilters() {
    setKeyword('')
    setStatusFilter('ALL')
    setTypeFilter('ALL')
    setRefundMethodFilter('ALL')
    setCurrentPage(0)
  }

  async function handleOpenDetail(returnId: number) {
    try {
      const res = await fetchReturnDetailApi(returnId)
      if (res.success && res.data) {
        setSelectedReturn(res.data)
        setIsDetailOpen(true)
      } else {
        alert(res.message || 'Không thể tải chi tiết yêu cầu')
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Lỗi hệ thống khi tải chi tiết yêu cầu')
    }
  }

  function handleDetailSuccess() {
    setIsDetailOpen(false)
    setSelectedReturn(null)
    void loadData()
  }

  function getStatusBadgeClassName(status: string) {
    switch (status) {
      case 'PENDING':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
      case 'APPROVED':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
      case 'REJECTED':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400'
      case 'CANCELLED':
        return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400'
      case 'COMPLETED':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
      default:
        return 'bg-muted text-muted-foreground'
    }
  }

  function getStatusLabel(status: string) {
    switch (status) {
      case 'PENDING':
        return t('returns.stats.pending')
      case 'APPROVED':
        return t('returns.stats.approved')
      case 'REJECTED':
        return t('returns.stats.rejected')
      case 'CANCELLED':
        return t('returns.stats.cancelled')
      case 'COMPLETED':
        return t('returns.stats.completed')
      default:
        return status
    }
  }

  function getTypeLabel(type: string) {
    switch (type) {
      case 'RETURN':
        return 'Hoàn trả'
      case 'EXCHANGE':
        return 'Đổi hàng'
      default:
        return type
    }
  }

  function getRefundMethodLabel(method: string) {
    switch (method) {
      case 'STRIPE_PAYMENT':
        return 'TK gốc thanh toán'
      case 'BANK_TRANSFER':
        return 'Chuyển khoản'
      default:
        return method || '—'
    }
  }

  function formatPrice(value: number) {
    return `${new Intl.NumberFormat('vi-VN').format(value)}đ`
  }

  function formatDate(dateString: string) {
    if (!dateString) return ''
    const d = new Date(dateString)
    if (isNaN(d.getTime())) return dateString
    const dd = String(d.getDate()).padStart(2, '0')
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const yyyy = d.getFullYear()
    const hh = String(d.getHours()).padStart(2, '0')
    const min = String(d.getMinutes()).padStart(2, '0')
    return `${hh}:${min} ${dd}/${mm}/${yyyy}`
  }

  return (
    <div className='flex h-screen overflow-hidden bg-background text-foreground'>
      <StaffSidebar activeItem='returns' />
      <div className='flex min-w-0 flex-1 flex-col overflow-hidden'>
        <StaffTopNav titleKey='returns.title' subtitleKey='returns.subtitle' />
        <main className='flex-1 overflow-y-auto p-4 md:p-6'>
          <div className='mx-auto flex max-w-7xl flex-col gap-6'>
            {/* Breadcrumb & Title */}
            <section className='flex flex-col gap-2 border-b border-border pb-4'>
              <div className='flex items-center gap-2 text-xs font-semibold text-muted-foreground'>
                <span>{t('returns.breadcrumb.ops')}</span>
                <MaterialIcon name='chevron_right' className='text-sm' />
                <span className='text-primary'>{t('returns.breadcrumb.current')}</span>
              </div>
              <h1 className='font-display text-2xl font-bold text-card-foreground md:text-3xl'>
                {t('returns.title')}
              </h1>
              <p className='text-muted-foreground text-sm'>{t('returns.subtitle')}</p>
            </section>

            {/* Statistics Cards */}
            <section className='grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5'>
              <div
                onClick={() => setStatusFilter('ALL')}
                className={cn(
                  'rounded-2xl border border-border bg-card p-4 shadow-sm hover:shadow transition-all duration-200 cursor-pointer active:scale-98',
                  statusFilter === 'ALL' && 'ring-2 ring-primary ring-offset-2'
                )}
              >
                <div className='flex items-center justify-between text-muted-foreground'>
                  <span className='text-xs font-bold uppercase tracking-wider'>{t('returns.stats.all')}</span>
                  <MaterialIcon name='assignment' className='text-xl text-primary' />
                </div>
                <p className='mt-2 text-3xl font-extrabold text-card-foreground'>{stats.all}</p>
              </div>

              <div
                onClick={() => setStatusFilter('PENDING')}
                className={cn(
                  'rounded-2xl border border-border bg-card p-4 shadow-sm hover:shadow transition-all duration-200 cursor-pointer active:scale-98',
                  statusFilter === 'PENDING' && 'ring-2 ring-amber-500 ring-offset-2'
                )}
              >
                <div className='flex items-center justify-between text-muted-foreground'>
                  <span className='text-xs font-bold uppercase tracking-wider'>{t('returns.stats.pending')}</span>
                  <span className='h-2.5 w-2.5 rounded-full bg-amber-500' />
                </div>
                <p className='mt-2 text-3xl font-extrabold text-card-foreground'>{stats.pending}</p>
              </div>

              <div
                onClick={() => setStatusFilter('APPROVED')}
                className={cn(
                  'rounded-2xl border border-border bg-card p-4 shadow-sm hover:shadow transition-all duration-200 cursor-pointer active:scale-98',
                  statusFilter === 'APPROVED' && 'ring-2 ring-blue-500 ring-offset-2'
                )}
              >
                <div className='flex items-center justify-between text-muted-foreground'>
                  <span className='text-xs font-bold uppercase tracking-wider'>{t('returns.stats.approved')}</span>
                  <span className='h-2.5 w-2.5 rounded-full bg-blue-500' />
                </div>
                <p className='mt-2 text-3xl font-extrabold text-card-foreground'>{stats.approved}</p>
              </div>

              <div
                onClick={() => setStatusFilter('COMPLETED')}
                className={cn(
                  'rounded-2xl border border-border bg-card p-4 shadow-sm hover:shadow transition-all duration-200 cursor-pointer active:scale-98',
                  statusFilter === 'COMPLETED' && 'ring-2 ring-emerald-500 ring-offset-2'
                )}
              >
                <div className='flex items-center justify-between text-muted-foreground'>
                  <span className='text-xs font-bold uppercase tracking-wider'>{t('returns.stats.completed')}</span>
                  <span className='h-2.5 w-2.5 rounded-full bg-emerald-500' />
                </div>
                <p className='mt-2 text-3xl font-extrabold text-card-foreground'>{stats.completed}</p>
              </div>

              <div
                onClick={() => setStatusFilter('REJECTED')}
                className={cn(
                  'rounded-2xl border border-border bg-card p-4 shadow-sm hover:shadow transition-all duration-200 cursor-pointer active:scale-98',
                  statusFilter === 'REJECTED' && 'ring-2 ring-rose-500 ring-offset-2'
                )}
              >
                <div className='flex items-center justify-between text-muted-foreground'>
                  <span className='text-xs font-bold uppercase tracking-wider'>{t('returns.stats.rejected')}</span>
                  <span className='h-2.5 w-2.5 rounded-full bg-rose-500' />
                </div>
                <p className='mt-2 text-3xl font-extrabold text-card-foreground'>{stats.rejected}</p>
              </div>
            </section>

            {/* Filter and Search Bar */}
            <section className='rounded-2xl border border-border bg-card p-4 shadow-sm'>
              <form onSubmit={handleSearchSubmit} className='space-y-4'>
                <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
                  {/* Search Input */}
                  <div className='relative flex items-center'>
                    <span className='absolute left-3.5 text-muted-foreground'>
                      <MaterialIcon name='search' className='text-lg' />
                    </span>
                    <input
                      type='text'
                      value={keyword}
                      onChange={(e) => setKeyword(e.target.value)}
                      placeholder={t('returns.filters.searchPlaceholder')}
                      className='w-full rounded-xl border border-border bg-card py-2 pl-10 pr-4 text-sm text-foreground focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all'
                    />
                  </div>

                  {/* Status Dropdown */}
                  <div className='flex items-center gap-2'>
                    <label htmlFor='filter-status' className='text-xs font-semibold text-muted-foreground shrink-0'>
                      {t('returns.filters.status')}:
                    </label>
                    <select
                      id='filter-status'
                      value={statusFilter}
                      onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(0); }}
                      className='w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground focus:ring-1 focus:ring-primary outline-none'
                    >
                      <option value='ALL'>{t('returns.filters.all')}</option>
                      <option value='PENDING'>{t('returns.stats.pending')}</option>
                      <option value='APPROVED'>{t('returns.stats.approved')}</option>
                      <option value='REJECTED'>{t('returns.stats.rejected')}</option>
                      <option value='COMPLETED'>{t('returns.stats.completed')}</option>
                      <option value='CANCELLED'>{t('returns.stats.cancelled')}</option>
                    </select>
                  </div>

                  {/* Request Type Dropdown */}
                  <div className='flex items-center gap-2'>
                    <label htmlFor='filter-type' className='text-xs font-semibold text-muted-foreground shrink-0'>
                      {t('returns.filters.type')}:
                    </label>
                    <select
                      id='filter-type'
                      value={typeFilter}
                      onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(0); }}
                      className='w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground focus:ring-1 focus:ring-primary outline-none'
                    >
                      <option value='ALL'>{t('returns.filters.all')}</option>
                      <option value='RETURN'>Hoàn trả</option>
                      <option value='EXCHANGE'>Đổi hàng</option>
                    </select>
                  </div>

                  {/* Refund Method Dropdown */}
                  <div className='flex items-center gap-2'>
                    <label htmlFor='filter-refund' className='text-xs font-semibold text-muted-foreground shrink-0'>
                      Thanh toán:
                    </label>
                    <select
                      id='filter-refund'
                      value={refundMethodFilter}
                      onChange={(e) => { setRefundMethodFilter(e.target.value); setCurrentPage(0); }}
                      className='w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground focus:ring-1 focus:ring-primary outline-none'
                    >
                      <option value='ALL'>{t('returns.filters.all')}</option>
                      <option value='STRIPE_PAYMENT'>Thanh toán tài khoản gốc</option>
                      <option value='BANK_TRANSFER'>Thanh toán tài khoản khác</option>
                    </select>
                  </div>
                </div>

                <div className='flex items-center justify-end gap-3 border-t border-border pt-4'>
                  <button
                    type='button'
                    onClick={handleClearFilters}
                    className='inline-flex h-9 items-center justify-center gap-1.5 rounded-full border border-border bg-card px-4 text-xs font-bold text-card-foreground hover:bg-muted active:scale-95 transition-all'
                  >
                    <MaterialIcon name='filter_alt_off' className='text-base' />
                    {t('returns.filters.clear')}
                  </button>
                  <button
                    type='submit'
                    className='inline-flex h-9 items-center justify-center gap-1.5 rounded-full bg-primary px-5 text-xs font-bold text-white shadow-sm hover:opacity-90 active:scale-95 transition-all'
                  >
                    <MaterialIcon name='search' className='text-base' />
                    Tìm kiếm
                  </button>
                </div>
              </form>
            </section>

            {/* Return Requests Table */}
            <section className='overflow-hidden rounded-2xl border border-border bg-card shadow-sm'>
              {isLoading ? (
                <div className='p-12 text-center text-muted-foreground animate-pulse font-semibold'>
                  Đang tải danh sách yêu cầu đổi trả...
                </div>
              ) : returnRequests.length === 0 ? (
                <div className='p-12 text-center text-muted-foreground font-semibold'>
                  {t('returns.table.empty')}
                </div>
              ) : (
                <div className='overflow-x-auto'>
                  <table className='w-full min-w-[1000px] border-collapse text-left text-sm'>
                    <thead>
                      <tr className='border-b border-border bg-muted/50 text-xs font-bold uppercase tracking-wide text-muted-foreground'>
                        <th className='px-6 py-4'>{t('returns.table.columns.code')}</th>
                        <th className='px-6 py-4'>{t('returns.table.columns.order')}</th>
                        <th className='px-6 py-4'>{t('returns.table.columns.customer')}</th>
                        <th className='px-6 py-4'>{t('returns.table.columns.type')}</th>
                        <th className='px-6 py-4'>{t('returns.table.columns.refund')}</th>
                        <th className='px-6 py-4'>{t('returns.table.columns.status')}</th>
                        <th className='px-6 py-4'>{t('returns.table.columns.createdAt')}</th>
                        <th className='px-6 py-4 text-right'>{t('returns.table.columns.actions')}</th>
                      </tr>
                    </thead>
                    <tbody className='divide-y divide-border'>
                      {returnRequests.map((req) => (
                        <tr key={req.returnRequestId} className='transition-colors hover:bg-muted/30'>
                          <td className='px-6 py-4 font-bold text-primary'>#{req.returnCode}</td>
                          <td className='px-6 py-4 text-muted-foreground font-medium'>#{req.orderCode}</td>
                          <td className='px-6 py-4'>
                            <p className='font-semibold text-card-foreground'>
                              {req.requestedBy?.fullName || 'Mock Customer'}
                            </p>
                            <p className='text-xs text-muted-foreground'>{req.requestedBy?.email}</p>
                          </td>
                          <td className='px-6 py-4 font-semibold text-card-foreground'>
                            {getTypeLabel(req.type)}
                          </td>
                          <td className='px-6 py-4'>
                            {req.type === 'RETURN' ? (
                              <>
                                <p className='font-semibold text-card-foreground'>
                                  {formatPrice(req.refundAmount)}
                                </p>
                                <p className='text-xs text-muted-foreground'>
                                  {getRefundMethodLabel(req.refundMethod)}
                                </p>
                              </>
                            ) : (
                              <span className='text-xs text-muted-foreground italic'>— Không hoàn tiền —</span>
                            )}
                          </td>
                          <td className='px-6 py-4'>
                            <span
                              className={cn(
                                'inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider',
                                getStatusBadgeClassName(req.status)
                              )}
                            >
                              {getStatusLabel(req.status)}
                            </span>
                          </td>
                          <td className='px-6 py-4 text-xs text-muted-foreground'>
                            {formatDate(req.createdAt)}
                          </td>
                          <td className='px-6 py-4 text-right'>
                            {(req.status === 'PENDING' || req.status === 'APPROVED') ? (
                              <button
                                type='button'
                                onClick={() => void handleOpenDetail(req.returnRequestId)}
                                className='inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:opacity-90 active:scale-95 transition-all'
                              >
                                <MaterialIcon name='edit_note' className='text-sm shrink-0' />
                                {t('returns.table.actions.process')}
                              </button>
                            ) : (
                              <button
                                type='button'
                                onClick={() => void handleOpenDetail(req.returnRequestId)}
                                className='inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-1.5 text-xs font-bold text-muted-foreground hover:bg-muted hover:text-foreground active:scale-95 transition-all'
                              >
                                <MaterialIcon name='visibility' className='text-sm shrink-0' />
                                {t('returns.table.actions.view')}
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination controls */}
              {totalPages > 1 && (
                <div className='flex items-center justify-between border-t border-border px-6 py-4 bg-muted/10'>
                  <span className='text-xs text-muted-foreground'>
                    Hiển thị trang <strong>{currentPage + 1}</strong> trên tổng số <strong>{totalPages}</strong> trang
                  </span>
                  <div className='flex items-center gap-2'>
                    <button
                      type='button'
                      disabled={currentPage === 0 || isLoading}
                      onClick={() => setCurrentPage((p) => p - 1)}
                      className='inline-flex h-9 items-center justify-center rounded-xl border border-border bg-card px-4 text-xs font-bold text-card-foreground hover:bg-muted active:scale-95 disabled:opacity-50 transition-all'
                    >
                      <MaterialIcon name='chevron_left' className='text-base' />
                      Trang trước
                    </button>
                    <button
                      type='button'
                      disabled={currentPage >= totalPages - 1 || isLoading}
                      onClick={() => setCurrentPage((p) => p + 1)}
                      className='inline-flex h-9 items-center justify-center rounded-xl border border-border bg-card px-4 text-xs font-bold text-card-foreground hover:bg-muted active:scale-95 disabled:opacity-50 transition-all'
                    >
                      Trang sau
                      <MaterialIcon name='chevron_right' className='text-base' />
                    </button>
                  </div>
                </div>
              )}
            </section>
          </div>
        </main>
      </div>

      {/* Detail & Process Modal */}
      {isDetailOpen && selectedReturn && (
        <StaffReturnDetailDialog
          returnRequest={selectedReturn}
          onClose={() => {
            setIsDetailOpen(false)
            setSelectedReturn(null)
          }}
          onSuccess={handleDetailSuccess}
        />
      )}
    </div>
  )
}
