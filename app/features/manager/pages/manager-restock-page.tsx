// app/features/manager/pages/manager-restock-page.tsx
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ManagerSidebar } from '../components/layout/manager-sidebar'
import { ManagerTopNav } from '../components/layout/manager-top-nav'
import { MaterialIcon } from '~/shared/ui'
import { RestockList } from '../components/restock/restock-list'
import { RestockDetailDialog } from '../components/restock/restock-detail-dialog'

export function ManagerRestockPage() {
    const { t } = useTranslation('manager')
    const [selectedReturnId, setSelectedReturnId] = useState<number | null>(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isViewOnly, setIsViewOnly] = useState(false) // ✅ Thêm state
    const [refreshKey, setRefreshKey] = useState(0)

    function handleSelectReturn(returnId: number) {
        setSelectedReturnId(returnId)
        setIsViewOnly(false) // ✅ Mở dialog để nhập kho
        setIsDialogOpen(true)
    }

    // ✅ Thêm hàm xem chi tiết (sau khi đã nhập kho)
    function handleViewDetail(returnId: number) {
        setSelectedReturnId(returnId)
        setIsViewOnly(true) // ✅ Mở dialog ở chế độ view-only
        setIsDialogOpen(true)
    }

    function handleCloseDialog() {
        setIsDialogOpen(false)
        setSelectedReturnId(null)
        setIsViewOnly(false)
    }

    function handleSuccess() {
        setIsDialogOpen(false)
        setSelectedReturnId(null)
        setIsViewOnly(false)
        setRefreshKey(prev => prev + 1)
    }

    return (
        <div className='flex h-screen overflow-hidden bg-background text-foreground'>
            <ManagerSidebar activeItem='restock' />
            <div className='flex min-w-0 flex-1 flex-col overflow-hidden'>
                <ManagerTopNav titleKey='restock.title' subtitleKey='restock.subtitle' />
                <main className='flex-1 overflow-y-auto p-4 md:p-6'>
                    <div className='mx-auto flex max-w-7xl flex-col gap-6'>
                        <section className='flex flex-col gap-2 border-b border-border pb-4'>
                            <div className='flex items-center gap-2 text-xs font-semibold text-muted-foreground'>
                                <span>{t('restock.breadcrumb.ops')}</span>
                                <MaterialIcon name='chevron_right' className='text-sm' />
                                <span className='text-primary'>{t('restock.breadcrumb.current')}</span>
                            </div>
                            <h1 className='font-display text-2xl font-bold text-card-foreground md:text-3xl'>
                                {t('restock.title')}
                            </h1>
                            <p className='text-muted-foreground text-sm'>{t('restock.subtitle')}</p>
                        </section>

                        <section className='overflow-hidden rounded-2xl border border-border bg-card shadow-sm'>
                            <RestockList
                                key={refreshKey}
                                onSelectReturn={handleSelectReturn}
                                onViewDetail={handleViewDetail}
                            />
                        </section>
                    </div>
                </main>
            </div>

            {isDialogOpen && selectedReturnId && (
                <RestockDetailDialog
                    returnRequestId={selectedReturnId}
                    onClose={handleCloseDialog}
                    onSuccess={handleSuccess}
                    isViewOnly={isViewOnly}
                />
            )}
        </div>
    )
}