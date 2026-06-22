import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTeachersContext } from './teachers-provider'

export function TeachersPrimaryButtons() {
  const { open } = useTeachersContext()
  return (
    <Button size='sm' className='gap-1.5' onClick={() => open('add')}>
      <Plus size={14} />
      Add Teacher
    </Button>
  )
}
