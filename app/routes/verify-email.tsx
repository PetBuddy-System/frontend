import { OtpVerificationPage } from '~/features/auth'

import type { Route } from './+types/verify-email'

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Xác thực OTP - PetBuddy' }]
}

export default function VerifyEmail() {
  return <OtpVerificationPage />
}
