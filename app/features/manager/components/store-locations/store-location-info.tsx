import { useTranslation } from 'react-i18next'
import { MaterialIcon } from '~/shared/ui'
import type { StoreLocationResponse } from '~/shared/lib/store-location'

export interface StoreLocationInfoProps {
  currentLocation: StoreLocationResponse | null
  mode: 'view' | 'edit' | 'create'
  onStartUpdate: () => void
  onStartCreate: () => void
}

export function StoreLocationInfo({
  currentLocation,
  mode,
  onStartUpdate,
  onStartCreate
}: StoreLocationInfoProps) {
  const { t } = useTranslation('manager')

  const address = currentLocation?.address ?? ''
  const commaIndex = address.indexOf(',')
  const mainTitle = commaIndex !== -1 ? address.substring(0, commaIndex).trim() : address
  const subAddress = commaIndex !== -1 ? address.substring(commaIndex + 1).trim() : ''

  return (
    <div className='flex flex-col gap-4 max-w-2xl mx-auto w-full'>
      {/* Current Selection Card */}
      <div className='bg-muted/40 border-l-4 border-primary p-4 rounded-xl shadow-sm'>
        <div className='flex gap-4 items-start'>
          <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary'>
            <MaterialIcon name='store' className='text-[24px]' />
          </div>
          <div>
            <p className='text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1'>
              {t('storeLocations.currentLocation', 'Vị trí cửa hàng hiện tại')}
            </p>

            {currentLocation ? (
              <>
                <h3 className='font-display text-lg font-bold text-foreground leading-snug'>
                  {mainTitle}
                </h3>
                {subAddress && (
                  <p className='text-xs text-muted-foreground mt-1 leading-relaxed'>
                    {subAddress}
                  </p>
                )}
              </>
            ) : (
              <h3 className='font-display text-lg font-bold text-muted-foreground leading-snug'>
                {t('storeLocations.noSelection', 'Chưa có vị trí nào được thiết lập')}
              </h3>
            )}
          </div>
        </div>
      </div>

      {/* Action buttons - only visible when not editing/creating */}
      {mode === 'view' && (
        <div className='flex gap-3'>
          {currentLocation && (
            <button
              type='button'
              onClick={onStartUpdate}
              className='flex-1 flex items-center justify-center gap-2 py-3 border border-primary text-primary font-semibold text-sm rounded-xl hover:bg-primary/5 active:scale-[0.98] transition-all'
            >
              <MaterialIcon name='edit_location_alt' className='text-[18px]' />
              {t('storeLocations.updateButton', 'Cập nhật')}
            </button>
          )}
          <button
            type='button'
            onClick={onStartCreate}
            className='flex-1 flex items-center justify-center gap-2 py-3 bg-primary text-primary-foreground font-semibold text-sm rounded-xl shadow hover:opacity-95 active:scale-[0.98] transition-all'
          >
            <MaterialIcon name='add_location_alt' className='text-[18px]' />
            {t('storeLocations.createButton', 'Tạo mới')}
          </button>
        </div>
      )}
    </div>
  )
}