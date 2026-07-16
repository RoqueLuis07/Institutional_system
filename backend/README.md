# SGA Backend (NestJS)

Implementación de referencia de los cinco módulos diseñados en `docs/`
(`../docs/arquitectura.md`, `../docs/reglas_negocio_*.md`), siguiendo la
estructura de monolito modular + arquitectura hexagonal ahí descrita.

## Requisitos

- Node.js 20+
- PostgreSQL 16 (o `docker compose up -d` con el `docker-compose.yml` incluido)

## Puesta en marcha

```bash
cp .env.example .env
docker compose up -d          # levanta PostgreSQL
npm install
npm run start:dev             # http://localhost:3000/api/v1
```

En desarrollo (`NODE_ENV != production`) el esquema se sincroniza
automáticamente desde las entidades de TypeORM. En producción, generar y
correr migraciones versionadas:

```bash
npm run migration:generate -- src/migrations/Inicial
npm run migration:run
```

## Estructura

```
src/
  modulos/
    infraestructura-academica/   Módulo A
    admision-inscripcion/        Módulo B
    cursada-evaluacion/          Módulo C
    financiero/                  Módulo D
    egresamiento/                Módulo E
```

Cada módulo sigue `entities/` → `aplicacion/` (casos de uso) → `api/`
(controllers). La comunicación entre módulos usa eventos de dominio
(`@nestjs/event-emitter`) según el catálogo en `../docs/flujo_completo.md`.

## Endpoints implementados en esta fase

- `POST /api/v1/inscripciones` — inscripción a sección (Módulo B), con las
  5 reglas de validación (estado, financiero, correlatividades, duplicidad,
  colisión de horario) y bloqueo de cupo transaccional.
- `GET /api/v1/secciones?periodoId=` — secciones disponibles.
- `GET /api/v1/estudiantes/:id`, `GET /api/v1/estudiantes/:id/inscripciones`
- `POST /api/v1/secciones/:seccionId/asistencias` — carga de asistencia diaria.
- `POST /api/v1/instrumentos/:instrumentoId/calificaciones` — notas de proceso.
- `POST /api/v1/actas/:actaId/notas-examen` y `POST /api/v1/actas/:actaId/cerrar`
  — cierre de acta con impacto en `historial_academico` (Módulo C).
- `GET /api/v1/estudiantes/:id/estado-cuenta` — estado de cuenta (Módulo D).
  La generación de deuda es automática vía el listener
  `GenerarDeudaListener`, que reacciona al evento `EstudianteInscriptoASeccion`.
- `POST /api/v1/estudiantes/:estudianteId/solicitudes-egreso` — auditoría de
  graduación (Módulo E).

No implementado todavía en esta fase (queda como siguiente iteración):
ABM completo de Módulo A (facultades/carreras/materias/secciones),
autenticación/autorización por rol, y los endpoints de pagos/aranceles
especiales del Módulo D.
