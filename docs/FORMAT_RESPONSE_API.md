# Format Response API

Dokumen ini merangkum format response sukses dan error yang dipakai backend pada project ini berdasarkan implementasi source code.

## Ringkasan

Project ini memakai:

- `ResponseInterceptor` untuk membungkus semua response sukses.
- `GlobalExceptionFilter` untuk menyeragamkan semua response error.
- `ValidationPipe` global di `main.ts` untuk memformat error validasi.

## 1. Format Response Sukses

Semua response sukses dibungkus ke bentuk umum berikut:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Data retrieved successfully",
  "data": {},
  "timestamp": "2026-04-20T10:00:00.000Z",
  "path": "/api/v1/example"
}
```

### Struktur umum

| Field | Type | Wajib | Keterangan |
|---|---|---|---|
| `success` | `boolean` | Ya | Selalu `true` untuk response sukses |
| `statusCode` | `number` | Ya | HTTP status code aktual |
| `message` | `string` | Ya | Pesan sukses otomatis berdasarkan HTTP method |
| `data` | `any` | Ya | Payload utama dari endpoint |
| `meta` | `object` | Tidak | Muncul jika endpoint mengembalikan data pagination |
| `timestamp` | `string` | Ya | ISO datetime saat response dibuat |
| `path` | `string` | Ya | URL path request |

### Mapping `message` sukses per HTTP method

| Method | Message |
|---|---|
| `GET` | `Data retrieved successfully` |
| `POST` | `Data created successfully` |
| `PATCH` | `Data updated successfully` |
| `PUT` | `Data updated successfully` |
| `DELETE` | `Data deleted successfully` |
| lainnya | `Operation successful` |

### Catatan

- Header `X-Trace-Id` juga dikirim pada response sukses jika request memiliki `traceId`.
- `traceId` tidak dimasukkan ke body response sukses.
- Jika use case/repository mengembalikan bentuk `{ data, meta }`, interceptor akan memisahkan `meta` ke level paling atas response.

## 2. Format Response Sukses Non-Pagination

Contoh umum:

```json
{
  "success": true,
  "statusCode": 201,
  "message": "Data created successfully",
  "data": {
    "id": "uuid",
    "name": "Example"
  },
  "timestamp": "2026-04-20T10:00:00.000Z",
  "path": "/api/v1/example"
}
```

### Contoh endpoint auth

Contoh `POST /api/v1/auth/login` atau `POST /api/v1/auth/register`:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Data created successfully",
  "data": {
    "accessToken": "jwt-access-token",
    "refreshToken": "jwt-refresh-token",
    "expiresIn": "15m",
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "User Name"
    }
  },
  "timestamp": "2026-04-20T10:00:00.000Z",
  "path": "/api/v1/auth/login"
}
```

Contoh `POST /api/v1/auth/logout`:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Data created successfully",
  "data": {
    "message": "Logged out successfully"
  },
  "timestamp": "2026-04-20T10:00:00.000Z",
  "path": "/api/v1/auth/logout"
}
```

Catatan penting:

- `logout` tetap dibungkus ke field `data`.
- Karena endpoint `logout` memakai method `POST`, wrapper global tetap memberi message `Data created successfully`, walaupun payload internal-nya berisi `Logged out successfully`.

## 3. Format Response Sukses Pagination

Untuk endpoint list seperti users, roles, dormitories, dan students, bentuk response sukses adalah:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Data retrieved successfully",
  "data": [],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  },
  "timestamp": "2026-04-20T10:00:00.000Z",
  "path": "/api/v1/users?page=1&limit=10"
}
```

### Struktur `meta`

| Field | Type | Wajib | Keterangan |
|---|---|---|---|
| `total` | `number` | Ya | Total seluruh data |
| `page` | `number` | Ya | Halaman saat ini |
| `limit` | `number` | Ya | Jumlah item per halaman |
| `totalPages` | `number` | Ya | Total halaman |

### Query pagination yang didukung

| Query | Type | Default |
|---|---|---|
| `page` | `number` | `1` |
| `limit` | `number` | `10` |
| `sortBy` | `string` | `createdAt` |
| `sortOrder` | `'asc' \| 'desc'` | `desc` |
| `search` | `string` | `undefined` |
| `isActive` | `boolean` | `undefined` |

## 4. Format Response Error

Semua error dibungkus ke bentuk umum berikut:

```json
{
  "success": false,
  "statusCode": 401,
  "error": "UNAUTHORIZED",
  "errorType": "auth",
  "message": "Invalid email or password",
  "traceId": "uuid-trace-id",
  "timestamp": "2026-04-20T10:00:00.000Z",
  "path": "/api/v1/auth/login"
}
```

### Struktur umum

| Field | Type | Wajib | Keterangan |
|---|---|---|---|
| `success` | `boolean` | Ya | Selalu `false` |
| `statusCode` | `number` | Ya | HTTP status code akhir |
| `error` | `string` | Ya | Machine-readable error code |
| `errorType` | `string` | Ya | Kategori error |
| `message` | `string` | Ya | Pesan error untuk client |
| `details` | `array` | Tidak | Khusus validasi, berisi detail field error |
| `traceId` | `string` | Ya | Trace id request |
| `timestamp` | `string` | Ya | ISO datetime saat error dibuat |
| `path` | `string` | Ya | URL path request |

## 5. Nilai `errorType`

