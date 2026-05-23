import { RolesActionDialog } from './roles-action-dialog'
import { RolesDeleteDialog } from './roles-delete-dialog'
import { RolesPermissionsDialog } from './roles-permissions-dialog'
import { useRolesContext } from './roles-provider'

export function RolesDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useRolesContext()

  const handleClose = (dialogType: typeof open) => (state: boolean) => {
    if (!state) {
      setOpen(null)
      setTimeout(() => setCurrentRow(null), 500)
    } else {
      setOpen(dialogType)
    }
  }

  return (
    <>
      {/* Add */}
      <RolesActionDialog
        key='role-add'
        open={open === 'add'}
        onOpenChange={(state) => {
          if (!state) setOpen(null)
          else setOpen('add')
        }}
      />

      {/* Edit / Delete / Permissions — require currentRow */}
      {currentRow && (
        <>
          <RolesActionDialog
            key={`role-edit-${currentRow.id}`}
            open={open === 'edit'}
            onOpenChange={handleClose('edit')}
            currentRow={currentRow}
          />

          <RolesDeleteDialog
            key={`role-delete-${currentRow.id}`}
            open={open === 'delete'}
            onOpenChange={handleClose('delete')}
            currentRow={currentRow}
          />

          <RolesPermissionsDialog
            key={`role-permissions-${currentRow.id}`}
            open={open === 'permissions'}
            onOpenChange={handleClose('permissions')}
            currentRow={currentRow}
          />
        </>
      )}
    </>
  )
}
