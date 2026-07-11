import { useState, type ChangeEvent, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { MaterialIcon } from '~/shared/ui'
import { ReturnWarrantySuccess } from './return-warranty-success'
import { ReturnWarrantyStepOrder, type ReturnOrder } from './return-warranty-step-order'
import { ReturnWarrantyStepType } from './return-warranty-step-type'
import { ReturnWarrantyStepReason } from './return-warranty-step-reason'
import { ReturnWarrantyStepPhotos } from './return-warranty-step-photos'
import {
  fetchMyOrdersApi,
  calculateRefundApi,
  createReturnRequestApi,
  uploadReturnMediaApi
} from '~/features/profile/services'
import type {
  ReturnType,
  ReturnReason,
  RefundMethod,
  CalculateRefundResponse,
  CreateReturnRequest
} from '~/shared/lib/returns'
import type { OrderResponse } from '~/shared/lib/order'

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
  onSuccess?: () => void
}

export function ReturnWarrantyForm({ onSuccess }: ReturnWarrantyFormProps) {
  const { t } = useTranslation('profile')

  // Orders list state
  const [orders, setOrders] = useState<OrderResponse[]>([])
  const [isOrdersLoading, setIsOrdersLoading] = useState(true)

  // Form states
  const [selectedOrderId, setSelectedOrderId] = useState<string>('')
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

  // Fetch client orders on mount
  useEffect(() => {
    async function loadOrders() {
      setIsOrdersLoading(true)
      try {
        const res = await fetchMyOrdersApi({ page: 0, size: 100 })
        if (res.success && res.data) {
          setOrders(res.data.content)
        }
      } catch (err) {
        console.error('Failed to load user orders', err)
      } finally {
        setIsOrdersLoading(false)
      }
    }
    void loadOrders()
  }, [])

  // Calculate refund when selected items, quantity, or reason changes
  useEffect(() => {
    if (!selectedOrderId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
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
          orderId: Number(selectedOrderId),
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
    }, 400) // Debounce API requests

    return () => clearTimeout(timer)
  }, [selectedOrderId, selectedProducts, selectedQuantities, reason])

  // Map live orders to ReturnOrder[] UI structure
  const mappedOrders: ReturnOrder[] = orders.map((o) => {
    const rawItems = (o.orderDetails || (o as OrderResponse & { items?: unknown[] }).items || []) as Array<{
      orderDetailId?: number
      productId?: string
      productName?: string
      name?: string
      quantity?: number
      unitPrice?: number
      price?: number
      productImage?: string
      imageUrl?: string
    }>

    return {
      id: String(o.orderId),
      orderCode: o.orderCode || String(o.orderId),
      date: formatDate(o.createdAt),
      products: rawItems.map((item, idx) => {
        const orderDetailId = item.orderDetailId != null ? item.orderDetailId : (100 + idx)
        const name = item.productName || item.name || 'Sản phẩm'
        const quantity = item.quantity || 1
        const unitPrice = item.unitPrice || item.price || 0
        const image = item.productImage || item.imageUrl || ''

        return {
          id: String(orderDetailId),
          productId: item.productId || String(idx),
          name,
          quantity,
          price: formatPrice(unitPrice),
          image
        }
      })
    }
  })

  const handleOrderChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const orderId = e.target.value
    setSelectedOrderId(orderId)
    setSelectedProducts({})
    setSelectedQuantities({})
    setCalculatedRefund(null)
    setError(null)
  }

  const handleProductToggle = (productId: string) => {
    setSelectedProducts((prev) => {
      const updated = { ...prev, [productId]: !prev[productId] }
      // Initialize quantity if checked
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

    if (!selectedOrderId) {
      setError(t('returnWarranty.order.placeholder'))
      return
    }

    const hasSelectedProduct = Object.values(selectedProducts).some((val) => val === true)
    if (!hasSelectedProduct) {
      setError(t('returnWarranty.order.selectProducts'))
      return
    }

    if (!description.trim() || description.trim().length < 10) {
      setError('Vui lòng mô tả chi tiết lý do (tối thiểu 10 ký tự).')
      return
    }

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
        orderId: Number(selectedOrderId),
        type: requestType,
        reason,
        description,
        // Chỉ gửi refundMethod khi Trả hàng hoàn tiền
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
        
        // If there are files, upload them
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
    setSelectedOrderId('')
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

  if (isSubmitted) {
    return <ReturnWarrantySuccess onReset={resetForm} />
  }

  if (isOrdersLoading) {
    return (
      <div className='rounded-2xl border border-border bg-card p-12 text-center text-muted-foreground animate-pulse'>
        Đang tải thông tin đơn hàng của bạn...
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className='space-y-6'>
      {error && (
        <div className='flex items-center gap-2 rounded-xl bg-destructive/10 p-4 text-sm font-semibold text-destructive'>
          <MaterialIcon name='error' className='shrink-0 text-xl' />
          <span>{error}</span>
        </div>
      )}

      {/* Step 1: Chọn đơn hàng & sản phẩm */}
      <ReturnWarrantyStepOrder
        selectedOrderId={selectedOrderId}
        selectedProducts={selectedProducts}
        selectedQuantities={selectedQuantities}
        orders={mappedOrders}
        onOrderChange={handleOrderChange}
        onProductToggle={handleProductToggle}
        onQuantityChange={handleQuantityChange}
      />

      {/* Step 2: Hình thức yêu cầu */}
      <ReturnWarrantyStepType
        requestType={requestType}
        onChange={(val) => {
          setRequestType(val)
          // Reset refund fields khi không phải Trả hàng hoàn tiền
          if (val !== 'RETURN') {
            setRefundMethod('STRIPE_PAYMENT')
            setBankName('')
            setBankAccountNumber('')
            setBankAccountHolder('')
            setCalculatedRefund(null)
          }
        }}
      />

      {/* Step 3: Lý do, Mô tả & Phương thức hoàn tiền */}
      <ReturnWarrantyStepReason
        requestType={requestType}
        reason={reason}
        description={description}
        refundMethod={refundMethod}
        bankName={bankName}
        bankAccountNumber={bankAccountNumber}
        bankAccountHolder={bankAccountHolder}
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

      {/* Step 4: Hình ảnh minh họa */}
      <ReturnWarrantyStepPhotos files={files} onFilesChange={setFiles} />

      {/* TÍNH TIỀN HOÀN - Chỉ hiển thị khi Trả hàng hoàn tiền */}
      {requestType === 'RETURN' && isCalculating && (
        <div className='rounded-xl border border-border bg-card p-4 text-center text-sm text-muted-foreground animate-pulse'>
          Đang tính toán tiền hoàn...
        </div>
      )}

      {requestType === 'RETURN' && !isCalculating && calculatedRefund && (
        <div className='rounded-xl border border-primary/20 bg-primary/5 p-5 space-y-3.5 shadow-sm animate-in fade-in duration-200'>
          <div className='flex justify-between items-center border-b border-primary/10 pb-2'>
            <span className='font-display font-bold text-foreground text-sm flex items-center gap-1.5'>
              <MaterialIcon name='calculate' className='text-primary' />
              Chi tiết hoàn trả dự kiến
            </span>
            <span className='text-xs text-muted-foreground'>({calculatedRefund.items.length} sản phẩm)</span>
          </div>

          <div className='space-y-2.5 max-h-48 overflow-y-auto pr-1'>
            {calculatedRefund.items.map((item) => (
              <div key={item.orderDetailId} className='flex justify-between gap-4 text-xs text-muted-foreground'>
                <span className='truncate font-medium text-foreground'>{item.productName}</span>
                <span className='shrink-0 text-right'>
                  SL: <strong>{item.quantity}</strong> &rarr; <strong className='text-primary'>{formatPrice(item.refundAmount)}</strong>
                </span>
              </div>
            ))}
          </div>

          <div className='flex justify-between items-center pt-2.5 border-t border-primary/15 font-display'>
            <span className='font-extrabold text-foreground text-sm'>Tổng tiền hoàn trả ước tính:</span>
            <span className='text-xl font-black text-primary'>{formatPrice(calculatedRefund.totalRefundAmount)}</span>
          </div>
        </div>
      )}

      <button
        type='submit'
        disabled={isSubmitting}
        className='flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 font-display text-lg font-bold text-primary-foreground shadow-md hover:brightness-105 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none'
      >
        <span>{isSubmitting ? 'Đang gửi yêu cầu...' : t('returnWarranty.submit')}</span>
        <MaterialIcon name='send' />
      </button>
    </form>
  )
}
