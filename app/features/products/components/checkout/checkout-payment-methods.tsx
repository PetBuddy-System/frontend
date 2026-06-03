import { useTranslation } from 'react-i18next'

import { MaterialIcon } from '~/shared/ui'

const PAYMENT_METHODS = [
  { key: 'cod', icon: 'payments' },
  { key: 'bank', icon: 'account_balance' },
  {
    key: 'momo',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCLoTvBq7yZnwX550Aqx4hQj8z8RWm-J-EXuQFiuOZldpjGIPX1CGWgOT_OOgVc3cIYzMAvHhTR5kV_k3zzYeTuAT9rasEhk8hW_JGqCIxeeFZpK0l2KOfBs8Ti_fH8PCxcsDFq1iJc16NpNFNXJtk3ifrfGqoQNcIaXZ8ToMf8_W-IWPoc1Tl8VVMENIzwYiksbukrV8GiFGxGpEpbVaoPzn3EaJX_5GnHaSSmWCyDEWR7tSiCRUaa-x0HYJEwTLIopjF45f8and4'
  },
  {
    key: 'zaloPay',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuB1oklGnV2M_cMvNEkSUcvgY4s4JzgB-V-DLejzPOMdgfjuaPgBf25QZDLL9HhO2o8k9QileO95Na25wLaVjryvc-wn9VluFoTQQyCVxvs2VjFE_EQahijLXFb9hqGW71GZVCXb47e9G3PWbMPNrM1QmzuCjXlAqCVGyKJViOVQS5rk8u8HeQ9xsl5ediiuxWO7YiHol7lhYoT3oEqZ8ycdx2yuX65J9oRKzkTr7QvSyZKSuoDbaXXbETWV3N8iKuTkMnLHmN2Chp0'
  }
] as const

export function CheckoutPaymentMethods() {
  const { t } = useTranslation('products')

  return (
    <section className='rounded-xl border border-border/60 bg-card p-6 shadow-sm md:p-8'>
      <div className='mb-6 flex items-center gap-3'>
        <MaterialIcon name='account_balance_wallet' className='text-[24px] text-primary' />
        <h2 className='font-display text-2xl font-semibold text-primary'>{t('checkout.payment.title')}</h2>
      </div>

      <div className='grid grid-cols-1 gap-3'>
        {PAYMENT_METHODS.map((method, index) => (
          <label
            key={method.key}
            className='flex cursor-pointer items-center rounded-xl border border-border p-4 transition-colors hover:bg-muted'
          >
            <input
              className='h-5 w-5 border-border bg-background text-primary focus:ring-ring'
              name='payment'
              type='radio'
              defaultChecked={index === 0}
            />
            <span className='ml-4 text-foreground'>{t(`checkout.payment.methods.${method.key}`)}</span>
            {'image' in method ? (
              <img
                src={method.image}
                alt={t(`checkout.payment.alt.${method.key}`)}
                className='ml-auto h-6 w-6 rounded object-cover'
              />
            ) : (
              <MaterialIcon name={method.icon} className='ml-auto text-[24px] text-muted-foreground' />
            )}
          </label>
        ))}
      </div>
    </section>
  )
}
