import { useState, type ChangeEvent } from 'react'
import { useTranslation } from 'react-i18next'

import { MaterialIcon } from '~/shared/ui'
import { ReturnWarrantySuccess } from './return-warranty-success'
import { ReturnWarrantyStepOrder, type ReturnOrder } from './return-warranty-step-order'
import { ReturnWarrantyStepType } from './return-warranty-step-type'
import { ReturnWarrantyStepReason } from './return-warranty-step-reason'
import { ReturnWarrantyStepPhotos } from './return-warranty-step-photos'

const MOCK_ORDERS: ReturnOrder[] = [
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

  // Form states
  const [selectedOrderId, setSelectedOrderId] = useState<string>('')
  const [selectedProducts, setSelectedProducts] = useState<Record<string, boolean>>({})
  const [requestType, setRequestType] = useState<'exchange' | 'warranty'>('exchange')
  const [reason, setReason] = useState<string>('defect')
  const [description, setDescription] = useState<string>('')
  const [photos, setPhotos] = useState<string[]>([PRESET_IMAGE])
  const [error, setError] = useState<string | null>(null)
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false)

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

  const handlePhotosChange = (newPhotos: string[]) => {
    setPhotos(newPhotos)
    setError(null)
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
    return <ReturnWarrantySuccess onReset={resetForm} />
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
      <ReturnWarrantyStepOrder
        selectedOrderId={selectedOrderId}
        selectedProducts={selectedProducts}
        orders={MOCK_ORDERS}
        onOrderChange={handleOrderChange}
        onProductToggle={handleProductToggle}
      />

      {/* Step 2: Hình thức yêu cầu */}
      <ReturnWarrantyStepType requestType={requestType} onChange={setRequestType} />

      {/* Step 3: Lý do & Mô tả */}
      <ReturnWarrantyStepReason
        reason={reason}
        description={description}
        onReasonChange={(val) => {
          setReason(val)
          setError(null)
        }}
        onDescriptionChange={(val) => {
          setDescription(val)
          setError(null)
        }}
      />

      {/* Step 4: Hình ảnh minh họa */}
      <ReturnWarrantyStepPhotos photos={photos} onPhotosChange={handlePhotosChange} />

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
