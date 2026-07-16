import { Clase } from './clase.entity';
import { Asistencia } from './asistencia.entity';
import { InstrumentoEvaluacion } from './instrumento-evaluacion.entity';
import { CalificacionInstrumento } from './calificacion-instrumento.entity';
import { ActaExamenFinal } from './acta-examen-final.entity';
import { ActaExamenFinalDetalle } from './acta-examen-final-detalle.entity';

export * from './clase.entity';
export * from './asistencia.entity';
export * from './instrumento-evaluacion.entity';
export * from './calificacion-instrumento.entity';
export * from './acta-examen-final.entity';
export * from './acta-examen-final-detalle.entity';

export const entities = [
  Clase,
  Asistencia,
  InstrumentoEvaluacion,
  CalificacionInstrumento,
  ActaExamenFinal,
  ActaExamenFinalDetalle,
];
