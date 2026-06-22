import { TeacherActionDialog } from './teacher-action-dialog'
import { TeacherDeleteDialog } from './teacher-delete-dialog'
import { TeacherLoginDialog } from './teacher-login-dialog'
import { useTeachersContext } from './teachers-provider'

export function TeachersDialogs() {
  const { dialogType, teacher, onOpenChange } = useTeachersContext()

  return (
    <>
      {/* Add / Edit */}
      <TeacherActionDialog
        open={dialogType === 'add' || dialogType === 'edit'}
        onOpenChange={onOpenChange}
        teacher={teacher ?? undefined}
      />

      {/* Login management */}
      {teacher && (
        <TeacherLoginDialog
          open={dialogType === 'login'}
          onOpenChange={onOpenChange}
          teacher={teacher}
        />
      )}

      {/* Delete confirmation */}
      {teacher && (
        <TeacherDeleteDialog
          open={dialogType === 'delete'}
          onOpenChange={onOpenChange}
          teacher={teacher}
        />
      )}
    </>
  )
}
