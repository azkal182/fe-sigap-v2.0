'use client'

import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { ChevronDownIcon } from '@radix-ui/react-icons'
import { zodResolver } from '@hookform/resolvers/zod'
import { fonts } from '@/config/fonts'
import {
  Building2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Moon,
  Palette,
  ShieldCheck,
  Sun,
  User,
} from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import { getApiErrorMessage } from '@/lib/api-response'
import { api } from '@/lib/axios'
import { cn } from '@/lib/utils'
import { useFont } from '@/context/font-provider'
import { useTheme } from '@/context/theme-provider'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { authService } from '@/features/auth/services/auth-service'

// ─── Schemas ──────────────────────────────────────────────────────────────────

const profileSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter.'),
  email: z.string().email('Format email tidak valid.'),
})

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Password lama wajib diisi.'),
    newPassword: z.string().min(8, 'Password baru minimal 8 karakter.'),
    confirmPassword: z.string().min(1, 'Konfirmasi password wajib diisi.'),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Konfirmasi password tidak cocok.',
    path: ['confirmPassword'],
  })

const appearanceSchema = z.object({
  theme: z.enum(['light', 'dark']),
  font: z.enum(fonts),
})

type ProfileValues = z.infer<typeof profileSchema>
type PasswordValues = z.infer<typeof passwordSchema>
type AppearanceValues = z.infer<typeof appearanceSchema>

// ─── Helper ───────────────────────────────────────────────────────────────────

function getInitials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
}

// ─── Settings Page ────────────────────────────────────────────────────────────

export function SettingsPage() {
  return (
    <>
      <Header fixed>
        <Search className='me-auto' />
        <ThemeSwitch />
        <ProfileDropdown />
      </Header>

      <Main className='flex flex-1 flex-col gap-6'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>Pengaturan</h2>
          <p className='text-muted-foreground'>
            Kelola profil akun dan preferensi tampilan.
          </p>
        </div>

        <Tabs defaultValue='profile' className='gap-6'>
          <TabsList className='w-full justify-start'>
            <TabsTrigger value='profile' className='gap-1.5'>
              <User size={13} />
              Profil
            </TabsTrigger>
            <TabsTrigger value='security' className='gap-1.5'>
              <KeyRound size={13} />
              Keamanan
            </TabsTrigger>
            <TabsTrigger value='appearance' className='gap-1.5'>
              <Palette size={13} />
              Tampilan
            </TabsTrigger>
          </TabsList>

          <TabsContent value='profile'>
            <ProfileTab />
          </TabsContent>

          <TabsContent value='security'>
            <SecurityTab />
          </TabsContent>

          <TabsContent value='appearance'>
            <AppearanceTab />
          </TabsContent>
        </Tabs>
      </Main>
    </>
  )
}

// ─── Tab: Profil ──────────────────────────────────────────────────────────────

