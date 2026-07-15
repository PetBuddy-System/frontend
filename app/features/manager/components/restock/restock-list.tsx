// app/features/manager/components/restock/restock-list.tsx
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { MaterialIcon } from '~/shared/ui'
import { cn } from '~/shared/lib/cn'
import { restockApi, type RestockReturnResponse } from '../../services/restock/restock-api'

interface RestockListProps {
    onSelectReturn: (returnId: number) => void
    onViewDetail?: (returnId: number) => void
}

function formatDate(dateString: string) {
    if (!dateString) return ''
    const d = new Date(dateString)
    if (isNaN(d.getTime())) return dateString
    const dd = String(d.getDate()).padStart(2, '0')
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const yyyy = d.getFullYear()
    const hh = String(d.getHours()).padStart(2, '0')
    const min = String(d.getMinutes()).padStart(2, '0')
    return `${hh}:${min} ${dd}/${mm}/${yyyy}`
}

function getStatusBadgeClassName(status: string) {
    switch (status) {
        case 'PENDING':
            return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
        case 'APPROVED':
            return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
        case 'PICKED_UP':
            return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
        case 'REJECTED':
            return 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400'
        case 'CANCELLED':
            return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400'
        case 'COMPLETED':
            return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
        case 'DELIVERY_FAILED':
            return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
        default:
            return 'bg-muted text-muted-foreground'
    }
}

function getStatusLabel(status: string) {
    switch (status) {
        case 'PENDING':
            return 'Chờ duyệt'
        case 'APPROVED':
            return 'Đã duyệt'
        case 'PICKED_UP':
            return 'Đã lấy hàng'
        case 'REJECTED':
            return 'Từ chối'
        case 'CANCELLED':
            return 'Đã hủy'
        case 'COMPLETED':
            return 'Hoàn thành'
        case 'DELIVERY_FAILED':
            return 'Giao thất bại'
        default:
            return status
    }
}

