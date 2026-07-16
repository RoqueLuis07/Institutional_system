import { Postulante } from './postulante.entity';
import { DocumentoPostulante } from './documento-postulante.entity';
import { Estudiante } from './estudiante.entity';
import { InscripcionPeriodo } from './inscripcion-periodo.entity';
import { InscripcionSeccion } from './inscripcion-seccion.entity';
import { HistorialAcademico } from './historial-academico.entity';

export * from './postulante.entity';
export * from './documento-postulante.entity';
export * from './estudiante.entity';
export * from './inscripcion-periodo.entity';
export * from './inscripcion-seccion.entity';
export * from './historial-academico.entity';

export const entities = [
  Postulante,
  DocumentoPostulante,
  Estudiante,
  InscripcionPeriodo,
  InscripcionSeccion,
  HistorialAcademico,
];
