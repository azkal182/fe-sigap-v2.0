'use client'

import { useState } from 'react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { ScheduleContextBanner } from './components/schedule-context-banner'
import {
  ScheduleFilterBar,
  type ScheduleFilter,
} from './components/schedule-filter-bar'
import { ScheduleWeeklyView } from './components/schedule-weekly-view'

const INITIAL_FILTER: ScheduleFilter = {
  dormitoryId: undefined,
  classId: undefined,
  dormitory: undefined,
  classroom: undefined,
}

export function Schedules() {
  const [filter, setFilter] = useState<ScheduleFilter>(INITIAL_FILTER)

  return (
    <>
      <Header fixed>
        <Search className='me-auto' />
        <ThemeSwitch />
        <ProfileDropdown />
      </Header>

      <Main className='flex flex-1 flex-col gap-5'>
        {/* Page title */}
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>Schedules</h2>
          <p className='text-muted-foreground'>
            Manage weekly class schedules across dormitories.
          </p>
        </div>

        {/* Top bar: context (left) + filter (right) */}
        <div className='flex flex-wrap items-start justify-between gap-4'>
          <div className='max-w-xs min-w-56 flex-1'>
            <ScheduleContextBanner filter={filter} />
          </div>
          <div className='flex flex-col items-end gap-2'>
            <ScheduleFilterBar value={filter} onChange={setFilter} />
          </div>
        </div>

        {/* Weekly view */}
        <ScheduleWeeklyView filter={filter} />
      </Main>
    </>
  )
}
