'use client'

import { useEffect } from 'react'
import { z } from 'zod'
import { useForm, useWatch } from 'react-hook-form'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SelectDropdown } from '@/components/select-dropdown'
import { useCreateStudent, useUpdateStudent } from '../hooks/use-students'
import { type Student } from '../services/student-service'
import { useDormitoryOptions } from './use-dormitory-options'

const GENDER_OPTIONS = [
  { label: 'Putra (Male)', value: 'PUTRA' },
  { label: 'Putri (Female)', value: 'PUTRI' },
]

const STATUS_OPTIONS = [
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Transferred', value: 'TRANSFERRED' },
  { label: 'Graduated', value: 'GRADUATED' },
]

const formSchema = z.object({
  nis: z.string().min(1, 'NIS is required.'),
  name: z.string().min(1, 'Name is required.'),
  placeOfBirth: z.string().min(1, 'Place of birth is required.'),
  dateOfBirth: z.string().min(1, 'Date of birth is required.'),
  gender: z.enum(['PUTRA', 'PUTRI']).optional(),
  address: z.string().optional(),
  dormitoryId: z.string().optional(),
  status: z.enum(['ACTIVE', 'TRANSFERRED', 'GRADUATED']).optional(),
  // parent
  fatherName: z.string().optional(),
  motherName: z.string().optional(),
  parentPhone: z.string().optional(),
  // exit info
  exitDate: z.string().optional(),
  exitReason: z.string().optional(),
  exitNotes: z.string().optional(),
})

type StudentForm = z.infer<typeof formSchema>

