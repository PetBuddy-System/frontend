import { useTranslation } from 'react-i18next'

import { VN, GB } from 'country-flag-icons/react/3x2'

import { Button } from '~/shared/ui/button'
import { type Language } from '~/shared/lib/i18n'

export function LanguageSwitcher() {
  const { i18n } = useTranslation()
  const current = (i18n.resolvedLanguage ?? 'vi') as Language
  const nextLang: Language = current === 'vi' ? 'en' : 'vi'

  return (
    <Button
      variant='outline'
      onClick={() => i18n.changeLanguage(nextLang)}
      aria-label={`Chuyển sang ${nextLang === 'vi' ? 'Tiếng Việt' : 'English'}`}
      className='h-8 w-12 rounded-full p-0'
    >
      {current === 'vi' ? <VN className='size-5' /> : <GB className='size-5' />}
    </Button>
  )
}
