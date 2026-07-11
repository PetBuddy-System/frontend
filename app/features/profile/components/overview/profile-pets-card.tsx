import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { MaterialIcon } from '~/shared/ui'

import { calculatePetAge, getPrimaryPetImage } from '../../lib/pet-profile-format'
import { petProfileApi, type PetProfileResponse } from '../../services'

function getAgeLabel(pet: PetProfileResponse, t: (key: string, options?: Record<string, number>) => string) {
  const age = calculatePetAge(pet.dateOfBirth)
  if (!age) return t('pets.age.unknown')

  if (age.years > 0) {
    return t('pets.age.years', { count: age.years })
  }

  return t('pets.age.months', { count: Math.max(age.months, 0) })
}

export function ProfilePetsCard() {
  const { t } = useTranslation('profile')
  const [pets, setPets] = useState<PetProfileResponse[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const loadPets = useCallback(async () => {
    setIsLoading(true)

    try {
      const response = await petProfileApi.getPetProfiles()
      setPets(response.data)
    } catch {
      setPets([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Pet profiles are loaded after the profile overview mounts.
    void loadPets()
  }, [loadPets])

  return (
    <section className='h-full rounded-2xl border border-border/60 bg-card p-5 shadow-sm transition-transform hover:-translate-y-0.5 md:p-6'>
      <div className='mb-6 flex items-center justify-between'>
        <h2 className='font-display text-xl font-semibold text-foreground md:text-2xl'>{t('pets.title')}</h2>
        <a
          href='/profile/pets/new'
          aria-label={t('pets.add')}
          className='flex h-9 w-9 items-center justify-center rounded-full border-2 border-primary text-primary transition-colors hover:bg-primary hover:text-primary-foreground md:h-10 md:w-10'
        >
          <MaterialIcon name='add' className='text-[22px]' />
        </a>
      </div>

      <div className='space-y-4'>
        {isLoading ? (
          Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className='h-24 animate-pulse rounded-2xl bg-muted' />
          ))
        ) : pets.length > 0 ? (
          pets.slice(0, 3).map((pet) => {
            const imageUrl = getPrimaryPetImage(pet)

            return (
              <a
                key={pet.petId}
                href={`/profile/pets/${pet.petId}`}
                className='group block rounded-2xl border border-border bg-muted p-4 transition-colors hover:border-primary'
              >
                <div className='flex items-center gap-4'>
                  <div className='flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-card text-primary md:h-16 md:w-16'>
                    {imageUrl ? (
                      <img src={imageUrl} alt={pet.petName} className='h-full w-full object-cover' />
                    ) : (
                      <MaterialIcon name='pets' className='text-[28px]' />
                    )}
                  </div>
                  <div className='min-w-0 flex-1'>
                    <h3 className='truncate text-base font-bold text-foreground md:text-lg'>{pet.petName}</h3>
                    <p className='text-sm text-muted-foreground'>{pet.breed || '-'}</p>
                    <p className='mt-1 text-xs font-semibold text-muted-foreground'>{getAgeLabel(pet, t)}</p>
                  </div>
                  <MaterialIcon
                    name='chevron_right'
                    className='text-[22px] text-muted-foreground transition-colors group-hover:text-primary'
                  />
                </div>
              </a>
            )
          })
        ) : (
          <div className='rounded-2xl border border-dashed border-border bg-muted p-5 text-center text-sm text-muted-foreground'>
            {t('pets.empty')}
          </div>
        )}

        <a
          href='/profile/pets/new'
          className='mt-4 flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-transparent py-6 text-muted-foreground transition-colors hover:border-primary hover:text-primary md:py-8'
        >
          <MaterialIcon name='add_circle' className='text-[28px] md:text-[32px]' />
          <span className='text-xs font-semibold md:text-sm'>{t('pets.add')}</span>
        </a>
      </div>
    </section>
  )
}
