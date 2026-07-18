import { useTranslation } from 'react-i18next'

import { getMediaUrl } from './lib/return-labels'

export interface ReturnMediaGalleryProps {
  /** Danh sách media — mỗi item có thể là string URL hoặc object { fileUrl, ... } */
  mediaFiles: unknown[]
}

export function ReturnMediaGallery({ mediaFiles }: ReturnMediaGalleryProps) {
  const { t } = useTranslation('returns')

  const validMedia = mediaFiles
    .map((media, idx) => ({ media, idx, url: getMediaUrl(media) }))
    .filter((entry): entry is { media: unknown; idx: number; url: string } => Boolean(entry.url))

  if (validMedia.length === 0) return null

  return (
    <div className='space-y-2'>
      <h5 className='text-xs font-bold uppercase text-muted-foreground tracking-wider'>
        {t('list.detail.media.title')}
      </h5>
      <div className='flex flex-wrap gap-3.5'>
        {validMedia.map(({ media, idx, url }) => (
          <a
            key={(media as { mediaFileId?: number })?.mediaFileId ?? idx}
            href={url}
            target='_blank'
            rel='noopener noreferrer'
            className='relative w-20 h-20 overflow-hidden rounded-lg border border-border shadow-sm hover:opacity-90 transition-opacity'
          >
            <img
              src={url}
              alt={t('list.detail.media.alt', { index: idx + 1 })}
              className='w-full h-full object-cover'
            />
          </a>
        ))}
      </div>
    </div>
  )
}
