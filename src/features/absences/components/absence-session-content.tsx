import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { getApiErrorMessage } from '@/lib/api-response'
import { useUpsertClassroomDailyAbsence } from '../hooks/use-absences'
import type {
  AbsenceStatus,
  CurrentAbsenceSession,
} from '../services/absence-service'
import {
  toAbsenceDraftItems,
  type AbsenceDraftItem,
} from '../utils/absence-utils'
import { AbsenceRosterTable } from './absence-roster-table'

interface AbsenceSessionContentProps {
  session: CurrentAbsenceSession
}

export function AbsenceSessionContent({ session }: AbsenceSessionContentProps) {
  const [items, setItems] = useState<AbsenceDraftItem[]>(() =>
    toAbsenceDraftItems(session.items)
  )
  const upsertAbsence = useUpsertClassroomDailyAbsence()

  const payloadItems = useMemo(
    () =>
      items.map((item) => ({
        studentId: item.studentId,
        status: item.status,
        note: item.note.trim() || undefined,
      })),
    [items]
  )

  const handleChangeStatus = (studentId: string, status: AbsenceStatus) => {
    setItems((current) =>
      current.map((item) =>
        item.studentId === studentId ? { ...item, status } : item
      )
    )
  }

  const handleChangeNote = (studentId: string, note: string) => {
    setItems((current) =>
      current.map((item) =>
        item.studentId === studentId ? { ...item, note } : item
      )
    )
  }

  const handleMarkAllPresent = () => {
    setItems((current) =>
      current.map((item) => ({ ...item, status: 'PRESENT' }))
    )
  }

  const handleSubmit = async () => {
    try {
      await upsertAbsence.mutateAsync({
        classId: session.class.id,
        scheduleSlotId: session.scheduleSlot.id,
        absentDate: session.absentDate,
        items: payloadItems,
      })
      toast.success('Absensi berhasil disimpan.')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Gagal menyimpan absensi.'))
    }
  }

  return (
    <AbsenceRosterTable
      items={items}
      isSubmitting={upsertAbsence.isPending}
      onChangeStatus={handleChangeStatus}
      onChangeNote={handleChangeNote}
      onMarkAllPresent={handleMarkAllPresent}
      onSubmit={handleSubmit}
    />
  )
}
