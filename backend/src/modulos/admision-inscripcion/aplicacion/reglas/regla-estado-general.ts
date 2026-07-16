import { Injectable } from '@nestjs/common';
import {
  ContextoValidacionInscripcion,
  ErrorNegocioInscripcion,
  ReglaValidacionInscripcion,
} from './regla-validacion-inscripcion.interface';
import { EstadoEstudiante } from '../../entities/estudiante.entity';
import { EstadoPeriodoAcademico } from '../../../infraestructura-academica/entities/periodo-academico.entity';
import { EstadoSeccion } from '../../../infraestructura-academica/entities/seccion.entity';

@Injectable()
export class ReglaEstadoGeneral implements ReglaValidacionInscripcion {
  async validar({ estudiante, seccion }: ContextoValidacionInscripcion): Promise<void> {
    if (estudiante.estado !== EstadoEstudiante.ACTIVO) {
      throw new ErrorNegocioInscripcion('El estudiante no está activo');
    }

    if (seccion.periodoAcademico.estado !== EstadoPeriodoAcademico.INSCRIPCION_ABIERTA) {
      throw new ErrorNegocioInscripcion(
        'El período no admite inscripciones en este momento',
      );
    }

    if (seccion.estado !== EstadoSeccion.ABIERTA) {
      throw new ErrorNegocioInscripcion(
        'La sección no está disponible para inscripción',
      );
    }
  }
}
