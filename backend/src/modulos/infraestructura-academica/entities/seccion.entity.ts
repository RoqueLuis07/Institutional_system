import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Materia } from './materia.entity';
import { PeriodoAcademico } from './periodo-academico.entity';
import { Docente } from './docente.entity';
import { Aula } from './aula.entity';
import { Turno } from './turno.entity';

export enum EstadoSeccion {
  ABIERTA = 'ABIERTA',
  CERRADA = 'CERRADA',
  CANCELADA = 'CANCELADA',
}

@Entity('secciones')
@Unique(['materia', 'periodoAcademico', 'codigo_seccion'])
export class Seccion {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Materia)
  @JoinColumn({ name: 'materia_id' })
  materia: Materia;

  @ManyToOne(() => PeriodoAcademico)
  @JoinColumn({ name: 'periodo_academico_id' })
  periodoAcademico: PeriodoAcademico;

  @ManyToOne(() => Docente)
  @JoinColumn({ name: 'docente_id' })
  docente: Docente;

  @ManyToOne(() => Aula, { nullable: true })
  @JoinColumn({ name: 'aula_id' })
  aula: Aula | null;

  @ManyToOne(() => Turno)
  @JoinColumn({ name: 'turno_id' })
  turno: Turno;

  @Column({ length: 10 })
  codigo_seccion: string;

  @Column({ type: 'smallint' })
  cupo_maximo: number;

  @Column({ type: 'smallint', default: 0 })
  cupo_ocupado: number;

  @Column({ type: 'varchar', length: 20, default: EstadoSeccion.ABIERTA })
  estado: EstadoSeccion;
}
