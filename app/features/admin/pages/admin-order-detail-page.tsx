import { useNavigate } from 'react-router'
import { AdminSidebar } from '../components/layout/admin-sidebar'
import { OrderDetailView } from '~/shared/components/order-detail-view'

interface AdminOrderDetailPageProps {
  orderId: number
}

export function AdminOrderDetailPage({ orderId }: AdminOrderDetailPageProps) {
  const navigate = useNavigate()
  return (
    <div className='flex h-screen overflow-hidden bg-background text-foreground'>
      <AdminSidebar activeItem='orders' />
      <div className='flex min-w-0 flex-1 flex-col overflow-hidden'>
        <div className='flex items-center gap-3 border-b border-border bg-card px-6 py-3 shrink-0'>
          <button
            type='button'
            onClick={() => navigate('/admin/orders')}
            className='flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors'
          >
            ← Quay lại danh sách đơn
          </button>
        </div>
        <div className='flex-1 overflow-y-auto'>
          <OrderDetailView orderId={orderId} isStaff={true} isAdmin={true} />
        </div>
      </div>
    </div>
  )
}
