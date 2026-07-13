import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { MaterialIcon } from '~/shared/ui'
import { ShipperSuggestionList } from './shipper-suggestion-list'
import type { OrderResponse } from '~/shared/lib/order'

interface OrderRowProps {
  order: OrderResponse
  onAssignSuccess: () => void
}

export function OrderRow({ order, onAssignSuccess }: OrderRowProps) {
  const { t } = useTranslation('manager')
  const [isExpanded, setIsExpanded] = useState(false)

  function formatPrice(value: number) {
    if (value == null || isNaN(Number(value))) return '0đ'
    return `${new Intl.NumberFormat('vi-VN').format(Number(value))}đ`
  }

  function formatDate(dateStr: string) {
    if (!dateStr) return '—'
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

  return (
    <div className='border border-border/60 bg-card rounded-2xl overflow-hidden shadow-sm hover:border-primary/45 transition-colors'>
      {/* Clickable Header Row */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className='flex flex-col md:flex-row md:items-center justify-between p-5 cursor-pointer gap-4 select-none hover:bg-muted/10'
      >
        <div className='flex items-center gap-4'>
          {/* Collapse icon */}
          <div className={`text-muted-foreground transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}>
            <MaterialIcon name='chevron_right' className='text-2xl' />
          </div>

          <div className='space-y-1'>
            <div className='flex items-center gap-2'>
              <span className='font-bold text-primary'>#{order.orderCode}</span>
              <span className='inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2.5 py-0.5 text-[10px] font-bold uppercase text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400'>
                {t('shipperAssignment.statusPicked', 'Chờ giao')}
              </span>
            </div>
            <p className='text-sm font-semibold text-foreground line-clamp-1'>
              {order.recipientName} <span className='text-muted-foreground font-normal'>({order.phoneNumber})</span>
            </p>
            <p className='text-xs text-muted-foreground line-clamp-1 flex items-center gap-1'>
              <MaterialIcon name='location_on' className='text-[14px] text-primary/80 shrink-0' />
              <span>{order.address}</span>
            </p>
          </div>
        </div>

        <div className='flex items-center justify-between md:justify-end gap-6 pl-10 md:pl-0 border-t border-border/40 md:border-0 pt-3 md:pt-0'>
          <div className='text-left md:text-right space-y-0.5'>
            <p className='text-xs text-muted-foreground font-medium'>{t('shipperAssignment.orderDate', 'Ngày đặt')}</p>
            <p className='text-sm font-semibold text-muted-foreground'>{formatDate(order.createdAt)}</p>
          </div>
          <div className='text-left md:text-right space-y-0.5'>
            <p className='text-xs text-muted-foreground font-medium'>{t('shipperAssignment.totalAmount', 'Tổng tiền')}</p>
            <p className='text-base font-bold text-foreground'>{formatPrice(order.finalAmount)}</p>
          </div>
        </div>
      </div>

      {/* Expanded collaspible suggestions section */}
      {isExpanded && (
        <div className='border-t border-border/50 bg-muted/10 p-5 md:px-8 pb-6 animate-fadeIn'>
          <div className='border-b border-border/40 pb-2 mb-4'>
            <h4 className='font-display text-sm font-bold text-primary uppercase tracking-wide flex items-center gap-1.5'>
              <MaterialIcon name='local_shipping' className='text-[18px]' />
              <span>{t('shipperAssignment.suggestionsHeader', 'Đề xuất Shipper phù hợp')}</span>
            </h4>
          </div>
          <ShipperSuggestionList orderId={order.orderId} onAssignSuccess={onAssignSuccess} />
        </div>
      )}
    </div>
  )
}
