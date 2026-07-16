import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ConceptoArancel } from './concepto-arancel.entity';
import { Estudiante } from '../../admision-inscripcion/entities/estudiante.entity';
import { PeriodoAcademico } from '../../infraestructura-academica/entities/periodo-academico.entity';

export enum EstadoCuentaPorCobrar {
  PENDIENTE = 'PENDIENTE',
  PAGADA = 'PAGADA',
  VENCIDA = 'VENCIDA',
  ANULADA = 'ANULADA',
}

@Entity('cuentas_por_cobrar')
export class CuentaPorCobrar {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Estudiante)
  @JoinColumn({ name: 'estudiante_id' })
  estudiante: Estudiante;

  @ManyToOne(() => ConceptoArancel)
  @JoinColumn({ name: 'concepto_id' })
  concepto: ConceptoArancel;

  @ManyToOne(() => PeriodoAcademico, { nullable: true })
  @JoinColumn({ name: 'periodo_academico_id' })
  periodoAcademico: PeriodoAcademico | null;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  monto: string;

  @Column({ type: 'date' })
  fecha_vencimiento: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: EstadoCuentaPorCobrar.PENDIENTE,
  })
  estado: EstadoCuentaPorCobrar;

  @CreateDateColumn()
  generado_en: Date;
}
