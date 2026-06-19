import React from 'react'
import {
  GraduationCap,
  Building2,
  BookOpen,
  CalendarDays,
  UserCog,
  BookMarked,
  Clock,
  TrendingUp,
  Users,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

// ─── Mock Data ────────────────────────────────────────────────────────────────

const studentByDormitory = [
  { name: 'Putra L.1A', value: 87, color: '#3b82f6' },
  { name: 'Putra L.1B', value: 74, color: '#60a5fa' },
  { name: 'Putra L.2A', value: 92, color: '#2563eb' },
  { name: 'Putri L.1A', value: 103, color: '#ec4899' },
  { name: 'Putri L.1B', value: 68, color: '#f472b6' },
  { name: 'Putri L.2A', value: 89, color: '#db2777' },
]

const scheduleByDay = [
  { day: 'Sen', slots: 14 },
  { day: 'Sel', slots: 16 },
  { day: 'Rab', slots: 15 },
  { day: 'Kam', slots: 16 },
  { day: "Jum'", slots: 10 },
  { day: 'Sab', slots: 8 },
  { day: 'Min', slots: 0 },
]

const recentActivities = [
  {
    type: 'student',
    text: 'Ahmad Fauzi added to Kelas 2A Putra',
    time: '2 menit lalu',
    icon: GraduationCap,
    color: 'text-blue-500',
  },
  {
    type: 'schedule',
    text: 'Jadwal Matematika updated for Kelas 1B',
    time: '15 menit lalu',
    icon: CalendarDays,
    color: 'text-violet-500',
  },
  {
    type: 'teacher',
    text: 'Ustadz Hamid assigned to Dorm Putra L.2',
    time: '1 jam lalu',
    icon: UserCog,
    color: 'text-emerald-500',
  },
  {
    type: 'class',
    text: 'Kelas 3A Putri — roster updated (2 students)',
    time: '2 jam lalu',
    icon: BookOpen,
    color: 'text-orange-500',
  },
  {
    type: 'subject',
    text: 'Fiqih added to track Tahfidz',
    time: '3 jam lalu',
    icon: BookMarked,
    color: 'text-pink-500',
  },
  {
    type: 'slot',
    text: 'Schedule slot Slot 7 updated (14:00–15:00)',
    time: 'Kemarin',
    icon: Clock,
    color: 'text-yellow-500',
  },
]

const trackDistribution = [
  { track: 'Tahfidz', classes: 6, students: 210 },
  { track: 'Takhossus', classes: 4, students: 143 },
  { track: 'Reguler', classes: 8, students: 260 },
]

// ─── KPI Stats ────────────────────────────────────────────────────────────────

type Stat = {
  label: string
  value: string
  change: string
  trend: 'up' | 'down' | 'neutral'
  note: string
  icon: React.ElementType
  color: string
  bg: string
}

const stats: Stat[] = [
  {
    label: 'Total Students',
    value: '513',
    change: '+12',
    trend: 'up',
    note: 'dari bulan lalu',
    icon: GraduationCap,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
  },
  {
    label: 'Total Teachers',
    value: '38',
    change: '+2',
    trend: 'up',
    note: 'dari bulan lalu',
    icon: UserCog,
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
  },
  {
    label: 'Active Classrooms',
    value: '18',
    change: '',
    trend: 'neutral',
    note: 'tidak ada perubahan',
    icon: BookOpen,
    color: 'text-violet-500',
    bg: 'bg-violet-500/10',
  },
  {
    label: 'Dormitories',
    value: '6',
    change: '',
    trend: 'neutral',
    note: '3 Putra · 3 Putri',
    icon: Building2,
    color: 'text-orange-500',
    bg: 'bg-orange-500/10',
  },
]

// ─── Component ────────────────────────────────────────────────────────────────

export function DashboardOverview() {
  return (
    <div className='space-y-6'>
      {/* KPI Cards */}
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        {stats.map((s) => (
          <Card key={s.label}>
            <CardHeader className='flex flex-row items-center justify-between pb-2'>
              <CardTitle className='text-sm font-medium text-muted-foreground'>
                {s.label}
              </CardTitle>
              <div className={`rounded-md p-1.5 ${s.bg}`}>
                <s.icon size={16} className={s.color} />
              </div>
            </CardHeader>
            <CardContent>
              <div className='text-3xl font-bold tracking-tight'>{s.value}</div>
              <div className='mt-1 flex items-center gap-1 text-xs text-muted-foreground'>
                {s.trend === 'up' && (
                  <span className='flex items-center gap-0.5 font-medium text-emerald-500'>
                    <ArrowUpRight size={11} />
                    {s.change}
                  </span>
                )}
                {s.trend === 'down' && (
                  <span className='flex items-center gap-0.5 font-medium text-red-500'>
                    <ArrowDownRight size={11} />
                    {s.change}
                  </span>
                )}
                {s.note}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className='grid gap-4 lg:grid-cols-7'>
        {/* Schedule per day bar chart */}
        <Card className='lg:col-span-4'>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <div>
                <CardTitle className='flex items-center gap-2 text-base'>
                  <CalendarDays size={15} className='text-muted-foreground' />
                  Jadwal per Hari
                </CardTitle>
                <CardDescription>
                  Total slot jadwal aktif minggu ini
                </CardDescription>
              </div>
              <Badge variant='secondary'>79 total slot</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width='100%' height={220}>
              <BarChart data={scheduleByDay} barCategoryGap='30%'>
                <CartesianGrid
                  strokeDasharray='3 3'
                  stroke='hsl(var(--border))'
                  vertical={false}
                />
                <XAxis
                  dataKey='day'
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  stroke='hsl(var(--muted-foreground))'
                />
                <YAxis
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  stroke='hsl(var(--muted-foreground))'
                />
                <Tooltip
                  cursor={{ fill: 'hsl(var(--muted))' }}
                  contentStyle={{
                    background: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Bar
                  dataKey='slots'
                  fill='hsl(var(--primary))'
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Student per dormitory pie chart */}
        <Card className='lg:col-span-3'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-base'>
              <Building2 size={15} className='text-muted-foreground' />
              Distribusi Santri
            </CardTitle>
            <CardDescription>Jumlah santri per asrama</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width='100%' height={220}>
              <PieChart>
                <Pie
                  data={studentByDormitory}
                  cx='50%'
                  cy='50%'
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey='value'
                >
                  {studentByDormitory.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Legend
                  iconType='circle'
                  iconSize={8}
                  wrapperStyle={{ fontSize: '11px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Track & Recent Activity Row */}
      <div className='grid gap-4 lg:grid-cols-7'>
        {/* Track distribution */}
        <Card className='lg:col-span-3'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-base'>
              <BookMarked size={15} className='text-muted-foreground' />
              Track Overview
            </CardTitle>
            <CardDescription>
              Distribusi kelas & santri per track
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            {trackDistribution.map((t) => (
              <div key={t.track}>
                <div className='mb-1.5 flex items-center justify-between text-sm'>
                  <div className='flex items-center gap-2'>
                    <span className='font-medium'>{t.track}</span>
                    <Badge variant='outline' className='h-4 px-1.5 text-[10px]'>
                      {t.classes} kelas
                    </Badge>
                  </div>
                  <div className='flex items-center gap-1 text-xs text-muted-foreground'>
                    <Users size={11} />
                    {t.students} santri
                  </div>
                </div>
                <Progress value={(t.students / 513) * 100} className='h-2' />
              </div>
            ))}

            {/* Quick stats */}
            <div className='mt-4 grid grid-cols-3 divide-x rounded-lg border'>
              <div className='p-3 text-center'>
                <p className='text-xs text-muted-foreground'>Subjects</p>
                <p className='text-lg font-bold'>42</p>
              </div>
              <div className='p-3 text-center'>
                <p className='text-xs text-muted-foreground'>Schedules</p>
                <p className='text-lg font-bold'>79</p>
              </div>
              <div className='p-3 text-center'>
                <p className='text-xs text-muted-foreground'>Slots</p>
                <p className='text-lg font-bold'>8</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className='lg:col-span-4'>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <div>
                <CardTitle className='flex items-center gap-2 text-base'>
                  <TrendingUp size={15} className='text-muted-foreground' />
                  Aktivitas Terbaru
                </CardTitle>
                <CardDescription>
                  Perubahan data terkini di sistem
                </CardDescription>
              </div>
              <div className='flex items-center gap-1.5 text-xs text-muted-foreground'>
                <CheckCircle2 size={12} className='text-emerald-500' />
                Live
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className='space-y-0 divide-y'>
              {recentActivities.map((a, i) => (
                <div
                  key={i}
                  className='flex items-start gap-3 py-3 first:pt-0 last:pb-0'
                >
                  <div className='mt-0.5 rounded-md border p-1.5'>
                    <a.icon size={13} className={a.color} />
                  </div>
                  <div className='min-w-0 flex-1'>
                    <p className='truncate text-sm'>{a.text}</p>
                    <p className='text-xs text-muted-foreground'>{a.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
