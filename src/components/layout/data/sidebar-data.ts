import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  Building,
  GraduationCap,
  Settings,
  UserCog,
  Wrench,
  Palette,
  Bell,
  Monitor,
  Command,
  BookOpen,
  BookMarked,
  CalendarDays,
  Clock,
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
      title: 'General',
      items: [
        {
          title: 'Dashboard',
          url: '/',
          icon: LayoutDashboard,
        },
      ],
    },
    {
      title: 'User Management',
      items: [
        {
          title: 'Users',
          url: '/users',
          icon: Users,
        },
        {
          title: 'Roles',
          url: '/roles',
          icon: ShieldCheck,
        },
        {
          title: 'Permissions',
          url: '/permissions',
          icon: ShieldCheck, // You could choose another icon later
        },
      ],
    },
    {
      title: 'Master Data',
      items: [
        {
          title: 'Dormitories',
          url: '/dormitories',
          icon: Building,
        },
        {
          title: 'Schedule Slots',
          url: '/schedule-slots',
          icon: Clock,
        },
        {
          title: 'Students',
          url: '/students',
          icon: GraduationCap,
        },
      ],
    },
    {
      title: 'Academic',
      items: [
        {
          title: 'Classrooms',
          url: '/classrooms',
          icon: BookOpen,
        },
        {
          title: 'Subjects',
          url: '/subjects',
          icon: BookMarked,
        },
        {
          title: 'Schedules',
          url: '/schedules',
          icon: CalendarDays,
        },
      ],
    },
    {
      title: 'Other',
      items: [
        {
          title: 'Settings',
          icon: Settings,
          items: [
            {
              title: 'Profile',
              url: '/settings',
              icon: UserCog,
            },
            {
              title: 'Account',
              url: '/settings/account',
              icon: Wrench,
            },
            {
              title: 'Appearance',
              url: '/settings/appearance',
              icon: Palette,
            },
            {
              title: 'Notifications',
              url: '/settings/notifications',
              icon: Bell,
            },
            {
              title: 'Display',
              url: '/settings/display',
              icon: Monitor,
            },
          ],
        },
      ],
    },
  ],
}
