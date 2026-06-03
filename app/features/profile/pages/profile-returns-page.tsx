import { useTranslation } from 'react-i18next'

import { MaterialIcon } from '~/shared/ui'
import { useSidebar } from '~/providers/sidebar-provider'
import { cn } from '~/shared/lib/cn'
import { ProfileFloatingSupport } from '../components/layout/profile-floating-support'
import { ProfilePageHeader } from '../components/layout/profile-page-header'
import { ProfileSidebar } from '../components/layout/profile-sidebar'
import { ReturnPolicyInfo } from '../components/returns/return-policy-info'
import { ReturnSupportCard } from '../components/returns/return-support-card'
import { ReturnWarrantyForm } from '../components/returns/return-warranty-form'

export function ProfileReturnsPage() {
  const { t } = useTranslation('profile')
  const { isCollapsed } = useSidebar()

  return (
    <div className='min-h-screen bg-background text-foreground'>
      <ProfileSidebar activeItem='returns' />
      <main
        className={cn(
          'w-full p-4 pb-24 md:p-6 transition-all duration-300',
          isCollapsed ? 'lg:ml-20 lg:w-[calc(100%-5rem)]' : 'lg:ml-64 lg:w-[calc(100%-16rem)]'
        )}
      >
        {/* Breadcrumb */}
        <nav className='mb-4 flex items-center gap-1 text-xs font-semibold text-muted-foreground'>
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

        <ProfilePageHeader titleKey='returnWarranty.headerTitle' subtitleKey='returnWarranty.headerSubtitle' />

        <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
          <div className='lg:col-span-2'>
            <ReturnWarrantyForm />
          </div>
          <div className='space-y-6 lg:col-span-1'>
            <ReturnPolicyInfo />
            <ReturnSupportCard />
          </div>
        </div>
      </main>
      <ProfileFloatingSupport />
    </div>
  )
}
