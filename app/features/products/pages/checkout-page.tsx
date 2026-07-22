import { CheckoutNote } from '../components/checkout/checkout-note'
import { CheckoutOrderSummary } from '../components/checkout/checkout-order-summary'
import { CheckoutPaymentMethods } from '../components/checkout/checkout-payment-methods'
import { CheckoutShippingForm, toPhoneDisplay } from '../components/checkout/checkout-shipping-form'
import { OutOfStockModal } from '../components/checkout/out-of-stock-modal'
import { AdjustedQuantityModal } from '../components/checkout/adjusted-quantity-modal'
import { SiteBottomNav, SiteFab, SiteFooter, SiteHeader } from '~/shared/components'
import { MaterialIcon } from '~/shared/ui'
import { useCheckout } from '../hooks/use-checkout'

function formatPrice(value: number) {
  return `${new Intl.NumberFormat('vi-VN').format(value)}đ`
}

export function CheckoutPage() {
  const {
    t,
    user,
    isSubmitting,
    isLoading,
    errorMessage,
    cartItems,
    outOfStockProductName,
    setOutOfStockProductName,
    currentAdjustedItem,
    selectedAddress,
    shippingFee,
    isFreeShipping,
    voucherName,
    voucherDiscount,
    pendingOrder,
    selectedPaymentMethod,
    handlePaymentMethodChange,
    handleAdjustedConfirm,
    handleAdjustedDecline,
    handleRetryPayment,
    handleSubmit,
    subtotal
  } = useCheckout()

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

            <CheckoutShippingForm
              addressValue={selectedAddress}
              defaultName={user?.fullName}
              defaultPhone={pendingOrder ? toPhoneDisplay(sessionStorage.getItem('petbuddy_checkout_phone') ?? '') : undefined}
              errorMessage={errorMessage}
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
              mode={pendingOrder && selectedPaymentMethod === 'CARD' ? 'retry-payment' : 'checkout'}
              onRetryPayment={handleRetryPayment}
              paymentMethod={selectedPaymentMethod}
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