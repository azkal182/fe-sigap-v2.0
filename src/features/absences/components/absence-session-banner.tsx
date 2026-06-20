import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import type { CurrentAbsenceSession } from '../services/absence-service'

interface AbsenceSessionBannerProps {
  session: CurrentAbsenceSession
}

export function AbsenceSessionBanner({ session }: AbsenceSessionBannerProps) {
  return (
    <Card className='gap-4 py-5'>
      <CardHeader className='gap-2'>
        <div className='flex flex-wrap items-start justify-between gap-3'>
          <div className='space-y-1'>
            <CardTitle className='text-lg'>{session.class.name}</CardTitle>
            <CardDescription>
              {session.subject.name} bersama {session.teacher.name}
            </CardDescription>
          </div>
          <Badge variant='secondary'>Hari ini</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <dl className='grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4'>
          <div>
            <dt className='text-muted-foreground'>Tanggal</dt>
            <dd className='font-medium'>{session.absentDate}</dd>
          </div>
          <div>
            <dt className='text-muted-foreground'>Jam Pelajaran</dt>
            <dd className='font-medium'>
              Slot {session.scheduleSlot.slot}, {session.scheduleSlot.startTime}
              -{session.scheduleSlot.endTime}
            </dd>
          </div>
          <div>
            <dt className='text-muted-foreground'>Asrama</dt>
            <dd className='font-medium'>
              {session.dormitory.name ?? 'Belum diatur'}
            </dd>
          </div>
          <div>
            <dt className='text-muted-foreground'>Tingkat</dt>
            <dd className='font-medium'>
              {session.track.name ?? 'Belum diatur'}
            </dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  )
}
