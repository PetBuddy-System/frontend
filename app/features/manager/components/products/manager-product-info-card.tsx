import type { ProductDetailData } from '~/shared/lib/product'
import { MaterialIcon } from '~/shared/ui'

export interface ManagerProductInfoCardProps {
  product: ProductDetailData
  expiringSoonCount: number
  formatDate: (dateStr: string) => string
}

export function ManagerProductInfoCard({
  product,
  expiringSoonCount,
  formatDate
}: ManagerProductInfoCardProps) {
  return (
    <div className='bg-card rounded-2xl border border-border p-6 shadow-sm flex flex-col md:flex-row gap-6 justify-between'>
      {/* Left Column: Properties Grid */}
      <div className='flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-8'>
        <div>
          <span className='text-[10px] font-bold tracking-wider text-muted-foreground uppercase block mb-1'>Mã sản phẩm</span>
          <span className='text-base font-bold text-foreground block'>{product.productCode || product.productId}</span>
        </div>
        <div>
          <span className='text-[10px] font-bold tracking-wider text-muted-foreground uppercase block mb-1'>Tên sản phẩm</span>
          <span className='text-base font-bold text-foreground block'>{product.name}</span>
        </div>
        <div>
          <span className='text-[10px] font-bold tracking-wider text-muted-foreground uppercase block mb-1'>Trạng thái</span>
          <div className='flex items-center gap-1.5 mt-0.5'>
            <span className={`w-2 h-2 rounded-full ${product.status === 'ACTIVE' ? 'bg-success' : 'bg-muted-foreground'}`}></span>
            <span className={`text-sm font-semibold ${product.status === 'ACTIVE' ? 'text-success' : 'text-muted-foreground'}`}>
              {product.status}
            </span>
          </div>
        </div>
        <div>
          <span className='text-[10px] font-bold tracking-wider text-muted-foreground uppercase block mb-1'>Danh mục</span>
          <span className='text-sm font-semibold text-muted-foreground block'>{product.categoryName || 'N/A'}</span>
        </div>
        <div>
          <span className='text-[10px] font-bold tracking-wider text-muted-foreground uppercase block mb-1'>Thương hiệu</span>
          <div className='mt-0.5'>
            <span className='bg-secondary/15 text-secondary-foreground text-xs font-semibold px-2 py-0.5 rounded'>
              {product.brandName || 'N/A'}
            </span>
          </div>
        </div>
        <div>
          <span className='text-[10px] font-bold tracking-wider text-muted-foreground uppercase block mb-1'>Giá bán</span>
          <span className='text-base font-bold text-primary block'>{product.price?.toLocaleString('en-US')} VNĐ</span>
        </div>
        <div>
          <span className='text-[10px] font-bold tracking-wider text-muted-foreground uppercase block mb-1'>Tổng kho</span>
          <div className='flex items-baseline gap-1 mt-0.5'>
            <span className='text-base font-bold text-foreground'>{product.totalStock}</span>
            <span className='text-xs text-muted-foreground'>gói</span>
          </div>
        </div>
        <div>
          <span className='text-[10px] font-bold tracking-wider text-muted-foreground uppercase block mb-1'>Tổng lô hàng</span>
          <span className='text-base font-bold text-foreground block mt-0.5'>{product.batchCount}</span>
        </div>
        <div>
          <span className='text-[10px] font-bold tracking-wider text-muted-foreground uppercase block mb-1'>Hết hạn &lt; 3 tháng</span>
          <span className={`text-base font-bold block mt-0.5 ${expiringSoonCount > 0 ? 'text-destructive' : 'text-foreground'}`}>
            {expiringSoonCount}
          </span>
        </div>
      </div>

      {/* Right Column: Date Card */}
      <div className='w-full md:w-64 shrink-0 bg-muted/30 border border-border/60 rounded-xl p-4 flex flex-col gap-4 self-start'>
        <div className='flex items-start gap-3'>
          <MaterialIcon name='calendar_month' className='text-muted-foreground text-xl mt-0.5' />
          <div>
            <span className='text-[10px] font-bold tracking-wider text-muted-foreground uppercase block'>Ngày tạo</span>
            <span className='text-sm font-semibold text-muted-foreground block'>{formatDate(product.createdAt)}</span>
          </div>
        </div>
        <div className='flex items-start gap-3 border-t border-border/50 pt-3'>
          <MaterialIcon name='history' className='text-muted-foreground text-xl mt-0.5' />
          <div>
            <span className='text-[10px] font-bold tracking-wider text-muted-foreground uppercase block'>Cập nhật cuối</span>
            <span className='text-sm font-semibold text-muted-foreground block'>{formatDate(product.updatedAt)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
