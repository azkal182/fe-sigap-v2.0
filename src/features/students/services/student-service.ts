import { api } from '@/lib/axios'

// ─── Types ────────────────────────────────────────────────────────────────────

export type StudentGender = 'PUTRA' | 'PUTRI'
export type StudentStatus = 'ACTIVE' | 'TRANSFERRED' | 'GRADUATED'

export interface StudentDormitory {
  id: string
  name: string
  level: number
  gender: StudentGender
}

export interface Student {
  id: string
  nis: string
  name: string
  placeOfBirth: string
  dateOfBirth: string
  address?: string
  fatherName?: string
  motherName?: string
  parentPhone?: string
  gender?: StudentGender
  status: StudentStatus
  dormitoryId?: string
  dormitory?: StudentDormitory
  exitDate?: string
  exitReason?: string
  exitNotes?: string
  createdAt?: string
  updatedAt?: string
}

export interface PaginationParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  search?: string
  gender?: StudentGender
  status?: StudentStatus
  dormitoryId?: string
  includes?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export interface CreateStudentDto {
  nis: string
  name: string
  placeOfBirth: string
  dateOfBirth: string
  address?: string
  fatherName?: string
  motherName?: string
  parentPhone?: string
  gender?: StudentGender
  dormitoryId?: string
  status?: StudentStatus
}

export interface UpdateStudentDto {
  nis?: string
  name?: string
  placeOfBirth?: string
  dateOfBirth?: string
  address?: string
  fatherName?: string
  motherName?: string
  parentPhone?: string
  gender?: StudentGender
  dormitoryId?: string
  status?: StudentStatus
  exitDate?: string
  exitReason?: string
  exitNotes?: string
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const studentService = {
  /** GET /students — list with pagination + filters (scope-aware) */
  getStudents: async (
    params?: PaginationParams
  ): Promise<PaginatedResponse<Student>> => {
    const response = (await api.get('/students', { params })) as any
    return { data: response.data, meta: response.meta }
  },

  /** GET /students/:id — single student detail (scope-aware) */
  getStudent: async (id: string): Promise<Student> => {
    const response = (await api.get(`/students/${id}`)) as any
    return response.data as Student
  },

  /** POST /students — create student */
  createStudent: async (dto: CreateStudentDto): Promise<Student> => {
    const response = (await api.post('/students', dto)) as any
    return response.data as Student
  },

  /** PATCH /students/:id — update student */
  updateStudent: async (
    id: string,
    dto: UpdateStudentDto
  ): Promise<Student> => {
    const response = (await api.patch(`/students/${id}`, dto)) as any
    return response.data as Student
  },

  /** DELETE /students/:id — delete student */
  deleteStudent: async (id: string): Promise<void> => {
    await api.delete(`/students/${id}`)
  },
}
