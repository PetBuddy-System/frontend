// app/features/profile/components/returns/return-warranty-form.tsx
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { MaterialIcon } from '~/shared/ui'
import { ReturnWarrantySuccess } from './return-warranty-success'
import { ReturnOrderProducts } from './return-order-products'
import { ReturnWarrantyStepType } from './return-warranty-step-type'
import { ReturnWarrantyStepReason } from './return-warranty-step-reason'
import { ReturnWarrantyStepPhotos } from './return-warranty-step-photos'
import {
  fetchOrderDetailApi,
  calculateRefundApi,
  createReturnRequestApi,
  uploadReturnMediaApi,
  fetchPaymentByOrderIdApi
} from '~/features/profile/services'
import type {
  ReturnType,
  ReturnReason,
  RefundMethod,
  CalculateRefundResponse,
  CreateReturnRequest
} from '~/shared/lib/returns'
import type { OrderResponse } from '~/shared/lib/order'

// Format helpers
function formatPrice(value: number) {
  if (value == null || isNaN(Number(value))) return '0đ'
  return `${new Intl.NumberFormat('vi-VN').format(Number(value))}đ`
}

function formatDate(dateString: string) {
  if (!dateString) return ''
  const d = new Date(dateString)
  if (isNaN(d.getTime())) return dateString
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  return `${dd}/${mm}/${yyyy}`
}

export interface ReturnWarrantyFormProps {
  orderId: number // Bắt buộc nhận orderId từ Order Detail
  onSuccess?: () => void
  onCancel?: () => void
}

