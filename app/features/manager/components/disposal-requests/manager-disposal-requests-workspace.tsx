import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { cn } from '~/shared/lib/cn'
import { MaterialIcon } from '~/shared/ui'

type DisposalReason = 'expired' | 'damaged'

interface DisposalRequest {
  key: string
  code: string
  productKey: string
  sku: string
  staffKey: string
  timeKey: string
  reason: DisposalReason
  quantity: number
  imageUrl: string
}

const DISPOSAL_REQUESTS: DisposalRequest[] = [
  {
    key: 'salmonFood',
    code: '#DIS-8820',
    productKey: 'salmonFood',
    sku: 'DG-SAL-005',
    staffKey: 'minhTran',
    timeKey: 'yesterday1430',
    reason: 'expired',
    quantity: 12,
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuA-YP567Z_wUtYhrStghMtWFX6moUwM75v23M41xn9mRhDfdlyP57FpdvMEre0_qln_ddc2_vhQkCx_7SOCYBu8Xj5jkzJsJyJpQU_2yr5mc_hEn5LEFEOed4YyBI1Jmt1JDXApPgDaHRZPqUUarWbG5F6yptlrz39xUjfMW_drOBCwLVEpul93MDsMvqBIIaLvMJquf5_ejnVkKZoArNaJOOgKWbBJbr3sGheZs-MEtUqcjDN9nUM_aihGSvSDe9Mz4Gefo-fNnKA'
  },
  {
    key: 'terrarium',
    code: '#DIS-8821',
    productKey: 'terrarium',
    sku: 'RE-TER-042',
    staffKey: 'sarahNguyen',
    timeKey: 'today0915',
    reason: 'damaged',
    quantity: 1,
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuACYkAoUsNMujQ73fJBRsEc07bH-oKmylNXSmKvZ36SRhxCYI_fLzpJnYOEEYMDtgIedoUzHhLlCKrZztSgdyGwXFuEl4v5Xjz1EqCH2pch8s8g_sHpg6BCru2GbNEq9nURe0HjH0sIT6uGO08wBA48aHTCxbhW5dGn9I3Aq-qlGf9r7r88WtS5U61QLjC5ymoYt_15RFc6zIzXkWnpC1L3FE2P3exOmGe0GoQdqC0i5t5OW0oUnWO0isa-j_Jq-XB98AxaTBchoao'
  },
  {
    key: 'tunaPate',
    code: '#DIS-8822',
    productKey: 'tunaPate',
    sku: 'CT-TUNA-80G',
    staffKey: 'hieuPham',
    timeKey: 'today1145',
    reason: 'damaged',
    quantity: 24,
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuA4KsGWk_EiHl9vcVdcyPhKGtj7mU4N_5eT5NMgRHl6yZBHehFm2tM2pwIkoa7rkE2Q6IwFlhkvSXybXuQwnrsjTTiHwDzfuF8Td4FXQ9wYwgyLibhPE1jujkZUBb8dJKUKj2RS1o5VzHQUc-U9ZxCo_6x4CtFLOH50gsvbxVxp-xeVKMfQ2SKhATeisKgvE4t934j4Z96VPpdUGOO5Yg9xGBkWIvzPcV0LIyMrRJ-ovfd6HMo67WwiC91DeWLWquODAqn16gjYrNM'
  }
]

const EVIDENCE_IMAGES = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCvnKmepN-z8Tg9rEOJyY2pPXIzsuIxJtptUmtaWYfwi0mIc7hryRF4FPCE3Idss7A5AdgpkA3q-cL6e5ZiZAorvnM_EPInvor1B01hD7pdDOr2T5zSA3Z1Z4Sc-jVLGYlOXe5nZc3DePtAmmlyOnwOqmW4EeChLkv3h3NruWryfA-7iRqBwJNQtqcoYf0ne93Hw1Y3AH-vraHWAkq0UGfc3ZAjy2IvHPdd2K0ih6Ygc1TtHuT5_lntP-f_4lNpCtEnODDKtg4lxAc',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCxAM8yxTPsUxLMR_7rYQuxuFFxt5azeos3n1JHB7ilprw3PiigEyu0iofbNS783rWPtL94pv3kFLlaYkcTHhNtPwpHLjzfvY1bG2EiBsrFLaA12d2SuoEmgXeZoZTO84YjrU5a4tK4U66ZkxIINhe8sD-7Mext9GMYq2xiA69ELnZfKiVRRr_tlfflqrMJAifSpRtV9IeFgHz97bit6hzhwvGv5CBQn_EW4gwZZDlghj0HLnTunfynO2XkWl_YEIgp3iB5FQsJTgI'
] as const

