import { useTranslation } from 'react-i18next'

import { MaterialIcon } from '~/shared/ui'

const MOCK_PRICING_ROWS = [
  {
    key: 'bath',
    accent: 'bg-primary/10 text-primary',
    prices: { under5: '150,000', fiveTo10: '250,000', tenTo20: '350,000', over20: '450,000' }
  },
  {
    key: 'grooming',
    accent: 'bg-accent text-accent-foreground',
    prices: { under5: '200,000', fiveTo10: '320,000', tenTo20: '450,000', over20: '550,000' }
  },
  {
    key: 'hygiene',
    accent: 'bg-success/10 text-success',
    prices: { under5: '80,000', fiveTo10: '120,000', tenTo20: '180,000', over20: '230,000' }
  }
] as const

// TODO: replace this mock array with API data once the pricing endpoint is ready.

export function ServicesPriceBoard() {
  const { t } = useTranslation('services')

  return (
    <section className='w-full bg-background py-20'>
      <div className='mx-auto max-w-6xl px-4 md:px-6'>
        <div className='mb-8 text-center md:mb-10'>
          <p className='text-sm uppercase tracking-[0.18em] text-primary'>{t('priceBoard.eyebrow')}</p>
          <h2 className='mt-3 font-display text-3xl font-bold text-foreground md:text-4xl'>{t('priceBoard.title')}</h2>
          <p className='mx-auto mt-3 max-w-2xl text-base text-muted-foreground'>{t('priceBoard.subtitle')}</p>
        </div>

        <div className='rounded-3xl border border-border/60 bg-card p-4 shadow-sm md:p-6'>
          <div className='mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-muted/70 p-4'>
            <div>
              <p className='text-sm font-semibold text-foreground'>{t('priceBoard.tableLabel')}</p>
              <p className='text-sm text-muted-foreground'>{t('priceBoard.tableHint')}</p>
            </div>
            <span className='inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary'>
              <MaterialIcon name='payments' className='text-[16px]' />
              {t('priceBoard.badge')}
            </span>
          </div>

          <div className='overflow-x-auto rounded-2xl border border-border/60'>
            <table className='min-w-full border-collapse text-left text-sm text-foreground'>
              <thead className='bg-muted/80 text-xs uppercase tracking-[0.18em] text-muted-foreground'>
                <tr>
                  <th className='px-4 py-3 md:px-5'>{t('priceBoard.columns.service')}</th>
                  <th className='px-4 py-3 md:px-5'>{t('priceBoard.columns.info')}</th>
                  <th className='px-4 py-3 md:px-5'>{t('priceBoard.columns.under5')}</th>
                  <th className='px-4 py-3 md:px-5'>{t('priceBoard.columns.fiveTo10')}</th>
                  <th className='px-4 py-3 md:px-5'>{t('priceBoard.columns.tenTo20')}</th>
                  <th className='px-4 py-3 md:px-5'>{t('priceBoard.columns.over20')}</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_PRICING_ROWS.map((row) => (
                  <tr key={row.key} className='border-t border-border/60 align-top'>
                    <td className='px-4 py-4 md:px-5'>
                      <div className='flex items-start gap-3'>
                        <span
                          className={`mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-xl ${row.accent}`}
                        >
                          <MaterialIcon
                            name={
                              row.key === 'bath' ? 'spa' : row.key === 'grooming' ? 'content_cut' : 'cleaning_services'
                            }
                            className='text-[18px]'
                          />
                        </span>
                        <div>
                          <p className='font-semibold text-foreground'>{t(`individual.items.${row.key}.title`)}</p>
                          <p className='mt-1 text-xs text-muted-foreground'>{t(`individual.items.${row.key}.price`)}</p>
                        </div>
                      </div>
                    </td>
                    <td className='px-4 py-4 text-muted-foreground md:px-5'>
                      {t(`individual.items.${row.key}.description`)}
                    </td>
                    <td className='px-4 py-4 font-semibold text-foreground md:px-5'>{row.prices.under5}</td>
                    <td className='px-4 py-4 font-semibold text-foreground md:px-5'>{row.prices.fiveTo10}</td>
                    <td className='px-4 py-4 font-semibold text-foreground md:px-5'>{row.prices.tenTo20}</td>
                    <td className='px-4 py-4 font-semibold text-primary md:px-5'>{row.prices.over20}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className='mt-4 flex items-start gap-3 rounded-2xl bg-muted/70 p-4 text-sm text-muted-foreground'>
            <MaterialIcon name='info' className='mt-0.5 text-[18px] text-primary' />
            <p>{t('priceBoard.note')}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
