/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { OrderHistoryCard } from './order-history-card'
import { OrderHistoryFilters, type OrderHistoryFilter } from './order-history-filters'
import { fetchMyOrdersApi } from '~/features/profile/services'
import { MaterialIcon } from '~/shared/ui'


function matchesFilter(status: string, filter: OrderHistoryFilter) {
  if (filter === 'all') return true
  const filterLower = filter.toLowerCase()
  const statusLower = status.toLowerCase()

  if (filterLower === 'pending') return statusLower === 'pending'
  if (filterLower === 'shipping') return statusLower === 'shipping'
  if (filterLower === 'delivered') return statusLower === 'delivered'
  if (filterLower === 'cancelled') return statusLower === 'canceled' || statusLower === 'cancelled'

  return statusLower === filterLower
}

export function OrderHistoryList() {
  const { t } = useTranslation('profile')
  const [activeFilter, setActiveFilter] = useState<OrderHistoryFilter>('all')
  const [orders, setOrders] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(0)
  const itemsPerPage = 10

  async function loadOrders() {
    setIsLoading(true)
    try {
      const res = await fetchMyOrdersApi({
        page: 0,
        size: 200, // Fetch up to 200 orders to support local client filtering & paging
        sort: 'createdAt,desc'
      })
      if (res.success && res.data) {
        setOrders(res.data.content)
      }
    } catch (err) {
      console.error('Failed to load user orders', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    setTimeout(() => {
      void loadOrders()
    }, 0)
  }, [])

  // Reset to first page when filter changes
  useEffect(() => {
    setCurrentPage(0)
  }, [activeFilter])

  const filteredItems = useMemo(
    () => orders.filter((item) => matchesFilter(item.status, activeFilter)),
    [orders, activeFilter]
  )

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage)

  const paginatedItems = useMemo(() => {
    const start = currentPage * itemsPerPage
    return filteredItems.slice(start, start + itemsPerPage)
  }, [filteredItems, currentPage])

  return (
    <section>
      <OrderHistoryFilters activeFilter={activeFilter} onFilterChange={setActiveFilter} />

      {isLoading ? (
        <div className='mt-6 rounded-2xl border border-border bg-card p-12 text-center text-muted-foreground animate-pulse'>
          Đang tải lịch sử đơn hàng...
        </div>
      ) : (
        <div className='mt-6 space-y-5'>
          {paginatedItems.map((order) => (
            <OrderHistoryCard key={order.orderId} order={order} onRefresh={() => void loadOrders()} />
          ))}
        </div>
      )}

      {!isLoading && filteredItems.length === 0 ? (
        <p className='mt-6 rounded-2xl border border-border bg-card p-6 text-center text-muted-foreground'>
          {t('orderHistory.empty', 'Bạn chưa có đơn hàng nào.')}
        </p>
      ) : null}

      {/* Pagination Controls */}
      {!isLoading && totalPages > 1 && (
        <div className='mt-8 flex items-center justify-center gap-4 bg-card border border-border rounded-xl p-4 shadow-sm'>
          <button
            type='button'
            onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
            disabled={currentPage === 0}
            className='flex items-center justify-center rounded-lg border border-border p-2 hover:bg-muted active:scale-95 disabled:opacity-40 disabled:pointer-events-none text-muted-foreground hover:text-foreground transition-colors'
          >
            <MaterialIcon name='chevron_left' className='text-[20px]' />
          </button>
          
          <span className='text-sm font-semibold text-muted-foreground'>
            Trang <span className='text-foreground'>{currentPage + 1}</span> / {totalPages}
          </span>

          <button
            type='button'
            onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
            disabled={currentPage >= totalPages - 1}
            className='flex items-center justify-center rounded-lg border border-border p-2 hover:bg-muted active:scale-95 disabled:opacity-40 disabled:pointer-events-none text-muted-foreground hover:text-foreground transition-colors'
          >
            <MaterialIcon name='chevron_right' className='text-[20px]' />
          </button>
        </div>
      )}
    </section>
  )
}
