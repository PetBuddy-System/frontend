import { useEffect, useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { StaffSidebar } from '../components/layout/staff-sidebar'
import { StaffTopNav } from '../components/layout/staff-top-nav'
import { AreaOrderGroup } from '../../manager/components/shipper-assignment/area-order-group'
import { fetchAllOrdersApi } from '../../manager/services/shipper-assignment/shipper-assignment-api'
import { MaterialIcon } from '~/shared/ui'
import type { OrderResponse } from '~/shared/lib/order'

export function StaffShipperAssignmentPage() {
  const { t } = useTranslation('staff')
  const [orders, setOrders] = useState<OrderResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [regionFilter, setRegionFilter] = useState<'ALL' | 'HCM' | 'OTHER'>('ALL')

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

      if (regionFilter !== 'ALL') {
        const address = o.address?.toLowerCase() || ''
        const isHCM = address.includes('hồ chí minh') || address.includes('ho chi minh') || address.includes('hcm')
        if (regionFilter === 'HCM' && !isHCM) return false
        if (regionFilter === 'OTHER' && isHCM) return false
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const codeMatch = o.orderCode?.toLowerCase().includes(q)
        const nameMatch = o.recipientName?.toLowerCase().includes(q)
        const addressMatch = o.address?.toLowerCase().includes(q)
        return codeMatch || nameMatch || addressMatch
      }
      return true
    })
  }, [orders, searchQuery, regionFilter])

  const extractDistrict = (address: string): string => {
    if (!address) return t('shipperAssignment.otherArea', 'Khu vực khác')
    const parts = address.split(',').map((p) => p.trim())
    if (parts.length >= 2) {
      const potentialDistrict = parts[parts.length - 2]
      if (
        potentialDistrict &&
        (potentialDistrict.toLowerCase().includes('quận') ||
          potentialDistrict.toLowerCase().includes('huyện') ||
          potentialDistrict.toLowerCase().includes('tp') ||
          potentialDistrict.toLowerCase().includes('thị xã'))
      ) {
        return potentialDistrict
      }
    }
    const match = address.match(
      /(Quận\s+\d+|Quận\s+[A-Za-zÀ-ỹ\d\s]+|Huyện\s+[A-Za-zÀ-ỹ\d\s]+|Tp\.\s+[A-Za-zÀ-ỹ\d\s]+|Thành phố\s+[A-Za-zÀ-ỹ\d\s]+)/i
    )
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

            <div className='flex flex-wrap items-center gap-4'>
              <div className='relative w-full max-w-md'>
                <MaterialIcon
                  name='search'
                  className='absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground'
                />
                <input
                  type='text'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('shipperAssignment.searchPlaceholder', 'Tìm kiếm đơn hàng, khách hàng, địa chỉ...')}
                  className='w-full rounded-xl border border-border bg-card py-2.5 pl-10 pr-4 text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20'
                />
              </div>

              <select
                value={regionFilter}
                onChange={(e) => setRegionFilter(e.target.value as 'ALL' | 'HCM' | 'OTHER')}
                className='rounded-xl border border-border bg-card py-2.5 px-4 text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 cursor-pointer appearance-none'
                style={{
                  backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23131313%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 1rem top 50%',
                  backgroundSize: '0.65rem auto',
                  paddingRight: '2.5rem'
                }}
              >
                <option value='ALL'>{t('shipperAssignment.region.all', 'Tất cả khu vực')}</option>
                <option value='HCM'>{t('shipperAssignment.region.hcm', 'Nội thành (TP. HCM)')}</option>
                <option value='OTHER'>{t('shipperAssignment.region.other', 'Ngoại thành')}</option>
              </select>
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
                <p className='text-sm text-muted-foreground animate-pulse'>
                  {t('shipperAssignment.loadingOrders', 'Đang tải danh sách đơn hàng...')}
                </p>
              </div>
            ) : filteredPickedOrders.length === 0 ? (
              <div className='rounded-2xl border border-dashed border-border/80 bg-card/50 py-16 text-center text-muted-foreground shadow-sm'>
                <MaterialIcon name='local_shipping' className='text-5xl mb-3 text-muted-foreground/30' />
                <h3 className='font-bold text-lg text-foreground mb-1'>
                  {t('shipperAssignment.noOrdersTitle', 'Không có đơn hàng cần phân công')}
                </h3>
                <p className='text-sm text-muted-foreground max-w-md mx-auto px-4'>
                  {t(
                    'shipperAssignment.noOrdersDesc',
                    'Hiện không có đơn hàng nào ở trạng thái Đã chuẩn bị để phân công shipper.'
                  )}
                </p>
              </div>
            ) : (
              <div className='space-y-6'>
                {Object.entries(groupedOrders).map(([areaName, areaOrders]) => (
                  <AreaOrderGroup key={areaName} areaName={areaName} orders={areaOrders} onAssignSuccess={loadOrders} />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