export function RestockList({ onSelectReturn, onViewDetail }: RestockListProps) {
    const { t } = useTranslation('manager')
    const [returns, setReturns] = useState<RestockReturnResponse[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [totalPages, setTotalPages] = useState(0)
    const [currentPage, setCurrentPage] = useState(0)
    const [keyword, setKeyword] = useState('')
    const [searchKeyword, setSearchKeyword] = useState('')

    async function loadReturns() {
        setIsLoading(true)
        try {
            const res = await restockApi.getRestockReturns({
                page: currentPage,
                size: 10,
                status: 'COMPLETED',
                keyword: searchKeyword || undefined
            })

            if (res.success && res.data) {
                setReturns(res.data.content)
                setTotalPages(res.data.totalPages)
            }
        } catch (err) {
            console.error('Failed to load returns for restock', err)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        void loadReturns()
    }, [currentPage, searchKeyword])

    function handleSearchSubmit(e: React.FormEvent) {
        e.preventDefault()
        setSearchKeyword(keyword)
        setCurrentPage(0)
    }

    function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === 'Enter') {
            e.preventDefault()
            setSearchKeyword(keyword)
            setCurrentPage(0)
        }
    }

    if (isLoading) {
        return (
            <div className='p-12 text-center text-muted-foreground animate-pulse font-semibold'>
                Đang tải danh sách yêu cầu nhập hàng...
            </div>
        )
    }

    return (
        <div>
            {/* Search Bar */}
            <div className='p-4 border-b border-border'>
                <form onSubmit={handleSearchSubmit} className='flex items-center gap-3'>
                    <div className='relative flex-1'>
                        <span className='absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground'>
                            <MaterialIcon name='search' className='text-lg' />
                        </span>
                        <input
                            type='text'
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder='Tìm theo mã yêu cầu, mã đơn hàng...'
                            className='w-full rounded-xl border border-border bg-card py-2 pl-10 pr-4 text-sm text-foreground focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all'
                        />
                    </div>
                    <button
                        type='submit'
                        className='inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-primary px-6 text-sm font-bold text-white shadow-sm hover:opacity-90 active:scale-95 transition-all'
                    >
                        <MaterialIcon name='search' className='text-base' />
                        Tìm kiếm
                    </button>
                </form>
            </div>

            {/* Table */}
            <div className='overflow-x-auto'>
                {returns.length === 0 ? (
                    <div className='p-12 text-center text-muted-foreground font-semibold'>
                        Không có yêu cầu nào đã hoàn thành để nhập kho.
                    </div>
                ) : (
                    <table className='w-full min-w-[800px] border-collapse text-left text-sm'>
                        <thead>
                            <tr className='border-b border-border bg-muted/50 text-xs font-bold uppercase tracking-wide text-muted-foreground'>
                                <th className='px-6 py-4'>Mã yêu cầu</th>
                                <th className='px-6 py-4'>Mã đơn hàng</th>
                                <th className='px-6 py-4'>Khách hàng</th>
                                <th className='px-6 py-4'>Số sản phẩm</th>
                                <th className='px-6 py-4'>Ngày tạo</th>
                                <th className='px-6 py-4'>Trạng thái</th>
                                <th className='px-6 py-4 text-right'>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className='divide-y divide-border'>
                            {returns.map((req) => {
                                const isRestocked = req.restockedAt !== null && req.restockedAt !== undefined

                                return (
                                    <tr key={req.returnRequestId} className='transition-colors hover:bg-muted/30'>
                                        <td className='px-6 py-4 font-bold text-primary'>#{req.returnCode}</td>
                                        <td className='px-6 py-4 text-muted-foreground font-medium'>#{req.orderCode}</td>
                                        <td className='px-6 py-4'>
                                            <p className='font-semibold text-card-foreground'>
                                                {req.requestedBy?.fullName || 'Customer'}
                                            </p>
                                            <p className='text-xs text-muted-foreground'>{req.requestedBy?.email}</p>
                                        </td>
                                        <td className='px-6 py-4 text-center font-semibold'>
                                            {req.returnItems?.length || 0}
                                        </td>
                                        <td className='px-6 py-4 text-xs text-muted-foreground'>
                                            {formatDate(req.createdAt)}
                                        </td>
                                        <td className='px-6 py-4'>
                                            <span
                                                className={cn(
                                                    'inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider',
                                                    getStatusBadgeClassName(req.status)
                                                )}
                                            >
                                                {getStatusLabel(req.status)}
                                            </span>
                                        </td>
                                        <td className='px-6 py-4 text-right'>
                                            {isRestocked ? (
                                                // ✅ Đã nhập kho → hiển thị nút Xem
                                                <button
                                                    type='button'
                                                    onClick={() => onViewDetail?.(req.returnRequestId)}
                                                    className='inline-flex items-center gap-1.5 rounded-xl bg-blue-500 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:opacity-90 active:scale-95 transition-all'
                                                >
                                                    <MaterialIcon name='visibility' className='text-sm shrink-0' />
                                                    Xem
                                                </button>
                                            ) : (
                                                // ✅ Chưa nhập kho → hiển thị nút Nhập kho
                                                <button
                                                    type='button'
                                                    onClick={() => onSelectReturn(req.returnRequestId)}
                                                    className='inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:opacity-90 active:scale-95 transition-all'
                                                >
                                                    <MaterialIcon name='inventory_2' className='text-sm shrink-0' />
                                                    Nhập kho
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className='flex items-center justify-between border-t border-border px-6 py-4 bg-muted/10'>
                    <span className='text-xs text-muted-foreground'>
                        Trang <strong>{currentPage + 1}</strong> / <strong>{totalPages}</strong>
                    </span>
                    <div className='flex items-center gap-2'>
                        <button
                            type='button'
                            disabled={currentPage === 0 || isLoading}
                            onClick={() => setCurrentPage((p) => p - 1)}
                            className='inline-flex h-9 items-center justify-center rounded-xl border border-border bg-card px-4 text-xs font-bold text-card-foreground hover:bg-muted active:scale-95 disabled:opacity-50 transition-all'
                        >
                            <MaterialIcon name='chevron_left' className='text-base' />
                            Trang trước
                        </button>
                        <button
                            type='button'
                            disabled={currentPage >= totalPages - 1 || isLoading}
                            onClick={() => setCurrentPage((p) => p + 1)}
                            className='inline-flex h-9 items-center justify-center rounded-xl border border-border bg-card px-4 text-xs font-bold text-card-foreground hover:bg-muted active:scale-95 disabled:opacity-50 transition-all'
                        >
                            Trang sau
                            <MaterialIcon name='chevron_right' className='text-base' />
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}