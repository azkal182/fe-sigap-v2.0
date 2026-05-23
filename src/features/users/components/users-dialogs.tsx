import { UsersActionDialog } from './users-action-dialog'
import { UsersDeleteDialog } from './users-delete-dialog'
import { UsersPermissionsDialog } from './users-permissions-dialog'
import { UsersScopesDialog } from './users-scopes-dialog'
import { useUsers } from './users-provider'

export function UsersDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useUsers()

  const handleClose = (dialogType: typeof open) => (state: boolean) => {
    if (!state) {
      setOpen(null)
      // Delay clearing currentRow to allow close animation to finish
      setTimeout(() => {
        setCurrentRow(null)
      }, 500)
    } else {
      setOpen(dialogType)
    }
  }

  return (
    <>
      {/* Add User */}
      <UsersActionDialog
        key='user-add'
        open={open === 'add'}
        onOpenChange={(state) => {
          if (!state) setOpen(null)
          else setOpen('add')
        }}
      />

      {/* Edit / Delete / Permissions / Scopes — require currentRow */}
      {currentRow && (
        <>
          <UsersActionDialog
            key={`user-edit-${currentRow.id}`}
            open={open === 'edit'}
            onOpenChange={handleClose('edit')}
            currentRow={currentRow}
          />

          <UsersDeleteDialog
            key={`user-delete-${currentRow.id}`}
            open={open === 'delete'}
            onOpenChange={handleClose('delete')}
            currentRow={currentRow}
          />

          <UsersPermissionsDialog
            key={`user-permissions-${currentRow.id}`}
            open={open === 'permissions'}
            onOpenChange={handleClose('permissions')}
            currentRow={currentRow}
          />

          <UsersScopesDialog
            key={`user-scopes-${currentRow.id}`}
            open={open === 'scopes'}
            onOpenChange={handleClose('scopes')}
            currentRow={currentRow}
          />
        </>
      )}
    </>
  )
}
