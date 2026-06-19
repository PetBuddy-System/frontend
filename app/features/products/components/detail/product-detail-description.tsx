import { useTranslation } from 'react-i18next'

export interface ProductDetailDescriptionProps {
  description: string
  brandName: string
  categoryName: string
}

export function ProductDetailDescription({
  description,
  brandName,
  categoryName
}: ProductDetailDescriptionProps) {
  const { t } = useTranslation('products')

  return (
    <section className='mb-16'>
      <div className='mb-8 border-b border-border'>
        <div className='-mb-px flex'>
          <span className='inline-block border-b-2 border-primary px-6 py-4 text-sm font-bold text-primary'>
            {t('detail.tabs.description')}
          </span>
        </div>
      </div>

      <div className='rounded-xl border border-border/60 bg-card p-6 text-base leading-7 text-muted-foreground shadow-sm md:p-10 md:text-lg'>
        <h2 className='mb-4 text-2xl font-semibold text-foreground font-display'>
          {t('detail.description.highlightsTitle')}
        </h2>
        <div className='mb-8 whitespace-pre-line text-sm md:text-base text-muted-foreground'>
          {description || 'Chưa có thông tin mô tả chi tiết cho sản phẩm này.'}
        </div>

        <h2 className='mb-4 text-2xl font-semibold text-foreground font-display'>
          {t('detail.description.specsTitle')}
        </h2>
        <div className='overflow-x-auto rounded-xl border border-border/60'>
          <table className='w-full border-collapse text-left text-sm md:text-base'>
            <tbody>
              <tr className='border-b border-border/60'>
                <th className='w-1/3 bg-muted px-6 py-4 font-semibold text-foreground'>
                  Thương hiệu
                </th>
                <td className='px-6 py-4 text-muted-foreground'>{brandName || 'N/A'}</td>
              </tr>
              <tr className='border-b border-border/60 last:border-b-0'>
                <th className='w-1/3 bg-muted px-6 py-4 font-semibold text-foreground'>
                  Danh mục
                </th>
                <td className='px-6 py-4 text-muted-foreground'>{categoryName || 'N/A'}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
