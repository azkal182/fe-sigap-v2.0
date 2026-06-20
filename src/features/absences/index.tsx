'use client'

import { AlertCircle, CalendarClock, RefreshCw } from 'lucide-react'
import { getApiErrorMessage } from '@/lib/api-response'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { AbsenceHistoryPanel } from './components/absence-history-panel'
import { AbsenceSessionBanner } from './components/absence-session-banner'
import { AbsenceSessionContent } from './components/absence-session-content'
import { ManualAbsencePanel } from './components/manual-absence-panel'
import { useMyCurrentAbsenceSession } from './hooks/use-absences'
import { getAbsenceSessionStateKey } from './utils/absence-utils'

export function Absences() {
  const sessionQuery = useMyCurrentAbsenceSession()
  const session = sessionQuery.data?.activeSession ?? null

  return (
    <>
      <Header fixed>
        <Search className='me-auto' />
        <ThemeSwitch />
        <ProfileDropdown />
      </Header>

      <Main className='flex flex-1 flex-col gap-5'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>Absensi Santri</h2>
          <p className='text-muted-foreground'>
            Kelola kehadiran santri berdasarkan sesi jadwal aktif hari ini.
          </p>
        </div>

        <Tabs defaultValue='my-session' className='gap-5'>
          <TabsList>
            <TabsTrigger value='my-session'>Sesi Saya</TabsTrigger>
            <TabsTrigger value='manual'>Manual</TabsTrigger>
            <TabsTrigger value='history'>Riwayat</TabsTrigger>
          </TabsList>

          <TabsContent value='my-session' className='space-y-5'>
            {sessionQuery.isLoading && <AbsencePageSkeleton />}

            {sessionQuery.isError && (
              <Alert variant='destructive'>
                <AlertCircle />
                <AlertTitle>Gagal memuat sesi absensi</AlertTitle>
                <AlertDescription>
                  {getApiErrorMessage(
                    sessionQuery.error,
                    'Silakan coba muat ulang halaman.'
                  )}
                </AlertDescription>
              </Alert>
            )}

            {!sessionQuery.isLoading && !sessionQuery.isError && !session && (
              <Alert>
                <CalendarClock />
                <AlertTitle>Tidak ada sesi absensi aktif</AlertTitle>
                <AlertDescription>
                  {sessionQuery.data?.reason ??
                    'Saat ini belum ada jadwal aktif yang bisa diabsenkan.'}
                </AlertDescription>
                <div className='col-start-2 mt-2'>
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    onClick={() => sessionQuery.refetch()}
                  >
                    <RefreshCw />
                    Muat Ulang
                  </Button>
                </div>
              </Alert>
            )}

            {session && (
              <>
                <AbsenceSessionBanner session={session} />
                <AbsenceSessionContent
                  key={`${session.schedule.id}:${session.absentDate}:${getAbsenceSessionStateKey(session.items)}`}
                  session={session}
                />
              </>
            )}
          </TabsContent>

          <TabsContent value='manual'>
            <ManualAbsencePanel />
          </TabsContent>

          <TabsContent value='history'>
            <AbsenceHistoryPanel />
          </TabsContent>
        </Tabs>
      </Main>
    </>
  )
}

function AbsencePageSkeleton() {
  return (
    <div className='space-y-4'>
      <Skeleton className='h-36 rounded-lg' />
      <Skeleton className='h-80 rounded-lg' />
    </div>
  )
}
