import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Carrera } from '../../infraestructura-academica/entities/carrera.entity';
import { PlanEstudio } from '../../infraestructura-academica/entities/plan-estudio.entity';
import { Postulante } from './postulante.entity';

export enum EstadoEstudiante {
  ACTIVO = 'ACTIVO',
  INACTIVO = 'INACTIVO',
  EGRESADO = 'EGRESADO',
  BAJA = 'BAJA',
}

@Entity('estudiantes')
export class Estudiante {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => Postulante, { nullable: true })
  @JoinColumn({ name: 'postulante_id' })
  postulante: Postulante | null;

  @Column({ unique: true, length: 20 })
  matricula: string;

  @Column({ unique: true, length: 20 })
  documento: string;

  @Column({ length: 100 })
  nombre: string;

  @Column({ length: 100 })
  apellido: string;

  @Column({ unique: true, length: 150 })
  email: string;

  @ManyToOne(() => Carrera)
  @JoinColumn({ name: 'carrera_id' })
  carrera: Carrera;

  @ManyToOne(() => PlanEstudio)
  @JoinColumn({ name: 'plan_estudio_id' })
  planEstudio: PlanEstudio;

  @Column({ type: 'date' })
  fecha_ingreso: string;

  @Column({ type: 'varchar', length: 20, default: EstadoEstudiante.ACTIVO })
  estado: EstadoEstudiante;

  @Column({ default: false })
  bloqueo_administrativo: boolean;
}
