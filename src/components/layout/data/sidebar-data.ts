import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  Building,
  GraduationCap,
  Settings,
  UserCog,
  UserCheck,
  Wrench,
  Palette,
  Bell,
  Monitor,
  Command,
  BookOpen,
  BookMarked,
  CalendarDays,
  Clock,
  ClipboardCheck,
} from 'lucide-react'
import { type SidebarData } from '../types'

export const sidebarData: SidebarData = {
  user: {
    name: 'Admin',
    email: 'admin@example.com',
    avatar: '/avatars/shadcn.jpg',
  },
  teams: [
    {
      name: 'SIGAP',
      logo: Command,
      plan: 'Dashboard',
    },
  ],
  navGroups: [
    {
      title: 'Umum',
      items: [
        {
          title: 'Dashboard',
          url: '/',
          icon: LayoutDashboard,
        },
      ],
    },
    {
      title: 'Manajemen Pengguna',
      items: [
        {
          title: 'Pengguna',
          url: '/users',
          icon: Users,
        },
        {
          title: 'Peran',
          url: '/roles',
          icon: ShieldCheck,
        },
        {
          title: 'Izin Akses',
          url: '/permissions',
          icon: ShieldCheck, // You could choose another icon later
        },
      ],
    },
    {
      title: 'Data Master',
      items: [
        {
          title: 'Asrama',
          url: '/dormitories',
          icon: Building,
        },
        {
          title: 'Slot Jadwal',
          url: '/schedule-slots',
          icon: Clock,
        },
        {
          title: 'Santri',
          url: '/students',
          icon: GraduationCap,
        },
        {
          title: 'Pengajar',
          url: '/teachers',
          icon: UserCog,
        },
      ],
    },
    {
      title: 'Akademik',
      items: [
        {
          title: 'Kelas',
          url: '/classrooms',
          icon: BookOpen,
        },
        {
          title: 'Mata Pelajaran',
          url: '/subjects',
          icon: BookMarked,
        },
        {
          title: 'Jadwal',
          url: '/schedules',
          icon: CalendarDays,
        },
        {
          title: 'Absensi Santri',
          url: '/absences',
          icon: ClipboardCheck,
        },
        {
          title: 'Absensi Pengajar',
          url: '/teacher-attendances',
          icon: UserCheck,
        },
      ],
    },
    {
      title: 'Lainnya',
      items: [
        {
          title: 'Pengaturan',
          icon: Settings,
          items: [
            {
              title: 'Profil',
              url: '/settings',
              icon: UserCog,
            },
            {
              title: 'Akun',
              url: '/settings/account',
              icon: Wrench,
            },
            {
              title: 'Tampilan',
              url: '/settings/appearance',
              icon: Palette,
            },
            {
              title: 'Notifikasi',
              url: '/settings/notifications',
              icon: Bell,
            },
            {
              title: 'Tampilan Layar',
              url: '/settings/display',
              icon: Monitor,
            },
          ],
        },
      ],
    },
  ],
}
