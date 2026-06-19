import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { type Dormitory } from '../services/dormitory-service'

type DormitoriesDialogType = 'add' | 'edit' | 'delete'

type DormitoriesContextType = {
  open: DormitoriesDialogType | null
  setOpen: (str: DormitoriesDialogType | null) => void
  currentRow: Dormitory | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Dormitory | null>>
}

const DormitoriesContext = React.createContext<DormitoriesContextType | null>(
  null
)

export function DormitoriesProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [open, setOpen] = useDialogState<DormitoriesDialogType>(null)
  const [currentRow, setCurrentRow] = useState<Dormitory | null>(null)

  return (
    <DormitoriesContext value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </DormitoriesContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useDormitoriesContext = () => {
  const ctx = React.useContext(DormitoriesContext)
  if (!ctx)
    throw new Error(
      'useDormitoriesContext must be used within <DormitoriesProvider>'
    )
  return ctx
}
