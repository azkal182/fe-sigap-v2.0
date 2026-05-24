import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { type Student } from '../services/student-service'

type StudentsDialogType = 'add' | 'edit' | 'delete'

type StudentsContextType = {
  open: StudentsDialogType | null
  setOpen: (str: StudentsDialogType | null) => void
  currentRow: Student | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Student | null>>
}

const StudentsContext = React.createContext<StudentsContextType | null>(null)

export function StudentsProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<StudentsDialogType>(null)
  const [currentRow, setCurrentRow] = useState<Student | null>(null)

  return (
    <StudentsContext value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </StudentsContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useStudentsContext = () => {
  const ctx = React.useContext(StudentsContext)
  if (!ctx)
    throw new Error(
      'useStudentsContext must be used within <StudentsProvider>'
    )
  return ctx
}
