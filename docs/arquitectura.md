# Arquitectura de Software Recomendada

## Objetivo

Definir una arquitectura que permita agregar los módulos de Cursada/Evaluación,
Financiero y Egresamiento sin reescribir lo ya construido, y que aísle las
reglas de negocio académicas (correlatividades, cupos, horarios) de los
detalles de infraestructura (framework HTTP, ORM, proveedor de pagos, etc.).

## Patrón general: Arquitectura Hexagonal (Puertos y Adaptadores) + Modular Monolith

Para el tamaño de este dominio, un **monolito modular** con **arquitectura
hexagonal** por módulo es más pragmático que microservicios desde el día 1:
evita la complejidad operativa de una malla de servicios mientras mantiene
fronteras de módulo estrictas que facilitan una futura extracción si el
sistema crece (por ejemplo, separar el módulo Financiero cuando necesite
escalar independientemente).

```
src/
  modulos/
    infraestructura-academica/   (Módulo A)
    admision-inscripcion/        (Módulo B)
    cursada-evaluacion/          (Módulo C)
    financiero/                  (Módulo D)
    egresamiento/                (Módulo E)
  compartido/
    dominio/          (Value Objects, excepciones de negocio comunes)
    eventos/          (bus de eventos de dominio)
    infraestructura/  (config DB, logging, auth transversal)
```

Cada módulo se organiza en capas (Controller → Service/UseCase → Repository),
tal como propone el stack sugerido:

```
modulos/admision-inscripcion/
  api/            # Controllers/routers (NestJS controllers, FastAPI routers...)
  aplicacion/     # Casos de uso (Services): InscribirEstudianteASeccion, etc.
  dominio/        # Entidades, Value Objects, reglas de negocio puras
  infraestructura/# Repositorios concretos (TypeORM/Prisma/SQLAlchemy), adaptadores
```

## Patrones de diseño clave

1. **Repository Pattern**: cada módulo define interfaces de repositorio en
   `dominio/` (ej. `IEstudianteRepository`) implementadas en `infraestructura/`.
   Esto permite testear los casos de uso con repositorios en memoria, sin
   base de datos real.

2. **Strategy Pattern para validaciones de inscripción**: cada validación
   del pseudocódigo (correlatividades, cupo, horario, habilitación
   financiera) se modela como una `ReglaValidacionInscripcion` independiente
   que implementa una interfaz común (`validar(contexto): ResultadoValidacion`).
   El caso de uso ejecuta una lista ordenada de reglas. Agregar una regla
   nueva (ej. "máximo de materias por período") no modifica el caso de uso,
   solo se añade a la lista — cumple Open/Closed.

3. **Domain Events (Event-Driven entre módulos)**: la comunicación entre
   módulos (p. ej. Inscripción → Financiero para generar deuda, o
   Evaluación → Egresamiento para re-evaluar si el alumno puede graduarse)
   se hace mediante eventos de dominio publicados en un bus interno
   (in-process, ej. `EventEmitter` de Nest o un patrón Mediator/Outbox),
   no mediante llamadas directas entre servicios de distintos módulos.
   Esto es lo que evita que el módulo de Inscripción "conozca" las tablas
   financieras, y es la razón por la que el pseudocódigo de inscripción
   termina con `PublicarEvento(...)` en lugar de invocar directamente al
   servicio financiero.

4. **Unit of Work / Transacción explícita**: los casos de uso que escriben
   en múltiples tablas (inscripción + actualización de cupo) deben envolver
   la operación en una transacción explícita gestionada por la capa de
   aplicación, no dejarla implícita en el ORM.

5. **CQRS liviano donde convenga**: los endpoints de solo lectura de alta
   frecuencia (ej. "secciones disponibles para un estudiante", "estado de
   cuenta") se benefician de queries desnormalizadas o vistas materializadas
   independientes de los modelos de escritura, sin necesitar CQRS completo
   con event sourcing.

## Por qué esto facilita los módulos futuros

- **Financiero**: se suscribe a `EstudianteInscriptoASeccion` y otros
  eventos (`PostulanteAprobado`, `ExamenFinalRegistrado`) para generar
  deudas, sin que los módulos académicos necesiten saber que el módulo
  financiero existe.
- **Cursada/Evaluación**: reutiliza `historial_academico` (ya modelada en
  Fase 1) como el contrato de datos compartido entre Inscripción y
  Evaluación — Evaluación escribe, Inscripción lee (para correlatividades).
- **Egresamiento**: es esencialmente un caso de uso de solo lectura que
  agrega datos de Cursada (100% materias aprobadas), Financiero (saldo
  cero) y Académico (plan de estudio completo). Al estar los módulos
  desacoplados vía puertos, Egresamiento simplemente implementa un
  `VerificadorRequisitoGraduacion` por cada módulo consultado.

## Stack técnico concreto sugerido

- **Backend**: NestJS (TypeScript) — su sistema de módulos e inyección de
  dependencias nativo mapea directamente a la estructura `modulos/`
  propuesta, y su `EventEmitterModule` cubre el bus de eventos in-process
  sin infraestructura adicional en esta fase.
- **Base de datos**: PostgreSQL con un ORM que soporte transacciones
  explícitas y migraciones versionadas (Prisma o TypeORM).
- **Frontend**: React con enrutamiento por rol (Administrativo/Docente/
  Estudiante) y un cliente HTTP tipado generado desde el contrato de la API
  (OpenAPI) para mantener sincronizados frontend y backend a medida que
  crecen los módulos.
