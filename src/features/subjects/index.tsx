import { useState } from 'react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { SubjectContextBanner } from './components/subject-context-banner'
import {
  SubjectFilterBar,
  type SubjectFilter,
} from './components/subject-filter-bar'
import { SubjectListCard } from './components/subject-list-card'

const INITIAL_FILTER: SubjectFilter = {
  dormitoryId: undefined,
  trackId: undefined,
  dormitory: undefined,
  track: undefined,
}

export function Subjects() {
  const [filter, setFilter] = useState<SubjectFilter>(INITIAL_FILTER)

  return (
    <>
      <Header fixed>
        <Search className='me-auto' />
        <ThemeSwitch />
        <ProfileDropdown />
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        {/* Page title */}
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>Subjects</h2>
          <p className='text-muted-foreground'>
            Manage subjects linked to tracks and dormitories.
          </p>
        </div>

        {/* Context banner (left) + Filter bar (right) */}
        <div className='flex flex-wrap items-start justify-between gap-4'>
          <div className='max-w-xs min-w-56 flex-1'>
            <SubjectContextBanner filter={filter} />
          </div>
          <div className='flex flex-col items-end gap-2'>
            <SubjectFilterBar value={filter} onChange={(f) => setFilter(f)} />
          </div>
        </div>

        {/* Subject table */}
        <SubjectListCard filter={filter} />
      </Main>
    </>
  )
}
