import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useAuth } from '~/providers/auth-provider'
import { STORAGE_KEYS } from '~/shared/config/site'
import { cn } from '~/shared/lib/cn'
import { readStorage, writeStorage } from '~/shared/lib/storage'
import {
  chatbotApi,
  type ChatbotConversationSummary,
  type ChatbotMessage,
  type ChatbotMessageRole
} from '~/shared/services/chatbot'
import { Button, MaterialIcon } from '~/shared/ui'

export interface SiteChatModalProps {
  isOpen: boolean
  onClose: () => void
}

interface UiChatMessage extends ChatbotMessage {
  localImages?: string[]
}

interface RetryChatRequest {
  conversationId: string | null
  imageFiles: File[]
  imagePreviews: string[]
  messageText: string
}

const MAX_IMAGES = 3
const CONVERSATION_PAGE_SIZE = 30

function getHiddenConversationIds() {
  const storedValue = readStorage(STORAGE_KEYS.hiddenChatConversations)
  if (!storedValue) return new Set<string>()

  try {
    const parsedValue = JSON.parse(storedValue)
    if (!Array.isArray(parsedValue)) return new Set<string>()

    return new Set(parsedValue.filter((item): item is string => typeof item === 'string'))
  } catch {
    return new Set<string>()
  }
}

function writeHiddenConversationIds(ids: Set<string>) {
  writeStorage(STORAGE_KEYS.hiddenChatConversations, JSON.stringify([...ids]))
}

function extractErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) return error.message

  return null
}

