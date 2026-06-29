import { ForgotPasswordPage } from '~/features/auth'

import type { Route } from './+types/forgot-password'

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Quên mật khẩu - PetBuddy' }]
}

export default function ForgotPassword() {
  return <ForgotPasswordPage />
}
