import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import { MaterialIcon } from '~/shared/ui'

export interface SiteChatModalProps {
  isOpen: boolean
  onClose: () => void
}

export function SiteChatModal({ isOpen, onClose }: SiteChatModalProps) {
  const { t } = useTranslation('landing')
  const panelRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      ref={panelRef}
      role='dialog'
      aria-modal='false'
      aria-label={t('chatModal.title')}
      className='fixed bottom-[88px] right-6 z-50 flex h-[min(72vh,520px)] w-[min(360px,calc(100vw-3rem))] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl md:right-8 md:bottom-[96px]'
    >
      <div className='flex shrink-0 items-center justify-between gap-3 border-b border-border/70 bg-muted/40 px-4 py-3'>
        <div className='flex min-w-0 items-center gap-3'>
          <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm'>
            <MaterialIcon name='smart_toy' className='text-[20px]' />
          </div>
          <div className='min-w-0'>
            <h3 className='truncate text-sm font-semibold text-foreground'>{t('chatModal.title')}</h3>
            <p className='truncate text-xs text-muted-foreground'>{t('chatModal.subtitle')}</p>
          </div>
        </div>
        <button
          type='button'
          onClick={onClose}
          aria-label={t('chatModal.close')}
          className='flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
        >
          <MaterialIcon name='close' className='text-[18px]' />
        </button>
      </div>

      <div className='flex flex-1 flex-col gap-3 overflow-hidden bg-muted/30 p-3'>
        <div className='flex-1 space-y-3 overflow-y-auto rounded-xl bg-background p-3'>
          <article className='max-w-[85%] rounded-2xl rounded-tl-md border border-border bg-card px-3 py-2 text-sm leading-6 text-foreground shadow-sm'>
            {t('chatModal.greeting')}
          </article>
          <article className='ml-auto max-w-[85%] rounded-2xl rounded-tr-md bg-primary px-3 py-2 text-sm leading-6 text-primary-foreground shadow-sm'>
            {t('chatModal.reply')}
          </article>
          <article className='max-w-[85%] rounded-2xl rounded-tl-md border border-border bg-card px-3 py-2 text-sm leading-6 text-foreground shadow-sm'>
            {t('chatModal.followUp')}
          </article>
        </div>

        <div className='shrink-0 rounded-xl border border-border bg-background p-2'>
          <div className='flex items-center gap-2'>
            <input
              id='chat-input'
              type='text'
              placeholder={t('chatModal.placeholder')}
              className='h-10 w-full rounded-lg border border-border bg-muted px-3 text-sm text-foreground outline-none transition-colors focus:border-primary'
            />
            <button
              type='button'
              aria-label={t('chatModal.send')}
              className='inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm transition-transform hover:opacity-90 active:scale-[0.97]'
            >
              <MaterialIcon name='send' className='text-[18px]' />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
