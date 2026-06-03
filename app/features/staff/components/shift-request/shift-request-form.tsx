import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { MaterialIcon } from '~/shared/ui'

type SolutionType = 'specific' | 'open'

export function ShiftRequestForm() {
  const { t } = useTranslation('staff')
  const [solution, setSolution] = useState<SolutionType>('specific')

  return (
    <div className='rounded-xl border border-border bg-card p-6 shadow-sm'>
      <form className='space-y-6'>
        {/* Select Current Shift */}
        <div>
          <label className='mb-2 block text-sm font-semibold'>
            {t('shiftRequest.form.shiftLabel')}{' '}
            <span className='text-destructive'>*</span>
          </label>
          <div className='relative'>
            <select className='w-full appearance-none rounded-lg border border-border bg-card px-4 py-3 text-base focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary'>
              <option disabled selected value=''>
                {t('shiftRequest.form.shiftPlaceholder')}
              </option>
              <option value='shift1'>{t('shiftRequest.form.shiftOptions.morning')}</option>
              <option value='shift2'>{t('shiftRequest.form.shiftOptions.afternoon')}</option>
            </select>
            <div className='pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-muted-foreground'>
              <MaterialIcon name='expand_more' />
            </div>
          </div>
        </div>

        {/* Reason */}
        <div>
          <label className='mb-2 block text-sm font-semibold'>
            {t('shiftRequest.form.reasonLabel')}{' '}
            <span className='text-destructive'>*</span>
          </label>
          <textarea
            className='w-full resize-none rounded-lg border border-border bg-card px-4 py-3 text-base focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary'
            placeholder={t('shiftRequest.form.reasonPlaceholder')}
            rows={3}
          />
        </div>

        {/* Proposed Solution */}
        <div className='space-y-4 rounded-lg bg-muted p-4'>
          <label className='block text-sm font-semibold'>
            {t('shiftRequest.form.solutionLabel')}{' '}
            <span className='text-destructive'>*</span>
          </label>

          <div className='flex flex-col gap-3'>
            <label className='flex cursor-pointer items-center gap-3'>
              <input
                checked={solution === 'specific'}
                className='h-5 w-5 border-border text-primary focus:ring-primary'
                name='solution'
                onChange={() => setSolution('specific')}
                type='radio'
                value='specific'
              />
              <span className='text-base'>
                {t('shiftRequest.form.solutionOptions.specific')}
              </span>
            </label>
            <label className='flex cursor-pointer items-center gap-3'>
              <input
                checked={solution === 'open'}
                className='h-5 w-5 border-border text-primary focus:ring-primary'
                name='solution'
                onChange={() => setSolution('open')}
                type='radio'
                value='open'
              />
              <span className='text-base'>
                {t('shiftRequest.form.solutionOptions.open')}
              </span>
            </label>
          </div>

          {/* Specific Colleague Fields */}
          {solution === 'specific' ? (
            <div className='space-y-4 border-t border-border pt-4'>
              <div>
                <label className='mb-2 block text-sm font-semibold'>
                  {t('shiftRequest.form.colleagueLabel')}
                </label>
                <div className='relative'>
                  <input
                    className='w-full rounded-lg border border-border bg-card py-3 pl-10 pr-4 text-base focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary'
                    placeholder={t('shiftRequest.form.colleaguePlaceholder')}
                    type='text'
                  />
                  <div className='pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3'>
                    <MaterialIcon name='search' className='text-muted-foreground' />
                  </div>
                </div>
              </div>
              <div>
                <label className='mb-2 block text-sm font-semibold'>
                  {t('shiftRequest.form.compensationLabel')}
                </label>
                <input
                  className='w-full rounded-lg border border-border bg-card px-4 py-3 text-base focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary'
                  type='datetime-local'
                />
              </div>
            </div>
          ) : null}
        </div>

        {/* Actions */}
        <div className='flex items-center justify-end gap-4 pt-4'>
          <button
            type='button'
            className='rounded-full border border-primary px-6 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/10'
          >
            {t('shiftRequest.form.cancel')}
          </button>
          <button
            type='submit'
            className='rounded-full bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:shadow'
          >
            {t('shiftRequest.form.submit')}
          </button>
        </div>
      </form>
    </div>
  )
}