function ProfileTab() {
  const { user, setUser } = useAuthStore((s) => ({
    user: s.auth.user,
    setUser: s.auth.setUser,
  }))

  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name ?? '',
      email: user?.email ?? '',
    },
  })

  const onSubmit = async (values: ProfileValues) => {
    if (!user?.id) return
    try {
      const res = await api.patch(`/users/${user.id}`, {
        name: values.name,
        email: values.email,
      })
      // Refresh profile from /auth/me to sync store
      const profile = await authService.getProfile()
      setUser({
        ...user,
        name: profile.name,
        email: profile.email,
      })
      void res
      toast.success('Profil berhasil diperbarui.')
    } catch (e) {
      toast.error(getApiErrorMessage(e, 'Gagal memperbarui profil.'))
    }
  }

  return (
    <div className='grid gap-6 lg:grid-cols-[260px_1fr]'>
      {/* Avatar card */}
      <Card className='h-fit'>
        <CardContent className='flex flex-col items-center gap-4 pt-6 text-center'>
          <div className='flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 text-3xl font-bold text-primary'>
            {getInitials(user?.name ?? 'U')}
          </div>
          <div>
            <p className='font-semibold'>{user?.name}</p>
            <p className='text-sm text-muted-foreground'>{user?.email}</p>
          </div>
          {user?.role?.name && (
            <Badge variant='secondary'>{user.role.name}</Badge>
          )}

          <Separator />

          {/* Scopes/dormitories */}
          {user?.dormitoryScopes && user.dormitoryScopes.length > 0 && (
            <div className='w-full space-y-2 text-left'>
              <p className='flex items-center gap-1.5 text-xs font-medium text-muted-foreground'>
                <Building2 size={12} />
                Scope Asrama
              </p>
              <div className='flex flex-wrap gap-1.5'>
                {user.dormitoryScopes.map((d) => (
                  <Badge key={d.id} variant='outline' className='text-xs'>
                    {d.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {user?.dormitoryScopeIds?.length === 0 && (
            <div className='w-full text-left'>
              <p className='flex items-center gap-1.5 text-xs font-medium text-muted-foreground'>
                <ShieldCheck size={12} />
                Akses ke semua asrama
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit form */}
      <Card>
        <CardHeader>
          <CardTitle className='text-base'>Informasi Profil</CardTitle>
          <CardDescription>
            Perbarui nama dan alamat email akun Anda.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-5'>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Lengkap</FormLabel>
                    <FormControl>
                      <Input placeholder='Masukkan nama lengkap' {...field} />
                    </FormControl>
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
                    <FormControl>
                      <Input
                        type='email'
                        placeholder='email@example.com'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Read-only role info */}
              <div className='space-y-1.5'>
                <FormLabel className='text-muted-foreground'>
                  Peran (Role)
                </FormLabel>
                <Input
                  value={user?.role?.name ?? 'Tidak ada peran'}
                  disabled
                  className='bg-muted/50'
                />
                <p className='text-xs text-muted-foreground'>
                  Peran hanya dapat diubah oleh administrator.
                </p>
              </div>

              <div className='pt-2'>
                <Button type='submit' disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting && (
                    <Loader2 className='animate-spin' />
                  )}
                  Simpan Perubahan
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}

// ─── Tab: Keamanan (ganti password) ──────────────────────────────────────────

function SecurityTab() {
  const { user } = useAuthStore((s) => s.auth)
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const form = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  })

  const onSubmit = async (values: PasswordValues) => {
    if (!user?.id) return
    try {
      await api.patch(`/users/${user.id}`, {
        password: values.newPassword,
      })
      toast.success('Password berhasil diperbarui.')
      form.reset()
    } catch (e) {
      toast.error(getApiErrorMessage(e, 'Gagal memperbarui password.'))
    }
  }

  return (
    <div className='max-w-lg'>
      <Card>
        <CardHeader>
          <CardTitle className='text-base'>Ganti Password</CardTitle>
          <CardDescription>
            Pastikan gunakan password yang kuat dan tidak mudah ditebak.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className='mb-5 border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400'>
            <KeyRound size={14} />
            <AlertDescription className='text-xs'>
              Setelah mengganti password, Anda perlu login ulang di perangkat
              lain.
            </AlertDescription>
          </Alert>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-5'>
              <FormField
                control={form.control}
                name='currentPassword'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password Saat Ini</FormLabel>
                    <FormControl>
                      <div className='relative'>
                        <Input
                          type={showCurrent ? 'text' : 'password'}
                          placeholder='••••••••'
                          {...field}
                        />
                        <button
                          type='button'
                          className='absolute inset-y-0 end-3 flex items-center text-muted-foreground'
                          onClick={() => setShowCurrent((v) => !v)}
                        >
                          {showCurrent ? (
                            <EyeOff size={14} />
                          ) : (
                            <Eye size={14} />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='newPassword'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password Baru</FormLabel>
                    <FormControl>
                      <div className='relative'>
                        <Input
                          type={showNew ? 'text' : 'password'}
                          placeholder='••••••••'
                          {...field}
                        />
                        <button
                          type='button'
                          className='absolute inset-y-0 end-3 flex items-center text-muted-foreground'
                          onClick={() => setShowNew((v) => !v)}
                        >
                          {showNew ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                    </FormControl>
                    <FormDescription className='text-xs'>
                      Minimal 8 karakter.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='confirmPassword'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Konfirmasi Password Baru</FormLabel>
                    <FormControl>
                      <div className='relative'>
                        <Input
                          type={showConfirm ? 'text' : 'password'}
                          placeholder='••••••••'
                          {...field}
                        />
                        <button
                          type='button'
                          className='absolute inset-y-0 end-3 flex items-center text-muted-foreground'
                          onClick={() => setShowConfirm((v) => !v)}
                        >
                          {showConfirm ? (
                            <EyeOff size={14} />
                          ) : (
                            <Eye size={14} />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className='pt-2'>
                <Button
                  type='submit'
                  variant='destructive'
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting && (
                    <Loader2 className='animate-spin' />
                  )}
                  Perbarui Password
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}

// ─── Tab: Tampilan ────────────────────────────────────────────────────────────

function AppearanceTab() {
  const { font, setFont } = useFont()
  const { theme, setTheme } = useTheme()

  const form = useForm<AppearanceValues>({
    resolver: zodResolver(appearanceSchema),
    defaultValues: { theme: theme as 'light' | 'dark', font },
  })

  const onSubmit = (values: AppearanceValues) => {
    if (values.font !== font) setFont(values.font)
    if (values.theme !== theme) setTheme(values.theme)
    toast.success('Preferensi tampilan disimpan.')
  }

  return (
    <div className='max-w-2xl'>
      <Card>
        <CardHeader>
          <CardTitle className='text-base'>Tampilan</CardTitle>
          <CardDescription>
            Sesuaikan tema dan font yang ditampilkan di dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
              {/* Font picker */}
              <FormField
                control={form.control}
                name='font'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Font</FormLabel>
                    <div className='relative w-max'>
                      <FormControl>
                        <select
                          className={cn(
                            buttonVariants({ variant: 'outline' }),
                            'w-52 appearance-none font-normal capitalize',
                            'dark:bg-background dark:hover:bg-background'
                          )}
                          {...field}
                        >
                          {fonts.map((f) => (
                            <option key={f} value={f}>
                              {f}
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      <ChevronDownIcon className='absolute inset-e-3 top-2.5 h-4 w-4 opacity-50' />
                    </div>
                    <FormDescription>
                      Font yang digunakan di seluruh halaman.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Theme picker */}
              <FormField
                control={form.control}
                name='theme'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tema</FormLabel>
                    <FormDescription>
                      Pilih tema warna dashboard.
                    </FormDescription>
                    <FormMessage />
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className='grid max-w-sm grid-cols-2 gap-6 pt-2'
                    >
                      {/* Light */}
                      <FormItem>
                        <FormLabel className='[&:has([data-state=checked])>div]:border-primary'>
                          <FormControl>
                            <RadioGroupItem value='light' className='sr-only' />
                          </FormControl>
                          <div className='cursor-pointer items-center rounded-md border-2 border-muted p-1 hover:border-accent'>
                            <div className='space-y-2 rounded-sm bg-[#ecedef] p-2'>
                              <div className='space-y-2 rounded-md bg-white p-2 shadow-xs'>
                                <div className='h-2 w-16 rounded-lg bg-[#ecedef]' />
                                <div className='h-2 w-20 rounded-lg bg-[#ecedef]' />
                              </div>
                              <div className='flex items-center space-x-2 rounded-md bg-white p-2 shadow-xs'>
                                <div className='h-4 w-4 rounded-full bg-[#ecedef]' />
                                <div className='h-2 w-20 rounded-lg bg-[#ecedef]' />
                              </div>
                            </div>
                          </div>
                          <span className='flex items-center justify-center gap-1.5 pt-2 text-sm font-normal'>
                            <Sun size={13} /> Light
                          </span>
                        </FormLabel>
                      </FormItem>

                      {/* Dark */}
                      <FormItem>
                        <FormLabel className='[&:has([data-state=checked])>div]:border-primary'>
                          <FormControl>
                            <RadioGroupItem value='dark' className='sr-only' />
                          </FormControl>
                          <div className='cursor-pointer items-center rounded-md border-2 border-muted bg-popover p-1 hover:bg-accent hover:text-accent-foreground'>
                            <div className='space-y-2 rounded-sm bg-slate-950 p-2'>
                              <div className='space-y-2 rounded-md bg-slate-800 p-2 shadow-xs'>
                                <div className='h-2 w-16 rounded-lg bg-slate-400' />
                                <div className='h-2 w-20 rounded-lg bg-slate-400' />
                              </div>
                              <div className='flex items-center space-x-2 rounded-md bg-slate-800 p-2 shadow-xs'>
                                <div className='h-4 w-4 rounded-full bg-slate-400' />
                                <div className='h-2 w-20 rounded-lg bg-slate-400' />
                              </div>
                            </div>
                          </div>
                          <span className='flex items-center justify-center gap-1.5 pt-2 text-sm font-normal'>
                            <Moon size={13} /> Dark
                          </span>
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormItem>
                )}
              />

              <Button type='submit'>Simpan Preferensi</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
