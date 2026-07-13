import { useTranslation } from 'react-i18next'

export function AdminFooter() {
  const { t } = useTranslation('admin')

  return (
    <footer className='flex flex-col gap-3 border-t border-border py-6 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between'>
      <p className='font-semibold uppercase tracking-[0.2em]'>{t('footer.version')}</p>
      <nav className='flex flex-wrap gap-4' aria-label={t('footer.label')}>
        <a href='/contact' className='font-semibold transition-colors hover:text-primary'>
          {t('footer.privacy')}
        </a>
        <a href='/contact' className='font-semibold transition-colors hover:text-primary'>
          {t('footer.terms')}
        </a>
      </nav>
    </footer>
  )
}
