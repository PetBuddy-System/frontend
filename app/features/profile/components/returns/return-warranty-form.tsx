import { useState, useRef, type ChangeEvent } from 'react'
import { useTranslation } from 'react-i18next'

import { MaterialIcon } from '~/shared/ui'
import { cn } from '~/shared/lib/cn'

interface Product {
  id: string
  name: string
  quantity: number
  price: string
  image: string
}

interface Order {
  id: string
  date: string
  products: Product[]
}

const MOCK_ORDERS: Order[] = [
  {
    id: 'ORD-2901',
    date: '25/10/2023',
    products: [
      {
        id: 'p1',
        name: 'Thức ăn hạt hữu cơ cho chó Royal Canin (3kg)',
        quantity: 1,
        price: '450.000đ',
        image:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuCCZjWQ89yyuLgFBsuNzQajJ9iuh41gaxosfNeE7A6CzUpEZOKRLErH53i6HwIXlrdkB1Ij4OjcKTW9OMLoHukeizoHxR2AVMpo5e9TwoPUqGk9vkTAFXZz--qy7Ubqr8OVRaTyL1VTx7AaPip9Gr57yV5p7EWr_eBukOxp4zLSpfT6rLgJnpdTNoIQDXKw5sUvSsdM1IKFKPJ_650Evt4R3fiwKZl2bPu09P47pv5QjuC6c6SnIzXk7N5JgIt-1rgn9ArnmmjO04g'
      },
      {
        id: 'p2',
        name: 'Lược chải lông Pet Spa Professional',
        quantity: 1,
        price: '120.000đ',
        image:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuDv3PKK0RyvIeSO5m-Drs04bT81aPST8RY3Lssnb70QwUkIAxaB8vj7CPOZvt37Gpcsj8Ry6bUlJ19PVY5hQJyz1b52A_F4xUEnOUyZFgG9GcOyXR7ZzgXA8IzqEjtvsBWHo6HFIxy5J_rPkbfNCfnShKYIoFRFDu6scFff2Jsov7hYma86mGcsrhttFUCdzTW9QqAwOtO1vJLLs9rc-K7dygqcjz5eSSZKp71_0TKbpXtDnog88drm2cWeysiY1ls_foUD2SR2muA'
      }
    ]
  },
  {
    id: 'ORD-3122',
    date: '12/10/2023',
    products: [
      {
        id: 'p3',
        name: 'Sữa tắm Hello cho chó mèo 280g',
        quantity: 2,
        price: '120.000đ',
        image:
          'https://lh3.googleusercontent.com/aida/ADBb0uiD2iNUbQz2Hs_xHergS9X6TBN_RLOdfzCsTQyFr6mPAI-q3PGlxKrEMWRS2mZ6NW5BIkBX-Zwmjrxk3CaHaHVNRCBreBxbANzRZjr6NDa5HAh66eUX-SlKemHGRcmR_oQWLH6UM8Cx6etWFvrzC_Zx7Ik9t1KFjGCBvXF-f5CrDF0NKIcL2T-AIK1gNaPoq4OK1LWnzv-OI2BejbgO7sGLwh9HNHuYMAvDK00LoTsZwkVJulKsabSdbqs'
      }
    ]
  }
]

const PRESET_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAGYTHi3oX1ppEppmbZo-xS5j4v7UrX5AS9CfPdN521F4bz2JTve9QphSmvnKOefvCQ-J7QN-fnvKzHS2taH0N56eN37XGVrwebTW1GlOapBKJ9GsxhTVbPuOZgmiwp6xtcwYpe7ur_k2e2QS0cBK_VUCLoGlo41YBCtpd-vrHqQmeG80l4_hIayc7K9_jSqLxdchjH_hO3r7v13MzDG8HYXPnG-9pbPEe3WVIU_xOdXzfFdFsxIC2fw6N3dR9sHzGv9_zNtUdwn8s'

