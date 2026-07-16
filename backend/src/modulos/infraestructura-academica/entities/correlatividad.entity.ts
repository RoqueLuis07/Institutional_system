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

export enum TipoRequisitoCorrelatividad {
  APROBADA = 'APROBADA',
  REGULARIZADA = 'REGULARIZADA',
}

@Entity('correlatividades')
@Unique(['planEstudio', 'materia', 'materiaRequisito'])
export class Correlatividad {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => PlanEstudio)
  @JoinColumn({ name: 'plan_estudio_id' })
  planEstudio: PlanEstudio;

  @ManyToOne(() => Materia)
  @JoinColumn({ name: 'materia_id' })
  materia: Materia;

  @ManyToOne(() => Materia)
  @JoinColumn({ name: 'materia_requisito_id' })
  materiaRequisito: Materia;

  @Column({
    type: 'varchar',
    length: 20,
    default: TipoRequisitoCorrelatividad.APROBADA,
  })
  tipo_requisito: TipoRequisitoCorrelatividad;
}
