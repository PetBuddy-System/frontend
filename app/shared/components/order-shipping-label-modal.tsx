import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { OrderDetailFull } from '~/shared/lib/order'
import { MaterialIcon } from '~/shared/ui'
import { getCurrentStoreLocationApi } from '../../features/manager/services/store-location/store-location-api'

interface OrderShippingLabelModalProps {
  order: OrderDetailFull
  onClose: () => void
}

function formatCODAmount(value: number) {
  if (value == null || isNaN(Number(value))) return '0'
  return new Intl.NumberFormat('vi-VN').format(Number(value))
}

export function OrderShippingLabelModal({ order, onClose }: OrderShippingLabelModalProps) {
  const { t } = useTranslation('staff')
  const [storeAddress, setStoreAddress] = useState<string | null>(null)
  const [isLoadingStore, setIsLoadingStore] = useState(true)
  const [storeError, setStoreError] = useState('')

  useEffect(() => {
    function handleEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [onClose])

  useEffect(() => {
    async function loadStoreLocation() {
      setIsLoadingStore(true)
      setStoreError('')
      try {
        const res = await getCurrentStoreLocationApi()
        if (res.success && res.data?.address) {
          setStoreAddress(res.data.address)
        } else {
          setStoreError(t('shippingLabel.storeAddressError', 'Chưa cấu hình vị trí cửa hàng'))
        }
      } catch (err) {
        console.error('Failed to load current store location', err)
        setStoreError(t('shippingLabel.storeAddressLoadError', 'Không thể tải vị trí cửa hàng'))
      } finally {
        setIsLoadingStore(false)
      }
    }
    void loadStoreLocation()
  }, [t])

  const totalQuantity = order.orderDetails?.reduce((sum, item) => sum + item.quantity, 0) ?? 0
  const totalWeight = order.orderDetails?.reduce((sum, item) => sum + item.quantity * (item.weight ?? 0), 0) || 0
  const isPaidOnline = order.payment?.paymentMethod === 'CARD' && order.payment?.status === 'PAID'
  const codAmount = isPaidOnline ? 0 : order.finalAmount

  return (
    <div className='fixed inset-0 z-50 flex flex-col items-center bg-black/40 backdrop-blur-sm p-4 print:p-0 print:bg-white print:backdrop-blur-none'>
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          .print-label-content, .print-label-content * { visibility: visible !important; }
          .print-label-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            max-width: 100% !important;
            box-shadow: none !important;
          }
          .no-print { display: none !important; }
          .print-label-content, .print-label-content * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
        }
        .barcode-strip {
          height: 60px;
          background-image: repeating-linear-gradient(90deg, #000 0, #000 2px, transparent 2px, transparent 4px, #000 4px, #000 5px, transparent 5px, transparent 8px);
        }
      `}</style>

      <div className='bg-card w-full max-w-[900px] rounded-xl border border-border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] print:max-h-none print:shadow-none print:border-none print:rounded-none'>
        <div className='no-print flex justify-between items-center p-6 border-b border-border bg-card'>
          <div>
            <h2 className='font-bold text-lg text-foreground'>
              {t('shippingLabel.previewTitle', 'Xem trước đơn hàng')}
            </h2>
            <p className='text-sm text-muted-foreground'>
              {t('shippingLabel.orderCodeLabel', 'Mã vận đơn:')} <span className='font-mono'>{order.orderCode}</span>
            </p>
          </div>
          <button onClick={onClose} className='p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground'>
            <MaterialIcon name='close' className='text-[20px]' />
          </button>
        </div>

        <div className='no-print px-6 py-4 bg-muted/30 border-b border-border flex justify-end gap-3 items-center'>
          <button
            onClick={onClose}
            className='px-4 py-2.5 rounded-lg font-semibold text-sm text-foreground hover:bg-muted transition-colors border border-border'
          >
            {t('shippingLabel.close', 'Đóng')}
          </button>
          <button
            onClick={() => window.print()}
            className='bg-primary text-primary-foreground px-6 py-2.5 rounded-lg font-semibold text-sm flex items-center gap-2 shadow-md hover:bg-primary/90 active:scale-95 transition-all'
          >
            <MaterialIcon name='print' className='text-[20px]' />
            {t('shippingLabel.print', 'In đơn hàng')}
          </button>
        </div>

        <div className='p-10 bg-muted/20 overflow-y-auto flex-1 min-h-0 flex justify-center print:p-0 print:bg-white'>
          <main className='print-label-content bg-white border border-neutral-300 text-black w-full max-w-[180mm] min-h-[120mm] flex flex-col rounded shadow-sm'>
            <section className='grid grid-cols-2 border-b border-neutral-300'>
              <div className='p-6 border-r border-neutral-300 flex flex-col justify-center'>
                <p className='font-bold text-lg text-black mb-2'>PetBuddy</p>
              </div>
              <div className='p-6 flex flex-col items-center justify-center'>
                <div className='barcode-strip w-full max-w-[200px] mb-2' />
                <div className='font-mono text-[14px] font-bold tracking-[0.3em] text-black'>{order.orderCode}</div>
              </div>
            </section>

            <section className='grid grid-cols-2 border-b border-neutral-300'>
              <div className='p-4 border-r border-neutral-300'>
                <p className='text-[10px] font-bold uppercase mb-2 text-neutral-600'>
                  {t('shippingLabel.senderLabel', 'Từ (Sender):')}
                </p>
                <p className='text-base font-bold leading-tight mb-1 text-black'>
                  {t('shippingLabel.storeName', 'PetBuddy Store')}
                </p>
                <p className='text-sm leading-snug text-black'>
                  {isLoadingStore
                    ? t('shippingLabel.loadingStoreAddress', 'Đang tải địa chỉ...')
                    : storeError
                      ? storeError
                      : storeAddress}
                </p>
              </div>
              <div className='p-4 border-r border-neutral-300'>
                <p className='text-[10px] font-bold uppercase mb-2 text-neutral-600'>
                  {t('shippingLabel.recipientLabel', 'Đến (Recipient):')}
                </p>
                <p className='text-base font-bold leading-tight mb-1 text-black'>
                  {order.recipientName || t('shippingLabel.notProvided', 'Chưa cung cấp')}
                </p>
                <p className='text-sm font-bold mb-2 text-black'>
                  {order.phoneNumber || t('shippingLabel.notProvided', 'Chưa cung cấp')}
                </p>
                <p className='text-sm leading-snug text-black'>
                  {order.address || t('shippingLabel.notProvided', 'Chưa cung cấp')}
                </p>
              </div>
            </section>

            <section className='grid grid-cols-2 grid-rows-2 border-l border-r border-b border-neutral-300 flex-grow'>
              <div className='p-4 border-r border-b border-neutral-300 bg-neutral-50/50 grid grid-cols-2 gap-4'>
                <div>
                  <p className='text-[10px] font-bold uppercase mb-2 text-neutral-600'>
                    {t('shippingLabel.itemsLabel', 'Hàng hóa (Items):')}
                  </p>
                  <div className='space-y-1 max-h-24 overflow-y-auto'>
                    {order.orderDetails?.map((detail) => (
                      <p key={detail.orderDetailId} className='text-sm font-medium text-black'>
                        {detail.quantity} x {detail.productName}
                      </p>
                    ))}
                  </div>
                  <p className='text-[11px] text-neutral-600 mt-1'>
                    {t('shippingLabel.totalQuantity', '(Tổng SL: {{count}})', { count: totalQuantity })}
                  </p>
                </div>
                <div className='border-l border-dashed border-neutral-300 pl-4'>
                  <p className='text-[10px] font-bold uppercase mb-0.5 text-black'>
                    {t('shippingLabel.weightLabel', 'Khối lượng:')}
                  </p>
                  <p className='text-sm font-bold text-black'>
                    {totalWeight} {t('shippingLabel.gramUnit', 'gram')}
                  </p>
                </div>
              </div>

              <div className='p-4 border-b border-neutral-300 bg-neutral-50/50'>
                <p className='text-[10px] font-bold uppercase mb-1 text-black'>
                  {t('shippingLabel.noteLabel', 'Ghi chú:')}
                </p>
                <div className='bg-neutral-100 p-2 rounded border border-neutral-300'>
                  <p className='text-[11px] italic leading-tight text-black'>
                    {order.note || t('shippingLabel.noNote', 'Không có ghi chú')}
                  </p>
                </div>
              </div>

              <div className='p-6 border-r border-neutral-300 flex flex-col items-center justify-center text-center'>
                <p className='text-sm font-medium text-neutral-600 mb-1'>
                  {t('shippingLabel.codLabel', 'Tiền thu người nhận (COD):')}
                </p>
                <p className='text-[32px] font-bold leading-none text-primary'>
                  {formatCODAmount(codAmount)}{' '}
                  <span className='text-lg font-semibold'>{t('shippingLabel.currencyUnit', 'VNĐ')}</span>
                </p>
                {isPaidOnline && (
                  <p className='text-[11px] text-emerald-700 font-semibold mt-1'>
                    {t('shippingLabel.paidOnline', '(Đã thanh toán trực tuyến)')}
                  </p>
                )}
              </div>

              <div className='p-6 flex flex-col items-center justify-center text-center'>
                <div className='w-full border-2 border-dashed border-neutral-300 p-6 min-h-[140px] flex flex-col items-center justify-between'>
                  <p className='text-base font-bold text-black'>
                    {t('shippingLabel.signatureTitle', 'Chữ ký người nhận')}
                  </p>
                  <div className='w-full'>
                    <p className='text-[10px] font-bold text-neutral-600 uppercase mb-4'>
                      {t('shippingLabel.signatureConfirm', 'Xác nhận hàng nguyên vẹn, không móp vỡ')}
                    </p>
                    <div className='border-b border-dotted border-neutral-300 w-3/4 mx-auto' />
                  </div>
                </div>
              </div>
            </section>

            <footer className='p-3 border-l border-r border-b border-neutral-300 bg-neutral-100/50 text-center'>
              <p className='text-[10px] font-bold text-neutral-600 uppercase tracking-widest'>
                {t('shippingLabel.footerText', '© {{year}} PetBuddy Logistics - Hệ thống vận hành bưu cục thông minh', {
                  year: new Date().getFullYear()
                })}
              </p>
            </footer>
          </main>
        </div>
      </div>
    </div>
  )
}
