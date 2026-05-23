'use client'

import { useMemo } from 'react'
import { Building, Layers, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { type User } from '../services/user-service'
import {
  useDormitories,
  useUserScopes,
  useAssignUserScopes,
  useRemoveUserScopes,
} from '../hooks/use-users'

type UsersScopesDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: User
}

const GENDER_LABEL: Record<string, string> = {
  PUTRA: 'Putra',
  PUTRI: 'Putri',
}

export function UsersScopesDialog({
  open,
  onOpenChange,
  currentRow,
}: UsersScopesDialogProps) {
  // Fetch all dormitories (active only, high limit to get all)
  const { data: dormitoriesRes, isLoading: isLoadingDorms } = useDormitories({
    limit: 100,
    isActive: true,
  })
  const dormitories = dormitoriesRes?.data ?? []

  // Fetch current user scopes
  const { data: scopes = [], isLoading: isLoadingScopes } = useUserScopes(
    currentRow.id
  )
  const assignMutation = useAssignUserScopes()
  const removeMutation = useRemoveUserScopes()

  const isLoading = isLoadingDorms || isLoadingScopes
  const isPending = assignMutation.isPending || removeMutation.isPending

  // Build set of currently assigned dormitory IDs for quick lookup
  const assignedDormitoryIds = useMemo(() => {
    const dormScope = scopes.find((s) => s.resource === 'dormitory')
    return new Set(dormScope?.resourceIds ?? [])
  }, [scopes])

  const handleToggle = async (dormitoryId: string, checked: boolean) => {
    if (checked) {
      try {
        await assignMutation.mutateAsync({
          userId: currentRow.id,
          dto: { resource: 'dormitory', resourceIds: [dormitoryId] },
        })
        toast.success('Dormitory scope assigned')
      } catch (err: any) {
        toast.error(
          err?.response?.data?.message || 'Failed to assign dormitory scope'
        )
      }
    } else {
      try {
        await removeMutation.mutateAsync({
          userId: currentRow.id,
          dto: { resource: 'dormitory', resourceIds: [dormitoryId] },
        })
        toast.success('Dormitory scope removed')
      } catch (err: any) {
        toast.error(
          err?.response?.data?.message || 'Failed to remove dormitory scope'
        )
      }
    }
  }

  // Group dormitories by gender for cleaner display
  const grouped = useMemo(() => {
    return dormitories.reduce<Record<string, typeof dormitories>>(
      (acc, dorm) => {
        const key = dorm.gender ?? 'OTHER'
        if (!acc[key]) acc[key] = []
        acc[key].push(dorm)
        return acc
      },
      {}
    )
  }, [dormitories])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Layers size={18} />
            Manage Dormitory Scopes
          </DialogTitle>
          <DialogDescription>
            Select which dormitories{' '}
            <span className='font-semibold'>{currentRow.name}</span> can access.
            Unchecked dormitories will be inaccessible to this user.
          </DialogDescription>
        </DialogHeader>

        <div className='flex items-center gap-2'>
          <Badge variant='secondary'>
            {assignedDormitoryIds.size} assigned
          </Badge>
          <span className='text-xs text-muted-foreground'>
            of {dormitories.length} dormitories
          </span>
        </div>

        <ScrollArea className='h-72 rounded-md border px-3 py-2'>
          {isLoading ? (
            <div className='flex h-full items-center justify-center py-8'>
              <Loader2 className='h-5 w-5 animate-spin text-muted-foreground' />
            </div>
          ) : dormitories.length === 0 ? (
            <p className='py-6 text-center text-sm text-muted-foreground'>
              No dormitories found.
            </p>
          ) : (
            Object.entries(grouped).map(([gender, dorms]) => (
              <div key={gender} className='mb-3'>
                {/* Gender group header */}
                <div className='mb-1 flex items-center gap-1.5'>
                  <Building size={12} className='text-muted-foreground' />
                  <p className='text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
                    {GENDER_LABEL[gender] ?? gender}
                  </p>
                </div>

                <div className='space-y-0.5'>
                  {dorms.map((dorm) => {
                    const isChecked = assignedDormitoryIds.has(dorm.id)
                    return (
                      <label
                        key={dorm.id}
                        className='flex cursor-pointer items-center gap-3 rounded-sm px-1 py-1.5 text-sm hover:bg-muted'
                      >
                        <Checkbox
                          checked={isChecked}
                          disabled={isPending}
                          onCheckedChange={(checked) =>
                            handleToggle(dorm.id, !!checked)
                          }
                        />
                        <div className='flex flex-1 items-center justify-between'>
                          <span>{dorm.name}</span>
                          <Badge
                            variant='outline'
                            className='text-[10px] px-1 h-4'
                          >
                            Level {dorm.level}
                          </Badge>
                        </div>
                      </label>
                    )
                  })}
                </div>

                <Separator className='mt-2' />
              </div>
            ))
          )}
        </ScrollArea>

        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
