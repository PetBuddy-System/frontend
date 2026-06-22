import { useState, useEffect } from 'react'

import { MaterialIcon } from '~/shared/ui'
import { fetchAllVouchersApi } from '~/shared/lib/voucher'
import type { VoucherResponse } from '~/shared/lib/voucher'
import { AdminSidebar } from '../components/layout/admin-sidebar'
import { AdminTopNav } from '../components/layout/admin-top-nav'
import { AdminVoucherTable } from '../components/vouchers/admin-voucher-table'
import { VoucherModal } from '../components/vouchers/voucher-modal'

function formatNumber(value: number) {
  return new Intl.NumberFormat('vi-VN').format(value)
}

export function AdminVouchersPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [activeCount, setActiveCount] = useState(0)
  const [totalUsedCount, setTotalUsedCount] = useState(0)
  const [isStatsLoading, setIsStatsLoading] = useState(true)
  // Key to force-remount table after create
  const [tableKey, setTableKey] = useState(0)

  useEffect(() => {
    async function loadStats() {
      setIsStatsLoading(true)
      try {
        const res = await fetchAllVouchersApi({ size: 200 })
        if (res?.data?.content) {
          const vouchers = res.data.content
          setActiveCount(vouchers.filter((v) => v.status === 'ACTIVE').length)
          setTotalUsedCount(vouchers.reduce((sum, v) => sum + (v.usedCount ?? 0), 0))
        }
      } catch {
        // non-blocking
      } finally {
        setIsStatsLoading(false)
      }
    }
    void loadStats()
  }, [tableKey])

  function handleCreateSuccess(_voucher: VoucherResponse) {
    setTableKey((k) => k + 1)
    setIsCreateModalOpen(false)
  }

  return (
    <div className='flex h-screen overflow-hidden bg-background text-foreground'>
      <AdminSidebar activeItem='vouchers' />
      <div className='flex min-w-0 flex-1 flex-col overflow-hidden'>
        <AdminTopNav titleKey='voucherManagement.title' subtitleKey='voucherManagement.subtitle' />

        <main className='flex-1 overflow-y-auto p-4 md:p-6'>
          <div className='mx-auto flex max-w-7xl flex-col gap-6'>

            {/* Header + Create button */}
            <section className='flex flex-col gap-4 md:flex-row md:items-end md:justify-between'>
              <div>
                <h1 className='font-display text-2xl font-bold text-primary md:text-3xl'>
                  Thống kê Voucher
                </h1>
                <p className='mt-1 text-sm text-muted-foreground'>
                  Theo dõi hiệu quả sử dụng mã giảm giá theo thời gian.
                </p>
              </div>
              <button
                type='button'
                onClick={() => setIsCreateModalOpen(true)}
                className='inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground shadow-sm transition-all hover:opacity-90 hover:shadow-lg active:scale-95 focus:outline-none focus:ring-2 focus:ring-ring'
              >
                <MaterialIcon name='add_circle' className='text-lg' />
                Tạo voucher mới
              </button>
            </section>

            {/* Stats Cards */}
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
              {/* Active vouchers */}
              <div className='group flex items-center gap-6 rounded-2xl border border-border bg-card p-6 shadow-sm transition hover:border-primary'>
                <div className='flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-primary/10 transition group-hover:scale-110'>
                  <MaterialIcon
                    name='confirmation_number'
                    filled
                    className='text-[32px] text-primary'
                  />
                </div>
                <div>
                  <p className='text-sm font-semibold text-muted-foreground'>
                    Voucher đang hoạt động
                  </p>
                  <div className='flex items-baseline gap-2'>
                    <span className='font-display text-4xl font-bold text-foreground'>
                      {isStatsLoading ? (
                        <span className='inline-block h-9 w-16 animate-pulse rounded bg-muted' />
                      ) : (
                        formatNumber(activeCount)
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Total used */}
              <div className='group flex items-center gap-6 rounded-2xl border border-border bg-card p-6 shadow-sm transition hover:border-secondary'>
                <div className='flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-secondary/10 transition group-hover:scale-110'>
                  <MaterialIcon
                    name='stars'
                    filled
                    className='text-[32px] text-secondary'
                  />
                </div>
                <div>
                  <p className='text-sm font-semibold text-muted-foreground'>
                    Tổng lượt sử dụng
                  </p>
                  <div className='flex items-baseline gap-2'>
                    <span className='font-display text-4xl font-bold text-foreground'>
                      {isStatsLoading ? (
                        <span className='inline-block h-9 w-20 animate-pulse rounded bg-muted' />
                      ) : (
                        formatNumber(totalUsedCount)
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Voucher Table — full width */}
            <AdminVoucherTable key={tableKey} onOpenCreate={() => setIsCreateModalOpen(true)} />

            {/* Promo banner */}
            <div className='flex items-center overflow-hidden rounded-2xl bg-primary px-8 py-6'>
              <div className='flex-1 text-primary-foreground'>
                <h4 className='font-display text-lg font-bold'>
                  Sắp tới: Chiến dịch Mùa Hè Rực Rỡ
                </h4>
                <p className='mt-1 text-sm opacity-80'>
                  Gợi ý tạo các voucher ưu đãi 15% cho dịch vụ cắt tỉa lông trong tháng 6.
                </p>
              </div>
              <button
                type='button'
                onClick={() => setIsCreateModalOpen(true)}
                className='ml-6 shrink-0 rounded-xl bg-primary-foreground px-5 py-2 text-sm font-bold text-primary transition hover:bg-primary-foreground/90'
              >
                Tạo ngay
              </button>
            </div>

          </div>
        </main>
      </div>

      {/* Create modal */}
      <VoucherModal
        isOpen={isCreateModalOpen}
        editingVoucher={null}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />
    </div>
  )
}