function makeLocalMessage(role: ChatbotMessageRole, content: string, localImages: string[] = []): UiChatMessage {
  return {
    conversationMessageId: `local-${role.toLowerCase()}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    role,
    content,
    localImages,
    createdAt: new Date().toISOString()
  }
}

function ChatbotLogo() {
  return (
    <div className='relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm'>
      <MaterialIcon name='pets' className='absolute -left-1 -top-1 text-[16px]' />
      <MaterialIcon name='psychology' className='text-[24px]' />
    </div>
  )
}

export function SiteChatModal({ isOpen, onClose }: SiteChatModalProps) {
  const { i18n, t } = useTranslation('landing')
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [conversations, setConversations] = useState<ChatbotConversationSummary[]>([])
  const [hiddenConversationIds, setHiddenConversationIds] = useState<Set<string>>(() => getHiddenConversationIds())
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null)
  const [openMenuConversationId, setOpenMenuConversationId] = useState<string | null>(null)
  const [messages, setMessages] = useState<UiChatMessage[]>([])
  const [prompt, setPrompt] = useState('')
  const [selectedImages, setSelectedImages] = useState<Array<{ file: File; previewUrl: string }>>([])
  const [isLoadingConversations, setIsLoadingConversations] = useState(false)
  const [isLoadingDetail, setIsLoadingDetail] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [retryRequest, setRetryRequest] = useState<RetryChatRequest | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const messageListRef = useRef<HTMLDivElement | null>(null)

  const visibleConversations = useMemo(
    () => conversations.filter((conversation) => !hiddenConversationIds.has(conversation.conversationId)),
    [conversations, hiddenConversationIds]
  )

  const hasDraft = prompt.trim().length > 0 || selectedImages.length > 0
  const locale = i18n.language === 'en' ? 'en-US' : 'vi-VN'
  const canPersistConversations = isAuthenticated

  const loadConversations = useCallback(async () => {
    if (!canPersistConversations) {
      setConversations([])
      setIsLoadingConversations(false)
      return
    }

    setIsLoadingConversations(true)

    try {
      const response = await chatbotApi.getConversations({ page: 1, size: CONVERSATION_PAGE_SIZE })
      setConversations(response.data.content ?? [])
    } catch (error) {
      setRetryRequest(null)
      setErrorMessage(extractErrorMessage(error) ?? t('chatModal.errors.loadConversations'))
    } finally {
      setIsLoadingConversations(false)
    }
  }, [canPersistConversations, t])

  const loadConversationDetail = useCallback(
    async (conversationId: string) => {
      if (!canPersistConversations) return

      setIsLoadingDetail(true)
      setErrorMessage(null)

      try {
        const response = await chatbotApi.getConversation(conversationId)
        setActiveConversationId(response.data.conversationId)
        setMessages(response.data.messages ?? [])
      } catch (error) {
        setRetryRequest(null)
        setErrorMessage(extractErrorMessage(error) ?? t('chatModal.errors.loadDetail'))
      } finally {
        setIsLoadingDetail(false)
      }
    },
    [canPersistConversations, t]
  )

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  useEffect(() => {
    if (!isOpen || isAuthLoading) return

    // eslint-disable-next-line react-hooks/set-state-in-effect -- Conversation history is loaded when the floating chat is opened.
    void loadConversations()
  }, [isAuthLoading, isOpen, loadConversations])

  useEffect(() => {
    if (canPersistConversations) return

    // eslint-disable-next-line react-hooks/set-state-in-effect -- Anonymous chat should not keep persisted conversation state.
    setConversations([])
    setActiveConversationId(null)
    setOpenMenuConversationId(null)
  }, [canPersistConversations])

  useEffect(() => {
    const element = messageListRef.current
    if (!element) return

    element.scrollTop = element.scrollHeight
  }, [messages, isSending])

  function handleNewConversation() {
    setActiveConversationId(null)
    setMessages([])
    setPrompt('')
    setErrorMessage(null)
    setRetryRequest(null)
    setOpenMenuConversationId(null)
    setSelectedImages((currentImages) => {
      currentImages.forEach((image) => URL.revokeObjectURL(image.previewUrl))
      return []
    })
  }

  function handleImageSelect(files: FileList | null) {
    if (!files) return

    const imageFiles = Array.from(files).filter((file) => file.type.startsWith('image/'))
    const remainingSlots = MAX_IMAGES - selectedImages.length

    if (remainingSlots <= 0) {
      setErrorMessage(t('chatModal.errors.imageLimit'))
      setRetryRequest(null)
      return
    }

    const acceptedImages = imageFiles.slice(0, remainingSlots).map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file)
    }))

    if (imageFiles.length > remainingSlots) {
      setErrorMessage(t('chatModal.errors.imageLimit'))
      setRetryRequest(null)
    }

    setSelectedImages((currentImages) => [...currentImages, ...acceptedImages])

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  function handleRemoveImage(previewUrl: string) {
    setSelectedImages((currentImages) => {
      const nextImages = currentImages.filter((image) => image.previewUrl !== previewUrl)
      URL.revokeObjectURL(previewUrl)

      return nextImages
    })
  }

  function handleHideConversation(conversationId: string) {
    const nextHiddenIds = new Set(hiddenConversationIds)
    nextHiddenIds.add(conversationId)
    setHiddenConversationIds(nextHiddenIds)
    writeHiddenConversationIds(nextHiddenIds)
    setOpenMenuConversationId(null)

    if (activeConversationId === conversationId) {
      handleNewConversation()
    }
  }

  async function handleSendMessage(retryPayload?: RetryChatRequest) {
    if ((!hasDraft && !retryPayload) || isSending) return

    const isRetry = Boolean(retryPayload)
    const messageText = retryPayload?.messageText ?? prompt.trim()
    const imageFiles = retryPayload?.imageFiles ?? selectedImages.map((image) => image.file)
    const imagePreviews = retryPayload?.imagePreviews ?? selectedImages.map((image) => image.previewUrl)
    const conversationId = retryPayload?.conversationId ?? activeConversationId

    if (!isRetry) {
      setPrompt('')
      setSelectedImages([])
      setMessages((currentMessages) => [...currentMessages, makeLocalMessage('USER', messageText, imagePreviews)])
    }

    setErrorMessage(null)
    setRetryRequest(null)
    setIsSending(true)

    try {
      const response = await chatbotApi.chat({
        conversationId: canPersistConversations ? (conversationId ?? undefined) : undefined,
        message: messageText,
        images: imageFiles
      })
      const answer = response.data.answer?.trim()

      if (canPersistConversations) {
        setActiveConversationId(response.data.conversationId)
      }

      if (!answer) {
        setRetryRequest({
          conversationId: canPersistConversations ? (response.data.conversationId ?? conversationId) : null,
          imageFiles,
          imagePreviews,
          messageText
        })
        setErrorMessage(t('chatModal.errors.emptyAnswer'))
        return
      }

      setMessages((currentMessages) => [
        ...currentMessages,
        {
          conversationMessageId: `assistant-${Date.now()}`,
          role: 'ASSISTANT',
          content: answer,
          mediaFiles: response.data.mediaFiles,
          createdAt: new Date().toISOString()
        }
      ])
      if (canPersistConversations) {
        void loadConversations()
      }
    } catch (error) {
      setRetryRequest({
        conversationId: canPersistConversations ? conversationId : null,
        imageFiles,
        imagePreviews,
        messageText
      })
      setErrorMessage(extractErrorMessage(error) ?? t('chatModal.errors.send'))
    } finally {
      setIsSending(false)
    }
  }

  if (!isOpen) return null

  return (
    <div
      role='dialog'
      aria-modal='false'
      aria-label={t('chatModal.title')}
      className={cn(
        'fixed z-50 flex overflow-hidden rounded-xl border border-border bg-card shadow-2xl',
        isFullscreen
          ? 'inset-2 h-auto md:inset-4'
          : 'inset-x-3 bottom-20 h-[min(82vh,680px)] md:inset-x-auto md:bottom-8 md:right-8 md:w-[min(960px,calc(100vw-4rem))]'
      )}
    >
      <aside
        className={cn(
          'flex shrink-0 flex-col border-r border-border bg-muted/40 transition-all',
          isSidebarOpen ? 'w-72' : 'w-0 overflow-hidden border-r-0'
        )}
      >
        <div className='flex items-center justify-between gap-2 border-b border-border px-3 py-3'>
          <div className='min-w-0'>
            <p className='truncate text-sm font-bold text-card-foreground'>{t('chatModal.sidebarTitle')}</p>
            <p className='truncate text-xs text-muted-foreground'>
              {canPersistConversations ? t('chatModal.sidebarSubtitle') : t('chatModal.temporarySidebarSubtitle')}
            </p>
          </div>
          <Button type='button' size='icon' variant='outline' onClick={handleNewConversation}>
            <MaterialIcon name='add' className='text-lg' />
          </Button>
        </div>

        <div className='min-h-0 flex-1 overflow-y-auto p-2'>
          {!canPersistConversations && !isAuthLoading ? (
            <div className='rounded-lg border border-dashed border-border bg-background p-4 text-sm text-muted-foreground'>
              <MaterialIcon name='lock_clock' className='mb-2 text-2xl text-primary' />
              <p className='font-bold text-card-foreground'>{t('chatModal.temporaryTitle')}</p>
              <p className='mt-1 leading-5'>{t('chatModal.temporaryDescription')}</p>
            </div>
          ) : isLoadingConversations ? (
            <div className='grid gap-2'>
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className='h-14 animate-pulse rounded-lg bg-muted' />
              ))}
            </div>
          ) : visibleConversations.length > 0 ? (
            <div className='grid gap-1'>
              {visibleConversations.map((conversation) => (
                <ConversationItem
                  key={conversation.conversationId}
                  conversation={conversation}
                  isActive={conversation.conversationId === activeConversationId}
                  isMenuOpen={conversation.conversationId === openMenuConversationId}
                  locale={locale}
                  onHide={() => handleHideConversation(conversation.conversationId)}
                  onMenuToggle={() =>
                    setOpenMenuConversationId((currentId) =>
                      currentId === conversation.conversationId ? null : conversation.conversationId
                    )
                  }
                  onSelect={() => void loadConversationDetail(conversation.conversationId)}
                />
              ))}
            </div>
          ) : (
            <div className='rounded-lg border border-dashed border-border bg-background p-4 text-sm text-muted-foreground'>
              {t('chatModal.emptyConversations')}
            </div>
          )}
        </div>
      </aside>

      <section className='flex min-w-0 flex-1 flex-col'>
        <header className='flex shrink-0 items-center justify-between gap-3 border-b border-border bg-card px-4 py-3'>
          <div className='flex min-w-0 items-center gap-3'>
            <Button
              type='button'
              variant='ghost'
              size='icon'
              aria-label={isSidebarOpen ? t('chatModal.hideSidebar') : t('chatModal.showSidebar')}
              onClick={() => setIsSidebarOpen((open) => !open)}
            >
              <MaterialIcon name={isSidebarOpen ? 'left_panel_close' : 'left_panel_open'} className='text-lg' />
            </Button>
            <ChatbotLogo />
            <div className='min-w-0'>
              <h3 className='truncate font-display text-base font-bold text-foreground'>{t('chatModal.title')}</h3>
              <p className='truncate text-xs text-muted-foreground'>{t('chatModal.subtitle')}</p>
            </div>
          </div>
          <div className='flex shrink-0 items-center gap-2'>
            <button
              type='button'
              onClick={() => setIsFullscreen((currentValue) => !currentValue)}
              aria-label={isFullscreen ? t('chatModal.exitFullscreen') : t('chatModal.fullscreen')}
              className='flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
            >
              <MaterialIcon name={isFullscreen ? 'close_fullscreen' : 'open_in_full'} className='text-[18px]' />
            </button>
            <button
              type='button'
              onClick={onClose}
              aria-label={t('chatModal.close')}
              className='flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
            >
              <MaterialIcon name='close' className='text-[18px]' />
            </button>
          </div>
        </header>

        <div ref={messageListRef} className='min-h-0 flex-1 space-y-4 overflow-y-auto bg-muted/20 p-4'>
          {messages.length > 0 ? (
            messages.map((message) => <ChatMessageBubble key={message.conversationMessageId} message={message} />)
          ) : (
            <div className='mx-auto flex h-full max-w-xl flex-col items-center justify-center text-center'>
              <ChatbotLogo />
              <h2 className='mt-4 font-display text-2xl font-bold text-card-foreground'>{t('chatModal.emptyTitle')}</h2>
              <p className='mt-2 text-sm leading-6 text-muted-foreground'>
                {canPersistConversations ? t('chatModal.emptyDescription') : t('chatModal.temporaryEmptyDescription')}
              </p>
            </div>
          )}

          {isLoadingDetail ? (
            <div className='mx-auto w-fit rounded-full border border-border bg-card px-4 py-2 text-sm text-muted-foreground shadow-sm'>
              {t('chatModal.loadingDetail')}
            </div>
          ) : null}

          {isSending ? (
            <div className='max-w-[86%] rounded-xl border border-border bg-card px-3 py-2 text-sm text-muted-foreground shadow-sm'>
              {t('chatModal.thinking')}
            </div>
          ) : null}
        </div>

        {errorMessage ? (
          <div className='flex flex-col gap-2 border-t border-border bg-destructive/10 px-4 py-2 text-sm font-semibold text-destructive sm:flex-row sm:items-center sm:justify-between'>
            <span>{errorMessage}</span>
            {retryRequest ? (
              <Button
                type='button'
                size='sm'
                variant='outline'
                className='border-destructive/30 bg-background text-destructive hover:bg-destructive/10'
                disabled={isSending}
                onClick={() => void handleSendMessage(retryRequest)}
              >
                <MaterialIcon name='refresh' className='text-lg' />
                {t('chatModal.retry')}
              </Button>
            ) : null}
          </div>
        ) : null}

        <footer className='shrink-0 border-t border-border bg-card p-3'>
          {selectedImages.length > 0 ? (
            <div className='mb-3 flex flex-wrap gap-2'>
              {selectedImages.map((image) => (
                <div
                  key={image.previewUrl}
                  className='relative h-16 w-16 overflow-hidden rounded-lg border border-border'
                >
                  <img
                    src={image.previewUrl}
                    alt={t('chatModal.imagePreviewAlt')}
                    className='h-full w-full object-cover'
                  />
                  <button
                    type='button'
                    aria-label={t('chatModal.removeImage')}
                    className='absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-background text-muted-foreground shadow-sm hover:text-destructive'
                    onClick={() => handleRemoveImage(image.previewUrl)}
                  >
                    <MaterialIcon name='close' className='text-sm' />
                  </button>
                </div>
              ))}
            </div>
          ) : null}

          <div className='rounded-xl border border-border bg-background p-2'>
            <textarea
              value={prompt}
              rows={2}
              placeholder={t('chatModal.placeholder')}
              className='max-h-28 min-h-12 w-full resize-none bg-transparent px-2 py-2 text-sm text-foreground outline-none'
              onChange={(event) => setPrompt(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault()
                  void handleSendMessage()
                }
              }}
            />
            <div className='flex items-center justify-between gap-2 border-t border-border pt-2'>
              <div className='flex items-center gap-2'>
                <input
                  ref={fileInputRef}
                  type='file'
                  accept='image/*'
                  multiple
                  className='hidden'
                  onChange={(event) => handleImageSelect(event.target.files)}
                />
                <Button
                  type='button'
                  size='icon'
                  variant='outline'
                  aria-label={t('chatModal.attachImages')}
                  disabled={selectedImages.length >= MAX_IMAGES}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <MaterialIcon name='add_photo_alternate' className='text-lg' />
                </Button>
                <span className='text-xs font-semibold text-muted-foreground'>
                  {t('chatModal.imageLimit', { count: selectedImages.length, max: MAX_IMAGES })}
                </span>
              </div>
              <Button type='button' disabled={!hasDraft || isSending} onClick={() => void handleSendMessage()}>
                <MaterialIcon name='send' className='text-lg' />
                {t('chatModal.send')}
              </Button>
            </div>
          </div>
        </footer>
      </section>
    </div>
  )
}

interface ConversationItemProps {
  conversation: ChatbotConversationSummary
  isActive: boolean
  isMenuOpen: boolean
  locale: string
  onHide: () => void
  onMenuToggle: () => void
  onSelect: () => void
}

function ConversationItem({
  conversation,
  isActive,
  isMenuOpen,
  locale,
  onHide,
  onMenuToggle,
  onSelect
}: ConversationItemProps) {
  const { t } = useTranslation('landing')
  const updatedAt = conversation.updatedAt
    ? new Intl.DateTimeFormat(locale, { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }).format(
        new Date(conversation.updatedAt)
      )
    : ''

  return (
    <div className='relative'>
      <button
        type='button'
        className={cn(
          'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left transition-colors',
          isActive ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-muted'
        )}
        onClick={onSelect}
      >
        <MaterialIcon name='forum' className='shrink-0 text-lg' />
        <span className='min-w-0 flex-1'>
          <span className='block truncate text-sm font-semibold'>
            {conversation.title || t('chatModal.untitledConversation')}
          </span>
          {updatedAt ? <span className='block truncate text-xs opacity-75'>{updatedAt}</span> : null}
        </span>
      </button>
      <button
        type='button'
        aria-label={t('chatModal.moreActions')}
        className={cn(
          'absolute right-1 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg transition-colors',
          isActive ? 'text-primary-foreground hover:bg-primary-foreground/15' : 'text-muted-foreground hover:bg-muted'
        )}
        onClick={(event) => {
          event.stopPropagation()
          onMenuToggle()
        }}
      >
        <MaterialIcon name='more_horiz' className='text-lg' />
      </button>
      {isMenuOpen ? (
        <div className='absolute right-2 top-10 z-10 w-40 rounded-lg border border-border bg-card p-1 shadow-lg'>
          <button
            type='button'
            className='flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-semibold text-destructive hover:bg-destructive/10'
            onClick={onHide}
          >
            <MaterialIcon name='delete' className='text-lg' />
            {t('chatModal.hideConversation')}
          </button>
        </div>
      ) : null}
    </div>
  )
}

function ChatMessageBubble({ message }: { message: UiChatMessage }) {
  const isUser = message.role === 'USER'

  return (
    <article className={cn('flex', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[86%] rounded-xl px-3 py-2 text-sm leading-6 shadow-sm',
          isUser
            ? 'rounded-tr-sm bg-primary text-primary-foreground'
            : 'rounded-tl-sm border border-border bg-card text-card-foreground'
        )}
      >
        {message.localImages?.length ? (
          <ImageGrid urls={message.localImages} />
        ) : message.mediaFiles?.length ? (
          <ImageGrid urls={message.mediaFiles.map((file) => file.fileUrl).filter(Boolean)} />
        ) : null}
        {message.content ? (
          isUser ? (
            <p className='whitespace-pre-wrap'>{message.content}</p>
          ) : (
            <FormattedAssistantMessage content={message.content} />
          )
        ) : null}
      </div>
    </article>
  )
}

function getAssistantHeadingIcon(text: string) {
  const normalizedText = text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()

  if (normalizedText.includes('canh bao') || normalizedText.includes('warning')) return 'warning'
  if (normalizedText.includes('khuyen') || normalizedText.includes('recommend')) return 'task_alt'
  if (normalizedText.includes('nguyen nhan') || normalizedText.includes('cause')) return 'psychology_alt'
  if (normalizedText.includes('quan sat') || normalizedText.includes('observation')) return 'visibility'

  return 'auto_awesome'
}

function parseBoldSegments(text: string) {
  const segments: Array<{ isBold: boolean; text: string }> = []
  let currentIndex = 0
  let isBold = false
  let buffer = ''

  while (currentIndex < text.length) {
    if (text.startsWith('**', currentIndex)) {
      if (buffer) {
        segments.push({ isBold, text: buffer })
        buffer = ''
      }

      isBold = !isBold
      currentIndex += 2
      continue
    }

    buffer += text[currentIndex] ?? ''
    currentIndex += 1
  }

  if (buffer) {
    segments.push({ isBold, text: buffer })
  }

  return segments.filter((segment) => segment.text.length > 0)
}

function RichText({ text }: { text: string }) {
  return (
    <>
      {parseBoldSegments(text).map((segment, index) =>
        segment.isBold ? (
          <strong key={`${segment.text}-${index}`} className='font-bold text-card-foreground'>
            {segment.text}
          </strong>
        ) : (
          <span key={`${segment.text}-${index}`}>{segment.text}</span>
        )
      )}
    </>
  )
}

function FormattedAssistantMessage({ content }: { content: string }) {
  const lines = content.split(/\r?\n/)
  const elements: ReactNode[] = []
  let bulletItems: string[] = []

  function flushBulletItems() {
    if (bulletItems.length === 0) return

    const items = bulletItems
    const elementIndex = elements.length
    bulletItems = []

    elements.push(
      <ul key={`list-${elementIndex}`} className='my-3 space-y-2'>
        {items.map((item, index) => (
          <li key={`${item}-${index}`} className='flex gap-2 rounded-lg bg-muted/50 px-3 py-2 text-sm leading-6'>
            <MaterialIcon name='check_circle' className='mt-0.5 shrink-0 text-[18px] text-primary' />
            <span className='min-w-0'>
              <RichText text={item} />
            </span>
          </li>
        ))}
      </ul>
    )
  }

  lines.forEach((line, lineIndex) => {
    const trimmedLine = line.trim()

    if (!trimmedLine) {
      flushBulletItems()
      return
    }

    const bulletMatch = /^\s*[-*]\s+(.*)$/.exec(line)

    if (bulletMatch) {
      bulletItems.push(bulletMatch[1]?.trim() ?? '')
      return
    }

    flushBulletItems()

    const headingMatch = /^\*\*(.+?)\*\*:?\s*$/.exec(trimmedLine)

    if (headingMatch) {
      const headingText = headingMatch[1] ?? ''
      const isWarning = getAssistantHeadingIcon(headingText) === 'warning'

      elements.push(
        <div
          key={`heading-${lineIndex}`}
          className={cn(
            'mt-4 flex items-start gap-2 rounded-lg border px-3 py-2',
            isWarning
              ? 'border-warning/30 bg-warning/10 text-warning'
              : 'border-border bg-muted/60 text-card-foreground'
          )}
        >
          <MaterialIcon name={getAssistantHeadingIcon(headingText)} className='mt-0.5 shrink-0 text-[20px]' />
          <h4 className='font-display text-sm font-bold leading-6'>{headingText}</h4>
        </div>
      )
      return
    }

    elements.push(
      <p key={`paragraph-${lineIndex}`} className='my-2 text-sm leading-6 text-card-foreground'>
        <RichText text={trimmedLine} />
      </p>
    )
  })

  flushBulletItems()

  return <div className='space-y-1'>{elements}</div>
}

function ImageGrid({ urls }: { urls: string[] }) {
  if (urls.length === 0) return null

  return (
    <div className='mb-2 grid grid-cols-3 gap-2'>
      {urls.slice(0, MAX_IMAGES).map((url) => (
        <img key={url} src={url} alt='' className='h-20 w-full rounded-lg object-cover' />
      ))}
    </div>
  )
}
