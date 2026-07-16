import { ConceptoArancel } from './concepto-arancel.entity';
import { CuentaPorCobrar } from './cuenta-por-cobrar.entity';
import { Pago } from './pago.entity';

export * from './concepto-arancel.entity';
export * from './cuenta-por-cobrar.entity';
export * from './pago.entity';

export const entities = [ConceptoArancel, CuentaPorCobrar, Pago];
