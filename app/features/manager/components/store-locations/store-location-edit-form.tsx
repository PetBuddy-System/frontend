import { useTranslation } from 'react-i18next'
import { MaterialIcon } from '~/shared/ui'

export interface StoreLocationEditFormProps {
  mode: 'edit' | 'create'
  selectedAddress: string
  setSelectedAddress: (addr: string) => void
  coords: { lat: number; lng: number }
  isSaving: boolean
  errorMsg: string
  successMsg: string
  onSave: () => void
  onCancel: () => void
}

export function StoreLocationEditForm({
  mode,
  selectedAddress,
  setSelectedAddress,
  isSaving,
  errorMsg,
  successMsg,
  onSave,
  onCancel
}: StoreLocationEditFormProps) {
  const { t } = useTranslation('manager')

  return (
    <div className='rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4 max-w-2xl mx-auto w-full'>
      <div className='flex items-center justify-between'>
        <h4 className='font-display text-sm font-bold text-foreground'>
          {mode === 'create'
            ? t('storeLocations.creatingTitle', 'Tạo vị trí mới')
            : t('storeLocations.editingTitle', 'Cập nhật vị trí')}
        </h4>
        <button
          type='button'
          onClick={onCancel}
          className='text-xs font-semibold text-muted-foreground hover:text-foreground flex items-center gap-1'
        >
          <MaterialIcon name='close' className='text-[16px]' />
          {t('storeLocations.cancel', 'Hủy')}
        </button>
      </div>

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
  )
}
