# API Documentation

> NestJS Clean Architecture API

Version: 1.0

## Auth

### Register a new user

**Method:** `POST`

**Endpoint:** `/auth/register`

#### Request Body

```typescript
{
  email: string;
  username?: string;
  password: string;
  name: string;
  roleId: string;
}
```

#### Responses

- **201**:

---

### Login with email, username, or identifier and password

**Method:** `POST`

**Endpoint:** `/auth/login`

#### Request Body

```typescript
{
  email?: string;
  username?: string;
  identifier?: string; // email or username fallback
  password: string;
}
```

#### Responses

- **200**:

---

### Refresh access token

**Method:** `POST`

**Endpoint:** `/auth/refresh`

#### Request Body

```typescript
{
  refreshToken: string;
}
```

#### Responses

- **200**:

---

### Logout (client-side token invalidation)

**Method:** `POST`

**Endpoint:** `/auth/logout`

**Requires Authentication:** Yes

#### Responses

- **200**:

---

### Get current user profile with effective permissions

**Method:** `GET`

**Endpoint:** `/auth/me`

**Requires Authentication:** Yes

#### Parameters

| Name          | In    | Required | Type    | Description                                                       |
| ------------- | ----- | -------- | ------- | ----------------------------------------------------------------- |
| includeScopes | query | No       | boolean | Include direct resource scopes and dormitory scope detail objects |

#### Responses

- **200**:

```typescript
{
  id: string;
  email: string;
  username: string | null;
  name: string;
  isActive: boolean;
  role: {
    id: string | null;
    name: string | null;
    isSystem: boolean | null;
  };
  permissions: string[];
  teacher?: {
    id: string;
  };
  // only when includeScopes=true
  scopes?: Array<{
    resource: string;
    resourceId: string;
  }>;
  // only when includeScopes=true
  dormitoryScopeIds?: string[];
  // only when includeScopes=true
  dormitoryScopes?: Array<{
    id: string;
    name: string;
    level: number;
    gender: 'PUTRA' | 'PUTRI';
  }>;
  createdAt: string;
  updatedAt: string;
}
```

---

## Users

### Create a new user

**Method:** `POST`

**Endpoint:** `/users`

**Requires Authentication:** Yes

#### Request Body

```typescript
{
  email: string;
  username?: string | null;
  password: string;
  name: string;
  roleId: string;
}
```

#### Responses

- **201**:

---

### List all users

**Method:** `GET`

**Endpoint:** `/users`

**Requires Authentication:** Yes

#### Parameters

| Name          | In    | Required | Type    | Description                                              |
| ------------- | ----- | -------- | ------- | -------------------------------------------------------- |
| page          | query | No       | number  |                                                          |
| limit         | query | No       | number  |                                                          |
| sortBy        | query | No       | string  |                                                          |
| sortOrder     | query | No       | string  |                                                          |
| search        | query | No       | string  | Generic text search                                      |
| isActive      | query | No       | boolean | Filter by active status                                  |
| includeScopes | query | No       | boolean | Include scopes and dormitory scope IDs in each user item |

#### Responses

- **200**:

```typescript
{
  data: Array<{
    id: string;
    email: string;
    username: string | null;
    name: string;
    isActive: boolean;
    roleId: string;
    role: {
      id: string;
      name: string;
      isSystem: boolean;
    } | null;
    createdAt: string;
    updatedAt: string;
    // only when includeScopes=true
    scopes?: Array<{
      resource: string;
      resourceId: string;
    }>;
    // only when includeScopes=true
    dormitoryScopeIds?: string[];
  }>;
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  }
}
```

---

### Find user by ID

**Method:** `GET`

**Endpoint:** `/users/{id}`

**Requires Authentication:** Yes

#### Parameters

| Name | In   | Required | Type   | Description |
| ---- | ---- | -------- | ------ | ----------- |
| id   | path | Yes      | string |             |

#### Responses

- **200**:

---

### Update a user

**Method:** `PATCH`

**Endpoint:** `/users/{id}`

**Requires Authentication:** Yes

#### Parameters

| Name | In   | Required | Type   | Description |
| ---- | ---- | -------- | ------ | ----------- |
| id   | path | Yes      | string |             |

#### Request Body

```typescript
{
  email?: string;
  username?: string | null;
  password?: string;
  name?: string;
  roleId?: string;
  isActive?: boolean;
}
```

#### Responses

- **200**:

---

### Delete a user

**Method:** `DELETE`

**Endpoint:** `/users/{id}`

**Requires Authentication:** Yes

#### Parameters

| Name | In   | Required | Type   | Description |
| ---- | ---- | -------- | ------ | ----------- |
| id   | path | Yes      | string |             |

#### Responses

- **200**:

---

## Student Histories

### Create student history

**Method:** `POST`
**Endpoint:** `/student-histories`
**Requires Authentication:** Yes (`student-history:create`)

#### Request Body

```typescript
{
  studentId: string;
  classId?: string;
  startDate: string; // ISO date
  endDate?: string; // ISO date
  status: 'STUDYING' | 'CLASS_TRANSFER' | 'TRACK_GRADUATED';
  classNameAtThatTime?: string;
  classTeacherAtThatTime?: string;
  dormNameAtThatTime?: string;
  trackNameAtThatTime?: string;
  trackIdAtThatTime?: string;
  dormitoryIdAtThatTime?: string;
  changeReason?: string;
}
```

### List student histories

**Method:** `GET`
**Endpoint:** `/student-histories`
**Requires Authentication:** Yes (`student-history:read`)

#### Query Parameters

- `page`, `limit`, `sortBy`, `sortOrder`
- `studentId?`, `classId?`, `status?`
- `includeDetails?` (boolean): include `student { id, name, nis, gender }`

### Find / Update / Delete student history

- `GET /student-histories/{id}` (`student-history:read`)
- `PATCH /student-histories/{id}` (`student-history:update`)
- `DELETE /student-histories/{id}` (`student-history:delete`)

---

## Dormitory Histories

### Create dormitory history

**Method:** `POST`
**Endpoint:** `/dormitory-histories`
**Requires Authentication:** Yes (`dormitory-history:create`)

#### Request Body

