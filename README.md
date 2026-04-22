# VozSegura 💜 — ODS 5

Plataforma de apoyo para mujeres con IA, login y despliegue en Render.

## Pantallas incluidas
- `index.html` — Bienvenida (split: info + ilustración)
- `login.html` — Iniciar sesión
- `register.html` — Crear cuenta
- `dashboard.html` — Inicio con tarjetas
- `solicitudes.html` — Solicitud de ayuda
- `recursos.html` — Módulo educativo
- `perfil.html` — Mi perfil

## Setup local

```bash
# 1. Backend
cd backend
npm install
cp .env.example .env   # edita con tus datos reales

# 2. MySQL
mysql -u root -p < db/schema.sql

# 3. Iniciar
npm run dev
# → http://localhost:3000
```

## Variables .env requeridas
```
DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME
JWT_SECRET
ANTHROPIC_API_KEY   # console.anthropic.com → API Keys
```

## Desplegar en Render
1. Sube a GitHub
2. Render → New Web Service → conecta repo
3. Root: `backend` | Build: `npm install` | Start: `node server.js`
4. Agrega las variables de entorno en el panel de Render
5. Para MySQL usa PlanetScale (gratis) o Railway
