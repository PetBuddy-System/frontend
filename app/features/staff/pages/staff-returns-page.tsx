// app/features/staff/pages/staff-returns-page.tsx
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { StaffSidebar } from '../components/layout/staff-sidebar'
import { StaffTopNav } from '../components/layout/staff-top-nav'
import { MaterialIcon } from '~/shared/ui'
import { cn } from '~/shared/lib/cn'
import { fetchReturnsApi, fetchReturnDetailApi } from '../services/returns/returns-api'
import type { ManagementReturnResponse, ReturnStatistics } from '~/shared/lib/returns'
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

  // Statistics counters (display-only from backend statistics object)
  const [stats, setStats] = useState<ReturnStatistics>({
    totalRequests: 0,
    assigned: 0,
    pending: 0,
    approved: 0,
    completed: 0,
    rejected: 0
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
        const page = res.data.returns
        const statistics = res.data.statistics

        setReturnRequests(page?.content ?? [])
        setTotalElements(page?.totalElements ?? 0)
        setTotalPages(page?.totalPages ?? 0)

        if (statistics) {
          setStats({
            totalRequests: statistics.totalRequests ?? 0,
            assigned: statistics.assigned ?? 0,
            pending: statistics.pending ?? 0,
            approved: statistics.approved ?? 0,
            completed: statistics.completed ?? 0,
            rejected: statistics.rejected ?? 0
          })
        }
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
      case 'PICKING_UP':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400'
      case 'PICKED_UP':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
      case 'PICKUP_FAILED':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400'
      case 'RETURNED_TO_STORE':
        return 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400'
      case 'READY_TO_DELIVER':
        return 'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-400'
      case 'DELIVERING':
        return 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-400'
      case 'DELIVERING_FAILED':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400'
      case 'COMPLETED':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
      case 'REJECTED':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400'
      case 'REJECTED_RETURN_SHIPPING':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
      case 'CANCELLED':
        return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400'
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
      case 'PICKING_UP':
        return t('returns.stats.pickingUp')
      case 'PICKED_UP':
        return t('returns.stats.pickedUp')
      case 'PICKUP_FAILED':
        return t('returns.stats.pickupFailed')
      case 'RETURNED_TO_STORE':
        return t('returns.stats.returnedToStore')
      case 'READY_TO_DELIVER':
        return t('returns.stats.readyToDeliver')
      case 'DELIVERING':
        return t('returns.stats.delivering')
      case 'DELIVERING_FAILED':
        return t('returns.stats.deliveryFailed')
      case 'COMPLETED':
        return t('returns.stats.completed')
      case 'REJECTED':
        return t('returns.stats.rejected')
      case 'REJECTED_RETURN_SHIPPING':
        return t('returns.stats.rejectedReturnShipping')
      case 'CANCELLED':
        return t('returns.stats.cancelled')
      default:
        return status
    }
  }

  function getTypeLabel(type: string) {
    return t(`returns.type.${type}`, type)
  }

  function getRefundMethodLabel(method: string) {
    return t(`returns.refundMethod.${method}`, method)
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
            <section className='grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6'>
              <div className='rounded-2xl border border-border bg-card p-4 shadow-sm'>
                <div className='flex items-center justify-between text-muted-foreground'>
                  <span className='text-xs font-bold uppercase tracking-wider'>{t('returns.stats.totalRequests')}</span>
                  <MaterialIcon name='assignment' className='text-xl text-primary' />
                </div>
                <p className='mt-2 text-3xl font-extrabold text-card-foreground'>{stats.totalRequests}</p>
              </div>

              <div className='rounded-2xl border border-border bg-card p-4 shadow-sm'>
                <div className='flex items-center justify-between text-muted-foreground'>
                  <span className='text-xs font-bold uppercase tracking-wider'>{t('returns.stats.assigned')}</span>
                  <span className='h-2.5 w-2.5 rounded-full bg-indigo-500' />
                </div>
                <p className='mt-2 text-3xl font-extrabold text-card-foreground'>{stats.assigned}</p>
              </div>

              <div className='rounded-2xl border border-border bg-card p-4 shadow-sm'>
                <div className='flex items-center justify-between text-muted-foreground'>
                  <span className='text-xs font-bold uppercase tracking-wider'>{t('returns.stats.pending')}</span>
                  <span className='h-2.5 w-2.5 rounded-full bg-amber-500' />
                </div>
                <p className='mt-2 text-3xl font-extrabold text-card-foreground'>{stats.pending}</p>
              </div>

              <div className='rounded-2xl border border-border bg-card p-4 shadow-sm'>
                <div className='flex items-center justify-between text-muted-foreground'>
                  <span className='text-xs font-bold uppercase tracking-wider'>{t('returns.stats.approved')}</span>
                  <span className='h-2.5 w-2.5 rounded-full bg-blue-500' />
                </div>
                <p className='mt-2 text-3xl font-extrabold text-card-foreground'>{stats.approved}</p>
              </div>

              <div className='rounded-2xl border border-border bg-card p-4 shadow-sm'>
                <div className='flex items-center justify-between text-muted-foreground'>
                  <span className='text-xs font-bold uppercase tracking-wider'>{t('returns.stats.completed')}</span>
                  <span className='h-2.5 w-2.5 rounded-full bg-emerald-500' />
                </div>
                <p className='mt-2 text-3xl font-extrabold text-card-foreground'>{stats.completed}</p>
              </div>

              <div className='rounded-2xl border border-border bg-card p-4 shadow-sm'>
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
                      <option value='PICKING_UP'>{t('returns.stats.pickingUp')}</option>
                      <option value='PICKED_UP'>{t('returns.stats.pickedUp')}</option>
                      <option value='PICKUP_FAILED'>{t('returns.stats.pickupFailed')}</option>
                      <option value='RETURNED_TO_STORE'>{t('returns.stats.returnedToStore')}</option>
                      <option value='READY_TO_DELIVER'>{t('returns.stats.readyToDeliver')}</option>
                      <option value='DELIVERING'>{t('returns.stats.delivering')}</option>
                      <option value='DELIVERING_FAILED'>{t('returns.stats.deliveryFailed')}</option>
                      <option value='COMPLETED'>{t('returns.stats.completed')}</option>
                      <option value='REJECTED'>{t('returns.stats.rejected')}</option>
                      <option value='REJECTED_RETURN_SHIPPING'>{t('returns.stats.rejectedReturnShipping')}</option>
                      <option value='CANCELLED'>{t('returns.stats.cancelled')}</option>
                    </select>
                  </div>

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
                      <option value='RETURN'>{t('returns.type.RETURN')}</option>
                      <option value='EXCHANGE'>{t('returns.type.EXCHANGE')}</option>
                    </select>
                  </div>

                  <div className='flex items-center gap-2'>
                    <label htmlFor='filter-refund' className='text-xs font-semibold text-muted-foreground shrink-0'>
                      {t('returns.filters.refundMethod')}:
                    </label>
                    <select
                      id='filter-refund'
                      value={refundMethodFilter}
                      onChange={(e) => { setRefundMethodFilter(e.target.value); setCurrentPage(0); }}
                      className='w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground focus:ring-1 focus:ring-primary outline-none'
                    >
                      <option value='ALL'>{t('returns.filters.all')}</option>
                      <option value='STRIPE_PAYMENT'>{t('returns.refundMethod.STRIPE_PAYMENT')}</option>
                      <option value='BANK_TRANSFER'>{t('returns.refundMethod.BANK_TRANSFER')}</option>
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
                    {t('returns.filters.keyword')}
                  </button>
                </div>
              </form>
            </section>

            {/* Return Requests Table */}
            <section className='overflow-hidden rounded-2xl border border-border bg-card shadow-sm'>
              {isLoading ? (
                <div className='p-12 text-center text-muted-foreground animate-pulse font-semibold'>
                  {t('returns.table.empty')}
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
                              {req.requestedBy?.fullName || 'Customer'}
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
                              <span className='text-xs text-muted-foreground'>{t('returns.refundStatus.NOT_REQUIRED')}</span>
                            )}
                          </td>
                          <td className='px-6 py-4'>
                            <div className='flex flex-col items-start gap-1'>
                              <span
                                className={cn(
                                  'inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider',
                                  getStatusBadgeClassName(req.status)
                                )}
                              >
                                {getStatusLabel(req.status)}
                              </span>
                              {/* ✅ Badge pickupFailedCount - chỉ hiển thị ở PICKUP_FAILED và PICKING_UP */}
                              {(req.status === 'PICKUP_FAILED' || req.status === 'PICKING_UP') &&
                                req.pickupFailedCount !== undefined && req.pickupFailedCount > 0 && (
                                  <span className='inline-flex items-center rounded-md bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-800 dark:bg-rose-950/40 dark:text-rose-400'>
                                    {t('returns.detail.pickupFailedBadge', { count: req.pickupFailedCount })}
                                  </span>
                                )}
                              {/* Badge deliveryFailedCount - chỉ hiển thị ở DELIVERING_FAILED và READY_TO_DELIVER */}
                              {(req.status === 'DELIVERING_FAILED' || req.status === 'READY_TO_DELIVER') &&
                                req.deliveryFailedCount !== undefined && req.deliveryFailedCount > 0 && (
                                  <span className='inline-flex items-center rounded-md bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-800 dark:bg-rose-950/40 dark:text-rose-400'>
                                    {t('returns.detail.deliveryFailedBadge', { count: req.deliveryFailedCount })}
                                  </span>
                                )}
                            </div>
                          </td>
                          <td className='px-6 py-4 text-xs text-muted-foreground'>
                            {formatDate(req.createdAt)}
                          </td>
                          <td className='px-6 py-4 text-right'>
                            <button
                              type='button'
                              onClick={() => void handleOpenDetail(req.returnRequestId)}
                              className='inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:opacity-90 active:scale-95 transition-all'
                            >
                              <MaterialIcon name='visibility' className='text-sm shrink-0' />
                              {t('returns.table.actions.view')}
                            </button>
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
                    {t('returns.pagination.showing', { page: currentPage + 1, total: totalPages })}
                  </span>
                  <div className='flex items-center gap-2'>
                    <button
                      type='button'
                      disabled={currentPage === 0 || isLoading}
                      onClick={() => setCurrentPage((p) => p - 1)}
                      className='inline-flex h-9 items-center justify-center rounded-xl border border-border bg-card px-4 text-xs font-bold text-card-foreground hover:bg-muted active:scale-95 disabled:opacity-50 transition-all'
                    >
                      <MaterialIcon name='chevron_left' className='text-base' />
                      {t('returns.pagination.prev')}
                    </button>
                    <button
                      type='button'
                      disabled={currentPage >= totalPages - 1 || isLoading}
                      onClick={() => setCurrentPage((p) => p + 1)}
                      className='inline-flex h-9 items-center justify-center rounded-xl border border-border bg-card px-4 text-xs font-bold text-card-foreground hover:bg-muted active:scale-95 disabled:opacity-50 transition-all'
                    >
                      {t('returns.pagination.next')}
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