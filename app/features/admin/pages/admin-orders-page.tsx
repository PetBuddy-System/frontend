import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import type { TFunction } from 'i18next'
import { AdminSidebar } from '../components/layout/admin-sidebar'
import { AdminTopNav } from '../components/layout/admin-top-nav'
import { MaterialIcon } from '~/shared/ui'
import { cn } from '~/shared/lib/cn'
import { fetchAllOrdersApi } from '~/features/staff/services/order/order-api'
import type { OrderResponse } from '~/shared/lib/order'

const PAGE_SIZE = 10

const getStatusInfo = (status: string, t: TFunction) => {
  const map: Record<string, { label: string; color: string }> = {
    PENDING: { label: t('profile:orderDetail.status.pending', 'Chờ xử lý'), color: 'text-amber-500' },
    CONFIRMED: { label: t('profile:orderDetail.status.confirmed', 'Đã xác nhận'), color: 'text-blue-500' },
    PICKING: { label: t('profile:orderDetail.status.picking', 'Đang lấy hàng'), color: 'text-cyan-600' },
    PICKED: { label: t('profile:orderDetail.status.picked', 'Đã lấy hàng'), color: 'text-teal-600' },
    SHIPPING: { label: t('profile:orderDetail.status.shipping', 'Đang giao'), color: 'text-primary' },
    DELIVERED: { label: t('profile:orderDetail.status.delivered', 'Đã giao'), color: 'text-success' },
    COMPLETED: { label: t('profile:orderDetail.status.completed', 'Hoàn thành'), color: 'text-success' },
    CANCELLED: { label: t('profile:orderDetail.status.cancelled', 'Đã hủy'), color: 'text-destructive' },
    EXPIRED: { label: t('profile:orderDetail.status.expired', 'Hết hạn'), color: 'text-destructive' },
    CANCEL_REQUESTED: {
      label: t('profile:orderDetail.status.cancel_requested', 'Chờ hoàn tiền'),
      color: 'text-amber-600'
    }
  }
  return map[status] ?? { label: status, color: 'text-muted-foreground' }
}

function formatPrice(value: number) {
  return `${new Intl.NumberFormat('vi-VN').format(Number(value) || 0)}đ`
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return iso
  }
}

