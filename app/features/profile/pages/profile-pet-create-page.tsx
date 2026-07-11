import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'

import { cn } from '~/shared/lib/cn'
import { Button, MaterialIcon } from '~/shared/ui'

import { ProfileFloatingSupport } from '../components/layout/profile-floating-support'
import { ProfilePageHeader } from '../components/layout/profile-page-header'
import { ProfileSidebar } from '../components/layout/profile-sidebar'
import { PetProfileForm } from '../components/pets/pet-profile-form'
import { getPetProfileErrorMessage } from '../lib/pet-profile-error'
import { petProfileApi, type PetProfileImages, type PetProfilePayload } from '../services'

export function ProfilePetCreatePage() {
  const { t } = useTranslation('profile')
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'error'; text: string } | null>(null)

  async function handleSubmit(payload: PetProfilePayload, images: PetProfileImages) {
    setIsSubmitting(true)
    setMessage(null)

    try {
      const response = await petProfileApi.createPet(payload, images)
      void navigate(`/profile/pets/${response.data.petId}`)
    } catch (error) {
      setMessage({
        type: 'error',
        text: getPetProfileErrorMessage(error, t, 'create')
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className='flex h-screen overflow-hidden bg-background text-foreground'>
      <ProfileSidebar activeItem='pets' />
      <div className='flex min-w-0 flex-1 flex-col overflow-hidden'>
        <ProfilePageHeader titleKey='petProfiles.create.headerTitle' subtitleKey='petProfiles.create.headerSubtitle' />
        <main className='flex-1 overflow-y-auto p-4 pb-24 md:p-6'>
          <div className='mx-auto flex max-w-5xl flex-col gap-6'>
            <section className='flex flex-col gap-4 border-b border-border pb-6 md:flex-row md:items-center md:justify-between'>
              <div>
                <h1 className='font-display text-2xl font-bold text-card-foreground md:text-3xl'>
                  {t('petProfiles.create.title')}
                </h1>
                <p className='mt-2 text-muted-foreground'>{t('petProfiles.create.description')}</p>
              </div>
              <Button type='button' variant='outline' onClick={() => void navigate('/profile/pets')}>
                <MaterialIcon name='arrow_back' className='text-lg' />
                {t('petProfiles.actions.backToList')}
              </Button>
            </section>

            {message && (
              <div
                className={cn(
                  'rounded-xl border px-4 py-3 text-sm font-medium',
                  'border-destructive/30 bg-destructive/10 text-destructive'
                )}
              >
                {message.text}
              </div>
            )}

            <PetProfileForm
              isSubmitting={isSubmitting}
              submitLabel={t('petProfiles.actions.saveCreate')}
              onCancel={() => void navigate('/profile/pets')}
              onSubmit={handleSubmit}
            />
          </div>
        </main>
      </div>
      <ProfileFloatingSupport />
    </div>
  )
}
