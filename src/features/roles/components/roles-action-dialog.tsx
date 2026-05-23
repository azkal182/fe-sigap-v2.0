'use client'

import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
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
import { Textarea } from '@/components/ui/textarea'
import { type Role } from '../services/role-service'
import { useCreateRole, useUpdateRole } from '../hooks/use-roles'

const formSchema = z.object({
  name: z.string().min(1, 'Role name is required.').max(50),
  description: z.string().max(200).optional(),
})

type RoleForm = z.infer<typeof formSchema>

type RolesActionDialogProps = {
  currentRow?: Role
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function RolesActionDialog({
  currentRow,
  open,
  onOpenChange,
}: RolesActionDialogProps) {
  const isEdit = !!currentRow
  const createRole = useCreateRole()
  const updateRole = useUpdateRole()
  const isPending = createRole.isPending || updateRole.isPending

  const form = useForm<RoleForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: currentRow?.name ?? '',
      description: currentRow?.description ?? '',
    },
  })

  const onSubmit = async (values: RoleForm) => {
    try {
      if (isEdit && currentRow) {
        await updateRole.mutateAsync({ id: currentRow.id, dto: values })
        toast.success('Role updated successfully')
      } else {
        await createRole.mutateAsync(values)
        toast.success('Role created successfully')
      }
      form.reset()
      onOpenChange(false)
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to save role')
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        if (!state) form.reset()
        onOpenChange(state)
      }}
    >
      <DialogContent className='sm:max-w-md'>
        <DialogHeader className='text-start'>
          <DialogTitle>{isEdit ? 'Edit Role' : 'Add New Role'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update role name or description.'
              : 'Create a new custom role.'}{' '}
            Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            id='role-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='space-y-4'
          >
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role Name</FormLabel>
                  <FormControl>
                    <Input placeholder='e.g. Editor' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='description'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='Describe what this role can do...'
                      className='resize-none'
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>

        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type='submit' form='role-form' disabled={isPending}>
            {isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
