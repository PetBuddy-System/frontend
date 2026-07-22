import { useCallback } from 'react'
import type { FormEvent } from 'react'
import type { NavigateFunction } from 'react-router'
import { useTranslation } from 'react-i18next'
import { guestCart } from '~/shared/lib/cart'
import {
  createOrderApi,
  updateOrderApi,
  getPaymentByOrderIdApi,
  removeCartItemApi,
  fetchActiveVouchersApi,
} from '../services'
import type { CreateOrderRequest, UpdateOrderRequest, OrderResponse } from '~/shared/lib/order'
import type { CartItemResponse } from '~/shared/lib/cart'
import type { CheckoutOrderItem } from '../components/checkout/checkout-order-summary'
import type { SelectedPaymentMethod } from '../components/checkout/checkout-payment-methods'
import {
  SESSION_KEY_VOUCHER_CODE,
  SESSION_KEY_VOUCHER_NAME,
  SESSION_KEY_VOUCHER_DISCOUNT,
  clearCheckoutSessionData,
} from '../lib/checkout-storage-keys'
import { isVoucherEligible } from '~/shared/lib/voucher'
import type { PendingOrderView } from './use-checkout-state'

function getFormString(formData: FormData, key: string) {
  const value = formData.get(key)
  return typeof value === 'string' ? value.trim() : ''
}

interface UseCheckoutSubmitDeps {
  t: ReturnType<typeof useTranslation>['t']
  navigate: NavigateFunction
  voucherCode: string
  setVoucherCode: (v: string) => void
  setVoucherName: (v: string) => void
  setVoucherDiscount: (v: number) => void
  subtotal: number
  selectedAddress: string
  deliveryLat: number
  deliveryLng: number
  pendingOrder: PendingOrderView | null
  clearCheckoutSession: () => void
  selectedPaymentMethod: SelectedPaymentMethod
  cartItems: CheckoutOrderItem[]
  rawCartItems: CartItemResponse[]
  setRawCartItems: React.Dispatch<React.SetStateAction<CartItemResponse[]>>
  setCartItems: React.Dispatch<React.SetStateAction<CheckoutOrderItem[]>>
  shippingFee: number
  isFreeShipping: boolean
  voucherDiscount: number
  setIsSubmitting: (v: boolean) => void
  setErrorMessage: (v: string) => void
  setOutOfStockProductName: (v: string | null) => void
}

