import { useTranslation } from 'react-i18next'
import { MaterialIcon } from '~/shared/ui'
import type { StoreLocationResponse } from '~/shared/lib/store-location'

export interface StoreLocationInfoProps {
  currentLocation: StoreLocationResponse | null
  selectedAddress: string
  setSelectedAddress: (addr: string) => void
  coords: { lat: number; lng: number }
  isSaving: boolean
  errorMsg: string
  successMsg: string
  onSave: () => void
}

export function StoreLocationInfo({
  selectedAddress,
  setSelectedAddress,
  coords,
  isSaving,
  errorMsg,
  successMsg,
  onSave
}: StoreLocationInfoProps) {
  const { t } = useTranslation('manager')

  // Split selected address for styling: first part as main title, rest as sub-address
  const commaIndex = selectedAddress.indexOf(',')
  const mainTitle = commaIndex !== -1 ? selectedAddress.substring(0, commaIndex).trim() : selectedAddress
  const subAddress = commaIndex !== -1 ? selectedAddress.substring(commaIndex + 1).trim() : ''

  return (
    <div className='flex flex-col gap-6 max-w-2xl mx-auto w-full'>
      {/* Current Selection Card (HTML styled) */}
      <div className='bg-muted/40 border-l-4 border-primary p-4 rounded-xl shadow-sm'>
        <div className='flex gap-4 items-start'>
          <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary'>
            <MaterialIcon name='store' className='text-[24px]' />
          </div>
          <div>
            <p className='text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1'>
              {t('storeLocations.currentLocation', 'Current Store Selection')}
            </p>
            <h3 className='font-display text-lg font-bold text-foreground leading-snug'>
              {mainTitle || t('storeLocations.noSelection', 'Chưa chọn vị trí')}
            </h3>
            {subAddress && (
              <p className='text-xs text-muted-foreground mt-1 leading-relaxed'>
                {subAddress}
              </p>
            )}
            <p className='text-[10px] text-muted-foreground mt-1 font-mono'>
              Lat: {coords.lat.toFixed(6)}, Lng: {coords.lng.toFixed(6)}
            </p>
          </div>
        </div>
      </div>

      {/* Manual Fine-tune Textarea */}
      <div className='rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4'>
        <div>
          <label className='block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5'>
            {t('storeLocations.address', 'Địa chỉ chi tiết (Có thể chỉnh sửa)')}
          </label>
          <textarea
            value={selectedAddress}
            onChange={(e) => setSelectedAddress(e.target.value)}
            rows={3}
            className='w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring font-medium leading-relaxed'
            placeholder={t('storeLocations.addressPlaceholder', 'Nhập hoặc chọn địa chỉ trên bản đồ...')}
          />
        </div>

        {errorMsg && (
          <div className='flex items-center gap-1.5 text-xs text-destructive font-semibold bg-destructive/5 p-3 rounded-lg border border-destructive/10'>
            <MaterialIcon name='error' className='text-[16px] shrink-0' />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className='flex items-center gap-1.5 text-xs text-success font-semibold bg-success/5 p-3 rounded-lg border border-success/10'>
            <MaterialIcon name='check_circle' className='text-[16px] shrink-0' />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Save Location Button (HTML styled) */}
        <button
          type='button'
          onClick={onSave}
          disabled={isSaving}
          className='w-full flex items-center justify-center gap-3 py-3.5 bg-primary text-primary-foreground font-display font-bold rounded-xl shadow hover:opacity-95 active:scale-[0.98] transition-all disabled:opacity-60 disabled:pointer-events-none'
        >
          {isSaving ? (
            <>
              <div className='h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent' />
              <span>{t('storeLocations.saving', 'Đang lưu...')}</span>
            </>
          ) : (
            <>
              <MaterialIcon name='save' className='text-[20px]' />
              <span>{t('storeLocations.save', 'Lưu địa chỉ cửa hàng')}</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}
