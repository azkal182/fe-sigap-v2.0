'use client'

import { useEffect } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { getApiErrorMessage } from '@/lib/api-response'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { SelectDropdown } from '@/components/select-dropdown'
import {
  useCreateDormitory,
  useUpdateDormitory,
} from '../hooks/use-dormitories'
import { type Dormitory } from '../services/dormitory-service'

const GENDER_OPTIONS = [
  { label: 'Putra (Male)', value: 'PUTRA' },
  { label: 'Putri (Female)', value: 'PUTRI' },
]

const LEVEL_OPTIONS = Array.from({ length: 6 }, (_, i) => ({
  label: `Level ${i + 1}`,
  value: String(i + 1),
}))

const formSchema = z.object({
  name: z.string().min(1, 'Dormitory name is required.').max(100),
  level: z.string().min(1, 'Level is required.'),
  gender: z.enum(['PUTRA', 'PUTRI'], {
    error: () => 'Gender is required.',
  }),
  isActive: z.boolean().optional(),
})

type DormitoryForm = z.infer<typeof formSchema>

type DormitoriesActionDialogProps = {
  currentRow?: Dormitory
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DormitoriesActionDialog({
  currentRow,
  open,
  onOpenChange,
}: DormitoriesActionDialogProps) {
  const isEdit = !!currentRow
  const createDormitory = useCreateDormitory()
  const updateDormitory = useUpdateDormitory()
  const isPending = createDormitory.isPending || updateDormitory.isPending

  const form = useForm<DormitoryForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      level: '1',
      gender: 'PUTRA',
      isActive: true,
    },
  })

  // Sync form values when editing a different row
  useEffect(() => {
    if (open && currentRow) {
      form.reset({
        name: currentRow.name,
        level: String(currentRow.level),
        gender: currentRow.gender,
        isActive: currentRow.isActive,
      })
    } else if (!open) {
      form.reset({
        name: '',
        level: '1',
        gender: 'PUTRA',
        isActive: true,
      })
    }
  }, [open, currentRow, form])

  const onSubmit = async (values: DormitoryForm) => {
    try {
      if (isEdit && currentRow) {
        await updateDormitory.mutateAsync({
          id: currentRow.id,
          dto: {
            name: values.name,
            level: Number(values.level),
            gender: values.gender,
            isActive: values.isActive,
          },
        })
        toast.success(`Dormitory "${values.name}" updated`)
      } else {
        await createDormitory.mutateAsync({
          name: values.name,
          level: Number(values.level),
          gender: values.gender,
        })
        toast.success(`Dormitory "${values.name}" created`)
      }
      onOpenChange(false)
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, 'Failed to save dormitory'))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader className='text-start'>
          <DialogTitle>
            {isEdit ? 'Edit Dormitory' : 'Add New Dormitory'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update dormitory information below.'
              : 'Fill in the details to create a new dormitory.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            id='dormitory-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='space-y-4'
          >
            {/* Name */}
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dormitory Name</FormLabel>
                  <FormControl>
                    <Input placeholder='e.g. Al-Farabi Dormitory' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Level + Gender side by side */}
            <div className='grid grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='level'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Level</FormLabel>
                    <SelectDropdown
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                      placeholder='Select level'
                      items={LEVEL_OPTIONS}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='gender'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender</FormLabel>
                    <SelectDropdown
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                      placeholder='Select gender'
                      items={GENDER_OPTIONS}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* isActive — only shown when editing */}
            {isEdit && (
              <FormField
                control={form.control}
                name='isActive'
                render={({ field }) => (
                  <FormItem className='flex items-center justify-between rounded-lg border px-4 py-3'>
                    <div>
                      <FormLabel className='text-sm font-medium'>
                        Active Status
                      </FormLabel>
                      <p className='text-xs text-muted-foreground'>
                        Inactive dormitories won&apos;t appear for students.
                      </p>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            )}
          </form>
        </Form>

        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type='submit' form='dormitory-form' disabled={isPending}>
            {isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
            {isEdit ? 'Save changes' : 'Create dormitory'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
