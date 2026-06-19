'use client'

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
import { PasswordInput } from '@/components/password-input'
import { SelectDropdown } from '@/components/select-dropdown'
import { useRoles, useCreateUser, useUpdateUser } from '../hooks/use-users'
import { type UpdateUserDto, type User } from '../services/user-service'

const formSchema = z
  .object({
    name: z.string().min(1, 'Name is required.'),
    email: z.string().email({
      message: 'Please enter a valid email.',
    }),
    password: z.string().transform((pwd) => pwd.trim()),
    roleId: z.string().min(1, 'Role is required.'),
    confirmPassword: z.string().transform((pwd) => pwd.trim()),
    isEdit: z.boolean(),
  })
  .refine(
    (data) => {
      if (data.isEdit && !data.password) return true
      return data.password.length > 0
    },
    {
      message: 'Password is required.',
      path: ['password'],
    }
  )
  .refine(
    ({ isEdit, password, confirmPassword }) => {
      if (isEdit && !password) return true
      return password === confirmPassword
    },
    {
      message: "Passwords don't match.",
      path: ['confirmPassword'],
    }
  )
type UserForm = z.infer<typeof formSchema>

type UserActionDialogProps = {
  currentRow?: User
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UsersActionDialog({
  currentRow,
  open,
  onOpenChange,
}: UserActionDialogProps) {
  const isEdit = !!currentRow

  // Fetch roles to populate dropdown
  const { data: rolesData, isLoading: isLoadingRoles } = useRoles({
    limit: 100,
  })
  const roles = rolesData?.data || []

  const createUser = useCreateUser()
  const updateUser = useUpdateUser()

  const form = useForm<UserForm>({
    resolver: zodResolver(formSchema),
    defaultValues: isEdit
      ? {
          name: currentRow.name || '',
          email: currentRow.email || '',
          roleId: currentRow.role?.id || '',
          password: '',
          confirmPassword: '',
          isEdit,
        }
      : {
          name: '',
          email: '',
          roleId: '',
          password: '',
          confirmPassword: '',
          isEdit,
        },
  })

  const onSubmit = async (values: UserForm) => {
    try {
      if (isEdit && currentRow) {
        // Prepare update payload
        const payload: UpdateUserDto = {
          name: values.name,
          email: values.email,
          roleId: values.roleId,
        }
        if (values.password) {
          payload.password = values.password
        }
        await updateUser.mutateAsync({ id: currentRow.id, data: payload })
        toast.success('User updated successfully')
      } else {
        await createUser.mutateAsync({
          name: values.name,
          email: values.email,
          password: values.password,
          roleId: values.roleId,
        })
        toast.success('User created successfully')
      }
      form.reset()
      onOpenChange(false)
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, 'Failed to save user'))
    }
  }

  const isPasswordTouched = !!form.formState.dirtyFields.password
  const isPending = createUser.isPending || updateUser.isPending

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        if (!state) form.reset()
        onOpenChange(state)
      }}
    >
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader className='text-start'>
          <DialogTitle>{isEdit ? 'Edit User' : 'Add New User'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update the user here. ' : 'Create new user here. '}
            Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <div className='h-105 w-[calc(100%+0.75rem)] overflow-y-auto py-1 pe-3'>
          <Form {...form}>
            <form
              id='user-form'
              onSubmit={form.handleSubmit(onSubmit)}
              className='space-y-4 px-0.5'
            >
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='John Doe'
                        className='col-span-4'
                        autoComplete='off'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='email'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='john.doe@example.com'
                        className='col-span-4'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='roleId'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>Role</FormLabel>
                    {isLoadingRoles ? (
                      <div className='col-span-4 flex h-10 items-center rounded-md border bg-muted px-3 py-2 text-sm text-muted-foreground'>
                        Loading roles...
                      </div>
                    ) : (
                      <SelectDropdown
                        defaultValue={field.value}
                        onValueChange={field.onChange}
                        placeholder='Select a role'
                        className='col-span-4'
                        items={roles.map((r) => ({
                          label: r.name,
                          value: r.id,
                        }))}
                      />
                    )}
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='password'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>
                      Password{' '}
                      {isEdit && (
                        <span className='block text-xs text-muted-foreground'>
                          (leave blank to keep)
                        </span>
                      )}
                    </FormLabel>
                    <FormControl>
                      <PasswordInput
                        placeholder={
                          isEdit ? '********' : 'e.g., S3cur3P@ssw0rd'
                        }
                        className='col-span-4'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='confirmPassword'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>
                      Confirm Password
                    </FormLabel>
                    <FormControl>
                      <PasswordInput
                        disabled={!isPasswordTouched}
                        placeholder={
                          isEdit ? '********' : 'e.g., S3cur3P@ssw0rd'
                        }
                        className='col-span-4'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>
        <DialogFooter>
          <Button type='submit' form='user-form' disabled={isPending}>
            {isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
