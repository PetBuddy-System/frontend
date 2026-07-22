import { useTranslation } from 'react-i18next'
import type { OrderDetailFull } from '~/shared/lib/order'
import { MaterialIcon } from '~/shared/ui'
import { formatDateTime } from '~/shared/lib/date'

interface OrderShippingInfoProps {
  order: OrderDetailFull
}

export function OrderShippingInfo({ order }: OrderShippingInfoProps) {
  const { t } = useTranslation('profile')

  return (
    <div className='bg-card p-6 rounded-xl border border-border shadow-sm'>
      <div className='flex items-center gap-2 mb-4 border-b border-border pb-3'>
        <div className='w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary'>
          <MaterialIcon name='local_shipping' className='text-[18px]' />
        </div>
        <h2 className='font-bold text-base text-foreground'>{t('orderDetail.shippingInfo', 'Thông tin nhận hàng')}</h2>
      </div>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <div className='space-y-4'>
          <div>
            <p className='text-[10px] text-muted-foreground uppercase tracking-widest mb-1 font-bold'>
              {t('orderDetail.recipient', 'Người nhận')}
            </p>
            <p className='font-bold text-foreground text-lg'>
              {order.recipientName || t('orderDetail.notProvided', 'Chưa cung cấp')}
            </p>
          </div>
          <div>
            <p className='text-[10px] text-muted-foreground uppercase tracking-widest mb-1 font-bold'>
              {t('orderDetail.phone', 'Số điện thoại')}
            </p>
            <p className='font-semibold text-foreground text-sm'>
              {order.phoneNumber || t('orderDetail.notProvided', 'Chưa cung cấp')}
            </p>
          </div>
          {order.estimatedDeliveryAt && (
            <div>
              <p className='text-[10px] text-muted-foreground uppercase tracking-widest mb-1 font-bold'>
                {t('orderDetail.estimatedDeliveryAt', 'Dự kiến giao hàng')}
              </p>
              <p className='font-semibold text-foreground text-sm flex items-center gap-1.5'>
                <MaterialIcon name='event' className='text-primary text-[18px]' />
                <span>{formatDateTime(order.estimatedDeliveryAt)}</span>
              </p>
            </div>
          )}
        </div>
        <div className='space-y-4'>
          <div>
            <p className='text-[10px] text-muted-foreground uppercase tracking-widest mb-1 font-bold'>
              {t('orderDetail.address', 'Địa chỉ giao hàng')}
            </p>
            <p className='text-sm text-foreground leading-relaxed font-medium'>
              {order.address || t('orderDetail.notProvided', 'Chưa cung cấp')}
            </p>
          </div>
          {order.note && (
            <div className='p-3 bg-muted rounded-lg border border-border/40'>
              <p className='text-[10px] text-muted-foreground uppercase tracking-widest mb-1 font-bold'>
                {t('orderDetail.note', 'Ghi chú')}
              </p>
              <p className='text-xs italic text-muted-foreground'>"{order.note}"</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
