/**
 * Validation utilities for forms
 * Following project naming conventions and TypeScript strict mode
 */

// DEV ONLY: Test accounts exception - REMOVE BEFORE PRODUCTION
const DEV_TEST_ACCOUNTS = ['user', 'staff', 'manager', 'admin'] as const
const isDevTestAccount = (password: string) =>
  DEV_TEST_ACCOUNTS.includes(password.toLowerCase() as (typeof DEV_TEST_ACCOUNTS)[number])

export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

export const PASSWORD_MIN_LENGTH = 8

export const isValidEmail = (email: string): boolean => {
  return EMAIL_REGEX.test(email.trim())
}

export const isValidPassword = (password: string): boolean => {
  return password.length >= PASSWORD_MIN_LENGTH
}

export const isStrongPassword = (password: string): boolean => {
  if (password.length < PASSWORD_MIN_LENGTH) return false
  const hasUpperCase = /[A-Z]/.test(password)
  const hasLowerCase = /[a-z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  return hasUpperCase && hasLowerCase && hasNumber
}

export const validateEmail = (
  email: string,
): { valid: boolean; message?: string } => {
  const trimmed = email.trim()

  if (!trimmed) {
    return { valid: false, message: 'Email không được để trống' }
  }

  if (!isValidEmail(trimmed)) {
    return { valid: false, message: 'Email không đúng định dạng' }
  }

  return { valid: true }
}

export const validatePassword = (
  password: string,
  _email?: string,
): { valid: boolean; message?: string } => {
  if (!password) {
    return { valid: false, message: 'Mật khẩu không được để trống' }
  }

  // DEV ONLY: Allow test accounts (user, staff, manager, admin)
  if (isDevTestAccount(password)) {
    return { valid: true }
  }

  if (password.length < PASSWORD_MIN_LENGTH) {
    return {
      valid: false,
      message: `Mật khẩu phải có ít nhất ${PASSWORD_MIN_LENGTH} ký tự`,
    }
  }

  return { valid: true }
}

export const validateStrongPassword = (
  password: string,
  _email?: string,
): { valid: boolean; message?: string } => {
  if (!password) {
    return { valid: false, message: 'Mật khẩu không được để trống' }
  }

  // DEV ONLY: Allow test accounts (user, staff, manager, admin)
  if (isDevTestAccount(password)) {
    return { valid: true }
  }

  if (password.length < PASSWORD_MIN_LENGTH) {
    return {
      valid: false,
      message: `Mật khẩu phải có ít nhất ${PASSWORD_MIN_LENGTH} ký tự`,
    }
  }

  if (!isStrongPassword(password)) {
    return {
      valid: false,
      message:
        'Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 số',
    }
  }

  return { valid: true }
}

export const validateConfirmPassword = (
  password: string,
  confirmPassword: string,
): { valid: boolean; message?: string } => {
  if (!confirmPassword) {
    return { valid: false, message: 'Vui lòng xác nhận mật khẩu' }
  }

  if (password !== confirmPassword) {
    return { valid: false, message: 'Mật khẩu xác nhận không khớp' }
  }

  return { valid: true }
}

export const validateFullName = (
  fullName: string,
): { valid: boolean; message?: string } => {
  const trimmed = fullName.trim()

  if (!trimmed) {
    return { valid: false, message: 'Họ tên không được để trống' }
  }

  if (trimmed.length < 2) {
    return { valid: false, message: 'Họ tên phải có ít nhất 2 ký tự' }
  }

  return { valid: true }
}
