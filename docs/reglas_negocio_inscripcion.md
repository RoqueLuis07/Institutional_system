# Reglas de Negocio: Inscripción a Materia (Sección)

Este documento detalla el endpoint mínimo y la secuencia de validaciones que
el backend debe ejecutar **antes** de persistir una inscripción de un
estudiante a una sección, dentro de un período académico.

## Endpoints mínimos

```
POST   /api/v1/periodos/{periodoId}/inscripciones
       Body: { estudianteId, seccionIds: [] }
       Crea (o recupera) la inscripción al período y agrega las secciones elegidas.

DELETE /api/v1/inscripciones/{inscripcionPeriodoId}/secciones/{seccionId}
       Da de baja una sección dentro de una inscripción ya creada.

GET    /api/v1/estudiantes/{estudianteId}/secciones-disponibles?periodoId=...
       Devuelve las secciones habilitadas para el estudiante según su
       plan de estudio y correlatividades ya aprobadas (para poblar el
       formulario de inscripción con opciones válidas).
```

## Pseudocódigo del caso de uso `InscribirEstudianteASeccion`

```
FUNCTION inscribirEstudianteASeccion(estudianteId, periodoAcademicoId, seccionId):

    # 1. Validaciones de existencia y estado general
    estudiante = ObtenerEstudiante(estudianteId)
    SI estudiante NO EXISTE:
        LANZAR ErrorNoEncontrado("Estudiante inexistente")

    SI estudiante.estado != 'ACTIVO':
        LANZAR ErrorNegocio("El estudiante no está activo")

    periodo = ObtenerPeriodoAcademico(periodoAcademicoId)
    SI periodo.estado != 'INSCRIPCION_ABIERTA':
        LANZAR ErrorNegocio("El período no admite inscripciones en este momento")

    seccion = ObtenerSeccion(seccionId)
    SI seccion NO EXISTE O seccion.periodoAcademicoId != periodoAcademicoId:
        LANZAR ErrorNegocio("La sección no pertenece al período indicado")

    SI seccion.estado != 'ABIERTA':
        LANZAR ErrorNegocio("La sección no está disponible para inscripción")

    # 2. Validación administrativa/financiera (bloqueo de caja)
    SI estudiante.bloqueoAdministrativo == TRUE:
        LANZAR ErrorNegocio("El estudiante tiene deuda pendiente. No puede inscribirse")
    # Alternativa desacoplada (recomendada): consultar al Módulo Financiero
    # mediante un servicio/puerto `VerificarHabilitacionFinanciera(estudianteId)`
    # en lugar de leer directamente un flag en la tabla estudiantes.

    # 3. Validación de correlatividades
    materiaId = seccion.materiaId
    requisitos = ObtenerCorrelatividades(estudiante.planEstudioId, materiaId)
    PARA CADA requisito EN requisitos:
        cumplida = EstudianteCumpleRequisito(estudianteId, requisito.materiaRequisitoId, requisito.tipoRequisito)
        # tipoRequisito == 'APROBADA'    -> exige historial_academico.condicion == 'APROBADA'
        # tipoRequisito == 'REGULARIZADA' -> exige condicion IN ('APROBADA','REGULAR')
        SI NO cumplida:
            LANZAR ErrorNegocio(
                "No cumple la correlatividad: " + requisito.materiaRequisito.nombre
            )

    # 4. Validación de que la materia no esté ya aprobada
    #    (evita recursar una materia ya acreditada, salvo excepción de
    #    "mejorar nota" configurable por reglamento institucional)
    yaAprobada = HistorialTieneCondicion(estudianteId, materiaId, 'APROBADA')
    SI yaAprobada Y NO permiteRecursarAprobadas:
        LANZAR ErrorNegocio("La materia ya fue aprobada")

    # 5. Validación de cupo disponible (con bloqueo pesimista de fila
    #    para evitar condiciones de carrera bajo alta concurrencia)
    INICIAR_TRANSACCION
        seccionBloqueada = SELECT ... FROM secciones WHERE id = seccionId FOR UPDATE
        SI seccionBloqueada.cupoOcupado >= seccionBloqueada.cupoMaximo:
            REVERTIR_TRANSACCION
            LANZAR ErrorNegocio("No hay cupo disponible en la sección")

        # 6. Validación de duplicidad: no inscribirse dos veces a la misma materia
        #    en el mismo período (en distinta sección)
        yaInscriptoEnMateria = ExisteInscripcionActivaEnMateria(estudianteId, materiaId, periodoAcademicoId)
        SI yaInscriptoEnMateria:
            REVERTIR_TRANSACCION
            LANZAR ErrorNegocio("Ya existe una inscripción activa a esta materia en el período")

        # 7. Validación de colisión de horarios
        horariosNuevos = ObtenerHorarios(seccionId)
        seccionesActuales = ObtenerSeccionesInscriptasActivas(estudianteId, periodoAcademicoId)
        PARA CADA seccionActual EN seccionesActuales:
            PARA CADA horarioActual EN ObtenerHorarios(seccionActual.id):
                PARA CADA horarioNuevo EN horariosNuevos:
                    SI HaySolapamiento(horarioActual, horarioNuevo):
                        REVERTIR_TRANSACCION
                        LANZAR ErrorNegocio(
                            "Colisión de horario con la sección: " + seccionActual.codigoSeccion
                        )

        # 8. Persistencia
        inscripcionPeriodo = ObtenerOCrearInscripcionPeriodo(estudianteId, periodoAcademicoId)
        CrearInscripcionSeccion(inscripcionPeriodo.id, seccionId, estado='INSCRIPTA')
        ActualizarCupoOcupado(seccionId, +1)

        # 9. Efecto colateral: notificar al módulo financiero para que
        #    genere el arancel de cursada correspondiente (evento de dominio,
        #    no llamada síncrona acoplada — ver docs/arquitectura.md)
        PublicarEvento('EstudianteInscriptoASeccion', { estudianteId, seccionId, materiaId, periodoAcademicoId })

    CONFIRMAR_TRANSACCION

    RETORNAR InscripcionSeccionDTO(...)
```

## Función auxiliar: `HaySolapamiento(horarioA, horarioB)`

```
FUNCTION HaySolapamiento(a, b):
    SI a.diaSemana != b.diaSemana:
        RETORNAR FALSO
    RETORNAR a.horaInicio < b.horaFin Y b.horaInicio < a.horaFin
```

## Notas de diseño

- **Idempotencia:** una segunda llamada con la misma sección para el mismo
  estudiante debe fallar por la validación de duplicidad (paso 6), no crear
  un registro duplicado. La restricción `UNIQUE(inscripcion_periodo_id, seccion_id)`
  en la base de datos actúa como última línea de defensa.
- **Concurrencia de cupos:** el `SELECT ... FOR UPDATE` (o un `UPDATE`
  atómico con `WHERE cupo_ocupado < cupo_maximo`) es obligatorio para evitar
  que dos inscripciones simultáneas sobrepasen el cupo máximo bajo carga.
- **Desacoplamiento financiero:** el módulo de Inscripción no debe escribir
  directamente en tablas del módulo Financiero. Debe publicar un evento de
  dominio que el módulo Financiero consume para generar la deuda
  correspondiente (matrícula + arancel de cursada + cuotas).
