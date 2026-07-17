import { useTranslation } from 'react-i18next'

import { cn } from '~/shared/lib/cn'

import { getStatusBadgeClassName } from './lib/return-labels'

export interface ReturnStatusBadgeProps {
  status: string
  className?: string
}

export function ReturnStatusBadge({ status, className }: ReturnStatusBadgeProps) {
  const { t } = useTranslation('returns')
  return (
    <span
      className={cn(
        'rounded px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider',
        getStatusBadgeClassName(status),
        className
      )}
    >
      {t(`status.${status}`, { defaultValue: status })}
    </span>
  )
}
