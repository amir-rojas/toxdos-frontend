# Toxdos — Frontend

POS web para casa de empeños. Permite gestionar empeños, pagos, ventas, gastos y caja en tiempo real.

## Stack

- **React 19** + **TypeScript**
- **Vite 8**
- **Tailwind CSS v4** + **shadcn/ui**
- **React Router v7**
- **TanStack Query v5**
- **Zustand** — estado global (auth)
- **React Hook Form** + **Zod** — formularios y validación
- **Axios** — cliente HTTP

## Requisitos

- Node.js >= 20
- npm >= 10

## Configuración local

1. Clonar el repositorio:
   ```bash
   git clone https://github.com/amir-rojas/toxdos-frontend.git
   cd toxdos-frontend
   ```

2. Instalar dependencias:
   ```bash
   npm install
   ```

3. Crear el archivo de variables de entorno:
   ```bash
   cp .env.example .env
   ```

4. Configurar `.env`:
   ```env
   VITE_API_URL=http://localhost:3000
   ```

5. Iniciar el servidor de desarrollo:
   ```bash
   npm run dev
   ```

## Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run preview` | Preview del build |
| `npm run lint` | Linting con ESLint |

## Variables de entorno

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `VITE_API_URL` | URL base del backend | `https://api.tudominio.com` |

## Estructura del proyecto

```
src/
├── app/          # Layout, sidebar, rutas protegidas
├── components/   # Componentes UI reutilizables (shadcn)
├── features/     # Módulos por dominio (pawns, payments, sales…)
├── hooks/        # Custom hooks compartidos
├── pages/        # Páginas de la aplicación
├── router/       # Configuración de React Router
└── shared/       # Tipos, constantes y utilidades globales
```

## Deploy

El frontend se despliega en **Vercel**. Configurar la variable `VITE_API_URL` apuntando al backend en Render.
