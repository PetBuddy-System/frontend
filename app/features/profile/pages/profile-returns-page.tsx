// app/features/profile/pages/profile-returns.tsx
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { MaterialIcon } from '~/shared/ui'
import { ProfileFloatingSupport } from '../components/layout/profile-floating-support'
import { ProfilePageHeader } from '../components/layout/profile-page-header'
import { ProfileSidebar } from '../components/layout/profile-sidebar'
import { ReturnPolicyInfo } from '../components/returns/return-policy-info'
import { ReturnSupportCard } from '../components/returns/return-support-card'
import { ReturnHistoryList } from '../components/returns/return-history-list'

export function ProfileReturnsPage() {
  const { t } = useTranslation('profile')

  // Ẩn overflow của body khi vào trang
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [])

  return (
    <div className='flex h-screen overflow-hidden bg-background text-foreground'>
      <ProfileSidebar activeItem='returns' />
      <div className='flex min-w-0 flex-1 flex-col'>
        <ProfilePageHeader titleKey='returnWarranty.headerTitle' subtitleKey='returnWarranty.headerSubtitle' />
        <main className='flex-1 overflow-y-auto p-4 md:p-6 pb-8'>
          <div className='mx-auto flex max-w-7xl flex-col gap-6'>
            {/* Breadcrumb */}
            <nav className='flex items-center gap-1 text-xs font-semibold text-muted-foreground'>
              <a href='/' className='hover:text-primary transition-colors'>
                {t('returnWarranty.breadcrumb.dashboard')}
              </a>
              <MaterialIcon name='chevron_right' className='text-sm' />
              <a href='/profile' className='hover:text-primary transition-colors'>
                {t('returnWarranty.breadcrumb.account')}
              </a>
              <MaterialIcon name='chevron_right' className='text-sm' />
              <span className='font-bold text-primary'>{t('returnWarranty.breadcrumb.current')}</span>
            </nav>

            {/* Chỉ giữ lại History List, bỏ tab */}
            <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
              <div className='lg:col-span-2'>
                <ReturnHistoryList />
              </div>
              <div className='space-y-6 lg:col-span-1'>
                <ReturnPolicyInfo />
                <ReturnSupportCard />
              </div>
            </div>
          </div>
        </main>
      </div>
      <ProfileFloatingSupport />
    </div>
  )
}
