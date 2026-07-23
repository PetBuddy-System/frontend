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
          className='group relative flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-card text-primary shadow-xl transition-transform hover:scale-105'
        >
          <span className='absolute -left-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md'>
            <MaterialIcon name='pets' className='text-[16px]' />
          </span>
          <span className='flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10'>
            <MaterialIcon name='psychology' className='text-[30px]' />
          </span>
          <span className='pointer-events-none absolute right-[4.75rem] top-1/2 hidden -translate-y-1/2 whitespace-nowrap rounded-lg border border-border bg-card px-3 py-2 text-sm font-bold text-card-foreground shadow-lg group-hover:block'>
            {t('chatModal.assistantLabel')}
          </span>
        </button>
      </div>

      <SiteChatModal isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </>
  )
}
