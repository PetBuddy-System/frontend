import { useCheckoutState } from './use-checkout-state'
import { useCheckoutSubmit } from './use-checkout-submit'

export function useCheckout() {
  const state = useCheckoutState()
  const { handleSubmit } = useCheckoutSubmit(state)

  return {
    t: state.t,
    user: state.user,
    isSubmitting: state.isSubmitting,
    isLoading: state.isLoading,
    errorMessage: state.errorMessage ? state.t(state.errorMessage) : state.errorMessage,
    cartItems: state.cartItems,
    outOfStockProductName: state.outOfStockProductName,
    setOutOfStockProductName: state.setOutOfStockProductName,
    currentAdjustedItem: state.currentAdjustedItem,
    selectedAddress: state.selectedAddress,
    shippingFee: state.shippingFee,
    isFreeShipping: state.isFreeShipping,
    voucherName: state.voucherName,
    voucherDiscount: state.voucherDiscount,
    pendingOrder: state.pendingOrder,
    selectedPaymentMethod: state.selectedPaymentMethod,
    handlePaymentMethodChange: state.handlePaymentMethodChange,
    handleAdjustedConfirm: state.handleAdjustedConfirm,
    handleAdjustedDecline: state.handleAdjustedDecline,
    handleRetryPayment: state.handleRetryPayment,
    handleSubmit,
    subtotal: state.subtotal
  }
}
