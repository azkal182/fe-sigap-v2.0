'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, KeyRound, UserPlus, Link2, PowerOff } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useUsers } from '@/features/users/hooks/use-users'
import {
  useCreateTeacherLogin,
  useLinkTeacherUser,
  useUpdateTeacherLogin,
  useDeactivateTeacherLogin,
} from '../hooks/use-teachers'
import type { Teacher } from '../services/teacher-service'

// ─── Schemas ──────────────────────────────────────────────────────────────────

const createLoginSchema = z
  .object({
    email: z.string().email('Invalid email'),
    password: z.string().min(6, 'Minimum 6 characters'),
    confirmPassword: z.string(),
    name: z.string().optional(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

const linkUserSchema = z.object({
  userId: z.string().min(1, 'Please select a user'),
})

const editLoginSchema = z.object({
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  password: z.string().min(6, 'Minimum 6 characters').optional().or(z.literal('')),
  name: z.string().optional(),
  isActive: z.boolean(),
})

type CreateLoginValues = z.infer<typeof createLoginSchema>
type LinkUserValues = z.infer<typeof linkUserSchema>
type EditLoginValues = z.infer<typeof editLoginSchema>

// ─── Props ────────────────────────────────────────────────────────────────────

type TeacherLoginDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  teacher: Teacher
}

// ─── Component ────────────────────────────────────────────────────────────────

export function TeacherLoginDialog({
  open,
  onOpenChange,
  teacher,
}: TeacherLoginDialogProps) {
  const hasLogin = !!teacher.userId
  const [activeTab, setActiveTab] = useState<string>('create')

  useEffect(() => {
    if (open) setActiveTab('create')
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <KeyRound size={16} />
            {hasLogin ? 'Manage Login Account' : 'Set Up Login'}
          </DialogTitle>
          <DialogDescription>
            {hasLogin
              ? `Manage the login credentials for ${teacher.name}.`
              : `Create or link a login account for ${teacher.name}.`}
          </DialogDescription>
        </DialogHeader>

        {hasLogin ? (
          <EditLoginForm teacher={teacher} onClose={() => onOpenChange(false)} />
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className='w-full'>
              <TabsTrigger value='create' className='flex-1 gap-1.5'>
                <UserPlus size={13} />
                Create New
              </TabsTrigger>
              <TabsTrigger value='link' className='flex-1 gap-1.5'>
                <Link2 size={13} />
                Link Existing
              </TabsTrigger>
            </TabsList>

            <TabsContent value='create' className='mt-4'>
              <CreateLoginForm teacher={teacher} onClose={() => onOpenChange(false)} />
            </TabsContent>
            <TabsContent value='link' className='mt-4'>
              <LinkUserForm teacher={teacher} onClose={() => onOpenChange(false)} />
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  )
}

// ─── Create New Login ─────────────────────────────────────────────────────────

function CreateLoginForm({
  teacher,
  onClose,
}: {
  teacher: Teacher
  onClose: () => void
}) {
  const createLogin = useCreateTeacherLogin()
  const form = useForm<CreateLoginValues>({
    resolver: zodResolver(createLoginSchema),
    defaultValues: { email: '', password: '', confirmPassword: '', name: teacher.name },
  })

  const onSubmit = async (values: CreateLoginValues) => {
    try {
      await createLogin.mutateAsync({
        id: teacher.id,
        data: { email: values.email, password: values.password, name: values.name },
      })
      toast.success('Login account created.')
      onClose()
    } catch {
      // handled by interceptor
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-3'>
        <FormField
          control={form.control}
          name='name'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Display Name <span className='text-xs font-normal text-muted-foreground'>(optional)</span></FormLabel>
              <FormControl><Input placeholder={teacher.name} {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl><Input type='email' placeholder='teacher@example.com' {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='password'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl><Input type='password' placeholder='Min. 6 characters' {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='confirmPassword'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <FormControl><Input type='password' placeholder='Re-enter password' {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <DialogFooter className='pt-2'>
          <Button variant='outline' type='button' onClick={onClose}>Cancel</Button>
          <Button type='submit' disabled={createLogin.isPending}>
            {createLogin.isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
            Create Account
          </Button>
        </DialogFooter>
      </form>
    </Form>
  )
}

// ─── Link Existing User ───────────────────────────────────────────────────────

function LinkUserForm({
  teacher,
  onClose,
}: {
  teacher: Teacher
  onClose: () => void
}) {
  const linkUser = useLinkTeacherUser()
  const { data: usersData, isLoading: isLoadingUsers } = useUsers({ limit: 100 })
  const users = usersData?.data ?? []

  const form = useForm<LinkUserValues>({
    resolver: zodResolver(linkUserSchema),
    defaultValues: { userId: '' },
  })

  const onSubmit = async (values: LinkUserValues) => {
    try {
      await linkUser.mutateAsync({ id: teacher.id, data: { userId: values.userId } })
      toast.success('User linked as teacher login.')
      onClose()
    } catch {
      // handled by interceptor
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-3'>
        <p className='text-xs text-muted-foreground'>
          Select an existing non-system user to link as this teacher's login account.
        </p>
        <FormField
          control={form.control}
          name='userId'
          render={({ field }) => (
            <FormItem>
              <FormLabel>User</FormLabel>
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={isLoadingUsers}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={isLoadingUsers ? 'Loading…' : 'Select user…'} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {users.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      <span>{u.name}</span>
                      <span className='ms-1.5 text-xs text-muted-foreground'>— {u.email}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <DialogFooter className='pt-2'>
          <Button variant='outline' type='button' onClick={onClose}>Cancel</Button>
          <Button type='submit' disabled={linkUser.isPending}>
            {linkUser.isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
            Link User
          </Button>
        </DialogFooter>
      </form>
    </Form>
  )
}

// ─── Edit Existing Login ──────────────────────────────────────────────────────

function EditLoginForm({
  teacher,
  onClose,
}: {
  teacher: Teacher
  onClose: () => void
}) {
  const update = useUpdateTeacherLogin()
  const deactivate = useDeactivateTeacherLogin()

  const form = useForm<EditLoginValues>({
    resolver: zodResolver(editLoginSchema),
    defaultValues: {
      email: teacher.user?.email ?? '',
      password: '',
      name: teacher.user?.name ?? '',
      isActive: teacher.user?.isActive ?? true,
    },
  })

  useEffect(() => {
    form.reset({
      email: teacher.user?.email ?? '',
      password: '',
      name: teacher.user?.name ?? '',
      isActive: teacher.user?.isActive ?? true,
    })
  }, [teacher])

  const onSubmit = async (values: EditLoginValues) => {
    try {
      await update.mutateAsync({
        id: teacher.id,
        data: {
          email: values.email || undefined,
          password: values.password || undefined,
          name: values.name || undefined,
          isActive: values.isActive,
        },
      })
      toast.success('Login account updated.')
      onClose()
    } catch {
      // handled by interceptor
    }
  }

  const handleDeactivate = async () => {
    try {
      await deactivate.mutateAsync(teacher.id)
      toast.success('Login account deactivated.')
      onClose()
    } catch {
      // handled by interceptor
    }
  }

  return (
    <div className='space-y-4'>
      {/* Current login info */}
      <div className='rounded-md bg-muted/50 px-3 py-2 text-sm'>
        <p className='text-xs text-muted-foreground mb-1'>Current account</p>
        <p className='font-medium'>{teacher.user?.email}</p>
        <div className='mt-1 flex items-center gap-1.5'>
          <Badge
            variant={teacher.user?.isActive ? 'default' : 'secondary'}
            className='h-4 px-1.5 text-[10px]'
          >
            {teacher.user?.isActive ? 'Active' : 'Inactive'}
          </Badge>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-3'>
          <FormField
            control={form.control}
            name='name'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Display Name</FormLabel>
                <FormControl><Input placeholder='Leave blank to keep current' {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='email'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl><Input type='email' placeholder='Leave blank to keep current' {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='password'
            render={({ field }) => (
              <FormItem>
                <FormLabel>New Password <span className='text-xs font-normal text-muted-foreground'>(leave blank to keep)</span></FormLabel>
                <FormControl><Input type='password' placeholder='Min. 6 characters' {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='isActive'
            render={({ field }) => (
              <FormItem className='flex items-center justify-between rounded-lg border p-3'>
                <FormLabel className='text-sm font-medium'>Login Active</FormLabel>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />

          <DialogFooter className='pt-2'>
            <Button variant='outline' type='button' onClick={onClose}>Cancel</Button>
            <Button type='submit' disabled={update.isPending}>
              {update.isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </Form>

      <Separator />

      {/* Danger zone */}
      <div className='flex items-center justify-between'>
        <div>
          <p className='text-sm font-medium text-destructive'>Deactivate Login</p>
          <p className='text-xs text-muted-foreground'>
            Removes login access. Teacher data is kept.
          </p>
        </div>
        <Button
          variant='destructive'
          size='sm'
          onClick={handleDeactivate}
          disabled={deactivate.isPending}
        >
          {deactivate.isPending
            ? <Loader2 className='mr-2 h-4 w-4 animate-spin' />
            : <PowerOff className='mr-2 h-4 w-4' />}
          Deactivate
        </Button>
      </div>
    </div>
  )
}