| `errorType` | Kapan dipakai |
|---|---|
| `validation` | Error validasi request |
| `auth` | Error autentikasi / unauthorized |
| `business` | Forbidden, not found, conflict, scope violation, dan business rule lain |
| `database` | Unhandled error dari Prisma/database |
| `system` | Internal server error / error tak terduga |

## 6. Error Code yang Dipakai

Berikut konstanta error code yang ditemukan:

| Error Code |
|---|
| `VALIDATION_ERROR` |
| `UNAUTHORIZED` |
| `FORBIDDEN` |
| `NOT_FOUND` |
| `CONFLICT` |
| `INTERNAL_SERVER_ERROR` |
| `SYSTEM_ROLE_IMMUTABLE` |
| `SCOPE_VIOLATION` |

## 7. Format Error Validasi

Error validasi dari `ValidationPipe` awalnya dibuat sebagai `400 Bad Request`, lalu diubah oleh `GlobalExceptionFilter` menjadi `422 Unprocessable Entity`.

### Bentuk final error validasi

```json
{
  "success": false,
  "statusCode": 422,
  "error": "VALIDATION_ERROR",
  "errorType": "validation",
  "message": "email must be a valid email address, password must be at least 8 characters",
  "details": [
    {
      "field": "email",
      "message": "email must be a valid email address"
    },
    {
      "field": "password",
      "message": "password must be at least 8 characters"
    }
  ],
  "traceId": "uuid-trace-id",
  "timestamp": "2026-04-20T10:00:00.000Z",
  "path": "/api/v1/auth/register"
}
```

### Struktur `details`

| Field | Type | Wajib | Keterangan |
|---|---|---|---|
| `field` | `string` | Umumnya Ya | Nama field yang gagal validasi |
| `message` | `string` | Ya | Pesan validasi field tersebut |

### Catatan validasi

- Nested validation akan memakai format path seperti `parent.child`.
- `whitelist: true` akan membuang field yang tidak dikenal.
- `forbidNonWhitelisted: true` membuat field asing menjadi error validasi.
- `transform: true` dan `enableImplicitConversion: true` membuat query/body tertentu otomatis dikonversi.

## 8. Contoh Error Umum

### Unauthorized

```json
{
  "success": false,
  "statusCode": 401,
  "error": "UNAUTHORIZED",
  "errorType": "auth",
  "message": "Invalid or expired refresh token",
  "traceId": "uuid-trace-id",
  "timestamp": "2026-04-20T10:00:00.000Z",
  "path": "/api/v1/auth/refresh"
}
```

### Forbidden

```json
{
  "success": false,
  "statusCode": 403,
  "error": "FORBIDDEN",
  "errorType": "business",
  "message": "Insufficient permissions",
  "traceId": "uuid-trace-id",
  "timestamp": "2026-04-20T10:00:00.000Z",
  "path": "/api/v1/users"
}
```

### Not Found

```json
{
  "success": false,
  "statusCode": 404,
  "error": "NOT_FOUND",
  "errorType": "business",
  "message": "User not found",
  "traceId": "uuid-trace-id",
  "timestamp": "2026-04-20T10:00:00.000Z",
  "path": "/api/v1/users/123"
}
```

### Conflict

```json
{
  "success": false,
  "statusCode": 409,
  "error": "CONFLICT",
  "errorType": "business",
  "message": "Email already exists",
  "traceId": "uuid-trace-id",
  "timestamp": "2026-04-20T10:00:00.000Z",
  "path": "/api/v1/auth/register"
}
```

### Business Rule Khusus

```json
{
  "success": false,
  "statusCode": 403,
  "error": "SYSTEM_ROLE_IMMUTABLE",
  "errorType": "business",
  "message": "System roles cannot be modified",
  "traceId": "uuid-trace-id",
  "timestamp": "2026-04-20T10:00:00.000Z",
  "path": "/api/v1/roles/role-id"
}
```

```json
{
  "success": false,
  "statusCode": 403,
  "error": "SCOPE_VIOLATION",
  "errorType": "business",
  "message": "You do not have access to this dormitory",
  "traceId": "uuid-trace-id",
  "timestamp": "2026-04-20T10:00:00.000Z",
  "path": "/api/v1/dormitories/dormitory-id"
}
```

## 9. Error Internal / Unhandled

Jika terjadi error tak tertangani:

```json
{
  "success": false,
  "statusCode": 500,
  "error": "INTERNAL_SERVER_ERROR",
  "errorType": "system",
  "message": "Internal server error",
  "traceId": "uuid-trace-id",
  "timestamp": "2026-04-20T10:00:00.000Z",
  "path": "/api/v1/example"
}
```

Jika error tak tertangani berasal dari Prisma, `errorType` akan menjadi `database`.

## 10. Sumber Implementasi

Referensi utama dokumen ini:

- `src/application/common/interceptors/response.interceptor.ts`
- `src/application/common/filters/global-exception.filter.ts`
- `src/main.ts`
- `src/shared/constants/error-codes.ts`
- `src/shared/types/pagination.types.ts`
- `src/shared/utils/pagination.util.ts`
- `src/infrastructure/database/repositories/prisma-user.repository.ts`
- `src/infrastructure/database/repositories/prisma-role.repository.ts`
- `src/infrastructure/database/repositories/prisma-dormitory.repository.ts`
- `src/infrastructure/database/repositories/prisma-student.repository.ts`
- `src/application/modules/auth/auth.controller.ts`
- `test/auth.e2e-spec.ts`
