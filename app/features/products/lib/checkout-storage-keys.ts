export const SESSION_KEY_ADDRESS = 'petbuddy_checkout_address'
export const SESSION_KEY_LAT = 'petbuddy_checkout_lat'
export const SESSION_KEY_LNG = 'petbuddy_checkout_lng'
export const SESSION_KEY_SHIPPING_FEE = 'petbuddy_checkout_shipping_fee'
export const SESSION_KEY_IS_FREE_SHIPPING = 'petbuddy_checkout_is_free'
export const SESSION_KEY_VOUCHER_CODE = 'petbuddy_checkout_voucher_code'
export const SESSION_KEY_VOUCHER_NAME = 'petbuddy_checkout_voucher_name'
export const SESSION_KEY_VOUCHER_DISCOUNT = 'petbuddy_checkout_voucher_discount'
export const SESSION_KEY_PAYMENT_METHOD = 'petbuddy_checkout_payment_method'
export const SESSION_KEY_SUBTOTAL = 'petbuddy_checkout_subtotal'

export function clearCheckoutSessionData() {
  sessionStorage.removeItem(SESSION_KEY_ADDRESS)
  sessionStorage.removeItem(SESSION_KEY_LAT)
  sessionStorage.removeItem(SESSION_KEY_LNG)
  sessionStorage.removeItem(SESSION_KEY_SHIPPING_FEE)
  sessionStorage.removeItem(SESSION_KEY_IS_FREE_SHIPPING)
  sessionStorage.removeItem(SESSION_KEY_VOUCHER_CODE)
  sessionStorage.removeItem(SESSION_KEY_VOUCHER_NAME)
  sessionStorage.removeItem(SESSION_KEY_VOUCHER_DISCOUNT)
  sessionStorage.removeItem(SESSION_KEY_SUBTOTAL)
}