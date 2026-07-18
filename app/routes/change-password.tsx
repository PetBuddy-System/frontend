import { ChangePasswordPage } from '~/features/auth'

import type { Route } from './+types/change-password'

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Doi mat khau' }]
}

export default function ChangePassword() {
  return <ChangePasswordPage />
}
