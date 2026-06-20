import type {
  AbsenceRosterItem,
  AbsenceStatus,
} from '../services/absence-service'

export interface AbsenceDraftItem {
  studentId: string
  studentName: string
  studentNis: string
  status: AbsenceStatus
  note: string
  source?: 'absence' | 'permit' | 'default'
  permit?: AbsenceRosterItem['permit']
}

export const ABSENCE_STATUS_OPTIONS: Array<{
  value: AbsenceStatus
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

export function getAbsenceStatusLabel(status: AbsenceStatus) {
  return (
    ABSENCE_STATUS_OPTIONS.find((option) => option.value === status)?.label ??
    status
  )
}

export function toAbsenceDraftItems(
  items: AbsenceRosterItem[]
): AbsenceDraftItem[] {
  return items.map((item) => ({
    studentId: item.studentId,
    studentName: item.studentName,
    studentNis: item.studentNis,
    status: item.status,
    note: item.note ?? '',
    source: item.source,
    permit: item.permit,
  }))
}

export function getAbsenceSessionStateKey(items: AbsenceRosterItem[]) {
  return items
    .map(
      (item) =>
        `${item.studentId}:${item.status}:${item.note ?? ''}:${item.absenceId ?? ''}`
    )
    .join('|')
}

export function getTodayInJakarta() {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date())

  const year = parts.find((part) => part.type === 'year')?.value ?? ''
  const month = parts.find((part) => part.type === 'month')?.value ?? ''
  const day = parts.find((part) => part.type === 'day')?.value ?? ''

  return `${year}-${month}-${day}`
}

export function getJakartaDayOfWeek() {
  const today = getTodayInJakarta()
  const [year, month, day] = today.split('-').map(Number)

  return new Date(Date.UTC(year, month - 1, day)).getUTCDay()
}
