import { createFileRoute, Outlet } from '@tanstack/react-router'

// Layout route — just renders the outlet so sub-routes still work if needed
export const Route = createFileRoute('/_authenticated/settings')({
  component: () => <Outlet />,
})
