import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { TeacherAttendanceDailyPanel } from './components/teacher-attendance-daily-panel'
import { TeacherAttendanceHistoryPanel } from './components/teacher-attendance-history-panel'

export function TeacherAttendances() {
  return (
    <>
      <Header fixed>
        <Search className='me-auto' />
        <ThemeSwitch />
        <ProfileDropdown />
      </Header>

      <Main className='flex flex-1 flex-col gap-5'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>
            Absensi Pengajar
          </h2>
          <p className='text-muted-foreground'>
            Kelola kehadiran pengajar berdasarkan asrama dan slot jadwal.
          </p>
        </div>

        <Tabs defaultValue='daily' className='gap-5'>
          <TabsList>
            <TabsTrigger value='daily'>Absensi Harian</TabsTrigger>
            <TabsTrigger value='history'>Riwayat</TabsTrigger>
          </TabsList>

          <TabsContent value='daily'>
            <TeacherAttendanceDailyPanel />
          </TabsContent>

          <TabsContent value='history'>
            <TeacherAttendanceHistoryPanel />
          </TabsContent>
        </Tabs>
      </Main>
    </>
  )
}
