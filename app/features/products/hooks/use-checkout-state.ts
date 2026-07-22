import { useState, useEffect, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useLocation } from 'react-router'
import { STORAGE_KEYS } from '~/shared/config/site'
import { useAuth } from '~/providers/auth-provider'
import { readStorage } from '~/shared/lib/storage'
import { updatePaymentMethodApi, getCartApi, removeCartItemApi, fetchOrderByIdApi } from '../services'
import type { CartItemResponse } from '~/shared/lib/cart'
import type { CheckoutOrderItem } from '../components/checkout/checkout-order-summary'
import type { SelectedPaymentMethod } from '../components/checkout/checkout-payment-methods'
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
  SESSION_KEY_PENDING_ORDER_ID
} from '../lib/checkout-storage-keys'

export interface PendingOrderView {
  orderId: number
  clientSecret: string
  momoPayUrl?: string
  vnpayPayUrl?: string
  subtotal: number
  shippingFee: number
  isFreeShipping: boolean
  voucherDiscount: number
  finalAmount: number
}

export function useCheckoutState() {
  const { t } = useTranslation('products')
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()

  const pendingOrderIdFromState = (location.state as { orderId?: number } | null)?.orderId ?? null

  const [pendingOrderId] = useState<number | null>(() => {
    if (pendingOrderIdFromState) {
      sessionStorage.setItem(SESSION_KEY_PENDING_ORDER_ID, String(pendingOrderIdFromState))
      return pendingOrderIdFromState
    }
    const saved = typeof window !== 'undefined' ? sessionStorage.getItem(SESSION_KEY_PENDING_ORDER_ID) : null
    return saved ? Number(saved) : null
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [rawCartItems, setRawCartItems] = useState<CartItemResponse[]>([])
  const [cartItems, setCartItems] = useState<CheckoutOrderItem[]>([])

  const [outOfStockProductName, setOutOfStockProductName] = useState<string | null>(null)
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

  const [pendingOrder, setPendingOrder] = useState<PendingOrderView | null>(null)

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<SelectedPaymentMethod>(() => {
    const saved = typeof window !== 'undefined' ? sessionStorage.getItem(SESSION_KEY_PAYMENT_METHOD) : null
    return (saved === 'CASH' || saved === 'CARD' || saved === 'MOMO' || saved === 'VNPAY') ? saved : 'CASH'
  })

  // --- Callbacks ---

  const handlePaymentMethodChange = useCallback(
    async (method: SelectedPaymentMethod, errorMessage: string) => {
      setSelectedPaymentMethod(method)
      sessionStorage.setItem(SESSION_KEY_PAYMENT_METHOD, method)

    if (pendingOrder) {
      setErrorMessage(errorMessage ?? '')
      setIsSubmitting(true)
      try {
        const res = await updatePaymentMethodApi(pendingOrder.orderId, method)
        if (res.success && res.data) {
          setPendingOrder((prev) =>
            prev
              ? {
                ...prev,
                clientSecret: res.data.stripeClientSecret ?? prev.clientSecret,
                momoPayUrl: res.data.momoPayUrl ?? prev.momoPayUrl,
                vnpayPayUrl: res.data.vnpayPayUrl ?? prev.vnpayPayUrl,
                finalAmount: res.data.amount ?? prev.finalAmount,
              }
              : null
          )
        }
      }
      setIsSubmitting(false)
      }
    },
    [pendingOrder]
  )

  const syncFromSession = useCallback(() => {
    setSelectedAddress(sessionStorage.getItem(SESSION_KEY_ADDRESS) ?? '')
    setShippingFee(parseInt(sessionStorage.getItem(SESSION_KEY_SHIPPING_FEE) ?? '0', 10))
    setIsFreeShipping(sessionStorage.getItem(SESSION_KEY_IS_FREE_SHIPPING) !== 'false')
    setDeliveryLat(parseFloat(sessionStorage.getItem(SESSION_KEY_LAT) ?? '0'))
    setDeliveryLng(parseFloat(sessionStorage.getItem(SESSION_KEY_LNG) ?? '0'))
    setVoucherCode(sessionStorage.getItem(SESSION_KEY_VOUCHER_CODE) ?? '')
    setVoucherName(sessionStorage.getItem(SESSION_KEY_VOUCHER_NAME) ?? '')
    setVoucherDiscount(parseInt(sessionStorage.getItem(SESSION_KEY_VOUCHER_DISCOUNT) ?? '0', 10))
  }, [])

  const clearCheckoutSession = useCallback(() => {
    sessionStorage.removeItem(SESSION_KEY_ADDRESS)
    sessionStorage.removeItem(SESSION_KEY_LAT)
    sessionStorage.removeItem(SESSION_KEY_LNG)
    sessionStorage.removeItem(SESSION_KEY_SHIPPING_FEE)
    sessionStorage.removeItem(SESSION_KEY_IS_FREE_SHIPPING)
    sessionStorage.removeItem(SESSION_KEY_VOUCHER_CODE)
    sessionStorage.removeItem(SESSION_KEY_VOUCHER_NAME)
    sessionStorage.removeItem(SESSION_KEY_VOUCHER_DISCOUNT)
    sessionStorage.removeItem('petbuddy_checkout_subtotal')
    sessionStorage.removeItem(SESSION_KEY_PENDING_ORDER_ID)
    sessionStorage.removeItem('petbuddy_checkout_has_promotion_product')
  }, [])

  // --- Effects ---

  useEffect(() => {
    syncFromSession()
    window.addEventListener('focus', syncFromSession)
    return () => window.removeEventListener('focus', syncFromSession)
  }, [syncFromSession])

  useEffect(() => {
    const token = readStorage(STORAGE_KEYS.accessToken)
    if (!token) {
      navigate('/login?redirect=/checkout')
    }
  }, [navigate])

  // --- Data fetching ---

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
          salePrice: item.salePrice ?? item.price,
          quantity: item.quantity,
          title: item.productName
        }))
      )
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

  const handleAdjustedConfirm = useCallback(() => {
    setAdjustedQueue((prev) => prev.slice(1))
  }, [])

  const handleAdjustedDecline = useCallback(async () => {
    if (!currentAdjustedItem) return
    const itemId = currentAdjustedItem.cartItemId
    try {
      await removeCartItemApi(itemId)
    } catch {}
    setRawCartItems((prev) => prev.filter((i) => i.cartItemId !== itemId))
    setCartItems((prev) => prev.filter((i) => i.key !== itemId))
    setAdjustedQueue((prev) => prev.slice(1))
  }, [currentAdjustedItem])

  const fetchPendingOrder = useCallback(
    async (orderId: number) => {
      try {
        const res = await fetchOrderByIdApi(orderId)
        const order = res.data
        const details = order.orderDetails ?? []

        setCartItems(
          details.map((d) => ({
            key: String(d.orderDetailId),
            image: d.productImage ?? '',
            price: d.unitPrice,
            salePrice: d.salePrice ?? d.unitPrice,
            quantity: d.quantity,
            title: d.productName,
            productId: d.productId
          }))
        )

        const subtotalVal = details.reduce((sum, d) => sum + d.totalPrice, 0)
        const shippingFeeVal = order.shippingFee ?? 0
        const isFreeShippingVal = shippingFeeVal === 0
        const voucherDiscountVal = Math.max(0, subtotalVal + shippingFeeVal - order.finalAmount)

      setPendingOrder({
        orderId: order.orderId,
        clientSecret: order.clientSecret ?? '',
        momoPayUrl: order.payment?.momoPayUrl ?? '',
        vnpayPayUrl: order.payment?.vnpayPayUrl ?? '',
        subtotal: subtotalVal,
        shippingFee: shippingFeeVal,
        isFreeShipping: isFreeShippingVal,
        voucherDiscount: voucherDiscountVal,
        finalAmount: order.finalAmount,
      })
    } catch {
      sessionStorage.removeItem(SESSION_KEY_PENDING_ORDER_ID)
      setErrorMessage(t('checkout.loadError', 'Không thể tải thông tin đơn hàng.'))
      await fetchCart()
      return
    }
    setIsLoading(false)
  }, [t, fetchCart])

  const handleRetryPayment = useCallback(() => {
    if (!pendingOrder) return
    navigate('/payment', {
      state: {
        orderId: pendingOrder.orderId,
        clientSecret: pendingOrder.clientSecret,
        amount: pendingOrder.finalAmount,
        shippingFee: pendingOrder.shippingFee,
        isFreeShipping: pendingOrder.isFreeShipping
      }
    })
  }, [pendingOrder, navigate])

  useEffect(() => {
    if (pendingOrderId) {
      fetchPendingOrder(pendingOrderId)
    } else {
      fetchCart()
    }
  }, [pendingOrderId, fetchPendingOrder, fetchCart])

  const subtotal = useMemo(
    () => (pendingOrder ? pendingOrder.subtotal : rawCartItems.reduce((total, item) => total + item.subtotal, 0)),
    [rawCartItems, pendingOrder]
  )

  const hasPromotionProduct = useMemo(
    () => cartItems.some((item) => item.price != null && item.price > item.salePrice),
    [cartItems]
  )

  useEffect(() => {
    sessionStorage.setItem('petbuddy_checkout_has_promotion_product', String(hasPromotionProduct))
  }, [hasPromotionProduct])

  useEffect(() => {
    if (subtotal > 0) {
      sessionStorage.setItem(SESSION_KEY_SUBTOTAL, String(subtotal))
    }
  }, [subtotal])

  return {
    t,
    user,
    navigate,
    isSubmitting,
    setIsSubmitting,
    isLoading,
    errorMessage,
    setErrorMessage,
    rawCartItems,
    setRawCartItems,
    cartItems,
    setCartItems,
    outOfStockProductName,
    setOutOfStockProductName,
    currentAdjustedItem,
    selectedAddress,
    shippingFee,
    isFreeShipping,
    deliveryLat,
    deliveryLng,
    voucherCode,
    setVoucherCode,
    voucherName,
    setVoucherName,
    voucherDiscount,
    setVoucherDiscount,
    pendingOrder,
    selectedPaymentMethod,
    handlePaymentMethodChange,
    handleAdjustedConfirm,
    handleAdjustedDecline,
    handleRetryPayment,
    clearCheckoutSession,
    subtotal
  }
}
