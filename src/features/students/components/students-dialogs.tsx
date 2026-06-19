import { StudentsActionDialog } from './students-action-dialog'
import { StudentsDeleteDialog } from './students-delete-dialog'
import { useStudentsContext } from './students-provider'

export function StudentsDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useStudentsContext()

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
      <StudentsActionDialog
        key='student-add'
        open={open === 'add'}
        onOpenChange={(state) => {
          if (!state) setOpen(null)
          else setOpen('add')
        }}
      />

      {currentRow && (
        <>
          <StudentsActionDialog
            key={`student-edit-${currentRow.id}`}
            open={open === 'edit'}
            onOpenChange={handleClose('edit')}
            currentRow={currentRow}
          />

          <StudentsDeleteDialog
            key={`student-delete-${currentRow.id}`}
            open={open === 'delete'}
            onOpenChange={handleClose('delete')}
            currentRow={currentRow}
          />
        </>
      )}
    </>
  )
}
