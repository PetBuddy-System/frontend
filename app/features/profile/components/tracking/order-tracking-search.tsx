import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { MaterialIcon } from '~/shared/ui'

export function OrderTrackingSearch() {
  const { t } = useTranslation('profile')
  const [query, setQuery] = useState('PS12345')

  return (
    <section className='mx-auto mb-10 max-w-2xl text-center'>
      <p className='mb-6 text-base text-muted-foreground'>{t('orderTracking.headerSubtitle')}</p>
      <div className='flex items-center overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all focus-within:border-transparent focus-within:ring-2 focus-within:ring-primary'>
        <MaterialIcon name='search' className='ml-4 text-muted-foreground' />
        <input
          type='text'
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('orderTracking.search.placeholder')}
          className='flex-1 border-none bg-transparent px-4 py-4 text-foreground placeholder:text-muted-foreground focus:ring-0'
        />
        <button
          type='button'
          className='bg-primary px-8 py-4 font-semibold text-primary-foreground transition-colors hover:opacity-90 active:scale-95'
        >
          {t('orderTracking.search.button')}
        </button>
      </div>
    </section>
  )
}
