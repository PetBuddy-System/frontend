import { useTranslation } from 'react-i18next'
import type { StoreLocationResponse } from '~/shared/lib/store-location'

export interface StoreLocationHistoryProps {
  historyLocations: StoreLocationResponse[]
}

export function StoreLocationHistory({ historyLocations }: StoreLocationHistoryProps) {
  const { t } = useTranslation('manager')

  function formatDate(dateStr: string) {
    if (!dateStr) return '—'
    const normalized = dateStr.includes('Z') || dateStr.includes('+') ? dateStr : dateStr + 'Z'
    const d = new Date(normalized)
    if (isNaN(d.getTime())) return dateStr
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1)
      .toString()
      .padStart(2, '0')}/${d.getFullYear()} ${d.getHours().toString().padStart(2, '0')}:${d
      .getMinutes()
      .toString()
      .padStart(2, '0')}`
  }

  return (
    <div className='rounded-2xl border border-border bg-card shadow-sm overflow-hidden'>
      <div className='px-6 py-4 border-b border-border bg-muted/10'>
        <h2 className='font-display text-lg font-bold text-foreground'>
          {t('storeLocations.history', 'Lịch sử cấu hình')}
        </h2>
      </div>
      <div className='overflow-x-auto'>
        <table className='w-full text-left text-sm border-collapse'>
          <thead>
            <tr className='border-b border-border bg-muted/5 text-xs font-bold text-muted-foreground uppercase tracking-wider'>
              <th className='px-6 py-3'>{t('storeLocations.address', 'Địa chỉ')}</th>
              <th className='px-6 py-3'>{t('storeLocations.createdAt', 'Thời gian tạo')}</th>
              <th className='px-6 py-3'>{t('storeLocations.status', 'Trạng thái')}</th>
            </tr>
          </thead>
          <tbody className='divide-y divide-border'>
            {historyLocations.length === 0 ? (
              <tr>
                <td colSpan={3} className='px-6 py-10 text-center text-muted-foreground font-medium'>
                  {t('storeLocations.noHistory', 'Không có dữ liệu lịch sử chi nhánh.')}
                </td>
              </tr>
            ) : (
              historyLocations.map((loc) => (
                <tr key={loc.id} className='hover:bg-muted/5 transition-colors'>
                  <td className='px-6 py-4 font-medium text-foreground max-w-md truncate'>
                    {loc.address}
                  </td>
                  <td className='px-6 py-4 text-xs text-muted-foreground'>
                    {formatDate(loc.createdAt)}
                  </td>
                  <td className='px-6 py-4'>
                    {loc.active ? (
                      <span className='inline-flex items-center gap-1.5 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-bold text-green-700 dark:bg-green-950/40 dark:text-green-400'>
                        <span className='h-1.5 w-1.5 rounded-full bg-green-700 dark:bg-green-400' />
                        {t('storeLocations.active', 'Đang hoạt động')}
                      </span>
                    ) : (
                      <span className='inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-bold text-gray-700 dark:bg-gray-800 dark:text-gray-400'>
                        <span className='h-1.5 w-1.5 rounded-full bg-gray-700 dark:bg-gray-400' />
                        {t('storeLocations.inactive', 'Ngừng hoạt động')}
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
