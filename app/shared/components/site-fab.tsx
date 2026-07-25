import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { SiteChatModal } from './site-chat-modal'
import { MaterialIcon } from '~/shared/ui'

const ZALO_LINK = 'https://zalo.me/0772905704'

export function SiteFab() {
  const { t } = useTranslation('landing')
  const [isChatOpen, setIsChatOpen] = useState(false)

  return (
    <>
      <div className='fixed bottom-8 right-8 z-50 hidden flex-col items-end gap-3 md:flex'>
        <a
          href={ZALO_LINK}
          target='_blank'
          rel='noreferrer'
          aria-label={t('actions.callNow')}
          className='flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105'
        >
          <MaterialIcon name='call' className='text-[24px]' />
        </a>
        <button
          type='button'
          onClick={() => setIsChatOpen((open) => !open)}
          aria-label={t('actions.supportChat')}
          className='flex h-14 w-14 items-center justify-center rounded-full bg-brand-zalo text-brand-zalo-foreground shadow-lg transition-transform hover:scale-105'
        >
          <MaterialIcon name='chat' className='text-[28px]' />
        </button>
      </div>

      <SiteChatModal isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </>
  )
}
