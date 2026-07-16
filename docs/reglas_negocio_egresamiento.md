# Reglas de Negocio: Egresamiento (Módulo E)

## Endpoints mínimos

```
POST   /api/v1/estudiantes/{estudianteId}/solicitudes-egreso
       Crea una solicitud de egreso y dispara la auditoría de graduación
       de forma síncrona (el resultado se devuelve en la misma respuesta).

GET    /api/v1/solicitudes-egreso/{solicitudId}
       Devuelve el detalle de la solicitud y el resultado por requisito.
```

## Auditoría de Graduación

```
FUNCTION auditarGraduacion(estudianteId):
    estudiante = ObtenerEstudiante(estudianteId)
    SI estudiante.estado != 'ACTIVO':
        LANZAR ErrorNegocio("El estudiante no está en condiciones de solicitar egreso")

    INICIAR_TRANSACCION
        solicitud = CrearSolicitudEgreso(estudianteId, estado='PENDIENTE')

        # --- Requisito 1: Malla curricular 100% aprobada ---
        materiasPlan = ObtenerMateriasObligatorias(estudiante.planEstudioId)
        materiasAprobadas = ObtenerMateriasAprobadas(estudianteId) # historial_academico.condicion = 'APROBADA'

        materiasFaltantes = materiasPlan - materiasAprobadas
        mallaCompleta = (materiasFaltantes ESTÁ VACÍO)

        GuardarRequisito(solicitud.id, 'MALLA_COMPLETA', mallaCompleta,
            detalle = SI mallaCompleta
                        ENTONCES "100% del plan aprobado"
                        SINO "Materias pendientes: " + NombresDe(materiasFaltantes))

        # --- Requisito 2: Horas de extensión / pasantías ---
        horasRequeridas = estudiante.carrera.horasExtensionRequeridas
        horasCumplidas = SUMA(
            ObtenerHorasExtension(estudianteId, verificado=TRUE).horas
        )
        horasCompletas = horasCumplidas >= horasRequeridas

        GuardarRequisito(solicitud.id, 'HORAS_EXTENSION', horasCompletas,
            detalle = horasCumplidas + "/" + horasRequeridas + " horas verificadas")

        # --- Requisito 3: Saldo financiero en cero ---
        cuentasPendientes = ObtenerCuentasPorCobrar(
            estudianteId, estado IN ('PENDIENTE', 'VENCIDA')
        )
        saldoCero = cuentasPendientes ESTÁ VACÍO

        GuardarRequisito(solicitud.id, 'SALDO_FINANCIERO', saldoCero,
            detalle = SI saldoCero
                        ENTONCES "Sin deuda pendiente"
                        SINO "Deuda pendiente: " + SUMA(cuentasPendientes.monto))

        # --- Resolución ---
        todosCumplidos = mallaCompleta Y horasCompletas Y saldoCero

        SI todosCumplidos:
            ActualizarSolicitud(solicitud.id, estado='APROBADA', fechaResolucion=AHORA())
            numeroTitulo = GenerarNumeroTituloUnico()
            CrearTituloEmitido(estudianteId, solicitud.id, numeroTitulo)
            ActualizarEstudiante(estudianteId, estado='EGRESADO')
            PublicarEvento('EstudianteEgresado', { estudianteId, solicitudEgresoId: solicitud.id, numeroTitulo })
        SINO:
            ActualizarSolicitud(solicitud.id, estado='RECHAZADA', fechaResolucion=AHORA())

    CONFIRMAR_TRANSACCION

    RETORNAR SolicitudEgresoDTO(solicitud, requisitos=[MALLA_COMPLETA, HORAS_EXTENSION, SALDO_FINANCIERO])
```

## Notas de diseño

- **Auditoría síncrona y transaccional**: a diferencia de la Inscripción o
  el Financiero, este caso de uso no necesita desacoplarse vía eventos
  hacia dentro (sí publica uno hacia afuera al aprobar) porque es una
  operación de lectura agregada + una única escritura de resolución; no
  hay concurrencia de escritura entre estudiantes como sí ocurre con el
  cupo de una sección.
- **Trazabilidad**: `solicitud_egreso_requisitos` guarda una foto de cada
  requisito evaluado en el momento de la solicitud. Esto es importante
  porque un requisito puede volverse falso después (ej. el alumno vuelve a
  generar deuda) sin que eso invalide una solicitud ya aprobada.
- **Reintento tras rechazo**: una solicitud `RECHAZADA` no bloquea nuevas
  solicitudes; el estudiante puede volver a solicitar el egreso una vez
  regularizada la situación pendiente. No se agrega una restricción
  `UNIQUE(estudiante_id)` en `solicitudes_egreso` por esta razón.
- **Consumo del evento `EstudianteEgresado`**: el módulo Financiero podría
  reaccionar generando un arancel de emisión de título; el módulo de
  Admisión podría usarlo para reportes de egresados por cohorte. Ninguno
  de los dos es obligatorio para esta fase, pero el evento ya queda
  disponible para ese propósito.
