import { createFileRoute, redirect } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/auth-store'
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout'

export const Route = createFileRoute('/_authenticated')({
  // Auth guard: runs on every navigation to any /_authenticated/* route
  beforeLoad: ({ location }) => {
    const accessToken = useAuthStore.getState().auth.accessToken

    if (!accessToken) {
      throw redirect({
        to: '/sign-in',
        search: {
          // Preserve the current URL so we can redirect back after login
          redirect: location.href,
        },
      })
    }
  },
  component: AuthenticatedLayout,
})
