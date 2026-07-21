// app/features/manager/components/products/manager-product-batch-intake.tsx

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { MaterialIcon } from '~/shared/ui'
import { createBatchesApi } from '../../services/batch'
import type { CreateBatchPayload } from '~/shared/lib/batch'

export interface ManagerProductBatchIntakeProps {
  productId: string
  onSuccess: () => void
}

export function ManagerProductBatchIntake({
  productId,
  onSuccess
}: ManagerProductBatchIntakeProps) {
  const { t } = useTranslation('manager')
  const [newBatches, setNewBatches] = useState<{ quantity: number; basePrice: number; expiryDate: string }[]>([
    { quantity: 0, basePrice: 0, expiryDate: '' }
  ])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)

  const addBatchRow = () => {
    setNewBatches([...newBatches, { quantity: 0, basePrice: 0, expiryDate: '' }])
  }

  const removeBatchRow = (index: number) => {
    setNewBatches(newBatches.filter((_, i) => i !== index))
  }

  const updateBatchRow = (index: number, field: 'quantity' | 'basePrice' | 'expiryDate', value: string | number) => {
    const updated = [...newBatches]
    updated[index] = { ...updated[index], [field]: value }
    setNewBatches(updated)
  }

  const handleSubmitBatches = async () => {
    setSubmitError(null)
    setShowSuccess(false)

    const validBatches = newBatches.filter(
      (batch) => batch.quantity > 0 && batch.basePrice >= 0 && batch.expiryDate.trim() !== ''
    )

    if (validBatches.length === 0) {
      setSubmitError(t('productManagement.batch.errors.invalidBatch'))
      return
    }

    setIsSubmitting(true)
    try {
      const payload: CreateBatchPayload[] = validBatches.map((batch) => ({
        stockQuantity: batch.quantity,
        basePrice: batch.basePrice,
        expiryDate: batch.expiryDate
      }))

      const response = await createBatchesApi(productId, payload)
      if (response.success) {
        setNewBatches([{ quantity: 0, basePrice: 0, expiryDate: '' }])
        setShowSuccess(true)
        onSuccess()
        setTimeout(() => setShowSuccess(false), 3000)
      } else {
        setSubmitError(response.message || t('productManagement.batch.errors.submitFailed'))
      }
    } catch (err) {
      console.error('Submit batches error:', err)
      const errMsg = err instanceof Error ? err.message : t('productManagement.batch.errors.submitFailed')
      setSubmitError(errMsg)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
        <h4 className='font-bold text-base text-foreground'>{t('productManagement.batch.intakeTitle')}</h4>
        <div className='flex items-center gap-3'>
          <button
            onClick={addBatchRow}
            disabled={isSubmitting}
            className='px-4 py-2 bg-card hover:bg-muted text-primary border border-border rounded-lg text-sm font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
          >
            <MaterialIcon name='add' className='text-lg' />
            {t('productManagement.batch.addRow')}
          </button>
          <button
            onClick={handleSubmitBatches}
            disabled={isSubmitting}
            className='px-4 py-2 bg-primary hover:bg-primary/95 text-primary-foreground rounded-lg text-sm font-semibold flex items-center gap-1.5 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {isSubmitting ? (
              <MaterialIcon name='hourglass_empty' className='animate-spin text-lg' />
            ) : (
              <MaterialIcon name='check_circle' className='text-lg' />
            )}
            {t('productManagement.batch.confirmImport')}
          </button>
        </div>
      </div>

      {/* Intake Table */}
      <div className='border border-border rounded-xl overflow-hidden bg-card'>
        <table className='w-full text-sm border-collapse'>
          <thead>
            <tr className='bg-muted/40 border-b border-border'>
              <th className='w-16 px-4 py-2.5 text-center text-xs font-bold text-muted-foreground uppercase tracking-wider'>
                {t('productManagement.batch.stt')}
              </th>
              <th className='px-4 py-2.5 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider'>
                {t('productManagement.batch.quantity')}
              </th>
              <th className='px-4 py-2.5 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider'>
                {t('productManagement.batch.basePrice')}
              </th>
              <th className='px-4 py-2.5 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider'>
                {t('productManagement.batch.expiryDate')}
              </th>
              <th className='w-20 px-4 py-2.5 text-center text-xs font-bold text-muted-foreground uppercase tracking-wider'>
                {t('productManagement.batch.actions')}
              </th>
            </tr>
          </thead>
          <tbody className='divide-y divide-border'>
            {newBatches.map((batch, index) => (
              <tr key={index} className='hover:bg-muted/10'>
                <td className='px-4 py-3 text-center font-medium text-muted-foreground'>{index + 1}</td>
                <td className='px-4 py-3'>
                  <input
                    type='number'
                    min='1'
                    value={batch.quantity || ''}
                    onChange={(e) => updateBatchRow(index, 'quantity', Number(e.target.value))}
                    className='w-full bg-background border border-input rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all'
                    placeholder={t('productManagement.batch.quantityPlaceholder')}
                    disabled={isSubmitting}
                  />
                </td>
                <td className='px-4 py-3'>
                  <input
                    type='number'
                    min='0'
                    step='1000'
                    value={batch.basePrice || ''}
                    onChange={(e) => updateBatchRow(index, 'basePrice', Number(e.target.value))}
                    className='w-full bg-background border border-input rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all'
                    placeholder={t('productManagement.batch.basePricePlaceholder')}
                    disabled={isSubmitting}
                  />
                </td>
                <td className='px-4 py-3'>
                  <input
                    type='date'
                    value={batch.expiryDate}
                    onChange={(e) => updateBatchRow(index, 'expiryDate', e.target.value)}
                    className='w-full bg-background border border-input rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all'
                    disabled={isSubmitting}
                  />
                </td>
                <td className='px-4 py-3 text-center'>
                  <button
                    onClick={() => removeBatchRow(index)}
                    disabled={newBatches.length === 1 || isSubmitting}
                    className='p-1.5 text-destructive hover:bg-destructive/10 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent transition-colors'
                  >
                    <MaterialIcon name='delete_outline' className='text-lg' />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {submitError && (
        <div className='mt-2 flex items-center gap-2 text-destructive text-sm font-semibold bg-destructive/10 p-3 rounded-lg'>
          <MaterialIcon name='error_outline' className='text-lg shrink-0' />
          <span>{submitError}</span>
        </div>
      )}
      {showSuccess && (
        <div className='mt-2 flex items-center gap-2 text-success text-sm font-semibold bg-success/10 p-3 rounded-lg'>
          <MaterialIcon name='check_circle_outline' className='text-lg shrink-0' />
          <span>{t('productManagement.batch.importSuccess')}</span>
        </div>
      )}
    </div>
  )
}