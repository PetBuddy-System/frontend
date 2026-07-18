import { OAuthCallbackPage } from '~/features/auth'

import type { Route } from './+types/oauth2-success'

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Dang nhap voi Google' }]
}

export default function OAuth2Success() {
  return <OAuthCallbackPage />
}
