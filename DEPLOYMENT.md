# Inmobiliaria Libra - Deployment Guide

## 🚀 Deploy a Producción

### 1. Base de Datos Neon

#### Resetear Base de Datos en Neon
1. Ve a [Neon Console](https://console.neon.tech)
2. Selecciona tu proyecto
3. Ve a la pestaña "SQL Editor"
4. Ejecuta los siguientes comandos para limpiar las tablas existentes:

```sql
DROP TABLE IF EXISTS property_services CASCADE;
DROP TABLE IF EXISTS property_images CASCADE;
DROP TABLE IF EXISTS rooms CASCADE;
DROP TABLE IF EXISTS services CASCADE;
DROP TABLE IF EXISTS properties CASCADE;
```

#### Configurar Schema en Neon
Desde tu terminal local:

```bash
# DEVELOP
export DATABASE_URL="postgresql://neondb_owner:npg_o7jrm4QhXuLi@ep-proud-art-afex9xwu-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require"
node scripts/setup-neon-db.js

# PRODUCCIÓN
export DATABASE_URL="postgresql://neondb_owner:npg_o7jrm4QhXuLi@ep-rapid-recipe-afacloth-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require"
node scripts/setup-neon-db.js
```

O manualmente en el SQL Editor de Neon:
- Copia el contenido de `scripts/001-create-properties-schema.sql`
- Pégalo en el SQL Editor
- Ejecuta el script

### 2. Variables de Entorno en Vercel/Producción

Configura estas variables en tu plataforma de deployment:

**DEVELOP:**
```bash
DATABASE_URL=postgresql://neondb_owner:npg_o7jrm4QhXuLi@ep-proud-art-afex9xwu-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require
```

**PRODUCCIÓN:**
```bash
DATABASE_URL=postgresql://neondb_owner:npg_o7jrm4QhXuLi@ep-rapid-recipe-afacloth-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require
```

**Cloudinary (ambos ambientes):**
```bash
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dkb2tmwqk
CLOUDINARY_API_KEY=949399345196184
CLOUDINARY_API_SECRET=TiD0ke0GU45uES8-WBLgrKwYTsc
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=unsigned_upload
```

### 3. Deploy a Vercel

```bash
# Instalar Vercel CLI si no lo tienes
npm i -g vercel

# Hacer login
vercel login

# Deploy
vercel

# O deploy a producción directamente
vercel --prod
```

### 4. Configurar Cloudinary Upload Preset

1. Ve a [Cloudinary Console](https://cloudinary.com/console)
2. Settings → Upload → Upload presets
3. Crea un preset llamado `unsigned_upload`
4. Configuración:
   - **Signing mode**: Unsigned
   - **Preset name**: `unsigned_upload`
   - **Folder**: `rental-properties` (opcional)
5. Guarda

## 📋 Checklist Pre-Deploy

- [ ] Base de datos Neon creada y schema ejecutado
- [ ] Variables de entorno configuradas en Vercel
- [ ] Cloudinary upload preset `unsigned_upload` creado
- [ ] `.env.local` en `.gitignore` (ya configurado)
- [ ] Tests locales pasando
- [ ] Build exitoso: `npm run build`

## 🔄 Desarrollo Local

```bash
# Usar base de datos local
DATABASE_URL=postgresql://postgres:Cgt1986!@localhost:5432/imobiliarialibra

# Inicializar DB local
node scripts/setup-db.js

# Correr dev server
npm run dev
```

## 📦 Structure

- `/app` - Next.js 14+ App Router
- `/components` - Componentes React reutilizables
- `/lib` - Utilidades y tipos
- `/scripts` - Scripts de base de datos
- `/public` - Archivos estáticos

## 🛠️ Tech Stack

- **Framework**: Next.js 14
- **Database**: PostgreSQL (Neon)
- **Storage**: Cloudinary
- **UI**: shadcn/ui + Tailwind CSS
- **Alerts**: SweetAlert2
