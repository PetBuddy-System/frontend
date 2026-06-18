import { useTranslation } from 'react-i18next'

import { MaterialIcon } from '~/shared/ui'

export function BlogMarkdownTips() {
  const { t } = useTranslation('admin')

  return (
    <>
      <section className='rounded-3xl bg-primary p-6 text-primary-foreground shadow-sm'>
        <MaterialIcon name='lightbulb' className='text-2xl' />
        <h3 className='mt-3 text-base font-extrabold'>{t('blogManagement.create.tip.title')}</h3>
        <p className='mt-2 text-sm leading-relaxed text-primary-foreground/90'>
          {t('blogManagement.create.tip.text')}
        </p>
      </section>

      <section className='rounded-3xl border border-border bg-card p-6 shadow-sm'>
        <div className='flex items-center gap-3'>
          <div className='flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground'>
            <MaterialIcon name='pets' className='text-2xl' />
          </div>
          <div>
            <p className='text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground'>
              {t('blogManagement.create.accent.label')}
            </p>
            <h3 className='text-lg font-extrabold text-card-foreground'>
              {t('blogManagement.create.accent.title')}
            </h3>
          </div>
        </div>
        <p className='mt-4 text-sm text-muted-foreground'>{t('blogManagement.create.accent.text')}</p>
      </section>
    </>
  )
}
