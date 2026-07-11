import { useState, type FormEvent, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { Button, MaterialIcon } from '~/shared/ui'

import { getPetGenderKey, getPetSpeciesKey } from '../../lib/pet-profile-format'
import type { PetProfileImages, PetProfilePayload, PetProfileResponse, PetVaccinationStatus } from '../../services'

const VACCINATION_STATUS_OPTIONS: PetVaccinationStatus[] = [
  'UNKNOWN',
  'NOT_VACCINATED',
  'PARTIALLY_VACCINATED',
  'FULLY_VACCINATED',
  'EXPIRED'
]

const PET_SPECIES_OPTIONS = ['DOG', 'CAT'] as const
const PET_GENDER_OPTIONS = ['MALE', 'FEMALE'] as const

type PetSpeciesOption = (typeof PET_SPECIES_OPTIONS)[number]
type PetGenderOption = (typeof PET_GENDER_OPTIONS)[number]

interface PetProfileFormState {
  petName: string
  species: PetSpeciesOption
  breed: string
  gender: PetGenderOption
  dateOfBirth: string
  weight: string
  color: string
  healthNote: string
  allergyNote: string
  behaviorNote: string
  vaccinationStatus: PetVaccinationStatus
}

export interface PetProfileFormProps {
  initialPet?: PetProfileResponse | null
  isSubmitting: boolean
  submitLabel: string
  onCancel: () => void
  onSubmit: (payload: PetProfilePayload, images: PetProfileImages) => Promise<void>
}

function toFormState(pet?: PetProfileResponse | null): PetProfileFormState {
  return {
    petName: pet?.petName ?? '',
    species: getPetSpeciesKey(pet?.species) ?? 'DOG',
    breed: pet?.breed ?? '',
    gender: getPetGenderKey(pet?.gender) ?? 'MALE',
    dateOfBirth: pet?.dateOfBirth ?? '',
    weight: pet?.weight ? String(pet.weight) : '',
    color: pet?.color ?? '',
    healthNote: pet?.healthNote ?? '',
    allergyNote: pet?.allergyNote ?? '',
    behaviorNote: pet?.behaviorNote ?? '',
    vaccinationStatus: pet?.vaccinationStatus ?? 'UNKNOWN'
  }
}

function toPayload(form: PetProfileFormState): PetProfilePayload {
  return {
    petName: form.petName.trim(),
    species: form.species,
    breed: form.breed.trim() || undefined,
    gender: form.gender,
    dateOfBirth: form.dateOfBirth || undefined,
    weight: form.weight ? Number(form.weight) : undefined,
    color: form.color.trim() || undefined,
    healthNote: form.healthNote.trim() || undefined,
    allergyNote: form.allergyNote.trim() || undefined,
    behaviorNote: form.behaviorNote.trim() || undefined,
    vaccinationStatus: form.vaccinationStatus
  }
}

export function PetProfileForm({
  initialPet,
  isSubmitting,
  submitLabel,
  onCancel,
  onSubmit
}: PetProfileFormProps) {
  const { t } = useTranslation('profile')
  const [form, setForm] = useState<PetProfileFormState>(() => toFormState(initialPet))
  const [avatarImage, setAvatarImage] = useState<File | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await onSubmit(toPayload(form), avatarImage ? [avatarImage] : null)
  }

  return (
    <form className='grid gap-5' onSubmit={(event) => void handleSubmit(event)}>
      <section className='grid gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm md:grid-cols-2'>
        <Field label={t('petProfiles.form.petName')} required>
          <input
            required
            value={form.petName}
            onChange={(event) => setForm((current) => ({ ...current, petName: event.target.value }))}
            className='h-10 rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring'
          />
        </Field>

        <Field label={t('petProfiles.form.species')} required>
          <select
            required
            value={form.species}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                species: event.target.value as PetSpeciesOption
              }))
            }
            className='h-10 rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring'
          >
            {PET_SPECIES_OPTIONS.map((species) => (
              <option key={species} value={species}>
                {t(`petProfiles.species.${species}`)}
              </option>
            ))}
          </select>
        </Field>

        <Field label={t('petProfiles.form.breed')}>
          <input
            value={form.breed}
            onChange={(event) => setForm((current) => ({ ...current, breed: event.target.value }))}
            className='h-10 rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring'
          />
        </Field>

        <Field label={t('petProfiles.form.gender')}>
          <select
            value={form.gender}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                gender: event.target.value as PetGenderOption
              }))
            }
            className='h-10 rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring'
          >
            {PET_GENDER_OPTIONS.map((gender) => (
              <option key={gender} value={gender}>
                {t(`petProfiles.gender.${gender}`)}
              </option>
            ))}
          </select>
        </Field>

        <Field label={t('petProfiles.form.dateOfBirth')}>
          <input
            type='date'
            value={form.dateOfBirth}
            onChange={(event) => setForm((current) => ({ ...current, dateOfBirth: event.target.value }))}
            className='h-10 rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring'
          />
        </Field>

        <Field label={t('petProfiles.form.weight')}>
          <input
            type='number'
            min='0'
            step='0.1'
            value={form.weight}
            onChange={(event) => setForm((current) => ({ ...current, weight: event.target.value }))}
            className='h-10 rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring'
          />
        </Field>

        <Field label={t('petProfiles.form.color')}>
          <input
            value={form.color}
            onChange={(event) => setForm((current) => ({ ...current, color: event.target.value }))}
            className='h-10 rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring'
          />
        </Field>

        <Field label={t('petProfiles.form.vaccinationStatus')}>
          <select
            value={form.vaccinationStatus}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                vaccinationStatus: event.target.value as PetVaccinationStatus
              }))
            }
            className='h-10 rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring'
          >
            {VACCINATION_STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {t(`petProfiles.vaccinationStatus.${status}`)}
              </option>
            ))}
          </select>
        </Field>

        <Field label={t('petProfiles.form.petAvatar')}>
          <input
            type='file'
            accept='image/*'
            onChange={(event) => setAvatarImage(event.target.files?.[0] ?? null)}
            className='rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-primary-foreground'
          />
          {avatarImage ? (
            <p className='mt-1 text-xs text-muted-foreground'>
              {t('petProfiles.form.selectedAvatar', { name: avatarImage.name })}
            </p>
          ) : null}
        </Field>
      </section>

      <section className='grid gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm md:grid-cols-3'>
        <Field label={t('petProfiles.form.healthNote')}>
          <textarea
            rows={4}
            value={form.healthNote}
            onChange={(event) => setForm((current) => ({ ...current, healthNote: event.target.value }))}
            className='resize-none rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring'
          />
        </Field>
        <Field label={t('petProfiles.form.allergyNote')}>
          <textarea
            rows={4}
            value={form.allergyNote}
            onChange={(event) => setForm((current) => ({ ...current, allergyNote: event.target.value }))}
            className='resize-none rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring'
          />
        </Field>
        <Field label={t('petProfiles.form.behaviorNote')}>
          <textarea
            rows={4}
            value={form.behaviorNote}
            onChange={(event) => setForm((current) => ({ ...current, behaviorNote: event.target.value }))}
            className='resize-none rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring'
          />
        </Field>
      </section>

      <div className='flex flex-col-reverse gap-3 sm:flex-row sm:justify-end'>
        <Button type='button' variant='outline' onClick={onCancel}>
          {t('petProfiles.actions.cancel')}
        </Button>
        <Button type='submit' disabled={isSubmitting}>
          <MaterialIcon name='save' className='text-lg' />
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}

interface FieldProps {
  label: string
  children: ReactNode
  required?: boolean
}

function Field({ label, children, required = false }: FieldProps) {
  return (
    <label className='flex flex-col gap-1.5'>
      <span className='text-xs font-bold uppercase text-muted-foreground'>
        {label}
        {required ? <span className='text-destructive'> *</span> : null}
      </span>
      {children}
    </label>
  )
}
