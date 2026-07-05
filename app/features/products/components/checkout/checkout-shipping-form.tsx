import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'

import { MaterialIcon } from '~/shared/ui'

export interface CheckoutShippingFormProps {
  addressValue: string
  defaultName?: string
  defaultPhone?: string
}

export function toPhoneDisplay(phone: string): string {
  return phone.trim()
}

export function toPhoneSubmit(phone: string): string {
  return phone.trim()
}

function isValidPhone(phone: string): boolean {
  return /^0\d{10}$/.test(phone.trim())
}

export function CheckoutShippingForm({ addressValue, defaultName, defaultPhone }: CheckoutShippingFormProps) {
  const navigate = useNavigate()
  const [savedName, setSavedName] = useState('')
  const [savedPhone, setSavedPhone] = useState('')
  const [phoneError, setPhoneError] = useState('')

  useEffect(() => {
    const storedName = sessionStorage.getItem('petbuddy_checkout_name')
    if (storedName) {
      setSavedName(storedName)
    } else if (defaultName) {
      setSavedName(defaultName)
      sessionStorage.setItem('petbuddy_checkout_name', defaultName)
    }

    if (defaultPhone) {
      setSavedPhone(defaultPhone)
      sessionStorage.setItem('petbuddy_checkout_phone', defaultPhone)
    } else {
      setSavedPhone(sessionStorage.getItem('petbuddy_checkout_phone') ?? '')
    }
  }, [defaultName, defaultPhone])

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    sessionStorage.setItem('petbuddy_checkout_name', e.target.value)
    setSavedName(e.target.value)
  }

  function handlePhoneChange(e: React.ChangeEvent<HTMLInputElement>) {
    let digits = e.target.value.replace(/\D/g, '')

    if (digits.length > 0 && !digits.startsWith('0')) {
      digits = '0' + digits
    }
    if (digits.length > 11) {
      digits = digits.slice(0, 11)
    }

    sessionStorage.setItem('petbuddy_checkout_phone', digits)
    setSavedPhone(digits)

    if (digits.length > 0 && !isValidPhone(digits)) {
      setPhoneError('Số điện thoại phải có đúng 11 chữ số và bắt đầu bằng số 0')
    } else {
      setPhoneError('')
    }
  }

  function handlePhoneBlur() {
    if (savedPhone.length > 0 && !isValidPhone(savedPhone)) {
      setPhoneError('Số điện thoại phải có đúng 11 chữ số và bắt đầu bằng số 0')
    }
  }

  function handlePickAddress() {
    navigate('/order/address')
  }

  return (
    <section className='rounded-xl border border-border/60 bg-card p-6 shadow-sm md:p-8'>
      <div className='mb-6 flex items-center gap-3'>
        <MaterialIcon name='person' className='text-[24px] text-primary' />
        <h2 className='font-display text-2xl font-semibold text-primary'>Thông tin người nhận</h2>
      </div>

      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        <div className='flex flex-col gap-2'>
          <label className='text-sm font-semibold text-foreground' htmlFor='fullName'>
            Họ và tên
          </label>
          <input
            id='fullName'
            name='recipientName'
            className='w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring'
            placeholder='Nhập họ và tên của bạn'
            required
            type='text'
            value={savedName}
            onChange={handleNameChange}
          />
        </div>

        <div className='flex flex-col gap-2'>
          <label className='text-sm font-semibold text-foreground' htmlFor='phone'>
            Số điện thoại
          </label>
          <input
            id='phone'
            name='phoneNumber'
            className={`w-full rounded-xl border bg-background px-4 py-3 text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring ${phoneError ? 'border-destructive focus:border-destructive' : 'border-border focus:border-primary'
              }`}
            required
            type='tel'
            inputMode='numeric'
            value={savedPhone}
            onChange={handlePhoneChange}
            onBlur={handlePhoneBlur}
          />
          {phoneError && <p className='text-xs text-destructive'>{phoneError}</p>}
        </div>
      </div>

      {addressValue && (
        <div className='mt-4 flex items-start gap-3 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3'>
          <MaterialIcon name='location_on' className='mt-0.5 shrink-0 text-primary text-[20px]' />
          <div className='flex-1'>
            <p className='text-xs font-semibold text-muted-foreground'>Địa chỉ giao hàng</p>
            <p className='text-sm font-medium text-foreground'>{addressValue}</p>
          </div>
        </div>
      )}

      <input type='hidden' name='address' value={addressValue} />

      <button
        type='button'
        onClick={handlePickAddress}
        className='mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 font-semibold text-primary-foreground shadow transition-all hover:opacity-90 active:scale-[0.98]'
      >
        <MaterialIcon name='pin_drop' className='text-[20px]' />
        {addressValue ? 'Thay đổi địa chỉ giao hàng' : 'Nhập địa chỉ giao hàng'}
      </button>
    </section>
  )
}