import { useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router'
import { useAuth } from '~/providers/auth-provider'

export default function StaffLayout() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        void navigate('/login')
      } else if (user?.role !== 'STAFF') {
        void navigate('/')
      }
    }
  }, [isLoading, isAuthenticated, user, navigate])

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

  if (!isAuthenticated || user?.role !== 'STAFF') {
    return null
  }

  return <Outlet />
}
