import { useMemo, useState, useEffect, useCallback } from 'react'
import type { FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useLocation } from 'react-router'
import { STORAGE_KEYS } from '~/shared/config/site'

import { CheckoutNote } from '../components/checkout/checkout-note'
import { CheckoutOrderSummary, type CheckoutOrderItem, } from '../components/checkout/checkout-order-summary'
import { CheckoutPaymentMethods, type SelectedPaymentMethod } from '../components/checkout/checkout-payment-methods'
import { CheckoutShippingForm, toPhoneDisplay } from '../components/checkout/checkout-shipping-form'
import { OutOfStockModal } from '../components/checkout/out-of-stock-modal'
import { AdjustedQuantityModal } from '../components/checkout/adjusted-quantity-modal'
import { SiteBottomNav, SiteFab, SiteFooter, SiteHeader } from '~/shared/components'
import { createOrderApi, getCartApi, removeCartItemApi, getPaymentByOrderIdApi, fetchOrderByIdApi, fetchActiveVouchersApi } from '../services'
import type { CreateOrderRequest } from '~/shared/lib/order'
import type { CartItemResponse } from '~/shared/lib/cart'
import { MaterialIcon } from '~/shared/ui'
import { readStorage } from '~/shared/lib/storage'
import { useAuth } from '~/providers/auth-provider'
import {
  SESSION_KEY_ADDRESS,
  SESSION_KEY_LAT,
  SESSION_KEY_LNG,
  SESSION_KEY_SHIPPING_FEE,
  SESSION_KEY_IS_FREE_SHIPPING,
  SESSION_KEY_VOUCHER_CODE,
  SESSION_KEY_VOUCHER_NAME,
  SESSION_KEY_VOUCHER_DISCOUNT,
  SESSION_KEY_PAYMENT_METHOD,
  SESSION_KEY_SUBTOTAL,
  clearCheckoutSessionData,
} from '../lib/checkout-storage-keys'
import { isVoucherEligible } from '~/shared/lib/voucher'

function formatPrice(value: number) {
  return `${new Intl.NumberFormat('vi-VN').format(value)}đ`
}

function getFormString(formData: FormData, key: string) {
  const value = formData.get(key)
  return typeof value === 'string' ? value.trim() : ''
}

