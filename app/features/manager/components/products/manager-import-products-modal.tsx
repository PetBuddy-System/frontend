import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { importProductsApi } from '../../services/product'
import { MaterialIcon } from '~/shared/ui'

interface ManagerImportProductsModalProps {
  onClose: () => void
  onImportSuccess: () => void
}

type ImportErrorKey =
  | 'PRODUCT_NAME_REQUIRED'
  | 'CATEGORY_NAME_REQUIRED'
  | 'PRODUCT_PRICE_INVALID'
  | 'STOCK_QUANTITY_INVALID'
  | 'EXPIRY_DATE_INVALID'
  | 'PRODUCT_INACTIVE'
  | 'CATEGORY_NOT_FOUND'

const ERROR_MESSAGES: Record<'vi' | 'en', Record<ImportErrorKey, string>> = {
  vi: {
    PRODUCT_NAME_REQUIRED: 'Tên sản phẩm không được để trống',
    CATEGORY_NAME_REQUIRED: 'Tên danh mục không được để trống',
    PRODUCT_PRICE_INVALID: 'Giá sản phẩm không hợp lệ',
    STOCK_QUANTITY_INVALID: 'Số lượng tồn kho không hợp lệ',
    EXPIRY_DATE_INVALID: 'Ngày hết hạn không hợp lệ',
    PRODUCT_INACTIVE: 'Sản phẩm đã bị vô hiệu hóa',
    CATEGORY_NOT_FOUND: 'Danh mục không tồn tại'
  },
  en: {
    PRODUCT_NAME_REQUIRED: 'Product name is required',
    CATEGORY_NAME_REQUIRED: 'Category name is required',
    PRODUCT_PRICE_INVALID: 'Product price is invalid',
    STOCK_QUANTITY_INVALID: 'Stock quantity is invalid',
    EXPIRY_DATE_INVALID: 'Expiry date is invalid',
    PRODUCT_INACTIVE: 'Product is inactive',
    CATEGORY_NOT_FOUND: 'Category not found'
  }
}

function getLanguageBucket(language?: string) {
  return language?.startsWith('vi') ? 'vi' : 'en'
}