```typescript
{
  studentId: string;
  fromDormitoryId?: string;
  toDormitoryId: string;
  startDate: string; // ISO date
  endDate?: string; // ISO date
  status: 'ASSIGNED' | 'LEVEL_UP' | 'TRANSFERRED' | 'CHECKED_OUT';
  fromDormNameAtThatTime?: string;
  toDormNameAtThatTime?: string;
  fromLevel?: number;
  toLevel: number;
  changeReason?: string;
}
```

### List dormitory histories

**Method:** `GET`
**Endpoint:** `/dormitory-histories`
**Requires Authentication:** Yes (`dormitory-history:read`)

#### Query Parameters

- `page`, `limit`, `sortBy`, `sortOrder`
- `studentId?`, `toDormitoryId?`, `status?`

### Find / Update / Delete dormitory history

- `GET /dormitory-histories/{id}` (`dormitory-history:read`)
- `PATCH /dormitory-histories/{id}` (`dormitory-history:update`)
- `DELETE /dormitory-histories/{id}` (`dormitory-history:delete`)

---

### Get effective permissions (role + direct)

**Method:** `GET`

**Endpoint:** `/users/{id}/permissions`

**Requires Authentication:** Yes

#### Parameters

| Name | In   | Required | Type   | Description |
| ---- | ---- | -------- | ------ | ----------- |
| id   | path | Yes      | string |             |

#### Responses

- **200**:

---

### Assign direct permissions to user

**Method:** `POST`

**Endpoint:** `/users/{id}/permissions`

**Requires Authentication:** Yes

#### Parameters

| Name | In   | Required | Type   | Description |
| ---- | ---- | -------- | ------ | ----------- |
| id   | path | Yes      | string |             |

#### Request Body

```typescript
{
  permissionIds: Array<string>;
}
```

#### Responses

- **201**:

---

### Remove direct permission from user

**Method:** `DELETE`

**Endpoint:** `/users/{id}/permissions/{permissionId}`

**Requires Authentication:** Yes

#### Parameters

| Name         | In   | Required | Type   | Description |
| ------------ | ---- | -------- | ------ | ----------- |
| id           | path | Yes      | string |             |
| permissionId | path | Yes      | string |             |

#### Responses

- **200**:

---

### Get all resource scopes for user

**Method:** `GET`

**Endpoint:** `/users/{id}/scopes`

**Requires Authentication:** Yes

#### Parameters

| Name | In   | Required | Type   | Description |
| ---- | ---- | -------- | ------ | ----------- |
| id   | path | Yes      | string |             |

#### Responses

- **200**:

---

### Assign resource scopes to user

**Method:** `POST`

**Endpoint:** `/users/{id}/scopes`

**Requires Authentication:** Yes

#### Parameters

| Name | In   | Required | Type   | Description |
| ---- | ---- | -------- | ------ | ----------- |
| id   | path | Yes      | string |             |

#### Request Body

```typescript
{
  resource: string;
  resourceIds: Array<string>;
}
```

#### Responses

- **201**:

---

### Remove resource scopes from user

**Method:** `DELETE`

**Endpoint:** `/users/{id}/scopes`

**Requires Authentication:** Yes

#### Parameters

| Name | In   | Required | Type   | Description |
| ---- | ---- | -------- | ------ | ----------- |
| id   | path | Yes      | string |             |

#### Request Body

```typescript
{
  resource: string;
  resourceIds: Array<string>;
}
```

#### Responses

- **200**:

---

## Roles

### Create a new role

**Method:** `POST`

**Endpoint:** `/roles`

**Requires Authentication:** Yes

#### Request Body

```typescript
{
  name: string;
  description?: string;
}
```

#### Responses

- **201**:

---

### List all roles

**Method:** `GET`

**Endpoint:** `/roles`

**Requires Authentication:** Yes

#### Parameters

| Name      | In    | Required | Type    | Description             |
| --------- | ----- | -------- | ------- | ----------------------- |
| page      | query | No       | number  |                         |
| limit     | query | No       | number  |                         |
| sortBy    | query | No       | string  |                         |
| sortOrder | query | No       | string  |                         |
| search    | query | No       | string  | Generic text search     |
| isActive  | query | No       | boolean | Filter by active status |

#### Responses

- **200**:

---

### Find role by ID

**Method:** `GET`

**Endpoint:** `/roles/{id}`

**Requires Authentication:** Yes

#### Parameters

| Name | In   | Required | Type   | Description |
| ---- | ---- | -------- | ------ | ----------- |
| id   | path | Yes      | string |             |

#### Responses

- **200**:

---

### Update a role (non-system only)

**Method:** `PATCH`

**Endpoint:** `/roles/{id}`

**Requires Authentication:** Yes

#### Parameters

| Name | In   | Required | Type   | Description |
| ---- | ---- | -------- | ------ | ----------- |
| id   | path | Yes      | string |             |

#### Request Body

```typescript
{
  name?: string;
  description?: string;
}
```

#### Responses

- **200**:

---

### Delete a role (non-system only)

**Method:** `DELETE`

**Endpoint:** `/roles/{id}`

**Requires Authentication:** Yes

#### Parameters

| Name | In   | Required | Type   | Description |
| ---- | ---- | -------- | ------ | ----------- |
| id   | path | Yes      | string |             |

#### Responses

- **200**:

---

### Assign permissions to role (additive)

**Method:** `POST`

**Endpoint:** `/roles/{id}/permissions`

**Requires Authentication:** Yes

#### Parameters

| Name | In   | Required | Type   | Description |
| ---- | ---- | -------- | ------ | ----------- |
| id   | path | Yes      | string |             |

#### Request Body

```typescript
{
  permissionIds: Array<string>;
}
```

#### Responses

- **201**:

---

### Replace all permissions of role

**Method:** `PUT`

**Endpoint:** `/roles/{id}/permissions`

**Requires Authentication:** Yes

#### Parameters

| Name | In   | Required | Type   | Description |
| ---- | ---- | -------- | ------ | ----------- |
| id   | path | Yes      | string |             |

#### Request Body

```typescript
{
  permissionIds: Array<string>;
}
```

#### Responses

- **200**:

---

### Remove a permission from role

**Method:** `DELETE`

**Endpoint:** `/roles/{id}/permissions/{permissionId}`

