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
  password: string;
  name: string;
  roleId: string;
}
```

#### Responses

- **201**:

---

### Login with email and password

**Method:** `POST`

**Endpoint:** `/auth/login`

#### Request Body

```typescript
{
  email: string;
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

#### Responses

- **200**:

```typescript
{
  id: string;
  email: string;
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

| Name | In | Required | Type | Description |
| --- | --- | --- | --- | --- |
| page | query | No | number |  |
| limit | query | No | number |  |
| sortBy | query | No | string |  |
| sortOrder | query | No | string |  |
| search | query | No | string | Generic text search |
| isActive | query | No | boolean | Filter by active status |

#### Responses

- **200**:

---

### Find user by ID

**Method:** `GET`

**Endpoint:** `/users/{id}`

**Requires Authentication:** Yes

#### Parameters

| Name | In | Required | Type | Description |
| --- | --- | --- | --- | --- |
| id | path | Yes | string |  |

#### Responses

- **200**:

---

### Update a user

**Method:** `PATCH`

**Endpoint:** `/users/{id}`

**Requires Authentication:** Yes

#### Parameters

| Name | In | Required | Type | Description |
| --- | --- | --- | --- | --- |
| id | path | Yes | string |  |

#### Request Body

```typescript
{
  email?: string;
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

| Name | In | Required | Type | Description |
| --- | --- | --- | --- | --- |
| id | path | Yes | string |  |

#### Responses

- **200**:

---

### Get effective permissions (role + direct)

**Method:** `GET`

**Endpoint:** `/users/{id}/permissions`

**Requires Authentication:** Yes

#### Parameters

| Name | In | Required | Type | Description |
| --- | --- | --- | --- | --- |
| id | path | Yes | string |  |

#### Responses

- **200**:

---

### Assign direct permissions to user

**Method:** `POST`

**Endpoint:** `/users/{id}/permissions`

**Requires Authentication:** Yes

#### Parameters

| Name | In | Required | Type | Description |
| --- | --- | --- | --- | --- |
| id | path | Yes | string |  |

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

| Name | In | Required | Type | Description |
| --- | --- | --- | --- | --- |
| id | path | Yes | string |  |
| permissionId | path | Yes | string |  |

#### Responses

- **200**:

---

### Get all resource scopes for user

**Method:** `GET`

**Endpoint:** `/users/{id}/scopes`

**Requires Authentication:** Yes

#### Parameters

| Name | In | Required | Type | Description |
| --- | --- | --- | --- | --- |
| id | path | Yes | string |  |

#### Responses

- **200**:

---

### Assign resource scopes to user

**Method:** `POST`

**Endpoint:** `/users/{id}/scopes`

**Requires Authentication:** Yes

#### Parameters

| Name | In | Required | Type | Description |
| --- | --- | --- | --- | --- |
| id | path | Yes | string |  |

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

| Name | In | Required | Type | Description |
| --- | --- | --- | --- | --- |
| id | path | Yes | string |  |

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

| Name | In | Required | Type | Description |
| --- | --- | --- | --- | --- |
| page | query | No | number |  |
| limit | query | No | number |  |
| sortBy | query | No | string |  |
| sortOrder | query | No | string |  |
| search | query | No | string | Generic text search |
| isActive | query | No | boolean | Filter by active status |

#### Responses

- **200**:

---

### Find role by ID

**Method:** `GET`

**Endpoint:** `/roles/{id}`

**Requires Authentication:** Yes

#### Parameters

| Name | In | Required | Type | Description |
| --- | --- | --- | --- | --- |
| id | path | Yes | string |  |

#### Responses

- **200**:

---

### Update a role (non-system only)

**Method:** `PATCH`

**Endpoint:** `/roles/{id}`

**Requires Authentication:** Yes

#### Parameters

| Name | In | Required | Type | Description |
| --- | --- | --- | --- | --- |
| id | path | Yes | string |  |

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

| Name | In | Required | Type | Description |
| --- | --- | --- | --- | --- |
| id | path | Yes | string |  |

#### Responses

- **200**:

---

### Assign permissions to role (additive)

**Method:** `POST`

**Endpoint:** `/roles/{id}/permissions`

**Requires Authentication:** Yes

#### Parameters

| Name | In | Required | Type | Description |
| --- | --- | --- | --- | --- |
| id | path | Yes | string |  |

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

| Name | In | Required | Type | Description |
| --- | --- | --- | --- | --- |
| id | path | Yes | string |  |

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

| Name | In | Required | Type | Description |
| --- | --- | --- | --- | --- |
| id | path | Yes | string |  |
| permissionId | path | Yes | string |  |

#### Responses

- **200**:

---

## Permissions

### List all permissions

**Method:** `GET`

**Endpoint:** `/permissions`

**Requires Authentication:** Yes

#### Parameters

| Name | In | Required | Type | Description |
| --- | --- | --- | --- | --- |
| resource | query | No | string | Filter by resource name |

#### Responses

- **200**:

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

| Name | In | Required | Type | Description |
| --- | --- | --- | --- | --- |
| page | query | No | number |  |
| limit | query | No | number |  |
| sortBy | query | No | string |  |
| sortOrder | query | No | string |  |
| search | query | No | string | Generic text search |
| level | query | No | number | Filter by dormitory level |
| gender | query | No | PUTRA \| PUTRI | Filter by dormitory gender |
| isActive | query | No | boolean | Filter by active status |

#### Responses

- **200**:

---

### Find dormitory by ID (scope-aware)

**Method:** `GET`

**Endpoint:** `/dormitories/{id}`

**Requires Authentication:** Yes

#### Parameters

| Name | In | Required | Type | Description |
| --- | --- | --- | --- | --- |
| id | path | Yes | string |  |

#### Responses

- **200**:

---

### Update a dormitory

**Method:** `PATCH`

**Endpoint:** `/dormitories/{id}`

**Requires Authentication:** Yes

#### Parameters

| Name | In | Required | Type | Description |
| --- | --- | --- | --- | --- |
| id | path | Yes | string |  |

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

| Name | In | Required | Type | Description |
| --- | --- | --- | --- | --- |
| id | path | Yes | string |  |

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

| Name | In | Required | Type | Description |
| --- | --- | --- | --- | --- |
| page | query | No | number |  |
| limit | query | No | number |  |
| sortBy | query | No | string |  |
| sortOrder | query | No | string |  |
| search | query | No | string | Generic text search |
| nis | query | No | string | Filter by NIS |
| name | query | No | string | Filter by student name |
| placeOfBirth | query | No | string | Filter by place of birth |
| dormitoryId | query | No | string | Filter by dormitory ID |
| gender | query | No | PUTRA \| PUTRI | Filter by gender |
| status | query | No | ACTIVE \| TRANSFERRED \| GRADUATED | Filter by student status |
| fatherName | query | No | string | Filter by father name |
| motherName | query | No | string | Filter by mother name |
| parentPhone | query | No | string | Filter by parent phone |
| bornFrom | query | No | string | Birth date lower bound |
| bornTo | query | No | string | Birth date upper bound |
| exitFrom | query | No | string | Exit date lower bound |
| exitTo | query | No | string | Exit date upper bound |
| hasDormitory | query | No | boolean | Filter by dormitory assignment status |

#### Responses

- **200**:

---

### Find student by ID (scope-aware)

**Method:** `GET`

**Endpoint:** `/students/{id}`

**Requires Authentication:** Yes

#### Parameters

| Name | In | Required | Type | Description |
| --- | --- | --- | --- | --- |
| id | path | Yes | string |  |

#### Responses

- **200**:

---

### Update a student

**Method:** `PATCH`

**Endpoint:** `/students/{id}`

**Requires Authentication:** Yes

#### Parameters

| Name | In | Required | Type | Description |
| --- | --- | --- | --- | --- |
| id | path | Yes | string |  |

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

| Name | In | Required | Type | Description |
| --- | --- | --- | --- | --- |
| id | path | Yes | string |  |

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

| Name | In | Required | Type | Description |
| --- | --- | --- | --- | --- |
| page | query | No | number |  |
| limit | query | No | number |  |
| sortBy | query | No | string |  |
| sortOrder | query | No | string |  |
| search | query | No | string | Generic text search |
| userId | query | No | string | Filter by linked user ID |
| dormitoryId | query | No | string | Filter by assigned dormitory ID |
| hasUser | query | No | boolean | Filter by linked-user availability |
| isActive | query | No | boolean | Filter by active status |

#### Responses

- **200**:

---

### Find teacher by ID (scope-aware)

**Method:** `GET`

**Endpoint:** `/teachers/{id}`

**Requires Authentication:** Yes

#### Parameters

| Name | In | Required | Type | Description |
| --- | --- | --- | --- | --- |
| id | path | Yes | string |  |

#### Responses

- **200**:

---

### Update a teacher

**Method:** `PATCH`

**Endpoint:** `/teachers/{id}`

**Requires Authentication:** Yes

#### Parameters

| Name | In | Required | Type | Description |
| --- | --- | --- | --- | --- |
| id | path | Yes | string |  |

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

| Name | In | Required | Type | Description |
| --- | --- | --- | --- | --- |
| id | path | Yes | string | Teacher ID |

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

| Name | In | Required | Type | Description |
| --- | --- | --- | --- | --- |
| id | path | Yes | string | Teacher ID |

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

| Name | In | Required | Type | Description |
| --- | --- | --- | --- | --- |
| id | path | Yes | string | Teacher ID |

#### Responses

- **200**:

---

### Delete a teacher

**Method:** `DELETE`

**Endpoint:** `/teachers/{id}`

**Requires Authentication:** Yes

#### Parameters

| Name | In | Required | Type | Description |
| --- | --- | --- | --- | --- |
| id | path | Yes | string |  |

#### Responses

- **200**:

---
