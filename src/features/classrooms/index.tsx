'use client'

import { useState } from 'react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { ActiveContextBanner } from './components/active-context-banner'
import { ClassroomDetailPanel } from './components/classroom-detail-panel'
import {
  ClassroomFilterBar,
  type ClassroomFilter,
} from './components/classroom-filter-bar'
import { ClassroomListCard } from './components/classroom-list-card'
import type { Classroom } from './services/classroom-service'

const INITIAL_FILTER: ClassroomFilter = {
  dormitoryId: undefined,
  trackId: undefined,
  dormitory: undefined,
  track: undefined,
}

export function Classrooms() {
  const [filter, setFilter] = useState<ClassroomFilter>(INITIAL_FILTER)
  const [selectedClassroom, setSelectedClassroom] = useState<
    Classroom | undefined
  >()

  const handleSelect = (classroom: Classroom) => {
    // Toggle: click same classroom deselects it
    setSelectedClassroom((prev) =>
      prev?.id === classroom.id ? undefined : classroom
    )
  }

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
          <h2 className='text-2xl font-bold tracking-tight'>Classrooms</h2>
          <p className='text-muted-foreground'>
            Manage classrooms across dormitories and tracks.
          </p>
        </div>

        {/* Top bar: context (left) + filter (right) */}
        <div className='flex flex-wrap items-start justify-between gap-4'>
          <div className='max-w-xs min-w-56 flex-1'>
            <ActiveContextBanner filter={filter} />
          </div>
          <div className='flex flex-col items-end gap-2'>
            <ClassroomFilterBar
              value={filter}
              onChange={(f) => {
                setFilter(f)
                setSelectedClassroom(undefined) // reset detail when filter changes
              }}
            />
          </div>
        </div>

        {/* Classroom list card */}
        <ClassroomListCard
          filter={filter}
          selectedId={selectedClassroom?.id}
          onSelect={handleSelect}
        />

        {/* Detail panel — appears below when a classroom is selected */}
        {selectedClassroom && (
          <ClassroomDetailPanel classroom={selectedClassroom} />
        )}
      </Main>
    </>
  )
}