**Requires Authentication:** Yes

#### Parameters

| Name         | In   | Required | Type   | Description |
| ------------ | ---- | -------- | ------ | ----------- |
| id           | path | Yes      | string |             |
| permissionId | path | Yes      | string |             |

#### Responses

- **200**:

---

## Permissions

### List all permissions

**Method:** `GET`

**Endpoint:** `/permissions`

**Requires Authentication:** Yes

#### Parameters

| Name     | In    | Required | Type   | Description             |
| -------- | ----- | -------- | ------ | ----------------------- |
| resource | query | No       | string | Filter by resource name |

#### Responses

- **200**:

---

## Audit Logs

### List audit logs

**Method:** `GET`

**Endpoint:** `/audit-logs`

**Requires Authentication:** Yes (`audit-log:read`)

#### Parameters

| Name        | In    | Required | Type   | Description                            |
| ----------- | ----- | -------- | ------ | -------------------------------------- |
| page        | query | No       | number |                                        |
| limit       | query | No       | number |                                        |
| sortBy      | query | No       | string | `createdAt`, `action`, `resource`, etc |
| sortOrder   | query | No       | string | `asc` \| `desc`                        |
| actorUserId | query | No       | string | Filter by actor user ID                |
| action      | query | No       | string | `create` \| `update` \| `delete`       |
| resource    | query | No       | string | Filter by resource name                |
| resourceId  | query | No       | string | Filter by resource ID                  |
| traceId     | query | No       | string | Filter by request trace ID             |
| createdFrom | query | No       | string | ISO date-time lower bound              |
| createdTo   | query | No       | string | ISO date-time upper bound              |

#### Responses

- **200**:

```typescript
{
  data: Array<{
    id: string;
    actorUserId: string;
    action: string;
    resource: string;
    resourceId: string | null;
    before: object | null;
    after: object | null;
    traceId: string | null;
    createdAt: string;
  }>;
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }
}
```

Sensitive keys such as `password`, `token`, `accessToken`, `refreshToken`, and
`authorization` are redacted when audit log JSON is returned.

---

## Dormitories

### Create a dormitory

**Method:** `POST`

**Endpoint:** `/dormitories`

**Requires Authentication:** Yes

#### Request Body

```typescript
{
  name: string;
  level: number;
  gender: 'PUTRA' | 'PUTRI';
}
```

#### Responses

- **201**:

---

### List dormitories (scope-aware)

**Method:** `GET`

**Endpoint:** `/dormitories`

**Requires Authentication:** Yes

#### Parameters

| Name      | In    | Required | Type           | Description                |
| --------- | ----- | -------- | -------------- | -------------------------- |
| page      | query | No       | number         |                            |
| limit     | query | No       | number         |                            |
| sortBy    | query | No       | string         |                            |
| sortOrder | query | No       | string         |                            |
| search    | query | No       | string         | Generic text search        |
| level     | query | No       | number         | Filter by dormitory level  |
| gender    | query | No       | PUTRA \| PUTRI | Filter by dormitory gender |
| isActive  | query | No       | boolean        | Filter by active status    |

#### Responses

- **200**:

---

### Find dormitory by ID (scope-aware)

**Method:** `GET`

**Endpoint:** `/dormitories/{id}`

**Requires Authentication:** Yes

#### Parameters

| Name | In   | Required | Type   | Description |
| ---- | ---- | -------- | ------ | ----------- |
| id   | path | Yes      | string |             |

#### Responses

- **200**:

---

### Update a dormitory

**Method:** `PATCH`

**Endpoint:** `/dormitories/{id}`

**Requires Authentication:** Yes

#### Parameters

| Name | In   | Required | Type   | Description |
| ---- | ---- | -------- | ------ | ----------- |
| id   | path | Yes      | string |             |

#### Request Body

```typescript
{
  name?: string;
  level?: number;
  gender?: 'PUTRA' | 'PUTRI';
  isActive?: boolean;
}
```

#### Responses

- **200**:

---

### Delete a dormitory

**Method:** `DELETE`

**Endpoint:** `/dormitories/{id}`

**Requires Authentication:** Yes

#### Parameters

| Name | In   | Required | Type   | Description |
| ---- | ---- | -------- | ------ | ----------- |
| id   | path | Yes      | string |             |

#### Responses

- **200**:

---

## Tracks

### Create a track

**Method:** `POST`

**Endpoint:** `/tracks`

**Requires Authentication:** Yes

#### Request Body

```typescript
{
  dormitoryId: string;
  name: string;
  level?: number; // optional insert position, auto append if omitted
  targetDays?: number; // default: 0
}
```

`level` menggunakan mode auto-order per dormitory:

- Jika `level` tidak dikirim, track baru otomatis masuk level terakhir.
- Jika `level` dikirim, track baru disisipkan pada level tersebut dan level track lain akan direindex otomatis.

#### Responses

- **201**:

---

### List tracks (scope-aware by dormitory)

**Method:** `GET`

**Endpoint:** `/tracks`

**Requires Authentication:** Yes

#### Parameters

| Name        | In    | Required | Type   | Description            |
| ----------- | ----- | -------- | ------ | ---------------------- |
| page        | query | No       | number |                        |
| limit       | query | No       | number |                        |
| sortBy      | query | No       | string |                        |
| sortOrder   | query | No       | string |                        |
| search      | query | No       | string | Generic text search    |
| dormitoryId | query | No       | string | Filter by dormitory ID |
| level       | query | No       | number | Filter by level        |

#### Responses

- **200**:

---

### Find track by ID (scope-aware by dormitory)

**Method:** `GET`

**Endpoint:** `/tracks/{id}`

**Requires Authentication:** Yes

#### Parameters

| Name | In   | Required | Type   | Description |
| ---- | ---- | -------- | ------ | ----------- |
| id   | path | Yes      | string |             |

#### Responses

- **200**:

---

### Update a track

**Method:** `PATCH`

**Endpoint:** `/tracks/{id}`

**Requires Authentication:** Yes

#### Parameters

| Name | In   | Required | Type   | Description |
| ---- | ---- | -------- | ------ | ----------- |
| id   | path | Yes      | string |             |

#### Request Body

```typescript
{
  dormitoryId?: string;
  name?: string;
  level?: number; // optional new position, will trigger reindex
  targetDays?: number;
}
```

