import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Estudiante } from '../../admision-inscripcion/entities/estudiante.entity';

export enum EstadoSolicitudEgreso {
  PENDIENTE = 'PENDIENTE',
  APROBADA = 'APROBADA',
  RECHAZADA = 'RECHAZADA',
}

@Entity('solicitudes_egreso')
export class SolicitudEgreso {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Estudiante)
  @JoinColumn({ name: 'estudiante_id' })
  estudiante: Estudiante;

  @CreateDateColumn()
  fecha_solicitud: Date;

  @Column({ type: 'varchar', length: 20, default: EstadoSolicitudEgreso.PENDIENTE })
  estado: EstadoSolicitudEgreso;

  @Column({ type: 'timestamptz', nullable: true })
  fecha_resolucion: Date | null;

  @Column({ nullable: true, length: 500 })
  observaciones: string | null;
}
