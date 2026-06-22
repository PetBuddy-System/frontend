import { useEffect, useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { StaffSidebar } from '../components/layout/staff-sidebar'
import { StaffTopNav } from '../components/layout/staff-top-nav'
import {
  fetchAllOrdersApi,
  updateOrderStatusApi,
  fetchPickingListApi,
  type StaffOrderResponse,
  type PickingItemResponse,
  type OrderStatus
} from '~/shared/lib/order'
import { MaterialIcon } from '~/shared/ui'
import { cn } from '~/shared/lib/cn'

function formatPrice(value: number) {
  if (value == null || isNaN(Number(value))) return '—'
  return `${new Intl.NumberFormat('vi-VN').format(Number(value))}đ`
}

function formatDate(dateStr: string) {
  if (!dateStr) return '—'
  // LocalDateTime from Java may arrive without timezone — treat as UTC
  const normalized = dateStr.includes('Z') || dateStr.includes('+') ? dateStr : dateStr + 'Z'
  const d = new Date(normalized)
  if (isNaN(d.getTime())) return dateStr
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1)
    .toString()
    .padStart(2, '0')}/${d.getFullYear()} - ${d.getHours().toString().padStart(2, '0')}:${d
    .getMinutes()
    .toString()
    .padStart(2, '0')}`
}

export function StaffOrdersPage() {
  const { t } = useTranslation('staff')
  const [orders, setOrders] = useState<StaffOrderResponse[]>([])
  const [stats, setStats] = useState({
    pending: 0,
    confirmed: 0,
    picking: 0,
    shipping: 0,
    completed: 0,
    canceled: 0
  })

  const [totalElements, setTotalElements] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [currentPage, setCurrentPage] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')

  // Detail Modal state
  const [selectedOrderForDetail, setSelectedOrderForDetail] = useState<StaffOrderResponse | null>(null)

  // Picking Modal state
  const [selectedOrderForPicking, setSelectedOrderForPicking] = useState<StaffOrderResponse | null>(null)
  const [pickingItems, setPickingItems] = useState<PickingItemResponse[]>([])
  const [isLoadingPicking, setIsLoadingPicking] = useState(false)

  // Load orders & recalculate counters
  async function loadData() {
    setIsLoading(true)
    try {
      // 1. Fetch paginated orders for list
      const res = await fetchAllOrdersApi({
        page: currentPage,
        size: 6,
        sort: 'createdAt,desc'
      })

      if (res.success && res.data) {
        setOrders(res.data.content)
        setTotalElements(res.data.totalElements)
        setTotalPages(res.data.totalPages)
      }

      // 2. Fetch all orders (large limit) to compute stats grid totals accurately
      const allRes = await fetchAllOrdersApi({
        page: 0,
        size: 1000
      })
      if (allRes.success && allRes.data) {
        const all = allRes.data.content
        setStats({
          pending: all.filter((o) => o.status === 'PENDING').length,
          confirmed: all.filter((o) => o.status === 'CONFIRMED').length,
          picking: all.filter((o) => o.status === 'PICKING').length,
          shipping: all.filter((o) => o.status === 'SHIPPING' || o.status === 'DELIVERED').length,
          completed: all.filter((o) => o.status === 'COMPLETED').length,
          canceled: all.filter((o) => o.status === 'CANCELED').length
        })
      }
    } catch (err) {
      console.error('Failed to load orders or statistics', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadData()
  }, [currentPage])

  // Search & Status filters locally on the loaded page, or refetch
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      // Status filter
      if (statusFilter !== 'ALL') {
        if (statusFilter === 'SHIPPING_DELIVERED') {
          if (o.status !== 'SHIPPING' && o.status !== 'DELIVERED') return false
        } else if (o.status !== statusFilter) {
          return false
        }
      }

      // Search queries (name, phone, order code)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        const codeMatch = o.orderCode?.toLowerCase().includes(query)
        const nameMatch = o.recipientName?.toLowerCase().includes(query)
        const phoneMatch = o.phoneNumber?.includes(query)
        return codeMatch || nameMatch || phoneMatch
      }

      return true
    })
  }, [orders, searchQuery, statusFilter])

  // Handle status transitions
  async function handleTransition(orderId: number, nextStatus: OrderStatus) {
    try {
      const res = await updateOrderStatusApi(orderId, nextStatus)
      if (res.success) {
        void loadData()
      } else {
        alert(res.message || 'Cập nhật trạng thái thất bại')
      }
    } catch (err: any) {
      alert(err.message || 'Có lỗi xảy ra khi cập nhật trạng thái')
    }
  }

  // Handle Picking Modal Open
  async function handleOpenPicking(order: StaffOrderResponse) {
    setSelectedOrderForPicking(order)
    setIsLoadingPicking(true)
    try {
      const res = await fetchPickingListApi(order.orderId)
      if (res.success && res.data) {
        setPickingItems(res.data)
      }
    } catch (err) {
      console.error('Failed to load picking list', err)
    } finally {
      setIsLoadingPicking(false)
    }
  }

  // Handle Picking Confirmation (transitions to SHIPPING)
  async function handleConfirmPicking() {
    if (!selectedOrderForPicking) return
    try {
      const res = await updateOrderStatusApi(selectedOrderForPicking.orderId, 'SHIPPING')
      if (res.success) {
        setSelectedOrderForPicking(null)
        setPickingItems([])
        void loadData()
      }
    } catch (err: any) {
      alert(err.message || 'Lỗi khi xác nhận lấy hàng')
    }
  }

  // Status badges formatter
  function renderStatusBadge(status: string) {
    switch (status) {
      case 'PENDING':
        return (
          <span className='inline-flex items-center gap-1.5 rounded-full bg-orange-100 px-3 py-1 text-xs font-bold uppercase text-orange-700 dark:bg-orange-950/40 dark:text-orange-400'>
            <span className='h-1.5 w-1.5 rounded-full bg-orange-700 dark:bg-orange-400' />
            Đang xử lý
          </span>
        )
      case 'CONFIRMED':
        return (
          <span className='inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs font-bold uppercase text-blue-700 dark:bg-blue-950/40 dark:text-blue-400'>
            <span className='h-1.5 w-1.5 rounded-full bg-blue-700 dark:bg-blue-400' />
            Đã xác nhận
          </span>
        )
      case 'PICKING':
        return (
          <span className='inline-flex items-center gap-1.5 rounded-full bg-cyan-100 px-3 py-1 text-xs font-bold uppercase text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-400'>
            <span className='h-1.5 w-1.5 rounded-full bg-cyan-700 dark:bg-cyan-400' />
            Đang lấy hàng
          </span>
        )
      case 'SHIPPING':
        return (
          <span className='inline-flex items-center gap-1.5 rounded-full bg-teal-100 px-3 py-1 text-xs font-bold uppercase text-teal-700 dark:bg-teal-950/40 dark:text-teal-400'>
            <span className='h-1.5 w-1.5 rounded-full bg-teal-700 dark:bg-teal-400' />
            Đang giao hàng
          </span>
        )
      case 'DELIVERED':
        return (
          <span className='inline-flex items-center gap-1.5 rounded-full bg-purple-100 px-3 py-1 text-xs font-bold uppercase text-purple-700 dark:bg-purple-950/40 dark:text-purple-400'>
            <span className='h-1.5 w-1.5 rounded-full bg-purple-700 dark:bg-purple-400' />
            Đã giao (Chờ nhận)
          </span>
        )
      case 'COMPLETED':
        return (
          <span className='inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-bold uppercase text-green-700 dark:bg-green-950/40 dark:text-green-400'>
            <span className='h-1.5 w-1.5 rounded-full bg-green-700 dark:bg-green-400' />
            Hoàn thành
          </span>
        )
      case 'CANCELED':
        return (
          <span className='inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-xs font-bold uppercase text-red-700 dark:bg-red-950/40 dark:text-red-400'>
            <span className='h-1.5 w-1.5 rounded-full bg-red-700 dark:bg-red-400' />
            Đã hủy
          </span>
        )
      default:
        return (
          <span className='inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs font-bold uppercase text-gray-700'>
            <span className='h-1.5 w-1.5 rounded-full bg-gray-700' />
            {status}
          </span>
        )
    }
  }

  return (
    <div className='flex h-screen overflow-hidden bg-background text-foreground'>
      <StaffSidebar activeItem='orders' />

      <div className='flex min-w-0 flex-1 flex-col overflow-hidden'>
        <StaffTopNav titleKey='Mục đơn hàng' subtitleKey='Theo dõi và xử lý các đơn hàng trong ngày' />

        <main className='flex-1 overflow-y-auto p-4 md:p-6 pb-20'>
          <div className='mx-auto flex max-w-7xl flex-col gap-6'>
            {/* Header section with description */}
            <div className='flex justify-between items-end'>
              <div>
                <h2 className='font-display text-2xl font-bold text-foreground mb-1'>Danh sách đơn hàng</h2>
                <p className='text-sm text-muted-foreground'>Theo dõi và xử lý các đơn hàng của hệ thống.</p>
              </div>
            </div>

            {/* Stats Bento Grid */}
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6'>
              {/* Card 1: Pending */}
              <button
                onClick={() => setStatusFilter(statusFilter === 'PENDING' ? 'ALL' : 'PENDING')}
                className={cn(
                  'flex flex-col justify-between rounded-2xl border bg-card p-4 text-left transition-all hover:scale-[1.02] hover:border-primary',
                  statusFilter === 'PENDING' ? 'border-primary ring-2 ring-ring' : 'border-border'
                )}
              >
                <div className='flex justify-between items-start w-full mb-4'>
                  <div className='rounded-xl bg-orange-100 p-2 text-orange-600 dark:bg-orange-950/50 dark:text-orange-400'>
                    <MaterialIcon name='pending_actions' className='text-[22px]' />
                  </div>
                  <span className='text-[10px] font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400'>Chờ xử lý</span>
                </div>
                <div>
                  <span className='text-3xl font-extrabold text-foreground'>{stats.pending}</span>
                  <span className='block text-xs text-muted-foreground mt-0.5'>Đơn hàng mới</span>
                </div>
              </button>

              {/* Card 2: Confirmed */}
              <button
                onClick={() => setStatusFilter(statusFilter === 'CONFIRMED' ? 'ALL' : 'CONFIRMED')}
                className={cn(
                  'flex flex-col justify-between rounded-2xl border bg-card p-4 text-left transition-all hover:scale-[1.02] hover:border-primary',
                  statusFilter === 'CONFIRMED' ? 'border-primary ring-2 ring-ring' : 'border-border'
                )}
              >
                <div className='flex justify-between items-start w-full mb-4'>
                  <div className='rounded-xl bg-blue-100 p-2 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400'>
                    <MaterialIcon name='check_circle' className='text-[22px]' />
                  </div>
                  <span className='text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400'>Đã xác nhận</span>
                </div>
                <div>
                  <span className='text-3xl font-extrabold text-foreground'>{stats.confirmed}</span>
                  <span className='block text-xs text-muted-foreground mt-0.5'>Đang soạn kho</span>
                </div>
              </button>

              {/* Card 3: Picking */}
              <button
                onClick={() => setStatusFilter(statusFilter === 'PICKING' ? 'ALL' : 'PICKING')}
                className={cn(
                  'flex flex-col justify-between rounded-2xl border bg-card p-4 text-left transition-all hover:scale-[1.02] hover:border-primary',
                  statusFilter === 'PICKING' ? 'border-primary ring-2 ring-ring' : 'border-border'
                )}
              >
                <div className='flex justify-between items-start w-full mb-4'>
                  <div className='rounded-xl bg-cyan-100 p-2 text-cyan-600 dark:bg-cyan-950/50 dark:text-cyan-400'>
                    <MaterialIcon name='inventory_2' className='text-[22px]' />
                  </div>
                  <span className='text-[10px] font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400'>Đang lấy hàng</span>
                </div>
                <div>
                  <span className='text-3xl font-extrabold text-foreground'>{stats.picking}</span>
                  <span className='block text-xs text-muted-foreground mt-0.5'>Chờ lấy hàng</span>
                </div>
              </button>

              {/* Card 4: Shipping/Delivered */}
              <button
                onClick={() => setStatusFilter(statusFilter === 'SHIPPING_DELIVERED' ? 'ALL' : 'SHIPPING_DELIVERED')}
                className={cn(
                  'flex flex-col justify-between rounded-2xl border bg-card p-4 text-left transition-all hover:scale-[1.02] hover:border-primary',
                  statusFilter === 'SHIPPING_DELIVERED' ? 'border-primary ring-2 ring-ring' : 'border-border'
                )}
              >
                <div className='flex justify-between items-start w-full mb-4'>
                  <div className='rounded-xl bg-teal-100 p-2 text-teal-600 dark:bg-teal-950/50 dark:text-teal-400'>
                    <MaterialIcon name='local_shipping' className='text-[22px]' />
                  </div>
                  <span className='text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400'>Đang giao</span>
                </div>
                <div>
                  <span className='text-3xl font-extrabold text-foreground'>{stats.shipping}</span>
                  <span className='block text-xs text-muted-foreground mt-0.5'>Trên đường giao</span>
                </div>
              </button>

              {/* Card 5: Completed */}
              <button
                onClick={() => setStatusFilter(statusFilter === 'COMPLETED' ? 'ALL' : 'COMPLETED')}
                className={cn(
                  'flex flex-col justify-between rounded-2xl border bg-card p-4 text-left transition-all hover:scale-[1.02] hover:border-primary',
                  statusFilter === 'COMPLETED' ? 'border-primary ring-2 ring-ring' : 'border-border'
                )}
              >
                <div className='flex justify-between items-start w-full mb-4'>
                  <div className='rounded-xl bg-green-100 p-2 text-green-600 dark:bg-green-950/50 dark:text-green-400'>
                    <MaterialIcon name='task_alt' className='text-[22px]' />
                  </div>
                  <span className='text-[10px] font-bold uppercase tracking-wider text-green-600 dark:text-green-400'>Hoàn thành</span>
                </div>
                <div>
                  <span className='text-3xl font-extrabold text-foreground'>{stats.completed}</span>
                  <span className='block text-xs text-muted-foreground mt-0.5'>Đã hoàn tất</span>
                </div>
              </button>

              {/* Card 6: Canceled */}
              <button
                onClick={() => setStatusFilter(statusFilter === 'CANCELED' ? 'ALL' : 'CANCELED')}
                className={cn(
                  'flex flex-col justify-between rounded-2xl border bg-card p-4 text-left transition-all hover:scale-[1.02] hover:border-primary',
                  statusFilter === 'CANCELED' ? 'border-primary ring-2 ring-ring' : 'border-border'
                )}
              >
                <div className='flex justify-between items-start w-full mb-4'>
                  <div className='rounded-xl bg-red-100 p-2 text-red-600 dark:bg-red-950/50 dark:text-red-400'>
                    <MaterialIcon name='cancel' className='text-[22px]' />
                  </div>
                  <span className='text-[10px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400'>Đã hủy</span>
                </div>
                <div>
                  <span className='text-3xl font-extrabold text-foreground'>{stats.canceled}</span>
                  <span className='block text-xs text-muted-foreground mt-0.5'>Đã hủy ca</span>
                </div>
              </button>
            </div>

            {/* Table layout and filtering Controls */}
            <div className='rounded-2xl border border-border bg-card shadow-sm'>
              <div className='flex flex-col gap-4 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between'>
                <h3 className='font-display text-lg font-bold text-foreground'>Chi tiết đơn hàng</h3>
                <div className='flex flex-wrap items-center gap-3'>
                  {/* Search input */}
                  <div className='relative w-full sm:w-64'>
                    <MaterialIcon
                      name='search'
                      className='absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground'
                    />
                    <input
                      type='text'
                      placeholder='Tìm kiếm mã, tên...'
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className='w-full rounded-xl border border-border bg-background py-2 pl-9 pr-4 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-ring'
                    />
                  </div>

                  {/* Filter reset button */}
                  {(statusFilter !== 'ALL' || searchQuery) && (
                    <button
                      onClick={() => {
                        setStatusFilter('ALL')
                        setSearchQuery('')
                      }}
                      className='flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-sm font-semibold hover:bg-muted'
                    >
                      <MaterialIcon name='filter_list_off' className='text-[16px]' />
                      Xóa bộ lọc
                    </button>
                  )}
                </div>
              </div>

              {/* Table rendering */}
              <div className='overflow-x-auto'>
                <table className='w-full text-left text-sm'>
                  <thead className='border-b border-border bg-muted/40 font-semibold text-muted-foreground'>
                    <tr>
                      <th className='px-6 py-4'>Mã đơn hàng</th>
                      <th className='px-6 py-4'>Khách hàng</th>
                      <th className='px-6 py-4'>Số điện thoại</th>
                      <th className='px-6 py-4'>Ngày đặt</th>
                      <th className='px-6 py-4'>Tổng tiền</th>
                      <th className='px-6 py-4'>Trạng thái</th>
                      <th className='px-6 py-4 text-right'>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className='divide-y divide-border'>
                    {isLoading ? (
                      <tr>
                        <td colSpan={6} className='py-12 text-center text-muted-foreground'>
                          Đang tải danh sách đơn hàng...
                        </td>
                      </tr>
                    ) : filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={7} className='py-12 text-center text-muted-foreground'>
                          Không có đơn hàng nào khớp với điều kiện lọc.
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((order) => (
                        <tr key={order.orderId} className='group hover:bg-primary/5 transition-colors'>
                          <td className='px-6 py-4 font-bold text-primary'>#{order.orderCode}</td>
                          <td className='px-6 py-4'>
                            <div className='flex items-center gap-3'>
                              <div className='flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 font-bold text-primary text-xs uppercase'>
                                {order.recipientName?.slice(0, 2) || 'KH'}
                              </div>
                              <p className='font-semibold text-foreground'>{order.recipientName || '—'}</p>
                            </div>
                          </td>
                          <td className='px-6 py-4 text-muted-foreground'>{order.phoneNumber || '—'}</td>
                          <td className='px-6 py-4 text-muted-foreground'>{formatDate(order.createdAt)}</td>
                          <td className='px-6 py-4 font-bold text-foreground'>{formatPrice(order.totalAmount)}</td>
                          <td className='px-6 py-4'>{renderStatusBadge(order.status)}</td>
                          <td className='px-6 py-4 text-right'>
                            {/* View detail button — always visible */}
                            <button
                              onClick={() => setSelectedOrderForDetail(order)}
                              className='mr-1 rounded-lg p-2 text-muted-foreground hover:bg-muted'
                              title='Xem chi tiết đơn hàng'
                            >
                              <MaterialIcon name='visibility' className='text-[20px]' />
                            </button>
                            <div className='flex items-center justify-end gap-1 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity'>
                              {/* PENDING -> Confirm Receipt/Start processing */}
                              {order.status === 'PENDING' && (
                                <>
                                  <button
                                    onClick={() => handleTransition(order.orderId, 'CONFIRMED')}
                                    className='rounded-lg p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20'
                                    title='Xác nhận đơn hàng'
                                  >
                                    <MaterialIcon name='check' className='text-[20px]' />
                                  </button>
                                  <button
                                    onClick={() => handleTransition(order.orderId, 'CANCELED')}
                                    className='rounded-lg p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20'
                                    title='Hủy đơn hàng'
                                  >
                                    <MaterialIcon name='close' className='text-[20px]' />
                                  </button>
                                </>
                              )}

                              {/* CONFIRMED -> Move to picking */}
                              {order.status === 'CONFIRMED' && (
                                <>
                                  <button
                                    onClick={() => handleTransition(order.orderId, 'PICKING')}
                                    className='rounded-lg p-2 text-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-950/20'
                                    title='Bắt đầu lấy hàng'
                                  >
                                    <MaterialIcon name='inventory' className='text-[20px]' />
                                  </button>
                                  <button
                                    onClick={() => handleTransition(order.orderId, 'CANCELED')}
                                    className='rounded-lg p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20'
                                    title='Hủy đơn hàng'
                                  >
                                    <MaterialIcon name='close' className='text-[20px]' />
                                  </button>
                                </>
                              )}

                              {/* PICKING -> Show picking list */}
                              {order.status === 'PICKING' && (
                                <button
                                  onClick={() => void handleOpenPicking(order)}
                                  className='rounded-lg p-2 text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-950/20'
                                  title='Xem sản phẩm cần lấy'
                                >
                                  <MaterialIcon name='local_shipping' className='text-[20px]' />
                                </button>
                              )}

                              {/* SHIPPING -> Mark as delivered */}
                              {order.status === 'SHIPPING' && (
                                <button
                                  onClick={() => handleTransition(order.orderId, 'DELIVERED')}
                                  className='rounded-lg p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-950/20'
                                  title='Xác nhận giao hàng thành công'
                                >
                                  <MaterialIcon name='task_alt' className='text-[20px]' />
                                </button>
                              )}

                              {/* DELIVERED -> Waiting for customer */}
                              {order.status === 'DELIVERED' && (
                                <span className='text-xs italic text-muted-foreground px-2'>
                                  Chờ khách nhận
                                </span>
                              )}

                              {/* COMPLETED — no extra action, view detail handles it */}
                              {/* CANCELED — no extra action */}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Table pagination controls */}
              <div className='flex items-center justify-between border-t border-border bg-muted/20 px-5 py-4 text-xs font-semibold text-muted-foreground'>
                <span>
                  Hiển thị {filteredOrders.length > 0 ? currentPage * 6 + 1 : 0}-
                  {Math.min((currentPage + 1) * 6, totalElements)} của {totalElements} đơn hàng
                </span>
                <div className='flex items-center gap-1.5'>
                  <button
                    onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                    disabled={currentPage === 0 || isLoading}
                    className='rounded-lg border border-border p-1.5 hover:bg-muted active:scale-95 disabled:opacity-40 disabled:pointer-events-none'
                  >
                    <MaterialIcon name='chevron_left' className='text-[18px]' />
                  </button>
                  {Array.from({ length: totalPages }).map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentPage(idx)}
                      className={cn(
                        'h-7 w-7 rounded-lg text-xs transition-colors',
                        currentPage === idx
                          ? 'bg-primary font-bold text-primary-foreground'
                          : 'hover:bg-muted'
                      )}
                    >
                      {idx + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                    disabled={currentPage >= totalPages - 1 || isLoading}
                    className='rounded-lg border border-border p-1.5 hover:bg-muted active:scale-95 disabled:opacity-40 disabled:pointer-events-none'
                  >
                    <MaterialIcon name='chevron_right' className='text-[18px]' />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Picking Modal Dialog */}
      {selectedOrderForPicking && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm'>
          <div className='w-full max-w-xl overflow-hidden rounded-2xl border border-border bg-card shadow-2xl animate-in fade-in zoom-in-95 duration-200'>
            {/* Header */}
            <div className='flex items-center justify-between border-b border-border bg-muted/40 px-6 py-4'>
              <div>
                <h4 className='font-display text-lg font-bold text-foreground'>
                  Sản phẩm cần lấy (Picking List)
                </h4>
                <p className='text-xs text-muted-foreground mt-0.5'>
                  Đơn hàng #{selectedOrderForPicking.orderCode}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrderForPicking(null)}
                className='rounded-lg p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
              >
                <MaterialIcon name='close' />
              </button>
            </div>

            {/* Content list */}
            <div className='max-h-96 overflow-y-auto p-6 space-y-4'>
              {isLoadingPicking ? (
                <div className='py-8 text-center text-muted-foreground animate-pulse'>
                  Đang tải danh sách sản phẩm...
                </div>
              ) : pickingItems.length === 0 ? (
                <div className='py-8 text-center text-muted-foreground'>
                  Không có sản phẩm nào cần lấy.
                </div>
              ) : (
                <div className='divide-y divide-border'>
                  {pickingItems.map((item, idx) => (
                    <div key={idx} className={cn('py-3.5 flex items-center justify-between', idx === 0 && 'pt-0')}>
                      <div className='min-w-0 flex-1 pr-4'>
                        <p className='font-semibold text-foreground truncate'>{item.name}</p>
                        <p className='text-xs text-muted-foreground mt-1 flex items-center gap-1.5'>
                          <MaterialIcon name='event' className='text-[14px]' />
                          Hạn sử dụng: <span className='font-bold text-foreground'>{formatDate(item.expiryDate).split(' - ')[0]}</span>
                        </p>
                        <p className='text-xs text-muted-foreground mt-0.5 truncate'>
                          Mã SP: {item.productId}
                        </p>
                      </div>
                      <div className='flex items-center gap-2.5 shrink-0'>
                        <span className='text-xs text-muted-foreground'>Số lượng:</span>
                        <span className='flex h-8 min-w-[2rem] items-center justify-center rounded-lg bg-primary/10 px-2 font-display text-sm font-bold text-primary'>
                          {item.quantityToPick}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer action buttons */}
            <div className='flex items-center justify-end gap-3 border-t border-border bg-muted/40 px-6 py-4'>
              <button
                type='button'
                onClick={() => setSelectedOrderForPicking(null)}
                className='rounded-xl border border-border px-5 py-2.5 text-sm font-bold transition-colors hover:bg-muted'
              >
                Hủy bỏ
              </button>
              <button
                type='button'
                onClick={() => void handleConfirmPicking()}
                disabled={isLoadingPicking}
                className='rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-sm transition-opacity hover:opacity-90 disabled:opacity-50'
              >
                Xác nhận hoàn thành lấy hàng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrderForDetail && (
        <div
          className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm'
          onClick={(e) => { if (e.target === e.currentTarget) setSelectedOrderForDetail(null) }}
        >
          <div className='w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card shadow-2xl animate-in fade-in zoom-in-95 duration-200'>
            {/* Header */}
            <div className='flex items-center justify-between border-b border-border bg-muted/40 px-6 py-4'>
              <div>
                <h4 className='font-display text-lg font-bold text-foreground'>Chi tiết đơn hàng</h4>
                <p className='text-xs text-muted-foreground mt-0.5'>#{selectedOrderForDetail.orderCode}</p>
              </div>
              <button
                onClick={() => setSelectedOrderForDetail(null)}
                className='rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
              >
                <MaterialIcon name='close' />
              </button>
            </div>

            {/* Body */}
            <div className='p-6 space-y-4'>
              {/* Status */}
              <div className='flex items-center justify-between'>
                <span className='text-sm text-muted-foreground'>Trạng thái</span>
                {renderStatusBadge(selectedOrderForDetail.status)}
              </div>

              <div className='h-px bg-border' />

              <div className='space-y-3'>
                <div className='flex items-center justify-between'>
                  <span className='text-sm text-muted-foreground flex items-center gap-2'>
                    <MaterialIcon name='tag' className='text-[16px]' />
                    Mã đơn hàng
                  </span>
                  <span className='text-sm font-semibold text-foreground'>#{selectedOrderForDetail.orderCode}</span>
                </div>

                {selectedOrderForDetail.recipientName && (
                  <div className='flex items-center justify-between'>
                    <span className='text-sm text-muted-foreground flex items-center gap-2'>
                      <MaterialIcon name='person' className='text-[16px]' />
                      Tên khách hàng
                    </span>
                    <span className='text-sm font-semibold text-foreground'>{selectedOrderForDetail.recipientName}</span>
                  </div>
                )}

                {selectedOrderForDetail.phoneNumber && (
                  <div className='flex items-center justify-between'>
                    <span className='text-sm text-muted-foreground flex items-center gap-2'>
                      <MaterialIcon name='phone' className='text-[16px]' />
                      Số điện thoại
                    </span>
                    <span className='text-sm font-semibold text-foreground'>{selectedOrderForDetail.phoneNumber}</span>
                  </div>
                )}

                {selectedOrderForDetail.address && (
                  <div className='flex items-start justify-between gap-4'>
                    <span className='text-sm text-muted-foreground flex items-center gap-2 shrink-0'>
                      <MaterialIcon name='location_on' className='text-[16px]' />
                      Địa chỉ
                    </span>
                    <span className='text-sm font-semibold text-foreground text-right'>{selectedOrderForDetail.address}</span>
                  </div>
                )}

                <div className='flex items-center justify-between'>
                  <span className='text-sm text-muted-foreground flex items-center gap-2'>
                    <MaterialIcon name='calendar_today' className='text-[16px]' />
                    Ngày đặt hàng
                  </span>
                  <span className='text-sm font-semibold text-foreground'>
                    {formatDate(selectedOrderForDetail.createdAt)}
                  </span>
                </div>

                <div className='flex items-center justify-between'>
                  <span className='text-sm text-muted-foreground flex items-center gap-2'>
                    <MaterialIcon name='payments' className='text-[16px]' />
                    Tổng thanh toán
                  </span>
                  <span className='text-base font-bold text-primary'>
                    {formatPrice(selectedOrderForDetail.totalAmount)}
                  </span>
                </div>
              </div>

              <div className='h-px bg-border' />

              <div className='rounded-xl bg-muted/50 px-4 py-3 text-xs text-muted-foreground'>
                ID đơn hàng: <span className='font-mono font-semibold text-foreground'>{selectedOrderForDetail.orderId}</span>
              </div>
            </div>

            {/* Footer */}
            <div className='flex items-center justify-end border-t border-border bg-muted/40 px-6 py-4'>
              <button
                type='button'
                onClick={() => setSelectedOrderForDetail(null)}
                className='rounded-xl border border-border px-5 py-2.5 text-sm font-semibold hover:bg-muted'
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
