import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { OrderHistoryCard, type OrderHistoryItem, type OrderStatus } from './order-history-card'
import { ORDER_HISTORY_FILTERS, OrderHistoryFilters, type OrderHistoryFilter } from './order-history-filters'

const ORDER_HISTORY_ITEMS: OrderHistoryItem[] = [
  {
    key: 'ord5542',
    status: 'delivered',
    id: '#ORD-5542',
    date: '12/10/2023',
    products: [
      {
        name: 'Thức ăn hạt cao cấp cho chó trưởng thành',
        quantity: 1,
        price: '450.000đ',
        image:
          'https://lh3.googleusercontent.com/aida/ADBb0uifyciLtOf41cCMEjWdvIny__fSd_mCekw3D66AomlUIUDWxAl10w6qXwjx5sjucTPqsrDUaCjs5nlzG1AaNMwDzbTXZzCbNWf4n4P0ABkDTjFl5k96tQcB_Xr8IsHeNBWlyK57S6JUw-g3jMLFAvkiKf68zt4b-J2CKek0ib842v4nMCMu3HWT3JpPLmy9v-yegvMU6gQ5kkmk2BmN9z8DwBT_ypTYfotaAknGFH1YtoCBfYFTaRy2vg'
      },
      {
        name: 'Sữa tắm Hello cho chó mèo 280g',
        quantity: 2,
        price: '120.000đ',
        image:
          'https://lh3.googleusercontent.com/aida/ADBb0uiD2iNUbQz2Hs_xHergS9X6TBN_RLOdfzCsTQyFr6mPAI-q3PGlxKrEMWRS2mZ6NW5BIkBX-Zwmjrxk3CaHaHVNRCBreBxbANzRZjr6NDa5HAh66eUX-SlKemHGRcmR_oQWLH6UM8Cx6etWFvrzC_Zx7Ik9t1KFjGCBvXF-f5CrDF0NKIcL2T-AIK1gNaPoq4OK1LWnzv-OI2BejbgO7sGLwh9HNHuYMAvDK00LoTsZwkVJulKsabSdbqs'
      }
    ],
    total: '690.000đ'
  },
  {
    key: 'ord5589',
    status: 'shipping',
    id: '#ORD-5589',
    date: '24/10/2023',
    products: [
      {
        name: 'Cát đậu nành Cature Tofu dành cho mèo',
        quantity: 3,
        price: '185.000đ',
        image:
          'https://lh3.googleusercontent.com/aida/ADBb0uio3yhORq1HxGnDHRDl3K1tbAslOGzxMCESj2lUcheAh1b-83fsuGGfcUj3g96-5sFYzgewrKvc0Hc5935JsAEUPchtsgUSZB8dJDd91s1ERQ5iGrFrnJFh5aYAVASMnFuxVE8XapXYUdL_9ke1o613b3bpD8VaI3reVeT7aYSNMquvqJEtNJgtQevBwtdGNC9EMnBCXPVGgf_Q7mvwLoKybk5d5ZUya2vd3vPv95pO-qe74DBdMbrVrxs'
      }
    ],
    total: '555.000đ'
  },
  {
    key: 'ord5410',
    status: 'cancelled',
    id: '#ORD-5410',
    date: '05/10/2023',
    products: [
      {
        name: 'Đồ chơi dây thừng cho thú cưng',
        quantity: 1,
        price: '85.000đ',
        image:
          'https://lh3.googleusercontent.com/aida/ADBb0uifyciLtOf41cCMEjWdvIny__fSd_mCekw3D66AomlUIUDWxAl10w6qXwjx5sjucTPqsrDUaCjs5nlzG1AaNMwDzbTXZzCbNWf4n4P0ABkDTjFl5k96tQcB_Xr8IsHeNBWlyK57S6JUw-g3jMLFAvkiKf68zt4b-J2CKek0ib842v4nMCMu3HWT3JpPLmy9v-yegvMU6gQ5kkmk2BmN9z8DwBT_ypTYfotaAknGFH1YtoCBfYFTaRy2vg'
      }
    ],
    total: '85.000đ'
  }
]

function matchesFilter(status: OrderStatus, filter: OrderHistoryFilter) {
  if (filter === 'all') return true
  return status === filter
}

export function OrderHistoryList() {
  const { t } = useTranslation('profile')
  const [activeFilter, setActiveFilter] = useState<OrderHistoryFilter>('all')

  const filteredItems = useMemo(
    () => ORDER_HISTORY_ITEMS.filter((item) => matchesFilter(item.status, activeFilter)),
    [activeFilter]
  )

  return (
    <section>
      <OrderHistoryFilters activeFilter={activeFilter} onFilterChange={setActiveFilter} />

      <div className='mt-6 space-y-5'>
        {filteredItems.map((item) => (
          <OrderHistoryCard key={item.key} item={item} />
        ))}
      </div>

      {filteredItems.length === 0 ? (
        <p className='mt-6 rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground'>
          {t('orderHistory.empty')}
        </p>
      ) : null}
    </section>
  )
}