export function CheckoutPage() {
  const { t } = useTranslation('products')
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()

  const pendingOrderId = (location.state as { orderId?: number } | null)?.orderId ?? null

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [rawCartItems, setRawCartItems] = useState<CartItemResponse[]>([])
  const [cartItems, setCartItems] = useState<CheckoutOrderItem[]>([])

  const [outOfStockProductName, setOutOfStockProductName] = useState<string | null>(null)

  // Queue các sản phẩm bị giảm số lượng — hiển thị từng cái một
  const [adjustedQueue, setAdjustedQueue] = useState<CartItemResponse[]>([])
  const currentAdjustedItem = adjustedQueue[0] ?? null

  const [selectedAddress, setSelectedAddress] = useState('')
  const [shippingFee, setShippingFee] = useState(0)
  const [isFreeShipping, setIsFreeShipping] = useState(true)
  const [deliveryLat, setDeliveryLat] = useState(0)
  const [deliveryLng, setDeliveryLng] = useState(0)
  const [voucherCode, setVoucherCode] = useState('')
  const [voucherName, setVoucherName] = useState('')
  const [voucherDiscount, setVoucherDiscount] = useState(0)

  interface PendingOrderView {
    orderId: number
    clientSecret: string
    subtotal: number
    shippingFee: number
    isFreeShipping: boolean
    voucherDiscount: number
    finalAmount: number
  }
  const [pendingOrder, setPendingOrder] = useState<PendingOrderView | null>(null)

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<SelectedPaymentMethod>(() => {
    const saved = typeof window !== 'undefined' ? sessionStorage.getItem(SESSION_KEY_PAYMENT_METHOD) : null
    return (saved === 'CASH' || saved === 'CARD') ? saved : 'CASH'
  })

  function handlePaymentMethodChange(method: SelectedPaymentMethod) {
    setSelectedPaymentMethod(method)
    sessionStorage.setItem(SESSION_KEY_PAYMENT_METHOD, method)
  }

  function syncFromSession() {
    setSelectedAddress(sessionStorage.getItem(SESSION_KEY_ADDRESS) ?? '')
    setShippingFee(parseInt(sessionStorage.getItem(SESSION_KEY_SHIPPING_FEE) ?? '0', 10))
    setIsFreeShipping(sessionStorage.getItem(SESSION_KEY_IS_FREE_SHIPPING) !== 'false')
    setDeliveryLat(parseFloat(sessionStorage.getItem(SESSION_KEY_LAT) ?? '0'))
    setDeliveryLng(parseFloat(sessionStorage.getItem(SESSION_KEY_LNG) ?? '0'))
    setVoucherCode(sessionStorage.getItem(SESSION_KEY_VOUCHER_CODE) ?? '')
    setVoucherName(sessionStorage.getItem(SESSION_KEY_VOUCHER_NAME) ?? '')
    setVoucherDiscount(parseInt(sessionStorage.getItem(SESSION_KEY_VOUCHER_DISCOUNT) ?? '0', 10))
  }

  function clearCheckoutSession() {
  sessionStorage.removeItem(SESSION_KEY_ADDRESS)
  sessionStorage.removeItem(SESSION_KEY_LAT)
  sessionStorage.removeItem(SESSION_KEY_LNG)
  sessionStorage.removeItem(SESSION_KEY_SHIPPING_FEE)
  sessionStorage.removeItem(SESSION_KEY_IS_FREE_SHIPPING)
  sessionStorage.removeItem(SESSION_KEY_VOUCHER_CODE)
  sessionStorage.removeItem(SESSION_KEY_VOUCHER_NAME)
  sessionStorage.removeItem(SESSION_KEY_VOUCHER_DISCOUNT)
  sessionStorage.removeItem('petbuddy_checkout_subtotal')
}

  useEffect(() => {
    syncFromSession()
    window.addEventListener('focus', syncFromSession)
    return () => window.removeEventListener('focus', syncFromSession)
  }, [])

  useEffect(() => {
    const token = readStorage(STORAGE_KEYS.accessToken)
    if (!token) {
      navigate('/login?redirect=/checkout')
    }
  }, [navigate])

  const fetchCart = useCallback(async () => {
    try {
      const cart = await getCartApi()
      const items = cart.cartItems ?? []
      setRawCartItems(items)
      setCartItems(
        items.map((item) => ({
          key: item.cartItemId,
          image: item.imageUrl,
          price: item.price,
          quantity: item.quantity,
          title: item.productName,
        }))
      )
      // Đưa các sản phẩm bị điều chỉnh số lượng vào queue để hiển thị popup
      const adjustedItems = items.filter((item) => item.adjusted)
      if (adjustedItems.length > 0) {
        setAdjustedQueue(adjustedItems)
      }
    } catch {
      setErrorMessage(t('checkout.loadError', 'Không thể tải giỏ hàng.'))
    } finally {
      setIsLoading(false)
    }
  }, [t])

  /** User đồng ý mua với số lượng đã giảm → chuyển sang item tiếp theo trong queue */
  function handleAdjustedConfirm() {
    setAdjustedQueue((prev) => prev.slice(1))
  }

  /** User từ chối → xóa sản phẩm khỏi giỏ hàng rồi chuyển sang item tiếp theo */
  async function handleAdjustedDecline() {
    if (!currentAdjustedItem) return
    const itemId = currentAdjustedItem.cartItemId
    try {
      await removeCartItemApi(itemId)
    } catch {
      // Bỏ qua lỗi xóa, vẫn cập nhật UI
    }
    setRawCartItems((prev) => prev.filter((i) => i.cartItemId !== itemId))
    setCartItems((prev) => prev.filter((i) => i.key !== itemId))
    setAdjustedQueue((prev) => prev.slice(1))
  }

  const fetchPendingOrder = useCallback(async (orderId: number) => {
    try {
      const res = await fetchOrderByIdApi(orderId)
      const order = res.data
      const details = order.orderDetails ?? []

      setCartItems(
        details.map((d) => ({
          key: String(d.orderDetailId),
          image: d.productImage ?? '',
          price: d.unitPrice,
          quantity: d.quantity,
          title: d.productName,
        }))
      )

      const subtotal = details.reduce((sum, d) => sum + d.totalPrice, 0)
      const shippingFee = order.shippingFee ?? 0
      const isFreeShipping = shippingFee === 0
      const voucherDiscount = Math.max(0, subtotal + shippingFee - order.finalAmount)

      setPendingOrder({
        orderId: order.orderId,
        clientSecret: order.clientSecret ?? '',
        subtotal,
        shippingFee,
        isFreeShipping,
        voucherDiscount,
        finalAmount: order.finalAmount,
      })
    } catch {
      setErrorMessage(t('checkout.loadError', 'Không thể tải thông tin đơn hàng.'))
    } finally {
      setIsLoading(false)
    }
  }, [t])

  function handleRetryPayment() {
    if (!pendingOrder) return
    navigate('/payment', {
      state: {
        orderId: pendingOrder.orderId,
        clientSecret: pendingOrder.clientSecret,
        amount: pendingOrder.finalAmount,
        shippingFee: pendingOrder.shippingFee,
        isFreeShipping: pendingOrder.isFreeShipping,
      },
    })
  }

  useEffect(() => {
    if (pendingOrderId) {
      fetchPendingOrder(pendingOrderId)
    } else {
      fetchCart()
    }
  }, [pendingOrderId, fetchPendingOrder, fetchCart])

  const subtotal = useMemo(
    () => pendingOrder ? pendingOrder.subtotal : rawCartItems.reduce((total, item) => total + item.subtotal, 0), [rawCartItems, pendingOrder]
  )

  useEffect(() => {
    if (subtotal > 0) {
      sessionStorage.setItem(SESSION_KEY_SUBTOTAL, String(subtotal))
    }
  }, [subtotal])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage('')
    setIsSubmitting(true)
    
  if (voucherCode) {
    try {
      const voucherRes = await fetchActiveVouchersApi({ size: 100 })
      const currentVoucher = voucherRes?.data?.content?.find((v) => v.voucherCode === voucherCode)
      const stillEligible = currentVoucher ? isVoucherEligible(currentVoucher, subtotal) : false

      if (!stillEligible) {
        sessionStorage.removeItem(SESSION_KEY_VOUCHER_CODE)
        sessionStorage.removeItem(SESSION_KEY_VOUCHER_NAME)
        sessionStorage.removeItem(SESSION_KEY_VOUCHER_DISCOUNT)
        setVoucherCode('')
        setVoucherName('')
        setVoucherDiscount(0)
        setErrorMessage(t('checkout.voucherNoLongerValid', 'Mã giảm giá không còn khả dụng. Vui lòng chọn mã khác.'))
        setIsSubmitting(false)
        return
      }
    } catch {
    }
  }
    const formData = new FormData(event.currentTarget)
    const finalAddress = selectedAddress || getFormString(formData, 'address')

    if (!finalAddress) {
      setErrorMessage(t('checkout.addressRequired', 'Vui lòng chọn địa chỉ giao hàng.'))
      setIsSubmitting(false)
      return
    }

    if (!deliveryLat || !deliveryLng) {
      setErrorMessage(t('checkout.addressRequired', 'Vui lòng chọn địa chỉ giao hàng trên bản đồ.'))
      setIsSubmitting(false)
      return
    }

    const phoneNumber = getFormString(formData, 'phoneNumber')
    if (!phoneNumber || !/^0\d{9}$/.test(phoneNumber)) {
      setErrorMessage(t('checkout.phoneRequired', 'Vui lòng nhập số điện thoại hợp lệ (+84 và 9 chữ số).'))
      setIsSubmitting(false)
      return
    }

    const request: CreateOrderRequest = {
      recipientName: getFormString(formData, 'recipientName'),
      phoneNumber,
      address: finalAddress,
      note: getFormString(formData, 'note') || undefined,
      voucherCode: voucherCode || undefined,
      latitude: deliveryLat,
      longitude: deliveryLng,
      paymentMethod: selectedPaymentMethod,
    }

    try {
      const response = await createOrderApi(request)
      const orderId = response.data?.orderId
      clearCheckoutSession()
      if (!orderId) {
        throw new Error('Không nhận được mã đơn hàng từ hệ thống.')
      }

      clearCheckoutSessionData()

      const paymentMethodLabel = selectedPaymentMethod === 'CARD' ? 'Thẻ quốc tế' : 'Tiền mặt'

      const lastOrderDetails = {
        orderId,
        clientSecret: response.data?.clientSecret || '',
        orderCode: response.data?.orderCode || `PET-${orderId}`,
        recipientName: request.recipientName,
        phoneNumber: request.phoneNumber,
        address: request.address,
        note: request.note,
        paymentMethod: paymentMethodLabel,
        shippingFee,
        isFreeShipping,
        voucherDiscount,
        subtotal,
        finalAmount:
          response.data?.finalAmount ||
          subtotal + (isFreeShipping ? 0 : shippingFee) - voucherDiscount,
        items: rawCartItems.map((item) => ({
          productId: item.productId,
          name: item.productName,
          price: item.price,
          quantity: item.quantity,
          imageUrl: item.imageUrl,
        })),
      }

      sessionStorage.setItem('petbuddy_last_order', JSON.stringify(lastOrderDetails))

      if (selectedPaymentMethod === 'CARD') {
        let clientSecret = response.data?.clientSecret || ''

        if (!clientSecret) {
          try {
            const paymentRes = await getPaymentByOrderIdApi(orderId)
            clientSecret = paymentRes.data?.stripeClientSecret || ''
          } catch (payErr) {
            console.error('Lỗi lấy thông tin PaymentIntent:', payErr)
          }
        }

        navigate('/payment', {
          state: {
            orderId,
            clientSecret,
            amount: lastOrderDetails.finalAmount,
            shippingFee,
            isFreeShipping,
          }
        })
      } else {
        navigate('/order-success')
      }
    } catch (error: unknown) {
      const apiError = error as { message?: string; data?: { message?: string; code?: string | number } }
      const rawMessage = apiError?.data?.message ?? (error instanceof Error ? error.message : '')

      const isOutOfStock =
        rawMessage?.toLowerCase().includes('out of stock') ||
        rawMessage?.toLowerCase().includes('hết hàng') ||
        apiError?.data?.code === 'PRODUCT_OUT_OF_STOCK' ||
        String(apiError?.data?.code) === '1010'

      if (isOutOfStock) {
        let productName = rawMessage ?? ''

        const matchedItem = rawCartItems.find(
          (item) =>
            rawMessage?.toLowerCase().includes(item.productName.toLowerCase())
        )

        if (matchedItem) {
          productName = matchedItem.productName
          try {
            await removeCartItemApi(matchedItem.cartItemId)
          } catch {
          }
          setRawCartItems((prev) => prev.filter((i) => i.cartItemId !== matchedItem.cartItemId))
          setCartItems((prev) => prev.filter((i) => i.key !== matchedItem.cartItemId))
        } else if (rawCartItems.length === 1) {
          const onlyItem = rawCartItems[0]
          productName = onlyItem.productName
          try {
            await removeCartItemApi(onlyItem.cartItemId)
          } catch {
          }
          setRawCartItems([])
          setCartItems([])
        }
        setOutOfStockProductName(productName || 'Sản phẩm đã hết hàng')
      } else {
        setErrorMessage(error instanceof Error ? error.message : t('checkout.createError'))
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className='flex min-h-screen flex-col bg-background text-foreground'>
        <SiteHeader />
        <main className='mx-auto flex w-full max-w-6xl flex-1 items-center justify-center px-4 py-10 pb-24 md:px-6 md:py-12'>
          <p className='text-sm text-muted-foreground'>
            {t('checkout.loading', 'Đang tải thông tin thanh toán...')}
          </p>
        </main>
        <SiteFooter />
        <SiteBottomNav />
        <SiteFab />
      </div>
    )
  }

  return (
    <div className='flex min-h-screen flex-col bg-background text-foreground'>
      <SiteHeader />
      <main className='mx-auto w-full max-w-6xl flex-1 px-4 py-10 pb-24 md:px-6 md:py-12'>
        <div className='mb-6'>
          <a
            className='inline-flex items-center gap-2 font-bold text-primary transition-transform hover:-translate-x-1'
            href='/cart'
          >
            <MaterialIcon name='arrow_back' className='text-[20px]' />
            {t('checkout.backToCart', 'Quay lại giỏ hàng')}
          </a>
        </div>

        <form className='grid grid-cols-1 gap-8 lg:grid-cols-12' onSubmit={handleSubmit}>
          <div className='flex flex-col gap-8 lg:col-span-8'>
            <h1 className='font-display text-3xl font-bold text-primary md:text-5xl'>
              {t('checkout.title')}
            </h1>


            {errorMessage && (
              <div className='flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive'>
                <MaterialIcon name='error' className='mt-0.5 shrink-0 text-[20px]' />
                <p>{errorMessage}</p>
              </div>
            )}

            <CheckoutShippingForm
              addressValue={selectedAddress}
              defaultName={user?.fullName}
              defaultPhone={pendingOrder ? toPhoneDisplay(sessionStorage.getItem('petbuddy_checkout_phone') ?? '') : undefined}
            />

            <CheckoutPaymentMethods
              selectedMethod={selectedPaymentMethod}
              onMethodChange={handlePaymentMethodChange}
            />

            <CheckoutNote />
          </div>

          <div className='lg:col-span-4'>
            <CheckoutOrderSummary
              items={cartItems}
              subtotal={subtotal}
              shippingFee={pendingOrder?.shippingFee ?? shippingFee}
              isFreeShipping={pendingOrder?.isFreeShipping ?? isFreeShipping}
              discount={pendingOrder?.voucherDiscount ?? voucherDiscount}
              voucherName={voucherName}
              formatPrice={formatPrice}
              isSubmitting={isSubmitting}
              mode={pendingOrder ? 'retry-payment' : 'checkout'}
              onRetryPayment={handleRetryPayment}
            />
          </div>
        </form>
      </main>
      <SiteFooter />
      <SiteBottomNav />
      <SiteFab />
      {outOfStockProductName && (
        <OutOfStockModal
          productName={outOfStockProductName}
          onClose={() => setOutOfStockProductName(null)}
        />
      )}
      {currentAdjustedItem && (
        <AdjustedQuantityModal
          productName={currentAdjustedItem.productName}
          newQuantity={currentAdjustedItem.quantity}
          onConfirm={handleAdjustedConfirm}
          onDecline={handleAdjustedDecline}
        />
      )}
    </div>
  )
}