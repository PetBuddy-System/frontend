import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'

import { cn } from '~/shared/lib/cn'
import { Button, MaterialIcon } from '~/shared/ui'

import { ProfileFloatingSupport } from '../components/layout/profile-floating-support'
import { ProfilePageHeader } from '../components/layout/profile-page-header'
import { ProfileSidebar } from '../components/layout/profile-sidebar'
import { getPetProfileErrorMessage } from '../lib/pet-profile-error'
import { formatPetDate, getPetSpeciesKey, getPrimaryPetImage } from '../lib/pet-profile-format'
import { petProfileApi, type PetProfileResponse } from '../services'

function getPetMeta(pet: PetProfileResponse, t: (key: string) => string) {
  const speciesKey = getPetSpeciesKey(pet.species)
  const species = speciesKey ? t(`petProfiles.species.${speciesKey}`) : pet.species

  return [species, pet.breed, pet.color].filter(Boolean).join(' • ')
}

export function ProfilePetsPage() {
  const { t } = useTranslation('profile')
  const navigate = useNavigate()
  const [pets, setPets] = useState<PetProfileResponse[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'error'; text: string } | null>(null)

  const loadPets = useCallback(async () => {
    setIsLoading(true)
    setMessage(null)

    try {
      const response = await petProfileApi.getPetProfiles()
      setPets(response.data)
    } catch (error) {
      setMessage({
        type: 'error',
        text: getPetProfileErrorMessage(error, t, 'list')
      })
    } finally {
      setIsLoading(false)
    }
  }, [t])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Pet profiles are loaded after the route mounts.
    void loadPets()
  }, [loadPets])

  return (
    <div className='flex h-screen overflow-hidden bg-background text-foreground'>
      <ProfileSidebar activeItem='pets' />
      <div className='flex min-w-0 flex-1 flex-col overflow-hidden'>
        <ProfilePageHeader titleKey='petProfiles.headerTitle' subtitleKey='petProfiles.headerSubtitle' />
        <main className='flex-1 overflow-y-auto p-4 pb-24 md:p-6'>
          <div className='mx-auto flex max-w-7xl flex-col gap-6'>
            <section className='flex flex-col gap-4 border-b border-border pb-6 md:flex-row md:items-center md:justify-between'>
              <div>
                <h1 className='font-display text-2xl font-bold text-card-foreground md:text-3xl'>
                  {t('petProfiles.title')}
                </h1>
                <p className='mt-2 max-w-3xl text-muted-foreground'>{t('petProfiles.description')}</p>
              </div>
              <Button type='button' onClick={() => void navigate('/profile/pets/new')}>
                <MaterialIcon name='add' className='text-lg' />
                {t('petProfiles.actions.create')}
              </Button>
            </section>

            {message && (
              <div className='rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive'>
                {message.text}
              </div>
            )}

            {isLoading ? (
              <section className='grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className='h-72 animate-pulse rounded-2xl bg-muted' />
                ))}
              </section>
            ) : pets.length > 0 ? (
              <section className='grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
                {pets.map((pet) => {
                  const imageUrl = getPrimaryPetImage(pet)

                  return (
                    <article
                      key={pet.petId}
                      className='overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition hover:-translate-y-0.5 hover:shadow-md'
                    >
                      <div className='aspect-[4/3] bg-muted'>
                        {imageUrl ? (
                          <img src={imageUrl} alt={pet.petName} className='h-full w-full object-cover' />
                        ) : (
                          <div className='flex h-full items-center justify-center text-primary'>
                            <MaterialIcon name='pets' className='text-6xl' />
                          </div>
                        )}
                      </div>
                      <div className='flex flex-col gap-4 p-5'>
                        <div>
                          <div className='flex items-start justify-between gap-3'>
                            <div>
                              <h2 className='font-display text-xl font-bold text-card-foreground'>{pet.petName}</h2>
                              <p className='mt-1 text-sm text-muted-foreground'>{getPetMeta(pet, t) || '-'}</p>
                            </div>
                            <span
                              className={cn(
                                'rounded-full px-2.5 py-1 text-xs font-bold',
                                pet.petStatus === 'ACTIVE'
                                  ? 'bg-success/10 text-success'
                                  : 'bg-muted text-muted-foreground'
                              )}
                            >
                              {t(`petProfiles.petStatus.${pet.petStatus}`)}
                            </span>
                          </div>
                          <div className='mt-4 grid grid-cols-2 gap-3 text-sm'>
                            <InfoPill
                              label={t('petProfiles.fields.birthDate')}
                              value={formatPetDate(pet.dateOfBirth)}
                            />
                            <InfoPill
                              label={t('petProfiles.fields.vaccination')}
                              value={t(`petProfiles.vaccinationStatus.${pet.vaccinationStatus}`)}
                            />
                          </div>
                        </div>
                        <div className='grid grid-cols-2 gap-2'>
                          <Button
                            type='button'
                            variant='outline'
                            onClick={() => void navigate(`/profile/pets/${pet.petId}`)}
                          >
                            <MaterialIcon name='visibility' className='text-lg' />
                            {t('petProfiles.actions.viewDetails')}
                          </Button>
                          <Button type='button' onClick={() => void navigate(`/profile/pets/${pet.petId}/edit`)}>
                            <MaterialIcon name='edit' className='text-lg' />
                            {t('petProfiles.actions.edit')}
                          </Button>
                        </div>
                      </div>
                    </article>
                  )
                })}
              </section>
            ) : (
              <section className='rounded-2xl border border-dashed border-border bg-card p-10 text-center'>
                <MaterialIcon name='pets' className='text-5xl text-primary' />
                <h2 className='mt-4 font-display text-xl font-bold text-card-foreground'>
                  {t('petProfiles.empty.title')}
                </h2>
                <p className='mx-auto mt-2 max-w-xl text-sm text-muted-foreground'>
                  {t('petProfiles.empty.description')}
                </p>
                <Button type='button' className='mt-5' onClick={() => void navigate('/profile/pets/new')}>
                  <MaterialIcon name='add' className='text-lg' />
                  {t('petProfiles.actions.create')}
                </Button>
              </section>
            )}
          </div>
        </main>
      </div>
      <ProfileFloatingSupport />
    </div>
  )
}

interface InfoPillProps {
  label: string
  value: string
}

function InfoPill({ label, value }: InfoPillProps) {
  return (
    <div className='rounded-xl bg-muted px-3 py-2'>
      <p className='text-xs font-bold uppercase text-muted-foreground'>{label}</p>
      <p className='mt-1 truncate text-sm font-semibold text-foreground'>{value}</p>
    </div>
  )
}
