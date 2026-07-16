import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Carrera } from './carrera.entity';

@Entity('planes_estudio')
export class PlanEstudio {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Carrera)
  @JoinColumn({ name: 'carrera_id' })
  carrera: Carrera;

  @Column({ length: 20 })
  version: string;

  @Column({ type: 'date' })
  vigente_desde: string;

  @Column({ type: 'date', nullable: true })
  vigente_hasta: string | null;

  @Column({ default: true })
  activo: boolean;
}