type StudentsActionDialogProps = {
  currentRow?: Student
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function StudentsActionDialog({
  currentRow,
  open,
  onOpenChange,
}: StudentsActionDialogProps) {
  const isEdit = !!currentRow
  const createStudent = useCreateStudent()
  const updateStudent = useUpdateStudent()
  const isPending = createStudent.isPending || updateStudent.isPending
  const dormitoryOptions = useDormitoryOptions()

  const defaultValues: StudentForm = {
    nis: '',
    name: '',
    placeOfBirth: '',
    dateOfBirth: '',
    gender: undefined,
    address: '',
    dormitoryId: '',
    status: 'ACTIVE',
    fatherName: '',
    motherName: '',
    parentPhone: '',
    exitDate: '',
    exitReason: '',
    exitNotes: '',
  }

  const form = useForm<StudentForm>({
    resolver: zodResolver(formSchema),
    defaultValues,
  })

  useEffect(() => {
    if (open && currentRow) {
      form.reset({
        nis: currentRow.nis ?? '',
        name: currentRow.name ?? '',
        placeOfBirth: currentRow.placeOfBirth ?? '',
        dateOfBirth: currentRow.dateOfBirth?.slice(0, 10) ?? '',
        gender: currentRow.gender,
        address: currentRow.address ?? '',
        dormitoryId: currentRow.dormitoryId ?? '',
        status: currentRow.status ?? 'ACTIVE',
        fatherName: currentRow.fatherName ?? '',
        motherName: currentRow.motherName ?? '',
        parentPhone: currentRow.parentPhone ?? '',
        exitDate: currentRow.exitDate?.slice(0, 10) ?? '',
        exitReason: currentRow.exitReason ?? '',
        exitNotes: currentRow.exitNotes ?? '',
      })
    } else if (!open) {
      form.reset(defaultValues)
    }
  }, [open, currentRow]) // eslint-disable-line react-hooks/exhaustive-deps

  const onSubmit = async (values: StudentForm) => {
    const payload = {
      ...values,
      // Convert sentinel value to undefined (no dormitory)
      dormitoryId:
        values.dormitoryId && values.dormitoryId !== '__none__'
          ? values.dormitoryId
          : undefined,
      exitDate: values.exitDate || undefined,
      exitReason: values.exitReason || undefined,
      exitNotes: values.exitNotes || undefined,
    }

    try {
      if (isEdit && currentRow) {
        await updateStudent.mutateAsync({ id: currentRow.id, dto: payload })
        toast.success(`Student "${values.name}" updated`)
      } else {
        await createStudent.mutateAsync(payload)
        toast.success(`Student "${values.name}" created`)
      }
      onOpenChange(false)
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, 'Failed to save student'))
    }
  }

  const status = useWatch({ control: form.control, name: 'status' })
  const showExitFields = status === 'TRANSFERRED' || status === 'GRADUATED'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='flex max-h-[90vh] flex-col gap-0 p-0 sm:max-w-2xl'>
        <DialogHeader className='shrink-0 px-6 pt-6 text-start'>
          <DialogTitle>
            {isEdit ? 'Edit Student' : 'Add New Student'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update student information.'
              : 'Fill in the details to register a new student.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            id='student-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='flex min-h-0 flex-1 flex-col'
          >
            <div className='flex-1 overflow-y-auto px-6 py-4'>
              <Tabs defaultValue='personal' className='w-full'>
                <TabsList className='mb-4 grid w-full grid-cols-3'>
                  <TabsTrigger value='personal'>Personal</TabsTrigger>
                  <TabsTrigger value='parent'>Parent</TabsTrigger>
                  <TabsTrigger value='school'>School</TabsTrigger>
                </TabsList>

                {/* ── Tab 1: Personal ─────────────────────────────────── */}
                <TabsContent value='personal' className='mt-0 space-y-4'>
                  <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                    <FormField
                      control={form.control}
                      name='nis'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>NIS</FormLabel>
                          <FormControl>
                            <Input placeholder='e.g. 2024001' {...field} />
                          </FormControl>
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

                  <FormField
                    control={form.control}
                    name='name'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder='Student full name' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                    <FormField
                      control={form.control}
                      name='placeOfBirth'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Place of Birth</FormLabel>
                          <FormControl>
                            <Input placeholder='City' {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name='dateOfBirth'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date of Birth</FormLabel>
                          <FormControl>
                            <Input type='date' {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name='address'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address (optional)</FormLabel>
                        <FormControl>
                          <Input placeholder='Home address' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>

                {/* ── Tab 2: Parent ───────────────────────────────────── */}
                <TabsContent value='parent' className='mt-0 space-y-4'>
                  <FormField
                    control={form.control}
                    name='fatherName'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Father&apos;s Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Father's full name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='motherName'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mother&apos;s Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Mother's full name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='parentPhone'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Parent Phone</FormLabel>
                        <FormControl>
                          <Input
                            type='tel'
                            placeholder='e.g. 08123456789'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>

                {/* ── Tab 3: School & Status ──────────────────────────── */}
                <TabsContent value='school' className='mt-0 space-y-4'>
                  <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                    <FormField
                      control={form.control}
                      name='dormitoryId'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Dormitory</FormLabel>
                          <SelectDropdown
                            defaultValue={field.value || '__none__'}
                            onValueChange={(v) =>
                              field.onChange(v === '__none__' ? '' : v)
                            }
                            placeholder='Select dormitory'
                            items={[
                              { label: 'None', value: '__none__' },
                              ...dormitoryOptions,
                            ]}
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name='status'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <SelectDropdown
                            defaultValue={field.value}
                            onValueChange={field.onChange}
                            placeholder='Select status'
                            items={STATUS_OPTIONS}
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Exit fields — shown for TRANSFERRED or GRADUATED */}
                  {showExitFields && (
                    <>
                      <FormField
                        control={form.control}
                        name='exitDate'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Exit Date</FormLabel>
                            <FormControl>
                              <Input type='date' {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name='exitReason'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Exit Reason</FormLabel>
                            <FormControl>
                              <Input
                                placeholder='Reason for leaving'
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name='exitNotes'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Exit Notes</FormLabel>
                            <FormControl>
                              <Input
                                placeholder='Additional notes'
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </form>
        </Form>

        <DialogFooter className='shrink-0 border-t px-6 py-4'>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type='submit' form='student-form' disabled={isPending}>
            {isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
            {isEdit ? 'Save changes' : 'Create student'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
