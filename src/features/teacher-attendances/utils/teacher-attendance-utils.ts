import type {
  TeacherAttendanceDailyItem,
  TeacherAttendanceStatus,
} from '../services/teacher-attendance-service'

export interface TeacherAttendanceDraftItem {
  teacherId: string
  teacherName: string
  scheduleId: string
  className: string
  subjectName: string
  slot: number
  startTime: string
  endTime: string
  status: TeacherAttendanceStatus
  note: string
  source: 'attendance' | 'empty'
  teacherAttendanceId: string | null
}

export const TEACHER_ATTENDANCE_STATUS_OPTIONS: Array<{
  value: TeacherAttendanceStatus
  label: string
  className: string
}> = [
  {
    value: 'PRESENT',
    label: 'Hadir',
    className:
      'data-[active=true]:bg-emerald-600 data-[active=true]:text-white',
  },
  {
    value: 'SICK',
    label: 'Sakit',
    className: 'data-[active=true]:bg-amber-500 data-[active=true]:text-white',
  },
  {
    value: 'PERMIT',
    label: 'Izin',
    className: 'data-[active=true]:bg-sky-600 data-[active=true]:text-white',
  },
  {
    value: 'ABSENT',
    label: 'Alpha',
    className:
      'data-[active=true]:bg-destructive data-[active=true]:text-white',
  },
]

export function getTeacherAttendanceStatusLabel(
  status: TeacherAttendanceStatus
) {
  return (
    TEACHER_ATTENDANCE_STATUS_OPTIONS.find((o) => o.value === status)?.label ??
    status
  )
}

export function toTeacherAttendanceDraftItems(
  items: TeacherAttendanceDailyItem[]
): TeacherAttendanceDraftItem[] {
  return items.map((item) => ({
    teacherId: item.teacherId,
    teacherName: item.teacherName,
    scheduleId: item.scheduleId,
    className: item.class.name,
    subjectName: item.subject.name,
    slot: item.scheduleSlot.slot,
    startTime: item.scheduleSlot.startTime,
    endTime: item.scheduleSlot.endTime,
    // Default PRESENT for empty entries, preserve existing status
    status: item.status ?? 'PRESENT',
    note: item.note ?? '',
    source: item.source,
    teacherAttendanceId: item.teacherAttendanceId,
  }))
}

export function getTodayInJakarta() {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date())

  const year = parts.find((p) => p.type === 'year')?.value ?? ''
  const month = parts.find((p) => p.type === 'month')?.value ?? ''
  const day = parts.find((p) => p.type === 'day')?.value ?? ''
  return `${year}-${month}-${day}`
}
