import { Facultad } from './facultad.entity';
import { Sede } from './sede.entity';
import { Turno } from './turno.entity';
import { Carrera } from './carrera.entity';
import { PlanEstudio } from './plan-estudio.entity';
import { Materia } from './materia.entity';
import { PlanEstudioMateria } from './plan-estudio-materia.entity';
import { Correlatividad } from './correlatividad.entity';
import { Docente } from './docente.entity';
import { Aula } from './aula.entity';
import { PeriodoAcademico } from './periodo-academico.entity';
import { Seccion } from './seccion.entity';
import { HorarioSeccion } from './horario-seccion.entity';

export * from './facultad.entity';
export * from './sede.entity';
export * from './turno.entity';
export * from './carrera.entity';
export * from './plan-estudio.entity';
export * from './materia.entity';
export * from './plan-estudio-materia.entity';
export * from './correlatividad.entity';
export * from './docente.entity';
export * from './aula.entity';
export * from './periodo-academico.entity';
export * from './seccion.entity';
export * from './horario-seccion.entity';

export const entities = [
  Facultad,
  Sede,
  Turno,
  Carrera,
  PlanEstudio,
  Materia,
  PlanEstudioMateria,
  Correlatividad,
  Docente,
  Aula,
  PeriodoAcademico,
  Seccion,
  HorarioSeccion,
];
