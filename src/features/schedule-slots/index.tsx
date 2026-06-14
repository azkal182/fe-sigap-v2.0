import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { ScheduleSlotListCard } from './components/schedule-slot-list-card'

export function ScheduleSlots() {
  return (
    <>
      <Header fixed>
        <Search className='me-auto' />
        <ThemeSwitch />
        <ProfileDropdown />
      </Header>

      <Main className='flex flex-1 flex-col gap-5'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>Schedule Slots</h2>
          <p className='text-muted-foreground'>
            Manage time slot configurations for each dormitory's schedule.
          </p>
        </div>

        <ScheduleSlotListCard />
      </Main>
    </>
  )
}
