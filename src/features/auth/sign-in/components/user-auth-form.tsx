import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'
import { Loader2, LogIn } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import { getApiErrorMessage } from '@/lib/api-response'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
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
import { authService } from '@/features/auth/services/auth-service'

const formSchema = z.object({
  identifier: z.string().min(1, 'Please enter your email or username.'),
  password: z.string().min(1, 'Please enter your password.'),
})

interface UserAuthFormProps extends React.HTMLAttributes<HTMLFormElement> {
  redirectTo?: string
}

export function UserAuthForm({
  className,
  redirectTo,
  ...props
}: UserAuthFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { auth } = useAuthStore()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      identifier: 'admin@example.com',
      password: 'Admin@123456',
    },
  })

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true)

    try {
      const response = await authService.login(data)

      auth.setTokens(response.accessToken, response.refreshToken)

      // Fetch full profile (role, permissions, dormitory scopes) from /auth/me
      const profile = await authService.getProfile()
      auth.setUser({
        id: profile.id,
        email: profile.email,
        name: profile.name,
        isActive: profile.isActive,
        role: profile.role,
        permissions: profile.permissions,
        teacher: profile.teacher,
        dormitoryScopeIds: profile.dormitoryScopeIds,
        dormitoryScopes: profile.dormitoryScopes,
      })

      toast.success(`Welcome back, ${response.user.name}!`)

      const targetPath = redirectTo || '/'
      navigate({ to: targetPath, replace: true })
    } catch (error: unknown) {
      // Error is handled globally by axios interceptor but we can add specific handling here
      toast.error(getApiErrorMessage(error, 'Failed to login'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn('grid gap-3', className)}
        {...props}
      >
        <FormField
          control={form.control}
          name='identifier'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email or username</FormLabel>
              <FormControl>
                <Input placeholder='admin@example.com or admin' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='password'
          render={({ field }) => (
            <FormItem className='relative'>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <PasswordInput placeholder='********' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className='mt-2' disabled={isLoading}>
          {isLoading ? <Loader2 className='animate-spin' /> : <LogIn />}
          Sign in
        </Button>
      </form>
    </Form>
  )
}
