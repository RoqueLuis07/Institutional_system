import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Clase } from './clase.entity';
import { Estudiante } from '../../admision-inscripcion/entities/estudiante.entity';

@Entity('asistencias')
@Unique(['clase', 'estudiante'])
export class Asistencia {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Clase, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'clase_id' })
  clase: Clase;

  @ManyToOne(() => Estudiante)
  @JoinColumn({ name: 'estudiante_id' })
  estudiante: Estudiante;

  @Column()
  presente: boolean;
}
