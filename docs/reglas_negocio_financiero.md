# Reglas de Negocio: Financiero (Módulo D)

## Endpoints mínimos

```
POST   /api/v1/estudiantes/{estudianteId}/aranceles-especiales
       Body: { conceptoCodigo, fechaVencimiento }
       Genera una cuenta por cobrar puntual (examen extraordinario,
       certificado, multa de biblioteca).

GET    /api/v1/estudiantes/{estudianteId}/estado-cuenta
       Devuelve el detalle de cuentas por cobrar y si el alumno está
       "Al día" o "Con Mora".

POST   /api/v1/cuentas-por-cobrar/{cuentaId}/pagos
       Body: { montoPagado, medioPago }
       Registra un pago y emite el recibo correspondiente.
```

## 1. Generación automática de deuda al inscribirse a un período

Este caso de uso es un **listener del evento de dominio**
`EstudianteInscriptoASeccion` (publicado por el Módulo B, ver
`docs/reglas_negocio_inscripcion.md`), no una llamada directa desde el
módulo de Inscripción.

```
ON EVENTO 'EstudianteInscriptoASeccion' (estudianteId, seccionId, materiaId, periodoAcademicoId):

    SI ExisteCuentaPorCobrar(estudianteId, periodoAcademicoId, concepto='ARANCEL_CURSADA'):
        RETORNAR  # ya se generó el plan de pago para este período, no duplicar

    periodo = ObtenerPeriodoAcademico(periodoAcademicoId)
    planPago = ObtenerPlanPagoVigente(estudiante.carreraId) # matrícula + arancel + N cuotas

    INICIAR_TRANSACCION
        CrearCuentaPorCobrar(
            estudianteId, concepto='MATRICULA', periodoAcademicoId,
            monto=planPago.montoMatricula, vencimiento=periodo.fechaInicio
        )
        CrearCuentaPorCobrar(
            estudianteId, concepto='ARANCEL_CURSADA', periodoAcademicoId,
            monto=planPago.montoArancel, vencimiento=periodo.fechaInicio
        )
        PARA i EN RANGO(1, planPago.cantidadCuotas + 1):
            CrearCuentaPorCobrar(
                estudianteId, concepto='CUOTA', periodoAcademicoId,
                monto=planPago.montoCuota,
                vencimiento=periodo.fechaInicio + MESES(i)
            )
    CONFIRMAR_TRANSACCION
```

## 2. Registro de un pago (caja)

```
FUNCTION registrarPago(cuentaPorCobrarId, montoPagado, medioPago):
    cuenta = ObtenerCuentaPorCobrar(cuentaPorCobrarId)

    SI cuenta.estado == 'PAGADA':
        LANZAR ErrorNegocio("La cuenta ya fue saldada")

    SI cuenta.estado == 'ANULADA':
        LANZAR ErrorNegocio("La cuenta fue anulada")

    SI montoPagado != cuenta.monto:
        # Regla simple: pago exacto por cuenta. Los pagos parciales o
        # combinados requieren una regla de conciliación adicional
        # (fuera del alcance de esta fase).
        LANZAR ErrorNegocio("El monto pagado debe coincidir con el monto adeudado")

    INICIAR_TRANSACCION
        numeroRecibo = GenerarNumeroReciboUnico()
        CrearPago(cuentaPorCobrarId, montoPagado, medioPago, numeroRecibo)
        ActualizarCuentaPorCobrar(cuentaPorCobrarId, estado='PAGADA')

        # Reevalúa el bloqueo administrativo del estudiante
        ActualizarEstadoCuentaEstudiante(cuenta.estudianteId)
    CONFIRMAR_TRANSACCION

    RETORNAR ReciboDTO(numeroRecibo, cuenta, montoPagado)
```

## 3. Actualización del estado de cuenta (Al día / Con Mora)

```
FUNCTION actualizarEstadoCuentaEstudiante(estudianteId):
    cuentasVencidasImpagas = ObtenerCuentasPorCobrar(
        estudianteId,
        estado='PENDIENTE',
        fechaVencimiento < HOY()
    )

    # Antes de evaluar, marcar como VENCIDA toda cuenta PENDIENTE cuyo
    # vencimiento ya pasó (job diario o chequeo perezoso en esta función)
    PARA CADA cuenta EN cuentasVencidasImpagas:
        ActualizarCuentaPorCobrar(cuenta.id, estado='VENCIDA')

    tieneMora = ExisteCuentaPorCobrar(estudianteId, estado='VENCIDA')

    ActualizarEstudiante(estudianteId, bloqueoAdministrativo = tieneMora)

    RETORNAR SI tieneMora ENTONCES 'CON_MORA' SINO 'AL_DIA'
```

## 4. Aranceles especiales (examen extraordinario, certificados, multas)

```
FUNCTION generarArancelEspecial(estudianteId, conceptoCodigo, fechaVencimiento):
    concepto = ObtenerConceptoArancel(conceptoCodigo)
    SI concepto NO EXISTE:
        LANZAR ErrorNegocio("Concepto de arancel inválido")

    CrearCuentaPorCobrar(
        estudianteId, concepto=concepto.id, periodoAcademicoId=NULL,
        monto=concepto.montoBase, vencimiento=fechaVencimiento
    )
```

## Notas de diseño

- **Desacoplamiento**: el Módulo Financiero nunca lee directamente tablas
  de Inscripción o Evaluación; reacciona a eventos de dominio
  (`EstudianteInscriptoASeccion`, `ActaExamenFinalCerrada` si se decide
  cobrar exámenes extraordinarios de forma automática). Esto evita que un
  cambio en la lógica de inscripción rompa la generación de deuda.
- **`bloqueoAdministrativo` como caché derivado**: el flag en `estudiantes`
  no es la fuente de verdad, es una proyección recalculada por
  `actualizarEstadoCuentaEstudiante`. La fuente de verdad son las filas de
  `cuentas_por_cobrar` en estado `VENCIDA`. Esto es lo que consulta el
  Módulo B en el paso 2 de la validación de inscripción.
- **Idempotencia de generación de deuda**: la verificación
  `ExisteCuentaPorCobrar(..., concepto='ARANCEL_CURSADA')` evita duplicar el
  plan de pago si el evento se reprocesa (ej. reintento tras una falla de
  red en un sistema de mensajería at-least-once).
