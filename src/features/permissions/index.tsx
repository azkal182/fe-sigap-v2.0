import { useMemo, useState } from 'react'
import { Search as SearchIcon, ShieldCheck } from 'lucide-react'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Loader2 } from 'lucide-react'
import { usePermissions } from './hooks/use-permissions'

export function Permissions() {
  const [search, setSearch] = useState('')
  const { data: permissions = [], isLoading } = usePermissions()

  // Group by resource
  const grouped = useMemo(() => {
    const q = search.toLowerCase()
    const filtered = permissions.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.resource.toLowerCase().includes(q) ||
        p.action.toLowerCase().includes(q) ||
        (p.description ?? '').toLowerCase().includes(q)
    )
    return filtered.reduce<
      Record<string, typeof permissions>
    >((acc, perm) => {
      if (!acc[perm.resource]) acc[perm.resource] = []
      acc[perm.resource].push(perm)
      return acc
    }, {})
  }, [permissions, search])

  const totalFiltered = Object.values(grouped).flat().length

  return (
    <>
      <Header fixed>
        <Search className='me-auto' />
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Permissions</h2>
            <p className='text-muted-foreground'>
              All available system permissions grouped by resource. These are
              read-only and managed by the system.
            </p>
          </div>
          <Badge variant='secondary' className='text-sm'>
            {isLoading ? '...' : `${totalFiltered} permissions`}
          </Badge>
        </div>

        {/* Search filter */}
        <div className='relative w-full max-w-sm'>
          <SearchIcon className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
          <Input
            placeholder='Search by name, resource or action...'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className='h-8 pl-8'
          />
        </div>

        {/* Loading state */}
        {isLoading ? (
          <div className='flex h-48 items-center justify-center'>
            <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
          </div>
        ) : Object.keys(grouped).length === 0 ? (
          <div className='flex h-48 items-center justify-center text-muted-foreground'>
            No permissions found.
          </div>
        ) : (
          /* Grouped tables per resource */
          <div className='space-y-6'>
            {Object.entries(grouped).map(([resource, perms]) => (
              <div key={resource}>
                <div className='mb-2 flex items-center gap-2'>
                  <ShieldCheck size={16} className='text-muted-foreground' />
                  <h3 className='text-sm font-semibold uppercase tracking-wide text-muted-foreground'>
                    {resource}
                  </h3>
                  <Badge variant='secondary' className='text-xs'>
                    {perms.length}
                  </Badge>
                </div>

                <div className='overflow-hidden rounded-md border'>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className='w-56'>Permission Name</TableHead>
                        <TableHead className='w-32'>Action</TableHead>
                        <TableHead>Description</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {perms.map((perm) => (
                        <TableRow key={perm.id}>
                          <TableCell className='font-mono text-sm'>
                            {perm.name}
                          </TableCell>
                          <TableCell>
                            <Badge variant='outline' className='text-xs capitalize'>
                              {perm.action}
                            </Badge>
                          </TableCell>
                          <TableCell className='text-sm text-muted-foreground'>
                            {perm.description || '—'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ))}
          </div>
        )}
      </Main>
    </>
  )
}
