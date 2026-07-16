# Institutional_system

Sistema de Gestión Universitaria (SGA/SIS): ciclo de vida completo del
estudiante, desde postulante hasta egresado, incluyendo gestión académica
e inscripciones, cursada y evaluación, control financiero y egresamiento.

## Estructura del repositorio

```
database/   Esquema SQL de referencia (database/schema.sql)
docs/       Diseño: reglas de negocio, arquitectura, flujo completo
backend/    API NestJS + TypeORM + PostgreSQL
frontend/   SPA React + Vite + TypeScript
```

Ver `docs/flujo_completo.md` para el diseño end-to-end y `docs/arquitectura.md`
para las decisiones de arquitectura.

## Puesta en marcha (backend + frontend)

```bash
# 1. Base de datos + API
cd backend
cp .env.example .env
docker compose up -d
npm install
npm run start:dev        # http://localhost:3000/api/v1

# 2. Frontend (en otra terminal)
cd frontend
npm install
npm run dev               # http://localhost:5173
```

El frontend proxyea `/api` hacia `http://localhost:3000` (ver
`frontend/vite.config.ts`), así que ambos deben estar corriendo en paralelo.

Instrucciones detalladas de cada parte en `backend/README.md`.
