import { MaterialIcon } from '~/shared/ui'
import { cn } from '~/shared/lib/cn'

interface StarRatingProps {
  rating: number
  size?: 'sm' | 'md'
}

export function StarRating({ rating, size = 'md' }: StarRatingProps) {
  const iconSize = size === 'sm' ? 'text-[15px]' : 'text-xl'
  return (
    <div className='flex gap-0.5'>
      {Array.from({ length: 5 }).map((_, idx) => (
        <MaterialIcon
          key={idx}
          name='star'
          filled={idx < rating}
          className={cn(iconSize, idx < rating ? 'text-secondary' : 'text-muted-foreground/25')}
        />
      ))}
    </div>
  )
}
