import { http, HttpResponse } from 'msw'

import { env } from '~/shared/config/env'
import { createUserProfile, createApiResponse } from '../factories/user.factory'
import type { UserProfile } from '../factories/user.factory'

const BASE = env.API_URL || ''

/**
 * Mock handler cho /api/users/me
 * GET  — trả về thông tin user hiện tại.
 * PUT  — cập nhật thông tin (fullName, dateOfBirth, gender, mediaFiles).
 *        Email KHÔNG được phép sửa.
 */
export const userProfileHandlers = [
  // GET /api/users/me
  http.get(`${BASE}/api/users/me`, () => {
    const user = createUserProfile()
    return HttpResponse.json(createApiResponse(user))
  }),

  // PUT /api/users/me
  http.put(`${BASE}/api/users/me`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>

    // Email KHÔNG BAO GIỜ được sửa
    if ('email' in body) {
      return HttpResponse.json(
        {
          code: 400,
          message: 'Email không được phép thay đổi.',
          success: false,
          data: null
        },
        { status: 400 }
      )
    }

    // Mock BE trả về user đã được cập nhật (merge với body gửi lên)
    const updatedMediaFiles: UserProfile['mediaFiles'] = body.mediaFiles as UserProfile['mediaFiles']
    const updatedUser = createUserProfile({
      fullName: (body.fullName as string) ?? 'Nguyễn Văn An',
      dateOfBirth: (body.dateOfBirth as string) ?? '1992-05-15',
      gender: (body.gender as string) ?? 'MALE',
      mediaFiles: updatedMediaFiles ?? [
        {
          mediaFileId: 1,
          fileUrl: 'https://i.pravatar.cc/150?img=1',
          fileKey: 'updated-avatar-key',
          fileSize: 12345,
          fileType: 'IMAGE',
          mediaPurpose: 'USER_PROFILE',
          mediaStatus: 'ACTIVE'
        }
      ]
    })

    return HttpResponse.json(createApiResponse(updatedUser))
  })
]
