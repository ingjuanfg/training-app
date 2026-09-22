# Training Board

Plataforma para crear y visualizar entrenamientos por sede (admin mobile/laptop + lectura en TV).

## Stack

- Next.js (App Router) + TypeScript + Tailwind
- Supabase (Postgres)
- Vercel (deploy)

## Lo que necesitas configurar

### 1. Proyecto Supabase

**Instalación nueva:** ejecuta en el SQL Editor, en orden:

1. [`supabase/migrations/001_schema.sql`](supabase/migrations/001_schema.sql)
2. [`supabase/seed.sql`](supabase/seed.sql)

**Si ya tenías la versión anterior** (admin ligado a una sede):

1. [`supabase/migrations/002_multi_sede_admins.sql`](supabase/migrations/002_multi_sede_admins.sql)
2. [`supabase/seed.sql`](supabase/seed.sql) (actualiza admins/PINs)

En **Project Settings → API**, copia:

- Project URL → `SUPABASE_URL`
- `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (solo servidor)

### 2. Variables de entorno

```bash
cp .env.example .env.local
```

| Variable | Dónde obtenerla |
|----------|-----------------|
| `SUPABASE_URL` | Supabase → Settings → API → Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API → `service_role` |
| `SESSION_SECRET` | String aleatorio ≥ 32 caracteres (`openssl rand -base64 32`) |

### 3. Credenciales seed (cambiar en producción)

| Tipo | Credencial | Acceso |
|------|------------|--------|
| Admin | `personal` / `personal2026` | Ambas sedes |
| Admin | `dumbell` / `dumbell2026` | Ambas sedes |
| PIN TV | `2026` | Personal Box |
| PIN TV | `2027` | Dumbbell Club |

- **Usuario + clave** → panel admin (crea/edita WODs para una o ambas sedes)
- **PIN** → vista TV del día de esa sede (nombre + logo)

### 4. Desarrollo local

```bash
npm install
npm run dev
```

### 5. Tests

```bash
npm test
npm run test:coverage
```

### 6. Deploy en Vercel

Mismas 3 variables de entorno en el dashboard de Vercel.

## Flujos

- **Crear:** elige sedes (Dumbbell Club, Personal Box o ambas) → una copia por sede.
- **Lista:** resumen por fecha (`Dumbbell Club + Personal Box (iguales|distintos)` o `Solo …`).
- **Editar:** entras por una sede (origen) y eliges el alcance de la edición.
- **Eliminar:** eliges a qué sedes aplicar el borrado.
- **Lectura:** WOD del día (`America/Bogota`), pager por sección, tipografía TV, columnas equilibradas, secciones activas, logout.
