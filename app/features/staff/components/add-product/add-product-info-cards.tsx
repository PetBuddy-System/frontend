import { useTranslation } from 'react-i18next'

import { MaterialIcon } from '~/shared/ui'

export function AddProductInfoCards() {
  const { t } = useTranslation('staff')

  return (
    <div className='grid grid-cols-1 gap-6 sm:grid-cols-3'>
      <div className='rounded-xl border border-secondary/20 bg-secondary/5 p-6'>
        <MaterialIcon name='info' className='mb-3 text-2xl text-secondary' />
        <h4 className='mb-2 font-display text-lg font-bold text-secondary'>
          {t('addProduct.tips.title')}
        </h4>
        <p className='text-sm text-muted-foreground'>{t('addProduct.tips.content')}</p>
      </div>

      <div className='rounded-xl border border-primary/10 bg-primary/5 p-6'>
        <MaterialIcon name='auto_awesome' className='mb-3 text-2xl text-primary' />
        <h4 className='mb-2 font-display text-lg font-bold text-primary'>
          {t('addProduct.seo.title')}
        </h4>
        <p className='text-sm italic text-muted-foreground opacity-60'>
          {t('addProduct.seo.content')}
        </p>
      </div>

      <div className='rounded-xl border border-success/10 bg-success/5 p-6'>
        <MaterialIcon name='sync_alt' className='mb-3 text-2xl text-success' />
        <h4 className='mb-2 font-display text-lg font-bold text-success'>
          {t('addProduct.sync.title')}
        </h4>
        <p className='text-sm text-muted-foreground'>{t('addProduct.sync.content')}</p>
      </div>
    </div>
  )
}
