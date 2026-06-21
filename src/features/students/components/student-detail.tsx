'use client'

import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import {
  ArrowLeft,
  Building2,
  FileText,
  GraduationCap,
  Home,
  Loader2,
  Phone,
  User,
  AlertCircle,
  Plus,
  Trash2,
  ClipboardList,
} from 'lucide-react'
import { toast } from 'sonner'
import { getApiErrorMessage } from '@/lib/api-response'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { getAbsenceStatusLabel } from '@/features/absences/utils/absence-utils'
import {
  useStudentHistories,
  useDormitoryHistories,
  useStudentPermits,
  useStudentAbsences,
  useCreatePermit,
  useDeletePermit,
} from '../hooks/use-student-detail'
import { useStudent } from '../hooks/use-students'
import type { PermitType } from '../services/permit-service'
import type { Student } from '../services/student-service'

// ─── Status helpers ───────────────────────────────────────────────────────────

const STUDENT_STATUS_LABEL: Record<string, string> = {
  ACTIVE: 'Aktif',
  TRANSFERRED: 'Pindah',
  GRADUATED: 'Lulus',
}

const STUDENT_STATUS_VARIANT: Record<
  string,
  'default' | 'secondary' | 'outline'
> = {
  ACTIVE: 'default',
  TRANSFERRED: 'secondary',
  GRADUATED: 'outline',
}

const HISTORY_STATUS_LABEL: Record<string, string> = {
  STUDYING: 'Belajar',
  CLASS_TRANSFER: 'Pindah Kelas',
  TRACK_GRADUATED: 'Lulus Track',
}

const DORM_HISTORY_STATUS_LABEL: Record<string, string> = {
  ASSIGNED: 'Ditetapkan',
  LEVEL_UP: 'Naik Level',
  TRANSFERRED: 'Pindah',
  CHECKED_OUT: 'Keluar',
}

