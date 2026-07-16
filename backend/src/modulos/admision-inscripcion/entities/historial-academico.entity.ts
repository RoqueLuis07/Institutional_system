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
import { Materia } from '../../infraestructura-academica/entities/materia.entity';
import { PeriodoAcademico } from '../../infraestructura-academica/entities/periodo-academico.entity';

export enum CondicionHistorialAcademico {
  APROBADA = 'APROBADA',
  DESAPROBADA = 'DESAPROBADA',
  REGULAR = 'REGULAR',
  LIBRE = 'LIBRE',
}

@Entity('historial_academico')
@Unique(['estudiante', 'materia', 'periodoAcademico'])
export class HistorialAcademico {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Estudiante)
  @JoinColumn({ name: 'estudiante_id' })
  estudiante: Estudiante;

  @ManyToOne(() => Materia)
  @JoinColumn({ name: 'materia_id' })
  materia: Materia;

  @ManyToOne(() => PeriodoAcademico)
  @JoinColumn({ name: 'periodo_academico_id' })
  periodoAcademico: PeriodoAcademico;

  @Column({ type: 'numeric', precision: 4, scale: 2, nullable: true })
  nota_final: string | null;

  @Column({ type: 'varchar', length: 20 })
  condicion: CondicionHistorialAcademico;

  @CreateDateColumn()
  fecha: Date;
}
