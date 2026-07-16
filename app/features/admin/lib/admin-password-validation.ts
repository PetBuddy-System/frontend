const ADMIN_ACCOUNT_PASSWORD_PATTERN = /^(?=.{8,}$)[A-Z](?=.*\d)(?=.*[^A-Za-z0-9\s]).*$/

export function isValidAdminAccountPassword(password: string) {
  return ADMIN_ACCOUNT_PASSWORD_PATTERN.test(password)
}
