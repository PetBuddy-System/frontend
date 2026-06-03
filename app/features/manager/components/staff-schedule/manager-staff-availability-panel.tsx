import { useTranslation } from 'react-i18next'

import { MaterialIcon } from '~/shared/ui'

const STAFF_GROUPS = [
  {
    key: 'grooming',
    members: [
      { key: 'mai', initials: 'MN', status: 'available' },
      { key: 'nam', initials: 'NT', status: 'busy' }
    ]
  },
  {
    key: 'vet',
    members: [{ key: 'son', initials: 'BS', status: 'available' }]
  }
] as const

export function ManagerStaffAvailabilityPanel() {
  const { t } = useTranslation('manager')

  return (
    <aside className='flex w-full flex-col gap-6 lg:w-80'>
      <section className='rounded-xl border border-border bg-card p-5 shadow-sm'>
        <div className='mb-6 flex items-center justify-between'>
          <h2 className='font-display text-base font-bold text-card-foreground'>
            {t('staffSchedule.staffStatus.title')}
          </h2>
          <span className='flex items-center gap-1 text-xs font-bold text-success'>
            <span className='h-1.5 w-1.5 rounded-full bg-success' />
            {t('staffSchedule.staffStatus.online')}
          </span>
        </div>

        <div className='flex flex-col gap-5'>
          {STAFF_GROUPS.map((group) => (
            <div key={group.key}>
              <h3 className='mb-3 text-xs font-bold uppercase tracking-wide text-muted-foreground'>
                {t(`staffSchedule.staffStatus.groups.${group.key}.title`)}
              </h3>
              <div className='space-y-3'>
                {group.members.map((member) => {
                  const isAvailable = member.status === 'available'

                  return (
                    <div key={member.key} className='group flex items-center justify-between'>
                      <div className='flex items-center gap-3'>
                        <div className='relative'>
                          <div className='flex h-10 w-10 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground'>
                            {member.initials}
                          </div>
                          <span
                            className={
                              isAvailable
                                ? 'absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-card bg-success'
                                : 'absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-card bg-secondary'
                            }
                          />
                        </div>
                        <div>
                          <p className='text-sm font-bold text-card-foreground'>
                            {t(`staffSchedule.staffStatus.members.${member.key}.name`)}
                          </p>
                          <p
                            className={
                              isAvailable
                                ? 'text-xs font-semibold text-success'
                                : 'text-xs font-semibold text-secondary-foreground'
                            }
                          >
                            {t(`staffSchedule.staffStatus.members.${member.key}.status`)}
                          </p>
                        </div>
                      </div>
                      <button className='rounded p-1.5 text-primary opacity-0 transition-opacity hover:bg-muted group-hover:opacity-100'>
                        <MaterialIcon name={isAvailable ? 'calendar_add_on' : 'info'} className='text-lg' />
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
          <button className='mt-2 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border text-sm font-semibold text-muted-foreground transition-colors hover:border-primary hover:text-primary'>
            <MaterialIcon name='add' className='text-lg' />
            <span>{t('staffSchedule.staffStatus.viewAll')}</span>
          </button>
        </div>
      </section>

      <section className='rounded-xl border border-secondary bg-secondary/10 p-5'>
        <div className='mb-3 flex items-center gap-2 text-secondary-foreground'>
          <MaterialIcon name='lightbulb' filled className='text-lg' />
          <span className='font-bold'>{t('staffSchedule.quickTip.title')}</span>
        </div>
        <p className='text-sm leading-6 text-secondary-foreground'>{t('staffSchedule.quickTip.description')}</p>
      </section>
    </aside>
  )
}
