'use client'

import { useMemo, useState } from 'react'
import { KeyRound, Loader2, ShieldCheck, ShieldOff } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { type User } from '../services/user-service'
import {
  useAllPermissions,
  useUserPermissions,
  useAssignUserPermissions,
  useRemoveUserPermission,
} from '../hooks/use-users'

type UsersPermissionsDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: User
}

export function UsersPermissionsDialog({
  open,
  onOpenChange,
  currentRow,
}: UsersPermissionsDialogProps) {
  const [search, setSearch] = useState('')

  const { data: allPermissions = [], isLoading: isLoadingAll } = useAllPermissions()
  const { data: userPerms, isLoading: isLoadingUser } = useUserPermissions(currentRow.id)
  const assignMutation = useAssignUserPermissions()
  const removeMutation = useRemoveUserPermission()

  const isLoading = isLoadingAll || isLoadingUser
  const isPending = assignMutation.isPending || removeMutation.isPending

  // Sets of permission names for quick lookup
  const fromRoleSet = useMemo(
    () => new Set(userPerms?.fromRole ?? []),
    [userPerms]
  )
  const directSet = useMemo(
    () => new Set(userPerms?.direct ?? []),
    [userPerms]
  )

  // Group all permissions by resource
  const grouped = useMemo(() => {
    const q = search.toLowerCase()
    const filtered = allPermissions.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.resource.toLowerCase().includes(q) ||
        (p.action ?? '').toLowerCase().includes(q)
    )
    return filtered.reduce<Record<string, typeof allPermissions>>((acc, perm) => {
      const key = perm.resource
      if (!acc[key]) acc[key] = []
      acc[key].push(perm)
      return acc
    }, {})
  }, [allPermissions, search])

  const handleToggle = async (permissionId: string, permissionName: string, checked: boolean) => {
    if (checked) {
      // Assign direct permission
      try {
        await assignMutation.mutateAsync({
          userId: currentRow.id,
          dto: { permissionIds: [permissionId] },
        })
        toast.success(`Permission "${permissionName}" assigned`)
      } catch (err: any) {
        toast.error(err?.response?.data?.message || 'Failed to assign permission')
      }
    } else {
      // Remove direct permission
      try {
        await removeMutation.mutateAsync({
          userId: currentRow.id,
          permissionId,
        })
        toast.success(`Permission "${permissionName}" removed`)
      } catch (err: any) {
        toast.error(err?.response?.data?.message || 'Failed to remove permission')
      }
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        if (!state) setSearch('')
        onOpenChange(state)
      }}
    >
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <KeyRound size={18} />
            Manage Permissions
          </DialogTitle>
          <DialogDescription>
            Direct permissions for{' '}
            <span className='font-semibold'>{currentRow.name}</span>.
            Permissions inherited from the role are shown but cannot be unchecked here.
          </DialogDescription>
        </DialogHeader>

        <div className='flex items-center gap-2 text-xs text-muted-foreground'>
          <Badge variant='outline' className='gap-1 text-green-600 border-green-600'>
            <ShieldCheck size={11} /> From role
          </Badge>
          <Badge variant='outline' className='gap-1 text-blue-600 border-blue-600'>
            <ShieldOff size={11} /> Direct
          </Badge>
        </div>

        <Input
          placeholder='Search permissions...'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className='h-8'
        />

        <ScrollArea className='h-72 rounded-md border px-3 py-2'>
          {isLoading ? (
            <div className='flex h-full items-center justify-center'>
              <Loader2 className='h-5 w-5 animate-spin text-muted-foreground' />
            </div>
          ) : Object.keys(grouped).length === 0 ? (
            <p className='py-6 text-center text-sm text-muted-foreground'>
              No permissions found.
            </p>
          ) : (
            Object.entries(grouped).map(([resource, perms]) => (
              <div key={resource} className='mb-3'>
                <p className='mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
                  {resource}
                </p>
                <div className='space-y-1'>
                  {perms.map((perm) => {
                    const isFromRole = fromRoleSet.has(perm.name)
                    const isDirect = directSet.has(perm.name)
                    const isChecked = isFromRole || isDirect

                    return (
                      <label
                        key={perm.id}
                        className='flex cursor-pointer items-center gap-2 rounded-sm px-1 py-1 text-sm hover:bg-muted'
                      >
                        <Checkbox
                          checked={isChecked}
                          disabled={isFromRole || isPending}
                          onCheckedChange={(checked) =>
                            handleToggle(perm.id, perm.name, !!checked)
                          }
                        />
                        <span className='flex-1'>{perm.name}</span>
                        {isFromRole && (
                          <Badge
                            variant='outline'
                            className='h-4 px-1 text-[10px] text-green-600 border-green-600'
                          >
                            role
                          </Badge>
                        )}
                        {isDirect && (
                          <Badge
                            variant='outline'
                            className='h-4 px-1 text-[10px] text-blue-600 border-blue-600'
                          >
                            direct
                          </Badge>
                        )}
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
