import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router'

import { ManagerSidebar } from '../components/layout/manager-sidebar'
import { ManagerTopNav } from '../components/layout/manager-top-nav'
import { ManagerWorkScheduleWorkspace } from '../components/staff-schedule/manager-work-schedule-workspace'

function getSuccessMessage(state: unknown) {
  if (!state || typeof state !== 'object' || !('successMessage' in state)) return null

  const { successMessage } = state

  return typeof successMessage === 'string' ? successMessage : null
}

export function ManagerStaffSchedulePage() {
  const { t } = useTranslation('manager')
  const location = useLocation()
  const successMessage = getSuccessMessage(location.state)

  return (
    <div className='flex h-screen overflow-hidden bg-background text-foreground'>
      <ManagerSidebar activeItem='staff' />
      <div className='flex min-w-0 flex-1 flex-col overflow-hidden'>
        <ManagerTopNav titleKey='staffSchedule.title' subtitleKey='staffSchedule.subtitle' />
        <main className='flex-1 overflow-y-auto p-4 md:p-6'>
          <div className='mx-auto flex max-w-7xl flex-col gap-6'>
            <section className='flex flex-col gap-4 border-b border-border pb-6 md:flex-row md:items-center md:justify-between'>
              <div>
                <h1 className='font-display text-2xl font-bold text-card-foreground md:text-3xl'>
                  {t('staffSchedule.title')}
                </h1>
                <p className='mt-2 text-muted-foreground'>{t('staffSchedule.subtitle')}</p>
              </div>
            </section>

            {successMessage && (
              <div className='rounded-xl border border-success/30 bg-success/10 px-4 py-3 text-sm font-medium text-success'>
                {successMessage}
              </div>
            )}

            <ManagerWorkScheduleWorkspace />
          </div>
        </main>
      </div>
    </div>
  )
}
