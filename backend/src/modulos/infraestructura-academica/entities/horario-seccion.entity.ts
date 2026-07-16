import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Seccion } from './seccion.entity';

@Entity('horarios_seccion')
export class HorarioSeccion {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Seccion, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'seccion_id' })
  seccion: Seccion;

  @Column({ type: 'smallint' })
  dia_semana: number;

  @Column({ type: 'time' })
  hora_inicio: string;

  @Column({ type: 'time' })
  hora_fin: string;
}