Behavior update `level`:

- Saat `level` diubah pada dormitory yang sama, urutan level direindex otomatis.
- Saat `dormitoryId` dipindahkan, track dipindah ke dormitory target (append by default atau insert sesuai `level`) dan kedua dormitory direindex otomatis.

#### Responses

- **200**:

---

### Delete a track

**Method:** `DELETE`

**Endpoint:** `/tracks/{id}`

**Requires Authentication:** Yes

#### Parameters

| Name | In   | Required | Type   | Description |
| ---- | ---- | -------- | ------ | ----------- |
| id   | path | Yes      | string |             |

#### Responses

- **200**:

---

## Classes

### Create a class

**Method:** `POST`

**Endpoint:** `/classes`

**Requires Authentication:** Yes

#### Request Body

```typescript
{
  name: string;
  teacher: string;
  trackId: string;
  dormitoryId: string;
  teacherId?: string; // unique homeroom teacher assignment
  active?: boolean; // default: true
}
```

#### Responses

- **201**:

---

### List classes (scope-aware by dormitory)

**Method:** `GET`

**Endpoint:** `/classes`

**Requires Authentication:** Yes

#### Parameters

| Name           | In    | Required | Type    | Description                                                         |
| -------------- | ----- | -------- | ------- | ------------------------------------------------------------------- |
| page           | query | No       | number  |                                                                     |
| limit          | query | No       | number  |                                                                     |
| sortBy         | query | No       | string  |                                                                     |
| sortOrder      | query | No       | string  |                                                                     |
| search         | query | No       | string  | Generic text search                                                 |
| dormitoryId    | query | No       | string  | Filter by dormitory ID                                              |
| trackId        | query | No       | string  | Filter by track ID                                                  |
| teacherId      | query | No       | string  | Filter by teacher ID                                                |
| active         | query | No       | boolean | Filter by active flag                                               |
| includeDetails | query | No       | boolean | Include `track`, `dormitory`, `activeStudentCount`, `scheduleCount` |

#### Responses

- **200**:

---

### Find class by ID (scope-aware by dormitory)

**Method:** `GET`

**Endpoint:** `/classes/{id}`

**Requires Authentication:** Yes

#### Parameters

| Name | In   | Required | Type   | Description |
| ---- | ---- | -------- | ------ | ----------- |
| id   | path | Yes      | string |             |

#### Responses

- **200**:

---

### Update a class

**Method:** `PATCH`

**Endpoint:** `/classes/{id}`

**Requires Authentication:** Yes

#### Request Body

```typescript
{
  name?: string;
  teacher?: string;
  trackId?: string;
  dormitoryId?: string;
  teacherId?: string | null;
  active?: boolean;
}
```

#### Responses

- **200**:

---

### Delete a class

**Method:** `DELETE`

**Endpoint:** `/classes/{id}`

**Requires Authentication:** Yes

#### Responses

- **200**:

---

## Subjects

### Create a subject

**Method:** `POST`

**Endpoint:** `/subjects`

**Requires Authentication:** Yes

#### Request Body

```typescript
{
  name: string;
  trackId: string;
}
```

#### Responses

- **201**:

---

### List subjects (scope-aware through track dormitory)

**Method:** `GET`

**Endpoint:** `/subjects`

**Requires Authentication:** Yes

#### Parameters

| Name           | In    | Required | Type    | Description                                   |
| -------------- | ----- | -------- | ------- | --------------------------------------------- |
| page           | query | No       | number  |                                               |
| limit          | query | No       | number  |                                               |
| sortBy         | query | No       | string  |                                               |
| sortOrder      | query | No       | string  |                                               |
| search         | query | No       | string  | Generic text search                           |
| trackId        | query | No       | string  | Filter by track ID                            |
| dormitoryId    | query | No       | string  | Filter by dormitory ID via `track`            |
| includeDetails | query | No       | boolean | Include `track` and `track.dormitory` objects |

#### Responses

- **200**:

---

### Find subject by ID

**Method:** `GET`

**Endpoint:** `/subjects/{id}`

**Requires Authentication:** Yes

#### Parameters

| Name | In   | Required | Type   | Description |
| ---- | ---- | -------- | ------ | ----------- |
| id   | path | Yes      | string |             |

#### Responses

- **200**:

---

### Update a subject

**Method:** `PATCH`

**Endpoint:** `/subjects/{id}`

**Requires Authentication:** Yes

#### Request Body

```typescript
{
  name?: string;
  trackId?: string;
}
```

#### Responses

- **200**:

---

### Delete a subject

**Method:** `DELETE`

**Endpoint:** `/subjects/{id}`

**Requires Authentication:** Yes

#### Responses

- **200**:

---

## Teacher Subject Class Assignments

### Create assignment

**Method:** `POST`

**Endpoint:** `/teacher-subject-classes`

**Requires Authentication:** Yes

#### Request Body

```typescript
{
  teacherId: string;
  subjectId: string;
  classId: string;
  enforceStrictRule?: boolean; // default: true
}
```

#### Responses

- **201**:

---

### List assignments (scope-aware by classroom dormitory)

**Method:** `GET`

**Endpoint:** `/teacher-subject-classes`

**Requires Authentication:** Yes

#### Parameters

| Name        | In    | Required | Type   | Description                      |
| ----------- | ----- | -------- | ------ | -------------------------------- |
| page        | query | No       | number |                                  |
| limit       | query | No       | number |                                  |
| sortBy      | query | No       | string |                                  |
| sortOrder   | query | No       | string |                                  |
| teacherId   | query | No       | string | Filter by teacher ID             |
| subjectId   | query | No       | string | Filter by subject ID             |
| classId     | query | No       | string | Filter by class ID               |
| dormitoryId | query | No       | string | Filter by classroom dormitory ID |

#### Responses

- **200**:

---

### Find assignment by ID

**Method:** `GET`

**Endpoint:** `/teacher-subject-classes/{id}`

**Requires Authentication:** Yes

#### Responses

- **200**:

---

### Update assignment

**Method:** `PATCH`

**Endpoint:** `/teacher-subject-classes/{id}`

**Requires Authentication:** Yes

#### Request Body

