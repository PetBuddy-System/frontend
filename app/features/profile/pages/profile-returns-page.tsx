import { useTranslation } from 'react-i18next'

import { MaterialIcon } from '~/shared/ui'
import { ProfileFloatingSupport } from '../components/layout/profile-floating-support'
import { ProfilePageHeader } from '../components/layout/profile-page-header'
import { ProfileSidebar } from '../components/layout/profile-sidebar'
import { ReturnPolicyInfo } from '../components/returns/return-policy-info'
import { ReturnSupportCard } from '../components/returns/return-support-card'
import { ReturnWarrantyForm } from '../components/returns/return-warranty-form'

export function ProfileReturnsPage() {
  const { t } = useTranslation('profile')

  return (
    <div className='flex h-screen overflow-hidden bg-background text-foreground'>
      <ProfileSidebar activeItem='returns' />
      <div className='flex min-w-0 flex-1 flex-col overflow-hidden'>
        <ProfilePageHeader titleKey='returnWarranty.headerTitle' subtitleKey='returnWarranty.headerSubtitle' />
        <main className='flex-1 overflow-y-auto p-4 md:p-6 pb-24'>
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

            <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
              <div className='lg:col-span-2'>
                <ReturnWarrantyForm />
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
