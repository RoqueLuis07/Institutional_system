import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { SolicitudEgreso } from './solicitud-egreso.entity';

export enum RequisitoEgreso {
  MALLA_COMPLETA = 'MALLA_COMPLETA',
  HORAS_EXTENSION = 'HORAS_EXTENSION',
  SALDO_FINANCIERO = 'SALDO_FINANCIERO',
}

@Entity('solicitud_egreso_requisitos')
@Unique(['solicitudEgreso', 'requisito'])
export class SolicitudEgresoRequisito {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => SolicitudEgreso, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'solicitud_egreso_id' })
  solicitudEgreso: SolicitudEgreso;

  @Column({ type: 'varchar', length: 30 })
  requisito: RequisitoEgreso;

  @Column()
  cumplido: boolean;

  @Column({ nullable: true, length: 500 })
  detalle: string | null;
}
