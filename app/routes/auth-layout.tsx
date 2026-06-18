import { useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router'
import { useAuth } from '~/providers/auth-provider'

export default function AuthLayout() {
  const { isAuthenticated, isLoading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      void navigate('/login')
    }
  }, [isLoading, isAuthenticated, navigate])

  if (isLoading) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-background text-foreground animate-pulse'>
        <div className='text-center space-y-4'>
          <div className='h-8 w-32 bg-muted rounded mx-auto' />
          <div className='h-4 w-48 bg-muted rounded' />
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return <Outlet />
}
