import { useTranslation } from 'react-i18next'

import { MaterialIcon } from '~/shared/ui'

const CONTACT_MAP_EMBED_URL =
  'https://www.google.com/maps?q=Tr%C6%B0%E1%BB%9Dng%20%C4%90%E1%BA%A1i%20h%E1%BB%8Dc%20FPT%20TP.%20HCM&output=embed'
const CONTACT_MAP_LINK_URL =
  'https://www.google.com/maps/place/Tr%C6%B0%E1%BB%9Dng+%C4%90%E1%BA%A1i+h%E1%BB%8Dc+FPT+TP.+HCM/@10.8411329,106.8073081,17z/data=!3m1!4b1!4m6!3m5!1s0x31752731176b07b1:0xb752b24b379bae5e!8m2!3d10.8411276!4d106.809883!16s%2Fg%2F11j2zx_fz_?entry=ttu&g_ep=EgoyMDI2MDUyMC4wIKXMDSoASAFQAw%3D%3D'

const CONTACT_ITEMS = [
  { icon: 'location_on', labelKey: 'addressLabel', valueKey: 'address', href: undefined },
  { icon: 'call', labelKey: 'phoneLabel', valueKey: 'phone', href: undefined },
  { icon: 'share', labelKey: 'followLabel', valueKey: 'facebook', href: '#' }
] as const

export function ContactInfoSection() {
  const { t } = useTranslation('landing')

  return (
    <section className='mb-12 grid gap-8 md:grid-cols-2'>
      <div className='flex flex-col justify-center rounded-lg border border-border bg-card p-8 shadow-sm'>
        <h2 className='mb-6 text-2xl font-semibold text-primary'>{t('contact.info.title')}</h2>
        <div className='space-y-6'>
          {CONTACT_ITEMS.map((item) => (
            <div key={item.labelKey} className='flex gap-4'>
              <div className='flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground'>
                <MaterialIcon name={item.icon} className='text-[24px]' />
              </div>
              <div>
                <p className='text-sm font-semibold text-muted-foreground'>{t(`contact.info.${item.labelKey}`)}</p>
                {item.href ? (
                  <a href={item.href} className='font-bold text-primary hover:underline'>
                    {t(`contact.info.${item.valueKey}`)}
                  </a>
                ) : (
                  <p className='font-bold text-foreground'>{t(`contact.info.${item.valueKey}`)}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className='relative min-h-[300px] overflow-hidden rounded-lg border border-border bg-muted'>
        <iframe
          src={CONTACT_MAP_EMBED_URL}
          title={t('contact.info.mapAlt')}
          className='h-full min-h-[300px] w-full border-0'
          loading='lazy'
          referrerPolicy='no-referrer-when-downgrade'
          allowFullScreen
        />
        <a
          href={CONTACT_MAP_LINK_URL}
          target='_blank'
          rel='noreferrer'
          className='absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full bg-card px-4 py-2 text-sm font-semibold text-primary shadow-md transition-colors hover:bg-muted'
        >
          <MaterialIcon name='map' className='text-[18px]' />
          {t('contact.info.openMap')}
        </a>
      </div>
    </section>
  )
}
