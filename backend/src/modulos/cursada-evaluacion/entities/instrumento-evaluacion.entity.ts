import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Seccion } from '../../infraestructura-academica/entities/seccion.entity';

export enum TipoInstrumentoEvaluacion {
  TRABAJO_PRACTICO = 'TRABAJO_PRACTICO',
  PARCIAL = 'PARCIAL',
  OTRO = 'OTRO',
}

@Entity('instrumentos_evaluacion')
export class InstrumentoEvaluacion {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Seccion, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'seccion_id' })
  seccion: Seccion;

  @Column({ length: 150 })
  nombre: string;

  @Column({ type: 'varchar', length: 20 })
  tipo: TipoInstrumentoEvaluacion;

  @Column({ type: 'numeric', precision: 5, scale: 2 })
  ponderacion: string;

  @Column({ type: 'date', nullable: true })
  fecha: string | null;
}
