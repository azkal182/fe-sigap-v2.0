import { DormitoriesActionDialog } from './dormitories-action-dialog'
import { DormitoriesDeleteDialog } from './dormitories-delete-dialog'
import { useDormitoriesContext } from './dormitories-provider'

export function DormitoriesDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useDormitoriesContext()

  const handleClose =
    (dialogType: typeof open) => (state: boolean) => {
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
      <DormitoriesActionDialog
        key='dormitory-add'
        open={open === 'add'}
        onOpenChange={(state) => {
          if (!state) setOpen(null)
          else setOpen('add')
        }}
      />

      {/* Edit / Delete — require currentRow */}
      {currentRow && (
        <>
          <DormitoriesActionDialog
            key={`dormitory-edit-${currentRow.id}`}
            open={open === 'edit'}
            onOpenChange={handleClose('edit')}
            currentRow={currentRow}
          />

          <DormitoriesDeleteDialog
            key={`dormitory-delete-${currentRow.id}`}
            open={open === 'delete'}
            onOpenChange={handleClose('delete')}
            currentRow={currentRow}
          />
        </>
      )}
    </>
  )
}
