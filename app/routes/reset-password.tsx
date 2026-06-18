import { ResetPasswordPage } from '~/features/auth'

import type { Route } from './+types/reset-password'

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Đặt lại mật khẩu - PetBuddy' }]
}

export default function ResetPassword() {
  return <ResetPasswordPage />
}
