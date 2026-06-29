import { useTranslation } from 'react-i18next'

interface TrackingProduct {
  name: string
  quantity: number
  price: string
  image: string
}

const MOCK_ORDER = {
  id: '#PS12345',
  date: '23/10/2024, 15:30',
  recipient: 'Nguyễn Văn An',
  address: '123 Đường Nguyễn Hữu Thọ, P. Tân Phong, Quận 7, TP. HCM',
  products: [
    {
      name: 'Sữa tắm Olive Essence',
      quantity: 1,
      price: '185.000đ',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBNHKu6zRHd6rKeZY1Eh9rsffycauOAK0w6kAXB4up7LVhBIP32guJUvFpPKNn4dZ6QFwflafDv-r-6n9UtkVhgbyyAX_VB68BnokxbYS6e6m539rfmTzqwrrkfPDNDXF4poLQ7nPgDcKSOyGOrniDaaakh1saiDePWv5BLMtt3FhVD8iRT8N7NAt4CY1qv2a6NgSX0jPgHpqMWxJ7c5v23bYtyo79RwK8w5g2lyZ8EIvSAHenZhHISOXbgfMaoyHyly5vfxgHVDGM'
    },
    {
      name: 'Thức ăn Royal Canin',
      quantity: 1,
      price: '450.000đ',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuCldtKricSBr4txEjDdsQW7cJ82MdWo5quaEGH28fvsamW0muaZoQc5F4pjEOb1PrGQLY_WCRbnsoJkNopTIqv_E9HEdHZRhwPFIXa_gHEbDN5oGiSlzguMoZzUqahHOdOvo0HXYep8fS5kjatxGsevw7rAv5ZLSKZ_60q6MidPZkq1fRTotqlT0mcJbB3Prfs6n25RuPq6UO3dJqdwQML-4RU5pmqjjY_MY2ZZ5CfZWH48x0QMhIH_M52iNYOjmdKJVrjlbyVjsbg'
    }
  ] satisfies TrackingProduct[],
  subtotal: '635.000đ',
  shippingFee: null as string | null,
  total: '635.000đ'
}

export function OrderTrackingInfo() {
  const { t } = useTranslation('profile')

  return (
    <div className='overflow-hidden rounded-2xl bg-card shadow-sm'>
      {/* Header */}
      <div className='bg-primary p-6'>
        <h3 className='font-display text-lg font-semibold text-primary-foreground'>{t('orderTracking.info.title')}</h3>
        <p className='mt-1 text-sm font-bold text-primary-foreground/80'>{MOCK_ORDER.id}</p>
      </div>

      <div className='space-y-6 p-6'>
        {/* Order details */}
        <div className='space-y-4 border-b border-border pb-6'>
          <div className='flex items-start justify-between'>
            <span className='text-sm text-muted-foreground'>{t('orderTracking.info.orderDate')}</span>
            <span className='text-right font-bold text-foreground'>{MOCK_ORDER.date}</span>
          </div>
          <div className='flex items-start justify-between'>
            <span className='text-sm text-muted-foreground'>{t('orderTracking.info.recipient')}</span>
            <span className='text-right font-bold text-foreground'>{MOCK_ORDER.recipient}</span>
          </div>
          <div className='flex items-start justify-between'>
            <span className='text-sm text-muted-foreground'>{t('orderTracking.info.address')}</span>
            <span className='max-w-[180px] text-right font-medium text-foreground'>{MOCK_ORDER.address}</span>
          </div>
        </div>

        {/* Products */}
        <div className='space-y-4'>
          <p className='text-sm font-bold uppercase tracking-wider text-foreground'>
            {t('orderTracking.info.productsCount', {
              count: MOCK_ORDER.products.length
            })}
          </p>
          {MOCK_ORDER.products.map((product, idx) => (
            <div key={idx} className='flex items-center gap-4'>
              <div className='h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-muted'>
                <img src={product.image} alt={product.name} className='h-full w-full object-cover' />
              </div>
              <div className='flex-1'>
                <p className='line-clamp-1 font-semibold text-foreground'>{product.name}</p>
                <p className='text-sm text-muted-foreground'>
                  {t('orderTracking.info.quantity', { qty: product.quantity })}
                </p>
              </div>
              <p className='text-sm font-bold text-primary'>{product.price}</p>
            </div>
          ))}
        </div>

        {/* Price summary */}
        <div className='space-y-2 rounded-xl bg-muted p-4'>
          <div className='flex justify-between'>
            <span className='text-sm'>{t('orderTracking.info.subtotal')}</span>
            <span className='text-sm'>{MOCK_ORDER.subtotal}</span>
          </div>
          <div className='flex justify-between'>
            <span className='text-sm'>{t('orderTracking.info.shippingFee')}</span>
            <span className='text-sm'>{MOCK_ORDER.shippingFee ?? t('orderTracking.info.shippingFree')}</span>
          </div>
          <div className='mt-2 flex items-baseline justify-between border-t border-border pt-2'>
            <span className='font-bold'>{t('orderTracking.info.total')}</span>
            <span className='font-display text-xl font-bold text-primary'>{MOCK_ORDER.total}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