```typescript
{
  teacherId?: string;
  subjectId?: string;
  classId?: string;
  enforceStrictRule?: boolean;
}
```

#### Responses

- **200**:

---

### Delete assignment

**Method:** `DELETE`

**Endpoint:** `/teacher-subject-classes/{id}`

**Requires Authentication:** Yes

#### Responses

- **200**:

---

## Schedules

### Create schedule

**Method:** `POST`

**Endpoint:** `/schedules`

**Requires Authentication:** Yes

#### Request Body

```typescript
{
  classId: string;
  subjectId: string;
  teacherId: string;
  scheduleSlotId: string;
  dayOfWeek: number; // 0..6
  validFrom: string; // ISO date-time
}
```

#### Responses

- **201**:

---

### List schedules

**Method:** `GET`

**Endpoint:** `/schedules`

**Requires Authentication:** Yes

#### Parameters

| Name           | In    | Required | Type    | Description                                                   |
| -------------- | ----- | -------- | ------- | ------------------------------------------------------------- |
| page           | query | No       | number  |                                                               |
| limit          | query | No       | number  |                                                               |
| sortBy         | query | No       | string  | `createdAt` \| `updatedAt` etc                                |
| sortOrder      | query | No       | string  | `asc` \| `desc`                                               |
| classId        | query | No       | string  | Filter by class ID                                            |
| subjectId      | query | No       | string  | Filter by subject ID                                          |
| teacherId      | query | No       | string  | Filter by teacher ID                                          |
| scheduleSlotId | query | No       | string  | Filter by schedule slot ID                                    |
| dormitoryId    | query | No       | string  | Filter by classroom dormitory ID                              |
| dayOfWeek      | query | No       | number  | 0..6                                                          |
| active         | query | No       | boolean | Filter active/inactive                                        |
| validFromFrom  | query | No       | string  | ISO date-time lower bound                                     |
| validFromTo    | query | No       | string  | ISO date-time upper bound                                     |
| includeDetails | query | No       | boolean | Include `class`, `subject`, `teacher`, `scheduleSlot` objects |

#### Responses

- **200**:

---

### Find schedule by ID

**Method:** `GET`

**Endpoint:** `/schedules/{id}`

**Requires Authentication:** Yes

#### Responses

- **200**:

---

### Update schedule (revision-based)

**Method:** `PATCH`

**Endpoint:** `/schedules/{id}`

**Requires Authentication:** Yes

#### Request Body

```typescript
{
  classId?: string;
  subjectId?: string;
  teacherId?: string;
  scheduleSlotId?: string;
  dayOfWeek?: number;
}
```

Notes:

- Update tidak overwrite record lama.
- Sistem akan close jadwal aktif lama (`validTo` terisi) lalu membuat record baru aktif.

#### Responses

- **200**:

---

### Deactivate schedule

**Method:** `DELETE`

**Endpoint:** `/schedules/{id}`

**Requires Authentication:** Yes

Notes:

- Endpoint ini melakukan deactivation (close period), bukan hard delete row.

#### Responses

- **200**:

---

## Schedule Slots

### Create schedule slot

**Method:** `POST`

**Endpoint:** `/schedule-slots`

**Requires Authentication:** Yes

#### Request Body

```typescript
{
  slot: number; // minimal 1
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  dormitoryId: string;
}
```

#### Responses

- **201**:

---

## Permits

### Create student permit

**Method:** `POST`

**Endpoint:** `/permits`

**Requires Authentication:** Yes

#### Request Body

```typescript
{
  studentId: string;
  startDate: string; // ISO date-time, timezone-aware
  endDate?: string; // ISO date-time, timezone-aware
  allowedSlots?: number[]; // [] or omitted means all schedule slots
  reason: string;
  type: 'SICK' | 'PERMIT';
}
```

#### Responses

- **201**:
- **422**: invalid period or duplicate/invalid `allowedSlots`

---

### List student permits

**Method:** `GET`

**Endpoint:** `/permits`

**Requires Authentication:** Yes

#### Parameters

| Name            | In    | Required | Type    | Description                                      |
| --------------- | ----- | -------- | ------- | ------------------------------------------------ |
| page            | query | No       | number  |                                                  |
| limit           | query | No       | number  |                                                  |
| sortBy          | query | No       | string  | `createdAt`, `updatedAt`, `startDate`, `endDate` |
| sortOrder       | query | No       | string  | `asc` \| `desc`                                  |
| studentId       | query | No       | string  | Filter by student ID                             |
| type            | query | No       | string  | `SICK` \| `PERMIT`                               |
| createdByUserId | query | No       | string  | Filter by creator user ID                        |
| startDateFrom   | query | No       | string  | ISO date-time lower bound                        |
| startDateTo     | query | No       | string  | ISO date-time upper bound                        |
| endDateFrom     | query | No       | string  | ISO date-time lower bound                        |
| endDateTo       | query | No       | string  | ISO date-time upper bound                        |
| includeDetails  | query | No       | boolean | Include `student` and `createdBy`                |

#### Responses

- **200**:

---

### Find / Update / Delete student permit

- `GET /permits/{id}` (`permit:read`)
- `PATCH /permits/{id}` (`permit:update`)
- `DELETE /permits/{id}` (`permit:delete`)

---

## Absences

### Create absence record

**Method:** `POST`

**Endpoint:** `/absences`

**Requires Authentication:** Yes

#### Request Body

```typescript
{
  studentId: string;
  scheduleId: string;
  absentDate: string; // YYYY-MM-DD
  status: 'PRESENT' | 'SICK' | 'PERMIT' | 'ABSENT';
  note?: string;
}
```

#### Responses

- **201**:
- **409**: duplicate absence for same `studentId + scheduleId + absentDate`

---

### List absences

**Method:** `GET`

**Endpoint:** `/absences`

**Requires Authentication:** Yes

#### Parameters

| Name           | In    | Required | Type   | Description |
| -------------- | ----- | -------- | ------ | ----------- |
| page           | query | No       | number |             |
| limit          | query | No       | number |             |
| sortBy         | query | No       | string |             |
| sortOrder      | query | No       | string |             |
| studentId      | query | No       | string |             |
| scheduleId     | query | No       | string |             |
| status         | query | No       | string |             |
| absentDateFrom | query | No       | string | YYYY-MM-DD  |
| absentDateTo   | query | No       | string | YYYY-MM-DD  |

