import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Estudiante } from '../../admision-inscripcion/entities/estudiante.entity';

export enum TipoHorasExtension {
  EXTENSION = 'EXTENSION',
  PASANTIA = 'PASANTIA',
  VOLUNTARIADO = 'VOLUNTARIADO',
}

@Entity('horas_extension_estudiante')
export class HorasExtensionEstudiante {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Estudiante)
  @JoinColumn({ name: 'estudiante_id' })
  estudiante: Estudiante;

  @Column({ type: 'varchar', length: 20 })
  tipo: TipoHorasExtension;

  @Column({ type: 'numeric', precision: 6, scale: 2 })
  horas: string;

  @Column({ nullable: true, length: 150 })
  institucion: string;

  @CreateDateColumn()
  fecha_carga: Date;

  @Column({ default: false })
  verificado: boolean;
}
