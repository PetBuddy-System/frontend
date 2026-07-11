import type { PetProfileResponse } from '../services'

const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/
const DATE_TIME_PATTERN =
  /^(\d{4})-(\d{2})-(\d{2})[T\s](\d{2}):(\d{2})(?::(\d{2})(?:\.\d{1,9})?)?$/
const VIETNAM_TIME_ZONE = 'Asia/Ho_Chi_Minh'

const dateFormatter = new Intl.DateTimeFormat('vi-VN', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric'
})

const dateTimeFormatter = new Intl.DateTimeFormat('vi-VN', {
  timeZone: VIETNAM_TIME_ZONE,
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false
})

function buildLocalDate(year: string, month: string, day: string) {
  return new Date(Number(year), Number(month) - 1, Number(day))
}

function buildUtcDateTime(year: string, month: string, day: string, hour: string, minute: string, second = '0') {
  return new Date(
    Date.UTC(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute), Number(second))
  )
}

function parseBrowserDate(value: string) {
  const normalizedValue = value.replace(/(\.\d{3})\d+([Zz]|[+-]\d{2}:?\d{2})$/, '$1$2')
  const date = new Date(normalizedValue)

  return Number.isNaN(date.getTime()) ? null : date
}

export function formatPetDate(value?: string) {
  if (!value) return '-'

  const match = DATE_PATTERN.exec(value)
  if (match) {
    const [, year, month, day] = match
    return dateFormatter.format(buildLocalDate(year, month, day))
  }

  const date = parseBrowserDate(value)
  if (!date) return value

  return dateFormatter.format(date)
}

export function formatPetDateTime(value?: string) {
  if (!value) return '-'

  const match = DATE_TIME_PATTERN.exec(value)
  if (match) {
    const [, year, month, day, hour, minute, second] = match
    return dateTimeFormatter.format(buildUtcDateTime(year, month, day, hour, minute, second))
  }

  const date = parseBrowserDate(value)
  if (!date) return value

  return dateTimeFormatter.format(date)
}

export function getPrimaryPetImage(pet: PetProfileResponse) {
  return pet.mediaFiles?.find((media) => media.fileType === 'IMAGE' && media.mediaStatus === 'ACTIVE')?.fileUrl
}

export function getPetSpeciesKey(species?: string) {
  if (!species) return null

  const normalizedSpecies = species.trim().toUpperCase()
  if (normalizedSpecies === 'DOG' || normalizedSpecies === 'CHO' || normalizedSpecies === 'CHÓ') return 'DOG'
  if (normalizedSpecies === 'CAT' || normalizedSpecies === 'MEO' || normalizedSpecies === 'MÈO') return 'CAT'

  return null
}

export function getPetGenderKey(gender?: string) {
  if (!gender) return null

  const normalizedGender = gender.trim().toUpperCase()
  if (normalizedGender === 'MALE' || normalizedGender === 'DUC' || normalizedGender === 'ĐỰC') return 'MALE'
  if (normalizedGender === 'FEMALE' || normalizedGender === 'CAI' || normalizedGender === 'CÁI') return 'FEMALE'

  return null
}

export function calculatePetAge(dateOfBirth?: string) {
  if (!dateOfBirth) return null

  const birthDate = DATE_PATTERN.exec(dateOfBirth)
  if (!birthDate) return null

  const [, year, month, day] = birthDate
  const birthday = buildLocalDate(year, month, day)
  const today = new Date()
  let years = today.getFullYear() - birthday.getFullYear()
  let months = today.getMonth() - birthday.getMonth()

  if (today.getDate() < birthday.getDate()) {
    months -= 1
  }

  if (months < 0) {
    years -= 1
    months += 12
  }

  if (years < 0) return null

  return { years, months }
}
