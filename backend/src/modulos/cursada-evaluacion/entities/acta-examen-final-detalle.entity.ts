import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { ActaExamenFinal } from './acta-examen-final.entity';
import { Estudiante } from '../../admision-inscripcion/entities/estudiante.entity';

export enum CondicionActaExamenFinal {
  APROBADA = 'APROBADA',
  DESAPROBADA = 'DESAPROBADA',
  AUSENTE = 'AUSENTE',
}

@Entity('actas_examen_final_detalle')
@Unique(['acta', 'estudiante'])
export class ActaExamenFinalDetalle {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => ActaExamenFinal, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'acta_id' })
  acta: ActaExamenFinal;

  @ManyToOne(() => Estudiante)
  @JoinColumn({ name: 'estudiante_id' })
  estudiante: Estudiante;

  @Column({ type: 'numeric', precision: 4, scale: 2, nullable: true })
  nota_proceso: string | null;

  @Column({ type: 'numeric', precision: 4, scale: 2, nullable: true })
  nota_examen: string | null;

  @Column({ type: 'numeric', precision: 4, scale: 2, nullable: true })
  nota_final: string | null;

  @Column({ type: 'varchar', length: 20 })
  condicion: CondicionActaExamenFinal;
}
