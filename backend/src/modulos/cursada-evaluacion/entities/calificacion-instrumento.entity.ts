import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { InstrumentoEvaluacion } from './instrumento-evaluacion.entity';
import { Estudiante } from '../../admision-inscripcion/entities/estudiante.entity';

@Entity('calificaciones_instrumento')
@Unique(['instrumento', 'estudiante'])
export class CalificacionInstrumento {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => InstrumentoEvaluacion, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'instrumento_id' })
  instrumento: InstrumentoEvaluacion;

  @ManyToOne(() => Estudiante)
  @JoinColumn({ name: 'estudiante_id' })
  estudiante: Estudiante;

  @Column({ type: 'numeric', precision: 4, scale: 2 })
  nota: string;

  @CreateDateColumn()
  fecha_carga: Date;
}
