import { useState, useEffect, useCallback } from 'react'

import { cn } from '~/shared/lib/cn'
import { MaterialIcon } from '~/shared/ui'
import {
  fetchAllVouchersApi,
  updateVoucherApi,
  type VoucherResponse,
} from '~/shared/lib/voucher'
import { VoucherModal } from './voucher-modal'

const PAGE_SIZE = 10

function formatPrice(value: number) {
  return `${new Intl.NumberFormat('vi-VN').format(value)}đ`
}

function formatDate(dateString: string) {
  if (!dateString) return '—'
  try {
    return new Date(dateString).toLocaleDateString('vi-VN')
  } catch {
    return dateString
  }
}

function getDiscountLabel(voucher: VoucherResponse) {
  if (voucher.discountType === 'PERCENTAGE') {
    const base = `${voucher.discountValue}%`
    return voucher.maxDiscount ? `${base} / Tối đa ${formatPrice(voucher.maxDiscount)}` : base
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
  if (status === 'ACTIVE') return 'Hoạt động'
  if (status === 'EXPIRED') return 'Hết hạn'
  return 'Tạm dừng'
}

export interface AdminVoucherTableProps {
  onOpenCreate: () => void
}

export function AdminVoucherTable({ onOpenCreate }: AdminVoucherTableProps) {
  const [vouchers, setVouchers] = useState<VoucherResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [totalElements, setTotalElements] = useState(0)

  const [editingVoucher, setEditingVoucher] = useState<VoucherResponse | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

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
      setError('Không thể tải danh sách voucher.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadVouchers(currentPage)
  }, [currentPage, loadVouchers])

  async function handleToggleStatus(voucher: VoucherResponse) {
    const newStatus = voucher.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
    try {
      await updateVoucherApi(voucher.voucherId, {
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
        status: newStatus,
      })
      setVouchers((prev) =>
        prev.map((v) => (v.voucherId === voucher.voucherId ? { ...v, status: newStatus } : v))
      )
    } catch {
      setError('Không thể cập nhật trạng thái voucher.')
    }
  }

  function handleEdit(voucher: VoucherResponse) {
    setEditingVoucher(voucher)
    setIsModalOpen(true)
  }

  function handleModalSuccess(updatedVoucher: VoucherResponse) {
    if (editingVoucher) {
      setVouchers((prev) =>
        prev.map((v) => (v.voucherId === updatedVoucher.voucherId ? updatedVoucher : v))
      )
    } else {
      // New voucher: reload page
      void loadVouchers(currentPage)
    }
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

  return (
    <>
      <VoucherModal
        isOpen={isModalOpen}
        editingVoucher={editingVoucher}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
      />

      <section className='space-y-4 xl:col-span-2'>
        {/* Header + search */}
        <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
          <h2 className='flex items-center gap-2 font-display text-lg font-bold text-card-foreground'>
            <MaterialIcon name='list_alt' className='text-primary' />
            Danh sách voucher
          </h2>
          <div className='flex items-center gap-2'>
            <div className='relative min-w-0 flex-1 sm:w-64'>
              <MaterialIcon
                name='search'
                className='absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground'
              />
              <input
                type='search'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder='Tìm kiếm mã voucher...'
                className='h-10 w-full rounded-lg border border-border bg-card pl-10 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring'
              />
            </div>
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
                  <th className='px-4 py-3'>MÃ VOUCHER</th>
                  <th className='px-4 py-3'>LOẠI GIẢM GIÁ</th>
                  <th className='px-4 py-3'>HẾT HẠN</th>
                  <th className='px-4 py-3'>TRẠNG THÁI</th>
                  <th className='px-4 py-3 text-right'>THAO TÁC</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-border'>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 5 }).map((__, j) => (
                        <td key={j} className='px-4 py-4'>
                          <div className='h-4 animate-pulse rounded bg-muted' />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : filteredVouchers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className='py-12 text-center text-sm text-muted-foreground'>
                      <MaterialIcon
                        name='confirmation_number'
                        className='mx-auto mb-2 text-[36px] text-muted-foreground/50'
                      />
                      <p>Không tìm thấy voucher nào</p>
                    </td>
                  </tr>
                ) : (
                  filteredVouchers.map((voucher) => {
                    const isActive = voucher.status === 'ACTIVE'
                    const daysLeft = getDaysRemaining(voucher.expiredAt)

                    return (
                      <tr
                        key={voucher.voucherId}
                        className={cn(
                          'transition-colors hover:bg-muted/50',
                          !isActive && 'opacity-60'
                        )}
                      >
                        {/* Code + Name */}
                        <td className='px-4 py-4'>
                          <p
                            className={cn(
                              'font-bold',
                              isActive ? 'text-primary' : 'text-muted-foreground line-through'
                            )}
                          >
                            {voucher.voucherCode}
                          </p>
                          <p className='text-xs italic text-muted-foreground'>
                            {voucher.voucherName}
                          </p>
                        </td>

                        {/* Discount */}
                        <td className='px-4 py-4'>
                          <p className='text-sm font-semibold text-foreground'>
                            {getDiscountLabel(voucher)}
                          </p>
                          <p className='text-xs text-muted-foreground'>
                            Đơn tối thiểu:{' '}
                            {voucher.minOrderValue ? formatPrice(voucher.minOrderValue) : '0đ'}
                          </p>
                        </td>

                        {/* Expiry */}
                        <td className='px-4 py-4'>
                          <p className='text-sm font-medium text-foreground'>
                            {formatDate(voucher.expiredAt)}
                          </p>
                          {voucher.status === 'EXPIRED' ? (
                            <p className='text-xs font-semibold text-destructive'>Đã hết hạn</p>
                          ) : daysLeft !== null && daysLeft > 0 ? (
                            <p className='text-xs font-semibold text-success'>
                              Còn {daysLeft} ngày
                              {voucher.usageLimit && (
                                <> · {voucher.usedCount}/{voucher.usageLimit} lượt</>
                              )}
                            </p>
                          ) : (
                            <p className='text-xs text-muted-foreground'>
                              {voucher.usageLimit
                                ? `Đã dùng: ${voucher.usedCount}/${voucher.usageLimit}`
                                : 'Vô thời hạn'}
                            </p>
                          )}
                        </td>

                        {/* Status toggle */}
                        <td className='px-4 py-4'>
                          <div className='flex items-center gap-2'>
                            <button
                              type='button'
                              onClick={() => void handleToggleStatus(voucher)}
                              disabled={voucher.status === 'EXPIRED'}
                              aria-pressed={isActive}
                              className={cn(
                                'flex h-6 w-11 rounded-full p-0.5 transition-colors focus:outline-none focus:ring-2 focus:ring-ring',
                                isActive
                                  ? 'justify-end bg-success'
                                  : 'justify-start bg-muted-foreground',
                                voucher.status === 'EXPIRED' && 'cursor-not-allowed opacity-50'
                              )}
                            >
                              <span className='h-5 w-5 rounded-full bg-card shadow-sm transition-transform' />
                            </button>
                            <span
                              className={cn(
                                'text-xs font-semibold',
                                getStatusColor(voucher.status)
                              )}
                            >
                              {getStatusLabel(voucher.status)}
                            </span>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className='px-4 py-4'>
                          <div className='flex justify-end gap-2'>
                            <button
                              type='button'
                              onClick={() => handleEdit(voucher)}
                              aria-label='Sửa voucher'
                              className='flex h-9 w-9 items-center justify-center rounded-lg text-primary transition-colors hover:bg-primary/10'
                            >
                              <MaterialIcon name='edit' className='text-lg' />
                            </button>
                          </div>
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
                ? 'Đang tải...'
                : `Hiển thị ${Math.min(PAGE_SIZE, filteredVouchers.length)} / ${totalElements} voucher`}
            </p>
            <div className='flex items-center gap-2'>
              <button
                type='button'
                onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                disabled={currentPage === 0}
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
                className='flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card transition hover:bg-muted disabled:opacity-40'
              >
                <MaterialIcon name='chevron_right' className='text-[18px]' />
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