export function ManagerImportProductsModal({
  onClose,
  onImportSuccess
}: ManagerImportProductsModalProps) {
  const { t, i18n } = useTranslation('manager')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [result, setResult] = useState<{
    success: boolean
    createdProducts: number
    createdBatches: number
    errors: Array<{ row: number; errorKey: ImportErrorKey | string }>
  } | null>(null)

  const languageBucket = getLanguageBucket(i18n.language)

  const handleFileSelection = (file?: File) => {
    if (!file) return

    const isExcel =
      file.name.endsWith('.xlsx') ||
      file.name.endsWith('.xls') ||
      file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.type === 'application/vnd.ms-excel'

    if (!isExcel) {
      setApiError(languageBucket === 'vi' ? 'Chỉ chấp nhận file .xlsx hoặc .xls' : 'Only .xlsx or .xls files are supported')
      return
    }

    if (file.size > 20 * 1024 * 1024) {
      setApiError(languageBucket === 'vi' ? 'File không được vượt quá 20MB' : 'File must be smaller than 20MB')
      return
    }

    setSelectedFile(file)
    setApiError(null)
    setResult(null)
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelection(event.target.files?.[0])
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    handleFileSelection(event.dataTransfer.files?.[0])
  }

  const handleImport = async () => {
    if (!selectedFile) return

    setIsSubmitting(true)
    setApiError(null)

    try {
      const response = await importProductsApi(selectedFile)
      if (!response.success) {
        throw new Error(response.message || (languageBucket === 'vi' ? 'Nhập dữ liệu thất bại' : 'Import failed'))
      }

      const data = response.data
      setResult({
        success: data.success,
        createdProducts: data.createdProducts,
        createdBatches: data.createdBatches,
        errors: data.errors || []
      })
    } catch (error: unknown) {
      setApiError(error instanceof Error ? error.message : languageBucket === 'vi' ? 'Nhập dữ liệu thất bại' : 'Import failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  const readableErrors = (result?.errors ?? []).map((item) => ({
    row: item.row,
    message: ERROR_MESSAGES[languageBucket][item.errorKey as ImportErrorKey] ?? item.errorKey
  }))

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto'>
      <button
        type='button'
        aria-label={languageBucket === 'vi' ? 'Đóng modal' : 'Close modal'}
        className='absolute inset-0 bg-foreground/45 backdrop-blur-sm'
        onClick={onClose}
      />

      <section className='relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl'>
        <header className='flex items-center justify-between border-b border-border bg-muted/50 px-6 py-4'>
          <div className='flex items-center gap-3'>
            <div className='flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10'>
              <MaterialIcon name='upload_file' className='text-xl text-primary' />
            </div>
            <div>
              <h2 className='font-display text-lg font-bold text-card-foreground'>
                {languageBucket === 'vi' ? 'Nhập dữ liệu từ Excel' : 'Import data from Excel'}
              </h2>
              <p className='text-xs text-muted-foreground mt-0.5'>
                {languageBucket === 'vi'
                  ? 'Tải lên file Excel để import sản phẩm hàng loạt'
                  : 'Upload an Excel file to import products in bulk'}
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

        <div className='flex-1 overflow-y-auto p-6 space-y-5 min-h-0'>
          <div
            onDrop={handleDrop}
            onDragOver={(event) => event.preventDefault()}
            className='flex min-h-[220px] cursor-pointer select-none flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-muted/20 p-8 text-center transition-all hover:border-primary/50 hover:bg-muted/30'
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type='file'
              accept='.xlsx,.xls'
              className='hidden'
              onChange={handleFileChange}
            />

            <div className='mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted'>
              <MaterialIcon name='cloud_upload' className='text-3xl text-muted-foreground' />
            </div>
            <p className='text-sm font-semibold text-card-foreground'>
              {selectedFile
                ? selectedFile.name
                : languageBucket === 'vi'
                  ? 'Kéo thả tệp vào đây hoặc chọn tệp'
                  : 'Drag and drop a file here or choose one'}
            </p>
            <p className='mt-1 text-xs text-muted-foreground'>
              {selectedFile
                ? `${(selectedFile.size / 1024).toFixed(1)} KB`
                : languageBucket === 'vi'
                  ? 'Hỗ trợ .xls, .xlsx — Tối đa 20MB'
                  : 'Supports .xls, .xlsx — Up to 20MB'}
            </p>
          </div>

          {apiError && (
            <div className='flex items-start gap-2 rounded-xl bg-destructive/10 p-4 text-sm text-destructive'>
              <MaterialIcon name='error' className='shrink-0 text-xl mt-0.5' />
              <span className='font-semibold'>{apiError}</span>
            </div>
          )}

          {result && (
            <div className='space-y-4 rounded-2xl border border-border bg-muted/20 p-4'>
              <div className='flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold'
                style={{
                  backgroundColor: result.success ? 'rgba(34,197,94,0.12)' : 'rgba(245,158,11,0.12)',
                  color: result.success ? 'rgb(22,163,74)' : 'rgb(217,119,6)'
                }}
              >
                <MaterialIcon name={result.success ? 'check_circle' : 'error'} className='text-xl' />
                <span>
                  {result.success
                    ? languageBucket === 'vi'
                      ? 'Import thành công'
                      : 'Import completed'
                    : languageBucket === 'vi'
                      ? 'Import thất bại'
                      : 'Import failed'}
                </span>
              </div>

              <div className='grid gap-3 sm:grid-cols-2'>
                <div className='rounded-xl border border-border bg-card p-4'>
                  <p className='text-xs font-bold uppercase tracking-wide text-muted-foreground'>
                    {languageBucket === 'vi' ? 'Sản phẩm tạo mới' : 'Created products'}
                  </p>
                  <p className='mt-1 text-2xl font-black text-primary'>{result.createdProducts}</p>
                </div>
                <div className='rounded-xl border border-border bg-card p-4'>
                  <p className='text-xs font-bold uppercase tracking-wide text-muted-foreground'>
                    {languageBucket === 'vi' ? 'Lô hàng tạo mới' : 'Created batches'}
                  </p>
                  <p className='mt-1 text-2xl font-black text-primary'>{result.createdBatches}</p>
                </div>
              </div>

              <div className='rounded-xl border border-border bg-card p-4'>
                <div className='mb-2 flex items-center justify-between'>
                  <p className='text-xs font-bold uppercase tracking-wide text-muted-foreground'>
                    {languageBucket === 'vi' ? 'Danh sách lỗi' : 'Error list'}
                  </p>
                  <span className='rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-bold text-destructive'>
                    {readableErrors.length}
                  </span>
                </div>

                {readableErrors.length === 0 ? (
                  <p className='text-sm text-muted-foreground'>
                    {languageBucket === 'vi' ? 'Không có lỗi nào.' : 'No errors found.'}
                  </p>
                ) : (
                  <ul className='space-y-2'>
                    {readableErrors.map((item) => (
                      <li key={`${item.row}-${item.message}`} className='rounded-lg bg-muted/40 px-3 py-2 text-sm text-foreground'>
                        <span className='font-bold text-destructive'>
                          {languageBucket === 'vi' ? 'Dòng' : 'Row'} {item.row}:
                        </span>{' '}
                        {item.message}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>

        <footer className='flex items-center justify-end gap-3 border-t border-border bg-muted/40 px-6 py-4 shrink-0'>
          <button
            type='button'
            disabled={isSubmitting}
            onClick={onClose}
            className='h-11 rounded-full border border-border bg-card px-6 text-sm font-bold text-card-foreground hover:bg-muted transition-colors disabled:opacity-50'
          >
            {languageBucket === 'vi' ? 'Hủy' : 'Cancel'}
          </button>
          <button
            type='button'
            disabled={!selectedFile || isSubmitting}
            onClick={handleImport}
            className='h-11 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-bold text-primary-foreground shadow-sm hover:opacity-90 transition-all disabled:opacity-50'
          >
            {isSubmitting ? (
              <div className='h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent' />
            ) : (
              <MaterialIcon name='save' className='text-lg' />
            )}
            <span>{languageBucket === 'vi' ? 'Nhập dữ liệu' : 'Import now'}</span>
          </button>
        </footer>
      </section>
    </div>
  )
}
