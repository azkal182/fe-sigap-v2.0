import { useAuthStore } from '@/stores/auth-store'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { DashboardOverview } from './components/overview'

export function Dashboard() {
  const { user } = useAuthStore((s) => s.auth)

  const greeting = () => {
    const hour = new Date().getHours()
    if (hour < 11) return 'Selamat Pagi'
    if (hour < 15) return 'Selamat Siang'
    if (hour < 18) return 'Selamat Sore'
    return 'Selamat Malam'
  }

  return (
    <>
      <Header fixed>
        <Search className='me-auto' />
        <ThemeSwitch />
        <ProfileDropdown />
      </Header>

      <Main className='flex flex-1 flex-col gap-6'>
        {/* Page header */}
        <div className='flex flex-wrap items-start justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>
              {greeting()}, {user?.name?.split(' ')[0] ?? 'Admin'} 👋
            </h2>
            <p className='text-muted-foreground'>
              Berikut ringkasan data sistem SIGAP hari ini.
            </p>
          </div>
          <div className='rounded-md border bg-muted/40 px-3 py-1.5 text-xs text-muted-foreground'>
            {new Date().toLocaleDateString('id-ID', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </div>
        </div>

        <DashboardOverview />
      </Main>
    </>
  )
}
