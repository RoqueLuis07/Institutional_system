# Reglas de Negocio: Cursada y Evaluación (Módulo C)

## Endpoints mínimos

```
POST   /api/v1/secciones/{seccionId}/clases/{fecha}/asistencias
       Body: { asistencias: [{ estudianteId, presente }] }
       Registra la asistencia diaria de una clase.

POST   /api/v1/instrumentos/{instrumentoId}/calificaciones
       Body: { calificaciones: [{ estudianteId, nota }] }
       Carga notas de un trabajo práctico o parcial.

GET    /api/v1/secciones/{seccionId}/estudiantes/{estudianteId}/porcentaje-asistencia
       Devuelve el % de asistencia acumulado y si conserva derecho a examen.

POST   /api/v1/actas/{actaId}/cerrar
       Cierra el acta de examen final: consolida notas y actualiza
       historial_academico para todos los estudiantes del acta.
```

## 1. Cálculo de porcentaje de asistencia y derecho a examen

```
FUNCTION calcularDerechoAExamen(estudianteId, seccionId):
    totalClases = ContarClases(seccionId)
    SI totalClases == 0:
        RETORNAR { porcentaje: 100, derecho: TRUE }

    presentes = ContarAsistenciasPresentes(estudianteId, seccionId)
    porcentaje = (presentes / totalClases) * 100

    # Umbral configurable por reglamento institucional (ej. 75%)
    derecho = porcentaje >= UMBRAL_ASISTENCIA_MINIMA

    RETORNAR { porcentaje, derecho }
```

Este cálculo debe ejecutarse **antes de habilitar la carga de nota de examen
final** para un estudiante en el acta (paso 3 del cierre de acta).

## 2. Nota de proceso acumulada

```
FUNCTION calcularNotaProceso(estudianteId, seccionId):
    instrumentos = ObtenerInstrumentos(seccionId)
    SI SUMA(instrumentos.ponderacion) != 100:
        LANZAR ErrorConfiguracion("Las ponderaciones de la sección no suman 100%")

    notaProceso = 0
    PARA CADA instrumento EN instrumentos:
        calificacion = ObtenerCalificacion(instrumento.id, estudianteId)
        SI calificacion NO EXISTE:
            # Regla institucional: instrumento no entregado = nota 0
            calificacion = 0
        notaProceso += calificacion.nota * (instrumento.ponderacion / 100)

    RETORNAR REDONDEAR(notaProceso, 2)
```

## 3. Cierre de Acta de Examen Final

```
FUNCTION cerrarActaExamenFinal(actaId):
    acta = ObtenerActa(actaId)
    SI acta.estado != 'ABIERTA':
        LANZAR ErrorNegocio("El acta ya fue cerrada")

    estudiantesInscriptos = ObtenerEstudiantesInscriptosEnSeccion(acta.seccionId)

    INICIAR_TRANSACCION
        PARA CADA estudiante EN estudiantesInscriptos:
            derechoExamen = calcularDerechoAExamen(estudiante.id, acta.seccionId)
            notaProceso = calcularNotaProceso(estudiante.id, acta.seccionId)

            SI NO derechoExamen.derecho:
                condicion = 'DESAPROBADA' # libre por inasistencia
                notaFinal = NULL
            SINO:
                notaExamen = ObtenerNotaExamen(actaId, estudiante.id)
                SI notaExamen NO EXISTE:
                    condicion = 'AUSENTE'
                    notaFinal = NULL
                SINO:
                    # Fórmula configurable por reglamento (ej. 40% proceso + 60% examen)
                    notaFinal = (notaProceso * 0.4) + (notaExamen * 0.6)
                    condicion = SI notaFinal >= NOTA_MINIMA_APROBACION
                                    ENTONCES 'APROBADA'
                                    SINO 'DESAPROBADA'

            GuardarDetalleActa(actaId, estudiante.id, notaProceso, notaExamen, notaFinal, condicion)

            # Impacto inmediato en el historial académico del alumno
            UpsertHistorialAcademico(
                estudianteId = estudiante.id,
                materiaId = acta.seccion.materiaId,
                periodoAcademicoId = acta.seccion.periodoAcademicoId,
                notaFinal = notaFinal,
                condicion = MapearCondicionHistorial(condicion) # 'APROBADA' | 'DESAPROBADA'
            )

        ActualizarActa(actaId, estado='CERRADA', cerradaEn=AHORA())

        # Notifica a otros módulos (Financiero podría cobrar examen
        # extraordinario si corresponde; Egresamiento reevalúa al alumno)
        PublicarEvento('ActaExamenFinalCerrada', { actaId, seccionId: acta.seccionId })

    CONFIRMAR_TRANSACCION
```

## Notas de diseño

- El cierre de acta es **irreversible por API** (solo re-abrible por un
  proceso administrativo auditado aparte); una vez cerrada, la nota impacta
  el historial académico y por lo tanto las correlatividades de futuras
  inscripciones — de ahí la necesidad de una transacción atómica que cubra
  todos los estudiantes del acta.
- Las ponderaciones y umbrales (`UMBRAL_ASISTENCIA_MINIMA`,
  `NOTA_MINIMA_APROBACION`, fórmula proceso/examen) deben ser parámetros de
  configuración institucional, no constantes hardcodeadas, ya que suelen
  variar por facultad o carrera.
