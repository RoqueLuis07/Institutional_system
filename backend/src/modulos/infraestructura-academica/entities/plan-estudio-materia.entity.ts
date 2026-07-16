import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { PlanEstudio } from './plan-estudio.entity';
import { Materia } from './materia.entity';

@Entity('plan_estudio_materias')
@Unique(['planEstudio', 'materia'])
export class PlanEstudioMateria {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => PlanEstudio)
  @JoinColumn({ name: 'plan_estudio_id' })
  planEstudio: PlanEstudio;

  @ManyToOne(() => Materia)
  @JoinColumn({ name: 'materia_id' })
  materia: Materia;

  @Column({ type: 'smallint' })
  semestre: number;

  @Column({ default: true })
  obligatoria: boolean;
}
