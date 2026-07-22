import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { ManagerSidebar } from '../components/layout/manager-sidebar'
import { ManagerTopNav } from '../components/layout/manager-top-nav'
import { MaterialIcon } from '~/shared/ui'
import { cn } from '~/shared/lib/cn'
import { fetchAllVouchersApi, updateVoucherApi, type VoucherResponse, type VoucherRequest } from '~/shared/lib/voucher'
import { VoucherModal } from '~/shared/components/vouchers/voucher-modal'

const PAGE_SIZE = 10

export function ManagerVouchersPage() {
  const { t, i18n } = useTranslation('manager')

  const [vouchers, setVouchers] = useState<VoucherResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [totalElements, setTotalElements] = useState(0)
  const [editingVoucher, setEditingVoucher] = useState<VoucherResponse | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  function formatPrice(value: number) {
    return `${new Intl.NumberFormat(i18n.language).format(value)}đ`
  }

  function formatDate(dateString: string) {
    if (!dateString) return '—'
    try {
      return new Date(dateString).toLocaleDateString(i18n.language)
    } catch {
      return dateString
    }
  }

  function getDiscountLabel(voucher: VoucherResponse) {
    if (voucher.discountType === 'PERCENTAGE') {
      const base = `${voucher.discountValue}%`
      return voucher.maxDiscount
        ? `${base} / ${t('vouchers.table.maxDiscount', { value: formatPrice(voucher.maxDiscount) })}`
        : base
    }
    return formatPrice(voucher.discountValue)
  }

  function getDaysRemaining(expiredAt: string): number | null {
    try {
      const diff = new Date(expiredAt).getTime() - Date.now()
      return Math.ceil(diff / (1000 * 60 * 60 * 24))
    } catch {
      return null
    }
  }

  function getStatusColor(status: string) {
    if (status === 'ACTIVE') return 'text-success'
    if (status === 'EXPIRED') return 'text-destructive'
    return 'text-muted-foreground'
  }

  function getStatusLabel(status: string) {
    if (status === 'ACTIVE') return t('vouchers.status.active')
    if (status === 'EXPIRED') return t('vouchers.status.expired')
    return t('vouchers.status.paused')
  }

  const loadVouchers = useCallback(async (page: number) => {
    setIsLoading(true)
    setError('')
    try {
      const res = await fetchAllVouchersApi({ page, size: PAGE_SIZE })
      if (res?.data) {
        setVouchers(res.data.content)
        setTotalPages(res.data.totalPages)
        setTotalElements(res.data.totalElements)
      }
    } catch {
      setError(t('vouchers.errors.loadFailed'))
    } finally {
      setIsLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadVouchers(currentPage)
  }, [currentPage, loadVouchers])

  async function handleToggleStatus(voucher: VoucherResponse) {
    const newStatus = voucher.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
    try {
      const payload: VoucherRequest = {
        voucherCode: voucher.voucherCode,
        voucherName: voucher.voucherName,
        discountType: voucher.discountType,
        discountValue: voucher.discountValue,
        maxDiscount: voucher.maxDiscount,
        minOrderValue: voucher.minOrderValue,
        applyScope: voucher.applyScope,
        usageLimit: voucher.usageLimit,
        perUserLimit: voucher.perUserLimit,
        startAt: voucher.startAt,
        expiredAt: voucher.expiredAt,
        status: newStatus
      }
      await updateVoucherApi(voucher.voucherId, payload)
      setVouchers((prev) => prev.map((v) => (v.voucherId === voucher.voucherId ? { ...v, status: newStatus } : v)))
    } catch {
      setError(t('vouchers.errors.updateFailed'))
    }
  }

  function handleEdit(voucher: VoucherResponse) {
    setEditingVoucher(voucher)
    setIsModalOpen(true)
  }

  function handleCreate() {
    setEditingVoucher(null)
    setIsModalOpen(true)
  }

  function handleModalSuccess(updatedVoucher: VoucherResponse) {
    if (editingVoucher) {
      setVouchers((prev) => prev.map((v) => (v.voucherId === updatedVoucher.voucherId ? updatedVoucher : v)))
    } else {
      void loadVouchers(currentPage)
    }
    setIsModalOpen(false)
    setEditingVoucher(null)
  }

  function handleModalClose() {
    setIsModalOpen(false)
    setEditingVoucher(null)
  }

  const filteredVouchers = vouchers.filter(
    (v) =>
      v.voucherCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.voucherName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const pageNumbers = Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i)

  const activeCount = vouchers.filter((v) => v.status === 'ACTIVE').length
  const totalUsed = vouchers.reduce((sum, v) => sum + (v.usedCount ?? 0), 0)

  return (
    <div className='flex h-screen overflow-hidden bg-background text-foreground'>
      <ManagerSidebar activeItem='vouchers' />
      <div className='flex min-w-0 flex-1 flex-col overflow-hidden'>
        <ManagerTopNav titleKey={t('vouchers.title')} subtitleKey={t('vouchers.subtitle')} />

        <main className='flex-1 overflow-y-auto p-4 md:p-6'>
          <div className='mx-auto flex max-w-7xl flex-col gap-6'>
            {/* Header + Create button */}
            <section className='flex flex-col gap-4 md:flex-row md:items-end md:justify-between'>
              <div>
                <h1 className='font-display text-2xl font-bold text-primary md:text-3xl'>{t('vouchers.title')}</h1>
                <p className='mt-1 text-sm text-muted-foreground'>{t('vouchers.subtitle')}</p>
              </div>
              <button
                type='button'
                onClick={handleCreate}
                className='inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground shadow-sm transition-all hover:opacity-90 hover:shadow-lg active:scale-95 focus:outline-none focus:ring-2 focus:ring-ring'
              >
                <MaterialIcon name='add_circle' className='text-lg' />
                {t('vouchers.actions.create')}
              </button>
            </section>

            {/* Stats */}
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
              <div className='group flex items-center gap-6 rounded-2xl border border-border bg-card p-6 shadow-sm transition hover:border-primary'>
                <div className='flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-primary/10 transition group-hover:scale-110'>
                  <MaterialIcon name='confirmation_number' filled className='text-[32px] text-primary' />
                </div>
                <div>
                  <p className='text-sm font-semibold text-muted-foreground'>{t('vouchers.stats.active')}</p>
                  <p className='font-display text-4xl font-bold text-foreground'>{activeCount}</p>
                </div>
              </div>
              <div className='group flex items-center gap-6 rounded-2xl border border-border bg-card p-6 shadow-sm transition hover:border-primary'>
                <div className='flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-success/10 transition group-hover:scale-110'>
                  <MaterialIcon name='stars' filled className='text-[32px] text-success' />
                </div>
                <div>
                  <p className='text-sm font-semibold text-muted-foreground'>{t('vouchers.stats.totalUsed')}</p>
                  <p className='font-display text-4xl font-bold text-foreground'>{totalUsed}</p>
                </div>
              </div>
            </div>

            {/* Table */}
            <section className='space-y-4'>
              <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
                <h2 className='flex items-center gap-2 font-display text-lg font-bold text-card-foreground'>
                  <MaterialIcon name='list_alt' className='text-primary' />
                  {t('vouchers.list.title')}
                  {totalElements > 0 && (
                    <span className='text-sm font-normal text-muted-foreground'>({totalElements})</span>
                  )}
                </h2>
                <div className='relative min-w-0 flex-1 sm:w-64'>
                  <MaterialIcon
                    name='search'
                    className='absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground'
                  />
                  <input
                    type='search'
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('vouchers.search.placeholder')}
                    className='h-10 w-full rounded-lg border border-border bg-card pl-10 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring'
                  />
                </div>
              </div>

              {error && (
                <div className='flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive'>
                  <MaterialIcon name='error' className='text-[18px]' />
                  {error}
                </div>
              )}

              <div className='overflow-hidden rounded-2xl border border-border bg-card shadow-sm'>
                <div className='overflow-x-auto'>
                  <table className='w-full min-w-[780px] border-collapse text-left'>
                    <thead>
                      <tr className='border-b border-border bg-muted/50 text-xs font-bold uppercase tracking-wide text-muted-foreground'>
                        <th className='px-4 py-3'>{t('vouchers.table.columns.code')}</th>
                        <th className='px-4 py-3'>{t('vouchers.table.columns.discount')}</th>
                        <th className='px-4 py-3'>{t('vouchers.table.columns.expiry')}</th>
                        <th className='px-4 py-3'>{t('vouchers.table.columns.usage')}</th>
                        <th className='px-4 py-3'>{t('vouchers.table.columns.status')}</th>
                        <th className='px-4 py-3 text-right'>{t('vouchers.table.columns.actions')}</th>
                      </tr>
                    </thead>
                    <tbody className='divide-y divide-border'>
                      {isLoading ? (
                        Array.from({ length: 5 }).map((_, i) => (
                          <tr key={i}>
                            {Array.from({ length: 6 }).map((__, j) => (
                              <td key={j} className='px-4 py-4'>
                                <div className='h-4 animate-pulse rounded bg-muted' />
                              </td>
                            ))}
                          </tr>
                        ))
                      ) : filteredVouchers.length === 0 ? (
                        <tr>
                          <td colSpan={6} className='py-12 text-center text-sm text-muted-foreground'>
                            <MaterialIcon
                              name='confirmation_number'
                              className='mx-auto mb-2 text-[36px] text-muted-foreground/50'
                            />
                            <p className='mb-3'>{t('vouchers.empty.title')}</p>
                            <button
                              type='button'
                              onClick={handleCreate}
                              className='inline-flex h-9 items-center justify-center gap-1 rounded-xl bg-primary/10 px-4 text-xs font-bold text-primary transition hover:bg-primary/20'
                            >
                              <MaterialIcon name='add' className='text-sm' />
                              {t('vouchers.empty.create')}
                            </button>
                          </td>
                        </tr>
                      ) : (
                        filteredVouchers.map((voucher) => {
                          const isActive = voucher.status === 'ACTIVE'
                          const daysLeft = getDaysRemaining(voucher.expiredAt)

                          return (
                            <tr
                              key={voucher.voucherId}
                              className={cn('transition-colors hover:bg-muted/50', !isActive && 'opacity-60')}
                            >
                              <td className='px-4 py-4'>
                                <p
                                  className={cn(
                                    'font-bold',
                                    isActive ? 'text-primary' : 'text-muted-foreground line-through'
                                  )}
                                >
                                  {voucher.voucherCode}
                                </p>
                                <p className='text-xs italic text-muted-foreground'>{voucher.voucherName}</p>
                              </td>
                              <td className='px-4 py-4'>
                                <p className='text-sm font-semibold text-foreground'>{getDiscountLabel(voucher)}</p>
                                <p className='text-xs text-muted-foreground'>
                                  {t('vouchers.table.minOrder', {
                                    value: voucher.minOrderValue ? formatPrice(voucher.minOrderValue) : formatPrice(0)
                                  })}
                                </p>
                              </td>
                              <td className='px-4 py-4'>
                                <p className='text-sm font-medium text-foreground'>{formatDate(voucher.expiredAt)}</p>
                                {voucher.status === 'EXPIRED' ? (
                                  <p className='text-xs font-semibold text-destructive'>
                                    {t('vouchers.expiry.expired')}
                                  </p>
                                ) : daysLeft !== null && daysLeft > 0 ? (
                                  <p className='text-xs font-semibold text-success'>
                                    {t('vouchers.expiry.daysLeft', { count: daysLeft })}
                                  </p>
                                ) : (
                                  <p className='text-xs text-muted-foreground'>{t('vouchers.expiry.noExpiry')}</p>
                                )}
                              </td>
                              <td className='px-4 py-4'>
                                <p className='text-sm font-bold text-foreground'>
                                  {voucher.usageLimit
                                    ? t('vouchers.usage.countWithLimit', {
                                        used: voucher.usedCount ?? 0,
                                        limit: voucher.usageLimit
                                      })
                                    : t('vouchers.usage.count', { used: voucher.usedCount ?? 0 })}
                                </p>
                              </td>
                              <td className='px-4 py-4'>
                                <div className='flex items-center gap-2'>
                                  <button
                                    type='button'
                                    onClick={() => void handleToggleStatus(voucher)}
                                    disabled={voucher.status === 'EXPIRED'}
                                    aria-pressed={isActive}
                                    className={cn(
                                      'flex h-6 w-11 rounded-full p-0.5 transition-colors focus:outline-none focus:ring-2 focus:ring-ring',
                                      isActive ? 'justify-end bg-success' : 'justify-start bg-muted-foreground',
                                      voucher.status === 'EXPIRED' && 'cursor-not-allowed opacity-50'
                                    )}
                                  >
                                    <span className='h-5 w-5 rounded-full bg-card shadow-sm' />
                                  </button>
                                  <span className={cn('text-xs font-semibold', getStatusColor(voucher.status))}>
                                    {getStatusLabel(voucher.status)}
                                  </span>
                                </div>
                              </td>
                              <td className='px-4 py-4 text-right'>
                                <button
                                  type='button'
                                  onClick={() => handleEdit(voucher)}
                                  aria-label={t('vouchers.actions.edit')}
                                  className='flex h-9 w-9 items-center justify-center rounded-lg text-primary transition-colors hover:bg-primary/10'
                                >
                                  <MaterialIcon name='edit' className='text-lg' />
                                </button>
                              </td>
                            </tr>
                          )
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className='flex flex-col gap-3 border-t border-border bg-muted/30 px-4 py-3 sm:flex-row sm:items-center sm:justify-between'>
                  <p className='text-sm text-muted-foreground'>
                    {isLoading
                      ? t('vouchers.pagination.loading')
                      : t('vouchers.pagination.showing', { count: filteredVouchers.length, total: totalElements })}
                  </p>
                  <div className='flex items-center gap-2'>
                    <button
                      type='button'
                      onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                      disabled={currentPage === 0}
                      aria-label={t('vouchers.pagination.previous')}
                      className='flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card transition hover:bg-muted disabled:opacity-40'
                    >
                      <MaterialIcon name='chevron_left' className='text-[18px]' />
                    </button>
                    {pageNumbers.map((p) => (
                      <button
                        key={p}
                        type='button'
                        onClick={() => setCurrentPage(p)}
                        className={cn(
                          'h-8 min-w-8 rounded-lg px-3 text-sm font-semibold transition',
                          p === currentPage
                            ? 'bg-primary text-primary-foreground'
                            : 'border border-border bg-card text-muted-foreground hover:text-primary'
                        )}
                      >
                        {p + 1}
                      </button>
                    ))}
                    <button
                      type='button'
                      onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
                      disabled={currentPage >= totalPages - 1}
                      aria-label={t('vouchers.pagination.next')}
                      className='flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card transition hover:bg-muted disabled:opacity-40'
                    >
                      <MaterialIcon name='chevron_right' className='text-[18px]' />
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>

      <VoucherModal
        key={editingVoucher?.voucherId ?? 'new'}
        isOpen={isModalOpen}
        editingVoucher={editingVoucher}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
      />
    </div>
  )
}
