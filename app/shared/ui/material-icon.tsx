import { cn } from '~/shared/lib/cn'

export interface MaterialIconProps {
  name: string
  className?: string
  filled?: boolean
}

export function MaterialIcon({ name, className, filled }: MaterialIconProps) {
  return (
    <span className={cn('material-symbols-outlined', filled && 'fill', className)} aria-hidden>
      {name}
    </span>
  )
}
