'use client'

import { useMemo, useState } from 'react'
import { KeyRound, Loader2, ShieldCheck, ShieldOff } from 'lucide-react'
import { toast } from 'sonner'
import { getApiErrorMessage } from '@/lib/api-response'
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
import {
  useAllPermissions,
  useUserPermissions,
  useAssignUserPermissions,
  useRemoveUserPermission,
} from '../hooks/use-users'
import { type User } from '../services/user-service'

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

  // All available system permissions
  const { data: allPermissions = [], isLoading: isLoadingAll } =
    useAllPermissions()

  // Direct permissions assigned to this user via GET /users/:id/permissions
  // API returns: Permission[] (flat array of directly assigned permissions)
  const { data: directPermsData, isLoading: isLoadingDirect } =
    useUserPermissions(currentRow.id)

  const assignMutation = useAssignUserPermissions()
  const removeMutation = useRemoveUserPermission()

  const isLoading = isLoadingAll || isLoadingDirect
  const isPending = assignMutation.isPending || removeMutation.isPending

  /**
   * Build lookup sets:
   * - fromRoleSet: permission IDs from the user's role (from currentRow.role.permissions)
   * - directSet:   permission IDs directly assigned (from GET /users/:id/permissions)
   *
   * We use IDs (not names) to avoid name-based matching issues.
   */
  const fromRoleSet = useMemo(() => {
    const ids = (currentRow.role?.permissions ?? []).map((p) => p.id)
    return new Set(ids)
  }, [currentRow.role?.permissions])

  const directSet = useMemo(() => {
    // While loading, fall back to directPermissions from the user list response
    if (isLoadingDirect || directPermsData === undefined) {
      return new Set((currentRow.directPermissions ?? []).map((p) => p.id))
    }
    // Once loaded, use fresh data from GET /users/:id/permissions
    return new Set(directPermsData.map((p) => p.id))
  }, [directPermsData, isLoadingDirect, currentRow.directPermissions])

  // Group all permissions by resource with search filter
  const grouped = useMemo(() => {
    const q = search.toLowerCase()
    const filtered = allPermissions.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.resource.toLowerCase().includes(q) ||
        (p.action ?? '').toLowerCase().includes(q)
    )
    return filtered.reduce<Record<string, typeof allPermissions>>(
      (acc, perm) => {
        const key = perm.resource
        if (!acc[key]) acc[key] = []
        acc[key].push(perm)
        return acc
      },
      {}
    )
  }, [allPermissions, search])

  const handleToggle = async (
    permissionId: string,
    permissionName: string,
    checked: boolean
  ) => {
    if (checked) {
      try {
        await assignMutation.mutateAsync({
          userId: currentRow.id,
          dto: { permissionIds: [permissionId] },
        })
        toast.success(`Permission "${permissionName}" assigned`)
      } catch (error: unknown) {
        toast.error(getApiErrorMessage(error, 'Failed to assign permission'))
      }
    } else {
      try {
        await removeMutation.mutateAsync({
          userId: currentRow.id,
          permissionId,
        })
        toast.success(`Permission "${permissionName}" removed`)
      } catch (error: unknown) {
        toast.error(getApiErrorMessage(error, 'Failed to remove permission'))
      }
    }
  }

  const totalDirect = directSet.size
  const totalFromRole = fromRoleSet.size

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
            Permissions for{' '}
            <span className='font-semibold'>{currentRow.name}</span>.
            Role-inherited permissions are read-only.
          </DialogDescription>
        </DialogHeader>

        {/* Legend + counters */}
        <div className='flex flex-wrap items-center gap-2 text-xs text-muted-foreground'>
          <Badge
            variant='outline'
            className='gap-1 border-green-600 text-green-600'
          >
            <ShieldCheck size={11} /> From role ({totalFromRole})
          </Badge>
          <Badge
            variant='outline'
            className='gap-1 border-blue-600 text-blue-600'
          >
            <ShieldOff size={11} /> Direct ({totalDirect})
          </Badge>
          {isLoadingDirect && (
            <Loader2 className='h-3 w-3 animate-spin text-muted-foreground' />
          )}
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
                <p className='mb-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase'>
                  {resource}
                </p>
                <div className='space-y-1'>
                  {perms.map((perm) => {
                    const isFromRole = fromRoleSet.has(perm.id)
                    const isDirect = directSet.has(perm.id)
                    const isChecked = isFromRole || isDirect

                    return (
                      <label
                        key={perm.id}
                        className={`flex cursor-pointer items-center gap-2 rounded-sm px-1 py-1 text-sm hover:bg-muted ${
                          isFromRole ? 'cursor-not-allowed opacity-70' : ''
                        }`}
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
                            className='h-4 border-green-600 px-1 text-[10px] text-green-600'
                          >
                            role
                          </Badge>
                        )}
                        {isDirect && (
                          <Badge
                            variant='outline'
                            className='h-4 border-blue-600 px-1 text-[10px] text-blue-600'
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