#### Responses

- **200**:

---

### Find absence by ID

**Method:** `GET`

**Endpoint:** `/absences/{id}`

**Requires Authentication:** Yes

#### Responses

- **200**:
- **404**:

---

### Get classroom daily absence

**Method:** `GET`

**Endpoint:** `/absences/classroom-daily`

**Requires Authentication:** Yes

#### Parameters

| Name           | In    | Required | Type   | Description                  |
| -------------- | ----- | -------- | ------ | ---------------------------- |
| classId        | query | Yes      | string | Classroom ID                 |
| scheduleSlotId | query | Yes      | string | Schedule slot ID             |
| absentDate     | query | Yes      | string | Must be today (`YYYY-MM-DD`) |

#### Responses

- **200**:
- **422**: when `absentDate` is not today in `Asia/Jakarta`

When no absence row exists yet, active permits can be returned as default item
values:

```typescript
{
  items: Array<{
    studentId: string;
    studentName: string;
    studentNis: string;
    status: 'PRESENT' | 'SICK' | 'PERMIT' | 'ABSENT';
    note: string | null;
    absenceId: string | null;
    source: 'absence' | 'permit' | 'default';
    permit: {
      id: string;
      type: 'SICK' | 'PERMIT';
      reason: string;
      startDate: string;
      endDate: string | null;
      allowedSlots: number[];
    } | null;
  }>;
}
```

---

### Get current teacher absence session

**Method:** `GET`

**Endpoint:** `/absences/my-current-session`

**Requires Authentication:** Yes

Backend resolves the active session from the logged-in user's linked teacher,
current `Asia/Jakarta` time, today's day of week, and active schedule slot.

#### Parameters

| Name       | In    | Required | Type   | Description                                                                    |
| ---------- | ----- | -------- | ------ | ------------------------------------------------------------------------------ |
| absentDate | query | No       | string | Defaults to today in `Asia/Jakarta`; when provided, must be today `YYYY-MM-DD` |

#### Responses

- **200**:

```typescript
{
  activeSession: {
    absentDate: string;
    currentTime: string; // HH:mm Asia/Jakarta
    dayOfWeek: number;
    schedule: {
      id: string;
      dayOfWeek: number;
    };
    class: {
      id: string;
      name: string;
    };
    dormitory: {
      id: string;
      name: string | null;
      level: number | null;
      gender: string | null;
    };
    track: {
      id: string;
      name: string | null;
      level: number | null;
    };
    subject: {
      id: string;
      name: string;
    };
    teacher: {
      id: string;
      name: string;
    };
    scheduleSlot: {
      id: string;
      slot: number;
      startTime: string;
      endTime: string;
    };
    items: Array<{
      studentId: string;
      studentName: string;
      studentNis: string;
      status: 'PRESENT' | 'SICK' | 'PERMIT' | 'ABSENT';
      note: string | null;
      absenceId: string | null;
    }>;
  } | null;
  reason?: string;
  absentDate?: string;
  currentTime?: string;
  dayOfWeek?: number;
}
```

- **403**: when logged-in user is not linked to an active teacher
- **422**: when `absentDate` is not today or teacher has conflicting active schedules at the current time

Submit/update the returned session through `PUT /absences/classroom-daily`.

---

### Update absence

**Method:** `PATCH`

**Endpoint:** `/absences/{id}`

**Requires Authentication:** Yes

#### Request Body

```typescript
{
  studentId?: string;
  scheduleId?: string;
  absentDate?: string; // YYYY-MM-DD
  status?: 'PRESENT' | 'SICK' | 'PERMIT' | 'ABSENT';
  note?: string;
}
```

#### Responses

- **200**:

---

### Delete absence

**Method:** `DELETE`

**Endpoint:** `/absences/{id}`

**Requires Authentication:** Yes

#### Responses

- **200**:

---

### Batch upsert classroom daily absence

**Method:** `PUT`

**Endpoint:** `/absences/classroom-daily`

**Requires Authentication:** Yes

#### Request Body

```typescript
{
  classId: string;
  scheduleSlotId: string;
  absentDate: string; // must be today in Asia/Jakarta
  items: Array<{
    studentId: string;
    status: 'PRESENT' | 'SICK' | 'PERMIT' | 'ABSENT';
    note?: string;
  }>;
}
```

#### Responses

- **200**:
- **422**: when `absentDate` is not today or student not in active class roster

---

## Teacher Attendances

### Create teacher attendance record

**Method:** `POST`

**Endpoint:** `/teacher-attendances`

**Requires Authentication:** Yes

#### Request Body

```typescript
{
  teacherId: string;
  scheduleId: string;
  attendDate: string; // YYYY-MM-DD
  status: 'PRESENT' | 'SICK' | 'PERMIT' | 'ABSENT';
  note?: string;
}
```

#### Responses

- **201**:
- **409**: duplicate attendance for same `teacherId + scheduleId + attendDate`
- **422**: teacher does not match schedule teacher

---

### List teacher attendances

**Method:** `GET`

**Endpoint:** `/teacher-attendances`

**Requires Authentication:** Yes

#### Parameters

| Name           | In    | Required | Type    | Description                                  |
| -------------- | ----- | -------- | ------- | -------------------------------------------- |
| page           | query | No       | number  |                                              |
| limit          | query | No       | number  |                                              |
| sortBy         | query | No       | string  | `createdAt`, `updatedAt`, `attendDate`       |
| sortOrder      | query | No       | string  | `asc` \| `desc`                              |
| teacherId      | query | No       | string  | Filter by teacher ID                         |
| scheduleId     | query | No       | string  | Filter by schedule ID                        |
| status         | query | No       | string  | Filter by attendance status                  |
| attendDateFrom | query | No       | string  | YYYY-MM-DD lower bound                       |
| attendDateTo   | query | No       | string  | YYYY-MM-DD upper bound                       |
| dormitoryId    | query | No       | string  | Filter by schedule classroom dormitory       |
| scheduleSlotId | query | No       | string  | Filter by schedule slot                      |
| includeDetails | query | No       | boolean | Include `teacher` and `schedule` detail data |

