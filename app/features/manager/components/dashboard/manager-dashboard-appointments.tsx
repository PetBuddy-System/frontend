import { useTranslation } from 'react-i18next'
import { MaterialIcon } from '~/shared/ui'

const APPOINTMENT_ROWS = ['nguyenHoang', 'tranVan', 'quocMinh'] as const

export function ManagerDashboardAppointments() {
  const { t } = useTranslation('manager')

  return (
    <section className='overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm'>
      <div className='flex flex-col gap-4 border-b border-border px-6 py-5 sm:flex-row sm:items-center sm:justify-between'>
        <h2 className='font-display text-2xl font-bold text-primary'>
          {t('managerDashboard.appointments.title')}
        </h2>
        <button
          type='button'
          className='inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90'
        >
          <MaterialIcon name='add' className='text-lg' />
          <span>{t('managerDashboard.appointments.create')}</span>
        </button>
      </div>

      <div className='overflow-x-auto'>
        <table className='min-w-full text-left'>
          <thead className='bg-muted/70'>
            <tr>
              <th className='px-6 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground'>
                {t('managerDashboard.appointments.columns.customer')}
              </th>
              <th className='px-6 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground'>
                {t('managerDashboard.appointments.columns.pet')}
              </th>
              <th className='px-6 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground'>
                {t('managerDashboard.appointments.columns.service')}
              </th>
              <th className='px-6 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground'>
                {t('managerDashboard.appointments.columns.status')}
              </th>
              <th className='px-6 py-4 text-right text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground'>
                {t('managerDashboard.appointments.columns.actions')}
              </th>
            </tr>
          </thead>
          <tbody className='divide-y divide-border'>
            {APPOINTMENT_ROWS.map((rowKey) => {
              const statusTone =
                rowKey === 'nguyenHoang'
                  ? 'bg-success/10 text-success'
                  : rowKey === 'tranVan'
                    ? 'bg-secondary/20 text-secondary-foreground'
                    : 'bg-primary/10 text-primary'

              return (
                <tr key={rowKey} className='group transition-colors hover:bg-muted/40'>
                  <td className='px-6 py-5'>
                    <div className='flex items-center gap-3'>
                      <div className='flex h-10 w-10 items-center justify-center rounded-full bg-muted font-semibold text-primary'>
                        {t(`managerDashboard.appointments.rows.${rowKey}.initials`)}
                      </div>
                      <div>
                        <p className='text-sm font-semibold text-foreground'>
                          {t(`managerDashboard.appointments.rows.${rowKey}.customerName`)}
                        </p>
                        <p className='text-sm text-muted-foreground'>
                          {t(`managerDashboard.appointments.rows.${rowKey}.customerPhone`)}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className='px-6 py-5 text-sm text-foreground'>
                    <div className='flex items-center gap-2'>
                      <MaterialIcon name='pets' className='text-lg text-secondary-foreground' />
                      <span>{t(`managerDashboard.appointments.rows.${rowKey}.pet`)}</span>
                    </div>
                  </td>
                  <td className='px-6 py-5 text-sm text-foreground'>
                    {t(`managerDashboard.appointments.rows.${rowKey}.service`)}
                  </td>
                  <td className='px-6 py-5'>
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${statusTone}`}>
                      {t(`managerDashboard.appointments.rows.${rowKey}.status`)}
                    </span>
                  </td>
                  <td className='px-6 py-5'>
                    <div className='flex justify-end gap-2'>
                      <button
                        type='button'
                        className='rounded-full p-2 text-primary transition-colors hover:bg-primary/10'
                        aria-label={t('managerDashboard.appointments.view')}
                      >
                        <MaterialIcon name={rowKey === 'tranVan' ? 'check_circle' : 'visibility'} />
                      </button>
                      <button
                        type='button'
                        className='rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted'
                        aria-label={t('managerDashboard.appointments.more')}
                      >
                        <MaterialIcon name='more_vert' />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}
