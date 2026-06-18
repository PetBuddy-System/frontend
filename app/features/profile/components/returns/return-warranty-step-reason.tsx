import { useTranslation } from 'react-i18next'
import { MaterialIcon } from '~/shared/ui'

export interface ReturnWarrantyStepReasonProps {
  reason: string
  description: string
  onReasonChange: (value: string) => void
  onDescriptionChange: (value: string) => void
}

export function ReturnWarrantyStepReason({
  reason,
  description,
  onReasonChange,
  onDescriptionChange
}: ReturnWarrantyStepReasonProps) {
  const { t } = useTranslation('profile')

  return (
    <div className='space-y-4 rounded-xl border border-border bg-card p-4 shadow-sm'>
      <div className='flex items-center gap-3'>
        <span className='flex h-8 w-8 items-center justify-center rounded-full bg-primary font-display text-sm font-bold text-primary-foreground'>
          3
        </span>
        <h3 className='font-display text-lg font-bold text-foreground'>{t('returnWarranty.step.reason')}</h3>
      </div>

      <div className='space-y-4'>
        <div className='space-y-2'>
          <label className='text-xs font-bold text-muted-foreground'>{t('returnWarranty.reason.label')}</label>
          <div className='relative'>
            <select
              value={reason}
              onChange={(e) => onReasonChange(e.target.value)}
              className='w-full cursor-pointer appearance-none rounded-xl border border-border bg-muted p-3 pr-12 text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary focus:ring-offset-0 focus:outline-none transition-colors'
            >
              <option value='defect'>{t('returnWarranty.reason.options.defect')}</option>
              <option value='wrong'>{t('returnWarranty.reason.options.wrong')}</option>
              <option value='notAsDescribed'>{t('returnWarranty.reason.options.notAsDescribed')}</option>
              <option value='damaged'>{t('returnWarranty.reason.options.damaged')}</option>
              <option value='other'>{t('returnWarranty.reason.options.other')}</option>
            </select>
            <MaterialIcon
              name='expand_more'
              className='pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-2xl text-muted-foreground'
            />
          </div>
        </div>

        <div className='space-y-2'>
          <label className='text-xs font-bold text-muted-foreground'>
            {t('returnWarranty.reason.descriptionLabel')}
          </label>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder={t('returnWarranty.reason.placeholder')}
            className='w-full rounded-xl border border-border bg-muted p-4 text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary focus:ring-offset-0 focus:outline-none transition-colors'
          />
        </div>
      </div>
    </div>
  )
}
