# Empowerme · sitio + sistema

Demo funcional del sitio público y del panel de administración de **Empowerme Community**.

- **Sitio**: inicio, experiencias (lista y calendario), detalle con reserva tipo calendario, programas para empresas, carrito, registro con Google, consentimientos (privacidad, uso de imagen y responsiva), pago, boletos con QR y cuenta personal.
- **Admin** (`/admin`): resumen con métricas, alta/edición de experiencias con fechas y cupos, agenda, inscritos, check-in con QR, CRM de personas, embudo de empresas (kanban), programas y bandeja de envíos.

Stack: Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 · Motion · Supabase · Stripe · Resend · WhatsApp Cloud API.

## Correr en local

```bash
npm install
npm run dev
```

Abre http://localhost:3000. Sin variables de entorno corre en **modo demo**:

| Pieza | Modo demo | Con llaves |
|---|---|---|
| Datos | En memoria, con datos de ejemplo (se reinician al reiniciar el servidor) | Supabase (Postgres) |
| Login | "Continuar con Google" simulado · `/login?admin=1` para entrar como admin | Google OAuth + enlace mágico (Supabase Auth) |
| Pagos | Pasarela simulada | Stripe Checkout (modo prueba o live) |
| Correo / WhatsApp | Se registran en Admin › Envíos como "simulado" | Resend / WhatsApp Cloud API |

## Conectar Supabase

1. Crea un proyecto en Supabase y ejecuta `supabase/schema.sql` en **SQL Editor**.
2. En **Authentication › Providers** activa Google (Client ID y Secret de Google Cloud).
3. En **Authentication › URL Configuration** agrega `https://TU-DOMINIO/auth/callback` (y la URL de Vercel) a *Redirect URLs*.
4. Copia `.env.example` a `.env.local` y llena `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` y `ADMIN_EMAILS` (correos que serán admin).
5. Carga los datos de ejemplo con `npm run seed` (o desde `/admin` › **Cargar datos de ejemplo**).

### Crear administradores desde Supabase
1. Ejecuta una vez `supabase/admin.sql` (parte 1: crea el perfil de cada usuario nuevo automáticamente).
2. **Authentication › Users › Add user › Create new user**: correo + contraseña, con *Auto Confirm User* activado.
3. En **SQL Editor** ejecuta la parte 2 de `supabase/admin.sql` con ese correo para darle rol `admin`.
4. Entra en `/admin` (o `/login?admin=1`) con correo y contraseña.

`ADMIN_EMAILS` es opcional: los correos listados ahí también reciben rol admin al iniciar sesión.

## Desplegar en Vercel

1. Sube el repo a GitHub e impórtalo en Vercel (detecta Next.js solo).
2. Agrega las variables de `.env.example` en *Settings › Environment Variables*. `NEXT_PUBLIC_SITE_URL` debe ser la URL pública.
3. Stripe: crea un webhook a `https://TU-DOMINIO/api/stripe/webhook` con el evento `checkout.session.completed` y guarda `STRIPE_WEBHOOK_SECRET`.

### Al pasar al dominio propio
- Vercel › Domains: agrega el dominio y configura DNS.
- Actualiza `NEXT_PUBLIC_SITE_URL`.
- Supabase: *Site URL* y *Redirect URLs*.
- Google Cloud OAuth: orígenes y callbacks autorizados.
- Stripe: URL del webhook y llaves live.
- Resend: verifica el dominio (SPF/DKIM) para enviar desde `hola@tudominio`.

## Contenido provisional (reemplazar antes de publicar)
- Fotos (Unsplash) y videos (Mixkit) de stock libre → `src/content/site.ts`.
- Logo redibujado en vector a partir del PNG → `src/components/brand/Logo.tsx` (sustituir por el SVG oficial).
- Cifras, trayectoria y testimonios marcados `[confirmar]` / `[ejemplo]` → `src/content/site.ts`.
- Machotes legales de ejemplo → `src/content/legal.ts` (al cambiarlos, sube `LEGAL_VERSION`).
- Sedes y precios de las experiencias de ejemplo → `src/lib/seed.ts` o directamente desde el admin.

## Estructura

```
src/
  app/(site)/        páginas públicas
  app/admin/         panel de administración
  app/actions/       server actions (checkout, leads, admin, auth)
  components/        UI de marca, sitio y admin
  content/           textos, medios y documentos legales editables
  lib/repo/          capa de datos (memoria | Supabase) con la misma interfaz
supabase/schema.sql  tablas, RLS, función de reserva atómica y bucket de imágenes
```

> Nota: si el proyecto vive en OneDrive, conviene excluir `node_modules` y `.next` de la sincronización (o mover la carpeta fuera de OneDrive): el servidor de desarrollo compila mucho más rápido.
