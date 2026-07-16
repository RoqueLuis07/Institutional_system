import { Injectable } from '@nestjs/common';
import {
  ContextoValidacionInscripcion,
  ErrorNegocioInscripcion,
  ReglaValidacionInscripcion,
} from './regla-validacion-inscripcion.interface';
import {
  EstadoInscripcionSeccion,
  InscripcionSeccion,
} from '../../entities/inscripcion-seccion.entity';
import { EstadoInscripcionPeriodo } from '../../entities/inscripcion-periodo.entity';

@Injectable()
export class ReglaDuplicidadMateria implements ReglaValidacionInscripcion {
  async validar({ manager, estudiante, seccion }: ContextoValidacionInscripcion): Promise<void> {
    const yaInscripto = await manager
      .createQueryBuilder(InscripcionSeccion, 'inscripcionSeccion')
      .innerJoin('inscripcionSeccion.inscripcionPeriodo', 'inscripcionPeriodo')
      .innerJoin('inscripcionSeccion.seccion', 'seccion')
      .where('inscripcionPeriodo.estudianteId = :estudianteId', { estudianteId: estudiante.id })
      .andWhere('inscripcionPeriodo.periodoAcademicoId = :periodoId', {
        periodoId: seccion.periodoAcademico.id,
      })
      .andWhere('seccion.materiaId = :materiaId', { materiaId: seccion.materia.id })
      .andWhere('inscripcionSeccion.estado = :estado', {
        estado: EstadoInscripcionSeccion.INSCRIPTA,
      })
      .andWhere('inscripcionPeriodo.estado = :estadoPeriodo', {
        estadoPeriodo: EstadoInscripcionPeriodo.ACTIVA,
      })
      .getExists();

    if (yaInscripto) {
      throw new ErrorNegocioInscripcion(
        'Ya existe una inscripción activa a esta materia en el período',
      );
    }
  }
}