const REASON_CLASS_BY_REASON = {
  damaged: 'bg-secondary/20 text-secondary-foreground',
  expired: 'bg-destructive/10 text-destructive'
} as const

export function ManagerDisposalRequestsWorkspace() {
  const { t } = useTranslation('manager')
  const [detailRequestKey, setDetailRequestKey] = useState<string | null>(null)
  const detailRequest = DISPOSAL_REQUESTS.find((request) => request.key === detailRequestKey) ?? null

  return (
    <>
      <section className='space-y-4'>
        <div className='overflow-hidden rounded-xl border border-border bg-card shadow-sm'>
          <div className='overflow-x-auto'>
            <table className='w-full min-w-[940px] border-collapse text-left'>
              <thead>
                <tr className='border-b border-border bg-muted text-xs font-bold uppercase tracking-wide text-muted-foreground'>
                  <th className='px-4 py-3'>{t('disposalApprovals.table.columns.product')}</th>
                  <th className='px-4 py-3'>{t('disposalApprovals.table.columns.staff')}</th>
                  <th className='px-4 py-3'>{t('disposalApprovals.table.columns.reason')}</th>
                  <th className='px-4 py-3 text-center'>{t('disposalApprovals.table.columns.quantity')}</th>
                  <th className='px-4 py-3'>{t('disposalApprovals.table.columns.actions')}</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-border'>
                {DISPOSAL_REQUESTS.map((request) => {
                  const isSelected = request.key === detailRequest?.key

                  return (
                    <tr
                      key={request.code}
                      className={cn(
                        'border-l-4 border-transparent transition-colors hover:bg-muted/60',
                        isSelected && 'border-primary bg-muted/60'
                      )}
                    >
                      <td className='px-4 py-4'>
                        <div className='flex items-center gap-3'>
                          <img
                            src={request.imageUrl}
                            alt={t(`disposalApprovals.products.${request.productKey}`)}
                            className='h-12 w-12 rounded-lg border border-border bg-muted object-cover'
                          />
                          <div>
                            <p className='font-semibold text-card-foreground'>
                              {t(`disposalApprovals.products.${request.productKey}`)}
                            </p>
                            <p className='text-xs text-muted-foreground'>SKU: {request.sku}</p>
                          </div>
                        </div>
                      </td>
                      <td className='px-4 py-4'>
                        <p className='text-sm font-semibold text-card-foreground'>
                          {t(`disposalApprovals.staff.${request.staffKey}`)}
                        </p>
                        <p className='text-xs text-muted-foreground'>
                          {t(`disposalApprovals.times.${request.timeKey}`)}
                        </p>
                      </td>
                      <td className='px-4 py-4'>
                        <span
                          className={cn(
                            'inline-flex rounded-full px-3 py-1 text-[11px] font-bold uppercase',
                            REASON_CLASS_BY_REASON[request.reason]
                          )}
                        >
                          {t(`disposalApprovals.reasons.${request.reason}`)}
                        </span>
                      </td>
                      <td className='px-4 py-4 text-center font-bold text-card-foreground'>{request.quantity}</td>
                      <td className='px-4 py-4'>
                        <div className='flex items-center gap-2'>
                          <button
                            type='button'
                            onClick={() => setDetailRequestKey(request.key)}
                            className={cn(
                              'flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-muted',
                              isSelected ? 'text-primary' : 'text-muted-foreground'
                            )}
                            aria-label={t('disposalApprovals.actions.view')}
                          >
                            <MaterialIcon name='visibility' className='text-lg' />
                          </button>
                          <button
                            type='button'
                            className='rounded-lg bg-success px-3 py-1.5 text-xs font-bold text-success-foreground transition-opacity hover:opacity-90'
                          >
                            {t('disposalApprovals.actions.approve')}
                          </button>
                          <button
                            type='button'
                            className='rounded-lg bg-destructive px-3 py-1.5 text-xs font-bold text-destructive-foreground transition-opacity hover:opacity-90'
                          >
                            {t('disposalApprovals.actions.reject')}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <DisposalRequestDetailModal request={detailRequest} onClose={() => setDetailRequestKey(null)} />
    </>
  )
}

interface DisposalRequestDetailModalProps {
  request: DisposalRequest | null
  onClose: () => void
}

function DisposalRequestDetailModal({ request, onClose }: DisposalRequestDetailModalProps) {
  const { t } = useTranslation('manager')

  if (!request) {
    return null
  }

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
      <button
        type='button'
        aria-label={t('disposalApprovals.detail.close')}
        className='absolute inset-0 bg-foreground/40 backdrop-blur-sm'
        onClick={onClose}
      />
      <section className='relative flex h-[calc(100vh-2rem)] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-xl sm:h-[calc(100vh-3rem)] sm:max-w-xl'>
        <header className='flex items-start justify-between gap-4 px-6 py-6'>
          <div>
            <p className='text-xs font-bold uppercase tracking-wide text-primary'>
              {t('disposalApprovals.detail.kicker')}
            </p>
            <h2 className='mt-2 font-display text-3xl font-bold text-card-foreground'>
              {t('disposalApprovals.detail.code', { code: request.code })}
            </h2>
          </div>
          <div className='flex items-center gap-1'>
            <button
              type='button'
              aria-label={t('disposalApprovals.detail.more')}
              className='flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-primary'
            >
              <MaterialIcon name='more_vert' />
            </button>
            <button
              type='button'
              onClick={onClose}
              aria-label={t('disposalApprovals.detail.close')}
              className='flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-primary'
            >
              <MaterialIcon name='close' />
            </button>
          </div>
        </header>

        <div className='min-h-0 flex-1 space-y-6 overflow-y-auto px-6 pb-6'>
          <section className='rounded-2xl border border-border bg-muted p-5'>
            <p className='mb-4 text-lg font-bold text-muted-foreground'>{t('disposalApprovals.detail.evidence')}</p>
            <div className='grid grid-cols-2 gap-3'>
              {EVIDENCE_IMAGES.map((imageUrl, index) => (
                <img
                  key={imageUrl}
                  src={imageUrl}
                  alt={t('disposalApprovals.detail.evidenceAlt', { index: index + 1 })}
                  className='aspect-square rounded-xl border border-border object-cover'
                />
              ))}
            </div>
          </section>

          <section>
            <p className='mb-3 text-lg font-bold text-muted-foreground'>{t('disposalApprovals.detail.noteTitle')}</p>
            <blockquote className='rounded-2xl border-l-4 border-secondary bg-muted p-5 text-base italic leading-relaxed text-muted-foreground'>
              {t('disposalApprovals.detail.note')}
            </blockquote>
          </section>

          <section className='grid grid-cols-2 gap-4 border-y border-border py-4'>
            <div>
              <p className='text-[10px] font-bold uppercase text-muted-foreground'>
                {t('disposalApprovals.detail.location')}
              </p>
              <p className='text-sm font-semibold text-card-foreground'>
                {t('disposalApprovals.detail.locationValue')}
              </p>
            </div>
            <div>
              <p className='text-[10px] font-bold uppercase text-muted-foreground'>
                {t('disposalApprovals.detail.damageValue')}
              </p>
              <p className='text-sm font-bold text-destructive'>$124.50</p>
            </div>
          </section>

          <div className='flex flex-col gap-3 sm:flex-row'>
            <button
              type='button'
              className='flex-1 rounded-full bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90'
            >
              {t('disposalApprovals.actions.approveDisposal')}
            </button>
            <button
              type='button'
              className='flex-1 rounded-full bg-muted px-4 py-2.5 text-sm font-bold text-muted-foreground transition-colors hover:bg-destructive hover:text-destructive-foreground'
            >
              {t('disposalApprovals.actions.reject')}
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
