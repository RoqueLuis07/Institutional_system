import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DataSource } from 'typeorm';
import {
  ActaExamenFinal,
  EstadoActaExamenFinal,
} from '../entities/acta-examen-final.entity';
import {
  ActaExamenFinalDetalle,
  CondicionActaExamenFinal,
} from '../entities/acta-examen-final-detalle.entity';
import { Clase } from '../entities/clase.entity';
import { Asistencia } from '../entities/asistencia.entity';
import { InstrumentoEvaluacion } from '../entities/instrumento-evaluacion.entity';
import { CalificacionInstrumento } from '../entities/calificacion-instrumento.entity';
import {
  CondicionHistorialAcademico,
  HistorialAcademico,
} from '../../admision-inscripcion/entities/historial-academico.entity';
import {
  EstadoInscripcionSeccion,
  InscripcionSeccion,
} from '../../admision-inscripcion/entities/inscripcion-seccion.entity';

const UMBRAL_ASISTENCIA_MINIMA = 75;
const NOTA_MINIMA_APROBACION = 6;
const PESO_PROCESO = 0.4;
const PESO_EXAMEN = 0.6;

@Injectable()
export class CerrarActaExamenFinalUseCase {
  constructor(
    private readonly dataSource: DataSource,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async ejecutar(actaId: number): Promise<ActaExamenFinal> {
    return this.dataSource.transaction(async (manager) => {
      const acta = await manager.findOne(ActaExamenFinal, {
        where: { id: actaId },
        relations: ['seccion', 'seccion.materia', 'seccion.periodoAcademico'],
      });
      if (!acta) {
        throw new NotFoundException('Acta inexistente');
      }
      if (acta.estado !== EstadoActaExamenFinal.ABIERTA) {
        throw new BadRequestException('El acta ya fue cerrada');
      }

      const inscripciones = await manager
        .createQueryBuilder(InscripcionSeccion, 'inscripcionSeccion')
        .innerJoinAndSelect('inscripcionSeccion.inscripcionPeriodo', 'inscripcionPeriodo')
        .innerJoinAndSelect('inscripcionPeriodo.estudiante', 'estudiante')
        .where('inscripcionSeccion.seccionId = :seccionId', { seccionId: acta.seccion.id })
        .andWhere('inscripcionSeccion.estado = :estado', {
          estado: EstadoInscripcionSeccion.INSCRIPTA,
        })
        .getMany();

      const totalClases = await manager.count(Clase, { where: { seccion: { id: acta.seccion.id } } });
      const instrumentos = await manager.find(InstrumentoEvaluacion, {
        where: { seccion: { id: acta.seccion.id } },
      });

      const detalles: ActaExamenFinalDetalle[] = [];

      for (const inscripcion of inscripciones) {
        const estudiante = inscripcion.inscripcionPeriodo.estudiante;

        const presentes = totalClases === 0
          ? 0
          : await manager
              .createQueryBuilder(Asistencia, 'asistencia')
              .innerJoin('asistencia.clase', 'clase')
              .where('clase.seccionId = :seccionId', { seccionId: acta.seccion.id })
              .andWhere('asistencia.estudianteId = :estudianteId', { estudianteId: estudiante.id })
              .andWhere('asistencia.presente = true')
              .getCount();

        const porcentajeAsistencia = totalClases === 0 ? 100 : (presentes / totalClases) * 100;
        const tieneDerechoExamen = porcentajeAsistencia >= UMBRAL_ASISTENCIA_MINIMA;

        let notaProceso: number | null = null;
        if (instrumentos.length > 0) {
          notaProceso = 0;
          for (const instrumento of instrumentos) {
            const calificacion = await manager.findOne(CalificacionInstrumento, {
              where: { instrumento: { id: instrumento.id }, estudiante: { id: estudiante.id } },
            });
            const nota = calificacion ? Number(calificacion.nota) : 0;
            notaProceso += nota * (Number(instrumento.ponderacion) / 100);
          }
          notaProceso = Math.round(notaProceso * 100) / 100;
        }

        let condicion: CondicionActaExamenFinal;
        let notaExamen: number | null = null;
        let notaFinal: number | null = null;

        if (!tieneDerechoExamen) {
          condicion = CondicionActaExamenFinal.DESAPROBADA;
        } else {
          const detalleExistente = await manager.findOne(ActaExamenFinalDetalle, {
            where: { acta: { id: acta.id }, estudiante: { id: estudiante.id } },
          });
          notaExamen = detalleExistente?.nota_examen != null ? Number(detalleExistente.nota_examen) : null;

          if (notaExamen === null) {
            condicion = CondicionActaExamenFinal.AUSENTE;
          } else {
            notaFinal = Math.round(((notaProceso ?? 0) * PESO_PROCESO + notaExamen * PESO_EXAMEN) * 100) / 100;
            condicion = notaFinal >= NOTA_MINIMA_APROBACION
              ? CondicionActaExamenFinal.APROBADA
              : CondicionActaExamenFinal.DESAPROBADA;
          }
        }

        const detalle = manager.create(ActaExamenFinalDetalle, {
          acta,
          estudiante,
          nota_proceso: notaProceso !== null ? String(notaProceso) : null,
          nota_examen: notaExamen !== null ? String(notaExamen) : null,
          nota_final: notaFinal !== null ? String(notaFinal) : null,
          condicion,
        });
        await manager.save(detalle);
        detalles.push(detalle);

        await manager.upsert(
          HistorialAcademico,
          {
            estudiante: { id: estudiante.id },
            materia: { id: acta.seccion.materia.id },
            periodoAcademico: { id: acta.seccion.periodoAcademico.id },
            nota_final: notaFinal !== null ? String(notaFinal) : null,
            condicion:
              condicion === CondicionActaExamenFinal.APROBADA
                ? CondicionHistorialAcademico.APROBADA
                : CondicionHistorialAcademico.DESAPROBADA,
          },
          ['estudiante', 'materia', 'periodoAcademico'],
        );
      }

      acta.estado = EstadoActaExamenFinal.CERRADA;
      acta.cerrada_en = new Date();
      await manager.save(acta);

      this.eventEmitter.emit('ActaExamenFinalCerrada', {
        actaId: acta.id,
        seccionId: acta.seccion.id,
      });

      return acta;
    });
  }
}
