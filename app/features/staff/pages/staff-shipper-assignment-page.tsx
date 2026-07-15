import { useEffect, useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { StaffSidebar } from '../components/layout/staff-sidebar'
import { StaffTopNav } from '../components/layout/staff-top-nav'
import { AreaOrderGroup } from '../../manager/components/shipper-assignment/area-order-group'
import { fetchAllOrdersApi } from '../../manager/services/shipper-assignment/shipper-assignment-api'
import { MaterialIcon } from '~/shared/ui'
import type { OrderResponse } from '~/shared/lib/order'

export function StaffShipperAssignmentPage() {
  const { t } = useTranslation('manager')
  const [orders, setOrders] = useState<OrderResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  async function loadOrders() {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetchAllOrdersApi({ page: 0, size: 1000, sort: 'createdAt,desc' })
      if (res.success && res.data) {
        setOrders(res.data.content)
      } else {
        setError(res.message || t('shipperAssignment.errors.loadOrdersFailed', 'Không thể tải danh sách đơn hàng.'))
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('shipperAssignment.errors.unknownError', 'Có lỗi xảy ra.'))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadOrders()
  }, [])

  const filteredPickedOrders = useMemo(() => {
    return orders.filter((o) => {
      if (o.status !== 'PICKED') return false
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const codeMatch = o.orderCode?.toLowerCase().includes(q)
        const nameMatch = o.recipientName?.toLowerCase().includes(q)
        const addressMatch = o.address?.toLowerCase().includes(q)
        return codeMatch || nameMatch || addressMatch
      }
      return true
    })
  }, [orders, searchQuery])

  const extractDistrict = (address: string): string => {
    if (!address) return t('shipperAssignment.otherArea', 'Khu vực khác')
    const parts = address.split(',').map((p) => p.trim())
    if (parts.length >= 2) {
      const potentialDistrict = parts[parts.length - 2]
      if (potentialDistrict && (potentialDistrict.toLowerCase().includes('quận') || potentialDistrict.toLowerCase().includes('huyện') || potentialDistrict.toLowerCase().includes('tp') || potentialDistrict.toLowerCase().includes('thị xã'))) {
        return potentialDistrict
      }
    }
    const match = address.match(/(Quận\s+\d+|Quận\s+[A-Za-zÀ-ỹ\d\s]+|Huyện\s+[A-Za-zÀ-ỹ\d\s]+|Tp\.\s+[A-Za-zÀ-ỹ\d\s]+|Thành phố\s+[A-Za-zÀ-ỹ\d\s]+)/i)
    if (match) return match[1]
    return t('shipperAssignment.otherArea', 'Khu vực khác')
  }

  const groupedOrders = useMemo(() => {
    const groups: { [key: string]: OrderResponse[] } = {}
    filteredPickedOrders.forEach((o) => {
      const area = extractDistrict(o.address || '')
      if (!groups[area]) {
        groups[area] = []
      }
      groups[area].push(o)
    })
    return groups
  }, [filteredPickedOrders])

  return (
    <div className='flex h-screen overflow-hidden bg-background text-foreground'>
      <StaffSidebar activeItem='shipperAssignment' />
      <div className='flex min-w-0 flex-1 flex-col overflow-hidden'>
        <StaffTopNav titleKey='shipperAssignment.title' subtitleKey='shipperAssignment.subtitle' />

        <main className='flex-1 overflow-y-auto p-4 md:p-6 pb-20'>
          <div className='mx-auto flex max-w-7xl flex-col gap-6'>
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3'>
              <div className='rounded-2xl border border-border bg-card p-5 shadow-sm flex items-center gap-4'>
                <div className='flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary'>
                  <MaterialIcon name='pending_actions' className='text-[24px]' />
                </div>
                <div>
                  <p className='text-xs font-semibold text-muted-foreground uppercase tracking-wider'>
                    {t('shipperAssignment.stats.pendingPickup', 'Đơn hàng chờ giao')}
                  </p>
                  <p className='text-2xl font-bold text-foreground'>{filteredPickedOrders.length}</p>
                </div>
              </div>

              <div className='rounded-2xl border border-border bg-card p-5 shadow-sm flex items-center gap-4'>
                <div className='flex h-12 w-12 items-center justify-center rounded-xl bg-teal-500/10 text-teal-500'>
                  <MaterialIcon name='place' className='text-[24px]' />
                </div>
                <div>
                  <p className='text-xs font-semibold text-muted-foreground uppercase tracking-wider'>
                    {t('shipperAssignment.stats.areas', 'Khu vực hoạt động')}
                  </p>
                  <p className='text-2xl font-bold text-foreground'>{Object.keys(groupedOrders).length}</p>
                </div>
              </div>
            </div>

            <div className='flex items-center gap-4'>
              <div className='relative w-full max-w-md'>
                <MaterialIcon name='search' className='absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground' />
                <input
                  type='text'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('shipperAssignment.searchPlaceholder', 'Tìm kiếm đơn hàng, khách hàng, địa chỉ...')}
                  className='w-full rounded-xl border border-border bg-card py-2.5 pl-10 pr-4 text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20'
                />
              </div>
            </div>

            {error && (
              <div className='flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive'>
                <MaterialIcon name='error' className='shrink-0' />
                <p className='font-semibold'>{error}</p>
              </div>
            )}

            {isLoading ? (
              <div className='flex flex-col justify-center items-center py-20 gap-3'>
                <div className='h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent' />
                <p className='text-sm text-muted-foreground animate-pulse'>{t('shipperAssignment.loadingOrders', 'Đang tải danh sách đơn hàng...')}</p>
              </div>
            ) : filteredPickedOrders.length === 0 ? (
              <div className='rounded-2xl border border-dashed border-border/80 bg-card/50 py-16 text-center text-muted-foreground shadow-sm'>
                <MaterialIcon name='local_shipping' className='text-5xl mb-3 text-muted-foreground/30' />
                <h3 className='font-bold text-lg text-foreground mb-1'>{t('shipperAssignment.noOrdersTitle', 'Không có đơn hàng cần phân công')}</h3>
                <p className='text-sm text-muted-foreground max-w-md mx-auto px-4'>
                  {t('shipperAssignment.noOrdersDesc', 'Hiện không có đơn hàng nào ở trạng thái Đã chuẩn bị (PICKED) để phân công shipper.')}
                </p>
              </div>
            ) : (
              <div className='space-y-6'>
                {Object.entries(groupedOrders).map(([areaName, areaOrders]) => (
                  <AreaOrderGroup
                    key={areaName}
                    areaName={areaName}
                    orders={areaOrders}
                    onAssignSuccess={loadOrders}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
