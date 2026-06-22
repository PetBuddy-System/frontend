import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { OrderHistoryCard } from './order-history-card'
import { OrderHistoryFilters, type OrderHistoryFilter } from './order-history-filters'
import { fetchMyOrdersApi, type OrderResponse } from '~/shared/lib/order'

function matchesFilter(status: string, filter: OrderHistoryFilter) {
  if (filter === 'all') return true
  // Match lowercased statuses
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

  async function loadOrders() {
    setIsLoading(true)
    try {
      const res = await fetchMyOrdersApi({
        page: 0,
        size: 100,
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
    void loadOrders()
  }, [])

  const filteredItems = useMemo(
    () => orders.filter((item) => matchesFilter(item.status, activeFilter)),
    [orders, activeFilter]
  )

  return (
    <section>
      <OrderHistoryFilters activeFilter={activeFilter} onFilterChange={setActiveFilter} />

      {isLoading ? (
        <div className='mt-6 rounded-2xl border border-border bg-card p-12 text-center text-muted-foreground animate-pulse'>
          Đang tải lịch sử đơn hàng...
        </div>
      ) : (
        <div className='mt-6 space-y-5'>
          {filteredItems.map((order) => (
            <OrderHistoryCard key={order.orderId} order={order} onRefresh={() => void loadOrders()} />
          ))}
        </div>
      )}

      {!isLoading && filteredItems.length === 0 ? (
        <p className='mt-6 rounded-2xl border border-border bg-card p-6 text-center text-muted-foreground'>
          {t('orderHistory.empty', 'Bạn chưa có đơn hàng nào.')}
        </p>
      ) : null}
    </section>
  )
}
