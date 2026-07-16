import { EntityManager } from 'typeorm';
import { Estudiante } from '../../entities/estudiante.entity';
import { Seccion } from '../../../infraestructura-academica/entities/seccion.entity';

export interface ContextoValidacionInscripcion {
  manager: EntityManager;
  estudiante: Estudiante;
  seccion: Seccion;
}

export class ErrorNegocioInscripcion extends Error {}

export interface ReglaValidacionInscripcion {
  validar(contexto: ContextoValidacionInscripcion): Promise<void>;
}
