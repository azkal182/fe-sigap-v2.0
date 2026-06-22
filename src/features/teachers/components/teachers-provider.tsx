import React, { createContext, useContext, useState } from 'react'
import type { Teacher } from '../services/teacher-service'

type TeachersDialogType = 'add' | 'edit' | 'delete' | 'login'

interface TeachersContextValue {
  open: (type: TeachersDialogType, teacher?: Teacher) => void
  dialogType: TeachersDialogType | null
  teacher: Teacher | null
  onOpenChange: (open: boolean) => void
}

const TeachersContext = createContext<TeachersContextValue | null>(null)

export function TeachersProvider({ children }: { children: React.ReactNode }) {
  const [dialogType, setDialogType] = useState<TeachersDialogType | null>(null)
  const [teacher, setTeacher] = useState<Teacher | null>(null)

  const open = (type: TeachersDialogType, t?: Teacher) => {
    setTeacher(t ?? null)
    setDialogType(type)
  }

  const onOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setDialogType(null)
      setTeacher(null)
    }
  }

  return (
    <TeachersContext.Provider
      value={{ open, dialogType, teacher, onOpenChange }}
    >
      {children}
    </TeachersContext.Provider>
  )
}

export function useTeachersContext() {
  const ctx = useContext(TeachersContext)
  if (!ctx)
    throw new Error('useTeachersContext must be used within TeachersProvider')
  return ctx
}
