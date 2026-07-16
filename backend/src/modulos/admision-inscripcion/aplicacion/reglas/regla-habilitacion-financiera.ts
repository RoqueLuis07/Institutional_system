import { Injectable } from '@nestjs/common';
import {
  ContextoValidacionInscripcion,
  ErrorNegocioInscripcion,
  ReglaValidacionInscripcion,
} from './regla-validacion-inscripcion.interface';

@Injectable()
export class ReglaHabilitacionFinanciera implements ReglaValidacionInscripcion {
  async validar({ estudiante }: ContextoValidacionInscripcion): Promise<void> {
    if (estudiante.bloqueo_administrativo) {
      throw new ErrorNegocioInscripcion(
        'El estudiante tiene deuda pendiente. No puede inscribirse',
      );
    }
  }
}
