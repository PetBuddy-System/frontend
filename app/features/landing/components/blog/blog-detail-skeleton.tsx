import { SiteBottomNav, SiteFab, SiteFooter, SiteHeader } from '~/shared/components'

export function BlogDetailSkeleton() {
  return (
    <div className='flex min-h-screen flex-col bg-background text-foreground animate-pulse'>
      <SiteHeader activeItem='blog' />
      <main className='flex-1 pb-24 md:pb-0'>
        {/* Breadcrumb skeleton */}
        <div className='mx-auto max-w-4xl px-4 pt-8 md:px-6'>
          <div className='h-4 w-32 rounded bg-muted' />
        </div>

        {/* Article Header skeleton */}
        <header className='mx-auto max-w-4xl px-4 pb-8 md:px-6'>
          <div className='mt-6 h-10 w-3/4 rounded bg-muted md:h-12' />
          <div className='mt-6 flex flex-wrap items-center gap-6'>
            <div className='flex items-center gap-4 rounded-2xl border border-border/60 bg-card p-5 shadow-sm'>
              <div className='h-12 w-12 rounded-full bg-muted' />
              <div className='space-y-2'>
                <div className='h-4 w-24 rounded bg-muted' />
                <div className='h-3 w-16 rounded bg-muted' />
              </div>
            </div>
            <div className='space-y-2'>
              <div className='h-3 w-32 rounded bg-muted' />
              <div className='h-3 w-24 rounded bg-muted' />
            </div>
          </div>
        </header>

        {/* Banner image skeleton */}
        <div className='mx-auto max-w-5xl px-4 md:px-6'>
          <div className='aspect-[21/9] rounded-2xl bg-muted' />
        </div>

        {/* Content skeleton */}
        <div className='mx-auto mt-12 max-w-4xl px-4 md:px-6 space-y-4'>
          <div className='h-4 w-full rounded bg-muted' />
          <div className='h-4 w-5/6 rounded bg-muted' />
          <div className='h-4 w-4/5 rounded bg-muted' />
          <div className='h-4 w-full rounded bg-muted' />
          <div className='h-4 w-3/4 rounded bg-muted' />
        </div>
      </main>
      <SiteFooter />
      <SiteBottomNav />
      <SiteFab />
    </div>
  )
}
