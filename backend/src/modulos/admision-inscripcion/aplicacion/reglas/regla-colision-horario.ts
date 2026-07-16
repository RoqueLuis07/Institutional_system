import { Injectable } from '@nestjs/common';
import {
  ContextoValidacionInscripcion,
  ErrorNegocioInscripcion,
  ReglaValidacionInscripcion,
} from './regla-validacion-inscripcion.interface';
import { HorarioSeccion } from '../../../infraestructura-academica/entities/horario-seccion.entity';
import {
  EstadoInscripcionSeccion,
  InscripcionSeccion,
} from '../../entities/inscripcion-seccion.entity';
import { EstadoInscripcionPeriodo } from '../../entities/inscripcion-periodo.entity';

function haySolapamiento(
  a: { dia_semana: number; hora_inicio: string; hora_fin: string },
  b: { dia_semana: number; hora_inicio: string; hora_fin: string },
): boolean {
  if (a.dia_semana !== b.dia_semana) {
    return false;
  }
  return a.hora_inicio < b.hora_fin && b.hora_inicio < a.hora_fin;
}

@Injectable()
export class ReglaColisionHorario implements ReglaValidacionInscripcion {
  async validar({ manager, estudiante, seccion }: ContextoValidacionInscripcion): Promise<void> {
    const horariosNuevos = await manager.find(HorarioSeccion, {
      where: { seccion: { id: seccion.id } },
    });

    const seccionesActuales = await manager
      .createQueryBuilder(InscripcionSeccion, 'inscripcionSeccion')
      .innerJoin('inscripcionSeccion.inscripcionPeriodo', 'inscripcionPeriodo')
      .innerJoinAndSelect('inscripcionSeccion.seccion', 'seccion')
      .where('inscripcionPeriodo.estudianteId = :estudianteId', { estudianteId: estudiante.id })
      .andWhere('inscripcionPeriodo.periodoAcademicoId = :periodoId', {
        periodoId: seccion.periodoAcademico.id,
      })
      .andWhere('inscripcionSeccion.estado = :estado', {
        estado: EstadoInscripcionSeccion.INSCRIPTA,
      })
      .andWhere('inscripcionPeriodo.estado = :estadoPeriodo', {
        estadoPeriodo: EstadoInscripcionPeriodo.ACTIVA,
      })
      .getMany();

    for (const inscripcionActual of seccionesActuales) {
      const horariosActuales = await manager.find(HorarioSeccion, {
        where: { seccion: { id: inscripcionActual.seccion.id } },
      });

      for (const horarioActual of horariosActuales) {
        for (const horarioNuevo of horariosNuevos) {
          if (haySolapamiento(horarioActual, horarioNuevo)) {
            throw new ErrorNegocioInscripcion(
              `Colisión de horario con la sección: ${inscripcionActual.seccion.codigo_seccion}`,
            );
          }
        }
      }
    }
  }
}
