import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { ScheduleSlotActionDialog } from './components/schedule-slot-action-dialog'
import { ScheduleSlotListCard } from './components/schedule-slot-list-card'

export function ScheduleSlots() {
  const [addOpen, setAddOpen] = useState(false)

  return (
    <>
      <Header fixed>
        <Search className='me-auto' />
        <ThemeSwitch />
        <ProfileDropdown />
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>
              Schedule Slots
            </h2>
            <p className='text-muted-foreground'>
              Manage time slot configurations for each dormitory's schedule.
            </p>
          </div>
          <Button
            size='sm'
            className='gap-1.5'
            onClick={() => setAddOpen(true)}
          >
            <Plus size={14} />
            Add Slot
          </Button>
        </div>

        <ScheduleSlotListCard />
      </Main>

      {/* Global add dialog — opened from header button */}
      <ScheduleSlotActionDialog open={addOpen} onOpenChange={setAddOpen} />
    </>
  )
}
