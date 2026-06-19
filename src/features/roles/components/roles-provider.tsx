import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { type Role } from '../services/role-service'

type RolesDialogType = 'add' | 'edit' | 'delete' | 'permissions'

type RolesContextType = {
  open: RolesDialogType | null
  setOpen: (str: RolesDialogType | null) => void
  currentRow: Role | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Role | null>>
}

const RolesContext = React.createContext<RolesContextType | null>(null)

export function RolesProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<RolesDialogType>(null)
  const [currentRow, setCurrentRow] = useState<Role | null>(null)

  return (
    <RolesContext value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </RolesContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useRolesContext = () => {
  const ctx = React.useContext(RolesContext)
  if (!ctx)
    throw new Error('useRolesContext must be used within <RolesProvider>')
  return ctx
}
