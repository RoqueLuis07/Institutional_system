import { Injectable } from '@nestjs/common';
import {
  ContextoValidacionInscripcion,
  ErrorNegocioInscripcion,
  ReglaValidacionInscripcion,
} from './regla-validacion-inscripcion.interface';
import { Correlatividad, TipoRequisitoCorrelatividad } from '../../../infraestructura-academica/entities/correlatividad.entity';
import { CondicionHistorialAcademico, HistorialAcademico } from '../../entities/historial-academico.entity';

@Injectable()
export class ReglaCorrelatividades implements ReglaValidacionInscripcion {
  async validar({ manager, estudiante, seccion }: ContextoValidacionInscripcion): Promise<void> {
    const requisitos = await manager.find(Correlatividad, {
      where: {
        planEstudio: { id: estudiante.planEstudio.id },
        materia: { id: seccion.materia.id },
      },
      relations: ['materiaRequisito'],
    });

    for (const requisito of requisitos) {
      const historial = await manager.findOne(HistorialAcademico, {
        where: {
          estudiante: { id: estudiante.id },
          materia: { id: requisito.materiaRequisito.id },
        },
        order: { fecha: 'DESC' },
      });

      const condicionesAceptadas =
        requisito.tipo_requisito === TipoRequisitoCorrelatividad.APROBADA
          ? [CondicionHistorialAcademico.APROBADA]
          : [CondicionHistorialAcademico.APROBADA, CondicionHistorialAcademico.REGULAR];

      const cumplida = !!historial && condicionesAceptadas.includes(historial.condicion);

      if (!cumplida) {
        throw new ErrorNegocioInscripcion(
          `No cumple la correlatividad: ${requisito.materiaRequisito.nombre}`,
        );
      }
    }
  }
}
