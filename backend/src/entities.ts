import { entities as infraestructuraAcademica } from './modulos/infraestructura-academica/entities';
import { entities as admisionInscripcion } from './modulos/admision-inscripcion/entities';
import { entities as cursadaEvaluacion } from './modulos/cursada-evaluacion/entities';
import { entities as financiero } from './modulos/financiero/entities';
import { entities as egresamiento } from './modulos/egresamiento/entities';

export const entities = [
  ...infraestructuraAcademica,
  ...admisionInscripcion,
  ...cursadaEvaluacion,
  ...financiero,
  ...egresamiento,
];
