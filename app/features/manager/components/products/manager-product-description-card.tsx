export interface ManagerProductDescriptionCardProps {
  description: string | null
}

export function ManagerProductDescriptionCard({
  description
}: ManagerProductDescriptionCardProps) {
  return (
    <div className='bg-card rounded-2xl border border-border p-6 shadow-sm'>
      <h3 className='text-lg font-bold text-foreground font-display mb-3'>Mô tả sản phẩm</h3>
      <p className='text-sm text-muted-foreground leading-relaxed whitespace-pre-line'>
        {description || 'Chưa có mô tả cho sản phẩm này.'}
      </p>
    </div>
  )
}
