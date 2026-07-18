import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router'

import { cn } from '~/shared/lib/cn'
import { Button, MaterialIcon } from '~/shared/ui'

import { ProfileFloatingSupport } from '../components/layout/profile-floating-support'
import { ProfilePageHeader } from '../components/layout/profile-page-header'
import { ProfileSidebar } from '../components/layout/profile-sidebar'
import { PetProfileForm } from '../components/pets/pet-profile-form'
import { getPetProfileErrorMessage } from '../lib/pet-profile-error'
import { petProfileApi, type PetProfileImages, type PetProfilePayload, type PetProfileResponse } from '../services'

export function ProfilePetEditPage() {
  const { t } = useTranslation('profile')
  const navigate = useNavigate()
  const { petId } = useParams()
  const [pet, setPet] = useState<PetProfileResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'error'; text: string } | null>(null)

  const loadPet = useCallback(async () => {
    if (!petId) return

    setIsLoading(true)
    setMessage(null)

    try {
      const response = await petProfileApi.getPetById(petId)
      setPet(response.data)
    } catch (error) {
      setMessage({
        type: 'error',
        text: getPetProfileErrorMessage(error, t, 'detail')
      })
    } finally {
      setIsLoading(false)
    }
  }, [petId, t])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Pet detail is loaded from route params.
    void loadPet()
  }, [loadPet])

  async function handleSubmit(payload: PetProfilePayload, images: PetProfileImages) {
    if (!petId) return

    setIsSubmitting(true)
    setMessage(null)

    try {
      const response = await petProfileApi.updatePet(petId, payload, images)
      void navigate(`/profile/pets/${response.data.petId}`)
    } catch (error) {
      setMessage({
        type: 'error',
        text: getPetProfileErrorMessage(error, t, 'update')
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className='flex h-screen overflow-hidden bg-background text-foreground'>
      <ProfileSidebar activeItem='pets' />
      <div className='flex min-w-0 flex-1 flex-col overflow-hidden'>
        <ProfilePageHeader titleKey='petProfiles.edit.headerTitle' subtitleKey='petProfiles.edit.headerSubtitle' />
        <main className='flex-1 overflow-y-auto p-4 pb-24 md:p-6'>
          <div className='mx-auto flex max-w-5xl flex-col gap-6'>
            <section className='flex flex-col gap-4 border-b border-border pb-6 md:flex-row md:items-center md:justify-between'>
              <div>
                <h1 className='font-display text-2xl font-bold text-card-foreground md:text-3xl'>
                  {t('petProfiles.edit.title')}
                </h1>
                <p className='mt-2 text-muted-foreground'>{t('petProfiles.edit.description')}</p>
              </div>
              <Button
                type='button'
                variant='outline'
                onClick={() => void navigate(petId ? `/profile/pets/${petId}` : '/profile/pets')}
              >
                <MaterialIcon name='arrow_back' className='text-lg' />
                {t('petProfiles.actions.backToDetail')}
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

            {isLoading ? (
              <section className='grid gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm md:grid-cols-2'>
                {Array.from({ length: 8 }).map((_, index) => (
                  <div key={index} className='h-10 animate-pulse rounded-md bg-muted' />
                ))}
              </section>
            ) : pet ? (
              <PetProfileForm
                initialPet={pet}
                isSubmitting={isSubmitting}
                submitLabel={t('petProfiles.actions.saveUpdate')}
                onCancel={() => void navigate(`/profile/pets/${pet.petId}`)}
                onSubmit={handleSubmit}
              />
            ) : (
              <section className='rounded-2xl border border-border bg-card p-10 text-center text-sm text-muted-foreground shadow-sm'>
                {t('petProfiles.errors.notFound')}
              </section>
            )}
          </div>
        </main>
      </div>
      <ProfileFloatingSupport />
    </div>
  )
}
