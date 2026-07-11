import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router'

import { cn } from '~/shared/lib/cn'
import { Button, MaterialIcon } from '~/shared/ui'

import { ProfileFloatingSupport } from '../components/layout/profile-floating-support'
import { ProfilePageHeader } from '../components/layout/profile-page-header'
import { ProfileSidebar } from '../components/layout/profile-sidebar'
import { getPetProfileErrorMessage } from '../lib/pet-profile-error'
import {
  formatPetDate,
  formatPetDateTime,
  getPetGenderKey,
  getPetSpeciesKey,
  getPrimaryPetImage
} from '../lib/pet-profile-format'
import { petProfileApi, type PetProfileResponse } from '../services'

export function ProfilePetDetailPage() {
  const { t } = useTranslation('profile')
  const navigate = useNavigate()
  const { petId } = useParams()
  const [pet, setPet] = useState<PetProfileResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
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
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Detail data is loaded from route params.
    void loadPet()
  }, [loadPet])

  const imageUrl = pet ? getPrimaryPetImage(pet) : undefined
  const speciesKey = pet ? getPetSpeciesKey(pet.species) : null
  const genderKey = pet ? getPetGenderKey(pet.gender) : null

  return (
    <div className='flex h-screen overflow-hidden bg-background text-foreground'>
      <ProfileSidebar activeItem='pets' />
      <div className='flex min-w-0 flex-1 flex-col overflow-hidden'>
        <ProfilePageHeader titleKey='petProfiles.detail.headerTitle' subtitleKey='petProfiles.detail.headerSubtitle' />
        <main className='flex-1 overflow-y-auto p-4 pb-24 md:p-6'>
          <div className='mx-auto flex max-w-6xl flex-col gap-6'>
            <section className='flex flex-col gap-4 border-b border-border pb-6 md:flex-row md:items-center md:justify-between'>
              <div>
                <h1 className='font-display text-2xl font-bold text-card-foreground md:text-3xl'>
                  {t('petProfiles.detail.title')}
                </h1>
                <p className='mt-2 text-muted-foreground'>{t('petProfiles.detail.description')}</p>
              </div>
              <div className='flex flex-wrap gap-2'>
                <Button type='button' variant='outline' onClick={() => void navigate('/profile/pets')}>
                  <MaterialIcon name='arrow_back' className='text-lg' />
                  {t('petProfiles.actions.backToList')}
                </Button>
                {pet ? (
                  <Button type='button' onClick={() => void navigate(`/profile/pets/${pet.petId}/edit`)}>
                    <MaterialIcon name='edit' className='text-lg' />
                    {t('petProfiles.actions.edit')}
                  </Button>
                ) : null}
              </div>
            </section>

            {message && (
              <div className='rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive'>
                {message.text}
              </div>
            )}

            {isLoading ? (
              <section className='grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]'>
                <div className='h-96 animate-pulse rounded-2xl bg-muted' />
                <div className='h-96 animate-pulse rounded-2xl bg-muted' />
              </section>
            ) : pet ? (
              <section className='grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]'>
                <aside className='overflow-hidden rounded-2xl border border-border bg-card shadow-sm'>
                  <div className='aspect-square bg-muted'>
                    {imageUrl ? (
                      <img src={imageUrl} alt={pet.petName} className='h-full w-full object-cover' />
                    ) : (
                      <div className='flex h-full items-center justify-center text-primary'>
                        <MaterialIcon name='pets' className='text-7xl' />
                      </div>
                    )}
                  </div>
                  <div className='p-5'>
                    <h2 className='font-display text-3xl font-bold text-card-foreground'>{pet.petName}</h2>
                    <p className='mt-2 text-muted-foreground'>
                      {[
                        speciesKey ? t(`petProfiles.species.${speciesKey}`) : pet.species,
                        pet.breed,
                        pet.color
                      ]
                        .filter(Boolean)
                        .join(' • ') || '-'}
                    </p>
                    <span
                      className={cn(
                        'mt-4 inline-flex rounded-full px-3 py-1 text-xs font-bold',
                        pet.petStatus === 'ACTIVE'
                          ? 'bg-success/10 text-success'
                          : 'bg-muted text-muted-foreground'
                      )}
                    >
                      {t(`petProfiles.petStatus.${pet.petStatus}`)}
                    </span>
                  </div>
                </aside>

                <div className='flex flex-col gap-6'>
                  <section className='grid gap-3 rounded-2xl border border-border bg-card p-5 shadow-sm md:grid-cols-2'>
                    <DetailItem
                      label={t('petProfiles.fields.species')}
                      value={speciesKey ? t(`petProfiles.species.${speciesKey}`) : pet.species}
                      icon='category'
                    />
                    <DetailItem label={t('petProfiles.fields.breed')} value={pet.breed || '-'} icon='pets' />
                    <DetailItem
                      label={t('petProfiles.fields.gender')}
                      value={genderKey ? t(`petProfiles.gender.${genderKey}`) : pet.gender || '-'}
                      icon='wc'
                    />
                    <DetailItem
                      label={t('petProfiles.fields.birthDate')}
                      value={formatPetDate(pet.dateOfBirth)}
                      icon='cake'
                    />
                    <DetailItem
                      label={t('petProfiles.fields.weight')}
                      value={pet.weight ? t('petProfiles.values.weightKg', { value: pet.weight }) : '-'}
                      icon='monitor_weight'
                    />
                    <DetailItem label={t('petProfiles.fields.color')} value={pet.color || '-'} icon='palette' />
                    <DetailItem
                      label={t('petProfiles.fields.vaccination')}
                      value={t(`petProfiles.vaccinationStatus.${pet.vaccinationStatus}`)}
                      icon='vaccines'
                    />
                    <DetailItem
                      label={t('petProfiles.fields.createdAt')}
                      value={formatPetDateTime(pet.createdAt)}
                      icon='calendar_add_on'
                    />
                  </section>

                  <section className='grid gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm md:grid-cols-3'>
                    <NoteBlock label={t('petProfiles.fields.healthNote')} value={pet.healthNote} />
                    <NoteBlock label={t('petProfiles.fields.allergyNote')} value={pet.allergyNote} />
                    <NoteBlock label={t('petProfiles.fields.behaviorNote')} value={pet.behaviorNote} />
                  </section>
                </div>
              </section>
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

interface DetailItemProps {
  icon: string
  label: string
  value: string
}

function DetailItem({ icon, label, value }: DetailItemProps) {
  return (
    <div className='flex items-center gap-3 rounded-xl border border-border bg-background p-4'>
      <span className='flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-primary'>
        <MaterialIcon name={icon} className='text-lg' />
      </span>
      <div className='min-w-0'>
        <p className='text-xs font-bold uppercase text-muted-foreground'>{label}</p>
        <p className='mt-1 truncate font-semibold text-foreground'>{value}</p>
      </div>
    </div>
  )
}

interface NoteBlockProps {
  label: string
  value?: string
}

function NoteBlock({ label, value }: NoteBlockProps) {
  return (
    <div className='rounded-xl border border-border bg-background p-4'>
      <p className='text-xs font-bold uppercase text-muted-foreground'>{label}</p>
      <p className='mt-2 whitespace-pre-wrap text-sm text-foreground'>{value || '-'}</p>
    </div>
  )
}
