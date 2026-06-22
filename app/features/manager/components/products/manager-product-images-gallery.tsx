import { MaterialIcon } from '~/shared/ui'

export interface ManagerProductImagesGalleryProps {
  name: string
  imageUrls?: string[] | null
}

export function ManagerProductImagesGallery({
  name,
  imageUrls
}: ManagerProductImagesGalleryProps) {
  const safeUrls = imageUrls || []

  return (
    <div className='bg-card rounded-2xl border border-border p-6 shadow-sm'>
      <h3 className='text-lg font-bold text-foreground font-display mb-4'>Hình ảnh sản phẩm</h3>
      <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
        {/* Slot 1: Main Image */}
        <div className='relative aspect-square bg-muted/30 border border-border rounded-xl overflow-hidden flex items-center justify-center group'>
          {safeUrls[0] ? (
            <>
              <img
                src={safeUrls[0]}
                alt={`${name} - main`}
                className='object-cover w-full h-full transition-transform group-hover:scale-105'
              />
              <span className='absolute bottom-3 left-3 bg-primary text-primary-foreground text-[10px] font-bold uppercase px-2 py-0.5 rounded shadow-sm'>
                Hình chính
              </span>
            </>
          ) : (
            <div className='flex flex-col items-center justify-center gap-2 text-muted-foreground'>
              <MaterialIcon name='image_not_supported' className='text-3xl' />
              <span className='text-xs font-semibold'>Trống</span>
            </div>
          )}
        </div>

        {/* Slot 2 */}
        <div className='relative aspect-square bg-muted/30 border border-border rounded-xl overflow-hidden flex items-center justify-center group'>
          {safeUrls[1] ? (
            <img
              src={safeUrls[1]}
              alt={`${name} - image 2`}
              className='object-cover w-full h-full transition-transform group-hover:scale-105'
            />
          ) : (
            <div className='flex flex-col items-center justify-center gap-2 text-muted-foreground'>
              <MaterialIcon name='image_not_supported' className='text-3xl' />
              <span className='text-xs font-semibold'>Trống</span>
            </div>
          )}
        </div>

        {/* Slot 3 */}
        <div className='relative aspect-square bg-muted/30 border border-border rounded-xl overflow-hidden flex items-center justify-center group'>
          {safeUrls[2] ? (
            <img
              src={safeUrls[2]}
              alt={`${name} - image 3`}
              className='object-cover w-full h-full transition-transform group-hover:scale-105'
            />
          ) : (
            <div className='flex flex-col items-center justify-center gap-2 text-muted-foreground'>
              <MaterialIcon name='image_not_supported' className='text-3xl' />
              <span className='text-xs font-semibold'>Trống</span>
            </div>
          )}
        </div>

        {/* Slot 4 */}
        <div className='relative aspect-square bg-muted/30 border border-border rounded-xl overflow-hidden flex items-center justify-center group'>
          {safeUrls[3] ? (
            <img
              src={safeUrls[3]}
              alt={`${name} - image 4`}
              className='object-cover w-full h-full transition-transform group-hover:scale-105'
            />
          ) : (
            <div className='flex flex-col items-center justify-center gap-2 text-muted-foreground'>
              <MaterialIcon name='image_not_supported' className='text-3xl' />
              <span className='text-xs font-semibold'>Trống</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