export function ReturnWarrantyForm({ orderId, onSuccess, onCancel }: ReturnWarrantyFormProps) {
  const { t } = useTranslation('profile')

  // Order detail state
  const [order, setOrder] = useState<OrderResponse | null>(null)
  const [isOrderLoading, setIsOrderLoading] = useState(true)

  // Form states
  const [selectedProducts, setSelectedProducts] = useState<Record<string, boolean>>({})
  const [selectedQuantities, setSelectedQuantities] = useState<Record<string, number>>({})
  const [requestType, setRequestType] = useState<ReturnType>('RETURN')
  const [reason, setReason] = useState<ReturnReason>('WRONG_PRODUCT')
  const [description, setDescription] = useState<string>('')
  const [refundMethod, setRefundMethod] = useState<RefundMethod>('STRIPE_PAYMENT')

  // Bank details state
  const [bankName, setBankName] = useState<string>('')
  const [bankAccountNumber, setBankAccountNumber] = useState<string>('')
  const [bankAccountHolder, setBankAccountHolder] = useState<string>('')

  // Files/Photos state
  const [files, setFiles] = useState<File[]>([])

  // Calculation state
  const [calculatedRefund, setCalculatedRefund] = useState<CalculateRefundResponse | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)

  // Form submission state
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false)

  // Payment method state
  const [orderPaymentMethod, setOrderPaymentMethod] = useState<string>('')
  const [isLoadingPayment, setIsLoadingPayment] = useState(false)

  // Fetch order detail on mount
  useEffect(() => {
    async function loadOrder() {
      setIsOrderLoading(true)
      try {
        const res = await fetchOrderDetailApi(orderId)
        if (res.success && res.data) {
          setOrder(res.data)
        } else {
          setError('Không thể tải thông tin đơn hàng')
        }
      } catch (err) {
        console.error('Failed to load order detail', err)
        setError('Không thể tải thông tin đơn hàng')
      } finally {
        setIsOrderLoading(false)
      }
    }
    void loadOrder()
  }, [orderId])

  // Fetch payment method
  useEffect(() => {
    async function loadPayment() {
      setIsLoadingPayment(true)
      try {
        const res = await fetchPaymentByOrderIdApi(orderId)
        if (res.success && res.data) {
          const paymentMethod = res.data.paymentMethod || ''
          setOrderPaymentMethod(paymentMethod)
          // Nếu thanh toán bằng CASH, chỉ cho phép BANK_TRANSFER
          if (paymentMethod === 'CASH') {
            setRefundMethod('BANK_TRANSFER')
          } else {
            setRefundMethod('STRIPE_PAYMENT')
          }
        }
      } catch (err) {
        console.error('Failed to load payment info', err)
      } finally {
        setIsLoadingPayment(false)
      }
    }
    void loadPayment()
  }, [orderId])

  // Map order items to product list for ReturnOrderProducts
  // Tính giá sau giảm từ totalPrice / quantity
  const orderItems = order?.orderDetails?.map((item: any) => {
    // Giá sau giảm = totalPrice / quantity
    const finalPrice = (item.totalPrice && item.quantity)
      ? item.totalPrice / item.quantity
      : item.unitPrice || item.price || 0

    return {
      id: String(item.orderDetailId || item.id || ''),
      productId: String(item.productId || ''),
      name: item.productName || item.name || 'Sản phẩm',
      quantity: item.quantity || 1,
      price: formatPrice(finalPrice),  // ← Giá sau giảm
      image: item.productImage || item.imageUrl || item.thumbnail || ''
    }
  }) || []

  // Calculate refund when selected items, quantity, or reason changes
  useEffect(() => {
    if (!order) {
      setCalculatedRefund(null)
      return
    }

    const activeItems = Object.keys(selectedProducts)
      .filter((id) => selectedProducts[id])
      .map((id) => ({
        orderDetailId: Number(id),
        quantity: selectedQuantities[id] || 1
      }))

    if (activeItems.length === 0) {
      setCalculatedRefund(null)
      return
    }

    const timer = setTimeout(async () => {
      setIsCalculating(true)
      try {
        const res = await calculateRefundApi({
          orderId: orderId,
          reason,
          items: activeItems
        })
        if (res.success && res.data) {
          setCalculatedRefund(res.data)
        }
      } catch (err) {
        console.error('Failed to calculate refund', err)
      } finally {
        setIsCalculating(false)
      }
    }, 400)

    return () => clearTimeout(timer)
  }, [orderId, selectedProducts, selectedQuantities, reason, order])

  const handleProductToggle = (productId: string) => {
    setSelectedProducts((prev) => {
      const updated = { ...prev, [productId]: !prev[productId] }
      if (updated[productId] && !selectedQuantities[productId]) {
        setSelectedQuantities((qPrev) => ({ ...qPrev, [productId]: 1 }))
      }
      return updated
    })
    setError(null)
  }

  const handleQuantityChange = (productId: string, qty: number) => {
    setSelectedQuantities((prev) => ({
      ...prev,
      [productId]: qty
    }))
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate: có chọn sản phẩm không?
    const hasSelectedProduct = Object.values(selectedProducts).some((val) => val === true)
    if (!hasSelectedProduct) {
      setError('Vui lòng chọn ít nhất một sản phẩm để đổi trả.')
      return
    }

    // Validate: mô tả
    if (!description.trim() || description.trim().length < 10) {
      setError('Vui lòng mô tả chi tiết lý do (tối thiểu 10 ký tự).')
      return
    }

    // Validate: thông tin ngân hàng nếu là RETURN và chọn BANK_TRANSFER
    if (requestType === 'RETURN' && refundMethod === 'BANK_TRANSFER') {
      if (!bankName.trim() || !bankAccountNumber.trim() || !bankAccountHolder.trim()) {
        setError('Vui lòng nhập đầy đủ thông tin tài khoản ngân hàng để nhận hoàn tiền.')
        return
      }
    }

    setError(null)
    setIsSubmitting(true)

    try {
      const activeItems = Object.keys(selectedProducts)
        .filter((id) => selectedProducts[id])
        .map((id) => ({
          orderDetailId: Number(id),
          quantity: selectedQuantities[id] || 1
        }))

      const payload: CreateReturnRequest = {
        orderId: orderId,
        type: requestType,
        reason,
        description,
        ...(requestType === 'RETURN' && {
          refundMethod,
          bankName: refundMethod === 'BANK_TRANSFER' ? bankName : undefined,
          bankAccountNumber: refundMethod === 'BANK_TRANSFER' ? bankAccountNumber : undefined,
          bankAccountHolder: refundMethod === 'BANK_TRANSFER' ? bankAccountHolder : undefined
        }),
        items: activeItems
      }

      const res = await createReturnRequestApi(payload)
      if (res.success && res.data) {
        const returnId = res.data.returnRequestId

        // Upload files nếu có
        if (files.length > 0) {
          await uploadReturnMediaApi(returnId, files)
        }

        setIsSubmitted(true)
      } else {
        setError(res.message || 'Lỗi khi tạo yêu cầu đổi trả.')
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Lỗi hệ thống khi tạo yêu cầu đổi trả.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setSelectedProducts({})
    setSelectedQuantities({})
    setRequestType('RETURN')
    setReason('WRONG_PRODUCT')
    setDescription('')
    setRefundMethod('STRIPE_PAYMENT')
    setBankName('')
    setBankAccountNumber('')
    setBankAccountHolder('')
    setFiles([])
    setCalculatedRefund(null)
    setError(null)
    setIsSubmitted(false)

    if (onSuccess) {
      onSuccess()
    }
  }

  // Success state
  if (isSubmitted) {
    return <ReturnWarrantySuccess onReset={resetForm} />
  }

  // Loading state
  if (isOrderLoading) {
    return (
      <div className='rounded-2xl border border-border bg-card p-12 text-center text-muted-foreground animate-pulse'>
        Đang tải thông tin đơn hàng...
      </div>
    )
  }

  // Error state - không tìm thấy order
  if (!order) {
    return (
      <div className='rounded-2xl border border-border bg-card p-12 text-center'>
        <MaterialIcon name='error_outline' className='mx-auto text-5xl text-destructive' />
        <p className='mt-4 text-muted-foreground'>Không tìm thấy thông tin đơn hàng</p>
        <button
          type='button'
          onClick={onCancel}
          className='mt-4 rounded-lg bg-primary px-6 py-2 text-sm font-bold text-primary-foreground'
        >
          Đóng
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className='space-y-6'>
      {/* Error display */}
      {error && (
        <div className='flex items-center gap-2 rounded-xl bg-destructive/10 p-4 text-sm font-semibold text-destructive'>
          <MaterialIcon name='error' className='shrink-0 text-xl' />
          <span>{error}</span>
        </div>
      )}

      {/* Step 1: Chọn sản phẩm - sử dụng ReturnOrderProducts với giá sau giảm */}
      <ReturnOrderProducts
        orderId={orderId}
        orderCode={order.orderCode}
        orderDate={order.createdAt ? formatDate(order.createdAt) : undefined}
        items={orderItems}
        selectedProducts={selectedProducts}
        selectedQuantities={selectedQuantities}
        onProductToggle={handleProductToggle}
        onQuantityChange={handleQuantityChange}
      />

      {/* Step 2: Chọn loại đổi trả */}
      <ReturnWarrantyStepType
        requestType={requestType}
        onChange={(val) => {
          setRequestType(val)
          if (val !== 'RETURN') {
            setRefundMethod('STRIPE_PAYMENT')
            setBankName('')
            setBankAccountNumber('')
            setBankAccountHolder('')
            setCalculatedRefund(null)
          }
        }}
      />

      {/* Step 3: Chọn lý do và thông tin hoàn tiền */}
      <ReturnWarrantyStepReason
        requestType={requestType}
        reason={reason}
        description={description}
        refundMethod={refundMethod}
        bankName={bankName}
        bankAccountNumber={bankAccountNumber}
        bankAccountHolder={bankAccountHolder}
        orderPaymentMethod={orderPaymentMethod}
        isLoadingPayment={isLoadingPayment}
        onReasonChange={(val) => {
          setReason(val)
          setError(null)
        }}
        onDescriptionChange={(val) => {
          setDescription(val)
          setError(null)
        }}
        onRefundMethodChange={(val) => {
          setRefundMethod(val)
          setError(null)
        }}
        onBankNameChange={setBankName}
        onBankAccountNumberChange={setBankAccountNumber}
        onBankAccountHolderChange={setBankAccountHolder}
      />

      {/* Step 4: Upload ảnh */}
      <ReturnWarrantyStepPhotos files={files} onFilesChange={setFiles} />

      {/* Refund calculation display */}
      {requestType === 'RETURN' && isCalculating && (
        <div className='rounded-xl border border-border bg-card p-4 text-center text-sm text-muted-foreground animate-pulse'>
          Đang tính toán tiền hoàn...
        </div>
      )}

      {requestType === 'RETURN' && !isCalculating && calculatedRefund && (
        <div className='rounded-xl border border-primary/20 bg-primary/5 p-5 shadow-sm animate-in fade-in duration-200'>
          <div className='flex justify-between items-center border-b border-primary/10 pb-3 mb-3'>
            <span className='font-display font-bold text-foreground text-sm flex items-center gap-1.5'>
              <MaterialIcon name='calculate' className='text-primary' />
              Chi tiết hoàn trả dự kiến
            </span>
            <span className='text-xs text-muted-foreground'>({calculatedRefund.items.length} sản phẩm)</span>
          </div>

          {/* Table */}
          <div className='overflow-x-auto'>
            <table className='w-full text-sm'>
              <thead>
                <tr className='border-b border-primary/10 text-left text-xs font-semibold uppercase text-muted-foreground'>
                  <th className='pb-2 pr-4 font-medium'>Sản phẩm</th>
                  <th className='pb-2 pr-4 font-medium text-center'>Số lượng</th>
                  <th className='pb-2 font-medium text-right'>Thành tiền</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-border/50'>
                {calculatedRefund.items.map((item) => (
                  <tr key={item.orderDetailId} className='text-foreground'>
                    <td className='py-2.5 pr-4 font-medium'>{item.productName}</td>
                    <td className='py-2.5 pr-4 text-center text-muted-foreground'>x{item.quantity}</td>
                    <td className='py-2.5 text-right font-semibold text-primary'>
                      {formatPrice(item.refundAmount)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className='border-t-2 border-primary/20'>
                  <td colSpan={2} className='py-3 pr-4 text-right font-display font-extrabold text-foreground text-sm'>
                    Tổng tiền hoàn trả ước tính:
                  </td>
                  <td className='py-3 text-right text-xl font-black text-primary'>
                    {formatPrice(calculatedRefund.totalRefundAmount)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
      {/* Submit buttons */}
      <div className='flex gap-3'>
        <button
          type='button'
          onClick={onCancel}
          className='flex-1 rounded-xl border border-border bg-background py-4 font-display text-lg font-bold text-foreground hover:bg-muted active:scale-[0.98] transition-all'
        >
          Hủy
        </button>
        <button
          type='submit'
          disabled={isSubmitting}
          className='flex-1 flex items-center justify-center gap-2 rounded-xl bg-primary py-4 font-display text-lg font-bold text-primary-foreground shadow-md hover:brightness-105 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none'
        >
          <span>{isSubmitting ? 'Đang gửi yêu cầu...' : 'Gửi yêu cầu'}</span>
          <MaterialIcon name='send' />
        </button>
      </div>
    </form>
  )
}