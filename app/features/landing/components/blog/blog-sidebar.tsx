import { useTranslation } from 'react-i18next'

import { cn } from '~/shared/lib/cn'
import { MaterialIcon } from '~/shared/ui'

const CATEGORIES = [
  { key: 'all', icon: 'article' },
  { key: 'featured', icon: 'star' },
  { key: 'nutrition', icon: 'restaurant' },
  { key: 'health', icon: 'favorite' },
  { key: 'grooming', icon: 'content_cut' },
  { key: 'training', icon: 'psychology' },
  { key: 'lifestyle', icon: 'pets' }
] as const

export type BlogCategory = (typeof CATEGORIES)[number]['key']

export interface BlogSidebarProps {
  selectedCategory: BlogCategory
  onSelectCategory: (category: BlogCategory) => void
}

export function BlogSidebar({ selectedCategory, onSelectCategory }: BlogSidebarProps) {
  const { t } = useTranslation('blog')

  return (
    <aside className='w-full shrink-0 md:w-64'>
      <div className='sticky top-[88px] rounded-xl border border-border/60 bg-card p-5 shadow-sm'>
        <div className='mb-4 flex items-center gap-2 border-b border-border/60 pb-4'>
          <MaterialIcon name='category' className='text-[20px] text-primary' />
          <h2 className='font-display text-base font-semibold text-foreground'>{t('sidebar.title')}</h2>
        </div>

        <nav className='flex flex-col gap-1'>
          {CATEGORIES.map((category) => (
            <button
              key={category.key}
              type='button'
              onClick={() => onSelectCategory(category.key)}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors',
                selectedCategory === category.key
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <MaterialIcon
                name={
                  category.icon as
                    | 'article'
                    | 'star'
                    | 'restaurant'
                    | 'favorite'
                    | 'content_cut'
                    | 'psychology'
                    | 'pets'
                }
                className='shrink-0 text-[18px]'
              />
              {t(`sidebar.${category.key}`)}
            </button>
          ))}
        </nav>
      </div>
    </aside>
  )
}
