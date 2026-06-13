import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { MaterialIcon } from '~/shared/ui'

export interface SiteChatModalProps {
  isOpen: boolean
  onClose: () => void
}

export function SiteChatModal({ isOpen, onClose }: SiteChatModalProps) {
  const { t } = useTranslation('landing')

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
      className='fixed inset-0 z-[60] flex items-end justify-center bg-black/40 p-3 backdrop-blur-[2px] md:items-center md:p-6'
      onClick={onClose}
    >
      <section
        role='dialog'
        aria-modal='true'
        aria-label={t('chatModal.title')}
        onClick={(event) => event.stopPropagation()}
        className='flex h-[min(88vh,780px)] w-full max-w-[min(1120px,calc(100vw-3rem))] flex-col overflow-hidden rounded-[1.75rem] border border-border bg-card shadow-2xl md:h-[min(86vh,760px)] md:max-w-[min(1120px,calc(100vw-6rem))]'
      >
        <div className='flex items-start justify-between gap-4 border-b border-border/70 bg-muted/40 px-4 py-4 md:px-5'>
          <div className='min-w-0'>
            <p className='text-[11px] uppercase tracking-[0.22em] text-primary'>{t('chatModal.eyebrow')}</p>
            <h3 className='mt-1 text-xl font-semibold text-foreground md:text-2xl'>{t('chatModal.title')}</h3>
            <p className='mt-2 max-w-xl text-sm leading-6 text-muted-foreground'>{t('chatModal.subtitle')}</p>
          </div>
          <button
            type='button'
            onClick={onClose}
            aria-label={t('chatModal.close')}
            className='flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
          >
            <MaterialIcon name='close' className='text-[22px]' />
          </button>
        </div>

        <div className='flex flex-1 flex-col bg-muted/40 p-4'>
          <div className='flex flex-1 flex-col gap-4'>
            <div className='flex-1 space-y-3 overflow-y-auto rounded-[1.25rem] bg-background p-4 md:p-5'>
              <article className='max-w-[82%] rounded-2xl rounded-tl-md border border-border bg-card px-4 py-3 text-sm leading-6 text-foreground shadow-sm'>
                {t('chatModal.greeting')}
              </article>
              <article className='ml-auto max-w-[82%] rounded-2xl rounded-tr-md bg-primary px-4 py-3 text-sm leading-6 text-primary-foreground shadow-sm'>
                {t('chatModal.reply')}
              </article>
              <article className='max-w-[82%] rounded-2xl rounded-tl-md border border-border bg-card px-4 py-3 text-sm leading-6 text-foreground shadow-sm'>
                {t('chatModal.followUp')}
              </article>
            </div>

            <div className='rounded-[1.25rem] border border-border bg-background p-4'>
              <label className='text-xs uppercase tracking-[0.18em] text-muted-foreground' htmlFor='chat-input'>
                {t('chatModal.inputLabel')}
              </label>
              <div className='mt-2 flex flex-col gap-2 sm:flex-row'>
                <input
                  id='chat-input'
                  type='text'
                  placeholder={t('chatModal.placeholder')}
                  className='h-12 w-full rounded-xl border border-border bg-muted px-4 text-sm text-foreground outline-none transition-colors focus:border-primary'
                />
                <button
                  type='button'
                  className='inline-flex h-12 items-center justify-center rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm transition-transform hover:opacity-90 active:scale-[0.98]'
                >
                  {t('chatModal.send')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