export function AdminOrdersPage() {
  const { t } = useTranslation(['admin', 'profile'])
  const navigate = useNavigate()
  const [orders, setOrders] = useState<OrderResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [totalElements, setTotalElements] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')

  const loadOrders = useCallback(async (page: number) => {
    setIsLoading(true)
    setError('')
    try {
      const res = await fetchAllOrdersApi({ page, size: PAGE_SIZE, sort: 'createdAt,desc' })
      if (res?.data) {
        setOrders(res.data.content ?? [])
        setTotalPages(res.data.totalPages ?? 1)
        setTotalElements(res.data.totalElements ?? 0)
      }
    } catch {
      setError(t('orders.loadError', 'Không thể tải danh sách đơn hàng.'))
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadOrders(currentPage)
  }, [currentPage, loadOrders])

  const filteredOrders = orders.filter(
    (o) =>
      !searchQuery ||
      o.orderCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.recipientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.phoneNumber?.includes(searchQuery)
  )

  const pageNumbers = Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i)

  return (
    <div className='flex h-screen overflow-hidden bg-background text-foreground'>
      <AdminSidebar activeItem='orders' />
      <div className='flex min-w-0 flex-1 flex-col overflow-hidden'>
        <AdminTopNav titleKey='orderManagement.title' subtitleKey='orderManagement.subtitle' />

        <main className='flex-1 overflow-y-auto p-4 md:p-6'>
          <div className='mx-auto flex max-w-7xl flex-col gap-6'>
            {/* Stats */}
            <div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
              {[
                {
                  label: t('orders.stats.total', 'Tổng đơn'),
                  value: totalElements,
                  icon: 'receipt_long',
                  color: 'text-primary'
                },
                {
                  label: t('orders.stats.processing', 'Đang xử lý'),
                  value: orders.filter((o) => !['COMPLETED', 'CANCELLED', 'EXPIRED', 'DELIVERED'].includes(o.status))
                    .length,
                  icon: 'pending_actions',
                  color: 'text-amber-500'
                },
                {
                  label: t('orders.stats.completed', 'Đã hoàn thành'),
                  value: orders.filter((o) => o.status === 'COMPLETED' || o.status === 'DELIVERED').length,
                  icon: 'check_circle',
                  color: 'text-success'
                },
                {
                  label: t('orders.stats.cancelled', 'Đã hủy'),
                  value: orders.filter((o) => o.status === 'CANCELLED').length,
                  icon: 'cancel',
                  color: 'text-destructive'
                }
              ].map((stat) => (
                <div
                  key={stat.label}
                  className='flex items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm'
                >
                  <div
                    className={cn(
                      'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-muted',
                      stat.color
                    )}
                  >
                    <MaterialIcon name={stat.icon} filled className='text-[24px]' />
                  </div>
                  <div>
                    <p className='text-xs font-semibold uppercase tracking-wide text-muted-foreground'>{stat.label}</p>
                    <p className='text-2xl font-black text-foreground'>{stat.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Table */}
            <div className='rounded-2xl border border-border bg-card shadow-sm overflow-hidden'>
              {/* Header */}
              <div className='flex flex-col gap-3 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between'>
                <h2 className='flex items-center gap-2 font-display text-lg font-bold text-card-foreground'>
                  <MaterialIcon name='list_alt' className='text-primary' />
                  {t('orders.listTitle', 'Danh sách tất cả đơn hàng')}
                </h2>
                <div className='relative w-full sm:w-72'>
                  <MaterialIcon
                    name='search'
                    className='absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-[18px]'
                  />
                  <input
                    type='search'
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('orders.searchPlaceholder', 'Tìm mã đơn, tên, SĐT...')}
                    className='h-10 w-full rounded-lg border border-border bg-background pl-10 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring'
                  />
                </div>
              </div>

              {error && (
                <div className='flex items-center gap-2 px-5 py-3 text-sm text-destructive bg-destructive/10 border-b border-border'>
                  <MaterialIcon name='error' className='text-[18px]' />
                  {error}
                </div>
              )}

              <div className='overflow-x-auto'>
                <table className='w-full min-w-[780px] border-collapse text-left'>
                  <thead>
                    <tr className='border-b border-border bg-muted/40 text-[11px] font-bold uppercase tracking-wider text-muted-foreground'>
                      <th className='px-4 py-3'>{t('orders.table.orderCode', 'Mã đơn')}</th>
                      <th className='px-4 py-3'>{t('orders.table.customer', 'Khách hàng')}</th>
                      <th className='px-4 py-3'>{t('orders.table.paymentMethod', 'Phương thức TT')}</th>
                      <th className='px-4 py-3'>{t('orders.table.totalAmount', 'Tổng tiền')}</th>
                      <th className='px-4 py-3'>{t('orders.table.createdAt', 'Ngày tạo')}</th>
                      <th className='px-4 py-3'>{t('orders.table.status', 'Trạng thái')}</th>
                      <th className='px-4 py-3 text-right'>{t('orders.table.actions', 'Thao tác')}</th>
                    </tr>
                  </thead>
                  <tbody className='divide-y divide-border'>
                    {isLoading ? (
                      Array.from({ length: 6 }).map((_, i) => (
                        <tr key={i}>
                          {Array.from({ length: 7 }).map((__, j) => (
                            <td key={j} className='px-4 py-4'>
                              <div className='h-4 animate-pulse rounded bg-muted' />
                            </td>
                          ))}
                        </tr>
                      ))
                    ) : filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={7} className='py-16 text-center text-muted-foreground'>
                          <MaterialIcon name='inbox' className='mx-auto mb-2 text-[40px] opacity-40' />
                          <p className='text-sm'>{t('orders.empty', 'Không có đơn hàng nào')}</p>
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((order) => {
                        const statusInfo = getStatusInfo(order.status, t)
                        return (
                          <tr key={order.orderId} className='transition-colors hover:bg-muted/40'>
                            <td className='px-4 py-3'>
                              <span className='font-mono text-sm font-bold text-primary'>#{order.orderCode}</span>
                            </td>
                            <td className='px-4 py-3'>
                              <p className='text-sm font-semibold text-foreground'>{order.recipientName || '—'}</p>
                              <p className='text-xs text-muted-foreground'>{order.phoneNumber || ''}</p>
                            </td>
                            <td className='px-4 py-3'>
                              <span className='flex items-center gap-1.5 text-sm text-foreground'>
                                <MaterialIcon
                                  name={
                                    order.payment?.paymentMethod === 'CARD'
                                      ? 'credit_card'
                                      : order.payment?.paymentMethod === 'MOMO'
                                        ? 'qr_code_2'
                                        : 'payments'
                                  }
                                  className='text-[16px] text-muted-foreground'
                                />
                                {order.payment?.paymentMethod === 'CARD'
                                  ? t('orders.paymentMethod.card', 'Thẻ')
                                  : order.payment?.paymentMethod === 'MOMO'
                                    ? t('orders.paymentMethod.momo', 'MoMo')
                                    : t('orders.paymentMethod.cash', 'Tiền mặt')}
                              </span>
                            </td>
                            <td className='px-4 py-3'>
                              <span className='font-bold text-sm text-foreground'>
                                {formatPrice(order.finalAmount)}
                              </span>
                            </td>
                            <td className='px-4 py-3 text-sm text-muted-foreground'>{formatDate(order.createdAt)}</td>
                            <td className='px-4 py-3'>
                              <span className={cn('text-xs font-bold uppercase', statusInfo.color)}>
                                {statusInfo.label}
                              </span>
                            </td>
                            <td className='px-4 py-3 text-right'>
                              <button
                                type='button'
                                onClick={() => navigate(`/admin/orders/${order.orderId}`)}
                                className='inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted/50 px-3 py-1.5 text-xs font-bold text-foreground transition hover:bg-primary/10 hover:text-primary hover:border-primary'
                              >
                                <MaterialIcon name='visibility' className='text-[14px]' />
                                {t('orders.actions.viewDetail', 'Xem chi tiết')}
                              </button>
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className='flex flex-col gap-3 border-t border-border bg-muted/20 px-5 py-3 sm:flex-row sm:items-center sm:justify-between'>
                <p className='text-sm text-muted-foreground'>
                  {isLoading
                    ? t('orders.loading', 'Đang tải...')
                    : t('orders.totalCount', { count: totalElements, defaultValue: `Tổng ${totalElements} đơn hàng` })}
                </p>
                <div className='flex items-center gap-2'>
                  <button
                    type='button'
                    onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                    disabled={currentPage === 0}
                    className='flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card transition hover:bg-muted disabled:opacity-40'
                  >
                    <MaterialIcon name='chevron_left' className='text-[18px]' />
                  </button>
                  {pageNumbers.map((p) => (
                    <button
                      key={p}
                      type='button'
                      onClick={() => setCurrentPage(p)}
                      className={cn(
                        'h-8 min-w-8 rounded-lg px-3 text-sm font-semibold transition',
                        p === currentPage
                          ? 'bg-primary text-primary-foreground'
                          : 'border border-border bg-card text-muted-foreground hover:text-primary'
                      )}
                    >
                      {p + 1}
                    </button>
                  ))}
                  <button
                    type='button'
                    onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
                    disabled={currentPage >= totalPages - 1}
                    className='flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card transition hover:bg-muted disabled:opacity-40'
                  >
                    <MaterialIcon name='chevron_right' className='text-[18px]' />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
