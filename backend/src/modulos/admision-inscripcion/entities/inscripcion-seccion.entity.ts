import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { InscripcionPeriodo } from './inscripcion-periodo.entity';
import { Seccion } from '../../infraestructura-academica/entities/seccion.entity';

export enum EstadoInscripcionSeccion {
  INSCRIPTA = 'INSCRIPTA',
  BAJA = 'BAJA',
}

@Entity('inscripciones_seccion')
@Unique(['inscripcionPeriodo', 'seccion'])
export class InscripcionSeccion {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => InscripcionPeriodo, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'inscripcion_periodo_id' })
  inscripcionPeriodo: InscripcionPeriodo;

  @ManyToOne(() => Seccion)
  @JoinColumn({ name: 'seccion_id' })
  seccion: Seccion;

  @Column({
    type: 'varchar',
    length: 20,
    default: EstadoInscripcionSeccion.INSCRIPTA,
  })
  estado: EstadoInscripcionSeccion;

  @CreateDateColumn()
  fecha: Date;
}
