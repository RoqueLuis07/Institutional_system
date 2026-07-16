import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum CodigoConceptoArancel {
  MATRICULA = 'MATRICULA',
  ARANCEL_CURSADA = 'ARANCEL_CURSADA',
  CUOTA = 'CUOTA',
  EXAMEN_EXTRAORDINARIO = 'EXAMEN_EXTRAORDINARIO',
  CERTIFICADO = 'CERTIFICADO',
  MULTA_BIBLIOTECA = 'MULTA_BIBLIOTECA',
}

@Entity('conceptos_arancel')
export class ConceptoArancel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 20 })
  codigo: CodigoConceptoArancel;

  @Column({ length: 150 })
  nombre: string;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  monto_base: string;
}
