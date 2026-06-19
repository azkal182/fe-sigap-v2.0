'use client'

import { useMemo, useState } from 'react'
import { KeyRound, Loader2, Save, ShieldCheck } from 'lucide-react'
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
import { usePermissions } from '@/features/permissions/hooks/use-permissions'
import { useRole, useReplaceRolePermissions } from '../hooks/use-roles'
import { type Role } from '../services/role-service'

type RolesPermissionsDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: Role
}

type PermissionSelection = {
  roleId: string
  ids: Set<string>
}

export function RolesPermissionsDialog({
  open,
  onOpenChange,
  currentRow,
}: RolesPermissionsDialogProps) {
  const [search, setSearch] = useState('')

  // Fetch fresh role detail (to get current permissions)
  const { data: roleDetail, isLoading: isLoadingRole } = useRole(currentRow.id)
  // Fetch all available system permissions
  const { data: allPermissions = [], isLoading: isLoadingPerms } =
    usePermissions()

  const replacePermissions = useReplaceRolePermissions()
  const isLoading = isLoadingRole || isLoadingPerms

  // Build set of currently assigned permission IDs
  const currentPermissionIds = useMemo(
    () => new Set(roleDetail?.permissions?.map((p) => p.id) ?? []),
    [roleDetail]
  )

  // Local draft state (so user can toggle multiple then save all at once)
  const [selection, setSelection] = useState<PermissionSelection | null>(null)

  const selectedIds =
    selection?.roleId === currentRow.id ? selection.ids : currentPermissionIds

  // Filter and group all permissions by resource
  const grouped = useMemo(() => {
    const q = search.toLowerCase()
    const filtered = allPermissions.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.resource.toLowerCase().includes(q) ||
        p.action.toLowerCase().includes(q)
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

  const handleToggle = (permId: string, checked: boolean) => {
    setSelection((prev) => {
      const base =
        prev?.roleId === currentRow.id ? prev.ids : currentPermissionIds
      const next = new Set(base)
      if (checked) next.add(permId)
      else next.delete(permId)
      return { roleId: currentRow.id, ids: next }
    })
  }

  const handleSelectAll = (_resource: string, perms: typeof allPermissions) => {
    setSelection((prev) => {
      const base =
        prev?.roleId === currentRow.id ? prev.ids : currentPermissionIds
      const next = new Set(base)
      const allChecked = perms.every((p) => base.has(p.id))
      perms.forEach((p) => (allChecked ? next.delete(p.id) : next.add(p.id)))
      return { roleId: currentRow.id, ids: next }
    })
  }

  const handleSave = async () => {
    try {
      await replacePermissions.mutateAsync({
        id: currentRow.id,
        dto: { permissionIds: Array.from(selectedIds) },
      })
      toast.success(`Permissions updated for role "${currentRow.name}"`)
      setSelection(null)
      onOpenChange(false)
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, 'Failed to update permissions'))
    }
  }

  const hasChanges = useMemo(() => {
    if (selectedIds.size !== currentPermissionIds.size) return true
    for (const id of selectedIds) {
      if (!currentPermissionIds.has(id)) return true
    }
    return false
  }, [selectedIds, currentPermissionIds])

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        if (!state) {
          setSearch('')
          setSelection(null)
        }
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
            Assign permissions to role{' '}
            <span className='font-semibold'>{currentRow.name}</span>.
            {currentRow.isSystem && (
              <span className='ms-1 font-medium text-orange-500'>
                (System role — changes are allowed)
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className='flex items-center gap-2 text-xs text-muted-foreground'>
          <Badge variant='secondary'>{selectedIds.size} selected</Badge>
          <span>of {allPermissions.length} permissions</span>
          {hasChanges && (
            <Badge variant='outline' className='border-blue-600 text-blue-600'>
              Unsaved changes
            </Badge>
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
            <div className='flex h-full items-center justify-center py-8'>
              <Loader2 className='h-5 w-5 animate-spin text-muted-foreground' />
            </div>
          ) : Object.keys(grouped).length === 0 ? (
            <p className='py-6 text-center text-sm text-muted-foreground'>
              No permissions found.
            </p>
          ) : (
            Object.entries(grouped).map(([resource, perms]) => {
              const allChecked = perms.every((p) => selectedIds.has(p.id))
              const someChecked = perms.some((p) => selectedIds.has(p.id))
              return (
                <div key={resource} className='mb-3'>
                  {/* Resource group header with select-all toggle */}
                  <div
                    className='mb-1 flex cursor-pointer items-center gap-2'
                    onClick={() => handleSelectAll(resource, perms)}
                  >
                    <Checkbox
                      checked={allChecked || (someChecked && 'indeterminate')}
                      onCheckedChange={() => handleSelectAll(resource, perms)}
                    />
                    <div className='flex items-center gap-1.5'>
                      <ShieldCheck
                        size={12}
                        className='text-muted-foreground'
                      />
                      <p className='text-xs font-semibold tracking-wide text-muted-foreground uppercase'>
                        {resource}
                      </p>
                      <Badge
                        variant='secondary'
                        className='h-4 px-1 text-[10px]'
                      >
                        {perms.filter((p) => selectedIds.has(p.id)).length}/
                        {perms.length}
                      </Badge>
                    </div>
                  </div>

                  <div className='ms-6 space-y-0.5'>
                    {perms.map((perm) => (
                      <label
                        key={perm.id}
                        className='flex cursor-pointer items-center gap-2 rounded-sm px-1 py-1 text-sm hover:bg-muted'
                      >
                        <Checkbox
                          checked={selectedIds.has(perm.id)}
                          onCheckedChange={(checked) =>
                            handleToggle(perm.id, !!checked)
                          }
                        />
                        <span className='flex-1'>{perm.name}</span>
                        <Badge
                          variant='outline'
                          className='h-4 px-1 text-[10px] text-muted-foreground'
                        >
                          {perm.action}
                        </Badge>
                      </label>
                    ))}
                  </div>
                  <Separator className='mt-2' />
                </div>
              )
            })
          )}
        </ScrollArea>

        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!hasChanges || replacePermissions.isPending}
          >
            {replacePermissions.isPending ? (
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
            ) : (
              <Save className='mr-2 h-4 w-4' />
            )}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
