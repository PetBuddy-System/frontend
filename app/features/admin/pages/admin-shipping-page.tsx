// app/features/admin/pages/admin-shipping-page.tsx
import { useEffect, useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { AdminSidebar } from '../components/layout/admin-sidebar'
import { AdminTopNav } from '../components/layout/admin-top-nav'
import { MaterialIcon } from '~/shared/ui'
import {
    fetchAllShippingRulesApi,
    createShippingRuleApi,
    updateShippingRuleApi,
    deleteShippingRuleApi,
} from '../services/shipping'
import type { ShippingRule } from '~/shared/lib/shipping'
import { AdminShippingFormModal } from '../components/shipping/admin-shipping-form-modal'

export function AdminShippingPage() {
    const { t } = useTranslation('admin')
    const [rules, setRules] = useState<ShippingRule[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [isLoading, setIsLoading] = useState(true)
    const [errorMessage, setErrorMessage] = useState('')

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add')
    const [selectedRuleId, setSelectedRuleId] = useState<number | null>(null)
    const [minDistance, setMinDistance] = useState<string>('')
    const [maxDistance, setMaxDistance] = useState<string>('')
    const [fee, setFee] = useState<string>('')

    // Submit state
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitSuccess, setSubmitSuccess] = useState(false)

    // Dropdown states
    const [activeDropdownId, setActiveDropdownId] = useState<number | null>(null)

    useEffect(() => {
        loadRules()
    }, [])

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleOutsideClick() {
            setActiveDropdownId(null)
        }
        window.addEventListener('click', handleOutsideClick)
        return () => window.removeEventListener('click', handleOutsideClick)
    }, [])

    async function loadRules() {
        setIsLoading(true)
        setErrorMessage('')
        try {
            const response = await fetchAllShippingRulesApi()
            if (response && Array.isArray(response.data)) {
                setRules(response.data)
            } else {
                setRules([])
            }
        } catch (error: unknown) {
            setErrorMessage(error instanceof Error ? error.message : 'Không thể tải danh sách cấu hình phí vận chuyển.')
        } finally {
            setIsLoading(false)
        }
    }

    const filteredRules = useMemo(() => {
        if (!searchQuery.trim()) return rules
        const q = searchQuery.toLowerCase()
        return rules.filter(
            (rule) =>
                rule.minDistance.toString().includes(q) ||
                rule.maxDistance.toString().includes(q) ||
                rule.fee.toString().includes(q)
        )
    }, [rules, searchQuery])

    function handleOpenAddModal() {
        setModalMode('add')
        setSelectedRuleId(null)
        setMinDistance('')
        setMaxDistance('')
        setFee('')
        setErrorMessage('')
        setSubmitSuccess(false)
        setIsModalOpen(true)
    }

    function handleOpenEditModal(rule: ShippingRule) {
        setModalMode('edit')
        setSelectedRuleId(rule.id)
        setMinDistance(rule.minDistance.toString())
        setMaxDistance(rule.maxDistance.toString())
        setFee(rule.fee.toString())
        setErrorMessage('')
        setSubmitSuccess(false)
        setIsModalOpen(true)
    }

    async function handleSaveRule() {
        setErrorMessage('')
        const minVal = parseFloat(minDistance)
        const maxVal = parseFloat(maxDistance)
        const feeVal = parseFloat(fee.replace(/,/g, ''))

        if (isNaN(minVal) || minVal < 0) {
            setErrorMessage('Khoảng cách tối thiểu phải lớn hơn hoặc bằng 0.')
            return
        }
        if (isNaN(maxVal) || maxVal <= minVal) {
            setErrorMessage('Khoảng cách tối đa phải lớn hơn khoảng cách tối thiểu.')
            return
        }
        if (isNaN(feeVal) || feeVal < 0) {
            setErrorMessage('Phí vận chuyển phải lớn hơn hoặc bằng 0.')
            return
        }

        setIsSubmitting(true)
        try {
            if (modalMode === 'add') {
                await createShippingRuleApi({
                    minDistance: minVal,
                    maxDistance: maxVal,
                    fee: feeVal
                })
            } else if (modalMode === 'edit' && selectedRuleId !== null) {
                await updateShippingRuleApi(selectedRuleId, {
                    minDistance: minVal,
                    maxDistance: maxVal,
                    fee: feeVal
                })
            }

            setSubmitSuccess(true)
            setTimeout(() => {
                setIsModalOpen(false)
                setIsSubmitting(false)
                setSubmitSuccess(false)
                loadRules()
            }, 1000)
        } catch (error: unknown) {
            setErrorMessage(error instanceof Error ? error.message : 'Đã xảy ra lỗi khi lưu cấu hình.')
            setIsSubmitting(false)
        }
    }

    async function handleDeleteRule(id: number) {
        if (!confirm('Bạn có chắc chắn muốn xóa quy tắc vận chuyển này?')) return
        setErrorMessage('')
        try {
            await deleteShippingRuleApi(id)
            loadRules()
        } catch (error: unknown) {
            alert(error instanceof Error ? error.message : 'Không thể xóa quy tắc vận chuyển này.')
        }
    }

    function formatFeeDisplay(feeVal: number) {
        if (feeVal === 0) return 'Miễn phí'
        return `${new Intl.NumberFormat('vi-VN').format(feeVal)} VND`
    }

    return (
        <div className='flex h-screen overflow-hidden bg-background text-foreground'>
            <AdminSidebar activeItem='shipping' />
            <div className='flex min-w-0 flex-1 flex-col overflow-hidden'>
                <AdminTopNav titleKey='shippingTitle' subtitleKey='shippingSubtitle' />
                <main className='flex-1 overflow-y-auto p-4 md:p-6'>
                    <div className='mx-auto flex max-w-7xl flex-col gap-6'>
                        {/* Header */}
                        <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                            <div>
                                <h1 className='text-2xl font-bold text-primary md:text-3xl'>
                                    {t('shippingTitle', 'Cấu hình phí vận chuyển')}
                                </h1>
                                <p className='text-muted-foreground'>
                                    {t('shippingSubtitle', 'Thiết lập biểu phí dựa trên khoảng cách địa lý để tối ưu hóa chi phí vận hành.')}
                                </p>
                            </div>
                        </div>

                        {/* Filter & Actions toolbar */}
                        <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
                            <div className='relative w-full max-w-md'>
                                <span className='absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground'>
                                    <MaterialIcon name='search' className='text-[20px]' />
                                </span>
                                <input
                                    type='text'
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className='w-full rounded-xl border border-border bg-card py-2.5 pl-10 pr-4 text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20'
                                    placeholder='Tìm kiếm cấu hình...'
                                />
                            </div>

                            <button
                                onClick={handleOpenAddModal}
                                className='flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 font-semibold text-primary-foreground shadow-md transition-opacity hover:opacity-90 active:scale-95 shrink-0'
                            >
                                <MaterialIcon name='add' className='text-[20px]' />
                                Thêm quy tắc mới
                            </button>
                        </div>

                        {/* Error Message */}
                        {errorMessage && (
                            <div className='flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive'>
                                <MaterialIcon name='error' className='mt-0.5 shrink-0 text-[20px]' />
                                <p>{errorMessage}</p>
                            </div>
                        )}

                        {/* Main Table */}
                        <div className='overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm'>
                            <div className='px-6 py-4 border-b border-border/60'>
                                <h3 className='font-semibold text-lg text-primary'>Danh sách quy tắc hiện tại</h3>
                            </div>

                            <div className='overflow-x-auto'>
                                {isLoading ? (
                                    <div className='flex justify-center items-center py-12'>
                                        <div className='h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent' />
                                    </div>
                                ) : filteredRules.length === 0 ? (
                                    <div className='py-12 text-center text-muted-foreground'>
                                        Không tìm thấy quy tắc vận chuyển nào.
                                    </div>
                                ) : (
                                    <table className='w-full border-collapse text-left'>
                                        <thead>
                                            <tr className='bg-muted/50 border-b border-border/60'>
                                                <th className='px-6 py-4 font-semibold text-muted-foreground text-sm'>Khoảng cách tối thiểu</th>
                                                <th className='px-6 py-4 font-semibold text-muted-foreground text-sm'>Khoảng cách tối đa</th>
                                                <th className='px-6 py-4 font-semibold text-muted-foreground text-sm'>Phí vận chuyển</th>
                                                <th className='px-6 py-4 font-semibold text-muted-foreground text-sm text-right w-28'>Thao tác</th>
                                            </tr>
                                        </thead>
                                        <tbody className='divide-y divide-border/40'>
                                            {filteredRules.map((rule) => (
                                                <tr key={rule.id} className='hover:bg-muted/30 transition-colors'>
                                                    <td className='px-6 py-4 text-sm font-medium'>{rule.minDistance} km</td>
                                                    <td className='px-6 py-4 text-sm font-medium'>{rule.maxDistance} km</td>
                                                    <td className={`px-6 py-4 text-sm font-bold ${rule.fee === 0 ? 'text-success' : 'text-primary'}`}>
                                                        {formatFeeDisplay(rule.fee)}
                                                    </td>
                                                    <td className='px-6 py-4 text-right relative'>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                setActiveDropdownId(activeDropdownId === rule.id ? null : rule.id)
                                                            }}
                                                            className='p-1.5 hover:bg-muted rounded-lg text-muted-foreground transition-colors'
                                                        >
                                                            <MaterialIcon name='more_vert' className='text-[20px]' />
                                                        </button>

                                                        {activeDropdownId === rule.id && (
                                                            <div
                                                                onClick={(e) => e.stopPropagation()}
                                                                className='absolute right-6 top-11 z-30 w-32 rounded-xl bg-card border border-border shadow-lg overflow-hidden py-1 text-left'
                                                            >
                                                                <button
                                                                    onClick={() => {
                                                                        handleOpenEditModal(rule)
                                                                        setActiveDropdownId(null)
                                                                    }}
                                                                    className='flex w-full items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors'
                                                                >
                                                                    <MaterialIcon name='edit' className='text-[18px]' /> Sửa
                                                                </button>
                                                                <button
                                                                    onClick={() => {
                                                                        handleDeleteRule(rule.id)
                                                                        setActiveDropdownId(null)
                                                                    }}
                                                                    className='flex w-full items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors'
                                                                >
                                                                    <MaterialIcon name='delete' className='text-[18px]' /> Xóa
                                                                </button>
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>

                        <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                            <MaterialIcon name='info' className='text-[18px]' />
                            <span>Hệ thống sẽ tự động áp dụng quy tắc có khoảng cách khớp nhất với địa chỉ giao hàng của khách.</span>
                        </div>
                    </div>
                </main>
            </div>

            {/* Modal Backdrop & Form - Extracted Component */}
            {isModalOpen && (
                <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm'>
                    <AdminShippingFormModal
                        mode={modalMode}
                        initialData={rules.find(r => r.id === selectedRuleId)}
                        isSubmitting={isSubmitting}
                        error={errorMessage}
                        onClose={() => setIsModalOpen(false)}
                        onSave={handleSaveRule}
                        onMinDistanceChange={setMinDistance}
                        onMaxDistanceChange={setMaxDistance}
                        onFeeChange={setFee}
                        minDistance={minDistance}
                        maxDistance={maxDistance}
                        fee={fee}
                    />
                </div>
            )}
        </div>
    )
}
