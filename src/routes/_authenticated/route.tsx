import { createFileRoute, redirect } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/auth-store'
import { authService } from '@/features/auth/services/auth-service'
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout'

export const Route = createFileRoute('/_authenticated')({
  // Auth guard: runs on every navigation to any /_authenticated/* route
  beforeLoad: async ({ location }) => {
    const { accessToken, user, setUser } = useAuthStore.getState().auth

    if (!accessToken) {
      throw redirect({
        to: '/sign-in',
        search: {
          // Preserve the current URL so we can redirect back after login
          redirect: location.href,
        },
      })
    }

    // Rehydrate user after hard refresh: token exists in cookie but user is null in memory
    if (!user) {
      try {
        const profile = await authService.getProfile()
        setUser({
          id: profile.id,
          email: profile.email,
          name: profile.name,
          isActive: profile.isActive,
          role: profile.role,
          permissions: profile.permissions,
          teacher: profile.teacher,
          dormitoryScopeIds: profile.dormitoryScopeIds,
          dormitoryScopes: profile.dormitoryScopes,
        })
      } catch {
        // Token invalid/expired — clear and redirect to login
        useAuthStore.getState().auth.reset()
        throw redirect({
          to: '/sign-in',
          search: { redirect: location.href },
        })
      }
    }
  },
  component: AuthenticatedLayout,
})
