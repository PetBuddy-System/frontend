import { useTranslation } from 'react-i18next'
import { MaterialIcon } from '~/shared/ui'

const TASK_ITEMS = ['shiftSwap', 'cancellationApproval', 'restock'] as const

export function ManagerDashboardTasks() {
  const { t } = useTranslation('manager')

  return (
    <article className='flex flex-col rounded-xl border border-border/70 bg-card p-6 shadow-sm'>
      <h2 className='font-display text-2xl font-bold text-primary'>{t('managerDashboard.tasks.title')}</h2>
      <div className='mt-6 space-y-4'>
        {TASK_ITEMS.map((taskKey, index) => (
          <button
            key={taskKey}
            type='button'
            className={
              index === 2
                ? 'flex w-full items-start gap-4 rounded-xl border-l-2 border-l-primary bg-muted px-4 py-4 text-left transition-colors hover:bg-muted/80'
                : 'flex w-full items-start gap-4 rounded-xl bg-muted px-4 py-4 text-left transition-colors hover:bg-muted/80'
            }
          >
            <span
              className={
                taskKey === 'shiftSwap'
                  ? 'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary/20 text-secondary-foreground'
                  : taskKey === 'cancellationApproval'
                    ? 'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive'
                    : 'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary'
              }
            >
              <MaterialIcon
                name={
                  taskKey === 'shiftSwap'
                    ? 'swap_horiz'
                    : taskKey === 'cancellationApproval'
                      ? 'cancel'
                      : 'inventory_2'
                }
              />
            </span>
            <span className='flex-1'>
              <span className='block text-sm font-bold text-foreground'>
                {t(`managerDashboard.tasks.items.${taskKey}.title`)}
              </span>
              <span className='mt-1 block text-sm text-muted-foreground'>
                {t(`managerDashboard.tasks.items.${taskKey}.subtitle`)}
              </span>
            </span>
          </button>
        ))}
      </div>
      <button
        type='button'
        className='mt-6 inline-flex w-full items-center justify-center rounded-full bg-muted px-5 py-3 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground'
      >
        {t('managerDashboard.tasks.viewAll')}
      </button>
    </article>
  )
}