export function ReturnWarrantyForm() {
  const { t } = useTranslation('profile')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Form states
  const [selectedOrderId, setSelectedOrderId] = useState<string>('')
  const [selectedProducts, setSelectedProducts] = useState<Record<string, boolean>>({})
  const [requestType, setRequestType] = useState<'exchange' | 'warranty'>('exchange')
  const [reason, setReason] = useState<string>('defect')
  const [description, setDescription] = useState<string>('')
  const [photos, setPhotos] = useState<string[]>([PRESET_IMAGE])
  const [error, setError] = useState<string | null>(null)
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false)

  const selectedOrder = MOCK_ORDERS.find((o) => o.id === selectedOrderId)

  const handleOrderChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const orderId = e.target.value
    setSelectedOrderId(orderId)
    setSelectedProducts({})
    setError(null)
  }

  const handleProductToggle = (productId: string) => {
    setSelectedProducts((prev) => ({
      ...prev,
      [productId]: !prev[productId]
    }))
    setError(null)
  }

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files)
      const newUrls = filesArray.map((file) => URL.createObjectURL(file))
      setPhotos((prev) => {
        const combined = [...prev, ...newUrls]
        return combined.slice(0, 5) // Max 5 images
      })
      setError(null)
    }
  }

  const removePhoto = (indexToRemove: number) => {
    setPhotos((prev) => prev.filter((_, idx) => idx !== indexToRemove))
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedOrderId) {
      setError(t('returnWarranty.order.placeholder'))
      return
    }

    const hasSelectedProduct = Object.values(selectedProducts).some((val) => val === true)
    if (!hasSelectedProduct) {
      setError(t('returnWarranty.order.selectProducts'))
      return
    }

    if (!description.trim() || description.trim().length < 10) {
      setError(t('returnWarranty.reason.placeholder'))
      return
    }

    setError(null)
    setIsSubmitted(true)
  }

  const resetForm = () => {
    setSelectedOrderId('')
    setSelectedProducts({})
    setRequestType('exchange')
    setReason('defect')
    setDescription('')
    setPhotos([PRESET_IMAGE])
    setError(null)
    setIsSubmitted(false)
  }

  if (isSubmitted) {
    return (
      <div className='flex flex-col items-center justify-center rounded-xl border border-border bg-card p-8 text-center shadow-md'>
        <div className='mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success text-success-foreground'>
          <MaterialIcon name='check' className='text-[36px]' />
        </div>
        <h3 className='font-display text-xl font-bold text-foreground sm:text-2xl'>
          {t('returnWarranty.success.title')}
        </h3>
        <p className='mt-2 max-w-md text-sm text-muted-foreground'>{t('returnWarranty.success.message')}</p>
        <button
          type='button'
          onClick={resetForm}
          className='mt-6 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground transition-all hover:brightness-105 active:scale-[0.98]'
        >
          {t('returnWarranty.success.button')}
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className='space-y-6'>
      {error && (
        <div className='flex items-center gap-2 rounded-xl bg-destructive/10 p-4 text-sm font-semibold text-destructive'>
          <MaterialIcon name='error' className='shrink-0 text-xl' />
          <span>{error}</span>
        </div>
      )}

      {/* Step 1: Chọn đơn hàng */}
      <div className='space-y-4 rounded-xl border border-border bg-card p-4 shadow-sm'>
        <div className='flex items-center gap-3'>
          <span className='flex h-8 w-8 items-center justify-center rounded-full bg-primary font-display text-sm font-bold text-primary-foreground'>
            1
          </span>
          <h3 className='font-display text-lg font-bold text-foreground'>{t('returnWarranty.step.order')}</h3>
        </div>

        <div className='relative'>
          <select
            value={selectedOrderId}
            onChange={handleOrderChange}
            className='w-full cursor-pointer appearance-none rounded-xl border border-border bg-muted p-4 pr-12 text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary focus:ring-offset-0 focus:outline-none transition-colors'
          >
            <option value=''>{t('returnWarranty.order.placeholder')}</option>
            {MOCK_ORDERS.map((order) => (
              <option key={order.id} value={order.id}>
                {order.id} - {order.date} ({order.products.length} {t('sidebar.nav.orders').toLowerCase()})
              </option>
            ))}
          </select>
          <MaterialIcon
            name='expand_more'
            className='pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-2xl text-muted-foreground'
          />
        </div>

        {/* Product checkboxes */}
        {selectedOrder && (
          <div className='mt-4 border-t border-border pt-4 space-y-3'>
            <p className='px-2 font-display text-xs font-bold tracking-wider text-muted-foreground'>
              {t('returnWarranty.order.selectProducts')}
            </p>
            <div className='space-y-3'>
              {selectedOrder.products.map((product) => (
                <label
                  key={product.id}
                  className={cn(
                    'flex items-center gap-4 rounded-xl border border-border bg-card p-3 cursor-pointer transition-colors hover:bg-muted/50',
                    selectedProducts[product.id] && 'border-primary bg-primary/5'
                  )}
                >
                  <input
                    type='checkbox'
                    checked={!!selectedProducts[product.id]}
                    onChange={() => handleProductToggle(product.id)}
                    className='h-5 w-5 rounded border-border text-primary focus:ring-primary focus:ring-offset-0'
                  />
                  <img src={product.image} alt={product.name} className='h-16 w-16 rounded-lg object-cover' />
                  <div className='flex-1'>
                    <p className='text-sm font-semibold text-foreground'>{product.name}</p>
                    <p className='text-xs text-muted-foreground mt-1'>
                      {t('returnWarranty.order.quantity', { qty: product.quantity })} |{' '}
                      {t('returnWarranty.order.price', { price: product.price })}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Step 2: Hình thức yêu cầu */}
      <div className='space-y-4 rounded-xl border border-border bg-card p-4 shadow-sm'>
        <div className='flex items-center gap-3'>
          <span className='flex h-8 w-8 items-center justify-center rounded-full bg-primary font-display text-sm font-bold text-primary-foreground'>
            2
          </span>
          <h3 className='font-display text-lg font-bold text-foreground'>{t('returnWarranty.step.type')}</h3>
        </div>

        <div className='flex flex-col gap-4 sm:flex-row'>
          <label
            onClick={() => setRequestType('exchange')}
            className={cn(
              'flex flex-1 cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-border bg-card p-4 transition-all hover:bg-muted',
              requestType === 'exchange' && 'border-primary bg-primary/5 text-primary'
            )}
          >
            <input
              type='radio'
              name='request_type'
              checked={requestType === 'exchange'}
              onChange={() => setRequestType('exchange')}
              className='sr-only'
            />
            <MaterialIcon name='swap_horiz' className='text-3xl' />
            <span className='text-sm font-bold'>{t('returnWarranty.type.exchange')}</span>
          </label>

          <label
            onClick={() => setRequestType('warranty')}
            className={cn(
              'flex flex-1 cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-border bg-card p-4 transition-all hover:bg-muted',
              requestType === 'warranty' && 'border-primary bg-primary/5 text-primary'
            )}
          >
            <input
              type='radio'
              name='request_type'
              checked={requestType === 'warranty'}
              onChange={() => setRequestType('warranty')}
              className='sr-only'
            />
            <MaterialIcon name='verified_user' className='text-3xl' />
            <span className='text-sm font-bold'>{t('returnWarranty.type.warranty')}</span>
          </label>
        </div>
      </div>

      {/* Step 3: Lý do & Mô tả */}
      <div className='space-y-4 rounded-xl border border-border bg-card p-4 shadow-sm'>
        <div className='flex items-center gap-3'>
          <span className='flex h-8 w-8 items-center justify-center rounded-full bg-primary font-display text-sm font-bold text-primary-foreground'>
            3
          </span>
          <h3 className='font-display text-lg font-bold text-foreground'>{t('returnWarranty.step.reason')}</h3>
        </div>

        <div className='space-y-4'>
          <div className='space-y-2'>
            <label className='text-xs font-bold text-muted-foreground'>{t('returnWarranty.reason.label')}</label>
            <div className='relative'>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className='w-full cursor-pointer appearance-none rounded-xl border border-border bg-muted p-3 pr-12 text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary focus:ring-offset-0 focus:outline-none transition-colors'
              >
                <option value='defect'>{t('returnWarranty.reason.options.defect')}</option>
                <option value='wrong'>{t('returnWarranty.reason.options.wrong')}</option>
                <option value='notAsDescribed'>{t('returnWarranty.reason.options.notAsDescribed')}</option>
                <option value='damaged'>{t('returnWarranty.reason.options.damaged')}</option>
                <option value='other'>{t('returnWarranty.reason.options.other')}</option>
              </select>
              <MaterialIcon
                name='expand_more'
                className='pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-2xl text-muted-foreground'
              />
            </div>
          </div>

          <div className='space-y-2'>
            <label className='text-xs font-bold text-muted-foreground'>
              {t('returnWarranty.reason.descriptionLabel')}
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('returnWarranty.reason.placeholder')}
              className='w-full rounded-xl border border-border bg-muted p-4 text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary focus:ring-offset-0 focus:outline-none transition-colors'
            />
          </div>
        </div>
      </div>

      {/* Step 4: Hình ảnh minh họa */}
      <div className='space-y-4 rounded-xl border border-border bg-card p-4 shadow-sm'>
        <div className='flex items-center gap-3'>
          <span className='flex h-8 w-8 items-center justify-center rounded-full bg-primary font-display text-sm font-bold text-primary-foreground'>
            4
          </span>
          <h3 className='font-display text-lg font-bold text-foreground'>{t('returnWarranty.step.photos')}</h3>
        </div>

        <div className='grid grid-cols-2 gap-4 sm:grid-cols-4'>
          <input
            type='file'
            multiple
            accept='image/*'
            ref={fileInputRef}
            onChange={handleFileUpload}
            className='hidden'
          />
          <button
            type='button'
            onClick={triggerFileInput}
            className='flex aspect-square flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-card text-muted-foreground hover:bg-muted hover:text-primary transition-all active:scale-95'
          >
            <MaterialIcon name='add_a_photo' className='text-3xl' />
            <span className='text-[10px] font-bold uppercase'>{t('returnWarranty.photos.upload')}</span>
          </button>

          {/* Render uploaded image previews */}
          {photos.map((url, idx) => (
            <div key={idx} className='group relative aspect-square overflow-hidden rounded-xl bg-muted shadow-sm'>
              <img src={url} alt='Upload preview' className='h-full w-full object-cover' />
              <button
                type='button'
                onClick={() => removePhoto(idx)}
                className='absolute right-1 top-1 rounded-full bg-black/50 p-1 text-white opacity-0 transition-opacity hover:bg-black/70 group-hover:opacity-100'
              >
                <MaterialIcon name='close' className='text-sm' />
              </button>
            </div>
          ))}
        </div>
        <p className='text-xs italic text-muted-foreground'>{t('returnWarranty.photos.note')}</p>
      </div>

      <button
        type='submit'
        className='flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 font-display text-lg font-bold text-primary-foreground shadow-md hover:brightness-105 active:scale-[0.98] transition-all'
      >
        <span>{t('returnWarranty.submit')}</span>
        <MaterialIcon name='send' />
      </button>
    </form>
  )
}