#### Responses

- **200**:

---

### Get daily teacher attendance roster

**Method:** `GET`

**Endpoint:** `/teacher-attendances/daily`

**Requires Authentication:** Yes

#### Parameters

| Name           | In    | Required | Type   | Description         |
| -------------- | ----- | -------- | ------ | ------------------- |
| dormitoryId    | query | Yes      | string | Dormitory ID        |
| scheduleSlotId | query | Yes      | string | Schedule slot ID    |
| attendDate     | query | Yes      | string | Date (`YYYY-MM-DD`) |

#### Response Shape

```typescript
{
  dormitoryId: string;
  scheduleSlotId: string;
  attendDate: string;
  dayOfWeek: number;
  total: number;
  items: Array<{
    teacherId: string;
    teacherName: string;
    scheduleId: string;
    class: { id: string; name: string };
    subject: { id: string; name: string };
    scheduleSlot: {
      id: string;
      slot: number;
      startTime: string;
      endTime: string;
    };
    status: 'PRESENT' | 'SICK' | 'PERMIT' | 'ABSENT' | null;
    note: string | null;
    teacherAttendanceId: string | null;
    source: 'attendance' | 'empty';
  }>;
}
```

---

### Batch upsert daily teacher attendance

**Method:** `PUT`

**Endpoint:** `/teacher-attendances/daily`

**Requires Authentication:** Yes

#### Request Body

```typescript
{
  dormitoryId: string;
  scheduleSlotId: string;
  attendDate: string; // YYYY-MM-DD
  items: Array<{
    teacherId: string;
    scheduleId: string;
    status: 'PRESENT' | 'SICK' | 'PERMIT' | 'ABSENT';
    note?: string;
  }>;
}
```

#### Responses

- **200**:
- **422**: duplicate schedule in payload, schedule not in roster, or teacher mismatch

---

### Find / Update / Delete teacher attendance

- `GET /teacher-attendances/{id}` (`teacher-attendance:read`)
- `PATCH /teacher-attendances/{id}` (`teacher-attendance:update`)
- `DELETE /teacher-attendances/{id}` (`teacher-attendance:delete`)

---

### List schedule slots

**Method:** `GET`

**Endpoint:** `/schedule-slots`

**Requires Authentication:** Yes

#### Parameters

| Name        | In    | Required | Type   | Description              |
| ----------- | ----- | -------- | ------ | ------------------------ |
| page        | query | No       | number |                          |
| limit       | query | No       | number |                          |
| sortBy      | query | No       | string | `createdAt`, `slot`, dll |
| sortOrder   | query | No       | string | `asc` \| `desc`          |
| dormitoryId | query | No       | string | Filter by dormitory ID   |
| slot        | query | No       | number | Filter by slot number    |

#### Responses

- **200**:

---

### Find schedule slot by ID

**Method:** `GET`

**Endpoint:** `/schedule-slots/{id}`

**Requires Authentication:** Yes

#### Responses

- **200**:

---

### Update schedule slot

**Method:** `PATCH`

**Endpoint:** `/schedule-slots/{id}`

**Requires Authentication:** Yes

#### Request Body

```typescript
{
  slot?: number;
  startTime?: string; // HH:mm
  endTime?: string; // HH:mm
  dormitoryId?: string;
}
```

#### Responses

- **200**:

---

### Delete schedule slot

**Method:** `DELETE`

**Endpoint:** `/schedule-slots/{id}`

**Requires Authentication:** Yes

#### Responses

- **200**:

---

## Students

### Create a student

**Method:** `POST`

**Endpoint:** `/students`

**Requires Authentication:** Yes

#### Request Body

```typescript
{
  nis: string;
  name: string;
  placeOfBirth: string;
  dateOfBirth: string;
  address?: string;
  fatherName?: string;
  motherName?: string;
  parentPhone?: string;
  gender?: 'PUTRA' | 'PUTRI';
  dormitoryId?: string;
  status?: 'ACTIVE' | 'TRANSFERRED' | 'GRADUATED';
  exitDate?: string;
  exitReason?: string;
  exitNotes?: string;
}
```

#### Responses

- **201**:

---

### List students (scope-aware via dormitory)

**Method:** `GET`

**Endpoint:** `/students`

**Requires Authentication:** Yes

#### Parameters

| Name         | In    | Required | Type                               | Description                                      |
| ------------ | ----- | -------- | ---------------------------------- | ------------------------------------------------ |
| page         | query | No       | number                             |                                                  |
| limit        | query | No       | number                             |                                                  |
| sortBy       | query | No       | string                             |                                                  |
| sortOrder    | query | No       | string                             |                                                  |
| search       | query | No       | string                             | Generic text search                              |
| nis          | query | No       | string                             | Filter by NIS                                    |
| name         | query | No       | string                             | Filter by student name                           |
| placeOfBirth | query | No       | string                             | Filter by place of birth                         |
| dormitoryId  | query | No       | string                             | Filter by dormitory ID                           |
| gender       | query | No       | PUTRA \| PUTRI                     | Filter by gender                                 |
| status       | query | No       | ACTIVE \| TRANSFERRED \| GRADUATED | Filter by student status                         |
| fatherName   | query | No       | string                             | Filter by father name                            |
| motherName   | query | No       | string                             | Filter by mother name                            |
| parentPhone  | query | No       | string                             | Filter by parent phone                           |
| bornFrom     | query | No       | string                             | Birth date lower bound                           |
| bornTo       | query | No       | string                             | Birth date upper bound                           |
| exitFrom     | query | No       | string                             | Exit date lower bound                            |
| exitTo       | query | No       | string                             | Exit date upper bound                            |
| hasDormitory | query | No       | boolean                            | Filter by dormitory assignment status            |
| includes     | query | No       | string                             | Comma-separated includes. Supported: `dormitory` |

#### Responses

- **200**:

```typescript
{
  data: Array<{
    id: string;
    nis: string;
    name: string;
    placeOfBirth: string;
    dateOfBirth: string;
    address: string | null;
    fatherName: string | null;
    motherName: string | null;
    parentPhone: string | null;
    gender: 'PUTRA' | 'PUTRI';
    dormitoryId: string | null;
    status: 'ACTIVE' | 'TRANSFERRED' | 'GRADUATED';
    exitDate: string | null;
    exitReason: string | null;
    exitNotes: string | null;
    createdAt: string;
    updatedAt: string;
    // only when includes contains dormitory
    dormitory?: {
      id: string;
      name: string;
      level: number;
      gender: 'PUTRA' | 'PUTRI';
      isActive: boolean;
    } | null;
  }>;
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  }
}
```

