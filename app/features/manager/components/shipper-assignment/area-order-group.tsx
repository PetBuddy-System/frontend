import { useState } from 'react'
import { MaterialIcon } from '~/shared/ui'
import { OrderRow } from './order-row'
import type { OrderResponse } from '~/shared/lib/order'

interface AreaOrderGroupProps {
  areaName: string
  orders: OrderResponse[]
  onAssignSuccess: () => void
}

export function AreaOrderGroup({ areaName, orders, onAssignSuccess }: AreaOrderGroupProps) {
  const [isOpen, setIsOpen] = useState(true)

  return (
    <div className='border border-border/70 rounded-2xl overflow-hidden bg-card shadow-sm'>
      {/* Header of Area */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className='flex items-center justify-between p-4 px-5 bg-muted/40 cursor-pointer select-none border-b border-border/40 hover:bg-muted/65 transition-colors'
      >
        <div className='flex items-center gap-3'>
          <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold shadow-sm'>
            <MaterialIcon name='place' className='text-[20px]' />
          </div>
          <div>
            <h3 className='font-display text-lg font-bold text-foreground'>{areaName}</h3>
            <p className='text-xs text-muted-foreground font-semibold'>
              {orders.length} đơn hàng cần giao
            </p>
          </div>
        </div>

        <div className='text-muted-foreground'>
          <MaterialIcon name={isOpen ? 'expand_less' : 'expand_more'} className='text-2xl' />
        </div>
      </div>

      {/* List of Orders inside Area */}
      {isOpen && (
        <div className='p-4 space-y-4 bg-muted/5'>
          {orders.map((order) => (
            <OrderRow key={order.orderId} order={order} onAssignSuccess={onAssignSuccess} />
          ))}
        </div>
      )}
    </div>
  )
}
