# Flujo Completo del Sistema (Postulante → Egresado)

Este documento conecta los cinco módulos diseñados en las fases anteriores
en una sola narrativa de punta a punta, y sirve como mapa de referencia
para ubicar cada pieza dentro del ciclo de vida del estudiante.

## Diagrama de flujo

```
┌─────────────┐     aprobación      ┌─────────────┐   inscripción a   ┌─────────────────┐
│ Postulante  │ ──────────────────► │  Estudiante │ ────periodo─────► │ Inscripción a    │
│ (Módulo B)  │  genera matrícula   │   ACTIVO    │                   │ Secciones (Mod B)│
└─────────────┘                     └─────────────┘                   └────────┬────────┘
                                                                                 │ evento:
                                                                                 │ EstudianteInscriptoASeccion
                                                                                 ▼
                                          ┌───────────────────────┐    ┌──────────────────┐
                                          │ Cursada y Evaluación  │    │ Financiero        │
                                          │ (Módulo C)            │    │ (Módulo D)        │
                                          │ asistencia, notas,    │    │ genera deuda,      │
                                          │ cierre de acta        │    │ registra pagos     │
                                          └──────────┬────────────┘    └────────┬──────────┘
                                                     │ evento:                 │ estado de cuenta
                                                     │ ActaExamenFinalCerrada  │ (Al día / Con Mora)
                                                     ▼                        │
                                          historial_academico  ◄──────────────┘
                                          (correlatividades futuras +
                                           habilitación de inscripción)
                                                     │
                                                     ▼
                                          ┌───────────────────────┐
                                          │ Egresamiento           │
                                          │ (Módulo E)             │
                                          │ malla 100% + horas ext.│
                                          │ + saldo financiero = 0 │
                                          └──────────┬────────────┘
                                                     │ evento: EstudianteEgresado
                                                     ▼
                                              Título emitido
```

## Catálogo de eventos de dominio

Esta tabla es el contrato entre módulos: ningún módulo consulta tablas de
otro módulo directamente para reaccionar a un cambio de estado; siempre lo
hace a través de uno de estos eventos.

| Evento                          | Publicado por         | Consumido por                                   | Efecto |
|----------------------------------|------------------------|--------------------------------------------------|--------|
| `PostulanteAprobado`            | Admisión (Mód. B)      | (ninguno en esta fase; disponible para Financiero: arancel de matrícula inicial) | Crea `estudiante` activo con matrícula |
| `EstudianteInscriptoASeccion`   | Inscripción (Mód. B)   | Financiero (Mód. D)                               | Genera matrícula + arancel de cursada + cuotas |
| `ActaExamenFinalCerrada`        | Evaluación (Mód. C)    | Egresamiento (disparo opcional de re-auditoría); Financiero (cobro de examen extraordinario si aplica) | Consolida nota en `historial_academico` |
| `EstudianteEgresado`            | Egresamiento (Mód. E)  | Financiero (arancel de emisión de título); Admisión (reportes de cohorte) | Emite título, marca `estudiante.estado = EGRESADO` |

## Puntos de integración síncrona (no eventos)

Algunas validaciones sí requieren una consulta síncrona porque son
bloqueantes dentro de la misma transacción del caso de uso que las
origina, no una reacción diferida:

- **Inscripción → Financiero**: al validar el paso 2 de
  `inscribirEstudianteASeccion` (bloqueo administrativo), se consulta el
  estado de cuenta ya calculado (`estudiante.bloqueoAdministrativo`, una
  proyección mantenida por el Módulo D). No se recalculan las cuentas por
  cobrar en ese momento — el flag ya está actualizado por
  `actualizarEstadoCuentaEstudiante` cada vez que cambia una cuenta.
- **Inscripción → Evaluación**: al validar correlatividades, se consulta
  `historial_academico`, que es escrito por el Módulo C al cerrar un acta.
- **Egresamiento → Evaluación/Financiero**: la auditoría de graduación lee
  `historial_academico` y `cuentas_por_cobrar` directamente porque es una
  operación de agregación puntual bajo demanda, no una reacción a un
  evento continuo.

## Resumen por módulo (mapa de archivos)

| Módulo | Esquema (`database/schema.sql`) | Reglas de negocio |
|--------|----------------------------------|--------------------|
| A — Infraestructura Académica | `facultades`, `carreras`, `planes_estudio`, `materias`, `correlatividades`, `secciones`, `horarios_seccion` | Implícitas en la validación de Módulo B (correlatividades, cupo, horario) |
| B — Admisión e Inscripción | `postulantes`, `estudiantes`, `inscripciones_periodo`, `inscripciones_seccion`, `historial_academico` | `docs/reglas_negocio_inscripcion.md` |
| C — Cursada y Evaluación | `clases`, `asistencias`, `instrumentos_evaluacion`, `calificaciones_instrumento`, `actas_examen_final(_detalle)` | `docs/reglas_negocio_evaluacion.md` |
| D — Financiero | `conceptos_arancel`, `cuentas_por_cobrar`, `pagos` | `docs/reglas_negocio_financiero.md` |
| E — Egresamiento | `horas_extension_estudiante`, `solicitudes_egreso(_requisitos)`, `titulos_emitidos` | `docs/reglas_negocio_egresamiento.md` |

Con esto queda cerrado el ciclo de vida completo descrito en el alcance
original: **Postulante → Estudiante Activo → Inscripción → Cursada →
Evaluación → (en paralelo) Financiero → Egresamiento → Título**. La
arquitectura de referencia para implementarlo está en `docs/arquitectura.md`.
