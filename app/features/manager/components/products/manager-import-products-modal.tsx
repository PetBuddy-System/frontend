import { useState, useRef, useCallback } from 'react'
import { MaterialIcon } from '~/shared/ui'
import { cn } from '~/shared/lib/cn'
import { importProductsApi } from '~/shared/lib/product'
import type { ImportProductsResult } from '~/shared/lib/product'

// ─── Types ───────────────────────────────────────────────────────────────────

type ImportStep = 'idle' | 'previewing' | 'previewed' | 'confirming' | 'done'

interface ManagerImportProductsModalProps {
  onClose: () => void
  onImportSuccess: () => void
}

// ─── Component ───────────────────────────────────────────────────────────────

export function ManagerImportProductsModal({
  onClose,
  onImportSuccess
}: ManagerImportProductsModalProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [step, setStep] = useState<ImportStep>('idle')
  const [previewResult, setPreviewResult] = useState<ImportProductsResult | null>(null)
  const [apiError, setApiError] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // ── File selection ──────────────────────────────────────────────────────────

  const acceptFile = (file: File) => {
    const isExcel =
      file.name.endsWith('.xlsx') ||
      file.name.endsWith('.xls') ||
      file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.type === 'application/vnd.ms-excel'

    if (!isExcel) {
      setApiError('Chỉ chấp nhận file .xlsx hoặc .xls')
      return
    }
    if (file.size > 20 * 1024 * 1024) {
      setApiError('File không được vượt quá 20MB')
      return
    }

    setSelectedFile(file)
    setPreviewResult(null)
    setApiError(null)
    setStep('idle')
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) acceptFile(e.target.files[0])
  }

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files?.[0]) acceptFile(e.dataTransfer.files[0])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Preview (confirm=false) ─────────────────────────────────────────────────

  const handlePreview = async () => {
    if (!selectedFile) return
    setStep('previewing')
    setApiError(null)

    try {
      const response = await importProductsApi(selectedFile, false)
      if (response.success) {
        setPreviewResult(response.data)
        setStep('previewed')
      } else {
        setApiError(response.message || 'Lỗi khi xem trước file')
        setStep('idle')
      }
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : 'Lỗi khi xem trước file')
      setStep('idle')
    }
  }

  // ── Confirm import (confirm=true) ───────────────────────────────────────────

  const handleConfirmImport = async () => {
    if (!selectedFile) return
    setStep('confirming')
    setApiError(null)

    try {
      const response = await importProductsApi(selectedFile, true)
      if (response.success) {
        setPreviewResult(response.data)
        setStep('done')
        onImportSuccess()
      } else {
        setApiError(response.message || 'Lỗi khi xác nhận import')
        setStep('previewed')
      }
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : 'Lỗi khi xác nhận import')
      setStep('previewed')
    }
  }

  // ── Derived states ──────────────────────────────────────────────────────────

  const hasErrors = (previewResult?.errors?.length ?? 0) > 0
  const hasWarnings = (previewResult?.warnings?.length ?? 0) > 0
  const canConfirm = previewResult?.canImport === true
  const isLoading = step === 'previewing' || step === 'confirming'

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto'>
      {/* Backdrop */}
      <button
        type='button'
        aria-label='Đóng modal'
        className='absolute inset-0 bg-foreground/45 backdrop-blur-sm'
        onClick={onClose}
      />

      <section className='relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl'>
        {/* ── Header ── */}
        <header className='flex items-center justify-between border-b border-border bg-muted/50 px-6 py-4'>
          <div className='flex items-center gap-3'>
            <div className='flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10'>
              <MaterialIcon name='upload_file' className='text-xl text-primary' />
            </div>
            <div>
              <h2 className='font-display text-lg font-bold text-card-foreground'>
                Nhập dữ liệu từ Excel
              </h2>
              <p className='text-xs text-muted-foreground mt-0.5'>
                Tải lên file Excel để import sản phẩm hàng loạt
              </p>
            </div>
          </div>
          <button
            type='button'
            onClick={onClose}
            className='flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-primary transition-colors'
          >
            <MaterialIcon name='close' className='text-xl' />
          </button>
        </header>

        {/* ── Body ── */}
        <div className='flex-1 overflow-y-auto p-6 space-y-5 min-h-0'>

          {/* Upload zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              'flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-all cursor-pointer select-none',
              isDragging
                ? 'border-primary bg-primary/5 scale-[1.01]'
                : selectedFile
                  ? 'border-success bg-success/5'
                  : 'border-border bg-muted/20 hover:border-primary/50 hover:bg-muted/40'
            )}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type='file'
              accept='.xlsx,.xls'
              className='hidden'
              onChange={handleFileInputChange}
            />

            {selectedFile ? (
              <>
                <div className='flex h-12 w-12 items-center justify-center rounded-2xl bg-success/15 mb-3'>
                  <MaterialIcon name='description' className='text-2xl text-success' />
                </div>
                <p className='text-sm font-bold text-card-foreground truncate max-w-xs'>
                  {selectedFile.name}
                </p>
                <p className='text-xs text-muted-foreground mt-1'>
                  {(selectedFile.size / 1024).toFixed(1)} KB — Nhấp để đổi file
                </p>
              </>
            ) : (
              <>
                <div className={cn(
                  'flex h-12 w-12 items-center justify-center rounded-2xl mb-3 transition-colors',
                  isDragging ? 'bg-primary/20' : 'bg-muted'
                )}>
                  <MaterialIcon
                    name='cloud_upload'
                    className={cn('text-2xl transition-colors', isDragging ? 'text-primary' : 'text-muted-foreground')}
                  />
                </div>
                <p className='text-sm font-semibold text-card-foreground'>
                  Kéo thả tệp vào đây hoặc{' '}
                  <span className='text-primary underline underline-offset-2'>chọn tệp</span>
                </p>
                <p className='text-xs text-muted-foreground mt-1'>
                  Hỗ trợ .xls, .xlsx — Tối đa 20MB
                </p>
              </>
            )}
          </div>

          {/* API error banner */}
          {apiError && (
            <div className='flex items-start gap-2 rounded-xl bg-destructive/10 p-4 text-sm text-destructive'>
              <MaterialIcon name='error' className='shrink-0 text-xl mt-0.5' />
              <span className='font-semibold'>{apiError}</span>
            </div>
          )}

          {/* Preview result */}
          {previewResult && step !== 'done' && (
            <div className='space-y-3'>
              {/* Status pill */}
              {hasErrors ? (
                <div className='flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/8 px-4 py-3 text-sm font-semibold text-destructive'>
                  <MaterialIcon name='cancel' className='text-xl' />
                  <span>File có lỗi — Không thể import. Vui lòng sửa và thử lại.</span>
                </div>
              ) : hasWarnings ? (
                <div className='flex items-center gap-2 rounded-xl border border-warning/30 bg-warning/8 px-4 py-3 text-sm font-semibold text-warning'>
                  <MaterialIcon name='warning' className='text-xl' />
                  <span>File có cảnh báo — Bạn vẫn có thể xác nhận import.</span>
                </div>
              ) : (
                <div className='flex items-center gap-2 rounded-xl border border-success/30 bg-success/8 px-4 py-3 text-sm font-semibold text-success'>
                  <MaterialIcon name='check_circle' className='text-xl' />
                  <span>Dữ liệu hợp lệ. Bạn có thể xác nhận nhập.</span>
                </div>
              )}

              {/* Error & Warning panels */}
              <div className='grid grid-cols-2 gap-3'>
                {/* Errors */}
                <div className='rounded-xl border border-border bg-muted/30 p-4'>
                  <div className='flex items-center justify-between mb-2'>
                    <p className='text-xs font-bold text-card-foreground uppercase tracking-wider'>
                      Danh sách lỗi
                    </p>
                    {previewResult.errors.length > 0 && (
                      <span className='text-xs font-bold text-destructive bg-destructive/10 rounded-full px-2 py-0.5'>
                        {previewResult.errors.length}
                      </span>
                    )}
                  </div>
                  {previewResult.errors.length === 0 ? (
                    <p className='text-xs text-muted-foreground'>Không tìm thấy lỗi nào.</p>
                  ) : (
                    <ul className='space-y-1 max-h-28 overflow-y-auto'>
                      {previewResult.errors.map((err: string, i: number) => (
                        <li key={i} className='text-xs text-destructive flex items-start gap-1.5'>
                          <MaterialIcon name='error' className='text-sm shrink-0 mt-px' />
                          <span>{err}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Warnings */}
                <div className='rounded-xl border border-border bg-muted/30 p-4'>
                  <div className='flex items-center justify-between mb-2'>
                    <p className='text-xs font-bold text-card-foreground uppercase tracking-wider'>
                      Danh sách cảnh báo
                    </p>
                    {previewResult.warnings.length > 0 && (
                      <span className='text-xs font-bold text-warning bg-warning/10 rounded-full px-2 py-0.5'>
                        {previewResult.warnings.length}
                      </span>
                    )}
                  </div>
                  {previewResult.warnings.length === 0 ? (
                    <p className='text-xs text-muted-foreground'>Không có cảnh báo nào.</p>
                  ) : (
                    <ul className='space-y-1 max-h-28 overflow-y-auto'>
                      {previewResult.warnings.map((warn: string, i: number) => (
                        <li key={i} className='text-xs text-warning flex items-start gap-1.5'>
                          <MaterialIcon name='warning' className='text-sm shrink-0 mt-px' />
                          <span>{warn}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Done state */}
          {step === 'done' && previewResult && (
            <div className='flex flex-col items-center gap-3 py-4 text-center'>
              <div className='flex h-14 w-14 items-center justify-center rounded-full bg-success/15'>
                <MaterialIcon name='check_circle' className='text-3xl text-success' />
              </div>
              <div>
                <p className='text-base font-bold text-card-foreground'>Import thành công!</p>
                <p className='text-sm text-muted-foreground mt-0.5'>
                  Đã tạo{' '}
                  <span className='font-bold text-primary'>{previewResult.createdProducts}</span> sản
                  phẩm và{' '}
                  <span className='font-bold text-primary'>{previewResult.createdBatches}</span> lô
                  hàng.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <footer className='flex items-center justify-end gap-3 border-t border-border bg-muted/40 px-6 py-4 shrink-0'>
          {step === 'done' ? (
            <button
              type='button'
              onClick={onClose}
              className='h-11 rounded-full bg-primary px-6 text-sm font-bold text-primary-foreground shadow-sm hover:opacity-90 transition-all'
            >
              Đóng
            </button>
          ) : (
            <>
              <button
                type='button'
                disabled={isLoading}
                onClick={onClose}
                className='h-11 rounded-full border border-border bg-card px-6 text-sm font-bold text-card-foreground hover:bg-muted transition-colors disabled:opacity-50'
              >
                Hủy
              </button>

              {/* Nút "Xem trước" — ẩn khi đã có warning và canImport (thay bằng "Xác nhận nhập") */}
              {!(step === 'previewed' && !hasErrors && canConfirm) && (
                <button
                  type='button'
                  disabled={!selectedFile || isLoading}
                  onClick={handlePreview}
                  className='h-11 inline-flex items-center justify-center gap-2 rounded-full border border-primary px-6 text-sm font-bold text-primary hover:bg-primary/8 transition-all disabled:opacity-50'
                >
                  {step === 'previewing' ? (
                    <div className='h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent' />
                  ) : (
                    <MaterialIcon name='visibility' className='text-lg' />
                  )}
                  <span>Xem trước</span>
                </button>
              )}

              {/* Nút "Xác nhận nhập" — chỉ hiện khi preview thành công và canImport=true */}
              {step === 'previewed' && !hasErrors && canConfirm && (
                <button
                  type='button'
                  disabled={isLoading}
                  onClick={handleConfirmImport}
                  className='h-11 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-bold text-primary-foreground shadow-sm hover:opacity-90 transition-all disabled:opacity-50'
                >
                  {isLoading ? (
                    <div className='h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent' />
                  ) : (
                    <MaterialIcon name='save' className='text-lg' />
                  )}
                  <span>Xác nhận nhập</span>
                </button>
              )}
            </>
          )}
        </footer>
      </section>
    </div>
  )
}
