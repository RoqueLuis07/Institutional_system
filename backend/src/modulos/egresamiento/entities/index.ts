import { HorasExtensionEstudiante } from './horas-extension-estudiante.entity';
import { SolicitudEgreso } from './solicitud-egreso.entity';
import { SolicitudEgresoRequisito } from './solicitud-egreso-requisito.entity';
import { TituloEmitido } from './titulo-emitido.entity';

export * from './horas-extension-estudiante.entity';
export * from './solicitud-egreso.entity';
export * from './solicitud-egreso-requisito.entity';
export * from './titulo-emitido.entity';

export const entities = [
  HorasExtensionEstudiante,
  SolicitudEgreso,
  SolicitudEgresoRequisito,
  TituloEmitido,
];
