import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Seccion } from '../../infraestructura-academica/entities/seccion.entity';

export enum EstadoActaExamenFinal {
  ABIERTA = 'ABIERTA',
  CERRADA = 'CERRADA',
}

@Entity('actas_examen_final')
@Unique(['seccion', 'numero_llamado'])
export class ActaExamenFinal {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Seccion)
  @JoinColumn({ name: 'seccion_id' })
  seccion: Seccion;

  @Column({ type: 'date' })
  fecha_examen: string;

  @Column({ type: 'smallint' })
  numero_llamado: number;

  @Column({ type: 'varchar', length: 20, default: EstadoActaExamenFinal.ABIERTA })
  estado: EstadoActaExamenFinal;

  @Column({ type: 'timestamptz', nullable: true })
  cerrada_en: Date | null;
}