export function useCheckoutSubmit(deps: UseCheckoutSubmitDeps) {
  const {
    t ,
    navigate,
    voucherCode,
    setVoucherCode,
    setVoucherName,
    setVoucherDiscount,
    subtotal,
    selectedAddress,
    deliveryLat,
    deliveryLng,
    pendingOrder,
    clearCheckoutSession,
    selectedPaymentMethod,
    cartItems,
    rawCartItems,
    setRawCartItems,
    setCartItems,
    shippingFee,
    isFreeShipping,
    voucherDiscount,
    setIsSubmitting,
    setErrorMessage,
    setOutOfStockProductName,
  } = deps

  function getPaymentMethodLabel() {
    if (selectedPaymentMethod === 'CARD') return t('checkout.shipping.paymentMethods.card')
    if (selectedPaymentMethod === 'MOMO') return t('checkout.shipping.paymentMethods.momo')
    if (selectedPaymentMethod === 'VNPAY') return t('checkout.shipping.paymentMethods.vnpay')
    return t('checkout.shipping.paymentMethods.cash')
  }

  const handleSubmit = useCallback(async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    setErrorMessage('')
    setIsSubmitting(true)

    try {
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
            setErrorMessage('checkout.voucherNoLongerValid')
            return
          }
        } catch {
        }
      }

      const formData = new FormData(form)
      const finalAddress = selectedAddress || getFormString(formData, 'address')

      if (!finalAddress) {
        setErrorMessage('checkout.shipping.addressRequired')
        return
      }

      if (!deliveryLat || !deliveryLng) {
        setErrorMessage('checkout.shipping.addressRequiredMap')
        return
      }

      const phoneNumber = getFormString(formData, 'phoneNumber')
      if (!phoneNumber || !/^0\d{9}$/.test(phoneNumber)) {
        setErrorMessage('checkout.shipping.phoneRequired')
        return
      }
      if (pendingOrder) {
        await submitPendingOrder(formData, finalAddress, phoneNumber)
      } else {
        await submitNewOrder(formData, finalAddress, phoneNumber)
      }
    } catch (error: unknown) {
      await handleSubmitError(error)
    } finally {
      setIsSubmitting(false)
    }
  }, [
    voucherCode, subtotal, selectedAddress, deliveryLat, deliveryLng,
    pendingOrder, clearCheckoutSession, selectedPaymentMethod,
    cartItems, navigate, rawCartItems, shippingFee, isFreeShipping,
    voucherDiscount, t, setIsSubmitting, setErrorMessage, setVoucherCode,
    setVoucherName, setVoucherDiscount, setOutOfStockProductName,
    setRawCartItems, setCartItems,
  ])
  async function submitPendingOrder(formData: FormData, finalAddress: string, phoneNumber: string) {
    if (!pendingOrder) return

    const updateRequest: UpdateOrderRequest = {
      recipientName: getFormString(formData, 'recipientName'),
      phoneNumber,
      address: finalAddress,
      note: getFormString(formData, 'note') || undefined,
      voucherCode: voucherCode || undefined,
      latitude: deliveryLat,
      longitude: deliveryLng,
    }

    const response = await updateOrderApi(pendingOrder.orderId, updateRequest)
    const orderId = pendingOrder.orderId

    if (selectedPaymentMethod === 'CASH') {
      clearCheckoutSession()
      clearCheckoutSessionData()
      guestCart.clear()
    } else {
      guestCart.clear()
    }

    const paymentMethodLabel = getPaymentMethodLabel()

    const lastOrderDetails = {
      orderId,
      clientSecret: response.data?.clientSecret || pendingOrder.clientSecret || '',
      orderCode: response.data?.orderCode || `PET-${orderId}`,
      recipientName: updateRequest.recipientName,
      phoneNumber: updateRequest.phoneNumber,
      address: updateRequest.address,
      note: updateRequest.note,
      paymentMethod: paymentMethodLabel,
      shippingFee: response.data?.shippingFee ?? pendingOrder.shippingFee,
      isFreeShipping: (response.data?.shippingFee ?? pendingOrder.shippingFee) === 0,
      voucherDiscount: response.data
        ? Math.max(0, pendingOrder.subtotal + (response.data.shippingFee ?? pendingOrder.shippingFee) - response.data.finalAmount)
        : pendingOrder.voucherDiscount,
      subtotal: pendingOrder.subtotal,
      finalAmount: response.data?.finalAmount || pendingOrder.finalAmount,
      items: cartItems.map((item) => ({
        productId: item.productId || item.key,
        name: item.title || '',
        price: item.price,
        salePrice: item.salePrice,
        quantity: item.quantity,
        imageUrl: item.image,
      })),
    }

    sessionStorage.setItem('petbuddy_last_order', JSON.stringify(lastOrderDetails))
    await navigateAfterSubmit(orderId, response.data, lastOrderDetails)
  }
  async function submitNewOrder(formData: FormData, finalAddress: string, phoneNumber: string) {
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

    const response = await createOrderApi(request)
    const orderId = response.data?.orderId

    if (!orderId) {
      throw new Error(t('checkout.shipping.orderIdMissing'))
    }

    if (selectedPaymentMethod === 'CASH') {
      clearCheckoutSession()
      clearCheckoutSessionData()
      guestCart.clear()
    } else {
      sessionStorage.setItem('petbuddy_checkout_pending_order_id', String(orderId))
      guestCart.clear()
    }

    const paymentMethodLabel = getPaymentMethodLabel()

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
        salePrice: item.salePrice,
        quantity: item.quantity,
        imageUrl: item.imageUrl,
      })),
    }

    sessionStorage.setItem('petbuddy_last_order', JSON.stringify(lastOrderDetails))
    await navigateAfterSubmit(orderId, response.data, lastOrderDetails)
  }
  async function navigateAfterSubmit(
    orderId: number,
    orderData: OrderResponse | null | undefined,
    lastOrderDetails: { finalAmount: number; shippingFee: number; isFreeShipping: boolean }
  ) {
    if (selectedPaymentMethod === 'CARD') {
      let clientSecret = orderData?.clientSecret || orderData?.payment?.stripeClientSecret || pendingOrder?.clientSecret || ''

      if (!clientSecret) {
        try {
          const paymentRes = await getPaymentByOrderIdApi(orderId)
          clientSecret = paymentRes.data?.stripeClientSecret || ''
        } catch (payErr) {
          console.error('Error fetching PaymentIntent:', payErr)
        }
      }

      navigate('/payment', {
        state: {
          orderId,
          clientSecret,
          amount: lastOrderDetails.finalAmount,
          shippingFee: lastOrderDetails.shippingFee,
          isFreeShipping: lastOrderDetails.isFreeShipping,
        },
      })
    } else if (selectedPaymentMethod === 'MOMO') {
      let momoPayUrl = orderData?.payment?.momoPayUrl

      if (!momoPayUrl) {
        try {
          const paymentRes = await getPaymentByOrderIdApi(orderId)
          momoPayUrl = paymentRes.data?.momoPayUrl
        } catch (payErr) {
          console.error('Error fetching MoMo payment URL:', payErr)
        }
      }

      if (momoPayUrl) {
        sessionStorage.setItem('pendingMomoOrderId', String(orderId))
        sessionStorage.removeItem('isMomoRetry')
        window.location.href = momoPayUrl
      } else {
        setErrorMessage('checkout.momoUrlMissing')
      }
    } else if (selectedPaymentMethod === 'VNPAY') {
      let vnpayPayUrl = orderData?.payment?.vnpayPayUrl

      if (!vnpayPayUrl) {
        try {
          const paymentRes = await getPaymentByOrderIdApi(orderId)
          vnpayPayUrl = paymentRes.data?.vnpayPayUrl
        } catch (payErr) {
          console.error('Error fetching VNPAY payment URL:', payErr)
        }
      }

      if (vnpayPayUrl) {
        sessionStorage.setItem('pendingVnPayOrderId', String(orderId))
        sessionStorage.removeItem('isVnPayRetry')
        window.location.href = vnpayPayUrl
      } else {
        setErrorMessage('checkout.vnpayUrlMissing')
      }
    } else {
      navigate('/order-success')
    }
  }

  async function handleSubmitError(error: unknown) {
    const apiError = error as { message?: string; data?: { message?: string; code?: string | number } }
    const rawMessage = apiError?.data?.message ?? (error instanceof Error ? error.message : '')

    const isOutOfStock =
      rawMessage?.toLowerCase().includes('out of stock') ||
      rawMessage?.toLowerCase().includes('hết hàng') ||
      apiError?.data?.code === 'PRODUCT_OUT_OF_STOCK' ||
      String(apiError?.data?.code) === '1010'

    if (isOutOfStock) {
      let productName = rawMessage ?? ''

      const matchedItem = rawCartItems.find((item) =>
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
      setOutOfStockProductName(productName || t('checkout.shipping.outOfStockDefault'))
    } else {
      setErrorMessage(error instanceof Error ? error.message : 'checkout.shipping.orderIdMissing')
    }
  }

  return { handleSubmit }
}