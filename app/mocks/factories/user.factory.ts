import { faker } from '@faker-js/faker'

/**
 * User factory — tạo dữ liệu mock khớp response của BE.
 *
 * Format response:
 * {
 *   code: 0,
 *   message: "string",
 *   success: true,
 *   data: { userId, email, fullName, gender, dateOfBirth, role, ... },
 *   timestamp: "ISO date"
 * }
 */

export type UserProfile = {
  userId: string
  email: string
  fullName: string
  gender: string
  dateOfBirth: string
  role: string
  staffTask?: string
  specialization?: string
  introduction?: string
  yearsOfExperience?: number
  status: string
  paymentFailStreak?: number
  createdAt: string
  updatedAt: string
  mediaFiles?: Array<{
    mediaFileId: number
    fileUrl: string
    fileKey: string
    fileSize: number
    fileType: string
    mediaPurpose: string
    mediaStatus: string
    bookingMediaType?: string
  }>
}

export function createUserProfile(overrides: Partial<UserProfile> = {}): UserProfile {
  const avatarUrl = faker.image.avatar()
  return {
    userId: faker.string.uuid(),
    email: faker.internet.email().toLowerCase(),
    fullName: faker.person.fullName(),
    gender: faker.helpers.arrayElement(['MALE', 'FEMALE', 'OTHER']),
    dateOfBirth: faker.date.birthdate({ min: 18, max: 65, mode: 'age' }).toISOString().split('T')[0],
    role: 'CUSTOMER',
    staffTask: undefined,
    specialization: undefined,
    introduction: undefined,
    yearsOfExperience: undefined,
    status: 'ACTIVE',
    paymentFailStreak: 0,
    createdAt: faker.date.past({ years: 2 }).toISOString(),
    updatedAt: faker.date.recent().toISOString(),
    mediaFiles: [
      {
        mediaFileId: faker.number.int({ min: 1, max: 9999 }),
        fileUrl: avatarUrl,
        fileKey: faker.string.alphanumeric(32),
        fileSize: faker.number.int({ min: 10000, max: 500000 }),
        fileType: 'IMAGE',
        mediaPurpose: 'USER_PROFILE',
        mediaStatus: 'ACTIVE',
        bookingMediaType: undefined
      }
    ],
    ...overrides
  }
}

export function createApiResponse<T>(data: T) {
  return {
    code: 0,
    message: 'Success',
    success: true,
    data,
    timestamp: new Date().toISOString()
  }
}
