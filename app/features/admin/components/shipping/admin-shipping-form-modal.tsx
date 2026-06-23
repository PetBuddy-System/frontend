// app/features/admin/components/shipping/admin-shipping-form-modal.tsx
import { useState } from 'react'
import { MaterialIcon } from '~/shared/ui'
import type { ShippingRule } from '~/shared/lib/shipping'

interface AdminShippingFormModalProps {
    mode: 'add' | 'edit'
    initialData?: ShippingRule
    isSubmitting: boolean
    error: string | null
    onClose: () => void
    onSave: () => void
    onMinDistanceChange: (value: string) => void
    onMaxDistanceChange: (value: string) => void
    onFeeChange: (value: string) => void
    minDistance: string
    maxDistance: string
    fee: string
}

export function AdminShippingFormModal({
    mode,
    initialData,
    isSubmitting,
    error,
    onClose,
    onSave,
    onMinDistanceChange,
    onMaxDistanceChange,
    onFeeChange,
    minDistance,
    maxDistance,
    fee
}: AdminShippingFormModalProps) {
    return (
        <div className='bg-card rounded-2xl w-full max-w-md p-6 border border-border shadow-xl relative animate-in fade-in zoom-in-95 duration-150'>
            <div className='flex items-center justify-between mb-6 border-b border-border/60 pb-3'>
                <div className='flex items-center gap-3'>
                    <div className='w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary'>
                        <MaterialIcon name={mode === 'add' ? 'local_shipping' : 'edit_location'} className='text-[24px]' />
                    </div>
                    <h3 className='font-bold text-lg text-primary'>
                        {mode === 'add' ? 'Thêm quy tắc mới' : 'Cập nhật Quy tắc'}
                    </h3>
                </div>
                <button
                    onClick={onClose}
                    className='text-muted-foreground hover:text-foreground transition-colors p-1'
                >
                    <MaterialIcon name='close' />
                </button>
            </div>

            <form className='space-y-4' onSubmit={(e) => { e.preventDefault(); onSave(); }}>
                <div>
                    <label className='block text-sm font-semibold text-muted-foreground mb-1.5'>
                        Khoảng cách tối thiểu (km)
                    </label>
                    <input
                        type='number'
                        step='any'
                        value={minDistance}
                        onChange={(e) => onMinDistanceChange(e.target.value)}
                        className='w-full rounded-xl border border-border bg-background px-4 py-2.5 text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20'
                        placeholder='Ví dụ: 0'
                        required
                    />
                </div>

                <div>
                    <label className='block text-sm font-semibold text-muted-foreground mb-1.5'>
                        Khoảng cách tối đa (km)
                    </label>
                    <input
                        type='number'
                        step='any'
                        value={maxDistance}
                        onChange={(e) => onMaxDistanceChange(e.target.value)}
                        className='w-full rounded-xl border border-border bg-background px-4 py-2.5 text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20'
                        placeholder='Ví dụ: 10'
                        required
                    />
                </div>

                <div>
                    <label className='block text-sm font-semibold text-muted-foreground mb-1.5'>
                        Phí vận chuyển (VND)
                    </label>
                    <div className='relative'>
                        <span className='absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-semibold'>
                            VND
                        </span>
                        <input
                            type='text'
                            value={fee}
                            onChange={(e) => onFeeChange(e.target.value)}
                            className='w-full rounded-xl border border-border bg-background pl-4 pr-14 py-2.5 text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20'
                            placeholder='Ví dụ: 25000'
                            required
                        />
                    </div>
                </div>

                {error && (
                    <div className='flex items-start gap-2 rounded-xl border border-destructive/20 bg-destructive/10 px-3 py-2 text-xs text-destructive'>
                        <MaterialIcon name='error' className='shrink-0 text-[16px]' />
                        <p>{error}</p>
                    </div>
                )}

                <div className='pt-4 flex gap-3'>
                    <button
                        type='button'
                        onClick={onClose}
                        className='flex-1 py-3 bg-muted hover:bg-muted/80 text-foreground font-semibold rounded-xl transition-all'
                    >
                        Hủy
                    </button>
                    <button
                        type='submit'
                        disabled={isSubmitting}
                        className='flex-1 py-3 font-semibold rounded-xl text-primary-foreground transition-all flex items-center justify-center gap-2 bg-primary hover:opacity-90 active:scale-95 disabled:opacity-50'
                    >
                        {isSubmitting ? (
                            <>
                                <MaterialIcon name='sync' className='animate-spin text-[18px]' />
                                Đang lưu...
                            </>
                        ) : (
                            'Lưu cấu hình'
                        )}
                    </button>
                </div>
            </form>
        </div>
    )
}