function formatDate(d?: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function getInitials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function StudentDetail({ studentId }: { studentId: string }) {
  const { data: student, isLoading, isError, error } = useStudent(studentId)

  return (
    <>
      <Header fixed>
        <Search className='me-auto' />
        <ThemeSwitch />
        <ProfileDropdown />
      </Header>

      <Main className='flex flex-1 flex-col gap-5'>
        {/* Back button */}
        <div>
          <Button
            variant='ghost'
            size='sm'
            className='gap-1.5 text-muted-foreground'
            asChild
          >
            <Link to='/students'>
              <ArrowLeft size={14} />
              Kembali ke Daftar Santri
            </Link>
          </Button>
        </div>

        {isLoading && <StudentDetailSkeleton />}

        {isError && (
          <Alert variant='destructive'>
            <AlertCircle />
            <AlertTitle>Gagal memuat data santri</AlertTitle>
            <AlertDescription>
              {getApiErrorMessage(
                error,
                'Santri tidak ditemukan atau Anda tidak memiliki akses.'
              )}
            </AlertDescription>
          </Alert>
        )}

        {student && <StudentDetailContent student={student} />}
      </Main>
    </>
  )
}

// ─── Detail Content ───────────────────────────────────────────────────────────

function StudentDetailContent({ student }: { student: Student }) {
  return (
    <div className='grid gap-5 lg:grid-cols-[280px_1fr]'>
      {/* ── Profile Sidebar ── */}
      <div className='space-y-4'>
        {/* Avatar + name */}
        <Card>
          <CardContent className='flex flex-col items-center gap-3 pt-6 text-center'>
            <div className='flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary'>
              {getInitials(student.name)}
            </div>
            <div>
              <h2 className='text-lg leading-tight font-bold'>
                {student.name}
              </h2>
              <p className='text-sm text-muted-foreground'>NIS {student.nis}</p>
            </div>
            <Badge variant={STUDENT_STATUS_VARIANT[student.status]}>
              {STUDENT_STATUS_LABEL[student.status]}
            </Badge>
          </CardContent>
        </Card>

        {/* Info Pribadi */}
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='flex items-center gap-2 text-sm'>
              <User size={13} className='text-muted-foreground' />
              Info Pribadi
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-3 text-sm'>
            <InfoRow
              label='Gender'
              value={
                student.gender === 'PUTRA'
                  ? 'Putra'
                  : student.gender === 'PUTRI'
                    ? 'Putri'
                    : '—'
              }
            />
            <InfoRow label='Tempat Lahir' value={student.placeOfBirth || '—'} />
            <InfoRow
              label='Tanggal Lahir'
              value={formatDate(student.dateOfBirth)}
            />
            <InfoRow label='Alamat' value={student.address || '—'} />
          </CardContent>
        </Card>

        {/* Orang Tua */}
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='flex items-center gap-2 text-sm'>
              <Phone size={13} className='text-muted-foreground' />
              Orang Tua / Wali
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-3 text-sm'>
            <InfoRow label='Nama Ayah' value={student.fatherName || '—'} />
            <InfoRow label='Nama Ibu' value={student.motherName || '—'} />
            <InfoRow label='HP Orang Tua' value={student.parentPhone || '—'} />
          </CardContent>
        </Card>

        {/* Asrama */}
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='flex items-center gap-2 text-sm'>
              <Building2 size={13} className='text-muted-foreground' />
              Asrama
            </CardTitle>
          </CardHeader>
          <CardContent className='text-sm'>
            {student.dormitory ? (
              <div>
                <p className='font-medium'>{student.dormitory.name}</p>
                <p className='text-xs text-muted-foreground'>
                  Level {student.dormitory.level} · {student.dormitory.gender}
                </p>
              </div>
            ) : (
              <p className='text-muted-foreground'>Belum ditetapkan</p>
            )}
          </CardContent>
        </Card>

        {/* Exit info */}
        {student.status !== 'ACTIVE' && student.exitDate && (
          <Card className='border-destructive/30'>
            <CardHeader className='pb-2'>
              <CardTitle className='flex items-center gap-2 text-sm text-destructive'>
                <AlertCircle size={13} />
                Info Keluar
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-3 text-sm'>
              <InfoRow label='Tanggal' value={formatDate(student.exitDate)} />
              <InfoRow label='Alasan' value={student.exitReason || '—'} />
              <InfoRow label='Catatan' value={student.exitNotes || '—'} />
            </CardContent>
          </Card>
        )}
      </div>

      {/* ── Tabs ── */}
      <Tabs defaultValue='class-history' className='gap-5'>
        <TabsList className='w-full justify-start'>
          <TabsTrigger value='class-history' className='gap-1.5'>
            <GraduationCap size={13} />
            Riwayat Kelas
          </TabsTrigger>
          <TabsTrigger value='dorm-history' className='gap-1.5'>
            <Home size={13} />
            Riwayat Asrama
          </TabsTrigger>
          <TabsTrigger value='permits' className='gap-1.5'>
            <FileText size={13} />
            Izin / Sakit
          </TabsTrigger>
          <TabsTrigger value='absences' className='gap-1.5'>
            <ClipboardList size={13} />
            Absensi
          </TabsTrigger>
        </TabsList>

        <TabsContent value='class-history'>
          <ClassHistoryTab studentId={student.id} />
        </TabsContent>

        <TabsContent value='dorm-history'>
          <DormHistoryTab studentId={student.id} />
        </TabsContent>

        <TabsContent value='permits'>
          <PermitsTab studentId={student.id} />
        </TabsContent>

        <TabsContent value='absences'>
          <AbsencesTab studentId={student.id} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ─── Tab: Riwayat Kelas ───────────────────────────────────────────────────────

function ClassHistoryTab({ studentId }: { studentId: string }) {
  const { data, isLoading, isError } = useStudentHistories({
    studentId,
    limit: 50,
    sortBy: 'startDate',
    sortOrder: 'desc',
  })
  const records = data?.data ?? []

  if (isLoading) return <TabSkeleton />
  if (isError) return <TabError />

  return (
    <div className='rounded-lg border bg-card'>
      <div className='border-b px-4 py-3'>
        <h3 className='font-semibold'>Riwayat Kelas</h3>
        <p className='text-sm text-muted-foreground'>
          {data?.meta.total ?? 0} entri
        </p>
      </div>
      {records.length === 0 ? (
        <EmptyState text='Belum ada riwayat kelas.' />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Kelas</TableHead>
              <TableHead>Track</TableHead>
              <TableHead>Asrama</TableHead>
              <TableHead>Mulai</TableHead>
              <TableHead>Selesai</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.map((r) => (
              <TableRow key={r.id}>
                <TableCell className='font-medium'>
                  {r.classNameAtThatTime || '—'}
                </TableCell>
                <TableCell>{r.trackNameAtThatTime || '—'}</TableCell>
                <TableCell>{r.dormNameAtThatTime || '—'}</TableCell>
                <TableCell className='whitespace-nowrap'>
                  {formatDate(r.startDate)}
                </TableCell>
                <TableCell className='whitespace-nowrap'>
                  {formatDate(r.endDate)}
                </TableCell>
                <TableCell>
                  <Badge variant='outline' className='text-xs'>
                    {HISTORY_STATUS_LABEL[r.status] ?? r.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}

// ─── Tab: Riwayat Asrama ──────────────────────────────────────────────────────

function DormHistoryTab({ studentId }: { studentId: string }) {
  const { data, isLoading, isError } = useDormitoryHistories({
    studentId,
    limit: 50,
    sortBy: 'startDate',
    sortOrder: 'desc',
  })
  const records = data?.data ?? []

  if (isLoading) return <TabSkeleton />
  if (isError) return <TabError />

  return (
    <div className='rounded-lg border bg-card'>
      <div className='border-b px-4 py-3'>
        <h3 className='font-semibold'>Riwayat Asrama</h3>
        <p className='text-sm text-muted-foreground'>
          {data?.meta.total ?? 0} entri
        </p>
      </div>
      {records.length === 0 ? (
        <EmptyState text='Belum ada riwayat asrama.' />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Dari</TableHead>
              <TableHead>Ke</TableHead>
              <TableHead>Level</TableHead>
              <TableHead>Mulai</TableHead>
              <TableHead>Selesai</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Alasan</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.map((r) => (
              <TableRow key={r.id}>
                <TableCell className='text-muted-foreground'>
                  {r.fromDormNameAtThatTime || '—'}
                </TableCell>
                <TableCell className='font-medium'>
                  {r.toDormNameAtThatTime || '—'}
                </TableCell>
                <TableCell>
                  {r.fromLevel != null ? `L${r.fromLevel}` : '—'} → L{r.toLevel}
                </TableCell>
                <TableCell className='whitespace-nowrap'>
                  {formatDate(r.startDate)}
                </TableCell>
                <TableCell className='whitespace-nowrap'>
                  {formatDate(r.endDate)}
                </TableCell>
                <TableCell>
                  <Badge variant='outline' className='text-xs'>
                    {DORM_HISTORY_STATUS_LABEL[r.status] ?? r.status}
                  </Badge>
                </TableCell>
                <TableCell className='max-w-40 truncate text-sm text-muted-foreground'>
                  {r.changeReason || '—'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}

// ─── Tab: Izin / Sakit ────────────────────────────────────────────────────────

function PermitsTab({ studentId }: { studentId: string }) {
  const { data, isLoading, isError, refetch } = useStudentPermits({
    studentId,
    limit: 50,
    sortBy: 'startDate',
    sortOrder: 'desc',
  })
  const records = data?.data ?? []
  const [addOpen, setAddOpen] = useState(false)
  const deletePermit = useDeletePermit()

  const handleDelete = async (id: string) => {
    try {
      await deletePermit.mutateAsync(id)
      toast.success('Izin berhasil dihapus.')
      refetch()
    } catch (e) {
      toast.error(getApiErrorMessage(e, 'Gagal menghapus izin.'))
    }
  }

  if (isLoading) return <TabSkeleton />
  if (isError) return <TabError />

  return (
    <div className='space-y-4'>
      <div className='rounded-lg border bg-card'>
        <div className='flex items-center justify-between border-b px-4 py-3'>
          <div>
            <h3 className='font-semibold'>Izin & Sakit</h3>
            <p className='text-sm text-muted-foreground'>
              {data?.meta.total ?? 0} entri
            </p>
          </div>
          <Button
            size='sm'
            className='gap-1.5'
            onClick={() => setAddOpen(true)}
          >
            <Plus size={13} />
            Tambah Izin
          </Button>
        </div>

        {records.length === 0 ? (
          <EmptyState text='Belum ada izin terdaftar.' />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tipe</TableHead>
                <TableHead>Alasan</TableHead>
                <TableHead>Mulai</TableHead>
                <TableHead>Selesai</TableHead>
                <TableHead>Slot</TableHead>
                <TableHead className='w-16'></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>
                    <Badge
                      variant={r.type === 'SICK' ? 'secondary' : 'outline'}
                      className='text-xs'
                    >
                      {r.type === 'SICK' ? 'Sakit' : 'Izin'}
                    </Badge>
                  </TableCell>
                  <TableCell className='max-w-52 truncate'>
                    {r.reason}
                  </TableCell>
                  <TableCell className='whitespace-nowrap'>
                    {formatDate(r.startDate)}
                  </TableCell>
                  <TableCell className='whitespace-nowrap'>
                    {formatDate(r.endDate)}
                  </TableCell>
                  <TableCell className='text-xs text-muted-foreground'>
                    {r.allowedSlots.length > 0
                      ? r.allowedSlots.join(', ')
                      : 'Semua slot'}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant='ghost'
                      size='icon'
                      className='h-7 w-7 text-destructive hover:text-destructive'
                      onClick={() => handleDelete(r.id)}
                    >
                      <Trash2 size={13} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <AddPermitDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        studentId={studentId}
      />
    </div>
  )
}

// ─── Add Permit Dialog ────────────────────────────────────────────────────────

function AddPermitDialog({
  open,
  onOpenChange,
  studentId,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  studentId: string
}) {
  const create = useCreatePermit()
  const [form, setForm] = useState({
    type: 'SICK' as PermitType,
    reason: '',
    startDate: '',
    endDate: '',
  })

  const handleSubmit = async () => {
    if (!form.reason || !form.startDate) {
      toast.error('Alasan dan tanggal mulai wajib diisi.')
      return
    }
    try {
      await create.mutateAsync({
        studentId,
        type: form.type,
        reason: form.reason,
        startDate: form.startDate,
        endDate: form.endDate || undefined,
        allowedSlots: [],
      })
      toast.success('Izin berhasil ditambahkan.')
      onOpenChange(false)
      setForm({ type: 'SICK', reason: '', startDate: '', endDate: '' })
    } catch (e) {
      toast.error(getApiErrorMessage(e, 'Gagal menambahkan izin.'))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Tambah Izin / Sakit</DialogTitle>
          <DialogDescription>
            Tambahkan izin atau keterangan sakit untuk santri ini.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          <div className='space-y-1.5'>
            <Label>Tipe</Label>
            <Select
              value={form.type}
              onValueChange={(v) =>
                setForm((f) => ({ ...f, type: v as PermitType }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='SICK'>Sakit</SelectItem>
                <SelectItem value='PERMIT'>Izin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className='space-y-1.5'>
            <Label>Alasan</Label>
            <Input
              placeholder='Masukkan alasan izin / sakit'
              value={form.reason}
              onChange={(e) =>
                setForm((f) => ({ ...f, reason: e.target.value }))
              }
            />
          </div>

          <div className='grid grid-cols-2 gap-3'>
            <div className='space-y-1.5'>
              <Label>Tanggal Mulai</Label>
              <Input
                type='date'
                value={form.startDate}
                onChange={(e) =>
                  setForm((f) => ({ ...f, startDate: e.target.value }))
                }
              />
            </div>
            <div className='space-y-1.5'>
              <Label>
                Tanggal Selesai{' '}
                <span className='text-xs text-muted-foreground'>
                  (opsional)
                </span>
              </Label>
              <Input
                type='date'
                value={form.endDate}
                onChange={(e) =>
                  setForm((f) => ({ ...f, endDate: e.target.value }))
                }
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button onClick={handleSubmit} disabled={create.isPending}>
            {create.isPending && <Loader2 className='animate-spin' />}
            Simpan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Tab: Absensi ─────────────────────────────────────────────────────────────

const ABSENCE_COLORS: Record<string, string> = {
  PRESENT: 'text-emerald-600 dark:text-emerald-400',
  SICK: 'text-amber-600 dark:text-amber-400',
  PERMIT: 'text-sky-600 dark:text-sky-400',
  ABSENT: 'text-destructive',
}

function AbsencesTab({ studentId }: { studentId: string }) {
  const { data, isLoading, isError } = useStudentAbsences({
    studentId,
    limit: 50,
    sortBy: 'absentDate',
    sortOrder: 'desc',
  })
  const records = data?.data ?? []

  // Summary counts
  const counts = records.reduce(
    (acc, r) => {
      acc[r.status] = (acc[r.status] ?? 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  if (isLoading) return <TabSkeleton />
  if (isError) return <TabError />

  return (
    <div className='space-y-4'>
      {/* Summary cards */}
      <div className='grid grid-cols-2 gap-3 sm:grid-cols-4'>
        {(['PRESENT', 'SICK', 'PERMIT', 'ABSENT'] as const).map((s) => (
          <div key={s} className='rounded-lg border bg-card p-3 text-center'>
            <p className='text-xs text-muted-foreground'>
              {getAbsenceStatusLabel(s)}
            </p>
            <p className={`text-2xl font-bold ${ABSENCE_COLORS[s]}`}>
              {counts[s] ?? 0}
            </p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className='rounded-lg border bg-card'>
        <div className='border-b px-4 py-3'>
          <h3 className='font-semibold'>Riwayat Kehadiran</h3>
          <p className='text-sm text-muted-foreground'>
            {data?.meta.total ?? 0} entri (50 terbaru)
          </p>
        </div>
        {records.length === 0 ? (
          <EmptyState text='Belum ada data absensi.' />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal</TableHead>
                <TableHead>Kelas</TableHead>
                <TableHead>Mata Pelajaran</TableHead>
                <TableHead>Slot</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Catatan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className='whitespace-nowrap'>
                    {formatDate(r.absentDate)}
                  </TableCell>
                  <TableCell>{r.schedule?.class?.name || '—'}</TableCell>
                  <TableCell>{r.schedule?.subject?.name || '—'}</TableCell>
                  <TableCell className='text-xs text-muted-foreground'>
                    {r.schedule?.scheduleSlot
                      ? `Slot ${r.schedule.scheduleSlot.slot}`
                      : '—'}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`text-xs font-medium ${ABSENCE_COLORS[r.status]}`}
                    >
                      {getAbsenceStatusLabel(r.status)}
                    </span>
                  </TableCell>
                  <TableCell className='max-w-40 truncate text-sm text-muted-foreground'>
                    {r.note || '—'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  )
}

// ─── Shared helpers ───────────────────────────────────────────────────────────

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className='flex justify-between gap-3'>
      <span className='text-muted-foreground'>{label}</span>
      <span className='text-right font-medium'>{value}</span>
    </div>
  )
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className='px-4 py-10 text-center text-sm text-muted-foreground'>
      {text}
    </div>
  )
}

function TabError() {
  return (
    <Alert variant='destructive'>
      <AlertCircle />
      <AlertTitle>Gagal memuat data</AlertTitle>
      <AlertDescription>Silakan coba muat ulang halaman.</AlertDescription>
    </Alert>
  )
}

function TabSkeleton() {
  return (
    <div className='space-y-3 rounded-lg border bg-card p-4'>
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className='h-10 rounded-md' />
      ))}
    </div>
  )
}

function StudentDetailSkeleton() {
  return (
    <div className='grid gap-5 lg:grid-cols-[280px_1fr]'>
      <div className='space-y-4'>
        <Skeleton className='h-52 rounded-lg' />
        <Skeleton className='h-36 rounded-lg' />
        <Skeleton className='h-28 rounded-lg' />
      </div>
      <Skeleton className='h-96 rounded-lg' />
    </div>
  )
}
