import { LoginPage } from '~/features/auth'

import type { Route } from './+types/login'

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Dang nhap' }]
}

export default function Login() {
  return <LoginPage />
}
