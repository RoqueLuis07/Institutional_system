import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Facultad } from './facultad.entity';

@Entity('carreras')
export class Carrera {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Facultad)
  @JoinColumn({ name: 'facultad_id' })
  facultad: Facultad;

  @Column({ unique: true, length: 15 })
  codigo: string;

  @Column({ length: 150 })
  nombre: string;

  @Column({ type: 'smallint' })
  duracion_semestres: number;

  @Column({ nullable: true, length: 150 })
  titulo_otorgado: string;

  @Column({ type: 'smallint', default: 0 })
  horas_extension_requeridas: number;

  @Column({ default: true })
  activo: boolean;
}
