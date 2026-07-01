import { useMemo, useState, useEffect, useCallback } from 'react'
import type { FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { STORAGE_KEYS } from '~/shared/config/site'

import { CheckoutNote } from '../components/checkout/checkout-note'
import {
  CheckoutOrderSummary,
  type CheckoutOrderItem,
} from '../components/checkout/checkout-order-summary'
import { CheckoutPaymentMethods, type SelectedPaymentMethod } from '../components/checkout/checkout-payment-methods'
import { CheckoutShippingForm } from '../components/checkout/checkout-shipping-form'
import { SiteBottomNav, SiteFab, SiteFooter, SiteHeader } from '~/shared/components'
import { createOrderApi } from '../services/order'
import type { CreateOrderRequest } from '~/shared/lib/order'
import { getCartApi } from '../services/cart'
import type { CartItemResponse } from '~/shared/lib/cart'
import { MaterialIcon } from '~/shared/ui'
import { readStorage } from '~/shared/lib/storage'
import { useAuth } from '~/providers/auth-provider'
import { getPaymentByOrderIdApi } from '../services/payment/payment-api'

const SESSION_KEY_ADDRESS = 'petbuddy_checkout_address'
const SESSION_KEY_LAT = 'petbuddy_checkout_lat'
const SESSION_KEY_LNG = 'petbuddy_checkout_lng'
const SESSION_KEY_SHIPPING_FEE = 'petbuddy_checkout_shipping_fee'
const SESSION_KEY_IS_FREE_SHIPPING = 'petbuddy_checkout_is_free'
const SESSION_KEY_VOUCHER_CODE = 'petbuddy_checkout_voucher_code'
const SESSION_KEY_VOUCHER_NAME = 'petbuddy_checkout_voucher_name'
const SESSION_KEY_VOUCHER_DISCOUNT = 'petbuddy_checkout_voucher_discount'

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
  const { user } = useAuth()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [rawCartItems, setRawCartItems] = useState<CartItemResponse[]>([])
  const [cartItems, setCartItems] = useState<CheckoutOrderItem[]>([])

  const [selectedAddress, setSelectedAddress] = useState('')
  const [shippingFee, setShippingFee] = useState(0)
  const [isFreeShipping, setIsFreeShipping] = useState(true)
  const [voucherCode, setVoucherCode] = useState('')
  const [voucherName, setVoucherName] = useState('')
  const [voucherDiscount, setVoucherDiscount] = useState(0)

  // State phương thức thanh toán (mặc định là CASH/COD)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<SelectedPaymentMethod>('CASH')

  function syncFromSession() {
    setSelectedAddress(sessionStorage.getItem(SESSION_KEY_ADDRESS) ?? '')
    setShippingFee(parseInt(sessionStorage.getItem(SESSION_KEY_SHIPPING_FEE) ?? '0', 10))
    setIsFreeShipping(sessionStorage.getItem(SESSION_KEY_IS_FREE_SHIPPING) !== 'false')
    setVoucherCode(sessionStorage.getItem(SESSION_KEY_VOUCHER_CODE) ?? '')
    setVoucherName(sessionStorage.getItem(SESSION_KEY_VOUCHER_NAME) ?? '')
    setVoucherDiscount(parseInt(sessionStorage.getItem(SESSION_KEY_VOUCHER_DISCOUNT) ?? '0', 10))
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
    } catch {
      setErrorMessage(t('checkout.loadError', 'Không thể tải giỏ hàng.'))
    } finally {
      setIsLoading(false)
    }
  }, [t])

  useEffect(() => {
    fetchCart()
  }, [fetchCart])

  const subtotal = useMemo(
    () => rawCartItems.reduce((total, item) => total + item.subtotal, 0),
    [rawCartItems]
  )

  useEffect(() => {
    if (subtotal > 0) {
      sessionStorage.setItem('petbuddy_checkout_subtotal', String(subtotal))
    }
  }, [subtotal])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage('')
    setIsSubmitting(true)

    const formData = new FormData(event.currentTarget)
    const finalAddress = selectedAddress || getFormString(formData, 'address')

    if (!finalAddress) {
      setErrorMessage(t('checkout.addressRequired', 'Vui lòng chọn địa chỉ giao hàng.'))
      setIsSubmitting(false)
      return
    }

    const request: CreateOrderRequest = {
      recipientName: getFormString(formData, 'recipientName'),
      phoneNumber: getFormString(formData, 'phoneNumber'),
      address: finalAddress,
      note: getFormString(formData, 'note') || undefined,
      voucherCode: voucherCode || undefined,
      shippingFee: isFreeShipping ? 0 : shippingFee,
      paymentMethod: selectedPaymentMethod,
    }

    try {
      const response = await createOrderApi(request)
      const orderId = response.data?.orderId

      if (!orderId) {
        throw new Error('Không nhận được mã đơn hàng từ hệ thống.')
      }

      const paymentMethodLabel = selectedPaymentMethod === 'CARD' ? 'Thẻ quốc tế / Stripe' : 'Tiền mặt (COD)'

      const lastOrderDetails = {
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

      const keysToRemove = [
        SESSION_KEY_ADDRESS, SESSION_KEY_LAT, SESSION_KEY_LNG,
        SESSION_KEY_SHIPPING_FEE, SESSION_KEY_IS_FREE_SHIPPING,
        SESSION_KEY_VOUCHER_CODE, SESSION_KEY_VOUCHER_NAME, SESSION_KEY_VOUCHER_DISCOUNT,
        'petbuddy_checkout_name', 'petbuddy_checkout_phone',
        'petbuddy_checkout_subtotal', 'petbuddy_checkout_distance',
        'petbuddy_checkout_note',
      ]
      keysToRemove.forEach((k) => sessionStorage.removeItem(k))
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
          }
        })
      } else {
        navigate('/order-success')
      }
    } catch (error: unknown) {
      setErrorMessage(error instanceof Error ? error.message : t('checkout.createError'))
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

            {/* Điền tự động tên từ tài khoản đã login qua prop defaultName */}
            <CheckoutShippingForm addressValue={selectedAddress} defaultName={user?.fullName} />
            
            {/* Chọn phương thức thanh toán (controlled) */}
            <CheckoutPaymentMethods
              selectedMethod={selectedPaymentMethod}
              onMethodChange={setSelectedPaymentMethod}
            />
            
            <CheckoutNote />
          </div>

          <div className='lg:col-span-4'>
            <CheckoutOrderSummary
              items={cartItems}
              subtotal={subtotal}
              shippingFee={shippingFee}
              isFreeShipping={isFreeShipping}
              discount={voucherDiscount}
              voucherName={voucherName}
              formatPrice={formatPrice}
              isSubmitting={isSubmitting}
            />
          </div>
        </form>
      </main>
      <SiteFooter />
      <SiteBottomNav />
      <SiteFab />
    </div>
  )
}