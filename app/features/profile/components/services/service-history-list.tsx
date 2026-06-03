import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { MaterialIcon } from '~/shared/ui'
import { ServiceHistoryCard, type ServiceHistoryItem } from './service-history-card'
import { SERVICE_HISTORY_FILTERS, ServiceHistoryFilters, type ServiceHistoryFilter } from './service-history-filters'

const SERVICE_HISTORY_ITEMS: ServiceHistoryItem[] = [
  {
    key: 'bathStandard',
    status: 'upcoming',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuADvffWTqtcS1uWGbEdPPN5bgk_ght6dk-YqH8aMxRXCdo2FGhB7FaShvoNR40DL0-L_ZLb7TvwIxaCinsye3y_8ROVAiueoyntq1cuMdqy_cUelcA-AIz5wOV2Tq5A9alkAB0x2Ubhw0zrOeQbITXS4rLxmGKJc2aKJHso5tQQY28PxliiWGZnjfO5i_Js9Z22SWplA8n5gVDeAP4e593TNdEgaCoxZPtUB5Eg5YqrrtYmpZTjErvTz7NRhlDcN8Az-rc5kpV35NY',
    petImage:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAHe5MxCW68hId7Mfs592PiS8uiPCvY_ZmpGF42ECCgpMGnQkQpwTxfrEVt1b1HWOsseBHcAAu1VRrFZN89Sk0XQnLNSJy_I05KGugp9WC_5yjrQSSWvmSo7lRPvzlG30awhVoEy-yfmKpPrcMeR19Yw4GxpukyE-NsNOu2QI8uuG836-_uZ49GxyBHie0auxnrvrUxkO5ozuYpZvEThmErbe4hlRn4C3iR_XAylR10u5xoa4IMDCcKNE7KmNLFJ3pOHH5-8yl-JXw',
    price: '250.000đ',
    orderId: '#ORD-9921'
  },
  {
    key: 'professionalStyling',
    status: 'completed',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuA9FKJIlfsUIn3P6hPRF-nRUISMtFh3YEiHYgfx1A-bEvAu0i2SxHwlrKrizTAYe2nvcXUN9P-5_ulWY6Xb4t81HZ9AFxcuN7uoylonFyyOEvSVTWKSW1YLo8N6n_8CU2fdzv8ws97CwcFh5KOZ4-DEa-p_OAd8fY5d4DCcWdmRFRWd8yWUSdrr2QUnU3QD3iBa_JEiS944sb7thvgR-pPAIaFuzILwHMPTAKwWNb_txi_rklTNFYn_-wvKJGhivFzey3qKMr05Iew',
    petImage:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBB5QbUVaPRV5MtqH7DqjEOl51t9Zq72vd2PXql7V_7irEVJlAJ-LnrvpC0yCCIE223W66L9zzEQMB3sr584n9st4uyq_MtoAH4MArdH0Tlz1_NM_8LqfeYq0Rol3Jrpn54ByB8HGGUht_d9a16oIvfGqNxr43LyuFJQOOO9MSuPRn5re6ZiHP29U1Yg4l6CtDmp4nXgkgUESezTqvwSte8GVjSMnKC0RPPpNEPAl9wXXD5nJSpasQoY5_O-hnyByEejMdX1sGzvxQ',
    price: '450.000đ',
    orderId: '#ORD-8812'
  },
  {
    key: 'healthCheck',
    status: 'cancelled',
    price: '180.000đ'
  }
]

export function ServiceHistoryList() {
  const { t } = useTranslation('profile')
  const [activeFilter, setActiveFilter] = useState<ServiceHistoryFilter>('all')

  const filteredItems = useMemo(() => {
    if (activeFilter === 'all') {
      return SERVICE_HISTORY_ITEMS
    }

    return SERVICE_HISTORY_ITEMS.filter((item) => item.status === activeFilter)
  }, [activeFilter])

  return (
    <section>
      <div className='mb-6 flex justify-end'>
        <ServiceHistoryFilters activeFilter={activeFilter} onFilterChange={setActiveFilter} />
      </div>

      <div className='space-y-5'>
        {filteredItems.map((item) => (
          <ServiceHistoryCard key={item.key} item={item} />
        ))}
      </div>

      {activeFilter === 'all' ? (
        <div className='mt-12 flex justify-center'>
          <button
            type='button'
            className='flex items-center gap-2 rounded-full border-2 border-border px-6 py-2.5 text-sm font-bold text-muted-foreground transition-colors hover:border-primary hover:text-primary'
          >
            {t('serviceHistory.loadMore')}
            <MaterialIcon name='expand_more' className='text-[20px]' />
          </button>
        </div>
      ) : null}

      {SERVICE_HISTORY_FILTERS.includes(activeFilter) && filteredItems.length === 0 ? (
        <p className='rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground'>
          {t('serviceHistory.empty')}
        </p>
      ) : null}
    </section>
  )
}