---

### Find student by ID (scope-aware)

**Method:** `GET`

**Endpoint:** `/students/{id}`

**Requires Authentication:** Yes

#### Parameters

| Name | In   | Required | Type   | Description |
| ---- | ---- | -------- | ------ | ----------- |
| id   | path | Yes      | string |             |

#### Responses

- **200**:

---

### Update a student

**Method:** `PATCH`

**Endpoint:** `/students/{id}`

**Requires Authentication:** Yes

#### Parameters

| Name | In   | Required | Type   | Description |
| ---- | ---- | -------- | ------ | ----------- |
| id   | path | Yes      | string |             |

#### Request Body

```typescript
{
  nis?: string;
  name?: string;
  placeOfBirth?: string;
  dateOfBirth?: string;
  address?: string;
  fatherName?: string;
  motherName?: string;
  parentPhone?: string;
  gender?: 'PUTRA' | 'PUTRI';
  dormitoryId?: string;
  status?: 'ACTIVE' | 'TRANSFERRED' | 'GRADUATED';
  exitDate?: string;
  exitReason?: string;
  exitNotes?: string;
}
```

#### Responses

- **200**:

---

### Delete a student

**Method:** `DELETE`

**Endpoint:** `/students/{id}`

**Requires Authentication:** Yes

#### Parameters

| Name | In   | Required | Type   | Description |
| ---- | ---- | -------- | ------ | ----------- |
| id   | path | Yes      | string |             |

#### Responses

- **200**:

---

## Teachers

### Create a teacher

**Method:** `POST`

**Endpoint:** `/teachers`

**Requires Authentication:** Yes

#### Request Body

```typescript
{
  name: string;
  userId?: string;
  phone?: string;
  dormitoryIds?: string[];
}
```

#### Responses

- **201**:

---

### List teachers (scope-aware via dormitory)

**Method:** `GET`

**Endpoint:** `/teachers`

**Requires Authentication:** Yes

#### Parameters

| Name           | In    | Required | Type    | Description                                              |
| -------------- | ----- | -------- | ------- | -------------------------------------------------------- |
| page           | query | No       | number  |                                                          |
| limit          | query | No       | number  |                                                          |
| sortBy         | query | No       | string  |                                                          |
| sortOrder      | query | No       | string  |                                                          |
| search         | query | No       | string  | Generic text search                                      |
| userId         | query | No       | string  | Filter by linked user ID                                 |
| dormitoryId    | query | No       | string  | Filter by assigned dormitory ID                          |
| hasUser        | query | No       | boolean | Filter by linked-user availability                       |
| isActive       | query | No       | boolean | Filter by active status                                  |
| includeDetails | query | No       | boolean | Include linked `user` and assigned `dormitories` objects |

#### Responses

- **200**:

```typescript
{
  data: Array<{
    id: string;
    name: string;
    phone: string | null;
    userId: string | null;
    dormitoryIds: string[];
    isActive: boolean;
    // only when includeDetails=true
    user?: {
      id: string;
      email: string;
      name: string;
      isActive: boolean;
    } | null;
    // only when includeDetails=true
    dormitories?: Array<{
      id: string;
      name: string;
      level: number;
      gender: 'PUTRA' | 'PUTRI';
    }>;
    createdAt: string;
    updatedAt: string;
  }>;
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  }
}
```

---

### Find teacher by ID (scope-aware)

**Method:** `GET`

**Endpoint:** `/teachers/{id}`

**Requires Authentication:** Yes

#### Parameters

| Name | In   | Required | Type   | Description |
| ---- | ---- | -------- | ------ | ----------- |
| id   | path | Yes      | string |             |

#### Responses

- **200**:

---

### Update a teacher

**Method:** `PATCH`

**Endpoint:** `/teachers/{id}`

**Requires Authentication:** Yes

#### Parameters

| Name | In   | Required | Type   | Description |
| ---- | ---- | -------- | ------ | ----------- |
| id   | path | Yes      | string |             |

#### Request Body

```typescript
{
  name?: string;
  userId?: string;
  phone?: string;
  dormitoryIds?: string[];
  isActive?: boolean;
}
```

#### Responses

- **200**:

---

### Create or link a teacher login user

**Method:** `POST`

**Endpoint:** `/teachers/{id}/user`

**Requires Authentication:** Yes

#### Parameters

| Name | In   | Required | Type   | Description |
| ---- | ---- | -------- | ------ | ----------- |
| id   | path | Yes      | string | Teacher ID  |

#### Request Body

Create a new login user:

```typescript
{
  email: string;
  password: string;
  name?: string;
}
```

Or link an existing non-system user:

```typescript
{
  userId: string;
}
```

#### Responses

- **201**:

---

### Update a teacher login user

**Method:** `PATCH`

**Endpoint:** `/teachers/{id}/user`

**Requires Authentication:** Yes

#### Parameters

| Name | In   | Required | Type   | Description |
| ---- | ---- | -------- | ------ | ----------- |
| id   | path | Yes      | string | Teacher ID  |

#### Request Body

```typescript
{
  email?: string;
  password?: string;
  name?: string;
  isActive?: boolean;
}
```

#### Responses

- **200**:

---

### Deactivate a teacher login user

**Method:** `DELETE`

**Endpoint:** `/teachers/{id}/user`

**Requires Authentication:** Yes

#### Parameters

| Name | In   | Required | Type   | Description |
| ---- | ---- | -------- | ------ | ----------- |
| id   | path | Yes      | string | Teacher ID  |

#### Responses

- **200**:

---

### Delete a teacher

**Method:** `DELETE`

**Endpoint:** `/teachers/{id}`

**Requires Authentication:** Yes

#### Parameters

| Name | In   | Required | Type   | Description |
| ---- | ---- | -------- | ------ | ----------- |
| id   | path | Yes      | string |             |

#### Responses

- **200**:

---
