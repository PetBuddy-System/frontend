import { MaterialIcon } from '~/shared/ui'

const PAYMENT_METHODS = [
  { key: 'cod', label: 'Tiền mặt (COD)', icon: 'payments' },
  {
    key: 'momo',
    label: 'Ví MoMo',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCLoTvBq7yZnwX550Aqx4hQj8z8RWm-J-EXuQFiuOZldpjGIPX1CGWgOT_OOgVc3cIYzMAvHhTR5kV_k3zzYeTuAT9rasEhk8hW_JGqCIxeeFZpK0l2KOfBs8Ti_fH8PCxcsDFq1iJc16NpNFNXJtk3ifrfGqoQNcIaXZ8ToMf8_W-IWPoc1Tl8VVMENIzwYiksbukrV8GiFGxGpEpbVaoPzn3EaJX_5GnHaSSmWCyDEWR7tSiCRUaa-x0HYJEwTLIopjF45f8and4',
  },
] as const

export function CheckoutPaymentMethods() {
  return (
    <section className='rounded-xl border border-border/60 bg-card p-6 shadow-sm md:p-8'>
      <div className='mb-6 flex items-center gap-3'>
        <MaterialIcon name='account_balance_wallet' className='text-[24px] text-primary' />
        <h2 className='font-display text-2xl font-semibold text-primary'>Phương thức thanh toán</h2>
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
              value={method.key}
              defaultChecked={index === 0}
            />
            <span className='ml-4 text-foreground'>{method.label}</span>
            {'image' in method ? (
              <img
                src={method.image}
                alt={method.label}
                className='ml-auto h-7 w-7 rounded-lg object-cover'
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
