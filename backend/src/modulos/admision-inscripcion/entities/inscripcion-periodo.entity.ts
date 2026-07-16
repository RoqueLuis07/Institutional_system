import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Estudiante } from './estudiante.entity';
import { PeriodoAcademico } from '../../infraestructura-academica/entities/periodo-academico.entity';

export enum EstadoInscripcionPeriodo {
  ACTIVA = 'ACTIVA',
  ANULADA = 'ANULADA',
}

@Entity('inscripciones_periodo')
@Unique(['estudiante', 'periodoAcademico'])
export class InscripcionPeriodo {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Estudiante)
  @JoinColumn({ name: 'estudiante_id' })
  estudiante: Estudiante;

  @ManyToOne(() => PeriodoAcademico)
  @JoinColumn({ name: 'periodo_academico_id' })
  periodoAcademico: PeriodoAcademico;

  @CreateDateColumn()
  fecha_inscripcion: Date;

  @Column({
    type: 'varchar',
    length: 20,
    default: EstadoInscripcionPeriodo.ACTIVA,
  })
  estado: EstadoInscripcionPeriodo;
}
